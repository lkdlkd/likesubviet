import React, { useEffect, useMemo, useState } from "react";

// Floating contacts widget: renders a Bitrix-style button with expandable social links
// Props: { configWeb?: { lienhe?: Array<{ type?: string; value: string; label?: string; logolienhe?: string }> } }
const Wingets = ({ configWeb }) => {
    const lienhe = Array.isArray(configWeb?.lienhe) ? configWeb.lienhe : [];
    const [open, setOpen] = useState(false);
    const items = useMemo(() => lienhe, [lienhe]);

    // Contacts that have a logo available
    const logoContacts = useMemo(() => (items || []).filter((c) => !!c.logolienhe), [items]);

    // Rotate the main logo every 3 seconds (random start index)
    const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
    useEffect(() => {
        if (!logoContacts || logoContacts.length === 0) return;
        // randomize start index whenever the list changes
        setCurrentLogoIndex(Math.floor(Math.random() * logoContacts.length));
    }, [logoContacts.length]);

    useEffect(() => {
        if (!logoContacts || logoContacts.length <= 1) return;
        const id = setInterval(() => {
            setCurrentLogoIndex((i) => (i + 1) % logoContacts.length);
        }, 3000);
        return () => clearInterval(id);
    }, [logoContacts.length]);

    const toggleOpen = () => setOpen((o) => !o);
    const close = (e) => {
        e?.stopPropagation?.();
        setOpen(false);
    };

    if (!logoContacts || logoContacts.length === 0) return null;

    return (
        <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999 }}>
            <style>{`
                /* Blue glow that emits from the center of the main logo image */
                .b24-pulse-from-img {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    pointer-events: none;
                    /* Start with no visible shadow; animation will create the glow */
                    box-shadow: 0 0 0 0 rgba(0, 174, 239, 0);
                    animation: b24ImgPulse 2s ease-out infinite;
                }
                @keyframes b24ImgPulse {
                    0% {
                        width: 12px;
                        height: 12px;
                        opacity: 0.6;
                        box-shadow: 0 0 0 0 rgba(0, 174, 239, 0);
                    }
                    40% {
                        /* Bright blue glow close to the image */
                        box-shadow: 0 0 14px 6px rgba(0, 174, 239, 0.7);
                        opacity: 0.95;
                    }
                    100% {
                        width: 60px;
                        height: 60px;
                        opacity: 0;
                        box-shadow: 0 0 0 0 rgba(0, 174, 239, 0);
                    }
                }
            `}</style>
            <div className={`b24-widget-button-shadow ${open ? "b24-widget-button-show" : ""}`} onClick={close} />
            <div className={`b24-widget-button-wrapper b24-widget-button-position-bottom-right b24-widget-button-visible ${open ? "b24-widget-button-bottom" : ""}`}>
                {/* Socials list */}
                <div className={`b24-widget-button-social ${open ? "b24-widget-button-show" : "b24-widget-button-hide"}`}>
                    {logoContacts.map((contact, index) => (
                        <a
                            key={index}
                            aria-label={contact.label || contact.type || "Liên hệ"}
                            className="b24-widget-button-social-item"
                            href={contact.value}
                            rel="noopener noreferrer nofollow"
                            target="_blank"
                            title={contact.label || contact.type || "Liên hệ"}
                            style={{ backgroundColor: "transparent", boxShadow: "none", width: 50, height: 50 }}
                        >
                            <img
                                className="lienhe"
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    height: 50,
                                    width: 50,
                                    objectFit: "contain",
                                }}
                                src={contact.logolienhe}
                                alt={contact.label || contact.type || "Liên hệ"}
                            />
                        </a>
                    ))}
                </div>

                {/* Floating button */}
                <div style={{ width: 70, height: 70 }} className="b24-widget-button-inner-container">
                    <div className="b24-widget-button-inner-mask" />
                    <div
                        className="b24-widget-button-block"
                        onClick={toggleOpen}
                        role="button"
                        aria-expanded={open}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleOpen();
                            }

                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="b24-widget-button-pulse b24-widget-button-pulse-animate" style={{ display: "none" }} />
                        <div className="b24-widget-button-inner-block">
                            <div className="b24-widget-button-icon-container">
                                {logoContacts.length > 0 && (
                                    <div className="b24-widget-button-inner-item b24-widget-button-icon-animation" style={{ position: "relative" }}>
                                        <span className="b24-pulse-from-img" />
                                        <img
                                            src={logoContacts[currentLogoIndex]?.logolienhe}
                                            alt={logoContacts[currentLogoIndex]?.label || logoContacts[currentLogoIndex]?.type || "Liên hệ"}
                                            style={{ height: "50px", width: "50px", objectFit: "contain", position: "relative", zIndex: 1 }}
                                        />
                                    </div>
                                )}
                            </div>
                            {/* Close button */}
                            <div className="b24-widget-button-inner-item1 b24-widget-button-close" onClick={close} role="button">
                                <svg height="29" viewBox="0 0 29 29" width="29" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M18.866 14.45l9.58-9.582L24.03.448l-9.587 9.58L4.873.447.455 4.866l9.575 9.587-9.583 9.57 4.418 4.42 9.58-9.577 9.58 9.58 4.42-4.42"
                                        fill="#fff"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </div>

                        </div>
                    </div>
                </div>
                {/* Support label under the main button */}

            </div>
            {/* <div
                className="lsv-support-label"
                style={{
                    // marginTop: 10,
                    marginBottom: 30,
                    textAlign: "center",
                    fontSize: 15,
                    color: "#008eecff",
                    lineHeight: 1.2,
                    textTransform: "none",
                    textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                    userSelect: "none",
                }}
            >
                Liên hệ hỗ trợ
            </div> */}
        </div >
    );
};

export default Wingets;

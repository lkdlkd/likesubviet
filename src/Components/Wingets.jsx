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
        <div >
            <div className={`b24-widget-button-shadow ${open ? "b24-widget-button-show" : ""}`} onClick={close} />
            <div className={`b24-widget-button-wrapper b24-widget-button-position-bottom-right b24-widget-button-visible ${open ? "b24-widget-button-bottom" : ""}`}>
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
                <div className="b24-widget-button-inner-container">
                    <div className="b24-widget-button-inner-mask"></div>
                    <div className="b24-widget-button-block"
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
                        style={{ cursor: "pointer" }} >

                        <div class="b24-widget-button-pulse b24-widget-button-pulse-animate"></div>
                        <div class="b24-widget-button-inner-block">
                            <div class="b24-widget-button-icon-container">
                                <div className="b24-widget-button-inner-item b24-widget-button-icon-animation" style={{ position: "relative" }}>
                                    <span className="b24-pulse-from-img" />
                                    <img
                                        src="/img/5.svg"
                                        alt={"Liên hệ"}
                                        style={{ height: "66px", width: "66px", objectFit: "contain", position: "relative", zIndex: 1 }}
                                    />
                                </div>
                            </div>
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
                className="b24-widget-support-label"
                style={{
                    // marginTop: 10,
                    marginBottom: 30,
                    marginRight: 20,
                    fontSize: 15,
                    color: "#008eecff",
                    lineHeight: 1.2,
                    userSelect: "none",
                }}
            >
                Hỗ trợ
            </div> */}
        </div >
    );
};

export default Wingets;

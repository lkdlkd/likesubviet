import { useEffect, useRef } from "react";

const SCOPE_CLASS = "footer-html-wrapper";
const SCOPE_SELECTOR = `.${SCOPE_CLASS}`;

const FooterJs = ({ htmlString }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";
        container.setAttribute("data-footer-js", "true");

        if (!htmlString || !htmlString.trim()) {
            return () => (container.innerHTML = "");
        }

        const parser = new DOMParser();
        const parsed = parser.parseFromString(htmlString, "text/html");

        const cleanup = [];

        /* ---------------------------------------------------
         * SAFE CSS SCOPING
         * --------------------------------------------------- */
        const cssRuleTypes = window.CSSRule || {};
        const STYLE_RULE = cssRuleTypes.STYLE_RULE ?? 1;
        const MEDIA_RULE = cssRuleTypes.MEDIA_RULE ?? 4;
        const SUPPORTS_RULE = cssRuleTypes.SUPPORTS_RULE ?? 12;
        const FONT_RULE = cssRuleTypes.FONT_FACE_RULE ?? 5;
        const KEYFRAMES_RULE =
            cssRuleTypes.KEYFRAMES_RULE ??
            cssRuleTypes.WEBKIT_KEYFRAMES_RULE ??
            7;
        const IMPORT_RULE = cssRuleTypes.IMPORT_RULE ?? 3;

        const prefixSelectors = (selectorText = "") =>
            selectorText
                .split(",")
                .map((sel) => {
                    sel = sel.trim();
                    if (!sel) return "";
                    if (sel.startsWith(SCOPE_SELECTOR)) return sel;
                    if (["html", "body", ":root"].includes(sel.toLowerCase()))
                        return SCOPE_SELECTOR;
                    if (sel.startsWith("@")) return sel;
                    return `${SCOPE_SELECTOR} ${sel}`;
                })
                .filter(Boolean)
                .join(", ");

        const fallbackScopeCss = (cssText) =>
            cssText
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .split("}")
                .map((block) => {
                    const [sel, dec] = block.split("{");
                    if (!dec || !sel) return "";
                    const scoped = prefixSelectors(sel);
                    return `${scoped} {${dec}}`;
                })
                .join("\n");

        const scopeCss = (cssText) => {
            if (!cssText.trim()) return "";

            const style = document.createElement("style");
            style.textContent = cssText;
            document.head.appendChild(style);

            let rules;
            try {
                rules = Array.from(style.sheet?.cssRules || []);
            } catch {
                style.remove();
                return fallbackScopeCss(cssText);
            }

            const scoped = rules
                .map((rule) => {
                    switch (rule.type) {
                        case STYLE_RULE:
                            return `${prefixSelectors(rule.selectorText)} { ${rule.style.cssText} }`;
                        case MEDIA_RULE:
                            return `@media ${rule.conditionText} {\n${Array.from(
                                rule.cssRules
                            )
                                .map((r) =>
                                    prefixSelectors(r.selectorText || "") +
                                    ` { ${r.style?.cssText || ""} }`
                                )
                                .join("\n")}\n}`;
                        case SUPPORTS_RULE:
                            return rule.cssText;
                        case IMPORT_RULE:
                        case FONT_RULE:
                        case KEYFRAMES_RULE:
                            return rule.cssText;
                        default:
                            return rule.cssText;
                    }
                })
                .join("\n");

            style.remove();
            return scoped || fallbackScopeCss(cssText);
        };

        /* ---------------------------------------------------
         * HANDLE <style>
         * --------------------------------------------------- */
        parsed.querySelectorAll("style").forEach((styleNode) => {
            const scopedCss = scopeCss(styleNode.textContent || "");
            if (scopedCss) {
                const newStyle = document.createElement("style");
                newStyle.textContent = scopedCss;
                container.appendChild(newStyle);
                cleanup.push(() => newStyle.remove());
            }
            styleNode.remove();
        });

        /* ---------------------------------------------------
         * INSERT HTML content (no scripts)
         * --------------------------------------------------- */
        const bodyNodes =
            parsed.body?.childNodes?.length
                ? parsed.body.childNodes
                : parsed.documentElement.childNodes;

        const fragment = document.createDocumentFragment();

        Array.from(bodyNodes).forEach((node) => {
            if (["SCRIPT", "STYLE"].includes(node.nodeName)) return;
            fragment.appendChild(node.cloneNode(true));
        });

        container.appendChild(fragment);

        /* ---------------------------------------------------
         * HANDLE SCRIPTS (inline & external)
         * --------------------------------------------------- */
        parsed.querySelectorAll("script").forEach((scriptNode) => {
            const newScript = document.createElement("script");

            [...scriptNode.attributes].forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });

            if (!scriptNode.src) {
                newScript.textContent = scriptNode.textContent;
            }

            container.appendChild(newScript);
            cleanup.push(() => newScript.remove());
        });

        /* ---------------------------------------------------
         * AUTO RUN CERTAIN GLOBAL FUNCTIONS
         * --------------------------------------------------- */
        const timeoutId = setTimeout(() => {
            window.kiemTraThongBao?.();
            if (window.openPopup) {
                window.updateVNTime?.();
                window.openPopup();
            }
        }, 200);

        cleanup.push(() => clearTimeout(timeoutId));

        /* ---------------------------------------------------
         * EVENTS
         * --------------------------------------------------- */
        window.dispatchEvent(
            new CustomEvent("footer-js-mounted", {
                detail: { container, html: htmlString },
            })
        );

        cleanup.push(() =>
            window.dispatchEvent(
                new CustomEvent("footer-js-unmounted", {
                    detail: { container },
                })
            )
        );

        /* ---------------------------------------------------
         * CLEANUP
         * --------------------------------------------------- */
        return () => {
            cleanup.forEach((fn) => fn?.());
            container.innerHTML = "";
        };
    }, [htmlString]);

    return <div ref={containerRef} className={SCOPE_CLASS} />;
};

export default FooterJs;

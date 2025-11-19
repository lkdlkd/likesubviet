import { useEffect } from "react";

const HeaderJs = ({ htmlString }) => {
    useEffect(() => {
        if (!htmlString?.trim()) return;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlString;

        const createdStyles = [];
        const createdScripts = [];

        /* ---------------------------------------------------
         * HANDLE <style>
         * --------------------------------------------------- */
        tempDiv.querySelectorAll("style").forEach((oldStyle) => {
            const style = document.createElement("style");
            style.setAttribute("data-header-js", "true");
            style.textContent = oldStyle.textContent;

            document.head.appendChild(style);
            createdStyles.push(style);
        });

        /* ---------------------------------------------------
         * HANDLE <script>
         * --------------------------------------------------- */
        tempDiv.querySelectorAll("script").forEach((oldScript) => {
            const script = document.createElement("script");
            script.setAttribute("data-header-js", "true");

            // Copy attributes (async, defer, type, etc.)
            [...oldScript.attributes].forEach((attr) =>
                script.setAttribute(attr.name, attr.value)
            );

            if (oldScript.src) {
                script.src = oldScript.src;
            } else {
                script.text = oldScript.textContent;
            }

            document.head.appendChild(script);
            createdScripts.push(script);
        });

        /* ---------------------------------------------------
         * CLEANUP ON UNMOUNT
         * --------------------------------------------------- */
        return () => {
            createdStyles.forEach((el) => el.remove());
            createdScripts.forEach((el) => el.remove());
        };
    }, [htmlString]);

    return null;
};

export default HeaderJs;

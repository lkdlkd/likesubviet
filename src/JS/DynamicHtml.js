import { useEffect, useRef } from "react";

const DynamicHtml = ({ htmlString }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!htmlString) return;

    // Clear trước khi render lại
    containerRef.current.innerHTML = htmlString;

    // Tìm tất cả script và chạy
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach(oldScript => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.text = oldScript.textContent;
      }
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Sau khi inject script, trigger các hàm onload nếu có
    // Vì window.onload đã fire rồi, nên ta phải gọi thủ công
    setTimeout(() => {
      // Kiểm tra xem có hàm openPopup và updateVNTime không
      if (typeof window.openPopup === "function") {
        if (typeof window.updateVNTime === "function") {
          window.updateVNTime();
        }
        window.openPopup();
      }
    }, 1200);

  }, [htmlString]);

  return <div className="dynamic-html-container" ref={containerRef} />;
};

export default DynamicHtml;

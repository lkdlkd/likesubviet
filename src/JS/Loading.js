let preloaderDiv = null;

export const loadingg = (title = "Vui lòng chờ...", isLoading = true, duration = 1000) => {
    if (isLoading) {
        if (!preloaderDiv) {
            preloaderDiv = document.createElement("div");
            preloaderDiv.className = "preloader";
            preloaderDiv.innerHTML = `
                <div class="loader">
                    <div class="loader__figure"></div>
                    <p class="loader__label">${title}</p>
                </div>
            `;
            document.body.appendChild(preloaderDiv);
        } else {
            preloaderDiv.querySelector(".loader__label").textContent = title;
            preloaderDiv.style.display = "block";
        }
        if (duration > 0) {
            setTimeout(() => {
                if (preloaderDiv) preloaderDiv.style.display = "none";
            }, duration);
        }
    } else {
        if (preloaderDiv) preloaderDiv.style.display = "none";
    }
};
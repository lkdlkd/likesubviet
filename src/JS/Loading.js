import Swal from "sweetalert2";

export const loadingg = (title = "Vui lòng chờ...", isLoading = true, duration = 1000) => {
    if (isLoading) {
        Swal.fire({
            title: title,
            allowOutsideClick: false,
            background: "transparent",
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
                const popup = Swal.getPopup();
                popup.style.background = "transparent";
                popup.style.boxShadow = "none";
            },
            customClass: {
                popup: "custom-loading-popup",
                title: "custom-loading-title",
            },
        });

        // Tự động đóng sau `duration` (1 giây mặc định)
        setTimeout(() => {
            Swal.close();
        }, duration);
    } else {
        Swal.close(); // Đóng thông báo tải ngay lập tức
    }
};
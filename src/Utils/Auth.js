// utils/auth.js
export const logout = (navigate) => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/dang-nhap');
  };
  
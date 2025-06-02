// utils/auth.js
export const logout = (navigate) => {
    localStorage.removeItem('token');
    localStorage.removeItem('notiModalLastClosed');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    navigate('/dang-nhap');
  };
  
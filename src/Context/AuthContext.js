import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem("token");

  let decoded = {};
  if (token) {
    try {
      decoded = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      // console.error("Token decode error:", error);
    }
  }

  const [auth, setAuth] = useState({
    token: token || '',
    role: decoded.role || '',
  });

  const updateAuth = (data) => {
    setAuth(data);
  };

  return (
    <AuthContext.Provider value={{ auth, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

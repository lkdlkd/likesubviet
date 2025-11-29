import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Lấy theme từ localStorage: 'light', 'dark', hoặc 'default' (theo system)
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme || "default";
    });

    // Tính toán theme thực tế (dark hoặc light) dựa trên setting
    const getResolvedTheme = () => {
        if (theme === "default") {
            return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches 
                ? "dark" 
                : "light";
        }
        return theme;
    };

    const [resolvedTheme, setResolvedTheme] = useState(getResolvedTheme);

    // Apply theme vào document
    useEffect(() => {
        const root = document.documentElement;
        const actualTheme = getResolvedTheme();
        
        root.setAttribute("data-bs-theme", actualTheme);
        root.setAttribute("data-pc-theme", actualTheme);
        
        if (actualTheme === "dark") {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
        }
        
        setResolvedTheme(actualTheme);
        
        // Lưu vào localStorage
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Lắng nghe thay đổi system preference (chỉ khi theme là 'default')
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        
        const handleChange = () => {
            if (theme === "default") {
                const root = document.documentElement;
                const actualTheme = mediaQuery.matches ? "dark" : "light";
                
                root.setAttribute("data-bs-theme", actualTheme);
                root.setAttribute("data-pc-theme", actualTheme);
                
                if (actualTheme === "dark") {
                    document.body.classList.add("dark-mode");
                    document.body.classList.remove("light-mode");
                } else {
                    document.body.classList.add("light-mode");
                    document.body.classList.remove("dark-mode");
                }
                
                setResolvedTheme(actualTheme);
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        
        const handleChange = (e) => {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "default" || !savedTheme) {
                setTheme(e.matches ? "dark" : "light");
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => {
            const current = prev === "default" ? getResolvedTheme() : prev;
            return current === "dark" ? "light" : "dark";
        });
    };

    const setLightTheme = () => setTheme("light");
    const setDarkTheme = () => setTheme("dark");
    const setDefaultTheme = () => setTheme("default");

    const value = {
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        setLightTheme,
        setDarkTheme,
        setDefaultTheme,
        isDark: resolvedTheme === "dark",
        isDefault: theme === "default",
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;

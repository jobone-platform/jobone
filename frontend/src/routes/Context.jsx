import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export const ThemeContext = createContext({
  theme: "default",
  resolvedTheme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("jobone_theme") || "default";
    } catch {
      return "default";
    }
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemIsDark(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  const resolvedTheme =
    theme === "dark" ? "dark" : theme === "light" ? "light" : systemIsDark ? "dark" : "light";

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute("data-theme", resolvedTheme);
      if (resolvedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("jobone_theme", theme);
    } catch (e) {
      console.error("Failed to update theme", e);
    }
  }, [theme, resolvedTheme]);

  const setTheme = (newTheme) => {
    if (["light", "dark", "default"].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const themeValue = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export { AuthContext, AuthProvider, useAuth } from "./AuthContext";
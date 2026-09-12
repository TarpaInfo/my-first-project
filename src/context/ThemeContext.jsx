import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Themes: 'light' | 'dark' | 'slate' (Light Gray)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Reset existing classes
    root.classList.remove('dark', 'slate-mode', 'light-mode');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'slate') {
      root.classList.add('slate-mode');
    } else {
      root.classList.add('light-mode');
    }

    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
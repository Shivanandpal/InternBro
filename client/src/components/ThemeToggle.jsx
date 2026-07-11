import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localstorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      id="btn-theme-toggle"
      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-darkCard dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder transition-all duration-300 shadow-sm text-brand-600 dark:text-brand-400 focus:outline-none"
      title="Toggle Light/Dark Theme"
      aria-label="Toggle Light/Dark Theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {darkMode ? (
          <Sun className="w-5 h-5 animate-pulse-slow rotate-0 scale-100 transition-transform duration-500" />
        ) : (
          <Moon className="w-5 h-5 rotate-0 scale-100 transition-transform duration-500" />
        )}
      </div>
    </button>
  );
}

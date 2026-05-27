import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({ name: 'Gutemberg', logged: false });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <AppContext.Provider value={{ user, setUser, isDarkMode, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
};
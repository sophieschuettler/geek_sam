// ./context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // 🔐 Prüft beim Start, ob ein User im localStorage ist – aber nur einmalig
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Nur setzen, wenn gültiger Token vorhanden ist
        if (parsed?.token && parsed?.username) {
          setUser(parsed);
        }
      } catch (err) {
        console.error("Fehler beim Laden des gespeicherten Users:", err);
        localStorage.removeItem("user");
      }
    }
    setInitialized(true);
  }, []);

  // Wenn noch nicht initialisiert, zeigen wir nichts (verhindert Falschanzeige)
  if (!initialized) return null;

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

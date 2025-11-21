import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./context/ThemeContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Costume from "./pages/Costume";
import Performance from "./pages/Performance";
import Participants from "./pages/Participants";
import Overview from "./pages/Overview";
import { AppProvider, useAppContext } from "./context/AppContext";

function AppWrapper() {
  return (
    <Router>
      <AppProvider>
        <ThemeProvider>
        <Navbar />
        <AppRoutes />
        </ThemeProvider>
      </AppProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  // ✅ Beim Start prüfen, ob User im localStorage gespeichert ist
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser, user]);

  // Login-Funktion
  const handleLogin = async (username, password) => {
    try {
        const API_BASE_URL = process.env.REACT_APP_API_URL;

        const res = await fetch(`${API_BASE_URL}/api/login`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        return alert(data.error || "Login fehlgeschlagen");
      }

      const data = await res.json();
      console.log("✅ Login erfolgreich:", data);

      // 🔑 Context setzen
      setUser({
        username: data.username,
        role: data.role,
        token: data.token,
      });

      // 📝 localStorage speichern
      localStorage.setItem("user", JSON.stringify(data));

      // 🚀 Navigation nach Rolle
      if (data.role === "admin") navigate("/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Login");
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to={user.role === "admin" ? "/übersicht" : "/dashboard"} /> : <Login onLogin={handleLogin} />}
      />

      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
      />

      <Route
        path="/costume"
        element={user?.role === "jury" ? <Costume user={user} /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/performance"
        element={user?.role === "jury" ? <Performance user={user} /> : <Navigate to="/dashboard" />}
      />

      <Route
        path="/teilnehmer"
        element={user ? <Participants user={user} /> : <Navigate to="/" />}
      />
      
      <Route
        path="/übersicht"
        element={user ? <Overview user={user} /> : <Navigate to="/" />}
      /> 
      

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppWrapper;

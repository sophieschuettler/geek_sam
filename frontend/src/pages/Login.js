import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";



const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
console.log("API_BASE_URL =", API_BASE_URL);

export default function Login({ onLogin }) {
  const { setUser } = useAppContext();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);

  // 🧩 Token nur prüfen, kein automatisches Weiterleiten ohne gültige Antwort
  useEffect(() => {
    const checkExistingLogin = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setCheckingLogin(false);
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        const token = userData.token;

        // 🔍 Anfrage zum Backend, um Token zu verifizieren

       const res = await fetch(`${API_BASE_URL}/api/_sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
       if (!res.ok) {
          console.log("Ungültiger Token, Session entfernt.");
          localStorage.removeItem("user");
        } else {
          setUser(userData);
          if (userData.role === "admin") navigate("/übersicht");
          else navigate("/dashboard");
        }
      } catch (err) {
        console.warn("Fehler beim Session-Check:", err);
        localStorage.removeItem("user");
      } finally {
        setCheckingLogin(false);
      }
    };

    checkExistingLogin();
  }, [navigate, setUser]);

   const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: darkMode ? "#1f2937" : "#fff",
    color: darkMode ? "#f9fafb" : "#111827",
    padding: theme.spacing(2.5),
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 4px 10px rgba(255,255,255,0.05)"
      : "0 4px 10px rgba(0,0,0,0.08)",
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (onLogin) {
        await onLogin(username, password);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });


        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "Login fehlgeschlagen");
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("✅ Login erfolgreich:", data);

        const userObj = {
          username: data.username,
          role: data.role,
          token: data.token,
        };

        setUser(userObj);

        localStorage.setItem("user", JSON.stringify(userObj));


        if (data.role === "admin") navigate("/übersicht");
        else navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Fehler beim Login:", err);
      alert("Fehler beim Login. Bitte prüfe Server & Verbindung.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-100">
        <p className="text-blue-600">Überprüfe Anmeldung...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-blue-50 text-gray-900"
      }`}
      style={{ overflowX: "hidden", width: "100%" }}>
      <div className="bg-white p-8 rounded-xl shadow-lg w-80">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white py-2 rounded transition`}
          >
            {loading ? "Einloggen..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { styled } from "@mui/material/styles";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Logo from "./assets/Logo.png";
import { useAppContext } from "../context/AppContext";

/* ---------- Custom Switch bleibt gleich ---------- */
const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#5E689A",
      },
    },
  },
}));

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      if (user?.token) {
        await fetch(`${API}/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout Fehler:", err);
    }

    // lokal IMMER löschen (wichtig!)
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/teilnehmer", label: "Teilnehmer" },
    { to: "/costume", label: "Kostüm" },
    { to: "/performance", label: "Performance" },
    { to: "/judgesaward", label: "JudgesAward" },
    { to: "/übersicht", label: "Übersicht" },
  ];

  return (
    <nav className="bg-gradient-to-b from-[#DD3F70] to-[#5E689A] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">

        <img src={Logo} alt="Logo" className="w-[150px]" />

        <div className="hidden md:flex space-x-4 items-center">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className="px-3 py-2 rounded-md hover:bg-white/10">
              {label}
            </NavLink>
          ))}

          {/* 🔴 LOGOUT BUTTON */}
          {user && (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Logout
            </button>
          )}

          <FormGroup>
            <FormControlLabel
              control={
                <MaterialUISwitch checked={darkMode} onChange={toggleTheme} />
              }
              label=""
            />
          </FormGroup>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 rounded"
            >
              Logout
            </button>
          )}

          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      {open && (
        <div className="md:hidden bg-[#5E689A]">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block px-4 py-3"
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
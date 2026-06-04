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

/* ---------- DARKMODE SWITCH ---------- */
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
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#5E689A",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
  },
}));

/* ---------- NAVBAR ---------- */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

const logout = () => {
  localStorage.removeItem("user");
  setUser(null);
  navigate("/");
};


  const links = [
    { to: "/teilnehmer", label: "Teilnehmer" },
    { to: "/costume", label: "Kostüm" },
    { to: "/performance", label: "Performance" },
    { to: "/judgesaward", label: "JudgesAward" },
    { to: "/übersicht", label: "Übersicht" },
  ];

  return (
    <nav className="bg-gradient-to-b from-[#DD3F70] to-[#5E689A] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          <img src={Logo} alt="Logo" className="w-[150px]" />


          {/* Desktop */}
          <div className="hidden md:flex space-x-4 items-center">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition ${
                    isActive
                      ? "bg-white text-[#5E689A] font-bold"
                      : "hover:bg-white/10"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            

            <FormGroup className="ml-4">
              <FormControlLabel
                control={
                  <MaterialUISwitch checked={darkMode} onChange={toggleTheme} />
                }
                label=""
              />
            </FormGroup>
            {user && (
              <button
                onClick={logout}
                className="ml-3 px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            )}

          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden ">
            
            <MaterialUISwitch checked={darkMode} onChange={toggleTheme} />

            <button onClick={() => setOpen(!open)}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-gradient-to-b from-[#DD3F70] to-[#5E689A]">
          {links.map(({ to, label }) => (
            <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 transition ${
                    isActive
                      ? "bg-white text-[#5E689A] font-bold"
                      : ""
                  }`
                }
              >
                {label}
              </NavLink>
            
          ))}
          {user && (
              <button
                onClick={logout}
                className="block px-3 py-1 bg-red-600 rounded"
              >
                Logout
              </button>
            )}
          
        </div>
      )}
    </nav>
  );
}
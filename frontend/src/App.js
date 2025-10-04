// frontend/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Judging from "./pages/Judging";
import Participants from "./pages/Participants";
import Overview from "./pages/Overview";

import { AppProvider, useAppContext } from "./context/AppContext";

const USERS = [
  { username: "user1", password: "pass1", role: "user" },
  { username: "user2", password: "pass2", role: "user" },
  { username: "user3", password: "pass3", role: "user" },
  { username: "admin", password: "admin", role: "admin" },
];

function AppWrapper() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

function AppRoutes() {
  const { user, setUser } = useAppContext();

  function handleLogin(username, password) {
    const match = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (match) {
      setUser(match);
    } else {
      alert("Invalid credentials!");
    }
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/judging"
          element={user ? <Judging /> : <Navigate to="/" />}
        />
        <Route
          path="/teilnehmer"
          element={user ? <Participants /> : <Navigate to="/" />}
        />
        <Route
          path="/übersicht"
          element={user ? <Overview /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default AppWrapper;

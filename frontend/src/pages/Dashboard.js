import React from "react";
import { useNavigate } from "react-router-dom";

const Button = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 m-2 rounded-xl shadow"
  >
    {children}
  </button>
);

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  return (
    <div className="h-screen bg-green-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Willkommen, {user.username}!
      </h1>
      <div className="flex">
        <Button onClick={() => navigate("/judging")}>Judging</Button>
        <Button onClick={() => navigate("/teilnehmer")}>Teilnehmer</Button>
        <Button onClick={() => navigate("/übersicht")}>Übersicht</Button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

export default function Judging() {
  const { user } = useAppContext();
  const [participants, setParticipants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({});

  const currentParticipant = participants[currentIndex];

  const criteria = {
    costume: {
      Accuracy: 10,
      Complexity: 10,
      Sewing: 10,
      Crafting: 10,
    },
    performance: {
      Acting: 10,
      Creativity: 10,
      "Use of audio": 5,
    },
  };

  useEffect(() => {
    fetch("http://localhost:4000/api/participants")
      .then((res) => res.json())
      .then(setParticipants);
  }, []);

  const handleChange = (category, criterion, value) => {
    const participantId = currentParticipant?.id;
    setRatings((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [category]: {
          ...(prev[participantId]?.[category] || {}),
          [criterion]: parseInt(value, 10),
        },
      },
    }));
  };

  const getTotal = (category) => {
    const values = Object.values(
      ratings[currentParticipant?.id]?.[category] || {}
    );
    return values.reduce((sum, val) => sum + (val || 0), 0);
  };

  const submitRatings = async () => {
    const participantId = currentParticipant?.id;
    const data = {
      user: user.username,
      participantId,
      ratings: {
        ...ratings[participantId]?.costume,
        ...ratings[participantId]?.performance,
      },
    };

    const res = await fetch("http://localhost:4000/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Bewertung gespeichert!");
    } else {
      alert("Fehler beim Speichern.");
    }
  };

  if (!user) return <p>Bitte zuerst einloggen.</p>;
  if (participants.length === 0) return <p>Lade Teilnehmer...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bewertung: {currentParticipant?.cosplayName}</h2>

      {/* Teilnehmer Dropdown */}
      <select
        value={currentIndex}
        onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
        className="mb-4 border p-2"
      >
        {participants.map((p, i) => (
          <option key={p.id} value={i}>
            {p.cosplayName}
          </option>
        ))}
      </select>

      {/* Bewertungskategorien */}
      <div className="grid grid-cols-2 gap-4">
        {/* Costume Judging */}
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Costume Judging (max. 40 Punkte)</h3>
          {Object.entries(criteria.costume).map(([crit, max]) => (
            <div key={crit} className="mb-2">
              <label className="block">{crit} ({max}):</label>
              <select
                value={
                  ratings[currentParticipant?.id]?.costume?.[crit] || ""
                }
                onChange={(e) => handleChange("costume", crit, e.target.value)}
                className="border p-1 w-full"
              >
                <option value="">--</option>
                {[...Array(max + 1).keys()].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
          <p className="mt-2 font-bold">Total: {getTotal("costume")} / 40</p>
        </div>

        {/* Performance Judging */}
        <div className="border p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Performance (max. 25 Punkte)</h3>
          {Object.entries(criteria.performance).map(([crit, max]) => (
            <div key={crit} className="mb-2">
              <label className="block">{crit} ({max}):</label>
              <select
                value={
                  ratings[currentParticipant?.id]?.performance?.[crit] || ""
                }
                onChange={(e) => handleChange("performance", crit, e.target.value)}
                className="border p-1 w-full"
              >
                <option value="">--</option>
                {[...Array(max + 1).keys()].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
          <p className="mt-2 font-bold">Total: {getTotal("performance")} / 25</p>
        </div>
      </div>

      <p className="mt-4 font-bold text-lg">
        Gesamtpunktzahl: {getTotal("costume") + getTotal("performance")} / 65
      </p>

      {/* Navigation & Speichern */}
      <div className="mt-4 flex gap-4">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Zurück
        </button>
        <button
          disabled={currentIndex === participants.length - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Weiter
        </button>
        <button
          onClick={submitRatings}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Punkte absenden
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

export default function ParticipantList() {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    fetch("/api/participants")
      .then((res) => res.json())
      .then((data) => setParticipants(data))
      .catch((err) => console.error("Fehler beim Laden der Teilnehmer:", err));
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Alle Teilnehmer</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {participants.map((p, i) => (
          <div key={i} className="border rounded-xl p-4 bg-white shadow">
            <h3 className="font-heading text-xl text-blue-800">{p.cosplayName}</h3>
            <p><strong>Charakter:</strong> {p.character}</p>
            <p><strong>Game:</strong> {p.game}</p>

            {p.characterImage && (
              <div className="mt-2">
                <p className="font-semibold">Charakterbild:</p>
                <img src={p.characterImage} alt="Charakter" className="h-40 object-cover rounded" />
              </div>
            )}

            {p.cosplayImages.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Cosplaybilder:</p>
                <div className="flex gap-2 overflow-x-auto">
                  {p.cosplayImages.map((url, idx) => (
                    <img key={idx} src={url} alt="Cosplay" className="h-24 rounded" />
                  ))}
                </div>
              </div>
            )}

            {p.wipImages.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">WIP Bilder:</p>
                <div className="flex gap-2 overflow-x-auto">
                  {p.wipImages.map((url, idx) => (
                    <img key={idx} src={url} alt="WIP" className="h-24 rounded" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

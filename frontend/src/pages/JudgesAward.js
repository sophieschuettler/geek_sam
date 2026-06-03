import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

export default function JudgesAward() {
  const { user } = useAppContext();
  const { darkMode } = useTheme();

  const [participants, setParticipants] = useState([]);
  const [selectedNominee, setSelectedNominee] = useState(null);
  const [saving, setSaving] = useState(false);

  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {
    const [participantsRes, nominationsRes] = await Promise.all([
      fetch(`${API}/api/participants`),
      fetch(`${API}/api/overview/nominations`)
    ]);

    const participantsData = await participantsRes.json();
    const nominationsData = await nominationsRes.json();

    setParticipants(participantsData);

    // 🔥 WICHTIG: aktuelle Nominierung dieses Users finden
    const myNomination = nominationsData.find(n =>
      n.judges?.split(", ").includes(user.username)
    );

    if (myNomination) {
      setSelectedNominee(myNomination.participantId);
    } else {
      setSelectedNominee(null);
    }

  } catch (err) {
    console.error(err);
  }
};

const saveNomination = async () => {
  if (!selectedNominee) {
    alert("Bitte einen Teilnehmer auswählen.");
    return;
  }

  try {
    setSaving(true);

    const res = await fetch(`${API}/api/overview/nominations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({
        participantId: selectedNominee,
        user: user.username,   
        active: true           
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    alert("Judges Award gespeichert!");
  } catch (err) {
    console.error(err);
    alert("Fehler beim Speichern.");
  } finally {
    setSaving(false);
  }
};

  if (!user) {
    return (
      <div className="p-8 text-center">
        Bitte zuerst einloggen.
      </div>
    );
  }

  const selectedParticipant = participants.find(
    p => p.id === selectedNominee
  );

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-blue-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          🏆 Judges Award
        </h1>

        <p className="text-center mb-8 text-lg">
          Wähle den Teilnehmer aus, den du für den Judges Award nominieren
          möchtest.
        </p>

        <div
          className={`mb-8 p-4 rounded-xl text-center ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >
          {selectedParticipant ? (
            <>
              Aktuell nominiert:
              <div className="font-bold text-xl mt-2">
                 #{selectedParticipant.number}{" "}
                {selectedParticipant.cosplayName}
              </div>
            </>
          ) : (
            <span>Noch kein Teilnehmer ausgewählt.</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {participants.map(participant => {
            const selected =
              selectedNominee === participant.id;

            return (
              <div
                key={participant.id}
                onClick={() =>
                  setSelectedNominee(participant.id)
                }
                className={`
                  cursor-pointer
                  rounded-2xl
                  overflow-hidden
                  transition-all
                  duration-200
                  hover:scale-[1.02]
                  ${
                    selected
                      ? "ring-4 ring-yellow-400"
                      : ""
                  }
                  ${
                    darkMode
                      ? "bg-gray-800"
                      : "bg-white"
                  }
                `}
              >
                <img
                  src={
                    participant.characterImages?.[0]
                  }
                  alt={participant.cosplayName}
                  className="w-full h-72 object-cover"
                />

                <div className="p-4">

                  <div className="font-bold text-lg">
                    #{participant.number}
                  </div>

                  <div className="font-semibold text-xl">
                    {participant.cosplayName}
                  </div>

                  <div className="opacity-80">
                    {participant.character}
                  </div>

                  <div className="opacity-70 text-sm">
                    {participant.game}
                  </div>

                  <div className="mt-4 flex items-center gap-2">

                    <input
                      type="radio"
                      checked={selected}
                      readOnly
                    />

                    <span>
                      Für Judges Award nominieren
                    </span>
                  </div>

                  {selected && (
                    <div className="mt-3 font-bold text-yellow-500">
                      Deine Nominierung
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={saveNomination}
            disabled={saving || !selectedNominee}
            className="
              px-8
              py-4
              text-lg
              font-bold
              rounded-xl
              bg-yellow-500
              hover:bg-yellow-400
              disabled:opacity-50
            "
          >
            {saving
              ? "Speichern..."
              : "Judges Award speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
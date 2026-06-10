import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";
export default function Performance() {
  const { user } = useAppContext();
  const { darkMode } = useTheme();
  const [participants, setParticipants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  




  // 🔹 Punkte
  const [ratings, setRatings] = useState({}); 
  // 🔹 Nominierungen
  const [nominations, setNominations] = useState({}); 


  
  useEffect(() => {
      const API = process.env.REACT_APP_API_URL;

    fetch(`${API}/api/participants`)
      .then(res => res.json())
      .then(data => {
        setParticipants(data);
        setCurrentIndex(0);
      })
      .catch(err => console.error("Error loading participants:", err));
  }, []);

    const currentParticipant = participants[currentIndex];
    
// --- NEUER USEEFFECT: Ratings + Nominierungen laden ---
useEffect(() => {
  if (!currentParticipant || !user) return;

  const fetchRatingsAndNominations = async () => {
    const API = process.env.REACT_APP_API_URL;
    try {
      const res = await fetch(`${API}/api/overview/by-judge`);
      const data = await res.json();

      const participantRatings = data
        .filter(r => r.user === user.username && r.participantId === currentParticipant.id)
        .reduce((acc, r) => {
          if (!acc[r.category]) acc[r.category] = {};
          acc[r.category][r.criterion] = r.score;
          return acc;
        }, {});

      const nomRes = await fetch(`${API}/api/overview/nominations`);
      const nomData = await nomRes.json();

      // Nominationen als boolean in ratings speichern
      const nominationObj = {
        bestPerformance: false,
      };

      nomData
  .filter(n => n.participantId === currentParticipant.id)
  .forEach(n => {
    const judges = n.judges ? n.judges.split(",") : [];
    if (n.category === "Best Performance" && judges.includes(user.username)) {
      nominationObj.bestPerformance = true;
    }
  });

      setRatings(prev => ({
        ...prev,
        [currentParticipant.id]: {
          ...(prev[currentParticipant.id] || {}),
          performance: participantRatings.performance || {},
          ...nominationObj,
        },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  fetchRatingsAndNominations();
}, [currentParticipant, user]);





  const criteria = {
    performance: {
      Schauspiel: 5,
      Kreativität: 10,
      Publikumsreaktion: 5,
    },
  };
    const infoText = {
  Schauspiel: ( <> Gestik und Mimik des Charakters: Wie überzeugend stellt ihr den Charakter dar? <br/>
  Ausdruck: Seid ihr emotional glaubwürdig, wie ihr in der Szene als Charakter reagiert? <br/>
  Konsistenz: Bleibt ihr während dem ganzen Auftritt “in Character”?<br/>
  Choreografie: Sind Bewegungen und Übergänge durchdacht, nutzt ihr die Bühne sinnvoll?</>) ,
  Kreativität: (<> Storytelling: Erzählt euer Auftritt eine Geschichte? <br/>
    Originalität: Gibt es eigene Ideen, die über bekannte Szenen hinausgehen? <br/>
    Überraschende Elemente: Gibt es unerwartete Elemente, die eingebaut wurden?  <br/>
    Einsatz von Requisiten: Werden Requisiten verwendet? Passen diese zum Style des Cosplays? Wunden sie extra angefertigt?<br/>
    Audio: Wird Audio passend und sinnvoll verwendet. Ist der Auftritt im Takt, passt das Lipsync? </>),
  Publikumsreaktion: <>Gibt es sicht- und hörbare Resonanz des Publikums. Wie Applaus, Lachen und allgemein Begeisterung. Wie stark reagiert das Publikum auf den Auftritt.</>
};

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: darkMode ? "#1f2937" : "#fff",
    color: darkMode ? "#f9fafb" : "#111827",
    padding: theme.spacing(2.5),
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 4px 10px rgba(255,255,255,0.05)"
      : "0 4px 10px rgba(0,0,0,0.08)",
  }));

  const handleChange = (category, criterion, value) => {
    const participantId = currentParticipant?.id;
    setRatings(prev => ({
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

  const getTotal = category => {
    const values = Object.values(ratings[currentParticipant?.id]?.[category] || {});
    return values.reduce((sum, val) => sum + (val || 0), 0);
  };

const submitRatings = async () => {
   console.log("USER:", user);
  console.log("TOKEN:", user?.token);
  if (!user) {
    alert("Bitte zuerst einloggen.");
    return;
  }

  const participantId = currentParticipant?.id;
  const current = ratings[participantId] || {};
   const API = process.env.REACT_APP_API_URL;

  // 🟢 1. Nominierungen vorbereiten
 // 🟢 1. Nominierungen vorbereiten (immer mit active)
const nominations = [
  {
    participantId,
    nominationType: "Best Performance",
    user: user.username,
    active: !!current.bestPerformance,
  },
];


  // 🟢 2. Payload aufbauen
  const payload = {
    participantId,
    ratings: {
      performance: current.performance || {},
    },
    nominations, // nur aktive Switches
  };

  try {
    const res = await fetch(`${API}/api/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Fehler beim Speichern:", txt);
      alert("Fehler beim Speichern: " + txt);
      return;
    }

    alert("Bewertung & Nominierungen erfolgreich gespeichert!");
  } catch (err) {
    console.error("Netzwerkfehler:", err);
    alert("Netzwerkfehler beim Speichern.");
  }
};


  if (!user) return <p>Bitte zuerst einloggen.</p>;
  if (!currentParticipant) return <p>Lade Teilnehmer...</p>;

  return (
    <div className={`min-h-screen p-6 flex flex-col items-center transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-blue-50 text-gray-900"
      }`}
      style={{ overflowX: "hidden", width: "100%" }}>
      <h1 className={`text-3xl font-bold mb-6 text-center ${
        darkMode ? "text-blue-300" : "text-blue-700"
      }`}>
        Bewertung Performance : {currentParticipant?.cosplayName}
      </h1>

      {/* Teilnehmer-Auswahl */}
       <div className="mb-6 w-full max-w-xs">
        <select
          className={`border rounded-lg p-2 w-full shadow-sm focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300"
          }`}
          value={currentIndex}
          onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
        >
          {participants.map((p, i) => (
            <option key={p.id} value={i}>
              {p.number} - {p.cosplayName}
            </option>
          ))}
        </select>
      </div>


      {/* Hauptbereich */}
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "center",
        alignItems: "center",
        gap: { xs: 3, md: 3 },
        px: { xs: 2, md: 6 },
      }}>
        {/* Bild */}
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: "100%", md: "35%" },
        }}>
          {currentParticipant?.characterImages?.length > 0 ? (
            <img
              src={currentParticipant.characterImages[0]}
              alt={currentParticipant.cosplayName}
               className="w-[250px] rounded-lg object-cover shadow-md cursor-pointer hover:scale-105 transition"
                 onClick={() =>
                setSelectedImage(currentParticipant.characterImages[0])
              }
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Kein Referenzbild vorhanden
            </Typography>
          )}
        </Box>

        {/* Bewertung */}
        <Grid container spacing={2} sx={{ width: { xs: "100%", md: "55%" }, display: "flex", justifyContent: "center" }}>
          <Grid item xs={12} md={10}>
            <Item>
              <h3 className="font-semibold mb-3 text-lg">
                Performance (max. 20 Punkte)
              </h3>
              {Object.entries(criteria.performance).map(([crit, max]) => (
                <div key={crit} className="mb-2">
                  <label  className="flex items-center gap-1">{crit} ({max})
                    <Tooltip
                  title={infoText[crit]}
                  arrow
                  enterTouchDelay={0}
                  leaveTouchDelay={10000}
                >
                  <button
                    type="button"
                    className="p-1"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "none",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <InfoOutlinedIcon
                      fontSize="small"
                      className={darkMode ? "text-gray-300" : "text-gray-600"}
                    />
                  </button>
                </Tooltip>
                  </label>
                  <select
                    value={ratings[currentParticipant?.id]?.performance?.[crit] || ""}
                    onChange={e => handleChange("performance", crit, e.target.value)}
                    className={`border p-1 w-full rounded ${
                      darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300"
                    }`}
                  >
                    <option value="">--</option>
                    {[...Array(max + 1).keys()].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              ))}
              <p className="mt-3 font-bold">
                Total: {getTotal("performance")} / 20
              </p>

              {/* Nominierung */}
              {/* <div className="mt-6 flex items-center justify-between">
                <Typography>Best Performance</Typography>
             <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="bestPerformance"
                checked={ratings[currentParticipant?.id]?.bestPerformance || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRatings(prev => ({
                    ...prev,
                    [currentParticipant.id]: {
                      ...prev[currentParticipant.id],
                      bestPerformance: checked,
                    },
                  }));
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-500"></div>
              <div className="absolute left-[2px] top-[2px] bg-white border border-gray-300 h-5 w-5 rounded-full transition-all peer-checked:translate-x-full"></div>
            </label>





              </div> */}
            </Item>
          </Grid>
        </Grid>
      </Box>

      {/* Navigation unten */}
      <AppBar position="fixed" sx={{
        top: "auto",
        bottom: 0,
        backgroundColor: darkMode ? "#111827" : "#e5e7eb",
        color: darkMode ? "#f9fafb" : "#111827",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.15)"
      }}>
        <Toolbar sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", py: 1.5 }}>
          <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            className={`px-4 py-2 rounded font-medium transition ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-300 hover:bg-gray-400 text-gray-900"} disabled:opacity-50`}>
            Zurück
          </button>

          <button disabled={currentIndex >= participants.length - 1} onClick={() => setCurrentIndex(i => Math.min(participants.length - 1, i + 1))}
            className={`px-4 py-2 rounded font-medium transition ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-300 hover:bg-gray-400 text-gray-900"} disabled:opacity-50`}>
            Weiter
          </button>

          <button onClick={submitRatings}
            className={`ml-auto px-5 py-2 rounded font-semibold transition ${darkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
            Punkte absenden
          </button>
        </Toolbar>
      </AppBar>
      
      {selectedImage && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
    onClick={() => setSelectedImage(null)}
  >
    <img
      src={selectedImage}
      alt="Vergrößert"
      className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg"
    />
  </div>
)}
    </div>
  );
}

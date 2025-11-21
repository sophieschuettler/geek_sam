// frontend/src/pages/Costume.js
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

export default function Costume() {
  const { user } = useAppContext();
  const { darkMode } = useTheme();
  const [participants, setParticipants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [nominations, setNominations] = useState([]);
  const [numPages, setNumPages] = useState(0);


  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/participants`)
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data);
        setCurrentIndex(0);
      })
      .catch((err) => console.error("Error loading participants:", err));
  }, []);

  const currentParticipant = participants[currentIndex];
// ------------------- NEUER USEEFFECT -------------------
useEffect(() => {
  if (!currentParticipant || !user) return;

  const fetchRatingsAndNominations = async () => {
    try {
      // 1️⃣ Ratings vom Judge
      const ratingsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/overview/by-judge`);
      const ratingsData = await ratingsRes.json();

      // 2️⃣ Nominierungen
      const nominationsRes = await fetch(`${process.env.REACT_APP_API_URL}/api/overview/nominations`);
      const nominationsData = await nominationsRes.json();

      const ratingObj = {};
      const nominationObj = { bestSewing: false, bestCraft: false };

      // Ratings filtern
      ratingsData
        .filter(r => r.user === user.username && r.participantId === currentParticipant.id)
        .forEach(r => {
          if (!ratingObj[r.category]) ratingObj[r.category] = {};
          ratingObj[r.category][r.criterion] = r.score;
        });

      // Nominierungen filtern
      nominationsData
        .filter(n => n.participantId === currentParticipant.id)
        .forEach(n => {
          const judges = n.judges ? n.judges.split(",") : [];
          if (judges.includes(user.username)) {
            if (n.category === "Best Sewing") nominationObj.bestSewing = true;
            if (n.category === "Best Craftsmanship") nominationObj.bestCraft = true;
          }

        });

      setRatings(prev => ({
        ...prev,
        [currentParticipant.id]: {
          ...(prev[currentParticipant.id] || {}),
          ...ratingObj,
          ...nominationObj
        }
      }));
    } catch (err) {
      console.error("Fehler beim Laden der Daten:", err);
    }
  };

  fetchRatingsAndNominations();
}, [currentParticipant, user]);

// ------------------- ENDE USEEFFECT -------------------


  const criteria = {
    costume: {
      Genauigkeit: 10,
      Komplexität: 15,
      "Handwerk und Details": 15,
    },
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
  if (!user) {
    alert("Bitte zuerst einloggen.");
    return;
  }

  const participantId = currentParticipant?.id;
  const participantRatings = ratings[participantId] || {};

  try {
 // 🔹 Nominierungen inkl. "active"-Status
const nominations = [
  {
    participantId,
    nominationType: "Best Sewing",
    user: user.username,
    active: !!participantRatings.bestSewing,
  },
  {
    participantId,
    nominationType: "Best Craftsmanship",
    user: user.username,
    active: !!participantRatings.bestCraft,
  },
];



    // 🔹 Bewertungen + Nominierungen in EINEM Request senden
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        user: user.username,
        participantId,
        ratings: {
          costume: participantRatings.costume || {},
        },
        nominations, // Enthält nur aktive Nominierungen
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Fehler beim Speichern:", txt);
      alert("Fehler beim Speichern: " + txt);
      return;
    }

    alert("Bewertung und Nominierungen gespeichert!");
  } catch (err) {
    console.error("Netzwerkfehler beim Speichern:", err);
    alert("Netzwerkfehler beim Speichern.");
  }
};




  if (!user) return <p>Bitte zuerst einloggen.</p>;
  if (!currentParticipant) return <p>Lade Teilnehmer...</p>;

  return (
    <div
      className={`min-h-screen p-6 pb-24 flex flex-col items-center transition-colors ${
        darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-green-50 text-gray-900"
      }`}
    >

      <h1
        className={`text-3xl font-bold mb-6 text-center ${
          darkMode ? "text-green-300" : "text-green-700"
        }`}
      >
         Bewertung Kostüm : {currentParticipant?.cosplayName}
      </h1>

      {/* Teilnehmer-Auswahl */}
      <div className="flex justify-center mb-6">
        <select
          value={currentIndex}
          onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
          className={`border p-2 rounded text-center ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300"
          }`}
        >
          {participants.map((p, i) => (
            <option key={p.id} value={i}>
              {p.cosplayName}
            </option>
          ))}
        </select>
      </div>

      {/* --- Hauptbereich: Bild + Bewertung --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "center",
          alignItems: "center", // <- zentriert auf allen Größen
          gap: { xs: 3, md: 3 },
          px: { xs: 2, md: 6 },
        }}
        >
        {/* --- Linke Seite: Bild --- */}
         <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: "100%", md: "35%" },
            }}
          >
          {currentParticipant?.characterImages?.length > 0 ? (
            <img
              src={currentParticipant.characterImages[0]}
              alt={currentParticipant.cosplayName}
              className="w-[250px] rounded-lg object-cover shadow-md"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Kein Referenzbild vorhanden
            </Typography>
          )}
        </Box>

        {/* --- Rechte Seite: Bewertung --- */}
         <Grid
    container
    spacing={2}
    sx={{
      width: { xs: "100%", md: "55%" },
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Grid item xs={12} md={10}>
      <Item>
        <h3 className="font-semibold mb-3 text-lg">
          Costume (max. 40 Punkte)
        </h3>
        {Object.entries(criteria.costume).map(([crit, max]) => (
          <div key={crit} className="mb-2">
            <label>
              {crit} ({max}):
            </label>
            <select
              value={ratings[currentParticipant?.id]?.costume?.[crit] || ""}
              onChange={(e) =>
                handleChange("costume", crit, e.target.value)
              }
              className={`border p-1 w-full rounded ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="">--</option>
              {[...Array(max + 1).keys()].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}
        <p className="mt-3 font-bold">
          Total: {getTotal("costume")} / 40
        </p>
        {/* --- Nominierung Switches --- */}
            <div className="mt-5">
              <h4 className="font-semibold mb-2 text-lg">
                Nominierungen
              </h4>

              <div className="flex items-center justify-between mb-2">
                <label htmlFor="bestSewing" className="mr-3">
                  Best Sewing
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="bestSewing"
                    checked={ratings[currentParticipant?.id]?.bestSewing || false}
                    onChange={(e) =>
                      setRatings(prev => ({
                        ...prev,
                        [currentParticipant.id]: {
                          ...prev[currentParticipant.id],
                          bestSewing: e.target.checked,
                        },
                      }))
                    }

                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500"></div>
                  <div className="absolute left-[2px] top-[2px] bg-white border border-gray-300 h-5 w-5 rounded-full transition-all peer-checked:translate-x-full"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="bestCraft" className="mr-3">
                  Best Craftmanship
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="bestCraft"
                    checked={ratings[currentParticipant?.id]?.bestCraft || false}
                    onChange={(e) =>
                      setRatings(prev => ({
                        ...prev,
                        [currentParticipant.id]: {
                          ...prev[currentParticipant.id],
                          bestCraft: e.target.checked,
                        },
                      }))
                    }

                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:bg-green-500"></div>
                  <div className="absolute left-[2px] top-[2px] bg-white border border-gray-300 h-5 w-5 rounded-full transition-all peer-checked:translate-x-full"></div>
                </label>
              </div>
            </div>

            </Item>
          </Grid>
          <p className="mt-3 ">
          {currentParticipant.text}
      </p>
       <div
              className={` p-4 rounded-xl shadow-sm transition-colors ${
                    darkMode ? "bg-gray-600 text-gray-100" : "bg-white text-gray-900"
              }`}
            >
              <h3
                className={`font-semibold text-lg mb-3 ${
                  darkMode ? "text-green-300" : "text-green-700"
                }`}
              >
                Work in Progress
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentParticipant.wipImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`WIP ${index + 1}`}
                    className="rounded-lg shadow-md object-cover w-full h-auto"
                  />
                ))}
              </div>
            </div>
            <div
                          className={` p-4 rounded-xl shadow-sm transition-colors ${
                                darkMode ? "bg-gray-600 text-gray-100" : "bg-white text-gray-900"
                          }`}
                        >
                          <h3
                            className={`font-semibold text-lg mb-3 ${
                              darkMode ? "text-green-300" : "text-green-700"
                            }`}
                          >
                            BuildBook
                          </h3>
                          <div className="flex flex-col items-center">
                            <Document
                              file={currentParticipant.buildBook}
                              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                              className="w-full flex flex-col items-center"
                            >
                              {Array.from(new Array(numPages), (el, index) => (
                                <Page
                                  key={`page_${index + 1}`}
                                  pageNumber={index + 1}
                                  width={Math.min(window.innerWidth * 0.9, 800)}
                                  className="shadow-md my-4 rounded-lg"
                                  renderTextLayer={false}
                                  renderAnnotationLayer={false}
                                />
                              ))}
                            </Document>
                          </div>
                        </div>
        </Grid>
        
      </Box>


      {/* --- Fixierte Navigationsleiste unten --- */}
      <AppBar
        position="fixed"
        sx={{
          top: "auto",
          bottom: 0,
          backgroundColor: darkMode ? "#111827" : "#e5e7eb",
          color: darkMode ? "#f9fafb" : "#111827",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.15)",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            py: 1.5,
          }}
        >
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className={`px-4 py-2 rounded font-medium transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-300 hover:bg-gray-400 text-gray-900"
            } disabled:opacity-50`}
          >
            Zurück
          </button>

          <button
            disabled={currentIndex >= participants.length - 1}
            onClick={() =>
              setCurrentIndex((i) => Math.min(participants.length - 1, i + 1))
            }
            className={`px-4 py-2 rounded font-medium transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-300 hover:bg-gray-400 text-gray-900"
            } disabled:opacity-50`}
          >
            Weiter
          </button>

          <button
            onClick={submitRatings}
            className={`ml-auto px-5 py-2 rounded font-semibold transition ${
              darkMode
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            Punkte absenden
          </button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

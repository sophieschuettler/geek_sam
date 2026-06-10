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
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


export default function Costume() {
  const { user } = useAppContext();
  const { darkMode } = useTheme();
  const [participants, setParticipants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [nominations, setNominations] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);


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
  const infoText = {
  Genauigkeit: ( <>Farben und Materialien: Stimmen die Farben mit den Referenzbildern überein? Wurde das passende Material gewählt (glänzend oder matt etc.)?, <br/>
  Positionierung: Wurden Kostümteile richtig positioniert? <br/>
  Perücke/Make-up: Passen Perücke und Make-up zum Charakter? (wird natürlich nicht bei Charakteren mit Helmen berücksichtigt, dann zählt alles andere in Relation mehr)<br/>
  Proportionen: Entsprechen die Kostümteile den Proportionen des Charakters (Kleidlänge, Mantellänge, Form von Rüstungen)?</>) ,
  Komplexität: (<> Aufwand: Hat das Kostüm viele Schichten? Wurden viele unterschiedliche Materialien verwendet? <br/>
    Techniken: Wurden viele Techniken verwendet? Zum Beispiel: Sticken, Häkeln, Airbrush, 3D Modellierung, Schnittmuster selbst anfertigen, etc.."
  </>),
  "Handwerk und Details": <>Verarbeitung/Bearbeitung:: Wurde insgesamt sauber gearbeitet? Keine Klebereste, saubere Übergänge, saubere Nähte, sauber bemalt und geweathert. 3D-Drucke sauber geschliffen. <br/>
  Tragbarkeit: Ist das Kostüm funktional und tragbar? Ist der Sitz gut? <br/>
   Feinarbeit: Wurden kleinere Details sauber und fein verarbeitet und wurden welche hinzugefügt, die erst bei genauem Hinsehen entdeckt werden.</>
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
   console.log("USER:", user);
  console.log("TOKEN:", user?.token);
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
  {
    participantId,
    nominationType: "Judges Award",
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
      className={`min-h-screen p-6 flex flex-col items-center transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-blue-50 text-gray-900"
      }`}
      style={{ overflowX: "hidden", width: "100%" }}
    >

      <h1
       className={`text-3xl font-bold mb-6 text-center ${
        darkMode ? "text-blue-300" : "text-blue-700"
      }`}
      >
         Bewertung Kostüm : {currentParticipant?.cosplayName}
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
           {selectedParticipant.character && (
                <p className="mb-1">
                  <span className="font-semibold">Charakter:</span>{" "}
                  {selectedParticipant.character}
                </p>
              )}
              {selectedParticipant.game && (
                <p className="mb-1">
                  <span className="font-semibold">Fandom:</span>{" "}
                  {selectedParticipant.game}
                </p>
              )}

              {selectedParticipant.text1 && (
                <p className="mt-3 ">
                  <span className="font-semibold">Auf welche Techniken, Materialien, Aspekte möchtest du bei deinem Cosplay besonderen Wert legen: </span>{" "}
                  {selectedParticipant.text1}
                </p>
              )}
              {selectedParticipant.text2 && (
                <p className="mt-3 ">
                  <span className="font-semibold">Besonderheiten des Cosplays:</span>{" "}
                  {selectedParticipant.text2}
                </p>
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
            <label className="flex items-center gap-1">
              {crit} ({max})
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
            {/* <div className="mt-5">
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:bg-blue-500"></div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-800 peer-checked:bg-blue-500"></div>
                  <div className="absolute left-[2px] top-[2px] bg-white border border-gray-300 h-5 w-5 rounded-full transition-all peer-checked:translate-x-full"></div>
                </label>
              </div>
            </div> */}

            </Item>
          </Grid>
           
        </Grid>
        

      </Box>
{currentParticipant && (
                  <div
                    className={` p-6 rounded-2xl  w-full max-w-5xl flex flex-col gap-8 transition-colors ${
                      darkMode ? "bg-transparent text-gray-100" : "bg-transparent text-gray-900"
                    }`}
                  >
                    
                              
                    {/* === WIP Bilder === */}
                    {currentParticipant.wipImages?.length > 0 && (
                      <div
                        className={` p-4 rounded-xl shadow-sm transition-colors ${
                              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                        }`}
                      >
                        <h3
                          className={`font-semibold text-lg mb-3 ${
                            darkMode ? "text-blue-300" : "text-blue-700"
                          }`}
                        >
                          Work in Progress
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full overflow-hidden">

                          {currentParticipant.wipImages.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`WIP ${index + 1}`}
                              className="rounded-lg shadow-md object-cover w-full h-auto cursor-pointer hover:scale-105 transition"
                              onClick={() => setSelectedImage(img)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
          
                    {/* === BuildBook === */}
                    {currentParticipant.buildBook && (
                      <div
                        className={` p-4 rounded-xl shadow-sm transition-colors ${
                              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
                        }`}
                      >
                        <h3
                          className={`font-semibold text-lg mb-3 ${
                            darkMode ? "text-blue-300" : "text-blue-700"
                          }`}
                        >
                          BuildBook
                        </h3>
                        <div className="flex flex-col items-center" style={{ width: "100%", overflowX: "hidden" }}  >
                          <Document
                            file={currentParticipant.buildBook}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            className="w-full flex flex-col items-center"
                          >
                            {Array.from(new Array(numPages), (el, index) => (
                              <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={Math.min(window.innerWidth * 0.85, 700)}
                                className="shadow-md my-4 rounded-lg"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />
                            ))}
                          </Document>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                ? "bg-gray-800 hover:bg-gray-600 text-gray-100"
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
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
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

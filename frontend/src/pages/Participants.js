import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";  // Dark Mode Kontext importieren
import caroRef from "./uploads/caro_ref.jpg";  // Beispiel für Referenzbilder (kann entfernt werden, wenn die DB alle Referenzbilder enthält)

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function Participants() {
  const [participants, setParticipants] = useState([]); // Teilnehmerdaten vom Backend
  const [selectedId, setSelectedId] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true); // Ladezustand
  const { darkMode } = useTheme();  // darkMode aus dem Theme-Kontext holen

  useEffect(() => {
    // API Aufruf zum Laden der Teilnehmerdaten
    fetch("http://localhost:4000/api/participants")
      .then((res) => res.json())
      .then((data) => {
        setParticipants(data);
        setSelectedId(data[0]?.id || null); // Standardmäßig den ersten Teilnehmer auswählen
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Teilnehmer:", err);
        setLoading(false);
      });
  }, []);

  // Falls die Teilnehmerdaten noch geladen werden
  if (loading) {
    return <div>Loading...</div>;
  }

  const selectedParticipant = participants.find((p) => p.id === selectedId);

  return (
    <div
      className={`min-h-screen p-6 flex flex-col items-center transition-colors ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-green-50 text-gray-900"
      }`}
    >
      <h1
        className={`text-3xl font-bold mb-6 text-center ${
          darkMode ? "text-green-300" : "text-green-700"
        }`}
      >
        Teilnehmer Übersicht
      </h1>

      {/* Auswahl Dropdown */}
      <div className="mb-6 w-full max-w-xs">
        <select
          className={`border rounded-lg p-2 w-full shadow-sm focus:ring-2 ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-100"
              : "bg-white border-gray-300"
          }`}
          value={selectedId || ""}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.number} - {p.cosplayName}
            </option>
          ))}
        </select>
      </div>

      {/* Teilnehmerdetails */}
      {selectedParticipant && (
        <div
          className={` p-6 rounded-2xl  w-full max-w-5xl flex flex-col gap-8 transition-colors ${
            darkMode ? "bg-transparent text-gray-100" : "bg-transparent text-gray-900"
          }`}
        >
          {/* === Allgemeine Infos === */}
          <div className={` p-6 rounded-2xl shadow-lg w-full max-w-5xl flex flex-col gap-8 transition-colors ${
            darkMode ? "bg-gray-600 text-gray-100" : "bg-white text-gray-900"
          }`}>
              
            <div className={` p-6 rounded-2xl  w-full max-w-5xl flex flex-col gap-8 transition-colors ${
            darkMode ? "bg-gray-600 text-gray-100" : "bg-white text-gray-900"
          }`}>
              <h2
                className={`text-2xl font-semibold ${
                  darkMode ? "text-green-300" : "text-green-800"
                } mb-2`}
              >
                {selectedParticipant.cosplayName} (#{selectedParticipant.number})
              </h2>
              {/* === Charakterbilder === */}
              {selectedParticipant.characterImages?.length > 0 && (
                <div
                  className={`p-6 rounded-2xl  w-full max-w-5xl flex flex-col gap-4 transition-colors ${
                    darkMode ? "bg-gray-600 text-gray-100" : "bg-white text-gray-900"
                  }`}
                >
                  <h3
                    className={`font-semibold text-lg mb-3 ${
                      darkMode ? "text-green-300" : "text-green-700"
                    }`}
                  >
                    Charakterbilder
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedParticipant.characterImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Charakterbild ${index + 1}`}
                        className="rounded-xl shadow-md w-full object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedParticipant.link && (
                <p className="mb-3">
                  <span className="font-semibold">Instagram: </span>
                  <a
                    href={
                      selectedParticipant.link.startsWith("http")
                        ? selectedParticipant.link
                        : `https://${selectedParticipant.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {selectedParticipant.link.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              )}


              {selectedParticipant.character && (
                <p className="mb-1">
                  <span className="font-semibold">Charakter:</span>{" "}
                  {selectedParticipant.character}
                </p>
              )}

              {selectedParticipant.text && (
                <p className="mt-3 ">
                  {selectedParticipant.text}
                </p>
              )}
            </div>
          </div>
          

          {/* === Tragebilder === */}
          {selectedParticipant.wearingImages?.length > 0 && (
            <div
              className={`p-4 rounded-xl shadow-sm transition-colors ${
                    darkMode ? "bg-gray-600 text-gray-100" : "bg-white text-gray-900"
              }`}
            >
              <h3
                className={`font-semibold text-lg mb-3 ${
                  darkMode ? "text-green-300" : "text-green-700"
                }`}
              >
                Tragebilder
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ">
                {selectedParticipant.wearingImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Tragebild ${index + 1}`}
                    className="rounded-lg shadow-md object-cover w-full h-auto"
                  />
                ))}
              </div>
            </div>
          )}

          {/* === WIP Bilder === */}
          {selectedParticipant.wipImages?.length > 0 && (
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
                {selectedParticipant.wipImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`WIP ${index + 1}`}
                    className="rounded-lg shadow-md object-cover w-full h-auto"
                  />
                ))}
              </div>
            </div>
          )}

          {/* === BuildBook === */}
          {selectedParticipant.buildBook && (
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
                  file={selectedParticipant.buildBook}
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
          )}
        </div>
      )}
    </div>
  );
}

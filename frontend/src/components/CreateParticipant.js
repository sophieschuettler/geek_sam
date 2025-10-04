// frontend/src/components/CreateParticipant.js
import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function CreateParticipant() {
  const { user } = useAppContext();

  // Admin-Prüfung
  if (!user) {
    return (
      <div className="text-center mt-8 text-red-600">
        <p>Du musst eingeloggt sein, um Teilnehmer anzulegen.</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="text-center mt-8 text-red-600">
        <p>Nur Administratoren dürfen Teilnehmer anlegen.</p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    cosplayName: "",
    character: "",
    game: "",
  });

  const [files, setFiles] = useState({
    characterImage: null,
    cosplayImages: [],
    wipImages: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: name === "characterImage" ? selectedFiles[0] : Array.from(selectedFiles),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("cosplayName", formData.cosplayName);
    data.append("character", formData.character);
    data.append("game", formData.game);
    if (files.characterImage) data.append("characterImage", files.characterImage);
    files.cosplayImages.forEach((file) => data.append("cosplayImages", file));
    files.wipImages.forEach((file) => data.append("wipImages", file));

    try {
      const res = await fetch("http://localhost:4000/api/participants", {
        method: "POST",
        headers: {
          // optional – kann im Backend überprüft werden
          "X-User-Role": user.role,
        },
        body: data,
      });

      if (res.ok) {
        alert("Teilnehmer erfolgreich erstellt!");
        // Formular zurücksetzen
        setFormData({ cosplayName: "", character: "", game: "" });
        setFiles({ characterImage: null, cosplayImages: [], wipImages: [] });
      } else {
        alert("Fehler beim Erstellen.");
      }
    } catch (err) {
      console.error("Fehler beim Senden:", err);
      alert("Serverfehler beim Erstellen.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-white shadow rounded max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold text-center text-green-700">
        Teilnehmer anlegen
      </h2>

      <input
        name="cosplayName"
        placeholder="Cosplayname"
        value={formData.cosplayName}
        onChange={handleChange}
        className="border p-2"
        required
      />
      <input
        name="character"
        placeholder="Charakter"
        value={formData.character}
        onChange={handleChange}
        className="border p-2"
        required
      />
      <input
        name="game"
        placeholder="Game"
        value={formData.game}
        onChange={handleChange}
        className="border p-2"
        required
      />

      <label>Charakterbild</label>
      <input
        type="file"
        name="characterImage"
        onChange={handleFileChange}
        accept="image/*"
        className="p-2"
      />

      <label>Cosplaybilder (mehrere möglich)</label>
      <input
        type="file"
        name="cosplayImages"
        multiple
        onChange={handleFileChange}
        accept="image/*"
        className="p-2"
      />

      <label>WIP Bilder (mehrere möglich)</label>
      <input
        type="file"
        name="wipImages"
        multiple
        onChange={handleFileChange}
        accept="image/*"
        className="p-2"
      />

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Teilnehmer erstellen
      </button>
    </form>
  );
}

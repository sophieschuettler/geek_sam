const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();
const db = new sqlite3.Database("./db/contest.db");
const BASE_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;


const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Bilder speichern
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});
const upload = multer({ storage });

// Statische Bereitstellung der Bilder
router.use("/uploads", express.static(uploadDir));

// Tabelle erstellen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cosplayName TEXT,
    character TEXT,
    game TEXT,
    characterImage TEXT,
    cosplayImages TEXT,
    wipImages TEXT
  )`);
});

// Teilnehmer anlegen
router.post(
  "/",
  upload.fields([
    { name: "characterImage", maxCount: 1 },
    { name: "cosplayImages", maxCount: 10 },
    { name: "wipImages", maxCount: 10 },
  ]),
  (req, res) => {
    const { cosplayName, character, game } = req.body;
    const characterImage = req.files.characterImage?.[0]?.filename || "";
    const cosplayImages = req.files.cosplayImages?.map((f) => f.filename).join(",") || "";
    const wipImages = req.files.wipImages?.map((f) => f.filename).join(",") || "";

    db.run(
      `INSERT INTO participants (cosplayName, character, game, characterImage, cosplayImages, wipImages)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cosplayName, character, game, characterImage, cosplayImages, wipImages],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ id: this.lastID });
      }
    );
  }
);

// Alle Teilnehmer abrufen
router.get("/", (req, res) => {
  db.all("SELECT * FROM participants", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const fullRows = rows.map((row) => ({
      ...row,
      characterImage: row.characterImage ? `${BASE_URL}/uploads/${row.characterImage}` : null,
cosplayImages: row.cosplayImages
  ? row.cosplayImages.split(",").map(f => `${BASE_URL}/uploads/${f}`)
  : [],
wipImages: row.wipImages
  ? row.wipImages.split(",").map(f => `${BASE_URL}/uploads/${f}`)
  : [],

    }));

    res.json(fullRows);
  });
});

module.exports = router;

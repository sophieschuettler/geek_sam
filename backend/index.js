const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 4000;

// === Middleware ===
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/overview", require("./routes/overview"));


// === SQLite Setup ===
const db = new sqlite3.Database("./db/contest.db");

// Teilnehmer-Tabelle
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cosplayName TEXT,
      character TEXT,
      game TEXT,
      characterImage TEXT,
      cosplayImages TEXT,
      wipImages TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      participantId INTEGER,
      criteria TEXT,
      score INTEGER
    )
  `);
});

// === Multer Upload Setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "_" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({ storage });

// === Teilnehmer API ===

// GET all participants
app.get("/api/participants", (req, res) => {
  db.all("SELECT * FROM participants", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    rows = rows.map((row) => ({
      ...row,
      cosplayImages: row.cosplayImages ? JSON.parse(row.cosplayImages) : [],
      wipImages: row.wipImages ? JSON.parse(row.wipImages) : [],
    }));
    res.json(rows);
  });
});

// POST new participant (nur für Admin im Frontend)
app.post(
  "/api/participants",
  upload.fields([
    { name: "characterImage", maxCount: 1 },
    { name: "cosplayImages" },
    { name: "wipImages" },
  ]),
  (req, res) => {
    const { cosplayName, character, game } = req.body;
    const characterImage = req.files["characterImage"]?.[0]?.filename || "";
    const cosplayImages = (req.files["cosplayImages"] || []).map((f) => f.filename);
    const wipImages = (req.files["wipImages"] || []).map((f) => f.filename);

    db.run(
      `INSERT INTO participants (cosplayName, character, game, characterImage, cosplayImages, wipImages) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cosplayName,
        character,
        game,
        characterImage,
        JSON.stringify(cosplayImages),
        JSON.stringify(wipImages),
      ],
      function (err) {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: this.lastID });
      }
    );
  }
);

// === Bewertung API ===

// POST Bewertung abgeben
app.post("/rate", (req, res) => {
  const { user, participantId, ratings } = req.body;

  db.serialize(() => {
    // Vorherige Bewertungen dieses Users & Teilnehmers löschen
    db.run("DELETE FROM ratings WHERE user = ? AND participantId = ?", [user, participantId], (err) => {
      if (err) return res.status(500).send(err);

      const stmt = db.prepare("INSERT INTO ratings (user, participantId, criteria, score) VALUES (?, ?, ?, ?)");

      for (const [criteria, score] of Object.entries(ratings)) {
        stmt.run(user, participantId, criteria, score);
      }

      stmt.finalize((err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
      });
    });
  });
});

// GET alle Bewertungen (für Overview)
app.get("/overview", (req, res) => {
  db.all("SELECT * FROM ratings", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// === Server starten ===
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

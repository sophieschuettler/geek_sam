const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const BASE_URL =
  process.env.BACKEND_URL ||
  `http://localhost:${process.env.PORT || 4000}`;


// --- Upload setup ---
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});

const upload = multer({ storage });

router.use("/uploads", express.static(uploadDir));


// --- CREATE PARTICIPANT ---
router.post(
  "/",
  upload.fields([
    { name: "characterImage", maxCount: 1 },
    { name: "cosplayImages", maxCount: 10 },
    { name: "wipImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { cosplayName, character, game } = req.body;

const characterImage =
  JSON.stringify(req.files.characterImage?.map(f => f.filename) || []);
      const cosplayImages =
        req.files.cosplayImages?.map((f) => f.filename) || [];

      const wipImages =
        req.files.wipImages?.map((f) => f.filename) || [];

      const result = await pool.query(
        `
        INSERT INTO participants
        (cosplayName, character, game, characterImage, cosplayImages, wipImages)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [
          cosplayName,
          character,
          game,
          characterImage,
          JSON.stringify(cosplayImages),
          JSON.stringify(wipImages),
        ]
      );

      res.json({ id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// --- GET ALL PARTICIPANTS ---
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM participants ORDER BY id ASC"
    );

  const rows = result.rows.map((row) => ({
  id: row.id,
  cosplayName: row.cosplayname,
  character: row.character,
  game: row.game,
  number: row.number,

  characterImages: row.characterimage
    ? (() => {
        try {
          const parsed = JSON.parse(row.characterimage);
          return parsed.map(f => `${BASE_URL}/uploads/${f}`);
        } catch {
          return row.characterimage.startsWith("http")
            ? [row.characterimage]
            : [`${BASE_URL}/uploads/${row.characterimage}`];
        }
      })()
    : [],

  cosplayImages: row.cosplayimages
    ? JSON.parse(row.cosplayimages).map(f => `${BASE_URL}/uploads/${f}`)
    : [],

  wipImages: row.wipimages
    ? JSON.parse(row.wipimages).map(f => `${BASE_URL}/uploads/${f}`)
    : [],
}));

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
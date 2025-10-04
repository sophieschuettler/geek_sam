const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/contest.db");

// Gesamtpunkte pro Teilnehmer
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      participantId, 
      SUM(score) as totalScore
    FROM ratings
    GROUP BY participantId
    ORDER BY totalScore DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Top 3 Teilnehmer Gesamt
router.get("/top/total", (req, res) => {
  const sql = `
    SELECT 
      participantId, 
      SUM(score) as totalScore
    FROM ratings
    GROUP BY participantId
    ORDER BY totalScore DESC
    LIMIT 3
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Top 3 Sewing
router.get("/top/sewing", (req, res) => {
  const sql = `
    SELECT 
      participantId,
      SUM(score) as sewingScore
    FROM ratings
    WHERE criteria = 'Sewing'
    GROUP BY participantId
    ORDER BY sewingScore DESC
    LIMIT 3
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Top 3 Crafting
router.get("/top/crafting", (req, res) => {
  const sql = `
    SELECT 
      participantId,
      SUM(score) as craftingScore
    FROM ratings
    WHERE criteria = 'Crafting'
    GROUP BY participantId
    ORDER BY craftingScore DESC
    LIMIT 3
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Top 3 Performance Total (Acting + Creativity + Use of audio)
router.get("/top/performance", (req, res) => {
  const sql = `
    SELECT 
      participantId,
      SUM(score) as performanceTotal
    FROM ratings
    WHERE criteria IN ('Acting', 'Creativity', 'Use of audio')
    GROUP BY participantId
    ORDER BY performanceTotal DESC
    LIMIT 3
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;

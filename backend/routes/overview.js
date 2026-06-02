// backend/routes/overview.js
const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "../db/contest.db"));

// --- Nach Judge ---
router.get("/by-judge", (req, res) => {
  db.all(
    `SELECT username AS user, participantId, category, criterion, score
     FROM ratings
     ORDER BY username, participantId, category, criterion`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// --- Gesamtpunkte ---
router.get("/total", (req, res) => {
  db.all(
    `SELECT 
      p.id AS participantId,
      p.cosplayName,
      COALESCE(SUM(CASE WHEN r.category='costume' OR r.category='performance' THEN r.score ELSE 0 END),0) AS totalScore,
      COALESCE(SUM(CASE WHEN r.category='costume' THEN r.score ELSE 0 END),0) AS costumeScore,
      COALESCE(SUM(CASE WHEN r.category='performance' THEN r.score ELSE 0 END),0) AS performanceTotal
     FROM participants p
     LEFT JOIN ratings r ON p.id = r.participantId
     GROUP BY p.id
     ORDER BY totalScore DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// --- Top3 Gesamt ---
router.get("/top/total", (req, res) => {
  const query = `
    SELECT 
      p.cosplayName, 
      r.participantId, 
      SUM(r.score) AS total,
      GROUP_CONCAT(DISTINCT r.username) AS judges
    FROM (
      SELECT username, participantId, SUM(score) AS score
      FROM ratings
      GROUP BY username, participantId
    ) r
    JOIN participants p ON p.id = r.participantId
    GROUP BY r.participantId
    ORDER BY total DESC
    LIMIT 3
  `;
  db.all(query, [], (err, rows) =>
    err ? res.status(500).json({ error: err.message }) : res.json(rows)
  );
});

// --- Top3 Performance ---
router.get("/top/performance", (req, res) => {
  const query = `
    SELECT 
      p.cosplayName, 
      r.participantId, 
      SUM(r.score) AS total,
      GROUP_CONCAT(DISTINCT r.username) AS judges
    FROM (
      SELECT username, participantId, SUM(score) AS score
      FROM ratings
      WHERE category='performance'
      GROUP BY username, participantId
    ) r
    JOIN participants p ON p.id = r.participantId
    GROUP BY r.participantId
    ORDER BY total DESC
    LIMIT 3
  `;
  db.all(query, [], (err, rows) =>
    err ? res.status(500).json({ error: err.message }) : res.json(rows)
  );
});

// --- Top3 Costume ---
router.get("/top/costume", (req, res) => {
  const query = `
    SELECT 
      p.cosplayName, 
      r.participantId, 
      SUM(r.score) AS total,
      GROUP_CONCAT(DISTINCT r.username) AS judges
    FROM (
      SELECT username, participantId, SUM(score) AS score
      FROM ratings
      WHERE category='costume'
      GROUP BY username, participantId
    ) r
    JOIN participants p ON p.id = r.participantId
    GROUP BY r.participantId
    ORDER BY total DESC
    LIMIT 3
  `;
  db.all(query, [], (err, rows) =>
    err ? res.status(500).json({ error: err.message }) : res.json(rows)
  );
});

// --- Nominierungen ---

// --- Nominierungen nach Kategorie für alle Teilnehmer ---
// --- Judges Award Übersicht ---
router.get("/nominations", (req, res) => {
  db.all(
    `
    SELECT
      p.id AS participantId,
      p.cosplayName,
      COUNT(n.id) AS votes,
      COALESCE(GROUP_CONCAT(n.user, ', '), '') AS judges
    FROM participants p
    LEFT JOIN nominations n
      ON p.id = n.participantId
      AND n.nominationType = 'Judges Award'
    GROUP BY p.id
    ORDER BY votes DESC, p.id ASC
    `,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
    }
  );
});

// --- Neue oder geänderte Nominierung speichern / löschen ---
// --- Judges Award speichern ---
router.post("/nominations", (req, res) => {
  const { participantId, nominationType, user, active } = req.body;

  if (!participantId || !nominationType || !user) {
    return res.status(400).json({
      error: "Missing participantId, nominationType or user",
    });
  }

  if (active) {
    // Judge darf nur EINEN Judges Award vergeben
    db.run(
      `
      DELETE FROM nominations
      WHERE user = ?
      AND nominationType = 'Judges Award'
      `,
      [user],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        db.run(
          `
          INSERT INTO nominations
          (participantId, nominationType, user, createdAt)
          VALUES (?, 'Judges Award', ?, datetime('now'))
          `,
          [participantId, user],
          function (err2) {
            if (err2) {
              return res.status(500).json({ error: err2.message });
            }

            res.json({
              success: true,
              id: this.lastID,
              action: "replaced",
            });
          }
        );
      }
    );
  } else {
    db.run(
      `
      DELETE FROM nominations
      WHERE participantId = ?
      AND user = ?
      AND nominationType = 'Judges Award'
      `,
      [participantId, user],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({
          success: true,
          action: "deleted",
        });
      }
    );
  }
});

module.exports = router;

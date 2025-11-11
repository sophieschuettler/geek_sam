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
router.get("/nominations", (req, res) => {
  const categories = ["Best Sewing", "Best Craftsmanship", "Best Performance"];

  // Alle Teilnehmer holen
  db.all("SELECT id, cosplayName FROM participants ORDER BY number ASC", [], (err, participants) => {
    if (err) return res.status(500).json({ error: err.message });

    // Alle Nominierungen aus DB holen
    db.all("SELECT participantId, nominationType, user FROM nominations", [], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const result = [];

      categories.forEach((cat) => {
        participants.forEach((p) => {
          // Welche Jury-Mitglieder haben diesen Teilnehmer für diese Kategorie nominiert?
          const users = rows
            .filter(r => r.participantId === p.id && r.nominationType === cat)
            .map(r => r.user);

          result.push({
            participantId: p.id,
            cosplayName: p.cosplayName,
            category: cat,
            votes: users.length,
            judges: users.join(", ") || "—", // leer = —
          });
        });
      });

      res.json(result);
    });
  });
});

// --- Neue oder geänderte Nominierung speichern / löschen ---
router.post("/nominations", (req, res) => {
  const { participantId, nominationType, user, active } = req.body;

  if (!participantId || !nominationType || !user) {
    return res.status(400).json({ error: "Missing participantId, nominationType or user" });
  }

  if (active) {
    // ✅ Nominierung setzen oder aktualisieren (pro User + Kategorie nur einmal)
    db.get(
      `SELECT id FROM nominations WHERE user = ? AND nominationType = ? AND participantId = ?`,
      [user, nominationType, participantId],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
          // schon vorhanden → nur Zeit aktualisieren
          db.run(
            `UPDATE nominations SET createdAt = datetime('now') WHERE id = ?`,
            [row.id],
            err2 => {
              if (err2) return res.status(500).json({ error: err2.message });
              res.json({ success: true, action: "updated" });
            }
          );
        } else {
          // noch nicht vorhanden → neu anlegen
          db.run(
            `INSERT INTO nominations (participantId, nominationType, user, createdAt)
             VALUES (?, ?, ?, datetime('now'))`,
            [participantId, nominationType, user],
            function (err2) {
              if (err2) return res.status(500).json({ error: err2.message });
              res.json({ success: true, id: this.lastID, action: "inserted" });
            }
          );
        }
      }
    );
  } else {
    // ❌ Switch deaktiviert → Nominierung löschen
    db.run(
      `DELETE FROM nominations WHERE user = ? AND nominationType = ? AND participantId = ?`,
      [user, nominationType, participantId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, action: "deleted" });
      }
    );
  }
});

module.exports = router;

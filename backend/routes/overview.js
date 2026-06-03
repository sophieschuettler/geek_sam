const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


// =========================
// BY JUDGE
// =========================
router.get("/by-judge", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        username,
        participantId,
        category,
        criterion,
        score
      FROM ratings
      ORDER BY username, participantId, category, criterion
    `);

    const data = result.rows.map(r => ({
      user: r.username,
      participantId: r.participantid,
      category: r.category,
      criterion: r.criterion,
      score: Number(r.score),
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// TOTAL OVERVIEW
// =========================
router.get("/total", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.number,
        p.cosplayname,

        COALESCE(SUM(CASE WHEN r.category='costume' THEN r.score ELSE 0 END),0) AS costume_score,
        COALESCE(SUM(CASE WHEN r.category='performance' THEN r.score ELSE 0 END),0) AS performance_score,
        COALESCE(SUM(r.score),0) AS total_score

      FROM participants p
      LEFT JOIN ratings r ON p.id = r.participantId
      GROUP BY p.id, p.number, p.cosplayname
      ORDER BY total_score DESC
    `);

    const data = result.rows.map(r => ({
      participantId: r.id,
      number: r.number,
      cosplayName: r.cosplayname,
      costumeScore: Number(r.costume_score),
      performanceTotal: Number(r.performance_score),
      totalScore: Number(r.total_score),
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// TOP 3 TOTAL
// =========================
router.get("/top/total", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id AS participantId,
        p.cosplayname,
        SUM(r.score) AS total
      FROM ratings r
      JOIN participants p ON p.id = r.participantId
      GROUP BY p.id, p.cosplayname
      ORDER BY total DESC
      LIMIT 3
    `);

    res.json(result.rows.map(r => ({
      participantId: r.participantid,
      cosplayName: r.cosplayname,
      total: Number(r.total),
    })));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// TOP 3 PERFORMANCE
// =========================
router.get("/top/performance", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id AS participantId,
        p.cosplayname,
        SUM(r.score) AS total
      FROM ratings r
      JOIN participants p ON p.id = r.participantId
      WHERE r.category = 'performance'
      GROUP BY p.id, p.cosplayname
      ORDER BY total DESC
      LIMIT 3
    `);

    res.json(result.rows.map(r => ({
      participantId: r.participantid,
      cosplayName: r.cosplayname,
      total: Number(r.total),
    })));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// TOP 3 COSTUME
// =========================
router.get("/top/costume", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id AS participantId,
        p.cosplayname,
        SUM(r.score) AS total
      FROM ratings r
      JOIN participants p ON p.id = r.participantId
      WHERE r.category = 'costume'
      GROUP BY p.id, p.cosplayname
      ORDER BY total DESC
      LIMIT 3
    `);

    res.json(result.rows.map(r => ({
      participantId: r.participantid,
      cosplayName: r.cosplayname,
      total: Number(r.total),
    })));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// NOMINATIONS OVERVIEW
// =========================
router.get("/nominations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id AS participantId,
        p.cosplayname,
        COUNT(n.id) AS votes,
        COALESCE(STRING_AGG(n.username, ', '), '') AS judges
      FROM participants p
      LEFT JOIN nominations n
        ON p.id = n.participantId
        AND n.nominationType = 'Judges Award'
      GROUP BY p.id, p.cosplayname
      ORDER BY votes DESC, p.id ASC
    `);

    res.json(result.rows.map(r => ({
      participantId: r.participantid,
      cosplayName: r.cosplayname,
      votes: Number(r.votes),
      judges: r.judges,
    })));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =========================
// NOMINATION TOGGLE
// =========================
router.post("/nominations", async (req, res) => {
  const { participantId, user, active } = req.body;

  try {
    if (active) {
      await pool.query(
        `DELETE FROM nominations
         WHERE userName = $1
         AND nominationType = 'Judges Award'`,
        [user]
      );

      await pool.query(
        `INSERT INTO nominations (participantId, nominationType, userName, createdAt)
         VALUES ($1, 'Judges Award', $2, NOW())`,
        [participantId, user]
      );

      return res.json({ success: true, action: "replaced" });
    }

    await pool.query(
      `DELETE FROM nominations
       WHERE participantId = $1
       AND userName = $2
       AND nominationType = 'Judges Award'`,
      [participantId, user]
    );

    res.json({ success: true, action: "deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
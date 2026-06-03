// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const overviewRoutes = require("./routes/overview");

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

/* ======================================================
   MIDDLEWARE
====================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "https://geekworld-contest.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile apps / curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* ======================================================
   STATIC FILES (UPLOADS)
====================================================== */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   DATABASE
====================================================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/* ======================================================
   TABLE INIT
====================================================== */

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY,
      cosplayName TEXT,
      pronomen TEXT,
      character TEXT,
      game TEXT,
      number INTEGER,
      characterImage TEXT,
      text1 TEXT,
      text2 TEXT,
      cosplayImages TEXT,
      wearingImages TEXT,
      wipImages TEXT,
      buildBook TEXT,
      link TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      username TEXT,
      participantId INTEGER,
      category TEXT,
      criterion TEXT,
      score INTEGER,
      createdAt TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS nominations (
      id SERIAL PRIMARY KEY,
      participantId INTEGER,
      userName TEXT,
      nominationType TEXT,
      createdAt TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Database ready");
}

/* ======================================================
   PARTICIPANTS (HARDCODED)
====================================================== */

const hardcodedParticipants = [
  {
    id: 1,
    cosplayName: "Roxy",
    pronomen: "sie/ihr",
    character: "Riyo",
    game: "Gachiakuta",
    number: 1,
    characterImage: JSON.stringify([`${BASE_URL}/uploads/Roxy_Ref.1.png` ]),
    text1: `Auf den näh Aspekt : Stickereien an der Jacke und die Schere`,
    text2: `Ich habe die Jacke selber bedruckt und genäht außer dem habe ich die Schere selbst gebaut `,

    link: "",
    wearingImages: JSON.stringify([]),
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Roxy_Ref.1.jpg`,
      `${BASE_URL}/uploads/Roxy_Ref.2.png`,
      `${BASE_URL}/uploads/Roxy_Ref.3.png`,
       `${BASE_URL}/uploads/Roxy_Ref.4.png`,

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null,
  },
  {
    id: 2,
    cosplayName: "Vani",
    pronomen: "sie/ihr",
    character: "Hiiaka",
    game: "OC selbst erstellt",
    number: 2,
     characterImage: JSON.stringify([ 
      `${BASE_URL}/uploads/Vani_Ref.1.JPG`,
    ]),
    text1: `Eva Foam/Stoff/LEDs/Heißkleber/Watte /silberne Plastik Folie/Stern Stanzer/Ast für den Elfen Stab `,
    text2: `LED Eigenkreation `,
    link: "",
    wearingImages: JSON.stringify([]),
    wipImages: JSON.stringify([`${BASE_URL}/uploads/Vani_Ref.2.JPG`]),
    cosplayImages: JSON.stringify([]),
    buildBook: null,
  },  {
    id: 3,
    cosplayName: "Cheesu Cosplay",
    pronomen: "sie/ihr",
    character: "Alice Liddell",
    game: "Alice: Madness Returns",
    number: 3,
    characterImage: JSON.stringify([`${BASE_URL}/uploads/Alice-1.jpg`]), 
    
    text1: `Viele verschiedene Techniken verwendet: 3D Modelle erstellen, drucken & nachbearbteiten, sculpting, LED's & Rauchmaschine bauen, Schnmittmustererstellung, Paintjob & weathering, saubere Nahtverarbeitung `,
    text2: `Dieses Cosplay wurde vollständig selbst umgesetzt. Von allen Schnittmustern über die 3D-Modelle bis hin zu Druck, Nachbearbeitung und Bemalung.
Auf eine saubere Verarbeitung von Kopf bis Fuß wurde hier besonders Wert gelegt.
Der Fokus lag auf der Kombination klassischer Schneidertechniken mit digitalem Sculpting und funktionaler Elektronik.
Das „Knightmare Hobbyhorse“ wurde eigenständig modelliert, gedruckt und mit LEDs sowie Raucheffekt ausgestattet.
Um ein schönes Ergebnis ohne Printlines zu erhalten, habe ich über mehrere Wochen den Hobbyhorse-Druck kontinuierlich geschliffen und ausgebessert.
Zusätzlich wurden sämtliche Stoffteile individuell konstruiert, gefüttert und detailgenau an die Game-Referenz angepasst, inklusive funktionaler Details und präziser Weathering-Elemente.
Auf kleine Details welche viel Zeit in Anspruch genommen haben, wie die Strumpfhose, habe ich Wert gelegt. Auch wenn diese auf den ersten Blick kaum sichtbar sind.
Die Stoffauswahl hat ebenfalls viel Zeit in Anspruch genommen, da ich verschiedene Texturen und Materialien verwenden wollte, um das Cosplay optisch noch spannender wirken zu lassen. `,
    link: "",
    wipImages: JSON.stringify([`${BASE_URL}/uploads/Alice-2.jpg`,]),
    wearingImages: JSON.stringify([]),
    cosplayImages: JSON.stringify([]),
    buildBook: `${BASE_URL}/uploads/Buildbook_Alice-Liddell_Cheesu-Cosplay.pdf`,
  },{
    id: 4,
    cosplayName: "Maki",
    pronomen: "sie/ihr",
    character: "Asagiri Gen",
    game: "Dr. Stone",
    number: 4,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/DrStone_Gen_Refs.pdf`,

    
    ]),
    text1: `Die Auswahl der Stoffe bezüglich Farben (möglichst akkurat wie im Anime).`,
    text2: `Bis auf die Unterwäsche zu 100% selbst gemacht!
Die Wig ist auch aus 2 unterschiedlichen Wigs zusammengenäht.
Auf meinem Instagram Profil (Highlights "Dr. Stone WIP") kann man den Progress mitverfolgen.
Fun fact: Gen und ich haben am selben Tag Geburtstag! (Wir sind beide Aprilscherze :D)`,


    link: "",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Maki_Ref.1.jpg`,
      `${BASE_URL}/uploads/Maki_Ref.2.jpg`,
      `${BASE_URL}/uploads/Maki_Ref.3.png`,
    ]),
    wearingImages: JSON.stringify([]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 5,
    cosplayName: "Spongebob",
    pronomen: "sie/ihr",
    character: "Spongebob Schwammkopf",
    game: "Spongebob",
    number: 5,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Spongebob_Ref.1.jpg`,  
    ]),
    text1: `Styropor `,
    text2: `Mein cosplay ist aus recycelten Materialien und ist mein erstes cosplay`,

    link: "",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Spongebob_Ref.4.jpg`,
      `${BASE_URL}/uploads/Spongebob_Ref.2.jpg`,
       `${BASE_URL}/uploads/Spongebob_Ref.3.jpg`,

   
    ]),
    wearingImages: JSON.stringify([]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 6,
    cosplayName: "Rhomi",
    pronomen: "sie/ihr",
    character: "Rengoku Kyojuro",
    game: "Demon Slayer",
    number: 6,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/demon-slayer-rengoku-reference-sheet.png`,
    ]),
    text1: `Färbung und Styling der Perrücke; Stabilisierung und Konstruktion des Schwertes`,
    text2: `Die Perrücke ist weich und bleibt auch bei Gegendruck in Form.
Die gekaufte Basis-Wig war für meinen Kopf zu klein, daher habe ich sie erweitert, durch knüpfen an der Lace Front und das einkleben und -nähen zusätzlicher Tressen hinten.
Das Schwert kann kraftvoll geschwungen werden. Darauf bin ich sehr stolz, weil ich mich zuvor nicht an das Bauen von Props getraut hatte, das ist mein erstes Schwert. Es war mir wichtig, dass es für den Effekt mit den Flammen aus Tüll und LED "furchtfrei" bewegt werden kann.
Am Kostüm war mein persönliches Highlight, herauszufinden, wie ich die schön puffige Hose umsetzen kann und das Nähen der Paspeltasche am Oberteil vorne.`,

    link: "",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Rengoku-Haare.jpg`,
      `${BASE_URL}/uploads/Rengoku-Klamotten.jpg`,
      `${BASE_URL}/uploads/Rengoku-Schwert.jpg`,
    ]),
    wearingImages: JSON.stringify([]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },
  {
    id: 7,
    cosplayName: "Jules",
    pronomen: "sie/ihr",
    character: "Kohaku",
    game: "Dr. Stone",
    number: 7,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Kohaku.png`]),
    text1: `Perückenstyling, Probs (EVA Foam)`,
    text2: `Die Perücke wird als Helmperücke mit abnehmbarem Zopf gestyled, um Kohakus Frisur darstellen zu können.
Die Messer werden am Schild befestigt und sind herausnehmbar. Die Probs sind aus EVA Foam hergestellt.
Das Kleid wirkt simpel und funktional, die Kürze ist herausfordernd, um am Charakter zu bleiben aber gleichzeitig auch Convention-tauglich zu sein.
Ich strebe einen „used look“ an, damit der Charakter so realistisch wie möglich dargestellt wird.`,

    link: "",
    wipImages: JSON.stringify([
         `${BASE_URL}/uploads/Mittel-WIP-Kohaku.png`
    ]),
    wearingImages: JSON.stringify([

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null,
  },
];

/* ======================================================
   SEED PARTICIPANTS
====================================================== */

async function seedParticipants() {
  for (const p of hardcodedParticipants) {
    await pool.query(
      `
      INSERT INTO participants (
        id, cosplayName, pronomen, character, game, number,
        characterImage, text1, text2,
        cosplayImages, wearingImages, wipImages,
        buildBook, link
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (id) DO NOTHING
      `,
      [
        p.id,
        p.cosplayName,
        p.pronomen,
        p.character,
        p.game,
        p.number,
        p.characterImage,
        p.text1,
        p.text2,
        p.cosplayImages,
        p.wearingImages,
        p.wipImages,
        p.buildBook,
        p.link,
      ]
    );
  }

  console.log("✅ Participants seeded");
}

/* ======================================================
   AUTH
====================================================== */

const users = [
  { username: "Pitou", password: "bertil13", role: "jury" },
  { username: "Sina", password: "123", role: "jury" },
  { username: "Sebastian", password: "123", role: "jury" },
  { username: "other", password: "", role: "jury" },
  { username: "Orga", password: "13", role: "jury" },
];

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid login" });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, username: user.username, role: user.role });
});

app.post("/api/logout", (req, res) => {
  res.json({ ok: true });
});

/* ======================================================
   AUTH MIDDLEWARE
====================================================== */

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });

  try {
    const token = auth.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* ======================================================
   PARTICIPANTS API
====================================================== */

app.get("/api/participants", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM participants ORDER BY number ASC"
    );

  const data = result.rows.map((r) => ({
  id: r.id,
  cosplayName: r.cosplayname,
  pronomen: r.pronomen,
  character: r.character,
  game: r.game,
  number: r.number,

  characterImages: JSON.parse(r.characterimage || "[]"),
  cosplayImages: JSON.parse(r.cosplayimages || "[]"),
  wearingImages: JSON.parse(r.wearingimages || "[]"),
  wipImages: JSON.parse(r.wipimages || "[]"),

  text1: r.text1,
  text2: r.text2,
  buildBook: r.buildbook,
  link: r.link
}));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   RATINGS
====================================================== */

app.post("/api/rate", authMiddleware, async (req, res) => {
  const { username } = req.user;
  const { participantId, ratings } = req.body;

  try {
    for (const [category, crits] of Object.entries(ratings)) {
      for (const [criterion, score] of Object.entries(crits || {})) {
        const value = typeof score === "boolean" ? (score ? 1 : 0) : score;

        await pool.query(
          `
          INSERT INTO ratings
          (username, participantId, category, criterion, score)
          VALUES ($1,$2,$3,$4,$5)
          `,
          [username, participantId, category, criterion, value]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Rating failed" });
  }
});

/* ======================================================
   OVERVIEW ROUTES
====================================================== */

app.use("/api/overview", overviewRoutes);

/* ======================================================
   DEBUG
====================================================== */

app.get("/api/debug/all", async (req, res) => {
  const result = await pool.query("SELECT * FROM ratings");
  res.json(result.rows);
});

/* ======================================================
   STARTUP
====================================================== */

async function startServer() {
  try {
    await initDB();
    // 👇 DEBUG HIER
    const r = await pool.query("SELECT COUNT(*) FROM participants");
    console.log("📦 Participants in DB:", r.rows[0]);

    if (process.env.NODE_ENV !== "production") {
      await seedParticipants();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${BASE_URL}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
}

startServer();

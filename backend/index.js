// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// --- CORS & Middleware ---
const allowedOrigins = [
  "http://localhost:3000",              // lokal (zum Testen)
  "http://192.168.1.131:3000",          // Handy im WLAN
   "https://geek-sam.vercel.app"  // <– HIER deine echte Vercel-URL eintragen!
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://geek-sam.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));




app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DB Setup ---
const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, "contest.db");
const db = new sqlite3.Database(dbPath);




// --- Tables ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS participants (
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
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    participantId INTEGER,
    category TEXT,
    criterion TEXT,
    score INTEGER,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(participantId) REFERENCES participants(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS nominations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participantId INTEGER,
    user TEXT,
    nominationType TEXT,
    FOREIGN KEY (participantId) REFERENCES participants(id)
  )`);

  db.run(`ALTER TABLE nominations ADD COLUMN createdAt TEXT DEFAULT (datetime('now'))`, err => {
    if (err) {
      if (err.message.includes("duplicate column name")) {
        console.log("Spalte createdAt in nominations existiert bereits ✅");
      } else {
        console.error("Fehler beim Hinzufügen der Spalte createdAt:", err);
      }
    } else {
      console.log("Spalte createdAt in nominations hinzugefügt ✅");
    }
  });
});


// --- Hardcoded Participants ---
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
  },/* {
    id: 11,
    cosplayName: "World's Trouble",
    character: "Gambit",
    game: "Marvel Rivals",
    number: 11,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/WorldsTrouble1.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble2.jpg`,
    ]),
    text: `I really liked the fact that the foam crafting process got me to ups and downs and gave me a lesson, a really nasty, but good one, that the finish look its all in the details, which sometimes i have to remind myself that i have to pay more attension on, same goes for the leather work and also... the wigs styling is not as easy as it seems at the beginning.`,
    link: "Instagram.com/beleaualumii",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/WorldsTrouble_WIP1.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP2.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP3.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP4.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP5.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP6.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP7.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP8.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP9.jpg`,
      `${BASE_URL}/uploads/WorldsTrouble_WIP10.jpg`,
  
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/WorldsTrouble_Tryon1.jpg`,
       `${BASE_URL}/uploads/WorldsTrouble_Tryon2.jpg`,
       `${BASE_URL}/uploads/WorldsTrouble_Tryon3.jpg`,
       `${BASE_URL}/uploads/WorldsTrouble_Tryon4.jpg`,
       `${BASE_URL}/uploads/WorldsTrouble_Tryon5.jpg`,
  

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  } ,{
    id: 8,
    cosplayName: "Syjo Cosplay",
    character: "SA-25 Steel Trooper",
    game: "Helldivers 2",
    number: 8,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Syjo.Cosplay1.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay2.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay3.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay4.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay5.jpg`,
   
    ]),
    text: `Der Großteil der Rüstung ist 3D gedruckt, die "mechanischen" Teile am rechten Arm und Bein habe ich aus EVA Foam gemacht sowie den Range Finder und den Stim. Das Cape habe ich auch selber genäht. Bei diesem Cosplay konnte ich viele verschiedene Methoden anwenden wie Löten, LEDs einbauen, Nähen, EVA Foam und 3D gedruckte Teile verarbeiten, Designs selber erstellen und aufkleben, Weathering usw. `,
    link: "Instagram.com/syjo.cosplay",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP1.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP2.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP3.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP4.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP7.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP5.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP6.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP8.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP9.jpg`,
      `${BASE_URL}/uploads/Syjo.Cosplay_WIP10.jpg`,
  
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/Syjo.Cosplay_Tryon1.jpg`,
       `${BASE_URL}/uploads/Syjo.Cosplay_Tryon2.jpg`,
       `${BASE_URL}/uploads/Syjo.Cosplay_Tryon3.jpg`,
       `${BASE_URL}/uploads/Syjo.Cosplay_Tryon4.jpg`,
       `${BASE_URL}/uploads/Syjo.Cosplay_Tryon5.jpg`,
  

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: `${BASE_URL}/uploads/Syjo.Cosplay_BuildBook.pdf` ,
  },{
    id: 9,
    cosplayName: "SnowFoxCosplay",
    character: "Die Malerin",
    game: "Clair Obscure Expedition 33 ",
    number: 9,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/SnowFoxCosplay1.jpg`,
      `${BASE_URL}/uploads/SnowFoxCosplay2.jpg`,
      `${BASE_URL}/uploads/SnowFoxCosplay3.jpg`,
   
    ]),
    text: `Komplett selbst gemachte helmet wig, 
Alles ist aus foamclay modelliert und mit Blattgold verziert sowie mit latexmilch umrandet für mehr Effekt, Pinsel leuchtet.
Bodysuit von einem alten cosplay verwendet.
 (Nicht selbst genäht)  `,
    link: "Instagram.com/snowfoxcosplay",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/SnowFoxCosplay_WIP1.jpg`,
      `${BASE_URL}/uploads/SnowFoxCosplay_WIP2.jpg`,
      `${BASE_URL}/uploads/SnowFoxCosplay_WIP3.jpg`,
      `${BASE_URL}/uploads/SnowFoxCosplay_WIP4.jpg`,
  
    ]),
    wearingImages: JSON.stringify([    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 10,
    cosplayName: "Serinua_cosplay",
    character: "Halone",
    game: "Final Fantasy XIV",
    number: 10,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Serinua_cosplay1.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay2.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay3.jpg`,
   
    ]),
    text: `Besonders stolz bin ich auf die Stickereien, die auf dem Kleid und der Scherpe sind. Diese sind komplett von Hand gestickt (: Auch bin ich stolz auf den Paintjob: Bei allen Kanten habe ich zuerst eine Schattierung gemalt, danach noch mit einem sehr dünnen Pinsel eine schwarze Linie direkt in die Kante um es nochmehr hervorzuheben. Zusätzlich habe ich mit weisser Farbe noch die Kanten der hervorstehenden Elemente akzentuiert. (:

Dieses Cosplay hat sehr viel Zeit und Energie abverlangt, daher bin ich auf das Gesamtergebnis sehr stolz und auch darauf, dass ich nicht aufgegeben habe (:`,
    link: "Instagram.com/serinua_cosplay",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Serinua_cosplay_WIP1.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP2.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP3.jpeg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP4.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP5.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP6.jpeg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP7.jpeg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP8.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP9.jpeg`,
      `${BASE_URL}/uploads/Serinua_cosplay_WIP10.jpeg`,
    ]),
    wearingImages: JSON.stringify([
      `${BASE_URL}/uploads/Serinua_cosplay_Tryon1.jpg`,
      `${BASE_URL}/uploads/Serinua_cosplay_Tryon2.jpg`,
  

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },/* {
    id: 15,
    cosplayName: "Pinkfluffykichicorn",
    character: "Rose",
    game: "Fire Emblem Shadows",
    number: 15,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Pinkfluffykichicorn1.jpg`,
      `${BASE_URL}/uploads/Pinkfluffykichicorn2.jpg`,
   
    ]),
    text: `- Aus alten Sachen neue Cosplays hergestellt (z.b. Rock und Pullover gebraucht gekauft / alt aus dem Schrank und umgenäht, angemalt, Sachen hinzugefügt, verändert)`,
    link: "Instagram.com/pinkfluffykichicorn",
    wipImages: JSON.stringify([
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP1.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP2.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP3.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP4.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP5.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP6.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP7.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP8.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP9.jpg`,
  `${BASE_URL}/uploads/Pinkfluffykichicorn_WIP10.jpg`,
    ]),
    wearingImages: JSON.stringify([
  

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  } ,{
    id: 11,
    cosplayName: "Isell_Cosplay",
    character: "Barioth Rüstung mit den Dango Dual Blades",
    game: "Monster Hunter Rise",
    number: 11,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/isell_cosplay1.jpg`,
      `${BASE_URL}/uploads/isell_cosplay2.jpg`,
   
    ]),
    text: `ich habe das Cosplay komplett selbst gebaut (bis auf die Schuhe, die sind nur gekauft). Dabei hab ich auch alle Schnittmuster selbst gemacht. Die Rüstung besteht aus Foam, Stoff, Kunstleder und Kunstfell. Die Doppelklingen bestehen aus Holzstäben, Foam und Worbla. Angemalt hab ich das meiste mit der Airbrush, und mit Oil Wash details gemacht. den Griff der doppelklingen hab ich mit Pinsel angemalt. Die Perrücke/Kopfteil war eine Besondere Herausforderung da ich aus Kunstfell eine Perrücke genäht habe. Dabei habe ich eine Perrückenbasis gekauft und daran von Hand das Fell angenäht. Auch musste ich immer wieder sacxhen von Hand nähne, z.B. dei Naht am Blauem Band vom Headpiece`,
    link: "Instagram.com/isell_cosplay",
    wipImages: JSON.stringify([
    `${BASE_URL}/uploads/isell_cosplay_WIP1.jpg`,
    `${BASE_URL}/uploads/isell_cosplay_WIP2.jpg`,
    `${BASE_URL}/uploads/isell_cosplay_WIP3.jpg`,
    `${BASE_URL}/uploads/isell_cosplay_WIP4.jpg`,
    `${BASE_URL}/uploads/isell_cosplay_WIP5.jpg`,
    `${BASE_URL}/uploads/isell_cosplay_WIP6.jpg`,
   
      
    ]),
    wearingImages: JSON.stringify([
    `${BASE_URL}/uploads/isell_cosplay_Tryon1.jpg`,
      `${BASE_URL}/uploads/isell_cosplay_Tryon2.jpg`,

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 12,
    cosplayName: " ",
    character: " ",
    game: " ",
    number: 12,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Xenight1.jpg`,
      `${BASE_URL}/uploads/Xenight2.jpg`,
      `${BASE_URL}/uploads/Xenight3.jpg`,
      `${BASE_URL}/uploads/Xenight4.jpg`,
      `${BASE_URL}/uploads/Xenight5.jpg`,
    ]),
    text: `Ganz besonders stolz bin ich auf das Weathering und die Details beim Weathering. Auch auf Props wie den Bogen und das Walkie-Talkie bin ich stolz, insbesondere auf den Paintjob bei dem Holzteil des Bogens. Eine wichtige Info ist, dass die Basis für die Hose und das Top getriftet sind, sie sind also nicht selbstgenäht.`,
    link: "Instagram.com/i_am_not_xeni",
    wipImages: JSON.stringify([
    `${BASE_URL}/uploads/Xenight_WIP1.jpg`,
    `${BASE_URL}/uploads/Xenight_WIP2.jpg`,
    `${BASE_URL}/uploads/Xenight_WIP3.jpg`,
    `${BASE_URL}/uploads/Xenight_WIP4.jpg`,
    `${BASE_URL}/uploads/Xenight_WIP5.jpg`,
 
    ]),
    wearingImages: JSON.stringify([
    `${BASE_URL}/uploads/Xenight_Tryon1.jpg`,
    `${BASE_URL}/uploads/Xenight_Tryon2.jpg`,
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 14,
    cosplayName: "Nudelllsuppe",
    character: "Skull Taker",
    game: "Hunt Showdown 1896",
    number: 14,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Nudelllsuppe1.jpg`,
      `${BASE_URL}/uploads/Nudelllsuppe2.jpg`,
      `${BASE_URL}/uploads/Nudelllsuppe3.jpg`,
      `${BASE_URL}/uploads/Nudelllsuppe4.jpg`,
  
    ]),
    text: `Einfach gesagt an meinem Cosplay ist nicht von Grund auf selbstgemacht:
Hose, Pulli, Basis der Handschuhe und Schuhe und 2 Ledergürtel.
Diese sind aber entweder Bemalt, umgenäht oder im mindesten angepasst und geweathered.

Zudem bekomme ich von ner Freundin den Revolver und den Rabenschädel geliehen, welche sie Gebastelt hat.

Alles andere wie Maske, Schädel, Zähne, Flinte, Rucksack, Geflochtener Gürtel, Armschienen, Schulterpelz, die Details an den Gürteln etc sind Selbstgemacht aus diversen Grundmaterialien  `,
    link: "Instagram.com/nudelllsuppe",
    wipImages: JSON.stringify([
    `${BASE_URL}/uploads/Nudelllsuppe_WIP1.jpg`,
    `${BASE_URL}/uploads/Nudelllsuppe_WIP2.jpg`,
    `${BASE_URL}/uploads/Nudelllsuppe_WIP3.jpg`,
    `${BASE_URL}/uploads/Nudelllsuppe_WIP4.jpg`,
    ]),
    wearingImages: JSON.stringify([
   
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  } ,{
    id: 15,
    cosplayName: "Vididubetrayme",
    character: "Jinx",
    game: "League of Legends",
    number: 15,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Vididubetrayme1.jpg`,
      `${BASE_URL}/uploads/Vididubetrayme2.jpg`,
      `${BASE_URL}/uploads/Vididubetrayme3.jpg`,
      `${BASE_URL}/uploads/Vididubetrayme4.jpg`,
    
   
    ]),
    text: `Besonders stolz bin ich auf die ganzen Details und Props :)`,
    link: "Instagram.com/vididubetrayme",
    wipImages: JSON.stringify([
    `${BASE_URL}/uploads/Vididubetrayme_WIP1.jpg`,
    `${BASE_URL}/uploads/Vididubetrayme_WIP2.jpg`,

   
      
    ]),
    wearingImages: JSON.stringify([
    `${BASE_URL}/uploads/Vididubetrayme_Tryon1.jpg`,
    `${BASE_URL}/uploads/Vididubetrayme_Tryon2.jpg`,
    `${BASE_URL}/uploads/Vididubetrayme_Tryon3.jpg`,
    `${BASE_URL}/uploads/Vididubetrayme_Tryon4.jpg`,
   

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },
  {
    id: 13,
    cosplayName: "Lissi & Dani",
    character: "Dame Aylin & Shadowheart",
    game: "Baldurs Gate 3",
    number: 13,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/LissiDanni1.jpg`,
      `${BASE_URL}/uploads/LissiDanni2.jpg`,

  
    ]),
    text: `Lissi : Da dies mein erster Cosplay ist, bin ich stolz darauf wie originalgetreu es mir gelungen ist. Ich freue mich das fertige Cosplay endlich zeigen zu können. Stolz bin ich vor allem auf das umnähen des Bodysuits, handbemalen der filigranen blauen Muster im Kostüm und das herstellen des 3D Modells der Schuhe mit meinem Papa. Das Kostüm wurde mit dem Heißluftfön perfekt an mich angepasst. 

Comissioned: Teile der Flügel (durch mich aufgearbeitet und verändert), Wig (durch mich aufgearbeitet und geschnitten) und teile des Bodysuits (wurde als underlayer genutzt).\n Dani: Besonders stolz bin ich, dass ich mich an so ein großes Projekt herangewagt habe. Mit dem Projekt habe ich neue Techniken, wie das Airbrushen erlernt. Ich freue mich, dass sich mehrere Monate Planung und Herstellung gelohnt haben.

Comissioned: 3D-Druck der Rüstung, (aufarbeiten, kleben und airbrush by me), Wig, Undergarments `,
    link: "Instagram.com/dany_stgn",
    wipImages: JSON.stringify([
    `${BASE_URL}/uploads/LissiDanni_WIP1.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP2.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP3.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP4.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP5.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP6.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP7.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP8.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP9.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP10.jpg`,
    `${BASE_URL}/uploads/LissiDanni_WIP11.jpg`,

    ]),
    wearingImages: JSON.stringify([
    `${BASE_URL}/uploads/LissiDanni_Tryon.jpg`,
   
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },
  */


];

db.serialize(() => {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO participants
    (id, cosplayName, pronomen, number, characterImage, text1, text2, character, game, cosplayImages, wearingImages, wipImages, buildBook, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  hardcodedParticipants.forEach((p) => {
    insert.run(
      p.id, p.cosplayName, p.pronomen, p.number, p.characterImage, p.text1, p.text2, p.character, p.game,
      p.cosplayImages, p.wearingImages, p.wipImages, p.buildBook, p.link
    );
  });
  insert.finalize(() => console.log("✅ Hardcoded participants ensured in DB."));
});

// --- Auth ---
const users = [
  { username: "Pitou", password: "bertil13", role: "jury" },
  { username: "Sina", password: "123", role: "jury" },
  { username: "Sebastian", password: "123", role: "jury" },
  { username: "other", password: "", role: "jury" },
  { username: "Orga", password: "13", role: "jury" },

];

// --- Login ---
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const found = users.find(
    u => u.username === username && u.password === password
  );

  if (!found) {
    return res.status(401).json({ error: "Ungültige Anmeldedaten" });
  }

  const token = jwt.sign(
    { username: found.username, role: found.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    username: found.username,
    role: found.role
  });
});
app.post("/api/logout", (req, res) => {
  res.json({ message: "Logout erfolgreich (Token clientseitig löschen)" });
});


// --- Auth Middleware ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Nicht eingeloggt" });

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Ungültiger Token" });
  }
}

// --- Participants ---
app.get("/api/participants", (req, res) => {
  db.all("SELECT * FROM participants ORDER BY number ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(r => ({
      ...r,
      characterImages: JSON.parse(r.characterImage || "[]"),
      cosplayImages: JSON.parse(r.cosplayImages || "[]"),
      wearingImages: JSON.parse(r.wearingImages || "[]"),
      wipImages: JSON.parse(r.wipImages || "[]")
    })));
  });
});

// --- Rate ---
// --- Rate (überschreibend: Ratings + Nominierungen) ---
// --- Rate Endpoint sauber umbauen ---
// --- Rate Endpoint ---
app.post("/api/rate", authMiddleware, (req, res) => {
  const { username } = req.user;
  const { participantId, ratings, nominations } = req.body;

  if (!participantId || !ratings) {
    return res.status(400).json({ error: "participantId und ratings erforderlich" });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const stmt = db.prepare(`
      INSERT INTO ratings (username, participantId, category, criterion, score, createdAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    try {
      for (const [category, crits] of Object.entries(ratings)) {
        for (const [criterion, score] of Object.entries(crits || {})) {
          const value = typeof score === "boolean" ? (score ? 1 : 0) : score;

          stmt.run(username, participantId, category, criterion, value);
        }
      }

      stmt.finalize();

      // nominations optional
      if (Array.isArray(nominations)) {
        for (const n of nominations) {
          const { nominationType, active } = n;

          if (active) {
            db.run(
              `INSERT OR REPLACE INTO nominations (participantId, user, nominationType, createdAt)
               VALUES (?, ?, ?, datetime('now'))`,
              [participantId, username, nominationType]
            );
          }
        }
      }

      db.run("COMMIT");
      res.json({ success: true });

    } catch (err) {
      console.error(err);
      db.run("ROLLBACK");
      res.status(500).json({ error: "Speichern fehlgeschlagen" });
    }
  });
});







// --- Overview Endpoints ---
// Nach Judge
app.get("/api/overview/by-judge", (req, res) => {
  db.all(`SELECT username AS user, participantId, category, criterion, score FROM ratings ORDER BY username, participantId, category, criterion`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Alle Punkte
app.get("/api/overview/total", (req, res) => {
  db.all(`
    SELECT p.id AS participantId, p.cosplayName,
           COALESCE(SUM(CASE WHEN r.category='costume' THEN r.score ELSE 0 END), 0) AS costumeScore,
           COALESCE(SUM(CASE WHEN r.category='performance' THEN r.score ELSE 0 END), 0) AS performanceTotal,
           COALESCE(SUM(r.score), 0) AS totalScore
    FROM participants p
    LEFT JOIN ratings r ON p.id = r.participantId
    GROUP BY p.id, p.cosplayName
    ORDER BY p.number
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Top 3 Total
app.get("/api/overview/top/total", (req, res) => {
  db.all(`
    SELECT participants.id as participantId, cosplayName,
           SUM(score) as totalScore
    FROM ratings
    JOIN participants ON participants.id = ratings.participantId
    GROUP BY participantId
    ORDER BY totalScore DESC
    LIMIT 3
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Top 3 Costume
app.get("/api/overview/top/costume", (req, res) => {
  db.all(`
    SELECT participants.id as participantId, cosplayName,
           SUM(score) as totalScore
    FROM ratings
    JOIN participants ON participants.id = ratings.participantId
    WHERE category='costume'
    GROUP BY participantId
    ORDER BY totalScore DESC
    LIMIT 3
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Top 3 Performance
app.get("/api/overview/top/performance", (req, res) => {
  db.all(`
    SELECT participants.id as participantId, cosplayName,
           SUM(score) as totalScore
    FROM ratings
    JOIN participants ON participants.id = ratings.participantId
    WHERE category='performance'
    GROUP BY participantId
    ORDER BY totalScore DESC
    LIMIT 3
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// Nominierungen prüfen ob jury schon eine Stimme abgegeben hat
// Nominierungen (überschreibbar)
// ============================
// NOMINIERUNG ABSENDEN
// ============================
app.post("/api/nominate", authMiddleware, (req, res) => {
  const { username } = req.user;
  const { participantId, nominationType } = req.body;

  if (!participantId || !nominationType) {
    return res.status(400).json({ error: "participantId und nominationType erforderlich" });
  }

  db.serialize(() => {
    // Schritt 1️⃣: Prüfen, ob User in dieser Kategorie schon nominiert hat
    db.get(
      `SELECT id FROM nominations WHERE user = ? AND nominationType = ?`,
      [username, nominationType],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
          // Schritt 2️⃣: Wenn ja, vorhandene Zeile updaten statt neue erstellen
          db.run(
            `UPDATE nominations SET participantId = ?, createdAt = datetime('now')
             WHERE id = ?`,
            [participantId, row.id],
            (err2) => {
              if (err2) return res.status(500).json({ error: err2.message });
              res.json({ message: "Nominierung aktualisiert ✅" });
            }
          );
        } else {
          // Schritt 3️⃣: Wenn nicht vorhanden, neue Nominierung einfügen
          db.run(
            `INSERT INTO nominations (participantId, user, nominationType, createdAt)
             VALUES (?, ?, ?, datetime('now'))`,
            [participantId, username, nominationType],
            (err3) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json({ message: "Nominierung gespeichert ✅" });
            }
          );
        }
      }
    );
  });
});








// --- Overview Routes auslagern ---
const overviewRoutes = require("./routes/overview");
app.use("/api/overview", overviewRoutes);

// --- DEBUG ENDPOINT (nur zum Testen) ---
app.get("/api/debug/all", (req, res) => {
  db.all("SELECT * FROM ratings", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// --- Server Start ---
app.listen(PORT, () => console.log(`✅ Server läuft auf ${BASE_URL}`));

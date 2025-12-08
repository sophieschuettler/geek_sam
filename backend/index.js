// backend/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 4000;
const BASE_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// --- CORS & Middleware ---
const allowedOrigins = [
  "http://localhost:3000",              // lokal (zum Testen)
  "http://192.168.1.131:3000",          // Handy im WLAN
  "https://contest-kappa.vercel.app"    // <– HIER deine echte Vercel-URL eintragen!
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://contest-kappa.vercel.app');
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

// --- Sessions ---
const sessionFile = path.join(dbDir, "sessions.json");
let sessions = {};
if (fs.existsSync(sessionFile)) {
  try {
    sessions = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
    console.log("🔄 Alte Sessions geladen:", Object.keys(sessions).length);
  } catch (err) {
    console.error("⚠️ Fehler beim Laden der Session-Datei:", err);
  }
}
function saveSessions() {
  fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));
}

// --- Tables ---
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY,
    cosplayName TEXT,
    character TEXT,
    game TEXT,
    number INTEGER,
    characterImage TEXT,
    text TEXT,
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
    cosplayName: "Brotokolie",
    character: "Dante",
    game: "Devil May Cry 5",
    number: 1,
    characterImage: JSON.stringify([`${BASE_URL}/uploads/brotokolieRef.jpg` ]),
    text: `Es war 2021 mein erstes Cosplay, welches ich über die Jahre verbessert habe. \n Den Mantel habe ich damals auf Etsy gekauft und dann weiter bearbeitet indem ich ihn so zugerichtet habe, als ob er schon Kampfspuren erlitten hat. Jegliche Rillen und das Ende vom Mantel habe ich eingefärbt, zerschnitten oder abgeschleift, so als wäre er durch den Dreck gezogen worden und in Kämpfen war. Das gleiche habe ich mit der Hose (auf die ich noch zusätzlich Knöpfe angebracht habe), den Handschuhen, dem Shirt und den Schuhen gemacht. Die 4 Gürtel die um seine Stiefel hängen habe ich gekürzt und die Schnallen golden gefärbt. \n Die Gürtelschnalle habe ich aus Knetmasse und Foam hergestellt. \n Den Totenschädel auf dem Rücken habe ich 3d gedruckt, silbern bemalt und aufgeklebt. \n Das Schwert 3D gedruckt und bemalt. Mittlerweile habe ich das nochmal überarbeitet und größer gemacht.`,
    link: "Instagram.com/brotokolie",
    wearingImages: JSON.stringify([
      `${BASE_URL}/uploads/brotokolieTryon1.jpg`,
      `${BASE_URL}/uploads/brotokolieTryon2.jpg`,
    ]),
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Brotokolie_WIP1.jpeg`,
      `${BASE_URL}/uploads/Brotokolie_WIP2.jpeg`,
      `${BASE_URL}/uploads/Brotokolie_WIP3.jpeg`,
      `${BASE_URL}/uploads/Brotokolie_WIP4.jpg`,
      `${BASE_URL}/uploads/Brotokolie_WIP5.jpg`,
      `${BASE_URL}/uploads/Brotokolie_WIP6.jpg`,
      `${BASE_URL}/uploads/Brotokolie_WIP7.jpg`,
      `${BASE_URL}/uploads/Brotokolie_WIP8.jpg`,
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null,
  },
  {
    id: 2,
    cosplayName: "TunajCosplay",
    character: "Zani",
    game: "Wuthering Waves",
    number: 2,
     characterImage: JSON.stringify([ 
      `${BASE_URL}/uploads/TunajCosplay_Zani_Wuthering Waves_Ref1.jpg`,
       `${BASE_URL}/uploads/TunajCosplay_Zani_Wuthering Waves_Ref2.jpg`,
    ]),
    text: `Das Kostüm ist komplett selbst gemacht, auch die Schnittmuster habe ich selbst erstellt. Besonders stolz bin ich auf die Hose. Der Schnitt war etwas herausfordernd, z.B. mit den zwei Reißverschlüssen vorne. Aber ich mag die Hose und vor allem die Passform sehr. \n Ich habe neben Näharbeiten auch weitere Techniken verwendet: Foam Crafting, z.B. für die Taschenuhr und die Hörner; die Rüschen an Hose und Cape sind mit Farbverlauf eingefärbt und auf der Armbinde ist ein Symbol aus Bügelfolie (auch dieses Muster habe ich selbst erstellt und dann mit den Plotter ausgeschnitten).`,

    link: "Instagram.com/tunajcosplay/",
    wearingImages: JSON.stringify([
      `${BASE_URL}/uploads/TunajCosplay_Tryon1.jpg`,
      `${BASE_URL}/uploads/TunajCosplay_Tryon2.jpg`,
      `${BASE_URL}/uploads/TunajCosplay_Tryon3.jpg`,
      `${BASE_URL}/uploads/TunajCosplay_Tryon4.jpg`,
    ]),
    wipImages: JSON.stringify([]),
    cosplayImages: JSON.stringify([]),
    buildBook: `${BASE_URL}/uploads/tunaj_buildbook.pdf`,
  },  {
    id: 3,
    cosplayName: "KellyGreeny",
    character: "Nick Valentine",
    game: "Fallout 4",
    number: 3,
    characterImage: JSON.stringify([`${BASE_URL}/uploads/KellyGreeny.jpg`]), 
    
    text: `Die mechanische Hand und das Make-Up, sowie die versteckten Holster sind meine Lieblingsteile neben dem ikonischen Mantel. Der Mantel besteht aus zwei Secondhand Mänteln, dich ich auseinandergenommen habe und auf den Charakter angepasst sowie gewettert und mit Zierstichen versehen habe. Das Hemd ist komplett selbstgemacht. Die Hose, Schue, Gürtel, Kravatte und Hut sind zum großen Teil Seconhand oder gekauft, aber auch angepasst und gewettert. Die beiden Revolver sowie das Holotape sind 3D gedruckt, zusammengebaut, bemalt und gewettert von mir. Die mechanische Hand ist komplett selbst entworfen und gebaut aus Foam, Worbla und Holz. Der Basis Handschuh ist mein bester Handschuh bis jetzt! Zudem bringe ich meine Lieblingsrequsite mit, wo ich sogar LEDs drin verbaut habe.`,
    link: "Instagram.com/kellygreenycosplay",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/KellyGreeny_WIP1.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP2.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP3.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP4.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP5.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP6.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP7.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP8.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP9.jpg`,
      `${BASE_URL}/uploads/KellyGreeny_WIP10.jpg`,
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/KellyGreeny_Tryon1.jpg`,
       `${BASE_URL}/uploads/KellyGreeny_Tryon2.jpg`,
       `${BASE_URL}/uploads/KellyGreeny_Tryon3.jpg`,
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 4,
    cosplayName: "CosplayManie",
    character: "Oathbreaker Knight / Eidbrecher Ritter",
    game: "Baldurs Gate 3",
    number: 4,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/CosplayManie.jpg`,
      `${BASE_URL}/uploads/CosplayManie2.jpeg`,
      `${BASE_URL}/uploads/CosplayManie3.jpeg`,
      `${BASE_URL}/uploads/CosplayManie4.jpeg`,
      `${BASE_URL}/uploads/CosplayManie5.jpeg`,
    
    ]),
    text: `besonderst Stolz bin ich auf die ganzen detailreichen goldenen Schnörkeleien auf der Rüstung welche viel Zeit benötigt haben um sie so akkurat wie möglich zu bekommen. Ebenso die einzigartige Helmform war nicht ohne
Alles ist selbstgemacht, außer die Hose und das Oberteil was ich unten drunter trage sowie die Stickerei im Rock`,
    link: "Instagram.com/cosplaymanie",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/CosplayManie_WIP1.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP2.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP3.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP4.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP5.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP6.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP7.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP8.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP9.jpeg`,
      `${BASE_URL}/uploads/CosplayManie_WIP10.jpeg`,
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/CosplayManie_Tryon1.jpeg`,
       `${BASE_URL}/uploads/CosplayManie_Tryon2.jpeg`,
       `${BASE_URL}/uploads/CosplayManie_Tryon3.jpeg`,
       `${BASE_URL}/uploads/CosplayManie_Tryon4.jpeg`,
       `${BASE_URL}/uploads/CosplayManie_Tryon5.jpeg`,
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 5,
    cosplayName: "elandacosplay",
    character: "Ranni",
    game: "Elden Ring",
    number: 5,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/elandacosplay.webp`,
      `${BASE_URL}/uploads/elandacosplay1.webp`,
      `${BASE_URL}/uploads/elandacosplay2.webp`,
      `${BASE_URL}/uploads/elandacosplay3.webp`,
  
    ]),
    text: `Es ist mein erstes komplett selbstgemachtes Cosplay! Das Nähen verlief besser als gedacht und ich hab das ganze in etwa 5 Monaten gemacht. 
Da ich noch nicht lange selber nähe, hab ich die Schnittmuster bei Made by Tsuya bestellt. 
Die Wig ist ebenfalls gekauft, aber sonst selber gestyled.

Ich hab selber alle Stoffe dafür gekauft, die Schnittmuster gedruckt und zusammengeklebt und dann die Stoffe ausgeschnitten und zusammen genäht. 
Das zweite Paar Arme ist 3d gedruckt, auch dafür wurde eine von Etsy erworbene STL Datei genutzt, die allerdings für kleine Puppen gemacht ist. Diese musste ich dann hoch skalieren damit sie auch an meine Körpergröße angepasst sind. Sie wurden mit künstlichen Nägeln und Garn dann an das Original angepasst.

Die Arme werden dann an einem, aus Gurtband selbst genähten Harness befestigt und mit Angelschnur an meinen Armen.
Für meine eigenen Arme nutze ich gekaufte Handschuhe im passenden Blau-Ton, die ich dann mit neuen Fingernägeln ausgestattet habe. Und zusätzliche Risse und andere Effekte mit Farbe darauf gemalt.

Der Hut besteht aus EVA-Foam. Damit er in Form bleibt, ist eine Menge Draht darin verklebt.
Für den LED - Effekt ist eine kleine LED Leiste zwischen den Schichten verbaut. Die Schneeflocken Muster auf der untersten Schicht sind mit einer Heißklebepistole alle per Hand darauf gemacht und später wurde Farbe darüber gemacht.
Die obere Schicht von Hut ist mit Stoff überzogen.
Die Krone hab ich selber aus Draht gebogen.`,
    link: "Instagram.com/elandacosplay",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/elandacosplay_WIP1.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP2.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP3.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP4.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP5.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP6.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP7.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP8.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP9.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP10.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP11.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP12.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP13.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP14.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP15.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP16.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP17.jpg`,
      `${BASE_URL}/uploads/elandacosplay_WIP18.jpg`,
   
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/elandacosplay_Tryon.jpg`,
       `${BASE_URL}/uploads/elandacosplay_Tryon1.jpg`,
       `${BASE_URL}/uploads/elandacosplay_Tryon2.jpg`,
       `${BASE_URL}/uploads/elandacosplay_Tryon3.jpg`,
    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },{
    id: 6,
    cosplayName: "Genji Nihon",
    character: "Cassidy (ehem. McCree)",
    game: "Overwatch",
    number: 6,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Genji.Nihon1.jpg`,
      `${BASE_URL}/uploads/Genji.Nihon2.jpg`,
    ]),
    text: `Cassidy ist mein zweites Projekt, nach Genji. In ihm spiegelt sich inzwischen mein Fortschritt in den diversen Crafting-Skills wieder, seit ich vor knapp 5 Jahren angefangen habe, Cosplays zu bauen. Angefangen mit dem Entwurf der Pattern, filigranerer und sauberer Bau mit Foam, Shading und Weathering beim Lackieren, Stoffe und nähen (lange Zeit mein Endgegner!), Wig und Bart-Tuning und zuletzt auch der Einbau von LED.
Nach mehreren Verbesserungen hat Cassidy vor kurzem einen "D-Check" erhalten. Also, komplette Neulackierung, Einbau besserer LED, Detailarbeiten an der Rüstung. In ihm stecken jetzt so ziemlich alle Skills drin, die ich in den letzten Jahren aufgebaut habe.`,
    link: "Instagram.com/genji.nihon",
    wipImages: JSON.stringify([
      `${BASE_URL}/uploads/Genji.Nihon_WIP1.jpeg`,
      `${BASE_URL}/uploads/Genji.Nihon_WIP2.jpeg`,
      `${BASE_URL}/uploads/Genji.Nihon_WIP3.jpeg`,
      `${BASE_URL}/uploads/Genji.Nihon_WIP4.jpeg`,
      `${BASE_URL}/uploads/Genji.Nihon_WIP5.jpeg`,
      `${BASE_URL}/uploads/Genji.Nihon_WIP6.jpeg`,
      `${BASE_URL}/uploads/Genji.Nihon_WIP7.jpeg`,
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/Genji.Nihon_Tryon1.jpg`,
       `${BASE_URL}/uploads/Genji.Nihon_Tryon2.jpg`,
       `${BASE_URL}/uploads/Genji.Nihon_Tryon3.jpg`,
       `${BASE_URL}/uploads/Genji.Nihon_Tryon4.jpg`,

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: null ,
  },
  {
    id: 7,
    cosplayName: "Vampirfranzi",
    character: "Xal´atath",
    game: "World of Warcraft",
    number: 7,
    characterImage: JSON.stringify([
      `${BASE_URL}/uploads/Vampirfranzi1.jpg`,
      `${BASE_URL}/uploads/Vampirfranzi2.jpg`,
      `${BASE_URL}/uploads/Vampirfranzi3.jpg`,
      `${BASE_URL}/uploads/Vampirfranzi4.jpg`,
   
  
    ]),
    text: `Das Cosplay ist zu fast allen Teilen selbst gemacht, nur Basics wie Perücke oder Strumpfhosen wurden gekauft, jedoch selbst weiter verarbeitet bzw gestyled. Alle Schnittmuster sind selbst angefertigt, egal ob für Schneiderarbeiten oder Foamarbeiten. Ich habe zudem viele verschiedene Techniken genutzt, zum Beispiel 3D Modellierung, 3D Druck, Foamarbeit, Schneiderarbiet und Elektronik. Der Galaxystoff für den Umhang habe ich händisch in Procreate gezeichnet und drucken lassen, zudem ist der Umhang mit LEDs bestückt, um die Galaxy zum Leben zu erwecken. Die zwei Porps, die Xal´atath hat, das Dunkle Herz und ihre Klinge sind 3D gedruckt und selbst modelliert. Die Klinge hat zudem noch einige Foamschichten bekommen. In beiden Props befinden sich LEDs, die wie der Umhang von einem Arduino gesteuert werden. Ein Details, das ich besonders gerne mag, sind die handgeknüpften Augenbrauen, die ich mit den abgeschnittenen Perückenhaaren und einem Stück Perückennetz, das ich von einer Lacefront abgeschnitten habe, gemacht habe. 
Außerdem habe ich für meine Performance einen kleinen Magic Trick eingebaut. Das Dunkle Herz schwebt häufig in Xal´ataths Hand, deshalb habe ich einen befreundeten Magier gefragt, und wir haben es mit einem ganz einfachen und alten Trick genutzt, um das auf der Bühne möglich zu machen. `,
    link: "Instagram.com/franziska_adam",
    wipImages: JSON.stringify([
         
    ]),
    wearingImages: JSON.stringify([
       `${BASE_URL}/uploads/Vampirfranzi_Tryon1.jpg`,
       `${BASE_URL}/uploads/Vampirfranzi_Tryon2.jpg`,
       `${BASE_URL}/uploads/Vampirfranzi_Tryon3.jpg`,
       `${BASE_URL}/uploads/Vampirfranzi_Tryon4.jpg`,

    ]),
    cosplayImages: JSON.stringify([]),
    buildBook: `${BASE_URL}/uploads/Vampirfranzi_BuildBook.pdf`,
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
  } */,{
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
  } */,{
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


];

db.serialize(() => {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO participants
    (id, cosplayName, number, characterImage, text, character, game, cosplayImages, wearingImages, wipImages, buildBook, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  hardcodedParticipants.forEach((p) => {
    insert.run(
      p.id, p.cosplayName, p.number, p.characterImage, p.text, p.character, p.game,
      p.cosplayImages, p.wearingImages, p.wipImages, p.buildBook, p.link
    );
  });
  insert.finalize(() => console.log("✅ Hardcoded participants ensured in DB."));
});

// --- Auth ---
const users = [
  { username: "Nana", password: "zelda3576", role: "jury" },
  { username: "Caro", password: "key0405", role: "jury" },
  { username: "Crispy", password: "mango3110", role: "jury" },
  { username: "admin", password: "pitourino13", role: "jury" },
  { username: "Aziz", password: "pupsi2", role: "admin" },
  { username: "Kathja", password: "shego24", role: "admin" },
  { username: "Mona", password: "media7", role: "admin" },
];

// --- Login ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const found = users.find(u => u.username === username && u.password === password);
  if (!found) return res.status(401).json({ error: "Ungültige Anmeldedaten" });

  const token = Math.random().toString(36).substring(2, 12);
  sessions[token] = { username: found.username, role: found.role };
  saveSessions();
  res.json({ token, username: found.username, role: found.role });
});
app.post("/api/logout", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(400).json({ error: "Kein Token übermittelt" });
  const token = auth.split(" ")[1];
  delete sessions[token];
  saveSessions();
  res.json({ message: "Erfolgreich ausgeloggt ✅" });
});


// --- Auth Middleware ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Nicht eingeloggt" });
  const token = auth.split(" ")[1];
  const user = sessions[token];
  if (!user) return res.status(401).json({ error: "Ungültiger Token" });
  req.user = user;
  next();
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

  if (!participantId || !ratings)
    return res.status(400).json({ error: "participantId und ratings erforderlich" });

  db.serialize(() => {
    // 1️⃣ Ratings vorbereiten
    const ratingInsert = db.prepare(`
      INSERT INTO ratings (username, participantId, category, criterion, score, createdAt) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    const ratingTasks = [];
    for (const [category, crits] of Object.entries(ratings)) {
      for (const [criterion, score] of Object.entries(crits || {})) {
        const value = typeof score === "boolean" ? (score ? 1 : 0) : score;
        ratingTasks.push(new Promise((resolve, reject) => {
          db.get(
            `SELECT id FROM ratings WHERE username = ? AND participantId = ? AND category = ? AND criterion = ?`,
            [username, participantId, category, criterion],
            (err, row) => {
              if (err) return reject(err);
              if (row) {
                db.run(
                  `UPDATE ratings SET score = ?, createdAt = datetime('now') WHERE id = ?`,
                  [value, row.id],
                  err2 => err2 ? reject(err2) : resolve()
                );
              } else {
                ratingInsert.run(username, participantId, category, criterion, value, err2 =>
                  err2 ? reject(err2) : resolve()
                );
              }
            }
          );
        }));
      }
    }

    // 2️⃣ Nominierungen vorbereiten (setzen oder löschen)
    const nominationTasks = [];
    if (Array.isArray(nominations)) {
      for (const n of nominations) {
        const { nominationType, active } = n;
        nominationTasks.push(new Promise((resolve, reject) => {
          if (active) {
            db.get(
              `SELECT id FROM nominations WHERE user = ? AND participantId = ? AND nominationType = ?`,
              [username, participantId, nominationType],
              (err, row) => {
                if (err) return reject(err);
                if (!row) {
                  db.run(
                    `INSERT INTO nominations (participantId, user, nominationType, createdAt)
                     VALUES (?, ?, ?, datetime('now'))`,
                    [participantId, username, nominationType],
                    err2 => err2 ? reject(err2) : resolve()
                  );
                } else {
                  resolve();
                }
              }
            );
          } else {
            db.run(
              `DELETE FROM nominations WHERE user = ? AND participantId = ? AND nominationType = ?`,
              [username, participantId, nominationType],
              err => err ? reject(err) : resolve()
            );
          }
        }));
      }
    }

    // 3️⃣ Alles speichern
    Promise.all([...ratingTasks, ...nominationTasks])
      .then(() => res.json({ success: true }))
      .catch(err => {
        console.error("❌ Fehler beim Speichern:", err);
        res.status(500).json({ error: "Fehler beim Speichern" });
      });
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

// --- Server Start ---
app.listen(PORT, () => console.log(`✅ Server läuft auf ${BASE_URL}`));

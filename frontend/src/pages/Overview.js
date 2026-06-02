import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Collapse,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useTheme as useAppTheme } from "../context/ThemeContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export default function Overview() {
  const [totalPoints, setTotalPoints] = useState([]);
  const [topTotal, setTopTotal] = useState([]);
  const [topCostume, setTopCostume] = useState([]);
  const [topPerformance, setTopPerformance] = useState([]);
  const [byJudge, setByJudge] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [view, setView] = useState("total");
  const [judgeTab, setJudgeTab] = useState("Nana");
  const { darkMode } = useAppTheme();
  const [nominations, setNominations] = useState([]);

  const [openGroups, setOpenGroups] = useState({});
  const [openCostume, setOpenCostume] = useState({});
  const [openPerformance, setOpenPerformance] = useState({});
  const [openNominationCategories, setOpenNominationCategories] = useState({});
  // ================================
// Nach-Judge: gruppierte Bewertungen
// ================================
const groupedRatings = byJudge.reduce((acc, row) => {
  const judgeName = row.user; // aus Backend: AS user
  const key = `${judgeName}-${row.participantId}`;
  if (!acc[key]) {
    acc[key] = {
      user: judgeName,
      participantId: row.participantId,
      rows: [],
      totals: { costume: 0, performance: 0 },
    };
  }
  acc[key].rows.push(row);

  // Summierung nur, wenn Kategorie definiert
  if (row.category === "costume") acc[key].totals.costume += row.score || 0;
  if (row.category === "performance") acc[key].totals.performance += row.score || 0;

  return acc;
}, {});

const filteredGroups = Object.values(groupedRatings).filter(
  g => g.user.toLowerCase() === judgeTab.toLowerCase()
);

  

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
    typography: {
      fontSize: 14,
    },
  });

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const ensureArray = (maybeArray) => {
      if (Array.isArray(maybeArray)) return maybeArray;
      if (maybeArray && typeof maybeArray === "object") return [maybeArray];
      return [];
    };
    const API = process.env.REACT_APP_API_URL;
    const fetchAll = async () => {
      try {
        const resP = await fetch(`${API}/api/participants`);
        const dataP = await resP.json();
        setParticipants(ensureArray(dataP));

        const resTotal = await fetch(`${API}/api/overview/total`);
        const dataTotal = await resTotal.json();
        setTotalPoints(ensureArray(dataTotal));

        const resTopTotal = await fetch(`${API}/api/overview/top/total`);
        const dataTopTotal = await resTopTotal.json();
        setTopTotal(ensureArray(dataTopTotal));

        const resTopPerf = await fetch(`${API}/api/overview/top/performance`);
        const dataTopPerf = await resTopPerf.json();
        setTopPerformance(ensureArray(dataTopPerf));

        const resTopCost = await fetch(`${API}/api/overview/top/costume`);
        const dataTopCost = await resTopCost.json();
        setTopCostume(ensureArray(dataTopCost));

        const resByJudge = await fetch(`${API}/api/overview/by-judge`);
        const dataByJudge = await resByJudge.json();
        setByJudge(ensureArray(dataByJudge));

        const resN = await fetch(`${API}/api/overview/nominations`);
        const dataN = await resN.json();
        setNominations(ensureArray(dataN));



      } catch (err) {
        console.error("Fehler beim Laden der Overview-Daten:", err);
        setParticipants([]);
        setTotalPoints([]);
        setTopTotal([]);
        setTopPerformance([]);
        setTopCostume([]);
        setByJudge([]);
        setNominations([]);
      }
    };

    fetchAll();
  }, []);

  const getParticipantName = (id) => {
    const p = participants.find((p) => p.id === id);
    return p ? `${p.id}. ${p.cosplayName}` : `#${id}`;
  };

 

  const toggleGroup = (key) => setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleCostume = (key) => setOpenCostume((prev) => ({ ...prev, [key]: !prev[key] }));
  const togglePerformance = (key) =>
    setOpenPerformance((prev) => ({ ...prev, [key]: !prev[key] }));

  const renderTopList = (list, title) => (
    <div className="mt-6">
      <h3 className="font-semibold mb-2 text-lg">{title}</h3>
      <ul className="list-disc list-inside space-y-1 text-sm">
        {list.map((entry, idx) => (
          <li key={idx}>
            {getParticipantName(entry.participantId)} –{" "}
            {entry.totalScore || entry.sewingScore || entry.craftingScore || entry.performanceTotal || 0} Punkte
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <div
        className={`min-h-screen p-4 sm:p-6 transition-colors ${
           darkMode
          ? "bg-gradient-to-b from-[#9c2d50] to-[#5E689A] text-gray-100"
          : "bg-gradient-to-b from-[#ff7ea7] to-[#5E689A] text-gray-900"
        }`}
      >
        <h1
          className={`text-3xl font-bold mb-6 text-center ${
            darkMode ? "text-blue-300" : "text-blue-700"
          }`}
        >
          Bewertungsübersicht
        </h1>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={view}
            onChange={(e, newVal) => setView(newVal)}
            textColor="primary"
            indicatorColor="primary"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
          >
            <Tab label="Gesamtpunkte" value="total" />
            <Tab label="Nach Judge" value="by-judge" />
            <Tab label="Nominierungen" value="nominations" />
          </Tabs>
        </Box>

        {/* Gesamtpunkte */}
        {view === "total" && (
          <div>
            <h3 className="font-semibold mb-2 text-base sm:text-lg">Alle Punkte (nach Teilnehmer)</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border text-sm sm:text-base">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Teilnehmer</th>
                    <th className="border px-2 py-1">Gesamt</th>
                    <th className="border px-2 py-1">Kostüm</th>
                    <th className="border px-2 py-1">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {totalPoints.map((row) => (
                    <tr key={row.participantId}>
                      <td className="border px-2 py-1">{getParticipantName(row.participantId)}</td>
                      <td className="border px-2 py-1">{row.totalScore || 0}</td>
                      <td className="border px-2 py-1">{row.costumeScore || 0}</td>
                      <td className="border px-2 py-1">{row.performanceTotal || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {renderTopList(topTotal, "Top 3 Gesamt")}
            {renderTopList(topCostume, "Top 3 Kostüm")}
            {renderTopList(topPerformance, "Top 3 Performance")}
          </div>
        )}

        {/* Nominierungen */}
{/* Nominierungen */}
{view === "nominations" && (
  <div className="mt-6">
    <h3 className="font-semibold mb-4 text-xl">
      🏆 Judges Award
    </h3>

    <div className="overflow-x-auto">
      <table className="table-auto w-full border text-sm sm:text-base">
        <thead>
          <tr>
            <th className="border px-3 py-2">Platz</th>
            <th className="border px-3 py-2">Teilnehmer</th>
            <th className="border px-3 py-2">Nominierungen</th>
            <th className="border px-3 py-2">Judges</th>
          </tr>
        </thead>
        <tbody>
          {nominations.map((n, index) => (
            <tr
              key={n.participantId}
              className={
                index === 0
                  ? "bg-yellow-200 dark:bg-yellow-800 font-bold"
                  : ""
              }
            >
              <td className="border px-3 py-2">
                {index === 0
                  ? "🥇"
                  : index === 1
                  ? "🥈"
                  : index === 2
                  ? "🥉"
                  : index + 1}
              </td>

              <td className="border px-3 py-2">
                {getParticipantName(n.participantId)}
              </td>

              <td className="border px-3 py-2 text-center">
                {n.votes}
              </td>

              <td className="border px-3 py-2">
                {n.judges || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {nominations.length > 0 && (
      <div className="mt-6 p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900 border">
        <h4 className="font-bold text-lg mb-2">
          🏆 Aktueller Gewinner
        </h4>

        <p>
          {getParticipantName(nominations[0].participantId)}
        </p>

        <p className="text-sm opacity-80">
          {nominations[0].votes} Nominierungen
        </p>
      </div>
    )}
  </div>
)}






      {/* Nach Judge */}
{/* Nach Judge */}
{view === "by-judge" && (
  <div>
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
      <Tabs
        value={judgeTab}
        onChange={(e, newVal) => setJudgeTab(newVal)}
        textColor="secondary"
        indicatorColor="secondary"
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
      >
        <Tab label="Sina" value="Sina" />
        <Tab label="Sebastian" value="Sebastian" />
        <Tab label="Other" value="Other" />
      </Tabs>
    </Box>

    <div className="overflow-x-auto">
      <table className="table-auto w-full border text-sm sm:text-base">
        <thead>
          <tr>
            <th className="border px-2 py-1">Judge</th>
            <th className="border px-2 py-1">Teilnehmer</th>
            <th className="border px-2 py-1">Kategorie</th>
            <th className="border px-2 py-1">Punkte</th>
          </tr>
        </thead>
        <tbody>
  {filteredGroups.map(group => {
    const key = `${group.user}-${group.participantId}`;
    const total = group.totals.costume + group.totals.performance;

    return (
      <React.Fragment key={key}>
        {/* Erste Ebene: Gesamt */}
        <tr
          className="bg-gray-200 dark:bg-gray-800 font-bold cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          onClick={() => toggleGroup(key)}
        >
          <td className="border px-2 py-1 flex items-center gap-2">
            {openGroups[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {group.user}
          </td>
          <td className="border px-2 py-1">{getParticipantName(group.participantId)}</td>
          <td className="border px-2 py-1">Gesamt</td>
          <td className="border px-2 py-1">{total}</td>
        </tr>

        {/* Zweite Ebene: Kostüm & Performance */}
        {openGroups[key] && (
          <tr>
            <td colSpan="4" className="p-0">
              <Collapse in={openGroups[key]}>
                <div className="pl-6">
                  {/* Kostüm */}
                  <div
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 flex items-center gap-2 font-medium"
                    onClick={() => toggleCostume(key)}
                  >
                    {openCostume[key] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Kostüm: {group.totals.costume}
                  </div>
                  {openCostume[key] && (
                    <div className="pl-6">
                      {group.rows
                        .filter(r => r.category === "costume")
                        .map(r => (
                          <div key={r.criterion} className="flex justify-between px-2 py-0.5 text-sm">
                            <span>{r.criterion}</span>
                            <span>{r.score}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Performance */}
                  <div
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 flex items-center gap-2 font-medium"
                    onClick={() => togglePerformance(key)}
                  >
                    {openPerformance[key] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Performance: {group.totals.performance}
                  </div>
                  {openPerformance[key] && (
                    <div className="pl-6">
                      {group.rows
                        .filter(r => r.category === "performance")
                        .map(r => (
                          <div key={r.criterion} className="flex justify-between px-2 py-0.5 text-sm">
                            <span>{r.criterion}</span>
                            <span>{r.score}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </Collapse>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  })}
</tbody>

      </table>
    </div>
  </div>
)}

      </div>
    </ThemeProvider>
  );
}

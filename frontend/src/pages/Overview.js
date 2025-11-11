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

    const fetchAll = async () => {
      try {
        const resP = await fetch("http://localhost:4000/api/participants");
        const dataP = await resP.json();
        setParticipants(ensureArray(dataP));

        const resTotal = await fetch("http://localhost:4000/api/overview/total");
        const dataTotal = await resTotal.json();
        setTotalPoints(ensureArray(dataTotal));

        const resTopTotal = await fetch("http://localhost:4000/api/overview/top/total");
        const dataTopTotal = await resTopTotal.json();
        setTopTotal(ensureArray(dataTopTotal));

        const resTopPerf = await fetch("http://localhost:4000/api/overview/top/performance");
        const dataTopPerf = await resTopPerf.json();
        setTopPerformance(ensureArray(dataTopPerf));

        const resTopCost = await fetch("http://localhost:4000/api/overview/top/costume");
        const dataTopCost = await resTopCost.json();
        setTopCostume(ensureArray(dataTopCost));

        const resByJudge = await fetch("http://localhost:4000/api/overview/by-judge");
        const dataByJudge = await resByJudge.json();
        setByJudge(ensureArray(dataByJudge));

        const resN = await fetch("http://localhost:4000/api/overview/nominations");
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
    return p ? p.cosplayName : `#${id}`;
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
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <h1
          className={`text-3xl font-bold mb-6 text-center ${
            darkMode ? "text-green-300" : "text-green-700"
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
                      <td className="border px-2 py-1">{row.cosplayName || "-"}</td>
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
    <h3 className="font-semibold mb-2 text-lg">Nominierungen</h3>
    {["Best Sewing", "Best Craftsmanship", "Best Performance"].map((category) => {
      const items = nominations.filter((n) => n.category === category);

      const isOpen = openNominationCategories[category] || false;
      const toggleCategory = () =>
        setOpenNominationCategories((prev) => ({ ...prev, [category]: !prev[category] }));

      return (
        <div key={category} className="mb-4 border rounded-md">
          <div
            className="cursor-pointer px-3 py-2 bg-gray-200 dark:bg-gray-800 font-medium flex items-center justify-between hover:bg-gray-300 dark:hover:bg-gray-700 transition"
            onClick={toggleCategory}
          >
            <span>{category}</span>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          <Collapse in={isOpen}>
            <div className="pl-6 py-2">
              {items.length > 0 ? (
                items.map((n, idx) => {
                  const participantName = n.cosplayName || `#${n.participantId}`;
                  const votes = n.votes ?? 0;

                  const judges = n.judges ? n.judges.split(",").join(", ") : "—";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col px-2 py-0.5 border-b last:border-b-0 text-sm"
                    >
                      <div className="flex justify-between">
                        <span>{participantName}</span>
                        <span>
                          {votes} {votes !== 1 ? "Stimmen" : "Stimme"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Jury: {judges}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-1">
                  Keine Nominierungen
                </div>
              )}
            </div>
          </Collapse>
        </div>
      );
    })}
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
        <Tab label="Nana" value="Nana" />
        <Tab label="Caro" value="Caro" />
        <Tab label="Crispy" value="Crispy" />
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

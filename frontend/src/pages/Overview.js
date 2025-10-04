import React, { useEffect, useState } from "react";

export default function Overview() {
  const [totalPoints, setTotalPoints] = useState([]);
  const [topTotal, setTopTotal] = useState([]);
  const [topSewing, setTopSewing] = useState([]);
  const [topCrafting, setTopCrafting] = useState([]);
  const [topPerformance, setTopPerformance] = useState([]);
  const [byJudge, setByJudge] = useState([]);
  const [view, setView] = useState("total");

  useEffect(() => {
    fetch("http://localhost:4000/api/overview/total")
      .then((res) => res.json())
      .then(setTotalPoints);

    fetch("http://localhost:4000/api/overview/top/total")
      .then((res) => res.json())
      .then(setTopTotal);

    fetch("http://localhost:4000/api/overview/top/Sewing")
      .then((res) => res.json())
      .then(setTopSewing);

    fetch("http://localhost:4000/api/overview/top/Crafting")
      .then((res) => res.json())
      .then(setTopCrafting);

    fetch("http://localhost:4000/api/overview/top/Performance%20Total")
      .then((res) => res.json())
      .then(setTopPerformance);

    fetch("http://localhost:4000/api/overview/by-judge")
      .then((res) => res.json())
      .then(setByJudge);
  }, []);

  const renderTopList = (list, title) => (
    <div>
      <h3 className="font-semibold mt-6">{title}</h3>
      <ul className="list-disc list-inside">
        {list.map((entry, idx) => (
          <li key={idx}>
            Teilnehmer #{entry.participantId} – {entry.total || entry.totalPoints} Punkte
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bewertungsübersicht</h2>

      <div className="flex gap-4 mb-4">
        <button onClick={() => setView("total")} className="bg-green-500 text-white px-4 py-2 rounded">
          Gesamtpunkte
        </button>
        <button onClick={() => setView("by-judge")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Nach Judge
        </button>
      </div>

      {view === "total" && (
        <div>
          <h3 className="font-semibold mb-2">Alle Punkte (nach Teilnehmer)</h3>
          <table className="table-auto w-full border mb-6">
            <thead>
              <tr>
                <th className="border px-2 py-1">Teilnehmer</th>
                <th className="border px-2 py-1">Punkte</th>
              </tr>
            </thead>
            <tbody>
              {totalPoints.map((row) => (
                <tr key={row.participantId}>
                  <td className="border px-2 py-1">#{row.participantId}</td>
                  <td className="border px-2 py-1">{row.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {renderTopList(topTotal, "Top 3 Gesamt")}
          {renderTopList(topSewing, "Top 3 Sewing")}
          {renderTopList(topCrafting, "Top 3 Crafting")}
          {renderTopList(topPerformance, "Top 3 Performance")}
        </div>
      )}

      {view === "by-judge" && (
        <div>
          <h3 className="font-semibold mb-2">Einzelbewertungen (nach Judge)</h3>
          <table className="table-auto w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Judge</th>
                <th className="border px-2 py-1">Teilnehmer</th>
                <th className="border px-2 py-1">Kriterium</th>
                <th className="border px-2 py-1">Punkte</th>
              </tr>
            </thead>
            <tbody>
              {byJudge.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{row.user}</td>
                  <td className="border px-2 py-1">#{row.participantId}</td>
                  <td className="border px-2 py-1">{row.criteria}</td>
                  <td className="border px-2 py-1">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

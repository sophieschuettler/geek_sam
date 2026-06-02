// src/pages/AdminOverview.jsx
import React, { useEffect, useState } from "react";

export default function AdminOverview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/admin/overview")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        console.error(err);
        alert("Fehler beim Laden der Übersicht");
      });
  }, []);

  if (!data || data.length === 0) return <p>Lade Bewertungen...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Admin Übersicht</h2>

      {data.map((p) => (
        <div key={p.id} className="border rounded-lg p-4 mb-6 bg-white shadow">
          <div className="flex gap-4 items-start">
            <div>
              <h3 className="text-xl font-semibold mb-2">{p.cosplayName}</h3>
              <p className="text-gray-500 mb-3">{p.character} ({p.game})</p>
              {p.characterImage && (
                <img src={p.characterImage} alt={p.cosplayName} className="w-48 h-48 object-cover rounded mb-4" />
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-semibold">Bewertungen:</h4>
              <table className="min-w-full border-collapse mt-2 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Jury</th>
                    {Object.keys(p.averages).map((crit) => (
                      <th key={crit} className="border px-2 py-1">{crit}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(p.ratings).map(([user, crits]) => (
                    <tr key={user}>
                      <td className="border px-2 py-1 font-medium">{user}</td>
                      {Object.keys(p.averages).map((crit) => (
                        <td key={crit} className="border px-2 py-1 text-center">{crits[crit] ?? "-"}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="font-semibold bg-blue-50">
                    <td className="border px-2 py-1">⌀ Durchschnitt</td>
                    {Object.keys(p.averages).map((crit) => (
                      <td key={crit} className="border px-2 py-1 text-center">{p.averages[crit] ?? "-"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

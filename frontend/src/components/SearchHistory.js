import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function SearchHistory({ refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]       = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    try {
      const [hRes, sRes] = await Promise.all([
        fetch(`${API}/api/history`),
        fetch(`${API}/api/stats`),
      ]);
      const hData = await hRes.json();
      const sData = await sRes.json();
      setHistory(hData.history || []);
      setStats(sData);
    } catch (e) {
      console.error("History fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [refreshTrigger]);

  const handleClear = async () => {
    setClearing(true);
    try {
      await fetch(`${API}/api/history/clear`, { method: "DELETE" });
      setHistory([]);
      setStats(null);
      setShowConfirm(false);
    } catch (e) {
      console.error("Clear failed:", e);
    } finally {
      setClearing(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">

      {/* Header */}
      <button onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-5 py-4
                         hover:bg-slate-700/40 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">🕓</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Recent Searches</p>
            {stats && (
              <p className="text-xs text-slate-500">
                {stats.total_searches} total
                {stats.top_diseases?.[0] && ` · Top: ${stats.top_diseases[0].disease}`}
              </p>
            )}
          </div>
        </div>
        <span className="text-slate-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="border-t border-slate-700 px-5 py-4">

          {/* Top diseases */}
          {stats?.top_diseases?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Top Searched Diseases
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.top_diseases.map((d, i) => (
                  <span key={i}
                        className="text-xs bg-blue-900/40 border border-blue-700/50
                                   text-blue-300 px-3 py-1 rounded-full">
                    {d.disease}
                    <span className="ml-1 text-blue-500">×{d.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History list */}
          {loading ? (
            <p className="text-slate-500 text-sm text-center py-4">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">
              No searches yet. Make your first search above!
            </p>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
                {history.map((h) => (
                  <div key={h._id}
                       className="flex items-center justify-between
                                  bg-slate-900/60 rounded-xl px-4 py-3
                                  hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-slate-500 text-lg">🔍</span>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-300 truncate font-medium">
                          {h.symptoms}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-blue-400">{h.top_disease}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-500">{h.top_medicine}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap ml-3">
                      {formatTime(h.timestamp)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Clear history button */}
              {!showConfirm ? (
                <button onClick={() => setShowConfirm(true)}
                        className="w-full text-xs text-slate-500 hover:text-red-400
                                   border border-slate-700 hover:border-red-800
                                   py-2 rounded-xl transition-colors">
                  🗑️ Clear History
                </button>
              ) : (
                <div className="bg-red-900/20 border border-red-800
                                rounded-xl p-3 flex items-center justify-between gap-3">
                  <p className="text-red-300 text-xs">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowConfirm(false)}
                            className="text-xs px-3 py-1.5 rounded-lg
                                       bg-slate-700 text-slate-300
                                       hover:bg-slate-600 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleClear} disabled={clearing}
                            className="text-xs px-3 py-1.5 rounded-lg
                                       bg-red-700 hover:bg-red-600
                                       text-white font-bold transition-colors
                                       disabled:opacity-50">
                      {clearing ? "Clearing..." : "Yes, Clear"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

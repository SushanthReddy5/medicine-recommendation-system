import React, { useState, useEffect } from "react";
import { Clock, Trash2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function SearchHistory({ refreshTrigger }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

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
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="kaira-card bg-white border border-[#EAE8E2] rounded-none overflow-hidden mt-8">
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white hover:bg-[#FAF9F6] transition-colors text-left border-b border-[#F1F1F0]"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] flex items-center justify-center text-[#8C907E]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg text-[#111111]">
              Recent Clinical Consultations
            </h4>
            {stats && (
              <p className="text-xs text-[#8A8D83] mt-0.5">
                {stats.total_searches} total evaluations recorded
                {stats.top_diseases?.[0] && ` · Most frequent: ${stats.top_diseases[0].disease}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-[#8A8D83] font-medium hidden sm:inline">
            {open ? "Hide History" : "View History"}
          </span>
          {open ? <ChevronUp className="w-5 h-5 text-[#8A8D83]" /> : <ChevronDown className="w-5 h-5 text-[#8A8D83]" />}
        </div>
      </button>

      {/* Expanded History Body */}
      {open && (
        <div className="p-6">
          {/* Top Searched Conditions */}
          {stats?.top_diseases?.length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#F1F1F0]">
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D83] font-medium mb-3">
                Top Identified Conditions:
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.top_diseases.map((d, i) => (
                  <span
                    key={i}
                    className="text-xs uppercase tracking-wider bg-[#F8F7F4] border border-[#EAE8E2] text-[#4A4D45] px-3 py-1.5 flex items-center gap-2"
                  >
                    <span>{d.disease}</span>
                    <span className="font-semibold text-[#8C907E]">×{d.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* History List */}
          {loading ? (
            <div className="py-8 text-center text-xs uppercase tracking-wider text-[#8A8D83]">
              Loading consultation history...
            </div>
          ) : history.length === 0 ? (
            <div className="py-10 text-center text-[#8A8D83]">
              <AlertCircle className="w-8 h-8 mx-auto text-[#D3D7C9] mb-2" />
              <p className="font-serif text-base text-[#111111]">No consultation records found</p>
              <p className="text-xs mt-1">Evaluations will appear here once symptoms are analyzed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((h, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-[#F1F1F0] hover:border-[#EAE8E2] bg-[#FAF9F6] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-medium text-[#111111]">
                        {h.top_prediction || h.disease || "Symptom Analysis"}
                      </span>
                      {h.confidence && (
                        <span className="text-[10px] bg-[#8C907E]/15 text-[#8C907E] px-2 py-0.5 rounded-full font-semibold">
                          {h.confidence}%
                        </span>
                      )}
                    </div>
                    <p className="text-[#606456]">
                      <span className="text-[#8A8D83]">Symptoms: </span>
                      {Array.isArray(h.symptoms) ? h.symptoms.join(", ") : h.symptoms}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#8A8D83] flex-shrink-0">
                    {formatTime(h.timestamp || h.created_at)}
                  </span>
                </div>
              ))}

              {/* Clear History Button */}
              <div className="pt-4 flex justify-end">
                {!showConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirm(true)}
                    className="text-xs uppercase tracking-wider text-red-600 hover:text-red-700 flex items-center gap-1.5 py-1 px-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Search History</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-red-50 p-2 border border-red-200">
                    <span className="text-xs text-red-700">Confirm clearing all history?</span>
                    <button
                      type="button"
                      onClick={handleClear}
                      disabled={clearing}
                      className="text-xs bg-red-600 text-white px-3 py-1 font-medium hover:bg-red-700"
                    >
                      {clearing ? "Clearing..." : "Yes, Clear"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirm(false)}
                      className="text-xs text-[#606456] hover:text-[#111111] px-2"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

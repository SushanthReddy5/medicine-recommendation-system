import { useState, useEffect } from "react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const SEVERITY_STYLES = {
  high    : { bg: "bg-red-900/30",    border: "border-red-700",    text: "text-red-400",    badge: "bg-red-900/50 text-red-400 border-red-700",    icon: "🚨" },
  moderate: { bg: "bg-yellow-900/30", border: "border-yellow-700", text: "text-yellow-400", badge: "bg-yellow-900/50 text-yellow-400 border-yellow-700", icon: "⚠️" },
  low     : { bg: "bg-blue-900/30",   border: "border-blue-700",   text: "text-blue-400",   badge: "bg-blue-900/50 text-blue-400 border-blue-700",   icon: "ℹ️" },
};

export default function DrugInteractionChecker() {
  const [allMedicines, setAllMedicines] = useState([]);
  const [selected, setSelected]         = useState([]);
  const [input, setInput]               = useState("");
  const [suggestions, setSuggestions]   = useState([]);
  const [results, setResults]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  useEffect(() => {
    fetch(`${API}/api/interactions/medicines`)
      .then(r => r.json())
      .then(d => setAllMedicines(d.medicines || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (input.length < 2) { setSuggestions([]); return; }
    setSuggestions(
      allMedicines
        .filter(m => m.toLowerCase().includes(input.toLowerCase()) && !selected.includes(m))
        .slice(0, 6)
    );
  }, [input, allMedicines, selected]);

  const addMedicine = (med) => {
    if (med && !selected.includes(med)) {
      setSelected(prev => [...prev, med]);
    }
    setInput("");
    setSuggestions([]);
    setResults(null);
  };

  const removeMedicine = (med) => {
    setSelected(prev => prev.filter(m => m !== med));
    setResults(null);
  };

  const checkInteractions = async () => {
    if (selected.length < 2) {
      setError("Add at least 2 medicines to check.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/interactions/check`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ medicines: selected }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError("Failed to check interactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">💊</span>
        <div>
          <h2 className="text-lg font-bold text-white">Drug Interaction Checker</h2>
          <p className="text-xs text-slate-400">
            Check if your medicines are safe to take together
          </p>
        </div>
      </div>

      {/* Medicine input */}
      <div className="relative mb-4">
        <div className="min-h-[52px] flex flex-wrap gap-2 items-center
                        bg-slate-900 border border-slate-600 rounded-xl
                        px-3 py-2 focus-within:border-blue-500">
          {selected.map(med => (
            <span key={med}
                  className="flex items-center gap-1 bg-purple-700/60
                             border border-purple-600 text-white text-sm
                             px-3 py-1 rounded-full">
              {med}
              <button onClick={() => removeMedicine(med)}
                      className="ml-1 hover:text-red-300 font-bold">×</button>
            </span>
          ))}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && input.trim() && addMedicine(input.trim())}
            placeholder={selected.length === 0 ? "Type medicine name..." : "Add another..."}
            className="flex-1 min-w-[140px] bg-transparent outline-none
                       text-slate-200 placeholder-slate-500 text-sm py-1"
          />
        </div>

        {/* Autocomplete */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-slate-800
                          border border-slate-600 rounded-xl shadow-xl overflow-hidden">
            {suggestions.map(s => (
              <button key={s} onClick={() => addMedicine(s)}
                      className="w-full text-left px-4 py-2.5 text-sm
                                 text-slate-200 hover:bg-slate-700
                                 border-b border-slate-700 last:border-0">
                <span className="text-purple-400 mr-2">+</span>{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick add common medicines */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">Common medicines:</p>
        <div className="flex flex-wrap gap-2">
          {["Ibuprofen", "Paracetamol", "Aspirin", "Warfarin",
            "Metformin", "Amoxicillin", "Sertraline", "Antacid"]
            .filter(m => !selected.includes(m))
            .map(m => (
              <button key={m} onClick={() => addMedicine(m)}
                      className="text-xs px-3 py-1 rounded-full border
                                 border-slate-600 text-slate-400
                                 hover:border-purple-500 hover:text-purple-400">
                + {m}
              </button>
            ))}
        </div>
      </div>

      {/* Check button */}
      <button
        onClick={checkInteractions}
        disabled={loading || selected.length < 2}
        className="w-full bg-purple-600 hover:bg-purple-500
                   disabled:bg-slate-700 disabled:text-slate-500
                   text-white font-bold py-3 rounded-xl
                   transition-colors mb-4">
        {loading ? "Checking..." : "🔍 Check Interactions"}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl
                        p-3 text-red-300 text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {results.count === 0 ? (
            <div className="bg-green-900/30 border border-green-700
                            rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-green-400 font-bold">No interactions found</p>
                <p className="text-green-600 text-sm">
                  These medicines appear safe to take together.
                  Always confirm with your doctor.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary banner */}
              {results.has_high_risk && (
                <div className="bg-red-900/40 border border-red-600
                                rounded-xl p-3 flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  <p className="text-red-300 text-sm font-semibold">
                    High risk interaction detected! Consult your doctor immediately.
                  </p>
                </div>
              )}

              <p className="text-slate-400 text-sm">
                Found <strong className="text-white">{results.count}</strong> interaction(s):
              </p>

              {results.interactions.map((item, i) => {
                const style = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low;
                return (
                  <div key={i}
                       className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{style.icon}</span>
                        <span className="text-white font-bold text-sm">
                          {item.drug1}
                        </span>
                        <span className="text-slate-500">+</span>
                        <span className="text-white font-bold text-sm">
                          {item.drug2}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full
                                        border capitalize ${style.badge}`}>
                        {item.severity} risk
                      </span>
                    </div>
                    <p className={`text-sm ${style.text}`}>
                      {item.description}
                    </p>
                  </div>
                );
              })}

              <p className="text-xs text-slate-600 text-center mt-2">
                ⚕️ Always consult a healthcare professional before changing medications.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

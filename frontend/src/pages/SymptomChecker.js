import { useState, useEffect }        from "react";
import SymptomSelector                from "../components/SymptomSelector";
import PredictionCard                 from "../components/PredictionCard";
import SearchHistory                  from "../components/SearchHistory";
import DrugInteractionChecker         from "../components/DrugInteractionChecker";
import MedicineReminder               from "../components/MedicineReminder";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function SymptomChecker() {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [selected, setSelected]       = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [searched, setSearched]       = useState(false);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/symptoms`)
      .then(r => r.json())
      .then(d => setAllSymptoms(d.symptoms || []))
      .catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (selected.length === 0) { setError("Please add at least one symptom."); return; }
    setLoading(true); setError(null); setPredictions([]); setSearched(false);
    try {
      const res  = await fetch(`${API}/api/predict`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ symptoms: selected, top_n: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setPredictions(data.predictions);
      setSearched(true);
      setHistoryTrigger(t => t + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelected([]); setPredictions([]); setError(null); setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❤️‍🩹</span>
            <div>
              <h1 className="text-xl font-bold text-white">MediAssist</h1>
              <p className="text-xs text-slate-400">AI Medicine Recommendation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard"
               className="flex items-center gap-1 text-xs bg-slate-700
                          hover:bg-slate-600 text-slate-300 hover:text-white
                          px-3 py-2 rounded-xl transition-colors font-medium">
              📊 Dashboard
            </a>
            <span className="text-xs bg-blue-900/50 text-blue-400
                             border border-blue-700 px-3 py-2 rounded-xl">
              ML Powered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white mb-3">
            What symptoms do you have?
          </h2>
          <p className="text-slate-400 text-lg">
            Add your symptoms below and get AI-powered medicine recommendations
          </p>
        </div>

        {/* Input card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-6 relative">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Your Symptoms
            <span className="ml-2 text-xs text-slate-500 font-normal">
              (type and press Enter, or click suggestions)
            </span>
          </label>
          <SymptomSelector
            allSymptoms={allSymptoms}
            selectedSymptoms={selected}
            onChange={setSelected}
          />
          <div className="flex gap-3 mt-5">
            <button onClick={handleCheck}
                    disabled={loading || selected.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700
                               disabled:text-slate-500 text-white font-bold py-3 px-6
                               rounded-xl transition-all duration-200 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing...
                </span>
              ) : "🔍 Get Recommendations"}
            </button>
            {(selected.length > 0 || predictions.length > 0) && (
              <button onClick={handleClear}
                      className="px-5 py-3 rounded-xl border border-slate-600
                                 text-slate-400 hover:text-white hover:border-slate-500">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl
                          p-4 mb-6 text-red-300 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Results */}
        {predictions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-white">
                Top {predictions.length} Predictions
              </h3>
              <span className="text-xs text-slate-500">
                Based on: {selected.join(", ")}
              </span>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {predictions.map((p, i) => (
                <PredictionCard key={i} prediction={p} rank={i} />
              ))}
            </div>
            <div className="mt-6 bg-slate-800/40 border border-slate-700
                            rounded-xl p-4 text-center">
              <p className="text-slate-500 text-sm">
                ⚕️ <strong className="text-slate-400">Medical Disclaimer:</strong>{" "}
                For informational purposes only. Always consult a qualified
                healthcare professional before taking any medication.
              </p>
            </div>
          </div>
        )}

        {/* Empty states */}
        {searched && predictions.length === 0 && !error && (
          <div className="text-center py-12 text-slate-500 mb-8">
            <p className="text-5xl mb-4">🔎</p>
            <p className="text-lg">No recommendations found.</p>
            <p className="text-sm mt-2">Try different or more specific symptoms.</p>
          </div>
        )}
        {!searched && predictions.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-600 mb-8">
            <p className="text-6xl mb-4">🩺</p>
            <p className="text-lg">Add your symptoms above to get started</p>
          </div>
        )}

        {/* Drug Interaction Checker */}
        <div className="mb-6">
          <DrugInteractionChecker />
        </div>

        {/* Medicine Reminder */}
        <div className="mb-6">
          <MedicineReminder />
        </div>

        {/* Search History */}
        <SearchHistory refreshTrigger={historyTrigger} />

      </main>
    </div>
  );
}

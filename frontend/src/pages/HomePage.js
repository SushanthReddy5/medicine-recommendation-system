import React, { useState, useEffect } from "react";
import SymptomSelector from "../components/SymptomSelector";
import PredictionCard from "../components/PredictionCard";
import SearchHistory from "../components/SearchHistory";
import { AlertCircle } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function HomePage() {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [historyTrigger, setHistoryTrigger] = useState(0);

  useEffect(() => {
    fetch(`${API}/api/symptoms`)
      .then((r) => r.json())
      .then((d) => setAllSymptoms(d.symptoms || []))
      .catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (selected.length === 0) {
      setError("Please add at least one symptom to evaluate.");
      return;
    }
    setLoading(true);
    setError(null);
    setPredictions([]);
    setSearched(false);
    try {
      const res = await fetch(`${API}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selected, top_n: 3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed. Please check inputs.");
      setPredictions(data.predictions || []);
      setSearched(true);
      setHistoryTrigger((t) => t + 1);

      // Scroll to predictions smoothly
      setTimeout(() => {
        const resultsEl = document.getElementById("diagnostic-results");
        if (resultsEl) resultsEl.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelected([]);
    setPredictions([]);
    setError(null);
    setSearched(false);
  };

  return (
    <div className="py-16 bg-[#F8F7F4] min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
            Clinical Diagnostic Studio
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-normal">
            What symptoms are you experiencing?
          </h1>
          <p className="text-sm text-[#606456] max-w-xl mx-auto font-light leading-relaxed">
            Add your observed physical symptoms below to generate prioritized clinical assessments and recommended medications.
          </p>
        </div>

        {/* Symptom Input Container */}
        <div id="symptom-checker" className="kaira-card bg-white border border-[#EAE8E2] p-8 sm:p-10 shadow-kaira relative">
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] mb-2">
              Select or Type Observed Symptoms
            </label>
            <SymptomSelector
              allSymptoms={allSymptoms}
              selectedSymptoms={selected}
              onChange={setSelected}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#F1F1F0]">
            <button
              type="button"
              onClick={handleCheck}
              disabled={loading || selected.length === 0}
              className="w-full sm:flex-1 btn-kaira-dark text-xs !py-3.5 tracking-[0.15em]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing Clinical Evaluation...
                </span>
              ) : (
                "Evaluate Symptoms & Recommend"
              )}
            </button>

            {(selected.length > 0 || predictions.length > 0) && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto btn-kaira-outline text-xs !py-3.5 !px-6"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Diagnostic Prediction Results */}
        {predictions.length > 0 && (
          <div id="diagnostic-results" className="mt-12 space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE8E2] gap-2">
              <div>
                <h3 className="font-serif text-2xl text-[#111111]">
                  Top Clinical Assessments ({predictions.length})
                </h3>
                <p className="text-xs text-[#8A8D83] mt-0.5">
                  Evaluated from: {selected.join(", ")}
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#8C907E] font-semibold">
                Evidence-Ranked
              </span>
            </div>

            {/* Grid of Prediction Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {predictions.map((p, i) => (
                <PredictionCard key={i} prediction={p} rank={i} />
              ))}
            </div>

            {/* Medical Notice Box */}
            <div className="bg-[#FAF9F6] border border-[#EAE8E2] p-4 text-center text-xs text-[#606456]">
              <p>
                ⚕️ <strong className="text-[#111111]">Clinical Guidance:</strong> These recommendations are generated by an artificial intelligence model trained on diagnostic datasets and do not substitute for a consultation with a registered medical specialist.
              </p>
            </div>
          </div>
        )}

        {/* Empty search prompt state */}
        {searched && predictions.length === 0 && !error && (
          <div className="mt-12 text-center py-12 bg-white border border-[#EAE8E2] p-8">
            <p className="font-serif text-xl text-[#111111] mb-2">No Matching Diagnosis Found</p>
            <p className="text-xs text-[#606456]">
              Please review your symptom list or provide more specific clinical indicators.
            </p>
          </div>
        )}

        {/* Search & Consultation History */}
        <SearchHistory refreshTrigger={historyTrigger} />

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Pill, AlertTriangle, CheckCircle, Plus, X, Search, ShieldCheck } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function DrugInteractionChecker() {
  const [allMedicines, setAllMedicines] = useState([]);
  const [selected, setSelected] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/interactions/medicines`)
      .then((r) => r.json())
      .then((d) => setAllMedicines(d.medicines || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      allMedicines
        .filter((m) => m.toLowerCase().includes(input.toLowerCase()) && !selected.includes(m))
        .slice(0, 8)
    );
  }, [input, allMedicines, selected]);

  const addMedicine = (med) => {
    if (med && !selected.includes(med)) {
      setSelected((prev) => [...prev, med]);
    }
    setInput("");
    setSuggestions([]);
    setResults(null);
  };

  const removeMedicine = (med) => {
    setSelected((prev) => prev.filter((m) => m !== med));
    setResults(null);
  };

  const checkInteractions = async () => {
    if (selected.length < 2) {
      setError("Please add at least 2 medications to evaluate mutual interactions.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/interactions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: selected }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError("Failed to complete interaction check. Please verify server connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelected([]);
    setResults(null);
    setError(null);
  };

  return (
    <div className="kaira-card bg-white border border-[#EAE8E2] p-6 sm:p-10 shadow-kaira">
      {/* Intro Header */}
      <div className="flex items-start gap-4 pb-6 mb-6 border-b border-[#F1F1F0]">
        <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] flex-shrink-0">
          <Pill className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif text-2xl text-[#111111] font-normal">
            Multi-Prescription Interaction Analysis
          </h3>
          <p className="text-xs text-[#606456] mt-1 leading-relaxed">
            Select two or more pharmaceutical compounds to cross-examine potential pharmacological interactions, side effect amplifications, and contraindications.
          </p>
        </div>
      </div>

      {/* Input Field with Chips */}
      <div className="relative mb-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] mb-2">
          Selected Medications
        </label>
        <div className="min-h-[58px] flex flex-wrap gap-2 items-center bg-white border border-[#EAE8E2] focus-within:border-[#111111] px-4 py-2.5">
          <Search className="w-4 h-4 text-[#8A8D83] mr-1 flex-shrink-0" />
          {selected.map((med) => (
            <span
              key={med}
              className="inline-flex items-center gap-1.5 bg-[#8C907E] text-white text-xs font-medium uppercase tracking-wider px-3 py-1.5"
            >
              <span>{med}</span>
              <button
                type="button"
                onClick={() => removeMedicine(med)}
                className="text-white/80 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selected.length === 0
                ? "Search medicine (e.g. Aspirin, Ibuprofen, Warfarin)..."
                : "Add another medicine..."
            }
            className="flex-1 min-w-[200px] bg-transparent outline-none text-[#111111] placeholder-[#A8A59C] text-sm py-1.5"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-[#EAE8E2] shadow-kaira-dropdown max-h-60 overflow-y-auto">
            {suggestions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => addMedicine(m)}
                className="w-full text-left px-4 py-3 text-xs uppercase tracking-wider text-[#111111] hover:bg-[#F8F7F4] hover:text-[#8C907E] border-b border-[#F1F1F0] last:border-0 flex items-center justify-between"
              >
                <span>{m}</span>
                <Plus className="w-3.5 h-3.5 text-[#8A8D83]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Frequent medicine suggestions */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D83] mb-2 font-medium">
          Quick Add Common Prescriptions:
        </p>
        <div className="flex flex-wrap gap-2">
          {["Aspirin", "Ibuprofen", "Paracetamol", "Amoxicillin", "Metformin", "Omeprazole", "Atorvastatin", "Warfarin"]
            .filter((m) => !selected.includes(m))
            .map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => addMedicine(m)}
                className="text-xs uppercase tracking-wider px-3 py-1.5 border border-[#EAE8E2] bg-white text-[#606456] hover:border-[#8C907E] hover:text-[#8C907E] transition-colors"
              >
                + {m}
              </button>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#F1F1F0]">
        <button
          type="button"
          onClick={checkInteractions}
          disabled={loading || selected.length < 2}
          className="btn-kaira-dark text-xs !py-3.5 !px-8 flex-1 sm:flex-initial"
        >
          {loading ? "Checking Interactions..." : "Verify Drug Interactions"}
        </button>

        {selected.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="btn-kaira-outline text-xs !py-3.5 !px-6"
          >
            Clear List
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-8 pt-8 border-t border-[#EAE8E2] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F1F0]">
            <h4 className="font-serif text-xl text-[#111111]">
              Interaction Assessment Results
            </h4>
            <span className="text-xs uppercase tracking-wider text-[#8A8D83]">
              {selected.length} Medications Examined
            </span>
          </div>

          {results.interactions && results.interactions.length > 0 ? (
            <div className="space-y-4">
              {results.interactions.map((item, idx) => {
                const sev = (item.severity || "moderate").toLowerCase();
                const sevBadge = {
                  high: "bg-rose-50 text-rose-800 border-rose-200",
                  moderate: "bg-amber-50 text-amber-800 border-amber-200",
                  low: "bg-blue-50 text-blue-800 border-blue-200",
                }[sev] || "bg-amber-50 text-amber-800 border-amber-200";

                return (
                  <div
                    key={idx}
                    className="p-5 border border-[#EAE8E2] bg-[#FAF9F6] space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${sev === "high" ? "text-rose-600" : "text-amber-600"}`} />
                        <span className="font-serif text-base text-[#111111] font-medium">
                          {item.drug1} + {item.drug2}
                        </span>
                      </div>
                      <span className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 border rounded-full font-semibold ${sevBadge}`}>
                        {sev} Risk
                      </span>
                    </div>

                    <p className="text-xs text-[#606456] leading-relaxed">
                      {item.description || item.effect}
                    </p>

                    {item.recommendation && (
                      <div className="mt-2 pt-2 border-t border-[#EAE8E2] text-xs text-[#4A4D45]">
                        <span className="font-semibold text-[#111111]">Clinical Advice: </span>
                        {item.recommendation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-emerald-50/60 border border-emerald-200 text-emerald-900 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-serif text-base font-medium">No Known Adverse Interactions</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The selected medications ({selected.join(", ")}) do not exhibit reported direct contraindications in our interaction dataset. Still verify with your pharmacist.
                </p>
              </div>
            </div>
          )}

          {/* Clinical Disclaimer */}
          <div className="p-4 bg-[#F8F7F4] border border-[#EAE8E2] text-[11px] text-[#8A8D83] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8C907E] flex-shrink-0" />
            <span>
              Always inform your physician and pharmacist of all vitamins, herbal supplements, and over-the-counter medications you are taking concurrently.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

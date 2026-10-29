import { useState, useEffect, useRef } from "react";

export default function SymptomSelector({ allSymptoms, selectedSymptoms, onChange }) {
  const [input, setInput]           = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (input.length < 2) { setSuggestions([]); return; }
    const filtered = allSymptoms
      .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !selectedSymptoms.includes(s))
      .slice(0, 6);
    setSuggestions(filtered);
  }, [input, allSymptoms, selectedSymptoms]);

  const addSymptom = (sym) => {
    const clean = sym.trim().toLowerCase();
    if (clean && !selectedSymptoms.includes(clean)) {
      onChange([...selectedSymptoms, clean]);
    }
    setInput("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSymptom = (sym) => {
    onChange(selectedSymptoms.filter(s => s !== sym));
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      addSymptom(input.trim());
    }
    if (e.key === "Backspace" && !input && selectedSymptoms.length > 0) {
      removeSymptom(selectedSymptoms[selectedSymptoms.length - 1]);
    }
  };

  return (
    <div className="w-full relative">
      {/* Input box with chips inside */}
      <div className="min-h-[52px] w-full flex flex-wrap gap-2 items-center
                      bg-slate-800 border border-slate-600 rounded-xl px-3 py-2
                      focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        {selectedSymptoms.map(sym => (
          <span key={sym}
                className="flex items-center gap-1 bg-blue-600 text-white
                           text-sm px-3 py-1 rounded-full font-medium">
            {sym}
            <button onClick={() => removeSymptom(sym)}
                    className="ml-1 hover:text-red-300 text-lg leading-none font-bold">
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedSymptoms.length === 0 ? "Type a symptom and press Enter..." : "Add more..."}
          className="flex-1 min-w-[140px] bg-transparent outline-none
                     text-slate-200 placeholder-slate-500 text-sm py-1"
        />
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-w-xl bg-slate-800
                        border border-slate-600 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map(s => (
            <button key={s} onClick={() => addSymptom(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-200
                               hover:bg-slate-700 border-b border-slate-700 last:border-0">
              <span className="text-blue-400 mr-2">+</span>{s}
            </button>
          ))}
        </div>
      )}

      {/* Common symptom quick-add chips */}
      <div className="mt-3">
        <p className="text-xs text-slate-500 mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {["fever", "headache", "cough", "fatigue", "nausea",
            "chest pain", "dizziness", "sore throat", "body ache", "vomiting"]
            .filter(s => !selectedSymptoms.includes(s))
            .map(s => (
              <button key={s} onClick={() => addSymptom(s)}
                      className="text-xs px-3 py-1 rounded-full border border-slate-600
                                 text-slate-400 hover:border-blue-500 hover:text-blue-400">
                + {s}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

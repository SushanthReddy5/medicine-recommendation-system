import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";

export default function SymptomSelector({ allSymptoms = [], selectedSymptoms = [], onChange }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const filtered = allSymptoms
      .filter(s => s.toLowerCase().includes(input.toLowerCase()) && !selectedSymptoms.includes(s))
      .slice(0, 8);
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

  const commonSymptoms = [
    "fever", "headache", "cough", "fatigue", "nausea",
    "chest pain", "dizziness", "sore throat", "body ache", "vomiting", "shortness of breath", "chills"
  ];

  return (
    <div className="w-full relative">
      {/* Input container with chips */}
      <div className="min-h-[58px] w-full flex flex-wrap gap-2 items-center bg-white border border-[#EAE8E2] focus-within:border-[#111111] px-4 py-2.5 transition-colors duration-200">
        <Search className="w-4 h-4 text-[#8A8D83] mr-1 flex-shrink-0" />
        {selectedSymptoms.map((sym) => (
          <span
            key={sym}
            className="inline-flex items-center gap-1.5 bg-[#8C907E] text-white text-xs font-medium uppercase tracking-wider px-3 py-1.5 transition-all"
          >
            <span>{sym}</span>
            <button
              type="button"
              onClick={() => removeSymptom(sym)}
              className="text-white/80 hover:text-white p-0.5"
              aria-label={`Remove ${sym}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedSymptoms.length === 0
              ? "Type symptom (e.g. fever, headache, cough) and press Enter..."
              : "Add another symptom..."
          }
          className="flex-1 min-w-[180px] bg-transparent outline-none text-[#111111] placeholder-[#A8A59C] text-sm py-1.5 font-normal"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#EAE8E2] shadow-kaira-dropdown max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addSymptom(s)}
              className="w-full text-left px-4 py-3 text-xs uppercase tracking-wider text-[#111111] hover:bg-[#F8F7F4] hover:text-[#8C907E] border-b border-[#F1F1F0] last:border-0 flex items-center justify-between transition-colors"
            >
              <span>{s}</span>
              <Plus className="w-3.5 h-3.5 text-[#8A8D83]" />
            </button>
          ))}
        </div>
      )}

      {/* Common Symptom Quick-Add Chips */}
      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-[#8A8D83] mb-2 font-medium">
          Quick Add Frequent Symptoms:
        </p>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms
            .filter((s) => !selectedSymptoms.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSymptom(s)}
                className="text-xs uppercase tracking-wider px-3 py-1.5 border border-[#EAE8E2] bg-white text-[#606456] hover:border-[#8C907E] hover:text-[#8C907E] transition-colors"
              >
                + {s}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

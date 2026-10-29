import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, ChevronDown, ChevronUp, Pill, Info, ShieldCheck } from "lucide-react";

export default function PredictionCard({ prediction, rank = 0 }) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const { disease, medicine, confidence, description, side_effects, severity } = prediction;
  
  const sev = (severity || "mild").toLowerCase();
  
  const rankLabels = ["Top Match", "Alternative 1", "Alternative 2"];
  const rankLabel = rankLabels[rank] || `Match ${rank + 1}`;

  // Severity style mapping
  const severityBadge = {
    mild: "bg-emerald-50 text-emerald-800 border-emerald-200",
    moderate: "bg-amber-50 text-amber-800 border-amber-200",
    severe: "bg-rose-50 text-rose-800 border-rose-200",
  }[sev] || "bg-emerald-50 text-emerald-800 border-emerald-200";

  // Check for allergy warnings in user's profile
  const userAllergies = user?.allergies || "";
  const hasAllergyWarning =
    userAllergies &&
    userAllergies.toLowerCase() !== "none" &&
    userAllergies
      .toLowerCase()
      .split(/[,\s]+/)
      .some(
        (a) => a.length > 2 && medicine && medicine.toLowerCase().includes(a.toLowerCase())
      );

  return (
    <div className={`kaira-card bg-white border ${rank === 0 ? "border-[#8C907E]" : "border-[#EAE8E2]"} p-6 flex flex-col justify-between transition-all duration-300 relative`}>
      {/* Top Banner Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] px-3 py-1 ${
            rank === 0 ? "bg-[#111111] text-white" : "bg-[#F1F1F0] text-[#606456]"
          }`}>
            {rankLabel}
          </span>
          <span className={`text-[11px] font-medium uppercase tracking-[0.12em] px-2.5 py-1 border rounded-full ${severityBadge}`}>
            Severity: {sev}
          </span>
        </div>

        {/* Allergy Warning Alert */}
        {hasAllergyWarning && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold uppercase tracking-wider text-[11px]">Allergy Conflict Warning</p>
              <p className="mt-0.5">Your profile specifies an allergy matching <strong>{medicine}</strong>. Do not use without physician review.</p>
            </div>
          </div>
        )}

        {/* Disease Title */}
        <h3 className="font-serif text-2xl text-[#111111] font-normal mb-3">
          {disease}
        </h3>

        {/* Confidence Progress Meter */}
        <div className="mb-5 pb-5 border-b border-[#F1F1F0]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="uppercase tracking-[0.14em] text-[#8A8D83] font-medium text-[11px]">
              Diagnostic Confidence
            </span>
            <span className="font-serif text-base text-[#111111] font-semibold">
              {confidence}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F1F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8C907E] transition-all duration-700 ease-out"
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Recommended Prescription Block */}
        <div className="bg-[#FAF9F6] border border-[#EAE8E2] p-4 mb-4">
          <div className="flex items-center gap-2 mb-2 text-[#8C907E]">
            <Pill className="w-4 h-4" />
            <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#111111]">
              Recommended Medication
            </span>
          </div>
          <p className="font-serif text-xl text-[#111111] font-medium">
            {medicine}
          </p>
          {description && (
            <p className="text-xs text-[#606456] mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Side Effects / Precautions Expandable Details */}
      <div className="pt-2">
        {side_effects && (
          <div className="border-t border-[#F1F1F0] pt-3">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-[#606456] hover:text-[#111111] py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#8A8D83]" />
                Side Effects & Safety
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="mt-2.5 p-3 bg-amber-50/50 border border-amber-200/60 text-xs text-[#606456] leading-relaxed">
                <p className="font-medium text-amber-900 mb-1">Potential Side Effects:</p>
                <p>{side_effects}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#F1F1F0] flex items-center justify-between text-[11px] text-[#8A8D83]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C907E]" /> Verified ML Mapping
          </span>
          <span>Top {rank + 1} Recommendation</span>
        </div>
      </div>
    </div>
  );
}

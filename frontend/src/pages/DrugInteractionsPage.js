import React from "react";
import DrugInteractionChecker from "../components/DrugInteractionChecker";

export default function DrugInteractionsPage() {
  return (
    <div className="py-16 bg-[#F8F7F4] min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
            Pharmaceutical Safety
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-normal">
            Drug Interaction Checker
          </h1>
          <p className="text-sm text-[#606456] max-w-xl mx-auto font-light leading-relaxed">
            Verify medication combinations prior to ingestion to prevent contraindicated reactions and dangerous side effects.
          </p>
        </div>

        {/* Core Component */}
        <DrugInteractionChecker />

      </div>
    </div>
  );
}

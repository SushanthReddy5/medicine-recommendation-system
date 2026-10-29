import React from "react";
import HospitalLocator from "../components/HospitalLocator";

export default function HospitalsPage() {
  return (
    <div className="py-16 bg-[#F8F7F4] min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
            Emergency & Care Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-normal">
            Nearby Hospitals & Pharmacies
          </h1>
          <p className="text-sm text-[#606456] max-w-xl mx-auto font-light leading-relaxed">
            Locate verified healthcare providers, 24/7 pharmacies, and emergency rooms with real-time route calculation.
          </p>
        </div>

        {/* Core Component */}
        <HospitalLocator />

      </div>
    </div>
  );
}

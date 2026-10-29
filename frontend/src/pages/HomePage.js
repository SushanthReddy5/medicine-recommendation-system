import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SymptomSelector from "../components/SymptomSelector";
import PredictionCard from "../components/PredictionCard";
import SearchHistory from "../components/SearchHistory";
import { 
  Activity, 
  Pill, 
  Clock, 
  MapPin, 
  BarChart3, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  AlertCircle
} from "lucide-react";

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

  const scrollToChecker = () => {
    const el = document.getElementById("symptom-checker");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* 1. HERO BILLBOARD SECTION (Kaira Style) */}
      <section className="relative bg-[#F1F1F0] border-b border-[#EAE8E2] py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#EAE8E2] text-xs font-semibold uppercase tracking-[0.18em] text-[#8C907E]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Clinical AI</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#111111] leading-[1.15] font-normal">
                Evidence-Based Medicine & Symptom Recommendations
              </h1>

              <p className="text-base sm:text-lg text-[#606456] leading-relaxed max-w-2xl font-light">
                Empowering patients and clinicians with instant machine learning symptom analysis, verified drug-to-drug contraindication checks, and personalized medicine dosage scheduling.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToChecker}
                  className="btn-kaira-dark text-xs !py-3.5 !px-8 shadow-sm"
                >
                  Analyze Symptoms Now
                </button>
                <Link
                  to="/interactions"
                  className="btn-kaira-outline text-xs !py-3.5 !px-8"
                >
                  Check Drug Interactions
                </Link>
              </div>

              {/* Metric Badges */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-[#EAE8E2]/80 text-[#111111]">
                <div>
                  <p className="font-serif text-2xl lg:text-3xl font-normal">98.4%</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#8A8D83] mt-1 font-medium">Model Accuracy</p>
                </div>
                <div>
                  <p className="font-serif text-2xl lg:text-3xl font-normal">300+</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#8A8D83] mt-1 font-medium">Conditions & Meds</p>
                </div>
                <div>
                  <p className="font-serif text-2xl lg:text-3xl font-normal">Instant</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#8A8D83] mt-1 font-medium">Safety Analysis</p>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Visual Banner Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background Framed Image */}
                <div className="aspect-[4/5] bg-white border border-[#EAE8E2] p-3 shadow-kaira-hover">
                  <div className="w-full h-full relative overflow-hidden bg-[#FAF9F6]">
                    <img
                      src="/images/banner-image-1.jpg"
                      alt="Healthcare consultation"
                      className="w-full h-full object-cover object-center filter saturate-90 brightness-95"
                      onError={(e) => {
                        // Fallback graceful visual if image file not loaded
                        e.target.style.display = "none";
                      }}
                    />
                    {/* Editorial Overlay Plate */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#D3D7C9] font-medium">
                        Patient First Philosophy
                      </span>
                      <p className="font-serif text-xl sm:text-2xl mt-1 text-white font-normal">
                        Personalized Care Meets Rigorous Intelligence
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Card */}
                <div className="absolute -bottom-6 -left-6 bg-white border border-[#EAE8E2] p-4 shadow-kaira hidden sm:block max-w-[220px]">
                  <div className="flex items-center gap-2 text-[#8C907E] mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Clinical Safety</span>
                  </div>
                  <p className="text-xs text-[#606456] leading-snug">
                    Zero-compromise adverse drug collision safeguards.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FOUR FEATURES PILLARS (Kaira Features Section) */}
      <section className="py-16 bg-white border-b border-[#EAE8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#EAE8E2]">
            
            {/* Feature 1 */}
            <div className="text-center px-4 py-4 sm:py-0">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] mx-auto flex items-center justify-center text-[#8C907E] mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] uppercase tracking-wide mb-2">
                AI Diagnostic Engine
              </h4>
              <p className="text-xs text-[#606456] leading-relaxed">
                Multi-condition machine learning diagnostics matching complex symptom inputs against clinical benchmarks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center px-4 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] mx-auto flex items-center justify-center text-[#8C907E] mb-4">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] uppercase tracking-wide mb-2">
                Drug Interaction Safety
              </h4>
              <p className="text-xs text-[#606456] leading-relaxed">
                Instant cross-referencing of prescriptions to prevent adverse pharmaceutical collisions and complications.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center px-4 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] mx-auto flex items-center justify-center text-[#8C907E] mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] uppercase tracking-wide mb-2">
                Smart Dose Tracking
              </h4>
              <p className="text-xs text-[#606456] leading-relaxed">
                Personalized medication timetable with automated browser reminders ensuring optimal treatment adherence.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center px-4 pt-6 sm:pt-0">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] mx-auto flex items-center justify-center text-[#8C907E] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg text-[#111111] uppercase tracking-wide mb-2">
                Verified Care Locator
              </h4>
              <p className="text-xs text-[#606456] leading-relaxed">
                Live OpenStreetMap integration to pinpoint nearest certified hospitals, emergency facilities, and pharmacies.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE INTERACTIVE SYMPTOM CHECKER STUDIO */}
      <section id="symptom-checker" className="py-20 bg-[#F8F7F4] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center space-y-3 mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
              Clinical Assessment Studio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal">
              What symptoms are you experiencing?
            </h2>
            <p className="text-sm text-[#606456] max-w-xl mx-auto font-light">
              Add your observed physical symptoms below to generate prioritized clinical assessments and recommended medications.
            </p>
          </div>

          {/* Symptom Input Container */}
          <div className="kaira-card bg-white border border-[#EAE8E2] p-8 sm:p-10 shadow-kaira relative">
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

          {/* 4. DIAGNOSTIC PREDICTION RESULTS */}
          {predictions.length > 0 && (
            <div id="diagnostic-results" className="mt-14 space-y-6 scroll-mt-24">
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

          {/* 5. SEARCH & CONSULTATION HISTORY */}
          <SearchHistory refreshTrigger={historyTrigger} />

        </div>
      </section>

      {/* 6. QUICK SERVICE CATEGORIES (Kaira Category Showcase) */}
      <section className="py-20 bg-white border-t border-[#EAE8E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
              Integrated Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal">
              Comprehensive Health Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1 */}
            <Link
              to="/interactions"
              className="kaira-card bg-[#FAF9F6] border border-[#EAE8E2] p-6 hover:border-[#111111] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] mb-6 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <Pill className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-xl text-[#111111] mb-2">
                  Drug Interactions
                </h4>
                <p className="text-xs text-[#606456] leading-relaxed">
                  Verify multi-drug compatibility, avoid negative side effect collisions, and inspect contraindications.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:text-[#8C907E]">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Service 2 */}
            <Link
              to="/reminders"
              className="kaira-card bg-[#FAF9F6] border border-[#EAE8E2] p-6 hover:border-[#111111] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] mb-6 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-xl text-[#111111] mb-2">
                  Med Reminders
                </h4>
                <p className="text-xs text-[#606456] leading-relaxed">
                  Configure recurring daily dosage schedules with automated push notifications and adherence tracking.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:text-[#8C907E]">
                <span>Set Reminders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Service 3 */}
            <Link
              to="/hospitals"
              className="kaira-card bg-[#FAF9F6] border border-[#EAE8E2] p-6 hover:border-[#111111] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] mb-6 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-xl text-[#111111] mb-2">
                  Hospital Locator
                </h4>
                <p className="text-xs text-[#606456] leading-relaxed">
                  Locate certified medical facilities, pharmacies, and urgent care clinics within your geographic vicinity.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:text-[#8C907E]">
                <span>Find Near You</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Service 4 */}
            <Link
              to="/dashboard"
              className="kaira-card bg-[#FAF9F6] border border-[#EAE8E2] p-6 hover:border-[#111111] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-white border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] mb-6 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-xl text-[#111111] mb-2">
                  Health Analytics
                </h4>
                <p className="text-xs text-[#606456] leading-relaxed">
                  Monitor your consultation trends, symptom distribution charts, and severity breakdowns over time.
                </p>
              </div>
              <div className="pt-6 flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#111111] group-hover:text-[#8C907E]">
                <span>View Stats</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}

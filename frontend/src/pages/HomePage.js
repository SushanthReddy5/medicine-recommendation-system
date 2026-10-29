import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SymptomSelector from "../components/SymptomSelector";
import PredictionCard  from "../components/PredictionCard";
import SearchHistory   from "../components/SearchHistory";
import GradientButton  from "../ui/GradientButton";
import StatCard        from "../ui/StatCard";
import PageTransition  from "../ui/PageTransition";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const FEATURES = [
  { icon:"💊", title:"Drug Interactions",  desc:"Check if medicines are safe together",  path:"/interactions", color:"from-purple-500/20 to-purple-600/10", border:"border-purple-500/30", glow:"hover:shadow-glow-purple" },
  { icon:"⏰", title:"Med Reminders",      desc:"Never miss a dose with smart reminders", path:"/reminders",    color:"from-blue-500/20 to-blue-600/10",   border:"border-blue-500/30",   glow:"hover:shadow-glow-blue" },
  { icon:"🗺️", title:"Find Hospitals",     desc:"Locate nearby hospitals & pharmacies",  path:"/hospitals",    color:"from-cyan-500/20 to-cyan-600/10",   border:"border-cyan-500/30",   glow:"hover:shadow-glow-cyan" },
  { icon:"📊", title:"Health Dashboard",   desc:"View your analytics and trends",         path:"/dashboard",    color:"from-green-500/20 to-green-600/10", border:"border-green-500/30",  glow:"" },
];

// Floating particle
function Particle({ x, y, size, duration, delay }) {
  return (
    <motion.div
      className="absolute rounded-full bg-blue-500/10 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 60 + 20,
  duration: Math.random() * 4 + 4,
  delay: Math.random() * 2,
}));

export default function HomePage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [allSymptoms, setAllSymptoms]       = useState([]);
  const [selected, setSelected]             = useState([]);
  const [predictions, setPredictions]       = useState([]);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [searched, setSearched]             = useState(false);
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
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleClear = () => {
    setSelected([]); setPredictions([]); setError(null); setSearched(false);
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-premium overflow-hidden">

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {PARTICLES.map(p => <Particle key={p.id} {...p}/>)}
        </div>

        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative max-w-3xl mx-auto px-6 py-10">

          {/* Hero */}
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}>

            <motion.div
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
              animate={{ boxShadow: ["0 0 20px rgba(59,130,246,0.2)", "0 0 40px rgba(59,130,246,0.4)", "0 0 20px rgba(59,130,246,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}>
              <motion.span className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}/>
              <span className="text-blue-400 text-xs font-semibold tracking-wider uppercase">
                AI Powered · ML Model · Real-time Analysis
              </span>
            </motion.div>

            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              {user ? (
                <>Welcome back, <span className="gradient-text">{user.name.split(" ")[0]}</span> 👋</>
              ) : (
                <>Your Personal <span className="gradient-text">Health Assistant</span></>
              )}
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Describe your symptoms and get instant AI-powered disease predictions
              and personalized medicine recommendations
            </p>

            {/* User health badges */}
            {user && (user.blood_group || user.allergies) && (
              <motion.div className="flex items-center justify-center gap-2 mt-4 flex-wrap"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                {user.blood_group && (
                  <span className="glass px-3 py-1 rounded-full text-xs text-red-300 border border-red-500/20">
                    🩸 {user.blood_group}
                  </span>
                )}
                {user.allergies && user.allergies !== "None" && (
                  <span className="glass px-3 py-1 rounded-full text-xs text-orange-300 border border-orange-500/20">
                    ⚠️ Allergic: {user.allergies}
                  </span>
                )}
                {user.age && (
                  <span className="glass px-3 py-1 rounded-full text-xs text-blue-300 border border-blue-500/20">
                    👤 {user.age} yrs · {user.gender}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div className="grid grid-cols-4 gap-3 mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <StatCard icon="🦠" label="Diseases"  value="39+" color="blue"   delay={0.1}/>
            <StatCard icon="💊" label="Medicines" value="38+" color="purple" delay={0.2}/>
            <StatCard icon="🧠" label="Accuracy"  value="71%" color="cyan"   delay={0.3}/>
            <StatCard icon="⚡" label="Response"  value="< 1s" color="green" delay={0.4}/>
          </motion.div>

          {/* Symptom checker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 mb-6 gradient-border">

            <div className="flex items-center gap-2 mb-4">
              <motion.span className="text-2xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                🔍
              </motion.span>
              <div>
                <p className="text-white font-semibold">Symptom Analysis</p>
                <p className="text-slate-500 text-xs">Type symptoms and press Enter</p>
              </div>
            </div>

            <SymptomSelector
              allSymptoms={allSymptoms}
              selectedSymptoms={selected}
              onChange={setSelected}
            />

            <div className="flex gap-3 mt-5">
              <GradientButton
                onClick={handleCheck}
                disabled={selected.length === 0}
                loading={loading}
                className="flex-1 py-3 text-base">
                {loading ? "Analyzing..." : "🔍 Get AI Recommendations"}
              </GradientButton>
              <AnimatePresence>
                {(selected.length > 0 || predictions.length > 0) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleClear}
                    className="px-5 py-3 rounded-xl glass glass-hover
                               text-slate-400 hover:text-white transition-all">
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl
                           p-4 mb-6 text-red-300 flex items-center gap-2">
                <span>⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI scanning animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass rounded-2xl p-8 mb-6 text-center">
                <motion.div className="w-16 h-16 mx-auto mb-4 relative">
                  <motion.div className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}/>
                  <motion.div className="absolute inset-2 border-2 border-blue-500/50 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}/>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">🧠</span>
                </motion.div>
                <p className="text-blue-400 font-semibold">AI Analyzing Symptoms...</p>
                <p className="text-slate-500 text-sm mt-1">Processing with ML model</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {predictions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Predictions</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Based on: {selected.join(", ")}</p>
                  </div>
                  <motion.span
                    className="glass px-3 py-1 rounded-full text-xs text-green-400 border border-green-500/20"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}>
                    ● ML Powered
                  </motion.span>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {predictions.map((p, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}>
                      <PredictionCard prediction={p} rank={i} />
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="mt-6 glass rounded-xl p-4 text-center border border-yellow-500/10">
                  <p className="text-slate-500 text-sm">
                    ⚕️ <strong className="text-slate-400">Medical Disclaimer:</strong>{" "}
                    For informational purposes only. Always consult a qualified
                    healthcare professional before taking any medication.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!searched && predictions.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-8 text-slate-600 mb-6">
              <motion.p className="text-5xl mb-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                🩺
              </motion.p>
              <p className="text-base">Add your symptoms above to get started</p>
            </motion.div>
          )}

          {/* Feature cards */}
          <div className="mb-8">
            <motion.h3
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Platform Features
            </motion.h3>
            <div className="grid grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <motion.button key={i} onClick={() => navigate(f.path)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br ${f.color} border ${f.border}
                              rounded-2xl p-5 text-left transition-all duration-300
                              backdrop-blur-sm ${f.glow} group`}>
                  <motion.span className="text-3xl block mb-3"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}>
                    {f.icon}
                  </motion.span>
                  <p className="text-white font-semibold text-sm mb-1
                                group-hover:text-blue-300 transition-colors">
                    {f.title}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Search History */}
          <SearchHistory refreshTrigger={historyTrigger} />
        </div>
      </div>
    </PageTransition>
  );
}

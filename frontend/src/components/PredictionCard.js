import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_CONFIG = {
  mild    : { bg: "from-green-500/10 to-green-600/5",   border: "border-green-500/20", text: "text-green-400",  bar: "from-green-400 to-green-500",  badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  moderate: { bg: "from-yellow-500/10 to-yellow-600/5", border: "border-yellow-500/20",text: "text-yellow-400", bar: "from-yellow-400 to-orange-400", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"},
  severe  : { bg: "from-red-500/10 to-red-600/5",       border: "border-red-500/20",   text: "text-red-400",    bar: "from-red-400 to-red-500",       badge: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const RANK_CONFIG = [
  { label: "Best Match", border: "border-blue-500/30", glow: "shadow-glow-blue", badge: "bg-blue-600 text-white" },
  { label: "2nd Match",  border: "border-slate-600/30", glow: "",                badge: "bg-slate-700 text-slate-300" },
  { label: "3rd Match",  border: "border-slate-700/30", glow: "",                badge: "bg-slate-800 text-slate-400" },
];

export default function PredictionCard({ prediction, rank }) {
  const { user } = useAuth();
  const [showSideEffects, setShowSideEffects] = useState(false);
  const { disease, medicine, confidence, description, side_effects, severity } = prediction;
  const sev = severity?.toLowerCase() || "mild";
  const sc  = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.mild;
  const rc  = RANK_CONFIG[rank]    || RANK_CONFIG[2];

  const userAllergies = user?.allergies || "";
  const hasAllergyWarning =
    userAllergies && userAllergies.toLowerCase() !== "none" &&
    userAllergies.toLowerCase().split(/[,\s]+/).some(a =>
      a.length > 2 && medicine.toLowerCase().includes(a.toLowerCase())
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br ${sc.bg} border-2 ${hasAllergyWarning ? "border-orange-500/50" : rc.border}
                  rounded-2xl p-5 backdrop-blur-sm ${rc.glow} transition-all duration-300`}>

      {/* Rank + Severity */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${rc.badge}`}>
          {rc.label}
        </span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${sc.badge}`}>
          {sev}
        </span>
      </div>

      {/* Allergy warning */}
      <AnimatePresence>
        {hasAllergyWarning && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      className="bg-orange-500/10 border border-orange-500/30 rounded-xl
                                 p-2.5 mb-3 flex items-center gap-2">
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
              ⚠️
            </motion.span>
            <p className="text-orange-300 text-xs font-semibold">
              Possible allergy to <strong>{medicine}</strong>. Consult doctor!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disease name */}
      <h3 className="text-lg font-bold text-white mb-1">{disease}</h3>

      {/* Animated confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Confidence</span>
          <span className="font-bold text-white">{confidence}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${sc.bar}`}/>
        </div>
      </div>

      {/* Medicine */}
      <div className="glass rounded-xl p-3 mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">💊 Recommended Medicine</p>
        <p className={`font-bold text-base ${hasAllergyWarning ? "text-orange-400" : "text-blue-400"}`}>
          {medicine}
        </p>
        <p className="text-slate-300 text-sm mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Side effects toggle */}
      <motion.button
        onClick={() => setShowSideEffects(!showSideEffects)}
        className="w-full flex items-center justify-between text-xs
                   text-slate-500 hover:text-slate-300 transition-colors py-1">
        <span className="flex items-center gap-1.5">
          <span className="text-yellow-500">⚠️</span> Side Effects
        </span>
        <motion.span animate={{ rotate: showSideEffects ? 180 : 0 }}>▼</motion.span>
      </motion.button>
      <AnimatePresence>
        {showSideEffects && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-slate-400 text-sm mt-2 pt-2 border-t border-white/5">
              {side_effects}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Age warning */}
      {user?.age && parseInt(user.age) < 12 && (
        <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-2.5">
          <p className="text-yellow-300 text-xs">
            👶 Child dosage may differ. Consult a pediatrician.
          </p>
        </div>
      )}

      {/* Severe warning */}
      {sev === "severe" && (
        <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-300 text-xs">
            🚨 <strong>Severe condition.</strong> Consult a doctor immediately.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const target = parseInt(value) || 0;

  useEffect(() => {
    if (!target) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{typeof value === "string" && value.includes("+")
    ? `${display}+` : display || value}</span>;
}

export default function StatCard({ icon, label, value, sub, color = "blue", delay = 0 }) {
  const colors = {
    blue  : "from-blue-500/20 to-blue-600/10 border-blue-500/20 shadow-glow-blue",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20 shadow-glow-purple",
    cyan  : "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 shadow-glow-cyan",
    green : "from-green-500/20 to-green-600/10 border-green-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`bg-gradient-to-br ${colors[color]}
                  border rounded-2xl p-5 backdrop-blur-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
      </div>
      <p className="text-3xl font-bold text-white">
        <AnimatedNumber value={value} />
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

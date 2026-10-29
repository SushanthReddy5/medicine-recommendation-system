import { motion } from "framer-motion";

export default function GlassCard({
  children, className = "", hover = true,
  glow = false, onClick, delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      onClick={onClick}
      className={`glass rounded-2xl ${hover ? "glass-hover cursor-pointer" : ""}
                  ${glow ? "glow-blue" : ""} transition-all duration-300 ${className}`}>
      {children}
    </motion.div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";

export default function AnimatedInput({
  label, name, type = "text", value, onChange,
  placeholder, required, disabled, error, icon
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
            {icon}
          </span>
        )}
        <motion.input
          name={name} type={type} value={value}
          onChange={onChange} placeholder={placeholder}
          required={required} disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          animate={{
            borderColor: error ? "#ef4444" : focused ? "#3b82f6" : "rgba(255,255,255,0.1)",
            boxShadow  : focused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
          }}
          className={`w-full bg-white/5 border border-white/10 rounded-xl
                      px-4 py-3 text-white placeholder-slate-500 text-sm
                      transition-colors duration-200 disabled:opacity-50
                      ${icon ? "pl-11" : ""}`}
        />
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1">
          {error}
        </motion.p>
      )}
    </div>
  );
}

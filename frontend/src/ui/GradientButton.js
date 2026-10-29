import { motion } from "framer-motion";

export default function GradientButton({
  children, onClick, disabled, className = "",
  variant = "primary", type = "button", loading = false
}) {
  const variants = {
    primary : "from-blue-600 via-blue-500 to-violet-600",
    cyan    : "from-cyan-500 via-blue-500 to-blue-600",
    danger  : "from-red-600 to-red-500",
    ghost   : "from-slate-700 to-slate-600",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`relative bg-gradient-to-r ${variants[variant]}
                  text-white font-semibold rounded-xl px-5 py-3
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-glow-blue transition-all
                  duration-300 overflow-hidden ${className}`}>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </span>
      )}
      <span className={loading ? "invisible" : ""}>{children}</span>
    </motion.button>
  );
}

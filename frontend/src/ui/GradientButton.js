import React from "react";

export default function GradientButton({
  children,
  onClick,
  disabled,
  className = "",
  variant = "primary",
  type = "button",
  loading = false,
}) {
  const variantStyles = {
    primary: "btn-kaira-dark",
    sage: "btn-kaira-primary",
    outline: "btn-kaira-outline",
    danger: "bg-red-700 hover:bg-red-800 text-white font-medium uppercase tracking-[0.12em] text-xs py-3 px-6 transition-all",
    ghost: "bg-transparent hover:bg-[#F1F1F0] text-[#111111] font-medium uppercase tracking-[0.12em] text-xs py-3 px-6 transition-all",
  };

  const selectedClass = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative rounded-none uppercase tracking-[0.12em] font-medium text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${selectedClass} ${className}`}
    >
      {loading && (
        <span className="inline-block mr-2">
          <svg className="animate-spin h-4 w-4 inline" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}

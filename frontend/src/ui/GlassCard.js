import React from "react";

export default function GlassCard({
  children,
  className = "",
  hover = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`kaira-card rounded-lg p-6 ${
        hover ? "hover:-translate-y-1 hover:shadow-kaira-hover cursor-pointer" : ""
      } transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

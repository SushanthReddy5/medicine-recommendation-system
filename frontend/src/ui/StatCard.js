import React, { useEffect, useState } from "react";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const target = parseInt(value) || 0;

  useEffect(() => {
    if (!target) return;
    let start = 0;
    const duration = 1200;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {typeof value === "string" && value.includes("+")
        ? `${display}+`
        : display || value}
    </span>
  );
}

export default function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <div className="kaira-card p-6 rounded-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-[0.14em] font-medium text-[#8A8D83]">
          {label}
        </p>
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] flex items-center justify-center text-[#111111]">
            {typeof Icon === "string" ? (
              <span className="text-lg">{Icon}</span>
            ) : (
              <Icon className="w-5 h-5 text-[#8C907E]" />
            )}
          </div>
        )}
      </div>
      <p className="font-serif text-3xl md:text-4xl text-[#111111] font-normal tracking-tight">
        <AnimatedNumber value={value} />
      </p>
      {sub && (
        <p className="text-xs text-[#8A8D83] mt-2 font-medium">
          {sub}
        </p>
      )}
    </div>
  );
}

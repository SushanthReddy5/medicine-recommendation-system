import React from "react";

export default function PageTransition({ children }) {
  return (
    <div className="animate-fade-in w-full">
      {children}
    </div>
  );
}

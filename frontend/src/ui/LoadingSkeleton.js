import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white border border-[#EAE8E2] p-6 space-y-4">
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="shimmer h-3 w-1/2 rounded" />
      <div className="shimmer h-10 w-full rounded" />
      <div className="shimmer h-3 w-2/3 rounded" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`shimmer h-3 rounded ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="shimmer h-8 w-64 rounded mx-auto" />
        <div className="shimmer h-4 w-96 rounded mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer h-28 rounded" />
        ))}
      </div>
      <div className="shimmer h-64 rounded" />
    </div>
  );
}

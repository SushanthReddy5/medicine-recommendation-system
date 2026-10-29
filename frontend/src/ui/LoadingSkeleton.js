export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="shimmer h-4 w-3/4 rounded-lg"/>
      <div className="shimmer h-3 w-1/2 rounded-lg"/>
      <div className="shimmer h-8 w-full rounded-lg"/>
      <div className="shimmer h-3 w-2/3 rounded-lg"/>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`shimmer h-3 rounded-lg ${i === lines - 1 ? "w-2/3" : "w-full"}`}/>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <div className="shimmer h-10 w-1/2 rounded-xl mx-auto"/>
      <div className="shimmer h-4 w-1/3 rounded-lg mx-auto"/>
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl"/>)}
      </div>
      <div className="shimmer h-48 rounded-2xl"/>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-32 rounded-2xl"/>)}
      </div>
    </div>
  );
}

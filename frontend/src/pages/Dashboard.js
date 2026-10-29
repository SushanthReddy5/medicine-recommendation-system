import { useState, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const SEVERITY_COLORS = {
  mild    : "#22c55e",
  moderate: "#f59e0b",
  severe  : "#ef4444",
  unknown : "#64748b",
};

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/dashboard`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">📊</div>
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!stats || stats.total_searches === 0) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🩺</p>
        <p className="text-xl text-white mb-2">No data yet!</p>
        <p className="text-slate-400 mb-6">Make some searches first to see analytics.</p>
        <a href="/" className="bg-blue-600 hover:bg-blue-500 text-white
                               px-6 py-3 rounded-xl font-bold transition-colors">
          Go Search →
        </a>
      </div>
    </div>
  );

  const barData = {
    labels  : stats.top_diseases.map(d => d.disease),
    datasets: [{
      label          : "Searches",
      data           : stats.top_diseases.map(d => d.count),
      backgroundColor: ["#3b82f6","#6366f1","#8b5cf6","#a78bfa","#c4b5fd"],
      borderRadius   : 8,
    }]
  };

  const pieData = {
    labels  : stats.severity_dist.map(s => s.severity || "unknown"),
    datasets: [{
      data           : stats.severity_dist.map(s => s.count),
      backgroundColor: stats.severity_dist.map(s =>
        SEVERITY_COLORS[s.severity?.toLowerCase()] || SEVERITY_COLORS.unknown
      ),
      borderWidth: 0,
    }]
  };

  const lineData = {
    labels  : stats.daily_searches.map(d => d.date),
    datasets: [{
      label               : "Searches",
      data                : stats.daily_searches.map(d => d.count),
      borderColor         : "#3b82f6",
      backgroundColor     : "rgba(59,130,246,0.1)",
      fill                : true,
      tension             : 0.4,
      pointBackgroundColor: "#3b82f6",
    }]
  };

  const chartOptions = (title) => ({
    responsive: true,
    plugins   : {
      legend: { labels: { color: "#94a3b8" } },
      title : { display: true, text: title, color: "#e2e8f0", font: { size: 14 } },
    },
    scales: {
      x: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
      y: { ticks: { color: "#64748b" }, grid: { color: "#1e293b" } },
    },
  });

  const pieOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { color: "#94a3b8" } },
      title : { display: true, text: title, color: "#e2e8f0", font: { size: 14 } },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❤️‍🩹</span>
            <div>
              <h1 className="text-xl font-bold text-white">MediAssist</h1>
              <p className="text-xs text-slate-400">Health Analytics Dashboard</p>
            </div>
          </div>
          <a href="/" className="text-sm bg-blue-600 hover:bg-blue-500
                                  text-white px-4 py-2 rounded-xl transition-colors">
            ← Back to Search
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">📊 Health Analytics</h2>
          <p className="text-slate-400">Insights from your symptom searches</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="🔍" label="Total Searches"
            value={stats.total_searches} sub="All time" />
          <StatCard icon="🦠" label="Top Disease"
            value={stats.top_diseases[0]?.disease || "—"}
            sub={`${stats.top_diseases[0]?.count || 0} searches`} />
          <StatCard icon="💊" label="Top Medicine"
            value={stats.top_medicines[0]?.medicine || "—"}
            sub={`${stats.top_medicines[0]?.count || 0} times`} />
          <StatCard icon="🔬" label="Top Symptom"
            value={stats.top_symptoms[0]?.symptom || "—"}
            sub={`${stats.top_symptoms[0]?.count || 0} searches`} />
        </div>

        {/* Charts row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <Bar data={barData} options={chartOptions("Top Searched Diseases")} />
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <Pie data={pieData} options={pieOptions("Severity Distribution")} />
          </div>
        </div>

        {/* Line chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 mb-6">
          <Line data={lineData} options={chartOptions("Search Activity (Last 7 Days)")} />
        </div>

        {/* Top symptoms */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">🔬 Most Searched Symptoms</h3>
          <div className="space-y-3">
            {stats.top_symptoms.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-500 text-sm w-4">{i + 1}</span>
                <span className="text-slate-300 text-sm flex-1 capitalize">{s.symptom}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full"
                       style={{ width: `${(s.count / stats.total_searches) * 100}%` }}/>
                </div>
                <span className="text-slate-400 text-sm w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import StatCard from "../ui/StatCard";
import { BarChart3, Pill, Activity, AlertCircle, ArrowRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const SEVERITY_COLORS = {
  mild: "#8C907E",
  moderate: "#D4A373",
  severe: "#C86D51",
  unknown: "#A8A59C",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/dashboard`)
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#8C907E] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs uppercase tracking-widest text-[#8A8D83]">
          Loading clinical dashboard...
        </p>
      </div>
    );
  }

  if (!stats || stats.total_searches === 0) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center">
        <div className="kaira-card bg-white border border-[#EAE8E2] p-12">
          <Activity className="w-12 h-12 mx-auto text-[#8C907E] mb-4" />
          <h2 className="font-serif text-2xl text-[#111111] mb-2">No Clinical Data Recorded Yet</h2>
          <p className="text-xs text-[#606456] mb-6 leading-relaxed">
            Begin by assessing your symptoms in the Diagnostic Studio to start compiling health trend analytics.
          </p>
          <Link to="/" className="btn-kaira-dark text-xs !py-3 !px-6 inline-flex items-center gap-2">
            <span>Launch Symptom Evaluation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const barData = {
    labels: (stats.top_diseases || []).map((d) => d.disease),
    datasets: [
      {
        label: "Consultations",
        data: (stats.top_diseases || []).map((d) => d.count),
        backgroundColor: ["#8C907E", "#A3AA93", "#B9BFAB", "#CBD0C0", "#D3D7C9"],
        borderRadius: 2,
      },
    ],
  };

  const pieData = {
    labels: (stats.severity_dist || []).map((s) => s.severity || "unknown"),
    datasets: [
      {
        data: (stats.severity_dist || []).map((s) => s.count),
        backgroundColor: (stats.severity_dist || []).map(
          (s) => SEVERITY_COLORS[s.severity?.toLowerCase()] || SEVERITY_COLORS.unknown
        ),
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  const lineData = {
    labels: (stats.daily_searches || []).map((d) => d.date),
    datasets: [
      {
        label: "Daily Consultations",
        data: (stats.daily_searches || []).map((d) => d.count),
        borderColor: "#8C907E",
        backgroundColor: "rgba(140, 144, 126, 0.12)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#111111",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "#4A4D45",
          font: { family: "Jost", size: 12 },
        },
      },
      title: {
        display: true,
        text: title,
        color: "#111111",
        font: { family: "Marcellus", size: 16, weight: "normal" },
        padding: { bottom: 16 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#8A8D83", font: { family: "Jost", size: 11 } },
        grid: { color: "#F1F1F0" },
      },
      y: {
        ticks: { color: "#8A8D83", font: { family: "Jost", size: 11 } },
        grid: { color: "#F1F1F0" },
      },
    },
  });

  const pieOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#4A4D45",
          font: { family: "Jost", size: 12 },
          padding: 14,
        },
      },
      title: {
        display: true,
        text: title,
        color: "#111111",
        font: { family: "Marcellus", size: 16, weight: "normal" },
        padding: { bottom: 16 },
      },
    },
  });

  return (
    <div className="py-16 bg-[#F8F7F4] min-h-[calc(100vh-80px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
            Clinical Telemetry
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#111111] font-normal">
            Personal Health Analytics & Trends
          </h1>
          <p className="text-sm text-[#606456] max-w-xl mx-auto font-light leading-relaxed">
            Aggregate clinical intelligence compiled from your diagnostic queries and prescription evaluations.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            icon={BarChart3}
            label="Total Searches"
            value={stats.total_searches}
            sub="All-time queries"
          />
          <StatCard
            icon={Activity}
            label="Top Condition"
            value={stats.top_diseases?.[0]?.disease || "—"}
            sub={`${stats.top_diseases?.[0]?.count || 0} occurrences`}
          />
          <StatCard
            icon={Pill}
            label="Top Medicine"
            value={stats.top_medicines?.[0]?.medicine || "—"}
            sub={`${stats.top_medicines?.[0]?.count || 0} prescribed`}
          />
          <StatCard
            icon={AlertCircle}
            label="Frequent Symptom"
            value={stats.top_symptoms?.[0]?.symptom || "—"}
            sub={`${stats.top_symptoms?.[0]?.count || 0} reported`}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="kaira-card bg-white border border-[#EAE8E2] p-6 shadow-kaira">
            <Bar data={barData} options={chartOptions("Top Diagnosed Conditions")} />
          </div>
          <div className="kaira-card bg-white border border-[#EAE8E2] p-6 shadow-kaira">
            <Pie data={pieData} options={pieOptions("Diagnostic Severity Distribution")} />
          </div>
        </div>

        {/* Activity Timeline Chart */}
        <div className="kaira-card bg-white border border-[#EAE8E2] p-6 shadow-kaira">
          <Line data={lineData} options={chartOptions("Consultation Activity (Recent Timeline)")} />
        </div>

        {/* Frequent Symptoms Breakdown */}
        {stats.top_symptoms?.length > 0 && (
          <div className="kaira-card bg-white border border-[#EAE8E2] p-8 shadow-kaira">
            <h3 className="font-serif text-xl text-[#111111] mb-6">
              Most Frequently Reported Symptoms
            </h3>
            <div className="space-y-4">
              {stats.top_symptoms.slice(0, 6).map((s, idx) => {
                const pct = Math.round((s.count / stats.total_searches) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-[#111111] uppercase tracking-wider">
                        {idx + 1}. {s.symptom}
                      </span>
                      <span className="text-[#8A8D83]">
                        {s.count} times ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F1F1F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8C907E] transition-all duration-500 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

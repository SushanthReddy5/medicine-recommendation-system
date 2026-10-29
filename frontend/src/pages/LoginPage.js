import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login verification failed.");
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center px-4 py-12 relative"
      style={{
        backgroundImage: "url('/images/pattern-bg.png')",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center font-serif text-xl font-bold group-hover:bg-[#8C907E] transition-colors">
              M
            </div>
            <div className="text-left">
              <span className="font-serif text-3xl tracking-wider text-[#111111] block leading-none">
                MEDIASSIST
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8D83] block mt-1 font-medium">
                Clinical Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="kaira-card bg-white border border-[#EAE8E2] p-8 sm:p-10 shadow-kaira">
          <div className="text-center pb-6 mb-6 border-b border-[#F1F1F0]">
            <h2 className="font-serif text-2xl text-[#111111] font-normal">
              Sign In to Patient Portal
            </h2>
            <p className="text-xs text-[#606456] mt-1">
              Access your clinical assessments and prescription schedule
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="patient@healthcare.com"
                  required
                  className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-3 text-sm text-[#111111] placeholder-[#A8A59C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#8C907E] hover:text-[#111111] underline tracking-wide"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-3 text-sm text-[#111111] placeholder-[#A8A59C]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-kaira-dark text-xs !py-3.5 tracking-[0.15em] flex items-center justify-center gap-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Account Link */}
          <div className="mt-8 pt-6 border-t border-[#F1F1F0] text-center">
            <p className="text-xs text-[#606456]">
              New to MediAssist platform?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#111111] hover:text-[#8C907E] underline uppercase tracking-wider text-[11px] ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center text-[11px] text-[#8A8D83] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8C907E]" />
          <span>Encrypted Patient Privacy Protected</span>
        </div>

      </div>
    </div>
  );
}

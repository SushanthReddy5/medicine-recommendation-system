import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset request failed.");
      setSuccess(true);
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
              Password Recovery
            </h2>
            <p className="text-xs text-[#606456] mt-1">
              Enter your registered email address to receive reset instructions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-[#8C907E] mx-auto" />
              <h3 className="font-serif text-xl text-[#111111]">Instructions Dispatched</h3>
              <p className="text-xs text-[#606456] leading-relaxed">
                If an account exists matching <strong className="text-[#111111]">{email}</strong>, a secure reset link has been dispatched to your inbox.
              </p>
              <div className="pt-4">
                <Link to="/login" className="btn-kaira-dark text-xs !py-3 !px-6 inline-block">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@healthcare.com"
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
                <span>{loading ? "Sending..." : "Send Reset Instructions"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-[#8C907E] hover:text-[#111111] underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed.");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
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
              Reset Your Password
            </h2>
            <p className="text-xs text-[#606456] mt-1">
              Create a new secure password for your account
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
              <h3 className="font-serif text-xl text-[#111111]">Password Reset Complete</h3>
              <p className="text-xs text-[#606456]">
                Redirecting you to the sign-in portal momentarily...
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-kaira-dark text-xs !py-3 !px-6 inline-block">
                  Sign In Immediately
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full btn-kaira-dark text-xs !py-3.5 tracking-[0.15em] flex items-center justify-center gap-2"
                >
                  <span>{loading ? "Updating Password..." : "Save New Password"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

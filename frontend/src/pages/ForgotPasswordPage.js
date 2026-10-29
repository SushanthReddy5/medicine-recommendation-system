import { useState } from "react";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/forgot-password`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col items-center justify-center px-4"
         style={{ backgroundImage: "url('/images/heart-bg.jpg')" }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-0"></div>
      <div className="w-full max-w-md z-10 relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">❤️‍🩹</span>
          <h1 className="text-3xl font-bold text-white mt-3">MediAssist</h1>
          <p className="text-slate-400 mt-1">Reset your password</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8">

          {success ? (
            <div className="text-center">
              <span className="text-5xl block mb-4">📧</span>
              <h2 className="text-xl font-bold text-white mb-3">Check your inbox!</h2>
              <p className="text-slate-400 text-sm mb-6">
                We sent a password reset link to{" "}
                <strong className="text-white">{email}</strong>.
                The link expires in 1 hour.
              </p>
              <p className="text-slate-500 text-xs mb-6">
                Didn't receive it? Check your spam folder.
              </p>
              <Link to="/login"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl
                                p-3 mb-5 text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                    Email Address
                  </label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full bg-slate-900 border border-slate-600
                               rounded-xl px-4 py-3 text-white placeholder-slate-500
                               text-sm outline-none focus:border-blue-500 transition-colors"/>
                </div>

                <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500
                                   disabled:bg-slate-700 disabled:text-slate-500
                                   text-white font-bold py-3 rounded-xl
                                   transition-colors">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

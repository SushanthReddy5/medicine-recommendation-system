import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function ResetPasswordPage() {
  const navigate                    = useNavigate();
  const [searchParams]              = useSearchParams();
  const token                       = searchParams.get("token");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");
  const [showPass, setShowPass]     = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }

    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/reset-password`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed.");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];

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
          <p className="text-slate-400 mt-1">Set a new password</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8">

          {success ? (
            <div className="text-center">
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-xl font-bold text-white mb-3">
                Password Reset Successfully!
              </h2>
              <p className="text-slate-400 text-sm mb-2">
                Your password has been updated.
              </p>
              <p className="text-slate-500 text-xs mb-6">
                Redirecting to login in 3 seconds...
              </p>
              <Link to="/login"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Set New Password</h2>
              <p className="text-slate-400 text-sm mb-6">
                Choose a strong password for your account.
              </p>

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl
                                p-3 mb-5 text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters" required
                      className="w-full bg-slate-900 border border-slate-600
                                 rounded-xl px-4 py-3 text-white placeholder-slate-500
                                 text-sm outline-none focus:border-blue-500 pr-12"/>
                    <button type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-3 text-slate-500
                                       hover:text-white text-sm">
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map(i => (
                          <div key={i}
                               className={`flex-1 h-1.5 rounded-full transition-all
                                           ${strength >= i ? strengthColor[strength] : "bg-slate-700"}`}/>
                        ))}
                      </div>
                      <p className={`text-xs ${
                        strength === 1 ? "text-red-400" :
                        strength === 2 ? "text-yellow-400" : "text-green-400"
                      }`}>
                        {strengthLabel[strength]} password
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password" value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password" required
                    className={`w-full bg-slate-900 border rounded-xl px-4 py-3
                               text-white placeholder-slate-500 text-sm outline-none
                               transition-colors
                               ${confirm && confirm !== password
                                 ? "border-red-500 focus:border-red-500"
                                 : "border-slate-600 focus:border-blue-500"}`}/>
                  {confirm && confirm !== password && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                  {confirm && confirm === password && password.length >= 6 && (
                    <p className="text-green-400 text-xs mt-1">✅ Passwords match</p>
                  )}
                </div>

                <button type="submit" disabled={loading || !token}
                        className="w-full bg-blue-600 hover:bg-blue-500
                                   disabled:bg-slate-700 disabled:text-slate-500
                                   text-white font-bold py-3 rounded-xl
                                   transition-colors mt-2">
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-6">
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  ← Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import GradientButton from "../ui/GradientButton";
import AnimatedInput  from "../ui/AnimatedInput";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function LoginPage() {
  const navigate        = useNavigate();
  const { login }       = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      login(data.token, data.user);
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-premium flex items-center justify-center px-4 relative overflow-hidden">

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"/>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"/>

      {/* Floating elements */}
      {["💊", "🧬", "❤️‍🩹", "🔬", "🩺"].map((emoji, i) => (
        <motion.span key={i}
          className="absolute text-2xl opacity-10 pointer-events-none select-none"
          style={{ left: `${10 + i * 20}%`, top: `${20 + (i % 2) * 40}%` }}
          animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}>
          {emoji}
        </motion.span>
      ))}

      <motion.div className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4 inline-block">❤️‍🩹</motion.div>
          <h1 className="text-3xl font-bold text-white">MediAssist</h1>
          <p className="text-slate-400 mt-1">Your AI Healthcare Assistant</p>
        </div>

        {/* Card */}
        <motion.div className="glass rounded-2xl p-8 gradient-border"
          whileHover={{ boxShadow: "0 0 40px rgba(59,130,246,0.15)" }}>

          <h2 className="text-xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your health dashboard</p>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl
                                   p-3 mb-5 text-red-300 text-sm flex items-center gap-2">
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput label="Email Address" name="email" type="email"
                           value={form.email} onChange={handleChange}
                           placeholder="you@example.com" required icon="📧"/>
            <AnimatedInput label="Password" name="password" type="password"
                           value={form.password} onChange={handleChange}
                           placeholder="••••••••" required icon="🔒"/>

            <div className="flex justify-end">
              <Link to="/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <GradientButton type="submit" loading={loading} className="w-full py-3 text-base">
              Sign In to MediAssist
            </GradientButton>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"/>
            </div>
            <div className="relative flex justify-center">
              <span className="glass px-3 text-xs text-slate-500">New to MediAssist?</span>
            </div>
          </div>

          <Link to="/register">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        className="w-full text-center py-3 rounded-xl border border-white/10
                                   text-slate-300 hover:text-white hover:border-blue-500/30
                                   transition-all duration-200 text-sm font-medium glass-hover">
              Create Free Account →
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

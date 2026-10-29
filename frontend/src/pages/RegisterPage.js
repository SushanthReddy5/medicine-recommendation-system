import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS      = ["Male", "Female", "Other", "Prefer not to say"];

export default function RegisterPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [step, setStep]       = useState(1);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    name: "", email: "", password: "", confirmPassword: "",
    age: "", gender: "", blood_group: "",
    allergies: "", phone: "", emergency_contact: "",
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = e => {
    e.preventDefault(); setError("");
    if (!form.name.trim())  { setError("Name is required."); return; }
    if (!form.email.trim()) { setError("Email is required."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/api/auth/register`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message); setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col items-center justify-center px-4 py-10"
         style={{ backgroundImage: "url('/images/heart-bg.jpg')" }}>
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-0"></div>
      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <span className="text-5xl">❤️‍🩹</span>
          <h1 className="text-3xl font-bold text-white mt-3">MediAssist</h1>
          <p className="text-slate-400 mt-1">Create your health profile</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 1 ? "bg-blue-600" : "bg-slate-700"}`}/>
          <div className={`flex-1 h-1.5 rounded-full transition-all ${step >= 2 ? "bg-blue-600" : "bg-slate-700"}`}/>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 mb-5 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-6">Step 1 — Account Details</h2>
              {[
                { name: "name",            label: "Full Name *",        type: "text",     placeholder: "Sushanth Reddy" },
                { name: "email",           label: "Email Address *",    type: "email",    placeholder: "you@example.com" },
                { name: "password",        label: "Password *",         type: "password", placeholder: "Min 6 characters" },
                { name: "confirmPassword", label: "Confirm Password *", type: "password", placeholder: "Repeat password" },
              ].map(f => (
                <div key={f.name}>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">{f.label}</label>
                  <input name={f.name} type={f.type} value={form[f.name]}
                         onChange={handleChange} placeholder={f.placeholder} required
                         className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                    px-4 py-3 text-white placeholder-slate-500 text-sm
                                    outline-none focus:border-blue-500 transition-colors"/>
                </div>
              ))}
              <button type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white
                                 font-bold py-3 rounded-xl transition-colors mt-2">
                Next →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-1">Step 2 — Health Profile</h2>
              <p className="text-xs text-slate-500 mb-4">
                Helps us give safer, personalized recommendations
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Age</label>
                  <input name="age" type="number" value={form.age}
                         onChange={handleChange} placeholder="25" min="1" max="120"
                         className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                    px-4 py-3 text-white placeholder-slate-500 text-sm
                                    outline-none focus:border-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                     px-4 py-3 text-white text-sm outline-none focus:border-blue-500">
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Blood Group</label>
                  <select name="blood_group" value={form.blood_group} onChange={handleChange}
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                     px-4 py-3 text-white text-sm outline-none focus:border-blue-500">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                         placeholder="+91 9999999999"
                         className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                    px-4 py-3 text-white placeholder-slate-500 text-sm
                                    outline-none focus:border-blue-500"/>
                </div>
              </div>

              {/* Allergies with None button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400 font-medium">Known Allergies</label>
                  <button type="button"
                          onClick={() => setForm({ ...form, allergies: "None" })}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors
                                      ${form.allergies === "None"
                                        ? "bg-green-600 border-green-500 text-white"
                                        : "bg-slate-800 border-slate-600 text-slate-400 hover:border-green-500 hover:text-green-400"}`}>
                    ✓ None
                  </button>
                </div>
                <input name="allergies" value={form.allergies} onChange={handleChange}
                       placeholder="e.g. Penicillin, Aspirin, Peanuts"
                       className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                  px-4 py-3 text-white placeholder-slate-500 text-sm
                                  outline-none focus:border-blue-500"/>
                <p className="text-xs text-slate-600 mt-1">
                  Click "None" if you have no known allergies
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Emergency Contact</label>
                <input name="emergency_contact" value={form.emergency_contact}
                       onChange={handleChange} placeholder="Name & phone number"
                       className="w-full bg-slate-900 border border-slate-600 rounded-xl
                                  px-4 py-3 text-white placeholder-slate-500 text-sm
                                  outline-none focus:border-blue-500"/>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white
                                   font-bold py-3 rounded-xl transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500
                                   disabled:bg-slate-700 disabled:text-slate-500
                                   text-white font-bold py-3 rounded-xl transition-colors">
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

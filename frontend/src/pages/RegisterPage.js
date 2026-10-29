import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Lock, Mail, User, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    blood_group: "",
    allergies: "",
    phone: "",
    emergency_contact: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please provide a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setStep(1);
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
      <div className="w-full max-w-lg relative z-10">
        
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
              Register Patient Account
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 border ${
                step === 1 ? "bg-[#111111] text-white border-[#111111]" : "bg-[#F1F1F0] text-[#8A8D83] border-[#EAE8E2]"
              }`}>
                Step 1: Account
              </span>
              <span className="text-xs text-[#8A8D83]">→</span>
              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 border ${
                step === 2 ? "bg-[#111111] text-white border-[#111111]" : "bg-[#F1F1F0] text-[#8A8D83] border-[#EAE8E2]"
              }`}>
                Step 2: Medical Profile
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    required
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A8D83] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] pl-11 pr-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-kaira-dark text-xs !py-3.5 tracking-[0.15em] flex items-center justify-center gap-2"
                >
                  <span>Continue to Health Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="30"
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                    Biological Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111]"
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                    Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={form.blood_group}
                    onChange={handleChange}
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111]"
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0100"
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  Known Allergies (Helps Prevent Adverse Drug Collisions)
                </label>
                <input
                  name="allergies"
                  type="text"
                  value={form.allergies}
                  onChange={handleChange}
                  placeholder="e.g. Penicillin, Aspirin, Sulfa (or None)"
                  className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-2">
                  Emergency Contact
                </label>
                <input
                  name="emergency_contact"
                  type="text"
                  value={form.emergency_contact}
                  onChange={handleChange}
                  placeholder="Name and contact number"
                  className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-kaira-outline text-xs !py-3.5 !px-5 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-kaira-dark text-xs !py-3.5 tracking-[0.15em] flex items-center justify-center gap-2"
                >
                  <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#F1F1F0] text-center">
            <p className="text-xs text-[#606456]">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#111111] hover:text-[#8C907E] underline uppercase tracking-wider text-[11px] ml-1"
              >
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

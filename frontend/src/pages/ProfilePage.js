import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const API          = process.env.REACT_APP_API_URL || "http://localhost:5001";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS      = ["Male", "Female", "Other", "Prefer not to say"];

const AVATAR_EMOJIS = [
  "👨‍⚕️","👩‍⚕️","🧑‍⚕️","👨","👩","🧑","👦","👧",
  "👴","👵","🧓","👨‍💼","👩‍💼","🧑‍💼","🦸","🦸‍♀️",
];

export default function ProfilePage() {
  const { token, updateUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { setProfile(d); setForm(d); })
      .catch(() => setError("Failed to load profile."));
  }, [token]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle photo upload — convert to base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, avatar: reader.result }));
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  // Pick emoji avatar
  const handleEmojiPick = (emoji) => {
    setForm(f => ({ ...f, avatar: emoji, avatar_type: "emoji" }));
    setShowAvatarPicker(false);
  };

  const handleSave = async () => {
    setLoading(true); setError(""); setSuccess(false);
    try {
      const res  = await fetch(`${API}/api/auth/profile`, {
        method : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body   : JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(form);
      updateUser(form);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"/>
    </div>
  );

  const avatarValue = form.avatar || profile.avatar || "";
  const isEmoji     = avatarValue && !avatarValue.startsWith("data:");
  const isPhoto     = avatarValue && avatarValue.startsWith("data:");
  const initials    = profile.name?.charAt(0).toUpperCase() || "U";

  const INFO_FIELDS = [
    { key: "name",              label: "Full Name",         type: "text",   placeholder: "Your name",          span: 1 },
    { key: "email",             label: "Email",             type: "email",  placeholder: "your@email.com",     span: 1, disabled: true },
    { key: "age",               label: "Age",               type: "number", placeholder: "25",                 span: 1 },
    { key: "phone",             label: "Phone",             type: "text",   placeholder: "+91 9999999999",     span: 1 },
    { key: "emergency_contact", label: "Emergency Contact", type: "text",   placeholder: "Name & number",      span: 2 },
    { key: "allergies",         label: "Known Allergies",   type: "text",   placeholder: "e.g. Penicillin (or None)", span: 2 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <span>My Profile</span>
          </h2>
          <p className="text-slate-400 mt-1">Manage your personal health information</p>
        </div>
        {!editing ? (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white
                       font-bold px-5 py-2.5 rounded-xl shadow-glow-blue
                       flex items-center gap-2">
            <span>✏️</span> Edit
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { setEditing(false); setForm(profile); }}
              className="glass text-slate-300 font-bold px-4 py-2.5 rounded-xl
                         hover:bg-white/10 transition-colors">
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave} disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white
                         font-bold px-4 py-2.5 rounded-xl disabled:opacity-50
                         flex items-center gap-2">
              {loading ? (
                <motion.span animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"/>
              ) : "💾"} Save
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Success / Error */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-500/10 border border-green-500/30 rounded-xl
                                 p-3 mb-5 text-green-300 text-sm flex items-center gap-2">
            ✅ Profile updated successfully!
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl
                                 p-3 mb-5 text-red-300 text-sm flex items-center gap-2">
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-5 mb-6 flex items-center gap-5">

        {/* Avatar display */}
        <div className="relative">
          <motion.div whileHover={editing ? { scale: 1.05 } : {}}
                      onClick={() => editing && setShowAvatarPicker(true)}
                      className={`w-20 h-20 rounded-full flex items-center justify-center
                                  overflow-hidden flex-shrink-0 border-2 border-blue-500/30
                                  shadow-glow-blue
                                  ${editing ? "cursor-pointer" : ""}`}>
            {isPhoto ? (
              <img src={avatarValue} alt="avatar"
                   className="w-full h-full object-cover"/>
            ) : isEmoji ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30
                              flex items-center justify-center text-4xl">
                {avatarValue}
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600
                              flex items-center justify-center text-3xl font-bold text-white">
                {initials}
              </div>
            )}
          </motion.div>

          {editing && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        onClick={() => setShowAvatarPicker(true)}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600
                                   rounded-full flex items-center justify-center
                                   cursor-pointer text-white text-xs shadow-glow-blue
                                   border-2 border-slate-900">
              ✏️
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-xl">{profile.name}</p>
          <p className="text-slate-400 text-sm">{profile.email}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {profile.blood_group && (
              <span className="text-xs glass px-2.5 py-1 rounded-full text-red-300 border border-red-500/20">
                🩸 {profile.blood_group}
              </span>
            )}
            {profile.gender && (
              <span className="text-xs glass px-2.5 py-1 rounded-full text-slate-300 border border-white/10">
                {profile.gender}
              </span>
            )}
            {profile.age && (
              <span className="text-xs glass px-2.5 py-1 rounded-full text-blue-300 border border-blue-500/20">
                {profile.age} yrs
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Avatar picker modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center px-4"
                      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                      onClick={() => setShowAvatarPicker(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                        className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10">
              <h3 className="text-white font-bold mb-4 text-center">Choose Profile Picture</h3>

              {/* Upload photo */}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => fileRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600
                           text-white font-semibold py-3 rounded-xl mb-4
                           flex items-center justify-center gap-2">
                📷 Upload Photo
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*"
                     onChange={handlePhotoUpload} className="hidden"/>

              <p className="text-slate-500 text-xs text-center mb-3">— or choose an avatar —</p>

              {/* Emoji grid */}
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_EMOJIS.map((emoji, i) => (
                  <motion.button key={i}
                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => handleEmojiPick(emoji)}
                    className={`text-2xl p-1.5 rounded-xl transition-all
                                ${form.avatar === emoji
                                  ? "bg-blue-600/40 border border-blue-500/50"
                                  : "hover:bg-white/10"}`}>
                    {emoji}
                  </motion.button>
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => setShowAvatarPicker(false)}
                className="w-full mt-4 glass text-slate-400 py-2 rounded-xl
                           hover:text-white transition-colors text-sm">
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info fields */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl p-6 mb-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="text-blue-400">👤</span> Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {INFO_FIELDS.map(f => (
            <div key={f.key} className={f.span === 2 ? "col-span-2" : ""}>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium uppercase tracking-wider">
                {f.label}
              </label>
              {editing && !f.disabled ? (
                <input name={f.key} type={f.type} value={form[f.key] || ""}
                       onChange={handleChange} placeholder={f.placeholder}
                       className="w-full glass border border-white/10 rounded-xl px-4 py-2.5
                                  text-white placeholder-slate-500 text-sm outline-none
                                  focus:border-blue-500/50 transition-colors"/>
              ) : (
                <p className={`text-sm py-2.5 px-1 ${profile[f.key] ? "text-white" : "text-slate-600 italic"}`}>
                  {profile[f.key] || "Not provided"}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Health details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="text-red-400">🩺</span> Health Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block font-medium uppercase tracking-wider">
              Gender
            </label>
            {editing ? (
              <select name="gender" value={form.gender || ""} onChange={handleChange}
                      className="w-full glass border border-white/10 rounded-xl px-4 py-2.5
                                 text-white text-sm outline-none focus:border-blue-500/50">
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            ) : (
              <p className={`text-sm py-2.5 ${profile.gender ? "text-white" : "text-slate-600 italic"}`}>
                {profile.gender || "Not provided"}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block font-medium uppercase tracking-wider">
              Blood Group
            </label>
            {editing ? (
              <select name="blood_group" value={form.blood_group || ""} onChange={handleChange}
                      className="w-full glass border border-white/10 rounded-xl px-4 py-2.5
                                 text-white text-sm outline-none focus:border-blue-500/50">
                <option value="">Select</option>
                {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            ) : (
              <p className={`text-sm py-2.5 ${profile.blood_group ? "text-white" : "text-slate-600 italic"}`}>
                {profile.blood_group || "Not provided"}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

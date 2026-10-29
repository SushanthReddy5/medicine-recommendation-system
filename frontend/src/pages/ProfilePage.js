import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Edit3, Save, X, Camera, ShieldAlert, CheckCircle2 } from "lucide-react";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const AVATAR_EMOJIS = [
  "👨‍⚕️", "👩‍⚕️", "🧑‍⚕️", "👨", "👩", "🧑", "👦", "👧",
  "👴", "👵", "🧓", "👨‍💼", "👩‍💼", "🧑‍💼", "🦸", "🦸‍♀️",
];

export default function ProfilePage() {
  const { token, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setForm(d);
      })
      .catch(() => setError("Failed to load clinical profile."));
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar photo must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, avatar: reader.result }));
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEmojiPick = (emoji) => {
    setForm((f) => ({ ...f, avatar: emoji, avatar_type: "emoji" }));
    setShowAvatarPicker(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      setProfile(form);
      updateUser(form);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#8C907E] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-wider text-[#8A8D83]">
          Loading patient health records...
        </p>
      </div>
    );
  }

  const avatarValue = form.avatar || profile.avatar || "";
  const isEmoji = avatarValue && !avatarValue.startsWith("data:");
  const isPhoto = avatarValue && avatarValue.startsWith("data:");
  const initials = profile.name?.charAt(0).toUpperCase() || "U";

  const INFO_FIELDS = [
    { key: "name", label: "Full Name", type: "text", placeholder: "Your name", span: 1 },
    { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com", span: 1, disabled: true },
    { key: "age", label: "Age", type: "number", placeholder: "28", span: 1 },
    { key: "phone", label: "Contact Phone", type: "text", placeholder: "+1 (555) 000-0000", span: 1 },
    { key: "emergency_contact", label: "Emergency Contact", type: "text", placeholder: "Name & Phone Number", span: 2 },
    { key: "allergies", label: "Known Medical Allergies", type: "text", placeholder: "e.g. Penicillin, Sulfa, Aspirin (or None)", span: 2 },
  ];

  return (
    <div className="py-16 bg-[#F8F7F4] min-h-[calc(100vh-80px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header with Edit/Save actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EAE8E2] gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C907E] block">
              Patient Record
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#111111] font-normal">
              Medical & Personal Profile
            </h1>
          </div>

          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="btn-kaira-dark text-xs !py-2.5 !px-6 flex items-center gap-2 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(profile);
                }}
                className="btn-kaira-outline text-xs !py-2.5 !px-5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="btn-kaira-primary text-xs !py-2.5 !px-6 flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success / Error feedback */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Profile and health information updated successfully.</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Identity & Avatar Card */}
        <div className="kaira-card bg-white border border-[#EAE8E2] p-8 shadow-kaira flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div
              onClick={() => editing && setShowAvatarPicker(true)}
              className={`w-24 h-24 rounded-full border-2 border-[#EAE8E2] flex items-center justify-center overflow-hidden bg-[#FAF9F6] text-[#111111] ${
                editing ? "cursor-pointer hover:border-[#8C907E]" : ""
              }`}
            >
              {isPhoto ? (
                <img src={avatarValue} alt="avatar" className="w-full h-full object-cover" />
              ) : isEmoji ? (
                <span className="text-4xl">{avatarValue}</span>
              ) : (
                <span className="font-serif text-3xl font-bold text-[#8C907E]">{initials}</span>
              )}
            </div>

            {editing && (
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-md hover:bg-[#8C907E] transition-colors"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-serif text-2xl text-[#111111] font-normal">{profile.name}</h3>
            <p className="text-xs text-[#8A8D83]">{profile.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
              {profile.blood_group && (
                <span className="text-[11px] uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-800 px-2.5 py-0.5">
                  Blood Group: {profile.blood_group}
                </span>
              )}
              {profile.gender && (
                <span className="text-[11px] uppercase tracking-wider bg-[#F1F1F0] border border-[#EAE8E2] text-[#606456] px-2.5 py-0.5">
                  {profile.gender}
                </span>
              )}
              {profile.age && (
                <span className="text-[11px] uppercase tracking-wider bg-[#F1F1F0] border border-[#EAE8E2] text-[#606456] px-2.5 py-0.5">
                  Age: {profile.age}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#EAE8E2] p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F1F0]">
                <h4 className="font-serif text-lg text-[#111111]">Choose Patient Avatar</h4>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-[#8A8D83] hover:text-[#111111]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full btn-kaira-dark text-xs !py-3 flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Custom Photo</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="text-center text-[11px] uppercase tracking-wider text-[#8A8D83] my-2">
                — Or Select Medical Avatar —
              </div>

              <div className="grid grid-cols-4 gap-2">
                {AVATAR_EMOJIS.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleEmojiPick(emoji)}
                    className="p-3 text-2xl rounded hover:bg-[#FAF9F6] border border-transparent hover:border-[#EAE8E2] transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Personal Details Form Section */}
        <div className="kaira-card bg-white border border-[#EAE8E2] p-8 shadow-kaira space-y-6">
          <h4 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#F1F1F0]">
            General Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {INFO_FIELDS.map((f) => (
              <div key={f.key} className={f.span === 2 ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] mb-2">
                  {f.label}
                </label>
                {editing && !f.disabled ? (
                  <input
                    name={f.key}
                    type={f.type}
                    value={form[f.key] || ""}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-[#FAF9F6] border border-[#F1F1F0] text-[#111111]">
                    {profile[f.key] || <span className="text-[#8A8D83] italic">Not provided</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Health Demographics Section */}
        <div className="kaira-card bg-white border border-[#EAE8E2] p-8 shadow-kaira space-y-6">
          <h4 className="font-serif text-xl text-[#111111] pb-3 border-b border-[#F1F1F0]">
            Health Demographics
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] mb-2">
                Biological Gender
              </label>
              {editing ? (
                <select
                  name="gender"
                  value={form.gender || ""}
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
              ) : (
                <p className="text-sm py-2 px-3 bg-[#FAF9F6] border border-[#F1F1F0] text-[#111111]">
                  {profile.gender || <span className="text-[#8A8D83] italic">Not provided</span>}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] mb-2">
                Blood Group
              </label>
              {editing ? (
                <select
                  name="blood_group"
                  value={form.blood_group || ""}
                  onChange={handleChange}
                  className="w-full bg-[#FAF9F6] border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111]"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm py-2 px-3 bg-[#FAF9F6] border border-[#F1F1F0] text-[#111111]">
                  {profile.blood_group || <span className="text-[#8A8D83] italic">Not provided</span>}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { Clock, Plus, Bell, Check, Trash2, Calendar, FileText, CheckCircle2 } from "lucide-react";

const STORAGE_KEY = "mediassist_reminders";

function loadReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReminders(r) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

export default function MedicineReminder() {
  const [reminders, setReminders] = useState(loadReminders);
  const [showForm, setShowForm] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [showNotifMsg, setShowNotifMsg] = useState(false);

  // Form state
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("7");
  const [notes, setNotes] = useState("");
  const [times, setTimes] = useState(["08:00"]);
  const [newTime, setNewTime] = useState("09:00");

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    if (showNotifMsg) {
      const t = setTimeout(() => setShowNotifMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showNotifMsg]);

  const checkReminders = useCallback(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = now.toISOString().split("T")[0];
    reminders.forEach((r) => {
      if (!r.active) return;
      r.times.forEach((t) => {
        if (t === hhmm) {
          const key = `${r.id}-${today}-${t}`;
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, "notified");
            if (notifPerm === "granted") {
              new Notification("💊 Medicine Reminder", {
                body: `Time to take ${r.medicine}${r.dosage ? ` (${r.dosage})` : ""}`,
                icon: "/favicon.ico",
              });
            }
          }
        }
      });
    });
  }, [reminders, notifPerm]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  const requestNotification = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
    if (perm === "granted") setShowNotifMsg(true);
  };

  const addTime = () => {
    if (!newTime) return;
    if (times.includes(newTime)) return;
    setTimes((prev) => [...prev, newTime].sort());
  };

  const removeTime = (t) => {
    if (times.length === 1) return;
    setTimes((prev) => prev.filter((x) => x !== t));
  };

  const addReminder = () => {
    if (!medName.trim() || times.length === 0) return;
    const newReminder = {
      id: Date.now(),
      medicine: medName.trim(),
      dosage: dosage.trim(),
      times: [...times].sort(),
      duration: parseInt(duration) || 7,
      notes: notes.trim(),
      active: true,
      created: new Date().toISOString(),
      taken: {},
    };
    setReminders((prev) => [...prev, newReminder]);
    setMedName("");
    setDosage("");
    setDuration("7");
    setNotes("");
    setTimes(["08:00"]);
    setNewTime("09:00");
    setShowForm(false);
  };

  const toggleActive = (id) =>
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );

  const deleteReminder = (id) =>
    setReminders((prev) => prev.filter((r) => r.id !== id));

  const markTaken = (id, time) => {
    const today = new Date().toISOString().split("T")[0];
    const key = `${today}-${time}`;
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const taken = { ...r.taken };
        taken[key] = !taken[key];
        return { ...r, taken };
      })
    );
  };

  const isTaken = (reminder, time) => {
    const today = new Date().toISOString().split("T")[0];
    return !!reminder.taken[`${today}-${time}`];
  };

  const getTodayProgress = (reminder) => {
    const taken = reminder.times.filter((t) => isTaken(reminder, t)).length;
    return { taken, total: reminder.times.length };
  };

  return (
    <div className="kaira-card bg-white border border-[#EAE8E2] p-6 sm:p-10 shadow-kaira">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#F1F1F0] gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#EAE8E2] flex items-center justify-center text-[#8C907E]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[#111111] font-normal">
              Prescription Schedule & Reminders
            </h3>
            <p className="text-xs text-[#606456] mt-0.5">
              Keep your treatment protocol strictly on track with automated alerts
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-kaira-dark text-xs !py-3 !px-6 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Cancel Entry" : "Add Medication Reminder"}</span>
        </button>
      </div>

      {/* Notification banner */}
      {notifPerm === "default" && (
        <div className="p-4 bg-[#FAF9F6] border border-[#EAE8E2] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#111111]">
            <Bell className="w-4 h-4 text-[#8C907E]" />
            <span>Enable browser push notifications to receive timely dose reminders.</span>
          </div>
          <button
            type="button"
            onClick={requestNotification}
            className="btn-kaira-outline text-[11px] !py-1.5 !px-4"
          >
            Allow Alerts
          </button>
        </div>
      )}

      {showNotifMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Alerts successfully enabled. You will receive on-time dosage alerts.</span>
        </div>
      )}

      {/* Add reminder form */}
      {showForm && (
        <div className="bg-[#FAF9F6] border border-[#EAE8E2] p-6 mb-8 space-y-4">
          <h4 className="font-serif text-lg text-[#111111] border-b border-[#EAE8E2] pb-3">
            New Medication Schedule
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-1.5">
                Medicine Name *
              </label>
              <input
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                placeholder="e.g. Amoxicillin, Metformin"
                className="w-full bg-white border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-1.5">
                Dosage & Strength
              </label>
              <input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg, 1 tablet"
                className="w-full bg-white border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-1.5">
                Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-1.5">
                Instructions / Notes
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Take with warm water after lunch"
                className="w-full bg-white border border-[#EAE8E2] focus:border-[#111111] px-4 py-2.5 text-sm text-[#111111] placeholder-[#A8A59C]"
              />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-1.5">
              Scheduled Daily Dose Times *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 bg-[#8C907E] text-white text-xs uppercase tracking-wider px-3 py-1.5"
                >
                  <span>{t}</span>
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(t)}
                      className="text-white/80 hover:text-white"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-xs">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-white border border-[#EAE8E2] focus:border-[#111111] px-3 py-2 text-sm text-[#111111]"
              />
              <button
                type="button"
                onClick={addTime}
                className="btn-kaira-outline text-xs !py-2 !px-4"
              >
                + Add Time
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={addReminder}
              disabled={!medName.trim() || times.length === 0}
              className="btn-kaira-dark text-xs !py-3 !px-8"
            >
              Save Schedule Reminder
            </button>
          </div>
        </div>
      )}

      {/* Reminders list */}
      {reminders.length === 0 ? (
        <div className="text-center py-12 bg-[#FAF9F6] border border-[#EAE8E2]">
          <Clock className="w-10 h-10 mx-auto text-[#D3D7C9] mb-3" />
          <h4 className="font-serif text-lg text-[#111111]">No Medication Schedules Active</h4>
          <p className="text-xs text-[#8A8D83] mt-1 max-w-sm mx-auto">
            Add your daily prescribed medicines to monitor daily adherence and receive reminder alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const progress = getTodayProgress(reminder);
            const pct = Math.round((progress.taken / progress.total) * 100);

            return (
              <div
                key={reminder.id}
                className={`p-6 border transition-all ${
                  reminder.active
                    ? "bg-white border-[#EAE8E2] shadow-sm"
                    : "bg-[#FAF9F6] border-[#F1F1F0] opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-xl text-[#111111] font-medium">
                        {reminder.medicine}
                      </span>
                      {reminder.dosage && (
                        <span className="text-xs font-semibold uppercase tracking-wider bg-[#F1F1F0] text-[#606456] px-2.5 py-0.5 border border-[#EAE8E2]">
                          {reminder.dosage}
                        </span>
                      )}
                    </div>
                    {reminder.notes && (
                      <p className="text-xs text-[#606456] mt-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#8A8D83]" />
                        <span>{reminder.notes}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-[#8A8D83] mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8A8D83]" />
                      <span>{reminder.duration} days protocol · {reminder.times.length} daily dose{reminder.times.length > 1 ? "s" : ""}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(reminder.id)}
                      className={`text-[11px] uppercase tracking-wider px-3 py-1 font-semibold border ${
                        reminder.active
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {reminder.active ? "Active" : "Paused"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-1.5 text-[#8A8D83] hover:text-red-600 transition-colors"
                      aria-label="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#8A8D83] mb-1.5 font-medium">
                    <span className="uppercase tracking-wider text-[11px]">Today's Adherence</span>
                    <span>{progress.taken} of {progress.total} taken ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F1F1F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8C907E] transition-all duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Dose time pills */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F1F1F0]">
                  {reminder.times.map((time) => {
                    const taken = isTaken(reminder, time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => markTaken(reminder.id, time)}
                        className={`text-xs uppercase tracking-wider px-3 py-1.5 border transition-all flex items-center gap-2 ${
                          taken
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                            : "bg-white border-[#EAE8E2] text-[#606456] hover:border-[#111111]"
                        }`}
                      >
                        {taken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-[#8A8D83]" />}
                        <span>{time}</span>
                        <span>{taken ? "✓ Taken" : "Pending"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

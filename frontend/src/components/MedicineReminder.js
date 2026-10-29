import React, { useState, useEffect } from "react";
import { Clock, Plus, Bell, Check, Trash2, Calendar, FileText, CheckCircle2, Volume2, Sparkles } from "lucide-react";
import { NOTIF_EVENT, playReminderChime, getLocalDateString } from "./ReminderNotifier";

const STORAGE_KEY = "mediassist_reminders";

function loadReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveReminders(r) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Failed to save reminders:", e);
  }
}

export default function MedicineReminder() {
  const [reminders, setReminders] = useState(loadReminders);
  const [showForm, setShowForm] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [testTriggered, setTestTriggered] = useState(false);

  // Form state
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("7");
  const [notes, setNotes] = useState("");
  const [times, setTimes] = useState(["08:00"]);
  const [newTime, setNewTime] = useState("09:00");

  // Keep state synchronized with global updates from ReminderNotifier or other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setReminders(loadReminders());
      if (typeof Notification !== "undefined") {
        setNotifPerm(Notification.permission);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const requestNotification = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPerm(perm);
      return perm;
    } catch (err) {
      console.warn("Notification request error:", err);
      return "denied";
    }
  };

  const triggerTestNotification = async () => {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      await requestNotification();
    }

    // Play clinical audio chime
    playReminderChime();

    // Trigger in-app alert banner & desktop notification via ReminderNotifier
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${hh}:${mm}`;

    window.dispatchEvent(
      new CustomEvent(NOTIF_EVENT, {
        detail: {
          reminder: {
            id: `test-${Date.now()}`,
            medicine: medName.trim() || "Amoxicillin / Augmentin",
            dosage: dosage.trim() || "500 mg",
            notes: "Clinical reminder system test: audio chime, in-app notification banner, and desktop alert active.",
          },
          time: currentTimeStr,
          isTest: true,
        },
      })
    );

    setTestTriggered(true);
    setTimeout(() => setTestTriggered(false), 4000);
  };

  const setQuickNextMinute = () => {
    const d = new Date(Date.now() + 65 * 1000); // 1 minute into the future
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const nextTime = `${hh}:${mm}`;
    setNewTime(nextTime);
    if (!times.includes(nextTime)) {
      setTimes((prev) => [...prev, nextTime].sort());
    }
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
    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveReminders(updated);

    // Reset form
    setMedName("");
    setDosage("");
    setDuration("7");
    setNotes("");
    setTimes(["08:00"]);
    setNewTime("09:00");
    setShowForm(false);
  };

  const toggleActive = (id) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    setReminders(updated);
    saveReminders(updated);
  };

  const deleteReminder = (id) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const markTaken = (id, time) => {
    const today = getLocalDateString();
    const key = `${today}-${time}`;
    const updated = reminders.map((r) => {
      if (r.id !== id) return r;
      const taken = { ...(r.taken || {}) };
      taken[key] = !taken[key];
      return { ...r, taken };
    });
    setReminders(updated);
    saveReminders(updated);
  };

  const isTaken = (reminder, time) => {
    const today = getLocalDateString();
    return !!(reminder.taken && reminder.taken[`${today}-${time}`]);
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
              Keep your treatment protocol strictly on track with multi-channel automated alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={triggerTestNotification}
            className="btn-kaira-outline text-xs !py-3 !px-4 flex items-center gap-1.5"
            title="Test audio chime, banner alert, and desktop notification"
          >
            <Volume2 className="w-4 h-4 text-[#8C907E]" />
            <span>Test Alert & Chime</span>
          </button>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="btn-kaira-dark text-xs !py-3 !px-6 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? "Cancel Entry" : "Add Medication Reminder"}</span>
          </button>
        </div>
      </div>

      {/* Notification Engine Status Banner */}
      <div className="p-4 bg-[#FAF9F6] border border-[#EAE8E2] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] flex-shrink-0 mt-0.5 sm:mt-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#111111]">
                Reminder Engine Status:
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                  notifPerm === "granted"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : notifPerm === "denied"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-stone-200 text-stone-800 border border-stone-300"
                }`}
              >
                {notifPerm === "granted"
                  ? "✓ Push, Audio & In-App Alerts Active"
                  : notifPerm === "denied"
                  ? "⚠ Desktop Push Blocked (In-App & Audio Active)"
                  : "Push Permissions Pending"}
              </span>
            </div>
            <p className="text-[11px] text-[#8A8D83] mt-1 leading-relaxed">
              {notifPerm === "granted"
                ? "Automatic dosage checking runs continuously across the entire app. System push notifications, synthesized audio chimes, and modal cards will alert you at scheduled dose times."
                : notifPerm === "denied"
                ? "Desktop push notifications are blocked in your browser settings. In-app popups and synthesized sound alerts will continue to work. To enable desktop banners, click the lock/settings icon beside your browser address bar and set Notifications to Allow."
                : "Enable desktop push permissions to receive system notifications even when working in other tabs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          {notifPerm !== "granted" && (
            <button
              type="button"
              onClick={requestNotification}
              className="btn-kaira-outline text-[11px] !py-2 !px-4"
            >
              Enable Browser Push
            </button>
          )}
        </div>
      </div>

      {testTriggered && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-6 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Test alert triggered! You should hear the 3-tone chime, see the upper-right alert card, and receive a system notification.
          </span>
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
                placeholder="e.g. Amoxicillin, Metformin, Atorvastatin"
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
                placeholder="e.g. Take with food or warm water after breakfast"
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
                      aria-label={`Remove time ${t}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
              <button
                type="button"
                onClick={setQuickNextMinute}
                className="btn-kaira-outline text-xs !py-2 !px-3 text-[#8C907E] border-[#8C907E] hover:bg-[#8C907E] hover:text-white flex items-center gap-1"
                title="Sets time to 1 minute from right now so you can verify live notifications"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+1 Min from Now (Quick Test)</span>
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
            Add your daily prescribed medicines to monitor daily adherence and receive reminder alerts across any page.
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

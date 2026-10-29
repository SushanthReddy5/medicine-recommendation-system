import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Check,
  Trash2,
  Calendar,
  FileText,
  CheckCircle2,
  Volume2,
  Smartphone,
  ExternalLink,
  Info,
} from "lucide-react";
import { NOTIF_EVENT, playReminderChime, getLocalDateString } from "./ReminderNotifier";
import { downloadIcsFile, openGoogleCalendar } from "../utils/calendarSync";

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
  const [justSavedMed, setJustSavedMed] = useState(null);
  const [downloadFeedback, setDownloadFeedback] = useState(null);

  // Form state - Start with empty times (no predefined 08:00)
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("7");
  const [notes, setNotes] = useState("");
  const [times, setTimes] = useState([]);
  const [newTime, setNewTime] = useState("");

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

  const addTime = () => {
    if (!newTime) return;
    if (times.includes(newTime)) return;
    setTimes((prev) => [...prev, newTime].sort());
    setNewTime("");
  };

  const removeTime = (t) => {
    setTimes((prev) => prev.filter((x) => x !== t));
  };

  const addReminder = () => {
    if (!medName.trim() || times.length === 0) return;
    const newReminder = {
      id: Date.now(),
      medicine: medName.trim(),
      dosage: dosage.trim(),
      times: [...times].sort(),
      duration: parseInt(duration, 10) || 7,
      notes: notes.trim(),
      active: true,
      created: new Date().toISOString(),
      taken: {},
    };
    const updated = [...reminders, newReminder];
    setReminders(updated);
    saveReminders(updated);

    // Offer immediate device calendar sync
    setJustSavedMed(newReminder);

    // Reset form to clean empty state
    setMedName("");
    setDosage("");
    setDuration("7");
    setNotes("");
    setTimes([]);
    setNewTime("");
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
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setTimes([]);
                setNewTime("");
              }
            }}
            className="btn-kaira-dark text-xs !py-3 !px-6 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? "Cancel Entry" : "Add Medication Reminder"}</span>
          </button>
        </div>
      </div>

      {/* Offline & Closed Browser Notification Guidance Banner */}
      <div className="p-4 bg-[#FAF9F6] border border-[#EAE8E2] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white border border-[#EAE8E2] flex items-center justify-center text-[#8C907E] flex-shrink-0 mt-0.5">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#111111]">
                Regular Notifications Even When Browser Is Closed:
              </span>
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#8C907E] text-white">
                Device Calendar Sync Ready
              </span>
            </div>
            <p className="text-[11px] text-[#8A8D83] mt-1 leading-relaxed">
              When Chrome is completely quit, web pages cannot run in-memory code. To receive guaranteed native system alarms and notifications on your Mac, iPhone, Android, or PC when Chrome is closed, click <strong>"Sync to Device Calendar (.ics)"</strong> on any medication below. Your native Calendar will ring alarms at your scheduled times automatically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
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

      {/* Just-Saved Medication Sync Prompt */}
      {justSavedMed && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-6 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-[#111111]">
                Saved schedule for {justSavedMed.medicine}!
              </span>
              <p className="text-[11px] text-[#606456] mt-0.5">
                Sync to your device calendar now so your system alarms alert you even when Chrome is closed:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                downloadIcsFile(justSavedMed);
                setDownloadFeedback(justSavedMed.medicine);
                setJustSavedMed(null);
                setTimeout(() => setDownloadFeedback(null), 4000);
              }}
              className="btn-kaira-dark text-[11px] !py-2 !px-4 flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span>Download Device Alarms (.ics)</span>
            </button>
            <button
              type="button"
              onClick={() => setJustSavedMed(null)}
              className="px-2 py-1.5 text-xs text-[#8A8D83] hover:text-[#111111]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Download Feedback Banner */}
      {downloadFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-6 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Calendar schedule for <strong>{downloadFeedback}</strong> downloaded! Click the downloaded file to add daily alarms to Apple Calendar, Outlook, or Windows Calendar.
          </span>
        </div>
      )}

      {/* Test Triggered Banner */}
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

          {/* Time Slots - No predefined time */}
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-[#111111] mb-1.5">
              Scheduled Daily Dose Times *
            </label>

            {times.length === 0 ? (
              <p className="text-xs text-[#8A8D83] italic mb-3">
                No dose times added yet. Select a time below and click "+ Add Time".
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {times.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 bg-[#8C907E] text-white text-xs uppercase tracking-wider px-3 py-1.5"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTime(t)}
                      className="text-white/80 hover:text-white ml-1 font-bold"
                      aria-label={`Remove time ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

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
                disabled={!newTime}
                className="btn-kaira-outline text-xs !py-2 !px-4 disabled:opacity-40"
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
              className="btn-kaira-dark text-xs !py-3 !px-8 disabled:opacity-40"
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
            Add your daily prescribed medicines to monitor daily adherence and sync alarms to your device calendar.
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
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F1F1F0] mb-4">
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

                {/* Closed Browser / Device Calendar Sync Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F1F1F0] bg-[#FAF9F6] -mx-6 -mb-6 px-6 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        downloadIcsFile(reminder);
                        setDownloadFeedback(reminder.medicine);
                        setTimeout(() => setDownloadFeedback(null), 4000);
                      }}
                      className="btn-kaira-outline text-[11px] !py-1.5 !px-3 flex items-center gap-1.5 text-[#111111] hover:border-[#111111] bg-white"
                      title="Sync to Apple Calendar, Outlook, or Windows Calendar so alarms ring when Chrome is closed"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#8C907E]" />
                      <span>Sync to Device Calendar (.ics)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openGoogleCalendar(reminder, reminder.times[0] || "08:00")}
                      className="btn-kaira-outline text-[11px] !py-1.5 !px-3 flex items-center gap-1.5 text-[#606456] bg-white"
                      title="Add daily recurring schedule to Google Calendar"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#8C907E]" />
                      <span>Google Calendar</span>
                      <ExternalLink className="w-3 h-3 text-[#8A8D83]" />
                    </button>
                  </div>

                  <span className="text-[10px] text-[#8A8D83] uppercase tracking-wider font-medium flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#8C907E]" />
                    <span>Rings OS alarms even with browser closed</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

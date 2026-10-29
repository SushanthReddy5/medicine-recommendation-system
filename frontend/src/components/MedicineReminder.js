import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "mediassist_reminders";

function loadReminders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveReminders(r) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

export default function MedicineReminder() {
  const [reminders, setReminders]     = useState(loadReminders);
  const [showForm, setShowForm]       = useState(false);
  const [notifPerm, setNotifPerm]     = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [showNotifMsg, setShowNotifMsg] = useState(false);

  // Form state
  const [medName, setMedName]   = useState("");
  const [dosage, setDosage]     = useState("");
  const [duration, setDuration] = useState("7");
  const [notes, setNotes]       = useState("");
  const [times, setTimes]       = useState(["08:00"]);
  const [newTime, setNewTime]   = useState("09:00");

  useEffect(() => { saveReminders(reminders); }, [reminders]);

  // Hide notification success message after 3 seconds
  useEffect(() => {
    if (showNotifMsg) {
      const t = setTimeout(() => setShowNotifMsg(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showNotifMsg]);

  const checkReminders = useCallback(() => {
    const now   = new Date();
    const hhmm  = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const today = now.toISOString().split("T")[0];
    reminders.forEach(r => {
      if (!r.active) return;
      r.times.forEach(t => {
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

  // Add a time slot
  const addTime = () => {
    if (!newTime) return;
    if (times.includes(newTime)) return;
    setTimes(prev => [...prev, newTime].sort());
  };

  // Remove a time slot
  const removeTime = (t) => {
    if (times.length === 1) return; // keep at least one
    setTimes(prev => prev.filter(x => x !== t));
  };

  const addReminder = () => {
    if (!medName.trim() || times.length === 0) return;
    const newReminder = {
      id      : Date.now(),
      medicine: medName.trim(),
      dosage  : dosage.trim(),
      times   : [...times].sort(),
      duration: parseInt(duration) || 7,
      notes   : notes.trim(),
      active  : true,
      created : new Date().toISOString(),
      taken   : {},
    };
    setReminders(prev => [...prev, newReminder]);
    // Reset form
    setMedName(""); setDosage(""); setDuration("7");
    setNotes(""); setTimes(["08:00"]); setNewTime("09:00");
    setShowForm(false);
  };

  const toggleActive   = (id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const deleteReminder = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  const markTaken = (id, time) => {
    const today = new Date().toISOString().split("T")[0];
    const key   = `${today}-${time}`;
    setReminders(prev => prev.map(r => {
      if (r.id !== id) return r;
      const taken = { ...r.taken };
      taken[key]  = !taken[key];
      return { ...r, taken };
    }));
  };

  const isTaken = (reminder, time) => {
    const today = new Date().toISOString().split("T")[0];
    return !!reminder.taken[`${today}-${time}`];
  };

  const getTodayProgress = (reminder) => {
    const taken = reminder.times.filter(t => isTaken(reminder, t)).length;
    return { taken, total: reminder.times.length };
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <h2 className="text-lg font-bold text-white">Medicine Reminders</h2>
            <p className="text-xs text-slate-400">Track your daily medication schedule</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm
                           font-bold px-4 py-2 rounded-xl transition-colors">
          {showForm ? "Cancel" : "+ Add Reminder"}
        </button>
      </div>

      {/* Notification permission — only show if not yet decided */}
      {notifPerm === "default" && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-xl
                        p-3 mb-4 flex items-center justify-between">
          <p className="text-blue-300 text-sm">
            🔔 Enable notifications to get medicine reminders
          </p>
          <button onClick={requestNotification}
                  className="bg-blue-600 hover:bg-blue-500 text-white
                             text-xs px-3 py-1.5 rounded-lg font-bold">
            Enable
          </button>
        </div>
      )}

      {/* Success message — disappears after 3 seconds */}
      {showNotifMsg && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl
                        p-3 mb-4 text-green-400 text-sm flex items-center gap-2">
          <span>✅</span> Notifications enabled — you'll be reminded on time!
        </div>
      )}

      {/* Add reminder form */}
      {showForm && (
        <div className="bg-slate-900/60 border border-slate-600 rounded-xl p-4 mb-5">
          <h3 className="text-white font-semibold mb-4">New Reminder</h3>

          {/* Medicine + Dosage */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Medicine Name *</label>
              <input value={medName} onChange={e => setMedName(e.target.value)}
                     placeholder="e.g. Paracetamol"
                     className="w-full bg-slate-800 border border-slate-600 rounded-xl
                                px-3 py-2 text-sm text-slate-200 placeholder-slate-500
                                outline-none focus:border-blue-500"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Dosage</label>
              <input value={dosage} onChange={e => setDosage(e.target.value)}
                     placeholder="e.g. 500mg"
                     className="w-full bg-slate-800 border border-slate-600 rounded-xl
                                px-3 py-2 text-sm text-slate-200 placeholder-slate-500
                                outline-none focus:border-blue-500"/>
            </div>
          </div>

          {/* Duration + Notes */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Duration (days)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                     min="1" max="365"
                     className="w-full bg-slate-800 border border-slate-600 rounded-xl
                                px-3 py-2 text-sm text-slate-200 outline-none
                                focus:border-blue-500"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Notes (optional)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)}
                     placeholder="e.g. Take after food"
                     className="w-full bg-slate-800 border border-slate-600 rounded-xl
                                px-3 py-2 text-sm text-slate-200 placeholder-slate-500
                                outline-none focus:border-blue-500"/>
            </div>
          </div>

          {/* Time slots — fully user defined */}
          <div className="mb-4">
            <label className="text-xs text-slate-400 mb-2 block">
              Reminder Times * 
              <span className="text-slate-600 ml-1">(add as many as you need)</span>
            </label>

            {/* Existing times */}
            <div className="flex flex-wrap gap-2 mb-3">
              {times.map(t => (
                <div key={t}
                     className="flex items-center gap-1.5 bg-blue-900/40
                                border border-blue-700 text-blue-300
                                text-xs px-3 py-1.5 rounded-full">
                  🕐 {t}
                  {times.length > 1 && (
                    <button onClick={() => removeTime(t)}
                            className="text-blue-400 hover:text-red-400
                                       font-bold ml-1 leading-none">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new time */}
            <div className="flex gap-2">
              <input type="time" value={newTime}
                     onChange={e => setNewTime(e.target.value)}
                     className="flex-1 bg-slate-800 border border-slate-600
                                rounded-xl px-3 py-2 text-sm text-slate-200
                                outline-none focus:border-blue-500"/>
              <button onClick={addTime}
                      className="bg-slate-700 hover:bg-slate-600 text-white
                                 text-sm px-4 py-2 rounded-xl transition-colors
                                 font-medium whitespace-nowrap">
                + Add Time
              </button>
            </div>
          </div>

          <button onClick={addReminder}
                  disabled={!medName.trim() || times.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-500
                             disabled:bg-slate-700 disabled:text-slate-500
                             text-white font-bold py-2.5 rounded-xl transition-colors">
            Add Reminder
          </button>
        </div>
      )}

      {/* Reminders list */}
      {reminders.length === 0 ? (
        <div className="text-center py-8 text-slate-600">
          <p className="text-4xl mb-3">⏰</p>
          <p className="text-sm">No reminders yet.</p>
          <p className="text-xs mt-1">Click "+ Add Reminder" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map(reminder => {
            const progress = getTodayProgress(reminder);
            const pct      = Math.round((progress.taken / progress.total) * 100);
            return (
              <div key={reminder.id}
                   className={`border rounded-xl p-4 transition-all
                               ${reminder.active
                                 ? "bg-slate-900/60 border-slate-600"
                                 : "bg-slate-900/20 border-slate-700 opacity-60"}`}>

                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{reminder.medicine}</span>
                      {reminder.dosage && (
                        <span className="text-xs bg-slate-700 text-slate-300
                                         px-2 py-0.5 rounded-full">
                          {reminder.dosage}
                        </span>
                      )}
                    </div>
                    {reminder.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">{reminder.notes}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-0.5">
                      {reminder.duration} days · {reminder.times.length}x daily
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(reminder.id)}
                            className={`text-xs px-3 py-1 rounded-full border font-medium
                                        ${reminder.active
                                          ? "bg-green-900/40 border-green-700 text-green-400"
                                          : "bg-slate-700 border-slate-600 text-slate-400"}`}>
                      {reminder.active ? "Active" : "Paused"}
                    </button>
                    <button onClick={() => deleteReminder(reminder.id)}
                            className="text-slate-600 hover:text-red-400 text-xl leading-none">
                      ×
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Today's progress</span>
                    <span>{progress.taken}/{progress.total} taken</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all"
                         style={{ width: `${pct}%` }}/>
                  </div>
                </div>

                {/* Time slots */}
                <div className="flex flex-wrap gap-2">
                  {reminder.times.map(time => {
                    const taken = isTaken(reminder, time);
                    return (
                      <button key={time} onClick={() => markTaken(reminder.id, time)}
                              className={`flex items-center gap-1.5 text-xs px-3 py-1.5
                                          rounded-full border transition-all font-medium
                                          ${taken
                                            ? "bg-green-900/40 border-green-700 text-green-400"
                                            : "bg-slate-800 border-slate-600 text-slate-400 hover:border-blue-500"}`}>
                        {taken ? "✅" : "🕐"} {time} {taken ? "Taken" : "Pending"}
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

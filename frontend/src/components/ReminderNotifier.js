import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, X, Clock } from "lucide-react";

export const REMINDER_STORAGE_KEY = "mediassist_reminders";
export const NOTIF_EVENT = "mediassist-reminder-alert";

// Pleasant 3-tone clinical audio chime using Web Audio API
export function playReminderChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Tone 2: 880.00 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.15);
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);

    // Tone 3: 1046.50 Hz (C6) - Clean harmonious resolution
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1046.5, now + 0.3);
    gain3.gain.setValueAtTime(0.2, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.3);
    osc3.stop(now + 1.0);
  } catch (e) {
    console.warn("Could not synthesize audio alert:", e);
  }
}

// Format local date string YYYY-MM-DD
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ReminderNotifier() {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [soundEnabled] = useState(() => {
    return localStorage.getItem("mediassist_sound_alerts") !== "false";
  });

  // Trigger alert action
  const triggerAlert = useCallback(
    ({ reminder, time, isTest = false }) => {
      // 1. Play audio chime if sound is enabled
      if (soundEnabled) {
        playReminderChime();
      }

      // 2. Trigger browser notification if permitted
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          const title = isTest
            ? "🔔 Test Medicine Reminder"
            : `💊 Time for ${reminder.medicine}${reminder.dosage ? ` (${reminder.dosage})` : ""}`;
          
          const options = {
            body: isTest
              ? "Your notifications, audio chime, and in-app alerts are active and working!"
              : `Scheduled dose at ${time}.${reminder.notes ? ` Instructions: ${reminder.notes}` : ""}`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            tag: `reminder-${reminder.id}-${time}`,
            requireInteraction: true,
          };

          const notification = new Notification(title, options);
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (err) {
          console.warn("System desktop notification error:", err);
        }
      }

      // 3. Show prominent In-App Banner/Modal
      const alertId = `${reminder.id}-${time}-${Date.now()}`;
      setActiveAlerts((prev) => [
        ...prev.filter((a) => a.reminder.id !== reminder.id || a.time !== time),
        { alertId, reminder, time, isTest },
      ]);
    },
    [soundEnabled]
  );

  // Listen for custom trigger events from anywhere in the app
  useEffect(() => {
    const handleCustomEvent = (e) => {
      if (e.detail) {
        triggerAlert(e.detail);
      }
    };
    window.addEventListener(NOTIF_EVENT, handleCustomEvent);
    return () => window.removeEventListener(NOTIF_EVENT, handleCustomEvent);
  }, [triggerAlert]);

  // Periodic Reminder Checker - runs every 5 seconds continuously
  useEffect(() => {
    const checkReminders = () => {
      try {
        const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
        if (!stored) return;
        const reminders = JSON.parse(stored);
        if (!Array.isArray(reminders)) return;

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentMinuteOfDay = currentHours * 60 + currentMinutes;
        const todayStr = getLocalDateString(now);

        reminders.forEach((r) => {
          if (!r.active || !Array.isArray(r.times)) return;

          r.times.forEach((t) => {
            const parts = t.split(":");
            if (parts.length !== 2) return;
            const tH = parseInt(parts[0], 10);
            const tM = parseInt(parts[1], 10);
            const scheduledMinuteOfDay = tH * 60 + tM;

            // Trigger if current time matches scheduled time, or within a 2-minute window (handles tab sleep/drift)
            const diff = currentMinuteOfDay - scheduledMinuteOfDay;
            if (diff >= 0 && diff <= 2) {
              const dedupeKey = `mediassist_alert_${r.id}_${todayStr}_${t}`;

              if (!localStorage.getItem(dedupeKey)) {
                localStorage.setItem(dedupeKey, Date.now().toString());

                // Check if already taken today
                const isAlreadyTaken = r.taken && r.taken[`${todayStr}-${t}`];
                if (!isAlreadyTaken) {
                  triggerAlert({ reminder: r, time: t, isTest: false });
                }
              }
            }
          });
        });
      } catch (err) {
        console.error("Error checking reminders:", err);
      }
    };

    // Run check immediately on mount, then every 5 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 5000);
    return () => clearInterval(interval);
  }, [triggerAlert]);

  // Dismiss an alert
  const dismissAlert = (alertId) => {
    setActiveAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
  };

  // Mark as taken directly from the alert
  const markAsTakenFromAlert = (alertItem) => {
    const { reminder, time, alertId } = alertItem;
    const todayStr = getLocalDateString();
    const key = `${todayStr}-${time}`;

    try {
      const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (stored) {
        const reminders = JSON.parse(stored);
        const updated = reminders.map((r) => {
          if (r.id === reminder.id) {
            const taken = { ...(r.taken || {}) };
            taken[key] = true;
            return { ...r, taken };
          }
          return r;
        });
        localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(updated));
        // Broadcast change so UI pages can update progress bars
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      console.error("Error updating reminder taken status:", e);
    }

    dismissAlert(alertId);
  };

  // Snooze alert for 5 minutes
  const snoozeAlert = (alertItem) => {
    const { reminder, alertId } = alertItem;
    dismissAlert(alertId);

    setTimeout(() => {
      triggerAlert({
        reminder,
        time: "Snoozed Dose",
        isTest: false,
      });
    }, 5 * 60 * 1000);
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 flex flex-col gap-3 max-w-md w-[calc(100vw-2rem)] pointer-events-auto">
      {activeAlerts.map((item) => {
        const { alertId, reminder, time, isTest } = item;
        return (
          <div
            key={alertId}
            className="kaira-card bg-white border-2 border-[#8C907E] p-5 shadow-2xl animate-slide-up"
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F1F1F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 animate-bounce">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#8C907E] block">
                    {isTest ? "System Test Alert" : "Prescription Due Now"}
                  </span>
                  <h4 className="font-serif text-lg text-[#111111] font-medium leading-snug">
                    {reminder.medicine}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissAlert(alertId)}
                className="text-[#8A8D83] hover:text-[#111111] p-1"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 text-xs text-[#606456] space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#8A8D83]" />
                <span className="font-medium text-[#111111]">Scheduled Time:</span>
                <span>{time}</span>
                {reminder.dosage && (
                  <span className="bg-[#FAF9F6] border border-[#EAE8E2] px-2 py-0.5 rounded text-[11px] font-semibold text-[#111111]">
                    {reminder.dosage}
                  </span>
                )}
              </div>
              {reminder.notes && (
                <p className="text-[11px] text-[#8A8D83] italic pt-0.5">
                  "{reminder.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#F1F1F0]">
              <button
                type="button"
                onClick={() => markAsTakenFromAlert(item)}
                className="btn-kaira-dark text-xs !py-2 !px-4 flex-1 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark as Taken</span>
              </button>

              {!isTest && (
                <button
                  type="button"
                  onClick={() => snoozeAlert(item)}
                  className="btn-kaira-outline text-xs !py-2 !px-3 text-[#606456]"
                >
                  Snooze 5m
                </button>
              )}

              <button
                type="button"
                onClick={() => dismissAlert(alertId)}
                className="px-2 py-2 text-xs text-[#8A8D83] hover:text-[#111111]"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

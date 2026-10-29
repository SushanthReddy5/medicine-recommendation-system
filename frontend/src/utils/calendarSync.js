/**
 * Utility to generate iCalendar (.ics) files and Google Calendar links.
 * Enables native OS-level alerts (macOS Calendar, iOS Reminders, Windows Calendar, Android)
 * that ring system notifications and alarms even when Chrome or the browser is completely closed.
 */

const pad = (n) => String(n).padStart(2, "0");

export function generateIcsContent(reminder) {
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const durationDays = parseInt(reminder.duration, 10) || 7;
  const events = [];

  const times = Array.isArray(reminder.times) ? reminder.times : [];
  times.forEach((t, idx) => {
    const parts = t.split(":");
    if (parts.length !== 2) return;
    const hh = parseInt(parts[0], 10);
    const mm = parseInt(parts[1], 10);

    const startDate = new Date();
    startDate.setHours(hh, mm, 0, 0);

    const startStr = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
    const endDate = new Date(startDate.getTime() + 15 * 60 * 1000);
    const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const uid = `mediassist-${reminder.id}-${idx}-${Date.now()}@mediassist.health`;
    const summary = `💊 Dose: ${reminder.medicine}${reminder.dosage ? ` (${reminder.dosage})` : ""}`;
    const desc = `MediAssist Medication Schedule:\\nMedicine: ${reminder.medicine}\\nDosage: ${reminder.dosage || "Standard"}\\nDaily dose at: ${t}\\nInstructions: ${reminder.notes || "None"}\\nCourse Duration: ${durationDays} days`;

    events.push([
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `RRULE:FREQ=DAILY;COUNT=${durationDays}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${desc}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${summary}`,
      "TRIGGER:-PT0M",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n"));
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MediAssist Health//Medicine Reminder Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(reminder) {
  try {
    const icsData = generateIcsContent(reminder);
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const safeName = (reminder.medicine || "Medicine").replace(/[^a-zA-Z0-9_-]/g, "_");
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${safeName}_Reminder_Schedule.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error("Error downloading ICS file:", err);
    return false;
  }
}

export function openGoogleCalendar(reminder, time) {
  try {
    const parts = (time || "08:00").split(":");
    const hh = parseInt(parts[0], 10) || 8;
    const mm = parseInt(parts[1], 10) || 0;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
    const end = new Date(start.getTime() + 15 * 60 * 1000);

    const startStr = `${start.getFullYear()}${pad(start.getMonth() + 1)}${pad(start.getDate())}T${pad(start.getHours())}${pad(start.getMinutes())}00`;
    const endStr = `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
    const durationDays = parseInt(reminder.duration, 10) || 7;

    const title = encodeURIComponent(`💊 Take ${reminder.medicine}${reminder.dosage ? ` (${reminder.dosage})` : ""}`);
    const details = encodeURIComponent(
      `Prescription reminder from MediAssist.\nMedicine: ${reminder.medicine}\nDosage: ${reminder.dosage || "Standard"}\nScheduled Time: ${time}\nNotes: ${reminder.notes || "None"}\nCourse: ${durationDays} days.`
    );
    const recur = encodeURIComponent(`RRULE:FREQ=DAILY;COUNT=${durationDays}`);

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&recur=${recur}`;
    window.open(gCalUrl, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error("Error opening Google Calendar:", err);
  }
}


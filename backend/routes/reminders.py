import threading
import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.email_service import send_reminder_email
from services.db_service import db_service

reminders_bp = Blueprint("reminders", __name__)

# In-memory store fallback if db unavailable
ACTIVE_REMINDERS = {}
SENT_LOG = set()

def get_current_hhmm():
    now = datetime.now()
    return f"{now.hour:02d}:{now.minute:02d}", now.strftime("%Y-%m-%d")

def reminder_background_worker():
    """Background worker that checks schedules every 30 seconds and sends alerts."""
    while True:
        try:
            hhmm, today_str = get_current_hhmm()

            # Gather reminders from DB if connected, else fallback to memory
            reminders_list = []
            if db_service.ensure_connected():
                try:
                    docs = list(db_service.db["reminders"].find({"active": True}))
                    for d in docs:
                        d["_id"] = str(d["_id"])
                        reminders_list.append(d)
                except Exception:
                    reminders_list = list(ACTIVE_REMINDERS.values())
            else:
                reminders_list = list(ACTIVE_REMINDERS.values())

            for r in reminders_list:
                email = r.get("email", "").strip()
                if not email or "@" not in email:
                    continue

                times = r.get("times", [])
                for t in times:
                    if t == hhmm:
                        dedupe_key = f"{r.get('id', r.get('_id'))}_{today_str}_{t}"
                        if dedupe_key not in SENT_LOG:
                            SENT_LOG.add(dedupe_key)
                            send_reminder_email(
                                to_email=email,
                                medicine=r.get("medicine", "Prescription"),
                                dosage=r.get("dosage", ""),
                                time_str=t,
                                notes=r.get("notes", ""),
                            )
        except Exception as e:
            print("Background reminder worker error:", e)

        time.sleep(30)

# Start background thread once
_worker_started = False
if not _worker_started:
    _worker_started = True
    t = threading.Thread(target=reminder_background_worker, daemon=True)
    t.start()

@reminders_bp.route("/api/reminders/sync", methods=["POST"])
def sync_reminders():
    """Sync reminders from client to server so notifications dispatch even if browser is closed."""
    try:
        body = request.get_json(silent=True) or {}
        reminders = body.get("reminders", [])
        user_email = body.get("email", "").strip()

        if db_service.ensure_connected():
            for r in reminders:
                r_id = str(r.get("id"))
                r["email"] = user_email or r.get("email", "")
                r["updated_at"] = datetime.utcnow()
                db_service.db["reminders"].update_one(
                    {"id": r_id},
                    {"$set": r},
                    upsert=True
                )
        else:
            for r in reminders:
                r_id = str(r.get("id"))
                r["email"] = user_email or r.get("email", "")
                ACTIVE_REMINDERS[r_id] = r

        return jsonify({"status": "ok", "synced": len(reminders)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reminders_bp.route("/api/reminders/test-email", methods=["POST"])
def test_email_alert():
    """Immediately send a test reminder email to verify external notification delivery."""
    try:
        body = request.get_json(silent=True) or {}
        to_email = body.get("email", "").strip()
        medicine = body.get("medicine", "Amoxicillin / Augmentin")
        dosage = body.get("dosage", "500 mg")
        time_str = body.get("time", datetime.now().strftime("%H:%M"))
        notes = body.get("notes", "Sample scheduled dose notification test.")

        if not to_email or "@" not in to_email:
            return jsonify({"error": "A valid email address is required."}), 400

        success = send_reminder_email(to_email, medicine, dosage, time_str, notes)
        if success:
            return jsonify({"status": "sent", "message": f"Test alert sent to {to_email}"})
        else:
            return jsonify({"error": "Failed to send email. Check SMTP settings."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

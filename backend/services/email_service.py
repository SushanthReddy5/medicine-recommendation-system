import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

GMAIL_USER     = os.environ.get("GMAIL_USER")
GMAIL_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD")
FRONTEND_URL   = os.environ.get("FRONTEND_URL", "http://localhost:3000")
SECRET_KEY     = os.environ.get("JWT_SECRET", "mediassist-secret-key-2025")

serializer = URLSafeTimedSerializer(SECRET_KEY)

def generate_reset_token(email: str) -> str:
    """Generate a secure timed token for password reset."""
    return serializer.dumps(email, salt="password-reset")

def verify_reset_token(token: str, max_age: int = 3600) -> str | None:
    """
    Verify token and return email if valid.
    Token expires after max_age seconds (default 1 hour).
    """
    try:
        email = serializer.loads(token, salt="password-reset", max_age=max_age)
        return email
    except Exception:
        return None

def send_reset_email(to_email: str, reset_token: str) -> bool:
    """Send password reset email via Gmail."""
    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px;">
      <div style="max-width: 500px; margin: 0 auto; background: #1e293b;
                  border-radius: 16px; padding: 32px; border: 1px solid #334155;">

        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #fff; font-size: 24px; margin: 0;">❤️‍🩹 MediAssist</h1>
          <p style="color: #94a3b8; margin: 8px 0 0;">Password Reset Request</p>
        </div>

        <p style="color: #cbd5e1;">Hi there,</p>
        <p style="color: #cbd5e1;">
          We received a request to reset your MediAssist password.
          Click the button below to set a new password.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{reset_url}"
             style="background: #2563eb; color: white; padding: 14px 32px;
                    border-radius: 12px; text-decoration: none; font-weight: bold;
                    font-size: 16px; display: inline-block;">
            Reset My Password
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px;">
          This link expires in <strong style="color: #94a3b8;">1 hour</strong>.
          If you didn't request this, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;"/>
        <p style="color: #475569; font-size: 12px; text-align: center;">
          MediAssist · AI Healthcare Assistant
        </p>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset Your MediAssist Password"
        msg["From"]    = GMAIL_USER
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())

        print(f"✅ Reset email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email send failed: {e}")
        return False

def send_reminder_email(to_email: str, medicine: str, dosage: str = "", time_str: str = "", notes: str = "") -> bool:
    """Send medicine dose alert email to patient via Gmail."""
    dosage_line = f"<p style='margin: 0 0 8px; font-size: 14px; color: #475569;'><strong>Prescribed Dosage:</strong> <span style='color: #0f172a;'>{dosage}</span></p>" if dosage else ""
    notes_line = f"<p style='margin: 0; font-size: 14px; color: #475569;'><strong>Instructions:</strong> <span style='color: #0f172a;'>{notes}</span></p>" if notes else ""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #F8F7F4; color: #111111; padding: 24px; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #EAE8E2;">
        <div style="border-bottom: 2px solid #8C907E; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8C907E; font-weight: 600;">Prescription Alert</span>
          <h2 style="margin: 6px 0 0; font-size: 22px; color: #111111; font-weight: 600;">Time to take {medicine}</h2>
        </div>

        <div style="background: #FAF9F6; border: 1px solid #EAE8E2; padding: 16px 20px; margin-bottom: 20px; border-radius: 4px;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #475569;"><strong>Scheduled Time:</strong> <span style="color: #0f172a; font-weight: 600;">{time_str}</span></p>
          {dosage_line}
          {notes_line}
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px;">
          Adherence to your prescribed timing ensures optimal clinical recovery. Please take this dose as recommended.
        </p>

        <hr style="border: none; border-top: 1px solid #F1F1F0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          MediAssist · Clinical Medication Manager
        </p>
      </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"💊 Medicine Reminder: Time to take {medicine}" + (f" ({dosage})" if dosage else "")
        msg["From"]    = f"MediAssist <{GMAIL_USER}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())

        print(f"✅ Reminder email sent to {to_email} for {medicine}")
        return True
    except Exception as e:
        print(f"❌ Reminder email failed: {e}")
        return False

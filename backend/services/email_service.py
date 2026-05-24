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

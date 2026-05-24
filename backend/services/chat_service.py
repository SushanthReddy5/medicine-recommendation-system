import os
import pandas as pd
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

BASE_SYSTEM_PROMPT = """You are MediAssist, a helpful AI medical assistant.

Your rules:
1. Always recommend consulting a real doctor for serious conditions
2. Never diagnose definitively — use 'this could be' or 'common causes include'
3. Keep responses concise (max 150 words)
4. Use simple language, not medical jargon
5. If symptoms sound severe (chest pain, difficulty breathing), say SEEK EMERGENCY CARE immediately
6. You know the user's health profile — use it to give personalized advice
7. If user has allergies, ALWAYS warn if a medicine matches their allergy
8. Consider user's age when recommending medicines (child vs adult dosage)
9. Be warm, helpful and professional"""

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "dataset.csv")

class ChatService:
    def __init__(self):
        self.api_key  = os.environ.get("GROQ_API_KEY")
        self.client   = None
        self.is_ready = False
        self.data     = None
        self._load_data()
        self._init_client()

    def _load_data(self):
        try:
            self.data = pd.read_csv(DATA_PATH)
        except:
            self.data = pd.DataFrame()

    def _init_client(self):
        if not self.api_key:
            print("⚠️  GROQ_API_KEY not found — chatbot disabled")
            return
        try:
            self.client   = Groq(api_key=self.api_key)
            self.is_ready = True
            print("✅ Chatbot (Groq) ready")
        except Exception as e:
            print(f"❌ Chatbot init failed: {e}")

    def _build_system_prompt(self, user_profile=None):
        """Build system prompt with user profile context."""
        prompt = BASE_SYSTEM_PROMPT

        if user_profile:
            profile_lines = ["\n\n--- USER HEALTH PROFILE ---"]
            if user_profile.get("name"):
                profile_lines.append(f"Name: {user_profile['name']}")
            if user_profile.get("age"):
                profile_lines.append(f"Age: {user_profile['age']} years old")
            if user_profile.get("gender"):
                profile_lines.append(f"Gender: {user_profile['gender']}")
            if user_profile.get("blood_group"):
                profile_lines.append(f"Blood Group: {user_profile['blood_group']}")
            if user_profile.get("allergies") and user_profile["allergies"].lower() != "none":
                profile_lines.append(f"⚠️ KNOWN ALLERGIES: {user_profile['allergies']} — ALWAYS warn if recommending these")
            elif user_profile.get("allergies") == "None":
                profile_lines.append("Allergies: None known")
            if user_profile.get("emergency_contact"):
                profile_lines.append(f"Emergency Contact: {user_profile['emergency_contact']}")
            profile_lines.append("--- END PROFILE ---")
            profile_lines.append("\nUse this profile to personalize your responses. Address the user by name when appropriate.")
            prompt += "\n".join(profile_lines)

        return prompt

    def chat(self, messages, user_profile=None):
        if not self.is_ready:
            return "Chatbot is not available. Please add GROQ_API_KEY to .env"
        try:
            system_prompt = self._build_system_prompt(user_profile)
            groq_messages = [{"role": "system", "content": system_prompt}]
            for m in messages:
                groq_messages.append({
                    "role"   : m["role"],
                    "content": m["content"]
                })
            response = self.client.chat.completions.create(
                model      = "llama-3.1-8b-instant",
                messages   = groq_messages,
                max_tokens = 400,
                temperature= 0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ Chat error: {e}")
            return f"Sorry, I encountered an error: {str(e)}"

chat_service = ChatService()

from flask import Blueprint, request, jsonify
from services.chat_service import chat_service

chat_bp = Blueprint("chat", __name__)

@chat_bp.route("/api/chat", methods=["POST"])
def chat():
    try:
        body = request.get_json(silent=True)
        if not body or "messages" not in body:
            return jsonify({"error": "Provide a 'messages' list."}), 400

        messages     = body.get("messages", [])
        user_profile = body.get("user_profile", None)

        if not isinstance(messages, list) or len(messages) == 0:
            return jsonify({"error": "Messages must be a non-empty list."}), 400

        # Limit history
        messages = messages[-10:]

        reply = chat_service.chat(messages, user_profile=user_profile)
        return jsonify({ "reply": reply, "available": chat_service.is_ready })
    except Exception as e:
        print(f"⚠️ Chat error: {e}")
        return jsonify({
            "reply": "I'm having trouble processing that right now. Please try again in a moment.",
            "available": False
        }), 200


@chat_bp.route("/api/chat/status", methods=["GET"])
def chat_status():
    return jsonify({"available": chat_service.is_ready})

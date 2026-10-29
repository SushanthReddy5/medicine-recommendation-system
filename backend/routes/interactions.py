from flask import Blueprint, request, jsonify
from services.interaction_service import interaction_service

interactions_bp = Blueprint("interactions", __name__)

@interactions_bp.route("/api/interactions/check", methods=["POST"])
def check_interactions():
    try:
        body = request.get_json(silent=True)
        if not body or "medicines" not in body:
            return jsonify({"error": "Provide a 'medicines' list."}), 400

        medicines = body["medicines"]
        if not isinstance(medicines, list) or len(medicines) < 2:
            return jsonify({"error": "Provide at least 2 medicines to check."}), 400

        medicines = [m for m in medicines if isinstance(m, str) and m.strip()]
        if len(medicines) < 2:
            return jsonify({"error": "Provide at least 2 valid medicine names."}), 400

        results = interaction_service.check(medicines)

        return jsonify({
            "medicines"    : medicines,
            "interactions" : results,
            "count"        : len(results),
            "has_high_risk": any(r["severity"] == "high" for r in results),
        })
    except Exception as e:
        print(f"⚠️ Interaction check error: {e}")
        return jsonify({"error": f"Failed to check interactions: {str(e)}"}), 500

@interactions_bp.route("/api/interactions/medicines", methods=["GET"])
def get_medicines():
    try:
        return jsonify({"medicines": interaction_service.get_all_medicines()})
    except Exception as e:
        print(f"⚠️ get_medicines error: {e}")
        return jsonify({"medicines": []})


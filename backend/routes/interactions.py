from flask import Blueprint, request, jsonify
from services.interaction_service import interaction_service

interactions_bp = Blueprint("interactions", __name__)

@interactions_bp.route("/api/interactions/check", methods=["POST"])
def check_interactions():
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

@interactions_bp.route("/api/interactions/medicines", methods=["GET"])
def get_medicines():
    return jsonify({"medicines": interaction_service.get_all_medicines()})

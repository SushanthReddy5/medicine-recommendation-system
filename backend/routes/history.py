from flask import Blueprint, request, jsonify
from services.db_service import db_service

history_bp = Blueprint("history", __name__)

@history_bp.route("/api/history", methods=["GET"])
def get_history():
    limit   = int(request.args.get("limit", 10))
    history = db_service.get_history(limit=limit)
    return jsonify({
        "history"     : history,
        "count"       : len(history),
        "db_connected": db_service.is_connected
    })

@history_bp.route("/api/history/clear", methods=["DELETE"])
def clear_history():
    success = db_service.clear_history()
    if success:
        return jsonify({"message": "History cleared successfully."})
    return jsonify({"error": "Failed to clear history."}), 500

@history_bp.route("/api/stats", methods=["GET"])
def get_stats():
    return jsonify(db_service.get_stats())

@history_bp.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    return jsonify(db_service.get_dashboard_stats())

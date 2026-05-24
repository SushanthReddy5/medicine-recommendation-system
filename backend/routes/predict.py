from flask import Blueprint, request, jsonify
from services.ml_service import ml_service
from services.db_service  import db_service
from utils.validators import validate_predict_input

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/api/predict", methods=["POST"])
def predict():
    body                        = request.get_json(silent=True)
    symptom_input, top_n, error = validate_predict_input(body)

    if error:
        return jsonify({"error": error}), 400

    predictions = ml_service.predict(symptom_input, top_n)

    if not predictions:
        return jsonify({"error": "No recommendation found.", "symptoms": symptom_input}), 404

    method = "ml" if ml_service.is_loaded else "csv"

    # Save to MongoDB
    db_service.save_search(symptom_input, predictions, method)

    return jsonify({
        "symptoms"   : symptom_input,
        "predictions": predictions,
        "method"     : method,
    })

@predict_bp.route("/api/symptoms", methods=["GET"])
def get_symptoms():
    return jsonify({"symptoms": ml_service.get_symptoms()})

@predict_bp.route("/api/diseases", methods=["GET"])
def get_diseases():
    diseases = ml_service.get_diseases()
    return jsonify({"diseases": diseases, "count": len(diseases)})

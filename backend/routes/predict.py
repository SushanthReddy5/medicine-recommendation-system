from flask import Blueprint, request, jsonify
from services.ml_service import ml_service
from services.db_service  import db_service
from utils.validators import validate_predict_input

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/api/predict", methods=["POST"])
def predict():
    try:
        body                        = request.get_json(silent=True)
        symptom_input, top_n, error = validate_predict_input(body)

        if error:
            return jsonify({"error": error}), 400

        predictions = ml_service.predict(symptom_input, top_n)

        if not predictions:
            return jsonify({
                "error": "No recommendations found for the given symptoms. Try searching common symptoms like 'fever', 'headache', or 'cough'.",
                "symptoms": symptom_input
            }), 404

        method = "ml" if ml_service.is_loaded else "csv"

        # Save to MongoDB asynchronously / safely — never fail the user request if saving fails
        try:
            db_service.save_search(symptom_input, predictions, method)
        except Exception as db_err:
            print(f"⚠️ Search history not saved: {db_err}")

        return jsonify({
            "symptoms"   : symptom_input,
            "predictions": predictions,
            "method"     : method,
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

@predict_bp.route("/api/symptoms", methods=["GET"])
def get_symptoms():
    try:
        return jsonify({"symptoms": ml_service.get_symptoms()})
    except Exception as e:
        print(f"⚠️ get_symptoms error: {e}")
        return jsonify({"symptoms": []})

@predict_bp.route("/api/diseases", methods=["GET"])
def get_diseases():
    try:
        diseases = ml_service.get_diseases()
        return jsonify({"diseases": diseases, "count": len(diseases)})
    except Exception as e:
        print(f"⚠️ get_diseases error: {e}")
        return jsonify({"diseases": [], "count": 0})


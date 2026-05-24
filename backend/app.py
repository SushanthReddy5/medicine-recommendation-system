import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import config
from routes.predict      import predict_bp
from routes.history      import history_bp
from routes.chat         import chat_bp
from routes.interactions import interactions_bp
from routes.auth         import auth_bp

def create_app(env="development"):
    app = Flask(__name__)
    app.config.from_object(config[env])
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET", "mediassist-secret-key-2025")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

    CORS(app)
    JWTManager(app)

    app.register_blueprint(predict_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(interactions_bp)
    app.register_blueprint(auth_bp)

    @app.route("/api/health")
    def health():
        from services.ml_service       import ml_service
        from services.db_service       import db_service
        from services.chat_service     import chat_service
        from services.interaction_service import interaction_service
        return jsonify({
            "status"            : "ok",
            "ml_loaded"         : ml_service.is_loaded,
            "db_connected"      : db_service.is_connected,
            "chat_ready"        : chat_service.is_ready,
            "interactions_loaded": len(interaction_service.interactions) > 0,
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error."}), 500

    return app

if __name__ == "__main__":
    env = os.environ.get("FLASK_ENV", "development")
    app = create_app(env)
    app.run(
        host =app.config["HOST"],
        port =app.config["PORT"],
        debug=app.config["DEBUG"],
    )

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from datetime import timedelta
import bcrypt
from services.db_service    import db_service
from services.email_service import (
    generate_reset_token, verify_reset_token, send_reset_email
)

auth_bp = Blueprint("auth", __name__)

# ── Register ──────────────────────────────────────────────────────────────────
@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body is empty."}), 400

    for field in ["name", "email", "password"]:
        if not body.get(field, "").strip():
            return jsonify({"error": f"'{field}' is required."}), 400

    email    = body["email"].strip().lower()
    name     = body["name"].strip()
    password = body["password"]

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    if db_service.db["users"].find_one({"email": email}):
        return jsonify({"error": "Email already registered."}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user   = {
        "name"            : name,
        "email"           : email,
        "password"        : hashed,
        "age"             : body.get("age", ""),
        "gender"          : body.get("gender", ""),
        "blood_group"     : body.get("blood_group", ""),
        "allergies"       : body.get("allergies", ""),
        "phone"           : body.get("phone", ""),
        "emergency_contact": body.get("emergency_contact", ""),
    }
    result = db_service.db["users"].insert_one(user)
    token  = create_access_token(
        identity=str(result.inserted_id),
        expires_delta=timedelta(days=7)
    )
    return jsonify({
        "token": token,
        "user" : {"id": str(result.inserted_id), "name": name, "email": email}
    }), 201


# ── Login ─────────────────────────────────────────────────────────────────────
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body is empty."}), 400

    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = db_service.db["users"].find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid email or password."}), 401

    token = create_access_token(
        identity=str(user["_id"]),
        expires_delta=timedelta(days=7)
    )
    return jsonify({
        "token": token,
        "user" : {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
    })


# ── Get Profile ───────────────────────────────────────────────────────────────
@auth_bp.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def get_profile():
    from bson import ObjectId
    user_id = get_jwt_identity()
    user    = db_service.db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({
        "id"              : str(user["_id"]),
        "name"            : user.get("name", ""),
        "email"           : user.get("email", ""),
        "age"             : user.get("age", ""),
        "gender"          : user.get("gender", ""),
        "blood_group"     : user.get("blood_group", ""),
        "allergies"       : user.get("allergies", ""),
        "phone"           : user.get("phone", ""),
        "emergency_contact": user.get("emergency_contact", ""),
    })


# ── Update Profile ────────────────────────────────────────────────────────────
@auth_bp.route("/api/auth/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    from bson import ObjectId
    user_id = get_jwt_identity()
    body    = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body is empty."}), 400

    allowed = ["name", "age", "gender", "blood_group",
               "allergies", "phone", "emergency_contact", "avatar"]
    updates = {k: body[k] for k in allowed if k in body}
    db_service.db["users"].update_one(
        {"_id": ObjectId(user_id)}, {"$set": updates}
    )
    return jsonify({"message": "Profile updated successfully."})


# ── Forgot Password ───────────────────────────────────────────────────────────
@auth_bp.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    body  = request.get_json(silent=True)
    email = body.get("email", "").strip().lower() if body else ""

    if not email:
        return jsonify({"error": "Email is required."}), 400

    user = db_service.db["users"].find_one({"email": email})

    # Always return success to prevent email enumeration
    if not user:
        return jsonify({"message": "If this email exists, a reset link has been sent."})

    token   = generate_reset_token(email)
    success = send_reset_email(email, token)

    if not success:
        return jsonify({"error": "Failed to send email. Please try again."}), 500

    return jsonify({"message": "Password reset link sent! Check your inbox."})


# ── Reset Password ────────────────────────────────────────────────────────────
@auth_bp.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    body     = request.get_json(silent=True)
    token    = body.get("token", "") if body else ""
    password = body.get("password", "") if body else ""

    if not token or not password:
        return jsonify({"error": "Token and new password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    email = verify_reset_token(token)
    if not email:
        return jsonify({"error": "Reset link is invalid or has expired."}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    result = db_service.db["users"].update_one(
        {"email": email},
        {"$set": {"password": hashed}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "User not found."}), 404

    return jsonify({"message": "Password reset successfully! You can now log in."})

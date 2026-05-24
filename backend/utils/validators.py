def validate_predict_input(body):
    """
    Validates /api/predict request body.
    Returns (symptom_string, top_n, error_message)
    """
    if not body:
        return None, None, "Request body is empty."

    if "symptoms" not in body:
        return None, None, "Missing 'symptoms' field."

    raw = body["symptoms"]

    # Accept list or string
    if isinstance(raw, list):
        if len(raw) == 0:
            return None, None, "Symptoms list is empty."
        symptom_input = ", ".join([str(s).strip() for s in raw if str(s).strip()])
    elif isinstance(raw, str):
        symptom_input = raw.strip()
    else:
        return None, None, "'symptoms' must be a string or list."

    if len(symptom_input) < 2:
        return None, None, "Symptom input is too short."

    if len(symptom_input) > 500:
        return None, None, "Symptom input is too long (max 500 characters)."

    # Validate top_n
    top_n = body.get("top_n", 3)
    if not isinstance(top_n, int) or not (1 <= top_n <= 5):
        top_n = 3

    return symptom_input, top_n, None

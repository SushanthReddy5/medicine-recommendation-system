import os
import csv
import pickle
import numpy as np
from config import MODEL_DIR, DATA_PATH


class MLService:
    def __init__(self):
        self.vectorizer   = None
        self.clf_disease  = None
        self.clf_medicine = None
        self.le_disease   = None
        self.le_medicine  = None
        self.data         = []          # list of dicts, replaces pd.DataFrame
        self.disease_map  = {}          # {disease_name: row_dict} for fast lookup
        self.is_loaded    = False
        self._load_data()
        self._load_models()

    # ── Data loading (csv module instead of pandas) ──────────────────────

    def _load_data(self):
        try:
            with open(DATA_PATH, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                self.data = [row for row in reader]
            # build lookup dict
            for row in self.data:
                d = row.get("disease", "").strip()
                if d and d not in self.disease_map:
                    self.disease_map[d] = row
            print(f"✅ Dataset loaded: {len(self.data)} rows")
        except Exception as e:
            print(f"❌ Dataset load failed: {e}")
            self.data        = []
            self.disease_map = {}

    # ── Model loading ─────────────────────────────────────────────────────

    def _load_models(self):
        try:
            def _load(name):
                with open(os.path.join(MODEL_DIR, name), "rb") as f:
                    return pickle.load(f)
            self.vectorizer   = _load("vectorizer.pkl")
            self.clf_disease  = _load("clf_disease.pkl")
            self.clf_medicine = _load("clf_medicine.pkl")
            self.le_disease   = _load("le_disease.pkl")
            self.le_medicine  = _load("le_medicine.pkl")
            self.is_loaded    = True
            print("✅ ML models loaded")
        except FileNotFoundError as e:
            print(f"⚠️  ML models not found: {e} — CSV fallback active")

    # ── Helpers ───────────────────────────────────────────────────────────

    def normalize(self, s):
        parts = [x.strip().lower() for x in s.replace(",", " ").split()]
        return " ".join(sorted(set(parts)))

    # ── Prediction entry point ────────────────────────────────────────────

    def predict(self, symptom_input, top_n=3):
        if self.is_loaded:
            return self._predict_ml(symptom_input, top_n)
        return self._predict_csv(symptom_input)

    # ── ML path ───────────────────────────────────────────────────────────

    def _predict_ml(self, symptom_input, top_n=3):
        vec   = self.vectorizer.transform([self.normalize(symptom_input)])
        proba = self.clf_disease.predict_proba(vec)[0]
        top   = np.argsort(proba)[::-1][:top_n]
        results = []
        for idx in top:
            disease    = self.le_disease.classes_[idx]
            confidence = round(float(proba[idx]) * 100, 1)
            row        = self.disease_map.get(disease)
            if row:
                results.append({
                    "disease"     : disease,
                    "confidence"  : confidence,
                    "medicine"    : row.get("medicine", "Unknown"),
                    "description" : row.get("description", "Consult a doctor."),
                    "side_effects": row.get("side_effects", "Unknown"),
                    "severity"    : row.get("severity", "unknown"),
                })
            else:
                med = self.le_medicine.classes_[self.clf_medicine.predict(vec)[0]]
                results.append({
                    "disease"     : disease,
                    "confidence"  : confidence,
                    "medicine"    : med,
                    "description" : "Consult a doctor.",
                    "side_effects": "Unknown",
                    "severity"    : "unknown",
                })
        return results

    # ── CSV fallback path ─────────────────────────────────────────────────

    def _predict_csv(self, symptom_input):
        s = symptom_input.lower().strip()
        # exact match first
        for row in self.data:
            if row.get("symptoms", "").lower() == s:
                return [self._row_to_result(row, 70.0)]
        # partial match
        for row in self.data:
            if s in row.get("symptoms", "").lower():
                return [self._row_to_result(row, 60.0)]
        return []

    def _row_to_result(self, row, confidence):
        return {
            "disease"     : row.get("disease", "Unknown"),
            "confidence"  : confidence,
            "medicine"    : row.get("medicine", "Unknown"),
            "description" : row.get("description", "Consult a doctor."),
            "side_effects": row.get("side_effects", "Unknown"),
            "severity"    : row.get("severity", "unknown"),
        }

    # ── Utility ───────────────────────────────────────────────────────────

    def get_symptoms(self):
        syms = set()
        for row in self.data:
            for part in row.get("symptoms", "").replace(",", " ").split():
                syms.add(part.strip().lower())
        return sorted(syms)

    def get_diseases(self):
        return sorted(set(row.get("disease", "") for row in self.data if row.get("disease")))


# Single instance shared across the app
ml_service = MLService()

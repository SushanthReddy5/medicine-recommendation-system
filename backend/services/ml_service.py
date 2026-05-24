import os
import pickle
import numpy as np
import pandas as pd
from config import MODEL_DIR, DATA_PATH

class MLService:
    def __init__(self):
        self.vectorizer   = None
        self.clf_disease  = None
        self.clf_medicine = None
        self.le_disease   = None
        self.le_medicine  = None
        self.data         = None
        self.is_loaded    = False
        self._load_data()
        self._load_models()

    def _load_data(self):
        try:
            self.data = pd.read_csv(DATA_PATH)
            print(f"✅ Dataset loaded: {len(self.data)} rows")
        except Exception as e:
            print(f"❌ Dataset load failed: {e}")
            self.data = pd.DataFrame()

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

    def normalize(self, s):
        parts = [x.strip().lower() for x in s.replace(",", " ").split()]
        return " ".join(sorted(set(parts)))

    def predict(self, symptom_input, top_n=3):
        if self.is_loaded:
            return self._predict_ml(symptom_input, top_n)
        return self._predict_csv(symptom_input)

    def _predict_ml(self, symptom_input, top_n=3):
        vec   = self.vectorizer.transform([self.normalize(symptom_input)])
        proba = self.clf_disease.predict_proba(vec)[0]
        top   = np.argsort(proba)[::-1][:top_n]
        results = []
        for idx in top:
            disease    = self.le_disease.classes_[idx]
            confidence = round(float(proba[idx]) * 100, 1)
            match      = self.data[self.data["disease"] == disease]
            if not match.empty:
                row = match.iloc[0]
                results.append({
                    "disease"     : disease,
                    "confidence"  : confidence,
                    "medicine"    : row["medicine"],
                    "description" : row["description"],
                    "side_effects": row["side_effects"],
                    "severity"    : row["severity"],
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

    def _predict_csv(self, symptom_input):
        s = symptom_input.lower().strip()
        r = self.data[self.data["symptoms"].str.lower() == s]
        if r.empty:
            r = self.data[self.data["symptoms"].str.lower().str.contains(s, na=False)]
        if not r.empty:
            row = r.iloc[0]
            return [{
                "disease"     : row["disease"],
                "confidence"  : 70.0,
                "medicine"    : row["medicine"],
                "description" : row["description"],
                "side_effects": row["side_effects"],
                "severity"    : row["severity"],
            }]
        return []

    def get_symptoms(self):
        syms = set()
        for s in self.data["symptoms"].dropna():
            for p in s.replace(",", " ").split():
                syms.add(p.strip().lower())
        return sorted(syms)

    def get_diseases(self):
        return sorted(self.data["disease"].unique().tolist())


# Single instance shared across the app
ml_service = MLService()

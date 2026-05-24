import os, pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "backend", "dataset.csv")
MODEL_DIR = BASE_DIR

def normalize_symptoms(s):
    parts = [x.strip().lower() for x in s.replace(",", " ").split()]
    return " ".join(sorted(set(parts)))

def load_data():
    df = pd.read_csv(DATA_PATH)
    df["symptoms_clean"] = df["symptoms"].apply(normalize_symptoms)
    print(f"\n📊 Dataset: {len(df)} rows | {df['disease'].nunique()} diseases | {df['medicine'].nunique()} medicines")
    return df

def train(df):
    le_disease  = LabelEncoder()
    le_medicine = LabelEncoder()
    y_dis = le_disease.fit_transform(df["disease"])
    y_med = le_medicine.fit_transform(df["medicine"])

    vectorizer = TfidfVectorizer(ngram_range=(1,2), max_features=1000, sublinear_tf=True)
    X = vectorizer.fit_transform(df["symptoms_clean"])

    X_tr, X_te, yd_tr, yd_te, ym_tr, ym_te = train_test_split(
        X, y_dis, y_med, test_size=0.2, random_state=42
    )

    print("\n🌲 Training disease classifier ...")
    clf_d = RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42, n_jobs=-1)
    clf_d.fit(X_tr, yd_tr)

    print("💊 Training medicine classifier ...")
    clf_m = RandomForestClassifier(n_estimators=200, class_weight="balanced", random_state=42, n_jobs=-1)
    clf_m.fit(X_tr, ym_tr)

    d_acc = accuracy_score(yd_te, clf_d.predict(X_te)) * 100
    m_acc = accuracy_score(ym_te, clf_m.predict(X_te)) * 100
    print(f"\n📈 Disease Accuracy : {d_acc:.1f}%")
    print(f"📈 Medicine Accuracy: {m_acc:.1f}%")

    for fname, obj in [("vectorizer.pkl", vectorizer), ("clf_disease.pkl", clf_d),
                       ("clf_medicine.pkl", clf_m), ("le_disease.pkl", le_disease),
                       ("le_medicine.pkl", le_medicine)]:
        with open(os.path.join(MODEL_DIR, fname), "wb") as f:
            pickle.dump(obj, f)
        print(f"   ✅ Saved {fname}")

    print("\n🎉 All models saved!\n")
    return vectorizer, clf_d, clf_m, le_disease, le_medicine

def predict_top3(symptom_input, vectorizer, clf_d, clf_m, le_d, le_m, df, top_n=3):
    clean = normalize_symptoms(symptom_input)
    vec   = vectorizer.transform([clean])
    proba = clf_d.predict_proba(vec)[0]
    top   = np.argsort(proba)[::-1][:top_n]
    results = []
    for idx in top:
        disease    = le_d.classes_[idx]
        confidence = round(float(proba[idx]) * 100, 1)
        match = df[df["disease"] == disease]
        if not match.empty:
            row = match.iloc[0]
            results.append({"disease": disease, "confidence": confidence,
                             "medicine": row["medicine"], "description": row["description"],
                             "side_effects": row["side_effects"], "severity": row["severity"]})
        else:
            med = le_m.classes_[clf_m.predict(vec)[0]]
            results.append({"disease": disease, "confidence": confidence,
                             "medicine": med, "description": "Consult a doctor.",
                             "side_effects": "Unknown", "severity": "unknown"})
    return results

if __name__ == "__main__":
    df = load_data()
    vectorizer, clf_d, clf_m, le_d, le_m = train(df)
    print("── Smoke Test ──────────────────────────────────────────────")
    for inp in ["fever headache body ache", "cough sore throat fever",
                "chest pain shortness of breath", "fatigue weight gain cold"]:
        print(f"\n🔍 '{inp}'")
        for i, p in enumerate(predict_top3(inp, vectorizer, clf_d, clf_m, le_d, le_m, df), 1):
            bar = "█" * int(p["confidence"] / 5)
            print(f"   #{i} [{bar:<20}] {p['confidence']:5.1f}%  {p['disease']:<35} → {p['medicine']}")

# 🏥 MediAssist — Online Medicine Recommendation System

AI-powered symptom checker that predicts diseases and recommends medicines using ML.

---

## 📁 Project Structure

```
medicine-recommendation-system/
├── backend/
│   ├── app.py              # Flask REST API
│   ├── dataset.csv         # 40+ symptoms & medicines
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── SymptomChecker.js  # React UI
├── ml_model/
│   └── train.py            # TF-IDF + Random Forest training
├── render.yaml             # Cloud deployment config
└── Procfile
```

---

## 🚀 Local Setup

### 1. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt

# Train ML model first
cd ../ml_model
python train.py

# Run backend
cd ../backend
python app.py
# → API running at http://localhost:5000
```

### 2. Frontend (React)

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
# → App running at http://localhost:3000
```

---

## ☁️ Deploy to Render.com (Free)

1. Push this project to a GitHub repository
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will auto-read `render.yaml` and deploy both services

**Backend URL**: `https://mediassist-backend.onrender.com`  
**Frontend URL**: `https://mediassist-frontend.onrender.com`

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/symptoms` | All known symptoms (autocomplete) |
| GET | `/api/diseases` | All diseases in dataset |
| POST | `/api/predict` | Predict disease & medicine |

### POST `/api/predict`
```json
// Request
{ "symptom": "fever" }

// Response
{
  "symptom": "fever",
  "disease": "Flu",
  "medicine": "Paracetamol",
  "description": "Take 500mg every 6 hours with water",
  "confidence": 92.5,
  "method": "ml"
}
```

---

## 🧠 ML Model

- **Algorithm**: Random Forest Classifier (100 trees)
- **Features**: TF-IDF vectorization of symptom text (1-2 grams)
- **Two models**: One for disease prediction, one for medicine prediction
- **Fallback**: If models not found, falls back to CSV exact/partial match

---

## ⚠️ Disclaimer

This tool is for **educational purposes only**. Always consult a qualified healthcare professional before taking any medication.

# PulseIQ — Cardiovascular Disease Prediction

> AI-powered heart disease risk assessment using a stacking ensemble of three machine learning models.

Built by **Manvendra Singh**

---

## What It Does

PulseIQ takes 13 clinical biomarkers as input and predicts whether a patient is at **High Risk** or **Low Risk** for cardiovascular disease. It uses a stacking ensemble (Logistic Regression + Random Forest + XGBoost) trained on the UCI Cleveland Heart Disease dataset.

---

## Project Structure

```
pulseiq/
├── app.py                          # Flask web server — routes and prediction logic
├── requirements.txt                # Python dependencies
├── train_model.ipynb               # Production training notebook (step-by-step with markdowns)
├── research_exploration.ipynb      # Full research notebook — 5 models, Optuna, SHAP, LIME, DNN, Federated Learning
│
├── data/
│   └── cleveland_heart_disease.csv # UCI Cleveland Heart Disease dataset (297 records, 14 columns)
│
├── models/
│   ├── stacking_ensemble_heart_disease.pkl  # Trained stacking model
│   └── scaler.pkl                           # Fitted StandardScaler
│
├── templates/
│   └── index.html                  # Frontend UI (multi-step form)
│
└── static/
    ├── css/style.css
    └── js/main.js
```

---

## ML Architecture

```
Input (13 features)
        │
        ▼
  StandardScaler
        │
        ▼
┌───────────────────────────────┐
│        Level 0 — Base Models  │
│  ┌─────────────────────────┐  │
│  │  Logistic Regression    │  │
│  │  Random Forest (100)    │  │
│  │  XGBoost                │  │
│  └─────────────────────────┘  │
└───────────────┬───────────────┘
                │  (5-fold CV predictions)
                ▼
┌───────────────────────────────┐
│   Level 1 — Meta-Learner      │
│   Logistic Regression         │
└───────────────┬───────────────┘
                │
                ▼
     Risk Probability (0–1)
     Threshold = 0.4
                │
        ┌───────┴───────┐
        ▼               ▼
    Low Risk        High Risk
```

**Why threshold 0.4?** In medical diagnosis, a false negative (missing a real disease) is more dangerous than a false positive. Lowering the threshold increases sensitivity.

---

## Dataset

| Property | Value |
|----------|-------|
| Source | UCI Machine Learning Repository — Cleveland Heart Disease |
| File | `data/cleveland_heart_disease.csv` |
| Rows | 297 patients |
| Features | 13 clinical biomarkers |
| Target | `Heart_disease` (0 = No Disease, 1 = Disease) |
| Balance | 160 No Disease / 137 Disease |

**Features used:**
Age, Sex, Chest Pain Type, Resting Blood Pressure, Cholesterol, Fasting Blood Sugar, ECG Results, Max Heart Rate, Exercise Induced Angina, ST Depression, ST Slope, Major Vessels, Thalassemia Type

---

## Notebooks

### `train_model.ipynb` — Production Training
Step-by-step notebook that trains the exact model used in `app.py`. Each step has a markdown explanation:
1. Load Dataset
2. Data Quality Check
3. Feature / Target Split
4. Train / Test Split
5. Feature Scaling
6. Build Stacking Ensemble
7. Train the Model
8. Evaluate Performance
9. Feature Importance
10. Save Models

### `research_exploration.ipynb` — Research & Learning
Full exploration notebook covering:
- 5 individual models (LR, SVM, KNN, RF, XGBoost)
- RandomizedSearchCV hyperparameter tuning
- GridSearchCV hyperparameter tuning
- Optuna hyperparameter optimization
- Voting & Stacking Ensembles
- SHAP explainability
- LIME explainability
- Deep Neural Network (Keras)
- Federated Learning hybrid approach

---

## How to Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the model (if models/ folder is empty)
Open and run `train_model.ipynb` top to bottom. It saves:
- `models/stacking_ensemble_heart_disease.pkl`
- `models/scaler.pkl`

### 3. Start the Flask server
```bash
python app.py
```

Open `http://localhost:5000` in your browser.

---

## API

**POST** `/predict`

Request body (JSON):
```json
{
  "age": 52, "sex": 1, "cp": 0,
  "trestbps": 125, "chol": 212, "fbs": 0,
  "restecg": 1, "thalach": 168, "exang": 0,
  "oldpeak": 1.0, "slope": 2, "ca": 2, "thal": 7
}
```

Response:
```json
{
  "status": "success",
  "probability": 34.21,
  "prediction": 0
}
```
`prediction`: `1` = High Risk, `0` = Low Risk

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| ML | scikit-learn, XGBoost, joblib |
| Frontend | HTML, CSS, Vanilla JS |
| Dataset | UCI Cleveland Heart Disease |

---

*For informational purposes only. Not a substitute for professional medical advice.*

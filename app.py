from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load trained model and scaler from models/ directory
MODEL_PATH  = os.path.join(os.path.dirname(__file__), 'models', 'stacking_ensemble_heart_disease.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'scaler.pkl')

model  = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Lower threshold (0.4 instead of 0.5) — in medical diagnosis,
# missing a real disease case is more dangerous than a false alarm.
THRESHOLD = 0.4


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Build feature array in the exact order the model was trained on:
        # Age, Sex, Chest_pain, Resting_blood_pressure, Cholesterol,
        # Fasting_Blood_Sugar, ECG_results, Maximum_heart_rate,
        # Exercise_induced_angina, ST_depression, ST_slope,
        # Major_vessels, Thalassemia_types
        features = np.array([[
            float(data['age']),
            float(data['sex']),
            float(data['cp']),
            float(data['trestbps']),
            float(data['chol']),
            float(data['fbs']),
            float(data['restecg']),
            float(data['thalach']),
            float(data['exang']),
            float(data['oldpeak']),
            float(data['slope']),
            float(data['ca']),
            float(data['thal'])
        ]])

        # Scale features using the same scaler fitted during training
        features_scaled = scaler.transform(features)

        # Get probability of class 1 (Heart Disease)
        prob       = model.predict_proba(features_scaled)[0][1]
        prediction = int(prob >= THRESHOLD)

        return jsonify({
            "status":      "success",
            "probability": round(prob * 100, 2),
            "prediction":  prediction   # 1 = High Risk, 0 = Low Risk
        })

    except KeyError as e:
        return jsonify({"status": "error", "message": f"Missing field: {e}"}), 400

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

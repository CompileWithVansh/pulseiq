// PulseIQ — main.js

// ── Nav ──────────────────────────────────────
function toggleMenu() {
    document.getElementById('mobileMenu').classList.toggle('open');
}

function scrollToAssessment() {
    document.getElementById('assessment').scrollIntoView({ behavior: 'smooth' });
}

// ── Wizard ───────────────────────────────────
let currentStep = 1;

function nextStep(step) {
    if (!validateStep(currentStep)) return;
    setStep(step);
}

function prevStep(step) {
    setStep(step);
}

function setStep(step) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`s-step-${currentStep}`).classList.remove('active');
    currentStep = step;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    document.getElementById(`s-step-${currentStep}`).classList.add('active');
}

function validateStep(step) {
    const inputs = document.getElementById(`step-${step}`).querySelectorAll('input[required]');
    let valid = true;
    inputs.forEach(input => {
        if (!input.value) {
            input.style.borderColor = 'rgba(239,68,68,0.6)';
            input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
            valid = false;
        } else {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }
    });
    return valid;
}

// ── Submit ───────────────────────────────────
async function submitData() {
    if (!validateStep(3)) return;

    const panel = document.getElementById('result-panel');
    panel.classList.remove('hidden', 'state-danger', 'state-safe');

    // Reset to loading state
    document.getElementById('res-icon').innerHTML = '<div class="spinner"></div>';
    document.getElementById('res-title').textContent = 'Analyzing biomarkers...';
    document.getElementById('res-desc').textContent = 'Running ensemble model across 13 clinical parameters.';
    document.getElementById('res-percent').textContent = '—';
    document.getElementById('risk-fill').style.width = '0%';

    const payload = {
        age:      document.getElementById('age').value,
        sex:      document.getElementById('sex').value,
        cp:       document.getElementById('cp').value,
        trestbps: document.getElementById('trestbps').value,
        chol:     document.getElementById('chol').value,
        fbs:      document.getElementById('fbs').value,
        restecg:  document.getElementById('restecg').value,
        thalach:  document.getElementById('thalach').value,
        exang:    document.getElementById('exang').value,
        oldpeak:  document.getElementById('oldpeak').value,
        slope:    document.getElementById('slope').value,
        ca:       document.getElementById('ca').value,
        thal:     document.getElementById('thal').value
    };

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        // Slight delay for UX
        setTimeout(() => renderResult(data), 1800);

    } catch (err) {
        panel.classList.add('hidden');
        alert('Connection error. Make sure the server is running.');
    }
}

function renderResult(data) {
    const panel   = document.getElementById('result-panel');
    const icon    = document.getElementById('res-icon');
    const title   = document.getElementById('res-title');
    const desc    = document.getElementById('res-desc');
    const percent = document.getElementById('res-percent');
    const fill    = document.getElementById('risk-fill');

    percent.textContent = `${data.probability}%`;
    fill.style.width = `${data.probability}%`;

    if (data.prediction === 1) {
        panel.classList.add('state-danger');
        icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        title.textContent = 'Elevated Risk Detected';
        desc.textContent = 'The ensemble model indicates a significant likelihood of cardiovascular disease. Please consult a cardiologist promptly.';
    } else {
        panel.classList.add('state-safe');
        icon.innerHTML = '<i class="fa-solid fa-shield-heart"></i>';
        title.textContent = 'Healthy Cardiac Profile';
        desc.textContent = 'Your biomarkers are within a healthy range. Maintain your lifestyle and schedule regular checkups.';
    }
}

function resetTool() {
    document.getElementById('result-panel').classList.add('hidden');
    document.getElementById('pulseForm').reset();
    setStep(1);
    currentStep = 1;
}

import { useState } from "react";
import api from "../services/api.js";

export default function AI() {
  const [predictionForm, setPredictionForm] = useState({ lastVaccinationDate: "", intervalMonths: 12 });
  const [riskForm, setRiskForm] = useState({ age: 1, vaccinationStatus: "unknown", symptoms: "" });
  const [prediction, setPrediction] = useState(null);
  const [risk, setRisk] = useState(null);

  const runPrediction = async () => {
    const resp = await api.post("/ai/predict-vaccination", predictionForm);
    setPrediction(resp.data);
  };

  const runRisk = async () => {
    const resp = await api.post("/ai/health-risk", {
      ...riskForm,
      symptoms: riskForm.symptoms.split(",").map((item) => item.trim()).filter(Boolean)
    });
    setRisk(resp.data);
  };

  return (
    <div className="section">
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Smart AI</p>
          <h1>Vaccination and health guidance</h1>
          <p>Run lightweight predictions for vaccine timing and pet health risk scoring.</p>
        </div>
      </div>

      <div className="grid-two content-start">
        <div className="module-card">
          <h2>Vaccination prediction</h2>
          <input type="date" value={predictionForm.lastVaccinationDate} onChange={(e) => setPredictionForm({ ...predictionForm, lastVaccinationDate: e.target.value })} />
          <input type="number" value={predictionForm.intervalMonths} onChange={(e) => setPredictionForm({ ...predictionForm, intervalMonths: e.target.value })} min="1" />
          <button className="primary-button" type="button" onClick={runPrediction}>Predict next dose</button>
          {prediction && (
            <div className="result-block">
              <strong>{new Date(prediction.predictedDate).toLocaleDateString()}</strong>
              <p>{prediction.recommendation}</p>
            </div>
          )}
        </div>

        <div className="module-card">
          <h2>Health risk score</h2>
          <input type="number" value={riskForm.age} onChange={(e) => setRiskForm({ ...riskForm, age: e.target.value })} min="0" />
          <select value={riskForm.vaccinationStatus} onChange={(e) => setRiskForm({ ...riskForm, vaccinationStatus: e.target.value })}>
            <option value="unknown">Unknown</option>
            <option value="upToDate">Up to date</option>
            <option value="dueSoon">Due soon</option>
            <option value="overdue">Overdue</option>
          </select>
          <textarea rows="4" placeholder="Comma separated symptoms" value={riskForm.symptoms} onChange={(e) => setRiskForm({ ...riskForm, symptoms: e.target.value })} />
          <button className="primary-button" type="button" onClick={runRisk}>Assess risk</button>
          {risk && (
            <div className="result-block">
              <strong>{risk.level} risk</strong>
              <p>Score: {risk.riskScore}</p>
              <p>{(risk.suggestions || []).join(" • ")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
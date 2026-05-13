export async function predictVaccination(req, res) {
  const { lastVaccinationDate, intervalMonths = 12 } = req.body;
  const baseDate = lastVaccinationDate ? new Date(lastVaccinationDate) : new Date();
  const predictedDate = new Date(baseDate);
  predictedDate.setMonth(predictedDate.getMonth() + Number(intervalMonths));

  res.json({
    predictedDate,
    confidence: 0.82,
    recommendation: "Schedule a reminder two weeks before the predicted due date."
  });
}

export async function healthRisk(req, res) {
  const { age = 1, vaccinationStatus = "unknown", symptoms = [] } = req.body;
  const score = Math.min(100, age * 4 + symptoms.length * 12 + (vaccinationStatus === "overdue" ? 35 : 8));

  res.json({
    riskScore: score,
    level: score > 65 ? "high" : score > 35 ? "medium" : "low",
    suggestions: ["Consult a veterinarian for persistent symptoms", "Keep vaccination records updated"]
  });
}

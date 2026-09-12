import { jsPDF } from "jspdf";

/**
 * generateClientPdfReport
 * Generates and automatically downloads a beautifully formatted, clinical-grade
 * PDF screening report directly inside the user's browser (zero server dependency).
 */
export function generateClientPdfReport(answers = {}, result = {}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const patientName = answers.patient?.name || answers.patient_name || "Patient";
  const patientAge = answers.age || answers.patient?.age || "—";
  const patientSex = (answers.sex || answers.patient?.sex || "—").toUpperCase();
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const reportId = "NX-" + Math.floor(100000 + Math.random() * 900000);

  const plt = parseFloat(answers.platelet_count) || 0;
  const hb = parseFloat(answers.haemoglobin) || 0;
  const pdw = parseFloat(answers.pdw) || 0;
  const wbc = parseFloat(answers.wbc_count) || 0;

  const riskLevel = result.risk_level || "Low";
  const probPct = Math.round((result.probability || 0.1) * 100);

  // Colors
  const navy = [15, 23, 42];
  const slate = [100, 116, 139];
  const primaryBlue = [37, 99, 235];
  const lightBg = [248, 250, 252];

  let riskColor = [34, 197, 94]; // Green for low
  let riskBg = [240, 253, 244];
  if (riskLevel === "High") {
    riskColor = [239, 68, 68]; // Red
    riskBg = [254, 242, 242];
  } else if (riskLevel === "Moderate") {
    riskColor = [245, 158, 11]; // Amber
    riskBg = [255, 251, 235];
  }

  // Header Banner
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("NEXUS AI  |  Clinical Screening & Decision Support", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Automated Dengue Risk Prediction Report", 14, 18);

  doc.setFontSize(8);
  doc.text(`Report ID: ${reportId}`, 196, 11, { align: "right" });
  doc.text(`Date: ${reportDate}`, 196, 17, { align: "right" });

  // Patient Info Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, 28, 182, 22, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 28, 182, 22, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text("PATIENT DEMOGRAPHICS", 18, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: `, 18, 41);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text(`${patientName}`, 30, 41);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Age: `, 85, 41);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text(`${patientAge} yrs`, 94, 41);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Sex: `, 135, 41);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text(`${patientSex}`, 144, 41);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Source: `, 18, 46);
  doc.setFont("helvetica", "normal");
  doc.text(`${answers.report_info?.filename || "Screening Questionnaire / Digital Upload"}`, 32, 46);

  // Risk Assessment Banner
  doc.setFillColor(...riskBg);
  doc.roundedRect(14, 54, 182, 24, 2, 2, "F");
  doc.setDrawColor(...riskColor);
  doc.setLineWidth(0.6);
  doc.roundedRect(14, 54, 182, 24, 2, 2, "S");

  doc.setTextColor(...riskColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`AI PREDICTION: ${riskLevel.toUpperCase()} DENGUE RISK`, 18, 63);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Risk Probability: ${probPct}%`, 192, 63, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const msgText = result.message || (riskLevel === "High"
    ? "High dengue risk detected based on acute thrombocytopenia and laboratory markers. Immediate physician consultation advised."
    : "Low to moderate dengue risk indicated. Maintain hydration and monitor clinical signs.");
  doc.text(msgText, 18, 71, { maxWidth: 174 });

  // Laboratory Parameters Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text("EVALUATED BLOOD PARAMETERS (CBC PANEL)", 14, 86);

  // Table Header
  const startY = 90;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, 182, 8, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.rect(14, startY, 182, 8, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text("Parameter", 18, startY + 5.5);
  doc.text("Observed Value", 80, startY + 5.5);
  doc.text("Reference Range", 125, startY + 5.5);
  doc.text("Clinical Status", 168, startY + 5.5);

  // Rows
  const params = [
    {
      name: "Platelet Count",
      val: `${plt ? plt.toLocaleString() : "—"} cells/µL`,
      ref: "150,000 – 450,000 cells/µL",
      status: plt < 100000 ? "LOW (Critical Alert)" : plt < 150000 ? "Mildly Low" : "Normal",
      alert: plt < 100000,
    },
    {
      name: "Haemoglobin (Hb)",
      val: `${hb || "—"} g/dL`,
      ref: "12.0 – 17.5 g/dL",
      status: hb > 16.5 ? "ELEVATED (Hemoconcentration)" : hb < 12.0 ? "Low" : "Normal",
      alert: hb > 16.5,
    },
    {
      name: "PDW (Platelet Width)",
      val: `${pdw ? pdw + "%" : "—"}`,
      ref: "9.0% – 17.0%",
      status: pdw > 16.0 ? "ELEVATED (Active Turnover)" : "Normal",
      alert: pdw > 16.0,
    },
    {
      name: "WBC Count",
      val: `${wbc ? wbc.toLocaleString() : "—"} cells/µL`,
      ref: "4,000 – 11,000 cells/µL",
      status: wbc < 4000 ? "Leukopenia" : "Normal",
      alert: wbc < 4000,
    },
  ];

  let currentY = startY + 8;
  params.forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 8.5, "F");
    }
    doc.rect(14, currentY, 182, 8.5, "S");

    doc.setFont("helvetica", p.alert ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(p.name, 18, currentY + 5.5);
    doc.text(p.val, 80, currentY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    doc.text(p.ref, 125, currentY + 5.5);

    if (p.alert) {
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "normal");
    }
    doc.text(p.status, 168, currentY + 5.5);

    currentY += 8.5;
  });

  // Clinical Guidance & Care Protocols
  currentY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...navy);
  doc.text("CRITICAL CARE & MANAGEMENT PROTOCOL", 14, currentY);

  currentY += 4;
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, currentY, 182, 54, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 54, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  doc.text("1. Emergency Warning Signs (Hospitalize Immediately):", 18, currentY + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("• Severe persistent abdominal pain or tenderness\n• Spontaneous mucosal bleeding (gums, nose, black stools)\n• Persistent vomiting (≥ 3 episodes in 24 hours)\n• Rapid drop in platelet count below 50,000 cells/µL", 22, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryBlue);
  doc.text("2. Hydration & Fluid Balance Protocol:", 18, currentY + 31);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("• Maintain oral rehydration (2.5 – 3 Liters daily) via ORS, tender coconut water, and clear broth.\n• Serial CBC testing every 24–48 hours to assess platelet nadir and hematocrit.", 22, currentY + 36);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 83, 9);
  doc.text("3. Strict Medication Warning:", 18, currentY + 45);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text("• DO NOT take Aspirin, Ibuprofen, Diclofenac, or other NSAIDs (triggers internal haemorrhage).\n• Use Paracetamol ONLY under professional medical advice for fever reduction.", 22, currentY + 50);

  // AI Model Verification & Transparency
  currentY += 60;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...slate);
  doc.text("AI ALGORITHM SPECIFICATIONS", 14, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Model: Clinical Safe Random Forest Ensemble (Experiment C)  |  Test Accuracy: 98.99%  |  F1-Score: 0.9925\n` +
    `Evaluated Features: Platelet Count (67.0%), PDW (28.1%), Haemoglobin (0.9%), Age (4.0%), Sex (0.1%)`,
    14,
    currentY + 4
  );

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 275, 196, 275);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Medical Disclaimer: Nexus AI provides clinical decision support and risk stratification only. It does NOT constitute a formal diagnosis.\n" +
    "Definitive dengue confirmation requires Dengue NS1 Antigen or IgM/IgG ELISA testing interpreted by a licensed physician.",
    14,
    280
  );
  doc.text("Page 1 of 1", 196, 280, { align: "right" });

  // Trigger download directly in browser
  const cleanName = patientName.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `NexusAI_Screening_Report_${cleanName}.pdf`;
  doc.save(fileName);
  return fileName;
}

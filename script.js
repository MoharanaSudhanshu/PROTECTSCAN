let currentStep = 1;
let selectedRole = "";
let selectedEncryption = "aes";
let selectedModel = "efficientnet";
let uploadedFile = null;

// Sample credentials
const validCredentials = {
  admin: "admin",
};

function updateImageEncryptionView() {
  const encryptYes = document.getElementById("encrypt-yes").checked;
  const img = document.getElementById("original-mammogram-preview");
  const overlayText = document.querySelector(".image-overlay-text");

  if (encryptYes) {
    img.style.filter = "blur(2.5px) brightness(0.92) saturate(1.1)";
    overlayText.style.display = "block";
  } else {
    img.style.filter = "none";
    overlayText.style.display = "none";
  }
}

// Login
document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (
    validCredentials[username] &&
    validCredentials[username] === password &&
    selectedRole
  ) {
    alert(`Welcome, ${selectedRole}!`);
    nextStep();
  } else {
    alert("Invalid credentials or role not selected!");
  }
});

// Role selection
document.querySelectorAll(".role-card").forEach((card) => {
  card.addEventListener("click", function () {
    document
      .querySelectorAll(".role-card")
      .forEach((c) => c.classList.remove("selected"));

    this.classList.add("selected");
    selectedRole = this.dataset.role;
  });
});

// Encryption selection
document.querySelectorAll(".encryption-card").forEach((card) => {
  card.addEventListener("click", function () {
    document
      .querySelectorAll(".encryption-card")
      .forEach((c) => c.classList.remove("selected"));

    this.classList.add("selected");
    selectedEncryption = this.dataset.encryption;
  });
});

// Model selection
document.querySelectorAll(".model-card").forEach((card) => {
  card.addEventListener("click", function () {
    document
      .querySelectorAll(".model-card")
      .forEach((c) => c.classList.remove("selected"));

    this.classList.add("selected");

    let model = this.dataset.model;

    if (model === "custom") {
      selectedModel = "customcnn";
    } else {
      selectedModel = model;
    }
  });
});

// Upload Elements
const imageUploadArea = document.getElementById("image-upload-area");
const mammogramUploadInput = document.getElementById("mammogram-upload");
const originalMammogramPreview = document.getElementById(
  "original-mammogram-preview",
);
const imageDisplayCard = document.getElementById("image-display-card");
const loadingOverlay = document.getElementById("loading-overlay");

// Upload Click
imageUploadArea.addEventListener("click", () => {
  mammogramUploadInput.click();
});

// Drag Events
imageUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  imageUploadArea.classList.add("active");
});

imageUploadArea.addEventListener("dragleave", () => {
  imageUploadArea.classList.remove("active");
});

imageUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  imageUploadArea.classList.remove("active");

  if (e.dataTransfer.files.length > 0) {
    mammogramUploadInput.files = e.dataTransfer.files;
    handleMammogramUpload();
  }
});

mammogramUploadInput.addEventListener("change", handleMammogramUpload);

// Upload Function
function handleMammogramUpload() {
  if (mammogramUploadInput.files && mammogramUploadInput.files[0]) {
    uploadedFile = mammogramUploadInput.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      originalMammogramPreview.src = e.target.result;
      imageDisplayCard.style.display = "block";
      imageUploadArea.style.display = "none";

      updateImageEncryptionView();
    };

    reader.readAsDataURL(uploadedFile);
  }
}

// Next Step
function nextStep() {
  const sections = [
    "login-section",
    "config-section",
    "upload-predict-section",
    "results-section",
  ];

  if (currentStep < sections.length) {
    if (currentStep === 1 && !selectedRole) {
      alert("Please select your role.");
      return;
    }

    if (currentStep === 3 && !uploadedFile) {
      alert("Please upload an image.");
      return;
    }

    if (currentStep === 3 && !selectedModel) {
      alert("Please select a model.");
      return;
    }

    document
      .querySelectorAll(".section")
      .forEach((section) => section.classList.remove("active"));

    document.getElementById(`step${currentStep}`).classList.add("completed");

    document.getElementById(`step${currentStep}`).classList.remove("active");

    currentStep++;

    document.getElementById(sections[currentStep - 1]).classList.add("active");

    document.getElementById(`step${currentStep}`).classList.add("active");

    if (currentStep === sections.length) {
      runPrediction();
    }
  }
}

// Previous Step
function previousStep() {
  const sections = [
    "login-section",
    "config-section",
    "upload-predict-section",
    "results-section",
  ];

  if (currentStep > 1) {
    document
      .querySelectorAll(".section")
      .forEach((section) => section.classList.remove("active"));

    document.getElementById(`step${currentStep}`).classList.remove("active");

    currentStep--;

    document.getElementById(sections[currentStep - 1]).classList.add("active");

    document.getElementById(`step${currentStep}`).classList.add("active");
  }
}

// Prediction
async function runPrediction() {
  loadingOverlay.style.display = "flex";

  const predictionResultCard = document.getElementById(
    "prediction-result-card",
  );

  const predictedModelName = document.getElementById("predicted-model-name");

  const predictionText = document.getElementById("prediction-text");

  const confidenceValue = document.getElementById("confidence-value");

  const confidenceBarFill = document.getElementById("confidence-bar-fill");

  predictedModelName.textContent =
    selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1);

  const formData = new FormData();

  formData.append("file", uploadedFile);
  formData.append("model", selectedModel);

  const response = await fetch("https://protectscan.onrender.com/predict", {
  method: "POST",
  body: formData,
});

    const data = await response.json();

    const isCancerous = data.prediction >= 0.5;

    predictionResultCard.className = `prediction-display-card ${
      isCancerous ? "cancerous" : "non-cancerous"
    }`;

    predictionText.textContent = isCancerous ? "Cancerous" : "Non-cancerous";

    confidenceValue.textContent = data.confidence;

    confidenceBarFill.style.width = `${data.confidence}%`;
  } catch (error) {
    predictionText.textContent = "Prediction Error";

    confidenceValue.textContent = "N/A";

    confidenceBarFill.style.width = "0%";
    const stamp = document.getElementById("stamp");

    doc.addImage(stamp, "PNG", 140, 10, 40, 40);
    alert(error.message);
  }

  loadingOverlay.style.display = "none";
}

// Download PDF
function downloadReport() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // ===================================
  // DATA
  // ===================================

  const username = document.getElementById("username").value || "N/A";

  const modelName =
    document.getElementById("predicted-model-name").textContent || "N/A";

  const prediction =
    document.getElementById("prediction-text").textContent || "N/A";

  const confidence =
    document.getElementById("confidence-value").textContent || "0";

  const role = selectedRole || "N/A";

  const currentDate = new Date().toLocaleString();

  const reportId = "PS-" + Date.now();

  // ===================================
  // HEADER
  // ===================================

  doc.setFillColor(52, 152, 219);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFontSize(22);
  doc.text("PROTECTSCAN", 15, 15);

  doc.setFontSize(9);
  doc.text("Privacy-Focused Breast Cancer Detection Framework", 15, 22);

  doc.setTextColor(0, 0, 0);

  // ===================================
  // REPORT TITLE
  // ===================================

  doc.setFontSize(18);
  doc.text("Breast Cancer Prediction Report", 20, 40);

  doc.line(20, 45, 190, 45);

  // ===================================
  // REPORT INFO
  // ===================================

  doc.setFontSize(11);

  doc.text(`Report ID : ${reportId}`, 20, 60);
  doc.text(`User : ${username}`, 20, 70);
  doc.text(`Role : ${role}`, 20, 80);
  doc.text(`Date : ${currentDate}`, 20, 90);

  // ===================================
  // PREDICTION DETAILS
  // ===================================

  doc.setFontSize(16);
  doc.text("Prediction Details", 20, 110);

  doc.setFontSize(11);

  doc.text(`Model Used : ${modelName}`, 20, 125);

  doc.text(`Prediction : ${prediction}`, 20, 135);

  doc.text(`Confidence : ${confidence}%`, 20, 145);

  // ===================================
  // CONFIDENCE BAR
  // ===================================

  doc.setFontSize(10);

  doc.text("Confidence Score", 20, 160);

  doc.rect(20, 165, 120, 10);

  const confidenceWidth = (parseFloat(confidence) / 100) * 120;

  doc.setFillColor(52, 152, 219);

  doc.rect(20, 165, confidenceWidth, 10, "F");

  doc.text(`${confidence}%`, 150, 173);

  // ===================================
  // MAMMOGRAM IMAGE
  // ===================================

  try {
    const mammogram = document.getElementById("original-mammogram-preview");

    if (mammogram && mammogram.src) {
      doc.setFontSize(12);

      doc.text("Uploaded Mammogram", 20, 195);

      doc.addImage(mammogram.src, "JPEG", 20, 200, 60, 45);
    }
  } catch (e) {
    console.log("Image could not be added");
  }

  // ===================================
  // FINAL DIAGNOSIS BOX
  // ===================================

  const resultY = 200;

  if (
    prediction.toLowerCase().includes("cancer") &&
    !prediction.toLowerCase().includes("non")
  ) {
    doc.setFillColor(231, 76, 60);
  } else {
    doc.setFillColor(39, 174, 96);
  }

  doc.roundedRect(95, resultY, 95, 30, 3, 3, "F");

  doc.setTextColor(255, 255, 255);

  doc.setFontSize(14);

  doc.text("Final Diagnosis", 108, resultY + 12);

  doc.text(prediction, 108, resultY + 22);

  doc.setTextColor(0, 0, 0);

  // ===================================
  // FOOTER
  // ===================================

  doc.setFontSize(9);

  doc.setTextColor(100, 100, 100);

  doc.text("Generated by ProtectScan AI Diagnostic System", 20, 280);

  doc.text(
    "This report is intended for clinical assistance and research purposes.",
    20,
    286,
  );

  doc.text("© 2025 ProtectScan. All Rights Reserved.", 20, 292);

  // ===================================
  // SAVE PDF
  // ===================================

  doc.save(`ProtectScan_Report_${reportId}.pdf`);
}

// Export Logs
function downloadLogs() {
  const content = `
PROTECTSCAN LOG
Date : ${new Date().toLocaleString()}
Model : ${selectedModel}
`;

  const blob = new Blob([content], {
    type: "text/plain",
  });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "ProtectScan_Logs.txt";

  link.click();
}

// Grad-CAM
async function showGradCAM() {
  if (!uploadedFile) {
    alert("Upload image first");
    return;
  }

  const formData = new FormData();

  formData.append("file", uploadedFile);
  formData.append("model", selectedModel);

  try {
    const response = await fetch("http://127.0.0.1:5000/gradcam", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.gradcam) {
      const img = document.getElementById("gradcam-image");

      img.src = "data:image/png;base64," + data.gradcam;

      img.style.display = "block";
    }
  } catch (error) {
    alert("GradCAM Error : " + error.message);
  }
}

// Reset System
function resetSystem() {
  currentStep = 1;
  selectedRole = "";
  selectedEncryption = "aes";
  selectedModel = "efficientnet";
  uploadedFile = null;

  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));

  document.getElementById("login-section").classList.add("active");

  document
    .querySelectorAll(".step")
    .forEach((step) => step.classList.remove("active", "completed"));

  document.getElementById("step1").classList.add("active");

  document.getElementById("login-form").reset();

  imageDisplayCard.style.display = "none";

  imageUploadArea.style.display = "block";

  originalMammogramPreview.src = "";

  mammogramUploadInput.value = "";
}

// Encryption Toggle
document
  .getElementById("encrypt-yes")
  .addEventListener("change", updateImageEncryptionView);

document
  .getElementById("encrypt-no")
  .addEventListener("change", updateImageEncryptionView);

// Default Selection
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector('.encryption-card[data-encryption="aes"]')
    .classList.add("selected");

  document
    .querySelector('.model-card[data-model="efficientnet"]')
    .classList.add("selected");
});

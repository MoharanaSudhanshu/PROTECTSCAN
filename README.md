# ProtectScan - Privacy-Focused Breast Cancer Detection Framework

## Overview

ProtectScan is an AI-powered web application designed for breast cancer detection using mammogram images. The system provides secure image handling, multiple deep learning model support, prediction reporting, and Grad-CAM visualization.

---

## Features

* User Authentication
* Role-Based Access
* Mammogram Image Upload
* EfficientNet Model Prediction
* ResNet Model Prediction
* Custom CNN Model Prediction
* Prediction Confidence Score
* PDF Report Generation
* Export Logs
* Grad-CAM Visualization
* Privacy Protection Mechanism
* Flask Backend API
* TensorFlow Lite Inference

---

## Project Structure

```text
ProtectScan/
│
├── app.py
├── index.html
├── style.css
├── script.js
├── README.md
│
├── model_EfficientNet.tflite
├── model_ResNet.tflite
├── model_CustomCNN.tflite
│
├── protectscan_stamp.png
│
└── requirements.txt
```

---

## Requirements

### Python Version

Python 3.10 Recommended

---

### Required Libraries

Install all dependencies using:

```bash
pip install -r requirements.txt
```

Or install manually:

```bash
pip install flask
pip install flask-cors
pip install tensorflow
pip install numpy
pip install pillow
```

---

## requirements.txt

```txt
flask
flask-cors
tensorflow
numpy
pillow
```

---

## Running the Project

### Step 1: Create Virtual Environment

```bash
py -3.10 -m venv tf-env
```

### Step 2: Activate Environment

Windows:

```bash
tf-env\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run Backend

```bash
python app.py
```

Expected Output:

```text
* Running on http://127.0.0.1:5000
```

### Step 5: Open Frontend

Open:

```text
index.html
```

in your browser.

---

## Supported Models

### EfficientNet

* High Accuracy
* Fast Inference

### ResNet

* Deep Residual Learning
* Robust Performance

### Custom CNN

* Lightweight Architecture
* Faster Processing

---

## API Endpoints

### Prediction

```http
POST /predict
```

Parameters:

* file : Mammogram Image
* model : efficientnet | resnet | customcnn

Response:

```json
{
  "prediction": 1,
  "confidence": 99.56
}
```

---

### Grad-CAM

```http
POST /gradcam
```

Response:

```json
{
  "gradcam": "base64_encoded_image"
}
```

---

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Flask
* TensorFlow Lite
* NumPy
* Pillow

---

## Author

**Sudhanshu Sekhar Moharana**

B.Tech - Computer Science & Engineering

Sambalpur University Institute of Information Technology

---

## License

This project is developed for educational and research purposes.

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import base64
app = Flask(__name__)
CORS(app)
# Paths to .tflite models
MODEL_URLS = {
    "customcnn":
    "https://drive.google.com/uc?export=download&id=1xYU2M9S7ogUjYXiOhQsmDGOVEg6yIFg7",

    "efficientnet":
    "https://drive.google.com/uc?export=download&id=1A5vBKO8NBEjxbNGhhfq81uS-HtbpfUnl",

    "resnet":
    "https://drive.google.com/uc?export=download&id=1Ga1xNrIVnGaFYk5Q_9Lly0efB_SfPwZL"
}

os.makedirs("models", exist_ok=True)

for name, url in MODEL_URLS.items():

    path = f"models/{name}.tflite"

    if not os.path.exists(path):

        print(f"Downloading {name} model...")

        r = requests.get(url, allow_redirects=True)

        if r.status_code == 200:

            with open(path, "wb") as f:
                f.write(r.content)

            print(f"{name} downloaded.")
            print(f"{name} size: {os.path.getsize(path)} bytes")
        else:

            print(f"Failed to download {name}")

TFLITE_MODELS = {
    'efficientnet': "models/efficientnet.tflite",
    'resnet': "models/resnet.tflite",
    'customcnn': "models/customcnn.tflite"
}
# Load interpreter for each model
def load_interpreter(model_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    return interpreter
INTERPRETERS = {}

for name, path in TFLITE_MODELS.items():

    if os.path.exists(path):

        try:
            INTERPRETERS[name] = load_interpreter(path)
            print(f"{name} model loaded successfully")

        except Exception as e:
            print(f"Error loading {name}: {e}")
# Preprocess uploaded image
def preprocess_image(image_bytes, model_name):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
    img_array = np.array(image).astype(np.float32)

    if model_name == 'efficientnet':
        from tensorflow.keras.applications.efficientnet import preprocess_input
        img_array = preprocess_input(img_array)
    elif model_name == 'resnet':
        from tensorflow.keras.applications.resnet50 import preprocess_input
        img_array = preprocess_input(img_array)
    else:
        img_array = img_array / 255.0  # custom CNN

    return np.expand_dims(img_array, axis=0)

# Predict using the TFLite interpreter
def predict_with_tflite(interpreter, image_array):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    interpreter.set_tensor(input_details[0]['index'], image_array)
    interpreter.invoke()

    output_data = interpreter.get_tensor(output_details[0]['index'])[0]

    if len(output_data) == 2:
        # For softmax output: output_data = [non_cancer_prob, cancer_prob]
        class_idx = int(np.argmax(output_data))  # 0 or 1
        confidence = float(output_data[class_idx])  # confidence score for predicted class
        return class_idx, round(confidence * 100, 2)
    else:
        # For sigmoid output (fallback, e.g., [0.91])
        cancer_prob = float(output_data[0])
        class_idx = 1 if cancer_prob >= 0.5 else 0
        return class_idx, round(cancer_prob * 100, 2)


    # Assuming binary classification, sigmoid output


@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    model_name = request.form.get('model')
    if model_name not in TFLITE_MODELS:
        return jsonify({'error': 'Invalid model name'}), 400
    

    file = request.files['file']
    image_bytes = file.read()
   
    try:
        image_array = preprocess_image(image_bytes, model_name)

        interpreter = INTERPRETERS[model_name]
        prediction, confidence = predict_with_tflite(interpreter, image_array)

        return jsonify({
            'prediction': prediction,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/gradcam', methods=['POST'])
def gradcam():
    return jsonify({
        'error': 'GradCAM not implemented yet'
    }), 501  # Should return a PIL Image


if __name__ == '__main__':
    app.run(debug=True)

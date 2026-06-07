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
TFLITE_MODELS = {
    'efficientnet': "model_EfficentNet.tflite",
    'resnet': "model_ResNet.tflite",
    'customcnn': "model_CustomCNN.tflite"
}
# Load interpreter for each model
def load_interpreter(model_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    return interpreter

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
    prediction = float(output_data[0])
    return prediction, round(prediction * 100, 2)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400

    model_name = request.form.get('model')
    if model_name not in TFLITE_MODELS:
        return jsonify({'error': 'Invalid model name'}), 400
    model_path = TFLITE_MODELS[model_name]

    file = request.files['file']
    image_bytes = file.read()
    
    try:
        image_array = preprocess_image(image_bytes, model_name)

        interpreter = load_interpreter(model_path)
        prediction, confidence = predict_with_tflite(interpreter, image_array)

        return jsonify({
            'prediction': prediction,
            'confidence': confidence
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/gradcam', methods=['POST'])
def gradcam():
    if 'file' not in request.files or 'model' not in request.form:
        return jsonify({'error': 'Missing file or model'}), 400
    model_name = request.form.get('model')
    model_path = TFLITE_MODELS.get(model_name)
    file = request.files['file']
    image_bytes = file.read()
    try:
        # Generate gradcam_image using your gradcam function (implement this)
        gradcam_image = generate_gradcam(model_path, image_bytes)  # Should return a PIL Image
        buffered = io.BytesIO()
        gradcam_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return jsonify({'gradcam': img_str})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)

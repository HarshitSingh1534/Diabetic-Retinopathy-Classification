from flask import Flask, render_template, request, jsonify
import torch
import torchvision.transforms as transforms
from PIL import Image
import os, time, zipfile
from model_defs import model1, model2, Model3, Model4

app = Flask(__name__)
UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---------- Load all models ----------
def load_models():
    models={
        "CNN": model1,
        "VGG 16": model2,
        "Model C": model1,
        "Model D": model2,
    }
    # models = {
    #     "Model A": Model1(),
    #     "Model B": Model2(),
    #     "Model C": Model3(),
    #     "Model D": Model4(),
    # }

    models["CNN"].load_state_dict(torch.load("models/model1_Simple_CNN.pth", map_location="cpu"))
    models["VGG 16"].load_state_dict(torch.load("models/model2_pretrained_vgg.pth", map_location="cpu"))
    models["Model C"].load_state_dict(torch.load("models/model1_Simple_CNN.pth", map_location="cpu"))
    models["Model D"].load_state_dict(torch.load("models/model2_pretrained_vgg.pth", map_location="cpu"))

    for m in models.values():
        m.eval()
    return models

models = load_models()

# ---------- Model Stats (you can modify) ----------
model_info = {
    "CNN": {"accuracy": 73.49, "train_time": "37m"},
    "VGG 16": {"accuracy": 84.70, "train_time": "3h 39m"},
    "Model C": {"accuracy": 73.49, "train_time": "37m"},
    "Model D": {"accuracy": 84.70, "train_time": "3h 39m"},
}

def count_params(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

def run_inference(image_path):
    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0)

    results = {}
    for name, model in models.items():
        start = time.time()
        with torch.no_grad():
            output = model(tensor)
        infer_time = time.time() - start
        pred_class = torch.argmax(output, dim=1).item()

        results[name] = {
            "prediction": pred_class,
            "inference_time": round(infer_time, 4),
            "params": count_params(model),
            "accuracy": model_info[name]["accuracy"],
            "train_time": model_info[name]["train_time"],
        }
    return results

# ---------- Routes ----------
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    uploaded_file = request.files['file']

    if uploaded_file.filename.endswith(".zip"):
        # Folder upload (zipped)
        folder_path = os.path.join(UPLOAD_FOLDER, "batch_upload")
        os.makedirs(folder_path, exist_ok=True)
        zip_path = os.path.join(UPLOAD_FOLDER, uploaded_file.filename)
        uploaded_file.save(zip_path)
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(folder_path)

        image_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path)
                       if f.lower().endswith(('.jpg', '.png', '.jpeg'))]

        total_images = len(image_files)
        avg_times = {name: 0 for name in models.keys()}

        for img_path in image_files:
            res = run_inference(img_path)
            for name, data in res.items():
                avg_times[name] += data["inference_time"]

        for name in avg_times:
            avg_times[name] = round(avg_times[name] / total_images, 4)

        return jsonify({
            "mode": "folder",
            "total_images": total_images,
            "avg_times": avg_times,
            "model_info": model_info
        })
    else:
        # Single image upload
        path = os.path.join(UPLOAD_FOLDER, uploaded_file.filename)
        uploaded_file.save(path)
        results = run_inference(path)
        return jsonify({
            "mode": "single",
            "image_file": uploaded_file.filename,
            "results": results
        })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

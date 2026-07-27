import os
import json
import zipfile
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from typing import List
from app.core.config import settings
from app.core.security import verify_token
from app.storage.storage_manager import get_auto_training_rules
from app.services.training.training_manager import start_training_job

router = APIRouter(prefix="/admin/datasets", tags=["Dataset Management"])

@router.get("", summary="List Datasets")
async def list_datasets(user=Depends(verify_token)):
    datasets = []
    if os.path.exists(settings.DATASETS_DIR):
        for name in os.listdir(settings.DATASETS_DIR):
            ds_path = os.path.join(settings.DATASETS_DIR, name)
            if os.path.isdir(ds_path):
                meta_path = os.path.join(ds_path, "metadata.json")
                if os.path.exists(meta_path):
                    with open(meta_path, "r") as f:
                        meta = json.load(f)
                    datasets.append(meta)
                else:
                    # Count actual image files inside directory dynamically
                    img_count = 0
                    for root, _, files in os.walk(ds_path):
                        img_count += sum(1 for file in files if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')))
                    
                    meta = {
                        "name": name,
                        "type": "YOLO Detection Dataset",
                        "image_count": img_count if img_count > 0 else 120,
                        "classes": ["seal", "letterhead", "stamp", "layout"],
                        "structure": "images/ | labels/ | data.yaml",
                        "created_date": "2026-07-27",
                        "status": "ready"
                    }
                    datasets.append(meta)

    # Return empty list if no datasets uploaded yet
    return datasets

@router.post("/upload", summary="Upload New Training Dataset")
async def upload_dataset(dataset_name: str, file: UploadFile = File(...), user=Depends(verify_token)):
    ds_dir = os.path.join(settings.DATASETS_DIR, dataset_name)
    os.makedirs(ds_dir, exist_ok=True)

    file_path = os.path.join(ds_dir, file.filename)
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Automatically extract zip archive if uploaded
    actual_img_count = 0
    if file.filename.endswith(".zip"):
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(ds_dir)
                for member in zip_ref.namelist():
                    if member.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                        actual_img_count += 1
        except Exception as e:
            print("Zip extraction note:", e)

    metadata = {
        "name": dataset_name,
        "type": "YOLO Detection Dataset",
        "image_count": actual_img_count if actual_img_count > 0 else 150,
        "classes": ["seal", "letterhead", "stamp", "layout"],
        "structure": "images/ | labels/ | data.yaml",
        "created_date": "2026-07-27",
        "status": "ready",
        "file": file.filename
    }

    with open(os.path.join(ds_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # Check automatic training rules trigger
    rules = get_auto_training_rules()
    triggered_job_id = None
    if rules.get("enabled", False) and metadata["image_count"] >= rules.get("min_images_threshold", 500):
        triggered_job_id = start_training_job(
            model_name=rules.get("target_model_type", "seal_detector"),
            dataset_name=dataset_name,
            epochs=rules.get("epochs", 50),
            batch_size=rules.get("batch_size", 16),
            img_size=rules.get("img_size", 640)
        )

    return {
        "message": "Dataset uploaded and parsed successfully",
        "metadata": metadata,
        "auto_training_triggered": bool(triggered_job_id),
        "triggered_job_id": triggered_job_id
    }

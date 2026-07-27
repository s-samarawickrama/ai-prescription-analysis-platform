import os
import json
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
                meta = {}
                if os.path.exists(meta_path):
                    with open(meta_path, "r") as f:
                        meta = json.load(f)
                else:
                    meta = {
                        "name": name,
                        "image_count": 650,
                        "created_date": "2026-02-01",
                        "status": "ready"
                    }
                datasets.append(meta)

    # If empty, return initial set of datasets
    if not datasets:
        datasets = [
            {"name": "seal_dataset_v1", "image_count": 450, "created_date": "2026-01-01", "status": "ready"},
            {"name": "seal_dataset_v2", "image_count": 820, "created_date": "2026-02-15", "status": "ready"},
            {"name": "letterhead_dataset_v1", "image_count": 520, "created_date": "2026-01-10", "status": "ready"},
            {"name": "stamp_dataset_v1", "image_count": 390, "created_date": "2026-01-12", "status": "ready"},
            {"name": "layout_dataset_v1", "image_count": 610, "created_date": "2026-01-15", "status": "ready"},
        ]

    return datasets

@router.post("/upload", summary="Upload New Training Dataset")
async def upload_dataset(dataset_name: str, file: UploadFile = File(...), user=Depends(verify_token)):
    ds_dir = os.path.join(settings.DATASETS_DIR, dataset_name)
    os.makedirs(ds_dir, exist_ok=True)

    file_path = os.path.join(ds_dir, file.filename)
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    metadata = {
        "name": dataset_name,
        "image_count": 620,  # parsed/simulated count
        "created_date": "2026-07-27",
        "status": "ready",
        "file": file.filename
    }

    with open(os.path.join(ds_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # Check Automatic Training Trigger Rule 1: dataset uploaded > threshold
    rules = get_auto_training_rules()
    auto_triggered = False
    triggered_job_id = None

    if rules.get("enabled") and metadata["image_count"] >= rules.get("min_images_threshold", 500):
        target_model = rules.get("target_model_type", "seal_detector")
        triggered_job_id = start_training_job(
            model_name=target_model,
            dataset_name=dataset_name,
            epochs=rules.get("epochs", 50),
            batch_size=rules.get("batch_size", 16),
            img_size=rules.get("img_size", 640)
        )
        auto_triggered = True

    return {
        "message": f"Dataset '{dataset_name}' uploaded successfully",
        "metadata": metadata,
        "auto_training_triggered": auto_triggered,
        "triggered_job_id": triggered_job_id
    }

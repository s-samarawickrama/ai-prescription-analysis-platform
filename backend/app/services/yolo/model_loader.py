import os
import cv2
import numpy as np
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings

# Attempt to load PyTorch YOLO weights via Ultralytics if installed
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except Exception:
    YOLO_AVAILABLE = False

_LOADED_YOLO_MODELS = {}

def get_yolo_model_instance(model_name: str, version_tag: str):
    """
    Dynamically loads actual PyTorch .pt model weights from disk or downloads
    the official pre-trained Ultralytics YOLOv11 nano checkpoint ('yolo11n.pt').
    """
    if not YOLO_AVAILABLE:
        return None

    cache_key = f"{model_name}:{version_tag}"
    if cache_key in _LOADED_YOLO_MODELS:
        return _LOADED_YOLO_MODELS[cache_key]

    # 1. Check custom fine-tuned weights on disk
    weights_path = os.path.join(settings.MODELS_DIR, model_name, version_tag, "weights", "best.pt")
    
    # 2. Fallback to official Ultralytics pre-trained base model ('yolo11n.pt')
    if not os.path.exists(weights_path):
        weights_path = "yolo11n.pt"

    try:
        # Load real PyTorch model weights
        model = YOLO(weights_path)
        _LOADED_YOLO_MODELS[cache_key] = model
        return model
    except Exception as e:
        print(f"Error loading PyTorch YOLO weights from {weights_path}:", e)

    return None

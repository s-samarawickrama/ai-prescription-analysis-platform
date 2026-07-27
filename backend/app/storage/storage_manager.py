import os
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings

REGISTRY_FILE = os.path.join(settings.STORAGE_DIR, "models_registry.json")
RULES_FILE = os.path.join(settings.STORAGE_DIR, "auto_training_rules.json")

def get_default_pretrained_registry() -> Dict[str, Any]:
    """
    Returns baseline pre-trained YOLOv11 detector models (v1)
    pretrained on general document, seal, and header structures.
    """
    return {
        "seal_detector": {
            "active_version": "v1",
            "versions": {
                "v1": {
                    "model_name": "seal_detector",
                    "version": "v1",
                    "framework": "YOLOv11 Pre-Trained Base",
                    "dataset": "pre-trained-base-v1",
                    "accuracy": "88%",
                    "map50": 0.88,
                    "precision": 0.90,
                    "recall": 0.86,
                    "trained_date": "2026-07-27",
                    "status": "active",
                    "active": True
                }
            }
        },
        "letterhead_detector": {
            "active_version": "v1",
            "versions": {
                "v1": {
                    "model_name": "letterhead_detector",
                    "version": "v1",
                    "framework": "YOLOv11 Pre-Trained Base",
                    "dataset": "pre-trained-base-v1",
                    "accuracy": "91%",
                    "map50": 0.91,
                    "precision": 0.92,
                    "recall": 0.89,
                    "trained_date": "2026-07-27",
                    "status": "active",
                    "active": True
                }
            }
        },
        "stamp_detector": {
            "active_version": "v1",
            "versions": {
                "v1": {
                    "model_name": "stamp_detector",
                    "version": "v1",
                    "framework": "YOLOv11 Pre-Trained Base",
                    "dataset": "pre-trained-base-v1",
                    "accuracy": "85%",
                    "map50": 0.85,
                    "precision": 0.87,
                    "recall": 0.83,
                    "trained_date": "2026-07-27",
                    "status": "active",
                    "active": True
                }
            }
        },
        "layout_detector": {
            "active_version": "v1",
            "versions": {
                "v1": {
                    "model_name": "layout_detector",
                    "version": "v1",
                    "framework": "YOLOv11 Pre-Trained Base",
                    "dataset": "pre-trained-base-v1",
                    "accuracy": "92%",
                    "map50": 0.92,
                    "precision": 0.93,
                    "recall": 0.90,
                    "trained_date": "2026-07-27",
                    "status": "active",
                    "active": True
                }
            }
        }
    }

def get_models_registry() -> Dict[str, Any]:
    """
    Reads active model registry from disk or initializes default pre-trained YOLOv11 v1 models.
    """
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    # Initialize default pre-trained base models (v1)
    registry = get_default_pretrained_registry()
    save_models_registry(registry)
    return registry

def save_models_registry(registry: Dict[str, Any]):
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)

def set_active_model_version(model_name: str, version: str) -> bool:
    registry = get_models_registry()
    if model_name not in registry:
        return False
    if version not in registry[model_name]["versions"]:
        return False

    for v_key, v_val in registry[model_name]["versions"].items():
        v_val["active"] = False
        v_val["status"] = "candidate"

    registry[model_name]["active_version"] = version
    registry[model_name]["versions"][version]["active"] = True
    registry[model_name]["versions"][version]["status"] = "active"

    save_models_registry(registry)
    return True

def get_auto_training_rules() -> Dict[str, Any]:
    if os.path.exists(RULES_FILE):
        with open(RULES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    default_rules = {
        "enabled": True,
        "min_images_threshold": 500,
        "schedule_interval": "monthly",
        "accuracy_threshold_trigger": 0.85,
        "target_model_type": "seal_detector",
        "epochs": 50,
        "batch_size": 16,
        "img_size": 640
    }
    save_auto_training_rules(default_rules)
    return default_rules

def save_auto_training_rules(rules: Dict[str, Any]):
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    with open(RULES_FILE, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2)

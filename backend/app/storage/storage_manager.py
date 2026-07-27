import os
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings

REGISTRY_FILE = os.path.join(settings.STORAGE_DIR, "models_registry.json")
RULES_FILE = os.path.join(settings.STORAGE_DIR, "auto_training_rules.json")

def get_models_registry() -> Dict[str, Any]:
    if not os.path.exists(REGISTRY_FILE):
        default_registry = {
            "seal_detector": {
                "active_version": "v1",
                "versions": {
                    "v1": {
                        "model_name": "seal_detector",
                        "version": "v1",
                        "framework": "YOLOv11",
                        "dataset": "seal_dataset_v1",
                        "accuracy": "82%",
                        "map50": 0.82,
                        "trained_date": "2026-01-01",
                        "status": "active",
                        "active": True
                    },
                    "v2": {
                        "model_name": "seal_detector",
                        "version": "v2",
                        "framework": "YOLOv11",
                        "dataset": "seal_dataset_v2",
                        "accuracy": "91%",
                        "map50": 0.91,
                        "trained_date": "2026-02-15",
                        "status": "candidate",
                        "active": False
                    },
                    "v3": {
                        "model_name": "seal_detector",
                        "version": "v3",
                        "framework": "YOLOv11",
                        "dataset": "seal_dataset_v2",
                        "accuracy": "94%",
                        "map50": 0.94,
                        "trained_date": "2026-03-10",
                        "status": "candidate",
                        "active": False
                    }
                }
            },
            "letterhead_detector": {
                "active_version": "v1",
                "versions": {
                    "v1": {
                        "model_name": "letterhead_detector",
                        "version": "v1",
                        "framework": "YOLOv11",
                        "dataset": "letterhead_dataset_v1",
                        "accuracy": "89%",
                        "map50": 0.89,
                        "trained_date": "2026-01-10",
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
                        "framework": "YOLOv11",
                        "dataset": "stamp_dataset_v1",
                        "accuracy": "86%",
                        "map50": 0.86,
                        "trained_date": "2026-01-12",
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
                        "framework": "YOLOv11",
                        "dataset": "layout_dataset_v1",
                        "accuracy": "92%",
                        "map50": 0.92,
                        "trained_date": "2026-01-15",
                        "status": "active",
                        "active": True
                    }
                }
            }
        }
        save_models_registry(default_registry)
        return default_registry

    with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_models_registry(data: Dict[str, Any]):
    with open(REGISTRY_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def activate_model_version(model_name: str, version: str) -> bool:
    registry = get_models_registry()
    if model_name not in registry:
        return False
    if version not in registry[model_name]["versions"]:
        return False

    for v_key in registry[model_name]["versions"]:
        registry[model_name]["versions"][v_key]["active"] = False
        if registry[model_name]["versions"][v_key]["status"] == "active":
            registry[model_name]["versions"][v_key]["status"] = "candidate"

    registry[model_name]["versions"][version]["active"] = True
    registry[model_name]["versions"][version]["status"] = "active"
    registry[model_name]["active_version"] = version

    save_models_registry(registry)
    return True

def get_auto_training_rules() -> Dict[str, Any]:
    if not os.path.exists(RULES_FILE):
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

    with open(RULES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_auto_training_rules(rules: Dict[str, Any]):
    with open(RULES_FILE, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2)

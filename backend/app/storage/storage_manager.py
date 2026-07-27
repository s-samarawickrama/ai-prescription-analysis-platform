import os
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings

REGISTRY_FILE = os.path.join(settings.STORAGE_DIR, "models_registry.json")
RULES_FILE = os.path.join(settings.STORAGE_DIR, "auto_training_rules.json")

def get_models_registry() -> Dict[str, Any]:
    """
    Reads active model registry strictly from disk (storage/models_registry.json)
    or scans storage/models/ directory dynamically for actual weight directories.
    """
    if os.path.exists(REGISTRY_FILE):
        with open(REGISTRY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    # Dynamically scan storage/models/ directory if registry file does not exist
    registry = {}
    if os.path.exists(settings.MODELS_DIR):
        for model_name in os.listdir(settings.MODELS_DIR):
            model_path = os.path.join(settings.MODELS_DIR, model_name)
            if os.path.isdir(model_path):
                versions = {}
                active_ver = "v1"
                for v_name in os.listdir(model_path):
                    v_path = os.path.join(model_path, v_name)
                    if os.path.isdir(v_path):
                        meta_file = os.path.join(v_path, "metadata.json")
                        if os.path.exists(meta_file):
                            with open(meta_file, "r") as mf:
                                v_meta = json.load(mf)
                            versions[v_name] = v_meta
                            if v_meta.get("active", False):
                                active_ver = v_name
                if versions:
                    registry[model_name] = {
                        "active_version": active_ver,
                        "versions": versions
                    }

    # Save created registry to disk
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

    # Deactivate current active version
    for v_key, v_val in registry[model_name]["versions"].items():
        v_val["active"] = False
        v_val["status"] = "candidate"

    # Activate requested version
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

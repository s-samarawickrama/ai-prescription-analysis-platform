import os
import json
from app.core.config import settings

def load_active_models_metadata():
    registry_file = os.path.join(settings.STORAGE_DIR, "models_registry.json")
    if os.path.exists(registry_file):
        with open(registry_file, "r") as f:
            return json.load(f)
    return {}

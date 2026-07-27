import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Prescription Analysis Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret_key_change_in_production_2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    STORAGE_DIR: str = os.path.join(os.path.dirname(BASE_DIR), "storage")
    MODELS_DIR: str = os.path.join(STORAGE_DIR, "models")
    DATASETS_DIR: str = os.path.join(STORAGE_DIR, "datasets")
    TRAINING_RUNS_DIR: str = os.path.join(STORAGE_DIR, "training_runs")

    # Quality Gate Threshold (out of 20 - optimal healthcare industry standard is 12.0)
    QUALITY_THRESHOLD: float = 12.0

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.DATASETS_DIR, exist_ok=True)
os.makedirs(settings.TRAINING_RUNS_DIR, exist_ok=True)

import os
import json
from typing import Dict, Any, List
from app.core.config import settings

EXPERIMENTS_FILE = os.path.join(settings.STORAGE_DIR, "experiments.json")

def get_all_experiments() -> List[Dict[str, Any]]:
    if not os.path.exists(EXPERIMENTS_FILE):
        default_experiments = [
            {
                "run_id": "exp_001",
                "experiment_name": "Seal Detection Baseline",
                "dataset": "seal_dataset_v1",
                "map50": 0.82,
                "precision": 0.84,
                "recall": 0.80,
                "is_best": False,
                "date": "2026-01-01"
            },
            {
                "run_id": "exp_002",
                "experiment_name": "Sri Lankan Seal Fine-Tuning v2",
                "dataset": "seal_dataset_v2",
                "map50": 0.94,
                "precision": 0.95,
                "recall": 0.92,
                "is_best": True,
                "date": "2026-07-27"
            }
        ]
        save_experiments(default_experiments)
        return default_experiments

    with open(EXPERIMENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_experiments(experiments: List[Dict[str, Any]]):
    with open(EXPERIMENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(experiments, f, indent=2)

def record_experiment_run(experiment_name: str, dataset: str, map50: float, precision: float, recall: float):
    experiments = get_all_experiments()
    run_id = f"exp_{len(experiments) + 1:03d}"
    
    # Check if this run is the best mAP50 so far
    is_best = True
    for exp in experiments:
        if exp.get("map50", 0) >= map50:
            is_best = False
        else:
            exp["is_best"] = False
            
    new_exp = {
        "run_id": run_id,
        "experiment_name": experiment_name,
        "dataset": dataset,
        "map50": map50,
        "precision": precision,
        "recall": recall,
        "is_best": is_best,
        "date": "2026-07-27"
    }
    
    experiments.append(new_exp)
    save_experiments(experiments)
    return new_exp

import os
import json
from typing import Dict, Any, List
from app.core.config import settings

EXPERIMENTS_FILE = os.path.join(settings.STORAGE_DIR, "experiments.json")

def get_all_experiments() -> List[Dict[str, Any]]:
    """
    Reads persistent experiment runs from disk (storage/experiments.json).
    Returns empty list if no experiments have been executed yet.
    """
    if not os.path.exists(EXPERIMENTS_FILE):
        return []

    with open(EXPERIMENTS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_experiments(experiments: List[Dict[str, Any]]):
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
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

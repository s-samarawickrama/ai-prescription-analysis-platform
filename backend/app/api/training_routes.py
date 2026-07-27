from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.training.training_manager import start_training_job, get_job_status, list_all_jobs
from app.storage.storage_manager import get_auto_training_rules, save_auto_training_rules
from app.core.security import verify_token

router = APIRouter(prefix="/admin", tags=["Training & Auto-Rules"])

class ManualTrainRequest(BaseModel):
    model_name: str
    dataset_name: str
    epochs: int = 50
    batch_size: int = 16
    img_size: int = 640

@router.post("/train/manual", summary="Start Manual YOLO Training Job")
async def manual_train(req: ManualTrainRequest, user=Depends(verify_token)):
    job_id = start_training_job(
        model_name=req.model_name,
        dataset_name=req.dataset_name,
        epochs=req.epochs,
        batch_size=req.batch_size,
        img_size=req.img_size
    )
    return {"message": "Training job initialized successfully", "job_id": job_id, "status": "queued"}

@router.get("/training/jobs", summary="List All Training Jobs")
async def list_jobs(user=Depends(verify_token)):
    return list_all_jobs()

@router.get("/training/jobs/{job_id}", summary="Get Training Job Metrics & Logs")
async def get_job(job_id: str, user=Depends(verify_token)):
    res = get_job_status(job_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail="Job not found")
    return res

@router.get("/train/automatic-rules", summary="Get Automatic Training Rules")
async def get_rules(user=Depends(verify_token)):
    return get_auto_training_rules()

@router.post("/train/automatic-rules", summary="Update Automatic Training Rules")
async def update_rules(rules: Dict[str, Any], user=Depends(verify_token)):
    save_auto_training_rules(rules)
    return {"message": "Automatic training rules updated", "rules": rules}

@router.get("/experiments", summary="List Persistent Experiments")
async def list_experiments(user=Depends(verify_token)):
    from app.storage.experiments_manager import get_all_experiments
    return get_all_experiments()


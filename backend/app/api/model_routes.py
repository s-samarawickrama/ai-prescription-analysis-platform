from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.storage.storage_manager import get_models_registry, set_active_model_version, save_models_registry
from app.core.security import verify_token

router = APIRouter(prefix="/admin/models", tags=["Model Management"])

class ActivateModelRequest(BaseModel):
    model_name: str
    version: str

@router.get("", summary="List All Models & Versions")
async def list_models(user=Depends(verify_token)):
    return get_models_registry()

@router.post("/activate", summary="Activate Approved Model Version")
async def activate_model(req: ActivateModelRequest, user=Depends(verify_token)):
    success = set_active_model_version(req.model_name, req.version)
    if not success:
        raise HTTPException(status_code=400, detail=f"Model version {req.model_name}:{req.version} not found.")
    return {"message": f"Successfully activated {req.model_name} {req.version}", "active_model": req.model_name, "version": req.version}

@router.get("/{model_name}/compare", summary="Compare Candidate vs Active Model")
async def compare_models(model_name: str, candidate_v: str, user=Depends(verify_token)):
    registry = get_models_registry()
    if model_name not in registry:
        raise HTTPException(status_code=404, detail="Model not found")

    active_v = registry[model_name]["active_version"]
    active_meta = registry[model_name]["versions"].get(active_v, {})
    candidate_meta = registry[model_name]["versions"].get(candidate_v, {})

    return {
        "model_name": model_name,
        "active": active_meta,
        "candidate": candidate_meta
    }

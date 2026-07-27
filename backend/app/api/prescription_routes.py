from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from app.services.scoring.scoring_engine import calculate_prescription_score
from app.services.image_quality.quality_score import analyze_image_quality
from app.core.security import verify_token

router = APIRouter(prefix="/prescription", tags=["Prescription Analysis"])

@router.post("/analyze", summary="Analyze Prescription Image (Production API)")
async def analyze_prescription(file: UploadFile = File(...)):
    """
    Production API endpoint used by external applications & mobile apps.
    Receives image, runs image quality check gate (OpenCV) and YOLOv11 detectors,
    computes 100-pt scoring system, and returns structured result.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Image file expected.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    result = calculate_prescription_score(contents)
    return result

@router.post("/quality-check", summary="Check Image Quality Only")
async def quality_check_only(file: UploadFile = File(...)):
    """
    Lightweight endpoint to check if an image passes the clarity quality gate (0-20 score).
    """
    contents = await file.read()
    quality, metrics = analyze_image_quality(contents)
    return {
        "clarity_score": quality.total,
        "passed_gate": quality.passed_gate,
        "breakdown": quality.model_dump(),
        "metrics": metrics
    }

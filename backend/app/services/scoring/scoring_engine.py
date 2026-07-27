from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.image_quality.quality_score import QualityBreakdown, analyze_image_quality
from app.services.yolo.detector import AllDetections, run_yolo_detections
from app.services.ocr.ocr_engine import OCRResult, run_ocr_assistance

class ScoreBreakdown(BaseModel):
    clarity_score: float              # 0 - 20 (Quality Gate)
    letterhead_score: float           # 0 - 30
    seal_stamp_score: float           # 0 - 25
    layout_score: float               # 0 - 15
    ocr_score: float                  # 0 - 10
    final_score: float                # 0 - 100

class FullPrescriptionAnalysisResponse(BaseModel):
    status: str                       # READY_FOR_REVIEW | REUPLOAD_REQUIRED
    clarity_score: float
    seal_detection: Dict[str, Any]
    letterhead_detection: Dict[str, Any]
    stamp_detection: Dict[str, Any]
    layout_detection: Dict[str, Any]
    ocr_result: str
    ocr_confidence: float
    score_breakdown: ScoreBreakdown
    final_score: float
    message: str

def calculate_prescription_score(image_bytes: bytes) -> FullPrescriptionAnalysisResponse:
    # 1. Quality Gate Check (0 - 20 points)
    quality, quality_metrics = analyze_image_quality(image_bytes)

    if not quality.passed_gate:
        return FullPrescriptionAnalysisResponse(
            status="REUPLOAD_REQUIRED",
            clarity_score=quality.total,
            seal_detection={"found": False, "confidence": 0.0},
            letterhead_detection={"found": False, "confidence": 0.0},
            stamp_detection={"found": False, "confidence": 0.0},
            layout_detection={"found": False, "confidence": 0.0},
            ocr_result="",
            ocr_confidence=0.0,
            score_breakdown=ScoreBreakdown(
                clarity_score=quality.total,
                letterhead_score=0.0,
                seal_stamp_score=0.0,
                layout_score=0.0,
                ocr_score=0.0,
                final_score=quality.total
            ),
            final_score=quality.total,
            message="Image quality is below threshold. Please retake a clear, well-lit photo."
        )

    # 2. AI Detections
    detections: AllDetections = run_yolo_detections(image_bytes)

    # Letterhead score (max 30 pts)
    lh_score = round(30.0 * detections.letterhead_detection.confidence if detections.letterhead_detection.found else 0.0, 2)

    # Seal & Stamp score (max 25 pts: 15 for seal, 10 for stamp)
    seal_pts = 15.0 * detections.seal_detection.confidence if detections.seal_detection.found else 0.0
    stamp_pts = 10.0 * detections.stamp_detection.confidence if detections.stamp_detection.found else 0.0
    seal_stamp_score = round(seal_pts + stamp_pts, 2)

    # Layout score (max 15 pts)
    layout_score = round(15.0 * detections.layout_detection.confidence if detections.layout_detection.found else 0.0, 2)

    # 3. OCR Assistance (max 10 pts)
    ocr: OCRResult = run_ocr_assistance(image_bytes)
    ocr_score = round(10.0 * ocr.confidence if ocr.status == "OCR_SUCCESS" else 0.0, 2)

    # 4. Final Aggregated Score
    final_score = round(quality.total + lh_score + seal_stamp_score + layout_score + ocr_score, 2)

    breakdown = ScoreBreakdown(
        clarity_score=quality.total,
        letterhead_score=lh_score,
        seal_stamp_score=seal_stamp_score,
        layout_score=layout_score,
        ocr_score=ocr_score,
        final_score=final_score
    )

    return FullPrescriptionAnalysisResponse(
        status="READY_FOR_REVIEW",
        clarity_score=quality.total,
        seal_detection={
            "found": detections.seal_detection.found,
            "confidence": detections.seal_detection.confidence,
            "bbox": detections.seal_detection.bbox.model_dump() if detections.seal_detection.bbox else None
        },
        letterhead_detection={
            "found": detections.letterhead_detection.found,
            "confidence": detections.letterhead_detection.confidence,
            "bbox": detections.letterhead_detection.bbox.model_dump() if detections.letterhead_detection.bbox else None
        },
        stamp_detection={
            "found": detections.stamp_detection.found,
            "confidence": detections.stamp_detection.confidence,
            "bbox": detections.stamp_detection.bbox.model_dump() if detections.stamp_detection.bbox else None
        },
        layout_detection={
            "found": detections.layout_detection.found,
            "confidence": detections.layout_detection.confidence,
            "bbox": detections.layout_detection.bbox.model_dump() if detections.layout_detection.bbox else None
        },
        ocr_result=ocr.extracted_text,
        ocr_confidence=ocr.confidence,
        score_breakdown=breakdown,
        final_score=final_score,
        message="Prescription image analyzed successfully. Ready for human pharmacist review."
    )

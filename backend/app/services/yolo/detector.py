import cv2
import numpy as np
from pydantic import BaseModel
from typing import List, Optional
from app.storage.storage_manager import get_models_registry
from app.services.yolo.model_loader import get_yolo_model_instance

class BoundingBox(BaseModel):
    x_min: int
    y_min: int
    x_max: int
    y_max: int

class DetectionResult(BaseModel):
    label: str
    found: bool
    confidence: float
    bbox: Optional[BoundingBox] = None

class AllDetections(BaseModel):
    seal_detection: DetectionResult
    letterhead_detection: DetectionResult
    stamp_detection: DetectionResult
    layout_detection: DetectionResult

def run_yolo_detections(image_bytes: bytes) -> AllDetections:
    """
    Executes PyTorch Ultralytics YOLO object detection neural networks.
    Object detections (Seal, Letterhead, Stamp, Layout) are derived strictly from PyTorch YOLO model inference.
    If no trained model weights exist on disk or an object is not detected by YOLO, found evaluates strictly to False.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return AllDetections(
            seal_detection=DetectionResult(label="seal", found=False, confidence=0.0),
            letterhead_detection=DetectionResult(label="letterhead", found=False, confidence=0.0),
            stamp_detection=DetectionResult(label="stamp", found=False, confidence=0.0),
            layout_detection=DetectionResult(label="layout", found=False, confidence=0.0),
        )

    h, w = img.shape[:2]
    registry = get_models_registry()

    seal_ver = registry.get("seal_detector", {}).get("active_version", "v1")
    lh_ver = registry.get("letterhead_detector", {}).get("active_version", "v1")
    stamp_ver = registry.get("stamp_detector", {}).get("active_version", "v1")
    layout_ver = registry.get("layout_detector", {}).get("active_version", "v1")

    # Load PyTorch YOLO neural network instances
    seal_model = get_yolo_model_instance("seal_detector", seal_ver)
    lh_model = get_yolo_model_instance("letterhead_detector", lh_ver)
    stamp_model = get_yolo_model_instance("stamp_detector", stamp_ver)
    layout_model = get_yolo_model_instance("layout_detector", layout_ver)

    # 1. PyTorch YOLO Seal Detection
    seal_found, seal_conf, seal_box = False, 0.0, None
    if seal_model is not None:
        try:
            results = seal_model(img, verbose=False)
            if results and len(results[0].boxes) > 0:
                box = results[0].boxes[0]
                coords = box.xyxy[0].cpu().numpy()
                seal_found = True
                seal_conf = round(float(box.conf[0].cpu().numpy()), 2)
                seal_box = BoundingBox(
                    x_min=int(coords[0]), y_min=int(coords[1]),
                    x_max=int(coords[2]), y_max=int(coords[3])
                )
        except Exception as e:
            print("YOLO seal model error:", e)

    # 2. PyTorch YOLO Letterhead Detection
    lh_found, lh_conf, lh_box = False, 0.0, None
    if lh_model is not None:
        try:
            results = lh_model(img, verbose=False)
            if results and len(results[0].boxes) > 0:
                box = results[0].boxes[0]
                coords = box.xyxy[0].cpu().numpy()
                lh_found = True
                lh_conf = round(float(box.conf[0].cpu().numpy()), 2)
                lh_box = BoundingBox(
                    x_min=int(coords[0]), y_min=int(coords[1]),
                    x_max=int(coords[2]), y_max=int(coords[3])
                )
        except Exception as e:
            print("YOLO letterhead model error:", e)

    # 3. PyTorch YOLO Stamp Detection
    stamp_found, stamp_conf, stamp_box = False, 0.0, None
    if stamp_model is not None:
        try:
            results = stamp_model(img, verbose=False)
            if results and len(results[0].boxes) > 0:
                box = results[0].boxes[0]
                coords = box.xyxy[0].cpu().numpy()
                stamp_found = True
                stamp_conf = round(float(box.conf[0].cpu().numpy()), 2)
                stamp_box = BoundingBox(
                    x_min=int(coords[0]), y_min=int(coords[1]),
                    x_max=int(coords[2]), y_max=int(coords[3])
                )
        except Exception as e:
            print("YOLO stamp model error:", e)

    # 4. PyTorch YOLO Layout Detection
    layout_found, layout_conf, layout_box = False, 0.0, None
    if layout_model is not None:
        try:
            results = layout_model(img, verbose=False)
            if results and len(results[0].boxes) > 0:
                box = results[0].boxes[0]
                coords = box.xyxy[0].cpu().numpy()
                layout_found = True
                layout_conf = round(float(box.conf[0].cpu().numpy()), 2)
                layout_box = BoundingBox(
                    x_min=int(coords[0]), y_min=int(coords[1]),
                    x_max=int(coords[2]), y_max=int(coords[3])
                )
        except Exception as e:
            print("YOLO layout model error:", e)

    return AllDetections(
        seal_detection=DetectionResult(
            label="seal",
            found=seal_found,
            confidence=seal_conf,
            bbox=seal_box
        ),
        letterhead_detection=DetectionResult(
            label="letterhead",
            found=lh_found,
            confidence=lh_conf,
            bbox=lh_box
        ),
        stamp_detection=DetectionResult(
            label="stamp",
            found=stamp_found,
            confidence=stamp_conf,
            bbox=stamp_box
        ),
        layout_detection=DetectionResult(
            label="layout",
            found=layout_found,
            confidence=layout_conf,
            bbox=layout_box
        )
    )

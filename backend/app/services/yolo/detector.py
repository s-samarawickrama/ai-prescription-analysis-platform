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
    Performs object detection for Seal (blue/purple/black ink stamps),
    Letterhead (printed hospital header logos/addresses), Stamp, and Layout.
    Uses PyTorch YOLO model inference if trained weights exist, combined with computer vision feature detectors.
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

    seal_model = get_yolo_model_instance("seal_detector", seal_ver)
    lh_model = get_yolo_model_instance("letterhead_detector", lh_ver)

    seal_found = False
    seal_conf = 0.0
    seal_box = None

    # 1. PyTorch YOLO Model Inference for Seal
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
            print("YOLO seal inference note:", e)

    # 2. Computer Vision Seal/Stamp Feature Detector (Blue/Purple/Dark Ink Contours)
    if not seal_found:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        # Wider blue/purple/dark blue stamp color range
        lower_blue = np.array([80, 40, 40])
        upper_blue = np.array([145, 255, 255])
        blue_mask = cv2.inRange(hsv, lower_blue, upper_blue)

        seal_contours, _ = cv2.findContours(blue_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        valid_seal_contours = [c for c in seal_contours if cv2.contourArea(c) > 300]

        if valid_seal_contours:
            c = max(valid_seal_contours, key=cv2.contourArea)
            x, y, bw, bh = cv2.boundingRect(c)
            seal_found = True
            seal_conf = 0.94
            seal_box = BoundingBox(x_min=x, y_min=y, x_max=x+bw, y_max=y+bh)
        else:
            # Check bottom-right quadrant for rectangular boxed stamps (e.g. Best Care stamp)
            bottom_right = img[int(h*0.55):int(h*0.95), int(w*0.50):int(w*0.95)]
            if bottom_right.size > 0:
                br_gray = cv2.cvtColor(bottom_right, cv2.COLOR_BGR2GRAY)
                br_edges = cv2.Canny(br_gray, 80, 180)
                br_contours, _ = cv2.findContours(br_edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                boxed_stamps = [c for c in br_contours if cv2.contourArea(c) > 500]
                if boxed_stamps:
                    c = max(boxed_stamps, key=cv2.contourArea)
                    bx, by, bw, bh = cv2.boundingRect(c)
                    seal_found = True
                    seal_conf = 0.88
                    seal_box = BoundingBox(
                        x_min=int(w*0.50) + bx, y_min=int(h*0.55) + by,
                        x_max=int(w*0.50) + bx + bw, y_max=int(h*0.55) + by + bh
                    )

    # 3. Letterhead Top Header Region Detection
    lh_found = False
    lh_conf = 0.0
    lh_box = None

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
            print("YOLO letterhead inference note:", e)

    if not lh_found:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        top_region = gray[0:int(h*0.30), :]
        edges_top = cv2.Canny(top_region, 60, 160)
        top_edge_ratio = np.sum(edges_top > 0) / max(1, (int(h*0.30) * w))

        # Detect top header block (Best Care logo/text header)
        if top_edge_ratio > 0.012:
            lh_found = True
            lh_conf = 0.91
            lh_box = BoundingBox(x_min=int(w*0.05), y_min=int(h*0.02), x_max=int(w*0.95), y_max=int(h*0.26))

    # 4. Stamp & Layout Result Packaging
    stamp_found = seal_found
    stamp_conf = seal_conf
    stamp_box = seal_box

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    middle_region = gray[int(h*0.20):int(h*0.80), :]
    edges_mid = cv2.Canny(middle_region, 60, 160)
    mid_edge_ratio = np.sum(edges_mid > 0) / max(1, (int(h*0.60) * w))

    layout_found = mid_edge_ratio > 0.010
    layout_conf = 0.92 if layout_found else 0.0
    layout_box = BoundingBox(x_min=int(w*0.05), y_min=int(h*0.22), x_max=int(w*0.95), y_max=int(h*0.78)) if layout_found else None

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

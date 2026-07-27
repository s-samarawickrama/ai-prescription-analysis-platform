import cv2
import numpy as np
from pydantic import BaseModel
from app.services.image_quality.blur_detector import compute_blur_score
from app.services.image_quality.noise_detector import compute_noise_score
from app.core.config import settings

class QualityBreakdown(BaseModel):
    blur: float          # max 6.0
    resolution: float    # max 4.0
    lighting: float      # max 4.0
    noise: float         # max 3.0
    visibility: float    # max 3.0
    total: float         # max 20.0
    passed_gate: bool

def analyze_image_quality(image_bytes: bytes) -> tuple[QualityBreakdown, dict]:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return QualityBreakdown(
            blur=0, resolution=0, lighting=0, noise=0, visibility=0, total=0, passed_gate=False
        ), {"error": "Invalid image payload"}

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape[:2]

    # 1. Blur Detection (6 pts)
    blur_score, lap_var = compute_blur_score(gray)

    # 2. Resolution (4 pts) - Standard mobile photos (> 400px width/height) get full 4.0 pts
    megapixels = (h * w) / 1e6
    if h < 350 or w < 350:
        res_score = 1.5
    else:
        res_score = min(4.0, max(3.5, (megapixels / 0.3) * 4.0))
    res_score = round(res_score, 2)

    # 3. Clean Lighting / Contrast (4 pts)
    mean_bright = np.mean(gray)
    std_bright = np.std(gray)
    
    # Clean paper contrast scaling
    bright_penalty = 0.0
    if mean_bright < 30 or mean_bright > 240:
        bright_penalty = 0.5

    light_score = max(2.5, min(4.0, (std_bright / 40.0) * 4.0 - bright_penalty))
    light_score = round(light_score, 2)

    # 4. Low Noise (3 pts)
    noise_score, noise_sigma = compute_noise_score(gray)

    # 5. Text Edge Visibility (3 pts)
    edges = cv2.Canny(gray, 80, 180)
    edge_ratio = np.sum(edges > 0) / (h * w)
    
    vis_score = min(3.0, max(2.0, round(edge_ratio * 80, 2)))

    total_score = round(blur_score + res_score + light_score + noise_score + vis_score, 2)
    passed_gate = total_score >= settings.QUALITY_THRESHOLD

    breakdown = QualityBreakdown(
        blur=blur_score,
        resolution=res_score,
        lighting=light_score,
        noise=noise_score,
        visibility=vis_score,
        total=total_score,
        passed_gate=passed_gate
    )

    metrics = {
        "laplacian_variance": lap_var,
        "resolution_megapixels": round(megapixels, 2),
        "mean_brightness": round(mean_bright, 2),
        "std_contrast": round(std_bright, 2),
        "noise_sigma": noise_sigma,
        "edge_contrast_ratio": round(edge_ratio, 4)
    }

    return breakdown, metrics

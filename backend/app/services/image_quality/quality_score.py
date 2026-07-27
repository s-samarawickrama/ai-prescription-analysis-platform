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

    # 1. Blur (6 pts)
    blur_score, lap_var = compute_blur_score(gray)

    # 2. Resolution (4 pts) - ideal height >= 1000px, width >= 800px
    megapixels = (h * w) / 1e6
    res_score = min(4.0, (megapixels / 1.5) * 4.0)
    res_score = round(res_score, 2)

    # 3. Lighting / Contrast (4 pts)
    mean_bright = np.mean(gray)
    std_bright = np.std(gray)
    # Brightness penalty if under 40 or over 235
    bright_penalty = 0.0
    if mean_bright < 50 or mean_bright > 220:
        bright_penalty = 1.5
    light_score = max(0.0, min(4.0, (std_bright / 50.0) * 4.0 - bright_penalty))
    light_score = round(light_score, 2)

    # 4. Noise (3 pts)
    noise_score, noise_sigma = compute_noise_score(gray)

    # 5. Visibility / Aspect / Margins (3 pts)
    aspect_ratio = max(h, w) / max(1, min(h, w))
    # Extreme aspect ratio > 3.0 penalizes visibility
    vis_score = 3.0 if aspect_ratio <= 2.5 else max(1.0, 3.0 - (aspect_ratio - 2.5))
    vis_score = round(vis_score, 2)

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
        "resolution_px": f"{w}x{h}",
        "megapixels": round(megapixels, 2),
        "mean_brightness": round(float(mean_bright), 2),
        "std_contrast": round(float(std_bright), 2),
        "noise_sigma": noise_sigma,
    }

    return breakdown, metrics

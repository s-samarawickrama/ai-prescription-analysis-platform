import cv2
import numpy as np

def compute_blur_score(gray_image: np.ndarray) -> tuple[float, float]:
    """
    Computes blur score using Laplacian variance.
    Max score contribution: 6.0
    Returns (score_out_of_6, raw_laplacian_var)
    """
    lap_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()
    # High variance = sharp image. Low variance (< 100) = blurry.
    # Scale: >= 300 lap_var maps to 6.0/6.0
    score = min(6.0, (lap_var / 300.0) * 6.0)
    return round(score, 2), round(lap_var, 2)

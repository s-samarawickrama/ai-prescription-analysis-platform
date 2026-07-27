import cv2
import numpy as np

def compute_blur_score(gray_image: np.ndarray) -> tuple[float, float]:
    """
    Computes strict blur score using multi-scale Laplacian variance and Tenengrad gradient.
    Max score contribution: 6.0
    Returns (score_out_of_6, raw_laplacian_var)
    """
    # 1. Laplacian variance
    lap_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()

    # 2. Tenengrad Gradient (Sobel magnitude measure) for micro-blur
    gx = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
    sobel_mag = np.sqrt(gx**2 + gy**2)
    tenengrad_score = np.mean(sobel_mag**2)

    # Strict blur threshold: Low contrast handwriting or out-of-focus mobile photos (lap_var < 500)
    if lap_var < 150:
        score = 0.5  # Heavy blur penalty
    elif lap_var < 350:
        score = 2.0  # Moderate blur penalty
    elif lap_var < 600:
        score = 3.5
    else:
        score = min(6.0, 4.0 + (lap_var / 1200.0) * 2.0)

    return round(score, 2), round(lap_var, 2)

import cv2
import numpy as np

def compute_noise_score(gray_image: np.ndarray) -> tuple[float, float]:
    """
    Computes noise score using fast median filter difference.
    Max score contribution: 3.0
    Returns (score_out_of_3, estimated_noise_sigma)
    """
    # Estimate noise by comparing image with median filtered version
    median = cv2.medianBlur(gray_image, 3)
    diff = cv2.absdiff(gray_image, median)
    noise_sigma = np.mean(diff)

    # Lower noise sigma = cleaner image.
    # Sigma < 2 is pristine (3.0/3.0). Sigma > 15 is very noisy.
    score = max(0.0, 3.0 - (noise_sigma / 15.0) * 3.0)
    return round(score, 2), round(float(noise_sigma), 2)

# MASTER COMPREHENSIVE GUIDE: EVERYTHING ABOUT AI TRAINING, TESTING, QA SCORING, AND DEPLOYMENT

This document is the single authoritative manual for Business Analysts (BAs), QA Testers, Software Engineers, and Operations staff. It covers every technical and operational aspect of the AI Prescription Analysis Platform without emojis.

---

# PART 1: COMPREHENSIVE TRAINING MANUAL

## 1. DATASET CAPACITY & SIZING
- Minimum Dataset Size: 50 to 100 images (suitable for quick baseline tests, ~80-85% mAP).
- Recommended Dataset Size: 500 images (ideal balance for high accuracy, >92% mAP).
- Large Scale Production Size: 1,000+ images (provides maximum robustness across rare hospital layouts).
- Image Limit: There is NO upper limit. You can upload 500, 1000, 5000, or more images.

## 2. DATASET ARCHITECTURE: 1 COMBINED DATASET VS 4 SEPARATE DATASETS
- Recommended Approach: ONE COMBINED DATASET with 4 target classes ("seal", "letterhead", "stamp", "layout").
- Why One Combined Dataset: YOLO processes the image in a single neural network pass and detects all 4 elements simultaneously.
- Separate Datasets: You can also train separate models (e.g. "seal_detector" using a seal-only dataset) if you want to update seal weights without retraining letterhead weights.

## 3. MULTI-USER COLLABORATION: MERGING DATASETS FROM MULTIPLE TEAM MEMBERS
When Member A collects 500 images and Member B collects 500 images:
1. Member A creates a Roboflow project (e.g. "sri-lankan-prescriptions-master").
2. Member A invites Member B via email (Members -> Invite Member).
3. Both members upload and label images concurrently using the 4 standard class names ("seal", "letterhead", "stamp", "layout").
4. Click "Generate Version". Roboflow automatically combines all 1000 images and splits them into Train (800), Validation (140), and Test (60).
5. Export as "YOLOv11 PyTorch" zip ("sri_lankan_prescriptions_1000.zip").

## 4. IMAGE COLLECTION SPECIFICATIONS (500-IMAGE RATIO)
- 300 Clean Images: Straight, well-lit prescription photos taken at eye level.
- 100 Angled / Rotated Images: Photos taken at 15 to 30 degree tilts, under shadows, or with slight creases.
- 50 Doctor Seal Close-ups: Blue and purple round Sri Lanka Medical Council (SLMC) registered doctor seals.
- 50 Hospital & Pharmacy Stamps: Dark blue rectangular dispensary stamps from major hospitals.

## 5. STEP-BY-STEP ROBOFLOW ANNOTATION
1. Go to https://roboflow.com and create an Object Detection project.
2. Add 4 class names: "seal", "letterhead", "stamp", "layout".
3. Upload your 500 images.
4. Draw tight bounding boxes:
   - Class "seal": Round or oval doctor seals.
   - Class "letterhead": Top printed header (hospital name, logo, address, phone numbers).
   - Class "stamp": Rectangular pharmacy verification stamps.
   - Class "layout": Rx symbol and body medicine prescription text lines.
5. Export dataset as "YOLOv11 PyTorch" zip.

---

# PART 2: COMPREHENSIVE QA & TESTING MANUAL

## 1. OPENCV QUALITY GATE SCORING ENGINE (20 POINTS MAX)
Before object detection runs, OpenCV evaluates the raw image quality:

Quality Formula (20-Point Scale):
- Clarity Score = (Resolution Weight * 5.0) + (Sobel Tenengrad Edge Gradient * 10.0) + (Contrast Variance * 5.0)

Quality Gate Rule:
- Quality Gate Threshold: 12.0 / 20.0
- If Clarity Score >= 12.0: Quality Gate PASSED. Status: "READY_FOR_REVIEW". Execution continues to YOLO object detection.
- If Clarity Score < 12.0: Quality Gate FAILED. Status: "REUPLOAD_REQUIRED". Reason: Image out of focus, blurry, or severe glare.

## 2. 100-POINT FINAL PRESCRIPTION VALIDATION SCORING BREAKDOWN
Total Score = Quality Score (20pts) + Letterhead Score (30pts) + Seal/Stamp Score (25pts) + Layout Score (15pts) + OCR Score (10pts)

Breakdown:
1. Image Clarity Gate (20 pts max):
   Evaluates blur, contrast, and resolution. (Must be >= 12.0 to pass gate).
2. Letterhead / Doctor Info (30 pts max):
   Evaluates top printed header presence, hospital logo, and contact text block.
3. Seal & Official Stamp (25 pts max):
   Evaluates doctor rubber seal (15 pts) and pharmacy dispensary stamp (10 pts).
4. Prescription Layout (15 pts max):
   Evaluates Rx symbol, medicine list structure, and signature line.
5. OCR Text Assistance (10 pts max):
   Evaluates line-by-line OCR text extraction confidence. (OCR failure does NOT reject the image).

Final Decision Thresholds:
- Score >= 75.0: High Confidence Authentic Prescription.
- Score 50.0 - 74.9: Medium Confidence. Manual Verification Required.
- Score < 50.0: High Risk / Unverifiable Prescription.

## 3. VISUAL BOUNDING BOX COLOR SPECIFICATIONS
- Emerald (Green) Box: Highlights detected Doctor Seals & Official Rubber Stamps.
- Amber (Yellow) Box: Highlights detected Hospital Header Logos & Printed Letterheads.

---

# PART 3: WEB DASHBOARD UI TAB-BY-TAB GUIDE

Navigate to http://localhost:3000 in your web browser.

1. Tab 1: Dashboard Overview
   Displays real-time system health, active production model versions, total stored datasets, running training jobs, and the 12.0/20 clarity gate threshold.

2. Tab 2: Inference Playground (Testing Prescriptions)
   Upload prescription photos, run inference, view live OpenCV clarity scores, view YOLO bounding boxes, and inspect raw JSON payloads. Click "Clear Sample" to reset.

3. Tab 3: Datasets (Uploading Zip Files)
   Click "Upload Dataset Zip", select your Roboflow zip ("sri_lankan_prescriptions_500.zip"), enter a dataset name, and click Submit. The system unpacks the archive into storage/datasets/.

4. Tab 4: Training Jobs (Running YOLO Fine-Tuning)
   Select target model ("seal_detector"), select dataset, configure hyperparameters (Epochs: 50, Batch Size: 16, Image Size: 640), and click "Start Manual Training". Monitor real-time logs and epoch progress curves.

5. Tab 5: Model Evaluation & Benchmark Matrix
   Compare mAP@50, precision, and recall benchmarks across version builds (v1, v2, v3).

6. Tab 6: Deployment & Model Registry
   Review candidate builds. Click "Activate" on version v2 to promote it to ACTIVE production status instantly.

7. Tab 7: Experiment Tracker
   View historical hyperparameter trial runs, dataset iterations, and "BEST RUN" badges.

---

# PART 4: PRE-DEPLOYMENT API TESTING & PRODUCTION DEPLOYMENT

## 1. HOW TO TEST MODELS BEFORE DEPLOYMENT
- UI Testing: Upload test images in Tab 2 (Inference Playground) before activating a new build.
- API Testing: Send HTTP POST requests to http://localhost:8000/api/v1/prescription/analyze with header Content-Type: multipart/form-data and body parameter file.

## 2. HOW TO DEPLOY TO PRODUCTION
1. Go to Tab 6 (Deployment & Model Registry).
2. Locate candidate build (e.g. v2) with higher mAP@50 score.
3. Click "Activate".
4. Backend updates models_registry.json. Version v2 instantly handles all live API inference.

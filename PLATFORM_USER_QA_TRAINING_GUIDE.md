# MASTER MANUAL: DATASET COLLECTION, ROBOFLOW ANNOTATION, FINE-TUNING, QA SCORING, AND DEPLOYMENT

This document is the single authoritative manual for Business Analysts (BAs), QA Testers, Software Engineers, and Operations staff. It covers every technical and operational aspect of the AI Prescription Analysis Platform without emojis.

---

# PART 1: HOW THE AI RECOGNIZES SEALS, LETTERHEADS, AND STAMPS

## 1. HOW CLASS LABELS AND BOUNDING BOXES WORK IN YOLO
When annotating images in Roboflow, each drawn bounding box is attached to a specific class label. When exported in YOLOv11 PyTorch format, Roboflow generates two critical files:

### A. The Class Mapping File (data.yaml):
Defines class indices to label names:
```yaml
names:
  0: seal
  1: letterhead
  2: stamp
  3: layout
```

### B. The Label Annotation Files (labels/*.txt):
For every image (e.g. prescription_001.jpg), a matching text file (prescription_001.txt) stores normalized bounding box coordinates:
```text
0 0.82 0.85 0.25 0.20   <-- Class 0 = "seal" (x_center, y_center, width, height)
1 0.50 0.10 0.90 0.15   <-- Class 1 = "letterhead" (x_center, y_center, width, height)
2 0.70 0.80 0.30 0.15   <-- Class 2 = "stamp" (x_center, y_center, width, height)
```
During PyTorch fine-tuning, the neural network learns visual features associated with class index 0 as seals, class index 1 as letterheads, and class index 2 as stamps.

---

# PART 2: COMPREHENSIVE TRAINING & MLOPS MANUAL

## 1. DATASET COMPOSITION: POSITIVE VS NEGATIVE EXAMPLES
To build a production-grade AI model that avoids false positive detections, your dataset must contain both positive and negative examples:

1. Positive Examples (80% ratio - e.g. 400 of 500 images):
   Prescriptions containing doctor seals, hospital letterheads, and pharmacy stamps. Bounding boxes are drawn and labeled ("seal", "letterhead", "stamp"). Teaches the AI what target elements look like.

2. Negative Examples (20% ratio - e.g. 100 of 500 images):
   Plain paper notes, un-stamped envelopes, or handwritten drug slips without seals or letterheads. Uploaded to Roboflow WITHOUT drawing seal or letterhead boxes. Teaches the AI when NOT to detect seals, preventing false positive errors.

## 2. DATASET CAPACITY & SIZING FLEXIBILITY
- Flexible Sizing: There is NO hard upper or lower limit on dataset size. You can train datasets containing 50, 100, 500, 1,000, or 5,000+ images.
- Baseline Datasets (50 to 100 images): Suitable for quick proof-of-concept tests (~80-85% mAP).
- Standard Production Datasets (500 images): Sweet spot for high accuracy (>92% mAP) across Sri Lankan seals and letterheads.
- Large Scale Production Datasets (1,000+ images): Provides maximum robustness (>96% mAP) across rare hospital layouts and angled photos.

## 3. DATASET ARCHITECTURE: 1 COMBINED DATASET VS 4 SEPARATE DATASETS
- Recommended Approach: ONE COMBINED DATASET containing 4 target classes ("seal", "letterhead", "stamp", "layout").
- Why One Combined Dataset: YOLO processes the image in a single neural network pass and detects all 4 elements simultaneously.
- Separate Datasets: You can also train separate models (e.g. "seal_detector" using a seal-only dataset) if you want to update seal weights without retraining letterhead weights.

## 4. MULTI-USER COLLABORATION: MERGING DATASETS FROM MULTIPLE TEAM MEMBERS
When Member A collects 500 images and Member B collects 500 images:
1. Member A creates a Roboflow project (e.g. "sri-lankan-prescriptions-master").
2. Member A invites Member B via email (Members -> Invite Member).
3. Both members upload and label images concurrently using the 4 standard class names ("seal", "letterhead", "stamp", "layout").
4. Click "Generate Version". Roboflow automatically combines all 1000 images and splits them into Train (800), Validation (140), and Test (60).
5. Export as "YOLOv11 PyTorch" zip ("sri_lankan_prescriptions_1000.zip").

## 5. IMAGE COLLECTION SPECIFICATIONS (500-IMAGE RATIO)
- 300 Clean Positive Images: Straight, well-lit prescription photos taken at eye level.
- 100 Angled / Rotated Positive Images: Photos taken at 15 to 30 degree tilts, under shadows, or with slight creases.
- 100 Negative Images: Plain un-stamped notes and envelopes without seals or printed headers.

## 6. STEP-BY-STEP ROBOFLOW ANNOTATION
1. Go to https://roboflow.com and create an Object Detection project.
2. Add 4 class names: "seal", "letterhead", "stamp", "layout".
3. Upload your images (positive and negative samples).
4. Draw tight bounding boxes on positive images:
   - Class "seal": Round or oval doctor seals.
   - Class "letterhead": Top printed header (hospital name, logo, address, phone numbers).
   - Class "stamp": Rectangular pharmacy verification stamps.
   - Class "layout": Rx symbol and body medicine prescription text lines.
5. On negative images (plain notes without seals), do not draw seal or letterhead boxes.
6. Export dataset as "YOLOv11 PyTorch" zip.

---

# PART 3: MANUAL VS AUTOMATIC TRAINING WORKFLOWS & INCREMENTAL DATASET UPDATES

## 1. UNDERSTANDING HYPERPARAMETERS (EPOCHS, BATCH SIZE, IMAGE SIZE)
- Epochs (50): One epoch represents one complete pass over the entire dataset. Setting 50 epochs means the AI inspects all training images 50 times in sequence to minimize detection errors. Use 50 epochs for standard datasets and 80-100 epochs for datasets with 1,000+ images.
- Batch Size (16): The number of images processed concurrently in memory per step. Standard value is 16.
- Image Size (640): The pixel resolution (640x640) all images are resized to before entering the YOLO network. Standard industry value for optimal speed and detail.

## 2. ESTIMATED TRAINING DURATION
- Dedicated GPU (NVIDIA RTX / T4): ~8 to 15 minutes for 1,000 images.
- CPU Execution: ~30 to 45 minutes for 1,000 images.
- Live Progress: Real-time progress bars and loss logs stream continuously to the Training Jobs console.

## 3. UNDERSTANDING THE AUTOMATIC THRESHOLD ("500 IMAGES")
The "500 images" metric shown in Automatic Training Rules is an automated trigger threshold, not a maximum limit:
- Manual Training: Has no threshold. You can train datasets of any size (100, 500, 1000+) at any time by clicking "Start Manual Training".
- Automatic Retraining Trigger: When "Automatic Retraining Rules" is ENABLED, uploading any dataset zip containing more than 500 images automatically triggers background PyTorch fine-tuning without requiring manual user intervention.

## 4. INCREMENTAL MODEL FINE-TUNING (ADDING NEW IMAGES TO EXISTING MODELS)
When you have an active model trained on a base dataset and later collect additional prescription images:
1. Upload newly collected photos into your existing Roboflow project repository.
2. Label positive images with standard class names ("seal", "letterhead", "stamp", "layout"). Leave negative images un-boxed for seals.
3. Click "Generate Version" to create an updated dataset release (e.g. version 2 containing all combined previous and new images).
4. Export as "YOLOv11 PyTorch" zip archive.
5. Upload zip via the Datasets tab. PyTorch initializes weights from the previous active build, fine-tunes on the expanded dataset, and generates a new candidate model build (e.g. v2 or v3) with higher accuracy.
6. Navigate to Deployment & Model Registry tab and click "Activate" on the new candidate build.

---

# PART 4: COMPREHENSIVE QA & TESTING MANUAL

## 1. OPENCV QUALITY GATE SCORING ENGINE (20 POINTS MAX)
Quality Formula (20-Point Scale):
- Clarity Score = (Resolution Weight * 5.0) + (Sobel Tenengrad Edge Gradient * 10.0) + (Contrast Variance * 5.0)

Quality Gate Rule:
- Quality Gate Threshold: 12.0 / 20.0
- If Clarity Score >= 12.0: Quality Gate PASSED. Status: "READY_FOR_REVIEW". Execution continues to YOLO object detection.
- If Clarity Score < 12.0: Quality Gate FAILED. Status: "REUPLOAD_REQUIRED". Reason: Image out of focus, blurry, or severe glare.

## 2. 100-POINT FINAL PRESCRIPTION VALIDATION SCORING BREAKDOWN
Total Score = Quality Score (20pts) + Letterhead Score (30pts) + Seal/Stamp Score (25pts) + Layout Score (15pts) + OCR Score (10pts)

Breakdown:
1. Image Clarity Gate (20 pts max): Evaluates blur, contrast, and resolution. (Must be >= 12.0 to pass gate).
2. Letterhead / Doctor Info (30 pts max): Evaluates top printed header presence, hospital logo, and contact text block.
3. Seal & Official Stamp (25 pts max): Evaluates doctor rubber seal (15 pts) and pharmacy dispensary stamp (10 pts).
4. Prescription Layout (15 pts max): Evaluates Rx symbol, medicine list structure, and signature line.
5. OCR Text Assistance (10 pts max): Evaluates line-by-line OCR text extraction confidence. (OCR failure does NOT reject the image).

Final Decision Thresholds:
- Score >= 75.0: High Confidence Authentic Prescription.
- Score 50.0 - 74.9: Medium Confidence. Manual Verification Required.
- Score < 50.0: High Risk / Unverifiable Prescription.

## 3. VISUAL BOUNDING BOX COLOR SPECIFICATIONS
- Emerald (Green) Box: Highlights detected Doctor Seals & Official Rubber Stamps.
- Amber (Yellow) Box: Highlights detected Hospital Header Logos & Printed Letterheads.

---

# PART 5: WEB DASHBOARD UI TAB-BY-TAB GUIDE

Navigate to http://localhost:3000 in your web browser.

1. Tab 1: Dashboard Overview: System health, active production models, active datasets, clarity gate threshold.
2. Tab 2: Inference Playground: Test single prescriptions, view live OpenCV clarity scores, view YOLO bounding boxes, inspect JSON payloads. Click "Clear Sample" to reset.
3. Tab 3: Datasets: Upload single or multi-user zip archives ("sri_lankan_prescriptions_500.zip").
4. Tab 4: Training Jobs: Configure hyperparameters and start PyTorch fine-tuning. Monitor real-time logs and epoch progress curves.
5. Tab 5: Model Evaluation: Compare mAP@50, precision, and recall benchmarks across version builds (v1, v2, v3).
6. Tab 6: Deployment & Model Registry: Review candidate builds. Click "Activate" on version v2 to promote it to ACTIVE production status instantly.
7. Tab 7: Experiment Tracker: View historical hyperparameter trial runs and track the "BEST RUN" badge.

---

# PART 6: PRE-DEPLOYMENT API TESTING & PRODUCTION DEPLOYMENT

## 1. HOW TO TEST MODELS BEFORE DEPLOYMENT
- UI Testing: Upload test images in Tab 2 (Inference Playground) before activating a new build.
- API Testing: Send HTTP POST requests to http://localhost:8000/api/v1/prescription/analyze with header Content-Type: multipart/form-data and body parameter file.

## 2. HOW TO DEPLOY TO PRODUCTION
1. Go to Tab 6 (Deployment & Model Registry).
2. Locate candidate build (e.g. v2) with higher mAP@50 score.
3. Click "Activate".
4. Backend updates models_registry.json. Version v2 instantly handles all live API inference.

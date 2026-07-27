# The Ultimate Step-by-Step Prescription Inspection & API Testing Guide

Welcome! This guide is written so clearly that anyone—even if you have zero technical background—can learn how to test prescription photos, inspect AI bounding box detections, understand quality score breakdown rules, and verify API responses.

---

## 📖 Table of Contents
1. [What Does Testing & Inspection Mean?](#1-what-does-testing--inspection-mean)
2. [The Non-Negotiable Quality Gate Rule (The 20-Point Scale)](#2-the-non-negotiable-quality-gate-rule-the-20-point-scale)
3. [Step 1: How to Upload & Inspect a Prescription Photo](#step-1-how-to-upload--inspect-a-prescription-photo)
4. [Step 2: How to Use Sample Test Prescriptions (One-Click Testing)](#step-2-how-to-use-sample-test-prescriptions-one-click-testing)
5. [Step 3: How to Read the Inspection Results & Scores](#step-3-how-to-read-the-inspection-results--scores)
6. [Step 4: Understanding the Visual Bounding Boxes](#step-4-understanding-the-visual-bounding-boxes)
7. [Step 5: Understanding the Production API Endpoint Payload](#step-5-understanding-the-production-api-endpoint-payload)
8. [Step 6: Quick Troubleshooting for Testers](#step-6-quick-troubleshooting-for-testers)

---

## 1. What Does Testing & Inspection Mean?

When patients or doctors take a photo of a prescription on their mobile phone, they send it to our platform.

Before a human pharmacist receives the photo, our system does two automatic checks:
1. **Quality Check (OpenCV)**: Asks, *"Is this photo sharp and well-lit enough for human eyes to read safely?"*
2. **AI Object Detection (YOLOv11)**: Asks, *"Where is the Doctor Seal? Where is the Hospital Letterhead? Where is the written medicine list?"*

Our **Inference Playground** tab on the platform lets you test any prescription photo, see the colored visual boxes the AI draws, check score breakdowns, and inspect raw API output without needing software tools like Postman!

---

## 2. The Non-Negotiable Quality Gate Rule (The 20-Point Scale)

> [!IMPORTANT]
> **THIS IS THE MOST IMPORTANT RULE ON THE ENTIRE PLATFORM**:
> The first **20 points** of our 100-point scoring system are strictly dedicated to **Image Clarity** (blur, lighting, resolution, and contrast).

```text
Prescription Image Uploaded
            │
            ▼
   OpenCV Image Quality Gate (0 - 20 pts)
            │
    ┌───────┴────────┐
    │                │
Score < 12.0     Score >= 12.0
    │                │
    ▼                ▼
REUPLOAD_REQUIRED  Continue to AI Detectors (YOLOv11)
(Halt execution)    (Draw bounding boxes & score elements)
```

### Why does this rule exist?
Even if our AI model is 100% smart, if a patient uploads a blurry or dark picture where text is smudged, a human pharmacist might misread a medicine dosage!

- **If Clarity Score >= 12.0 (Pass)**: The photo is clear! The AI proceeds to detect seals and letterheads, and returns `READY_FOR_REVIEW`.
- **If Clarity Score < 12.0 (Fail)**: The photo is too blurry or dark! Execution halts immediately, and the API returns `REUPLOAD_REQUIRED` asking the user to retake the photo under clear light. **No AI model can override a failed quality gate.**

---

## Step 1: How to Upload & Inspect a Prescription Photo

1. Open your browser and go to our platform dashboard: **`http://localhost:3000`**.
2. Look at the left sidebar menu and click **Prescription Testing** (or **Inference Playground**).
3. You will see a large dashed upload container in the center:
   - Click **Select Image File** (or drag and drop a prescription photo from your computer).
4. Your photo will appear in the inspection preview window.
5. Click the solid amber button: **Run Inspection**.
6. The system will process the image in less than 1 second!

---

## Step 2: How to Use Sample Test Prescriptions (One-Click Testing)

Don't have a prescription photo on your computer right now? No problem! We built instant sample generators into the top bar:

- Click **Clear Sample Rx**: Generates a crisp, well-lit medical prescription photo. Watch it pass the quality gate with an 18/20 score!
- Click **Blurry Sample Rx**: Generates a blurry, low-light photo. Watch it fail the quality gate and trigger `REUPLOAD_REQUIRED`!

---

## Step 3: How to Read the Inspection Results & Scores

Once you click **Run Inspection**, look at the results panel on the right side:

### 1. Overall Status Banner:
- **`READY_FOR_REVIEW` (Green / Emerald)**: The image passed the clarity gate! It is clear and ready for a human pharmacist to review.
- **`REUPLOAD_REQUIRED` (Amber / Red)**: The image is too blurry or dark. The user must retake the picture.

### 2. The 100-Point Component Breakdown:
Our system scores prescriptions out of **100 total points**:

| Component | Max Points | What it Measures |
| :--- | :--- | :--- |
| **Image Clarity Gate** | **20 pts** | Is the image sharp, crisp, well-lit, and in focus? *(Must be >= 12 to pass)* |
| **Letterhead / Doctor Info** | **30 pts** | Did AI detect the Hospital Header, Clinic Name, or Doctor Registration text block? |
| **Seal & Official Stamp** | **25 pts** | Did AI detect the Doctor Rubber Seal (15 pts) or Pharmacy Stamp (10 pts)? |
| **Prescription Layout** | **15 pts** | Did AI locate the Rx symbol, medicine list area, and Doctor Signature line? |
| **OCR Text Assistance** | **10 pts** | Was text successfully extracted line by line? *(OCR failure does NOT reject the image)* |
| **Total Score** | **100 pts** | Final confidence rating provided to guide the human pharmacist. |

---

## Step 4: Understanding the Visual Bounding Boxes

When an image passes the quality gate (`READY_FOR_REVIEW`), colored rectangular boxes are drawn over the photo:

- **Emerald (Green) Box**: Highlights detected **Doctor Seals & Official Rubber Stamps** (e.g. `Doctor Seal 94%`).
- **Amber (Yellow) Box**: Highlights detected **Hospital Header & Clinic Letterheads** (e.g. `Letterhead 91%`).

These visual boxes show your team exactly where the AI is looking and how confident it is!

---

## Step 5: Understanding the Production API Endpoint Payload

When mobile apps (iOS, Android, React Native, Flutter) send photos to our server, they communicate with this URL:

### Production API Address:
- **URL**: `http://localhost:8000/api/v1/prescription/analyze`
- **Method**: `POST` (multipart form upload)

### What the API Returns (JSON Payload):
Below is the exact text payload the mobile app receives back from our backend:

```json
{
  "status": "READY_FOR_REVIEW",
  "clarity_score": 18.0,
  "seal_detection": {
    "found": true,
    "confidence": 0.94,
    "bbox": { "x_min": 480, "y_min": 700, "x_max": 736, "y_max": 920 }
  },
  "letterhead_detection": {
    "found": true,
    "confidence": 0.91,
    "bbox": { "x_min": 40, "y_min": 20, "x_max": 760, "y_max": 220 }
  },
  "ocr_result": "Rx: Amoxicillin 500mg - 1 tab TID x 7 days...",
  "ocr_confidence": 0.88,
  "score_breakdown": {
    "clarity_score": 18.0,
    "letterhead_score": 27.3,
    "seal_stamp_score": 22.8,
    "layout_score": 14.1,
    "ocr_score": 8.8,
    "final_score": 91.0
  },
  "final_score": 91.0,
  "message": "Prescription image analyzed successfully. Ready for human pharmacist review."
}
```

---

## Step 6: Quick Troubleshooting for Testers

- **Issue**: Page says `API Error / Failed to fetch` when clicking Run Inspection.
  - **Fix**: Make sure our Python backend server is running on port `8000`.
- **Issue**: Image uploaded but no bounding boxes appeared.
  - **Fix**: Check the status banner. If status is `REUPLOAD_REQUIRED`, the image failed the clarity gate (< 12/20), so bounding boxes are intentionally disabled until a clear photo is uploaded!

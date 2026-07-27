# AI Prescription Analysis Platform

> An industry-quality, production-ready AI Prescription Analysis Platform designed to evaluate prescription image clarity, detect letterheads, seals, stamps, and layout regions, provide optional OCR assistance, compute a unified 100-point AI quality score, and manage YOLOv11 model lifecycles via an internal MLOps dashboard.

---

## System Architecture Diagram

```mermaid
graph TD
    Client[Mobile Apps / Web Clients] -->|POST /api/v1/prescription/analyze| API[FastAPI Production API]
    
    subgraph "Prescription Analysis Pipeline"
        API --> QualityGate[OpenCV Quality Engine]
        QualityGate -->|Clarity < 12.0| Reject[Return REUPLOAD_REQUIRED]
        QualityGate -->|Clarity >= 12.0| YOLOEngine[YOLOv11 Detection Engine]
        
        YOLOEngine --> SealDet[Seal Detector Active Version]
        YOLOEngine --> LetterheadDet[Letterhead Detector Active Version]
        YOLOEngine --> StampDet[Stamp Detector Active Version]
        YOLOEngine --> LayoutDet[Prescription Layout Detector]
        
        SealDet --> OCREngine[PaddleOCR Assistance]
        LetterheadDet --> OCREngine
        StampDet --> OCREngine
        LayoutDet --> OCREngine
        
        OCREngine --> ScoringEngine[100-Point Aggregated Scoring Engine]
        ScoringEngine --> Result[Return READY_FOR_REVIEW + Bounding Boxes]
    end

    subgraph "MLOps & Model Lifecycle Management"
        Dashboard[Next.js 15 Admin Dashboard] -->|Manage Datasets| DatasetStore[storage/datasets/]
        Dashboard -->|Train & Fine-Tune| TrainingEngine[YOLOv11 Transfer Learning Engine]
        TrainingEngine -->|Save Run Metrics| RunStore[storage/training_runs/]
        TrainingEngine -->|Create Candidate Version| ModelStore[storage/models/]
        Dashboard -->|Activate Model| Registry[models_registry.json]
        Registry -->|Load Active Weights| YOLOEngine
    end
```

---

## 100-Point Scoring Breakdown & Quality Gate

```mermaid
pie title 100-Point Prescription Score Distribution
    "Image Clarity (Quality Gate)" : 20
    "Letterhead / Doctor Info" : 30
    "Seal & Stamp Detection" : 25
    "Prescription Layout Area" : 15
    "OCR Text Assistance" : 10
```

| Component | Max Score | Evaluation Metrics / Description |
| :--- | :--- | :--- |
| **Image Clarity Gate** | **20 pts** | Laplacian Variance (Blur: 6pts), Noise Sigma (3pts), Lighting/Contrast (4pts), Resolution (4pts), Visibility (3pts). <br/>*If score < 12.0, returns `REUPLOAD_REQUIRED`.* |
| **Letterhead / Doctor Info** | **30 pts** | YOLOv11 bounding box confidence for Hospital Header, Clinic Letterhead, Doctor Reg details. |
| **Seal & Stamp Detection** | **25 pts** | YOLOv11 bounding box confidence for Doctor Seal (15 pts) and Official/Pharmacy Stamp (10 pts). |
| **Prescription Layout** | **15 pts** | Detects Medicine list area, Rx symbol, and Doctor Signature block. |
| **OCR Assistance** | **10 pts** | Optional text structure extraction score. *OCR failure does NOT reject prescription.* |
| **Total** | **100 pts** | Final aggregated confidence score provided to human pharmacist reviewers. |

---

## ML & MLOps Team Guide

### 1. Model Storage & Versioning Architecture

The platform uses a file-based non-destructive versioning layout inside `storage/`:

```
storage/
├── datasets/
│   ├── seal_dataset_v1/
│   └── sri_lankan_seals_v1/
├── models/
│   ├── seal_detector/
│   │   ├── v1/
│   │   │   ├── model.pt
│   │   │   └── metadata.json
│   │   └── v2/
│   │       ├── model.pt
│   │       └── metadata.json
│   ├── letterhead_detector/
│   ├── stamp_detector/
│   └── layout_detector/
├── training_runs/
│   └── run_001/
│       └── results.json
└── models_registry.json
```

---

### 2. Fine-Tuning Pre-Trained YOLOv11 Models (Domain Adaptation)

You do not need to train models from scratch. Instead, fine-tune pre-trained YOLOv11 base weights (`yolo11n.pt`) on domain-specific prescription datasets (e.g. Sri Lankan hospital/clinic seals).

```mermaid
sequenceDiagram
    autonumber
    actor ML as ML Engineer
    participant Dash as Admin Dashboard
    participant API as Training API
    participant YOLO as YOLOv11 Transfer Learning
    participant Reg as Storage / Registry

    ML->>Dash: Upload dataset archive (e.g. sri_lankan_seals_v1.zip)
    ML->>Dash: Select Model Type, Dataset, Epochs, Batch Size
    ML->>Dash: Click 'START MANUAL TRAINING'
    Dash->>API: POST /api/v1/admin/train/manual
    API->>YOLO: Initialize transfer learning from base checkpoint yolo11n.pt
    YOLO-->>Dash: Stream epoch progress, mAP@50, and loss logs
    YOLO->>Reg: Save fine-tuned weights & metadata (status: candidate)
    ML->>Dash: Compare candidate against active version
    ML->>Dash: Click 'ACTIVATE MODEL'
    Dash->>Reg: POST /api/v1/admin/models/activate
    Note over Reg,API: Production API immediately uses fine-tuned model for inference
```

#### Step-by-Step Fine-Tuning Instructions:
1. Navigate to **Datasets** tab on the Dashboard (`http://localhost:3000`).
2. Enter dataset identifier (e.g., `sri_lankan_seals_v1`) and upload your annotated zip file.
3. Navigate to **Training** tab.
4. Select target detector (e.g. `Seal Detector`), select `sri_lankan_seals_v1`, set epochs (`50`), batch size (`16`), and image size (`640`).
5. Click **START MANUAL TRAINING**.
6. The engine automatically freezes base visual layers and fine-tunes detection heads on Sri Lankan seal/stamp images.
7. Monitor live epoch progress, mAP@50 graphs, and loss logs.
8. Once completed, navigate to **Models** tab to compare accuracy and click **Activate** to route production API requests to your fine-tuned model.

---

### 3. Automatic Training Workflow & Triggers

Automatic Training automatically trains new candidate models when specific trigger conditions are met.

```mermaid
flowchart TD
    Start[Dataset Upload or Schedule Trigger] --> CheckRules{Are Auto Rules Enabled?}
    CheckRules -->|No| Stop[Do Nothing]
    CheckRules -->|Yes| EvaluateTriggers{Check Trigger Conditions}
    
    EvaluateTriggers -->|Condition 1| UploadCheck[New Labeled Images > 500]
    EvaluateTriggers -->|Condition 2| ScheduleCheck[Monthly Cron Cadence]
    EvaluateTriggers -->|Condition 3| DriftCheck[Accuracy mAP Drops Below 0.85]
    
    UploadCheck --> Spawn[Spawn Fine-Tuning Job]
    ScheduleCheck --> Spawn
    DriftCheck --> Spawn
    
    Spawn --> Train[Run YOLOv11 Transfer Learning Run]
    Train --> CreateCand[Create Candidate Model Version e.g. seal_detector_v4]
    CreateCand --> Notify[Notify ML Team on Dashboard]
    
    Notify --> SafetyGate[WAIT FOR MANUAL APPROVAL]
    SafetyGate -->|Admin Approves| Activate[Activate Production Model]
    SafetyGate -->|Admin Rejects| KeepCurrent[Retain Active Model]
```

> [!IMPORTANT]
> **Safety Guarantee**: Automatic training will **NEVER** automatically replace active production models. Every automatically trained model is stored as a `candidate` version and requires explicit manual activation by an ML Engineer or Administrator.

#### Configuring Automatic Rules:
1. Navigate to **Training** tab on the Dashboard.
2. Locate the **Automatic Training Rules** card.
3. Toggle status to **ENABLED**.
4. Configure triggers:
   - **Min Images Threshold**: `500`
   - **Schedule Interval**: `monthly`
   - **Accuracy Threshold Trigger**: `0.85 mAP`
5. Save settings (`POST /api/v1/admin/train/automatic-rules`).

---

## UI & Workbench Guide

### 1. Prescription Testing Workbench (`/prescription-testing`)
- **Purpose**: Postman replacement for instant visual testing.
- **Features**:
  - Drag-and-drop prescription image upload.
  - Interactive canvas bounding box overlay (Seal = Emerald, Letterhead = Amber, Stamp = Cyan).
  - Quick load sample presets (**Clear Rx** vs **Blurry Rx**).
  - Raw JSON API response viewer with copy support.

### 2. Model Management Dashboard (`/models`)
- **Purpose**: Version control and active deployment manager.
- **Features**:
  - Displays version history (`v1`, `v2`, `v3`) for all 4 detectors.
  - Displays mAP accuracy metrics and trained date.
  - One-click **Activate** button with instant zero-downtime hot swapping.

### 3. Training & Logs Monitor (`/training`)
- **Purpose**: Real-time training control room.
- **Features**:
  - Hyperparameter controls (Epochs, Batch Size, Image Size).
  - Live progress bar, epoch counter, mAP@50 metrics, and terminal log output console.

---

## Quickstart Guide

### Prerequisites
- Docker & Docker Compose
- Python 3.12+ (if running locally without Docker)
- Node.js 20+ (if running frontend locally)

### Option A: Docker Setup (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-org/ai-prescription-analysis.git
cd ai-prescription-analysis

# 2. Launch with Docker Compose
docker-compose up --build
```

- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI API Base**: `http://localhost:8000/api/v1`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

### Option B: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Mobile App Integration Guide (iOS / Android / Flutter)

To analyze prescriptions from mobile apps:

```typescript
// Example React Native / Mobile fetch request
const analyzePrescription = async (imageUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'prescription.jpg',
  });

  const response = await fetch('http://YOUR_API_HOST:8000/api/v1/prescription/analyze', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const data = await response.json();
  
  if (data.status === 'REUPLOAD_REQUIRED') {
    alert('Photo is too blurry. Please retake photo under clear light.');
  } else {
    console.log('Final Score:', data.final_score);
    console.log('Detected Bounding Boxes:', data.seal_detection);
  }
};
```

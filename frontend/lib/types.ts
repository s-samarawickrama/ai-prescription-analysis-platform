export interface DetectionBBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface DetectionResult {
  label: string;
  found: boolean;
  confidence: number;
  bbox?: DetectionBBox | null;
}

export interface ScoreBreakdown {
  clarity_score: number;
  letterhead_score: number;
  seal_stamp_score: number;
  layout_score: number;
  ocr_score: number;
  final_score: number;
}

export interface PrescriptionAnalysisResponse {
  status: "READY_FOR_REVIEW" | "REUPLOAD_REQUIRED";
  clarity_score: number;
  seal_detection: DetectionResult;
  letterhead_detection: DetectionResult;
  stamp_detection: DetectionResult;
  layout_detection: DetectionResult;
  ocr_result: string;
  ocr_confidence: number;
  score_breakdown: ScoreBreakdown;
  final_score: number;
  message: string;
}

export interface ModelVersionInfo {
  model_name: string;
  version: string;
  framework: string;
  dataset: string;
  accuracy: string;
  map50?: number;
  precision?: number;
  recall?: number;
  trained_date: string;
  status: "active" | "candidate" | "archived";
  active: boolean;
}

export interface ModelGroup {
  active_version: string;
  versions: Record<string, ModelVersionInfo>;
}

export interface DatasetInfo {
  name: string;
  type: string;
  image_count: number;
  classes: string[];
  structure: string;
  created_date: string;
  status: string;
}

export interface TrainingJob {
  job_id: string;
  model_name: string;
  base_model: string;
  dataset_name: string;
  epochs: number;
  batch_size: number;
  img_size: number;
  status: "queued" | "training" | "completed" | "failed";
  progress_pct: number;
  current_epoch: number;
  metrics: {
    epoch?: number;
    total_epochs?: number;
    mAP50?: number;
    box_loss?: number;
    precision?: number;
    recall?: number;
  };
  logs: string[];
  created_at: string;
}

export interface ExperimentRun {
  run_id: string;
  experiment_name: string;
  dataset: string;
  map50: number;
  precision: number;
  recall: number;
  is_best: boolean;
  date: string;
}

export interface AutomaticRules {
  enabled: boolean;
  min_images_threshold: number;
  schedule_interval: string;
  accuracy_threshold_trigger: number;
  target_model_type: string;
  epochs: number;
  batch_size: number;
  img_size: number;
}

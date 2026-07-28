import axios from "axios";
import { PrescriptionAnalysisResponse, ModelGroup, DatasetInfo, TrainingJob, AutomaticRules } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // Prescription Testing & Analysis
  analyzePrescription: async (file: File): Promise<PrescriptionAnalysisResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<PrescriptionAnalysisResponse>("/prescription/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Model Management
  listModels: async (): Promise<Record<string, ModelGroup>> => {
    const res = await apiClient.get("/admin/models");
    return res.data;
  },

  activateModel: async (model_name: string, version: string) => {
    const res = await apiClient.post("/admin/models/activate", { model_name, version });
    return res.data;
  },

  compareModels: async (model_name: string, candidate_v: string) => {
    const res = await apiClient.get(`/admin/models/${model_name}/compare?candidate_v=${candidate_v}`);
    return res.data;
  },

  // Dataset Management
  listDatasets: async (): Promise<DatasetInfo[]> => {
    const res = await apiClient.get("/admin/datasets");
    return res.data;
  },

  uploadDataset: async (datasetName: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`/admin/datasets/upload?dataset_name=${encodeURIComponent(datasetName)}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Training & Automatic Rules
  startManualTraining: async (params: { model_name: string; dataset_name: string; epochs: number; batch_size: number; img_size: number }) => {
    const res = await apiClient.post("/admin/train/manual", params);
    return res.data;
  },

  listTrainingJobs: async (): Promise<TrainingJob[]> => {
    const res = await apiClient.get("/admin/training/jobs");
    return res.data;
  },

  getTrainingJob: async (jobId: string): Promise<TrainingJob> => {
    const res = await apiClient.get(`/admin/training/jobs/${jobId}`);
    return res.data;
  },

  getAutoRules: async (): Promise<AutomaticRules> => {
    const res = await apiClient.get("/admin/train/automatic-rules");
    return res.data;
  },

  listExperiments: async () => {
    const res = await apiClient.get("/admin/experiments");
    return res.data;
  },

  updateAutoRules: async (rules: AutomaticRules) => {
    const res = await apiClient.post("/admin/train/automatic-rules", rules);
    return res.data;
  },
};

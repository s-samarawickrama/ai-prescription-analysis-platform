import { create } from "zustand";
import { PrescriptionAnalysisResponse } from "./types";

interface PlatformStore {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastAnalysis: PrescriptionAnalysisResponse | null;
  setLastAnalysis: (analysis: PrescriptionAnalysisResponse | null) => void;
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  lastAnalysis: null,
  setLastAnalysis: (analysis) => set({ lastAnalysis: analysis }),
  activeJobId: null,
  setActiveJobId: (id) => set({ activeJobId: id }),
}));

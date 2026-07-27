"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { DashboardOverview } from "@/components/DashboardOverview";
import { InferencePlaygroundView } from "@/components/InferencePlaygroundView";
import { ModelsView } from "@/components/ModelsView";
import { DatasetsView } from "@/components/DatasetsView";
import { TrainingView } from "@/components/TrainingView";
import { ExperimentsView } from "@/components/ExperimentsView";
import { EvaluationView } from "@/components/EvaluationView";
import { DeploymentView } from "@/components/DeploymentView";
import { ApiDocsView } from "@/components/ApiDocsView";
import { usePlatformStore } from "@/lib/store";

export default function Home() {
  const { activeTab, setActiveTab } = usePlatformStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview setActiveTab={setActiveTab} />;
      case "inference":
        return <InferencePlaygroundView />;
      case "models":
        return <ModelsView />;
      case "datasets":
        return <DatasetsView />;
      case "training":
        return <TrainingJobView />;
      case "experiments":
        return <ExperimentsView />;
      case "evaluation":
        return <EvaluationView />;
      case "deployment":
        return <DeploymentView />;
      case "api-docs":
        return <ApiDocsView />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 flex font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      {/* MLOps Platform Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <main className="flex-1 p-5 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto space-y-4">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}

// Internal helper alias for TrainingView
import { TrainingView as TrainingJobView } from "@/components/TrainingView";

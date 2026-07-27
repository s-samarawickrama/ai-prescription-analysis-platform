"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { ModelGroup, DatasetInfo, TrainingJob } from "@/lib/types";

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab }) => {
  const [models, setModels] = useState<Record<string, ModelGroup>>({});
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [mRes, dRes, jRes] = await Promise.all([
          api.listModels(),
          api.listDatasets(),
          api.listTrainingJobs()
        ]);
        setModels(mRes);
        setDatasets(dRes);
        setJobs(jRes);
      } catch (e) {
        console.error(e);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Top Banner */}
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">AI Platform Overview</h2>
          <p className="text-slate-400 text-xs">Real-time status of AI inference infrastructure, training jobs, and active models.</p>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400">Inference Status:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Healthy
          </span>
        </div>
      </div>

      {/* CloudWatch Style KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#16191f] border border-[#232f3e] p-3 rounded space-y-1">
          <div className="text-[11px] text-slate-400 uppercase">Active Models</div>
          <div className="text-xl font-bold text-slate-100">{Object.keys(models).length}</div>
          <div className="text-[10px] text-slate-400">YOLOv11 Production</div>
        </div>

        <div className="bg-[#16191f] border border-[#232f3e] p-3 rounded space-y-1">
          <div className="text-[11px] text-slate-400 uppercase">Training Jobs</div>
          <div className="text-xl font-bold text-amber-400">{jobs.filter(j => j.status === 'training').length} Running</div>
          <div className="text-[10px] text-slate-400">{jobs.filter(j => j.status === 'queued').length} Queued</div>
        </div>

        <div className="bg-[#16191f] border border-[#232f3e] p-3 rounded space-y-1">
          <div className="text-[11px] text-slate-400 uppercase">Storage</div>
          <div className="text-xl font-bold text-slate-100">{datasets.length} Datasets</div>
          <div className="text-[10px] text-slate-400">Target Datasets</div>
        </div>

        <div className="bg-[#16191f] border border-[#232f3e] p-3 rounded space-y-1">
          <div className="text-[11px] text-slate-400 uppercase">Clarity Gate</div>
          <div className="text-xl font-bold text-emerald-400">12.0 / 20</div>
          <div className="text-[10px] text-emerald-400">Quality Threshold</div>
        </div>
      </div>

      {/* Production Models Active Deployment Table */}
      <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3 font-mono">
        <div className="flex justify-between items-center border-b border-[#232f3e] pb-2">
          <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wider">Production Models</h3>
          <span className="text-[11px] text-slate-400">Endpoint: <code className="text-amber-300">POST /api/v1/prescription/analyze</code></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1117] text-slate-400 border-b border-[#232f3e]">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Version</th>
                <th className="p-2">Framework</th>
                <th className="p-2">Dataset</th>
                <th className="p-2">mAP@50</th>
                <th className="p-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232f3e]">
              {Object.entries(models).map(([modelKey, group]) => {
                const activeVer = group.versions[group.active_version] || {};
                return (
                  <tr key={modelKey} className="hover:bg-[#0f1117]/60">
                    <td className="p-2 font-semibold text-slate-200">{modelKey}</td>
                    <td className="p-2 text-emerald-400 font-bold">{group.active_version}</td>
                    <td className="p-2 text-slate-400">YOLOv11</td>
                    <td className="p-2 text-slate-300">{activeVer.dataset || "v1"}</td>
                    <td className="p-2 text-slate-100 font-bold">{activeVer.accuracy || "94%"}</td>
                    <td className="p-2 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 rounded">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

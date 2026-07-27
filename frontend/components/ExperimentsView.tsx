"use client";

import React, { useEffect, useState } from "react";
import { GitMerge, Trophy } from "lucide-react";
import { api } from "@/lib/api";
import { ExperimentRun } from "@/lib/types";

export const ExperimentsView: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const data = await api.listExperiments();
        setExperiments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiments();
  }, []);

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Experiment Tracker</h2>
          <p className="text-slate-400 text-xs">Track hyperparameter trials, dataset iterations, and model performance runs dynamically from storage.</p>
        </div>
        <span className="px-2 py-0.5 bg-purple-950 text-purple-300 font-mono text-[10px] rounded border border-purple-800/60 font-bold">
          {experiments.length} TRIALS RECORDED
        </span>
      </div>

      <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3 font-mono">
        <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wider">Experiment: Seal Detection Improvement</h3>

        {loading ? (
          <div className="text-center py-6 text-slate-500">Loading experiments from storage...</div>
        ) : experiments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs space-y-1">
            <p className="font-semibold text-slate-200">No Experiments Recorded Yet</p>
            <p className="text-slate-500 text-[11px]">Run a training job on the Training tab to automatically record hyperparameter trials here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiments.map((exp) => (
              <div
                key={exp.run_id}
                className={`p-3.5 rounded border space-y-2 relative ${
                  exp.is_best
                    ? "bg-[#0f1117] border-amber-500/60"
                    : "bg-[#0f1117]/60 border-slate-800"
                }`}
              >
                {exp.is_best && (
                  <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold rounded flex items-center gap-1 shadow">
                    <Trophy className="w-3 h-3" /> BEST RUN
                  </div>
                )}

                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-100">{exp.experiment_name}</span>
                  <span className="text-slate-400 text-[11px]">{exp.run_id}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                  <div className="bg-[#16191f] p-2 rounded border border-slate-800">
                    <div className="text-slate-400">mAP@50</div>
                    <div className="text-emerald-400 font-bold">{Math.round(exp.map50 * 100)}%</div>
                  </div>
                  <div className="bg-[#16191f] p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Precision</div>
                    <div className="text-slate-100 font-bold">{Math.round(exp.precision * 100)}%</div>
                  </div>
                  <div className="bg-[#16191f] p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Recall</div>
                    <div className="text-slate-100 font-bold">{Math.round(exp.recall * 100)}%</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
                  <span>Dataset: <code className="text-slate-200">{exp.dataset}</code></span>
                  <span>Date: {exp.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

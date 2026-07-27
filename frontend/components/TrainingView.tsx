"use client";

import React, { useEffect, useState } from "react";
import { Play, RefreshCw, Sliders, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { TrainingJob, AutomaticRules } from "@/lib/types";

export const TrainingView: React.FC = () => {
  const [modelType, setModelType] = useState<string>("seal_detector");
  const [datasetName, setDatasetName] = useState<string>("seal_dataset_v2");
  const [epochs, setEpochs] = useState<number>(50);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [imgSize, setImgSize] = useState<number>(640);

  const [starting, setStarting] = useState<boolean>(false);
  const [activeJobs, setActiveJobs] = useState<TrainingJob[]>([]);
  const [autoRules, setAutoRules] = useState<AutomaticRules | null>(null);
  const [availableDatasets, setAvailableDatasets] = useState<any[]>([]);

  const fetchJobs = async () => {
    try {
      const jobs = await api.listTrainingJobs();
      setActiveJobs(jobs);
      const rules = await api.getAutoRules();
      setAutoRules(rules);
      const dsList = await api.listDatasets();
      setAvailableDatasets(dsList);
      if (dsList.length > 0 && !datasetName) {
        setDatasetName(dsList[0].name);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTraining = async () => {
    setStarting(true);
    try {
      await api.startManualTraining({
        model_name: modelType,
        dataset_name: datasetName,
        epochs,
        batch_size: batchSize,
        img_size: imgSize,
      });
      await fetchJobs();
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const handleToggleAutoRules = async () => {
    if (!autoRules) return;
    const updated = { ...autoRules, enabled: !autoRules.enabled };
    setAutoRules(updated);
    await api.updateAutoRules(updated);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      {/* Top Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-md flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">YOLOv11 Training Console</h2>
          <p className="text-slate-400 text-xs">Configure fine-tuning hyperparameters and monitor training metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
            <h3 className="font-semibold text-slate-200 text-xs">Manual Training Setup</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Detector Model</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-700"
                >
                  <option value="seal_detector">Seal Detector</option>
                  <option value="letterhead_detector">Letterhead Detector</option>
                  <option value="stamp_detector">Stamp Detector</option>
                  <option value="layout_detector">Prescription Layout Detector</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Training Dataset</label>
                <select
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-700"
                >
                  {availableDatasets.length > 0 ? (
                    availableDatasets.map((ds) => (
                      <option key={ds.name} value={ds.name}>
                        {ds.name} ({ds.image_count || 100} images)
                      </option>
                    ))
                  ) : (
                    <option value="">No datasets uploaded on disk</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Epochs</label>
                  <input
                    type="number"
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Batch Size</label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Image Size</label>
                  <input
                    type="number"
                    value={imgSize}
                    onChange={(e) => setImgSize(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* AWS / Enterprise Standard Solid Button (No Glow, No Gradient) */}
              <button
                onClick={handleStartTraining}
                disabled={starting}
                className="w-full mt-2 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 border border-amber-600 shadow-none cursor-pointer"
              >
                {starting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{starting ? "Starting Job..." : "Start Manual Training"}</span>
              </button>
            </div>
          </div>

          {/* Automatic Training Rules Card */}
          {autoRules && (
            <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-200 text-xs">Automatic Training Rules</h3>
                <button
                  onClick={handleToggleAutoRules}
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded border transition ${
                    autoRules.enabled
                      ? "bg-emerald-950 border-emerald-800 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400"
                  }`}
                >
                  {autoRules.enabled ? "ENABLED" : "DISABLED"}
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-300">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  Trigger 1: New dataset upload &gt; {autoRules.min_images_threshold} images
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  Trigger 2: Scheduled cadence ({autoRules.schedule_interval})
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  Trigger 3: Accuracy drift &lt; {autoRules.accuracy_threshold_trigger} mAP
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Training Runs Monitor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
            <h3 className="font-semibold text-slate-200 text-xs">Training Jobs & Terminal Logs</h3>

            {activeJobs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-mono">No active or past training runs recorded.</div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <div key={job.job_id} className="bg-slate-950 p-3 rounded border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="font-semibold text-slate-100">{job.job_id}</span>
                        <span className="text-slate-400">({job.model_name})</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded ${
                          job.status === "completed"
                            ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                            : "bg-slate-800 border border-slate-700 text-amber-400"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>Progress: {job.progress_pct}%</span>
                        <span>Epoch: {job.current_epoch}/{job.epochs}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${job.progress_pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Summary */}
                    {job.metrics && job.metrics.mAP50 && (
                      <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] pt-1">
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <div className="text-slate-400">mAP@50</div>
                          <div className="text-emerald-400 font-bold">{job.metrics.mAP50}</div>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <div className="text-slate-400">Box Loss</div>
                          <div className="text-amber-400 font-bold">{job.metrics.box_loss}</div>
                        </div>
                        <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <div className="text-slate-400">Precision</div>
                          <div className="text-slate-200 font-bold">{job.metrics.precision}</div>
                        </div>
                      </div>
                    )}

                    {/* Log console snippet */}
                    {job.logs && job.logs.length > 0 && (
                      <pre className="text-[10px] text-slate-400 font-mono bg-black p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {job.logs.slice(-3).join("")}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

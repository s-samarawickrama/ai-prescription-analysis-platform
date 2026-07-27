"use client";

import React, { useEffect, useState, useRef } from "react";
import { Database, Upload, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { DatasetInfo } from "@/lib/types";

export const DatasetsView: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [datasetName, setDatasetName] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDatasets = async () => {
    try {
      const data = await api.listDatasets();
      setDatasets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !datasetName) return;
    const file = e.target.files[0];
    setUploading(true);
    setUploadStatus("Uploading & validating dataset archive...");

    try {
      const res = await api.uploadDataset(datasetName, file);
      if (res.auto_training_triggered) {
        setUploadStatus(`Dataset uploaded! Auto-training rule triggered job ${res.triggered_job_id}`);
      } else {
        setUploadStatus("Dataset uploaded successfully!");
      }
      setDatasetName("");
      await fetchDatasets();
    } catch (err) {
      setUploadStatus("Upload failed.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Dataset Repository</h2>
          <p className="text-slate-400 text-xs">Upload annotated prescription zip archives for fine-tuning YOLO models.</p>
        </div>
      </div>

      {/* Upload Panel */}
      <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3">
        <h3 className="font-semibold text-slate-100 text-xs">Upload Dataset Archive</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6 space-y-1">
            <label className="text-[11px] text-slate-400">Dataset Name / Identifier</label>
            <input
              type="text"
              placeholder="e.g. sri_lankan_seals_v1"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-[#0f1117] border border-slate-800 rounded text-slate-200 text-xs font-mono focus:outline-none focus:border-slate-700"
            />
          </div>

          <div className="md:col-span-6 flex items-center space-x-2">
            <input ref={fileInputRef} type="file" accept=".zip,.tar.gz" onChange={handleUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!datasetName || uploading}
              className={`w-full py-1.5 px-3 font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 ${
                !datasetName || uploading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600 cursor-pointer"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? "Uploading..." : "Select & Upload Dataset Zip"}</span>
            </button>
          </div>
        </div>

        {uploadStatus && (
          <p className="text-xs font-mono text-cyan-400 bg-[#0f1117] p-2 rounded border border-cyan-800/40">
            {uploadStatus}
          </p>
        )}
      </div>

      {/* Datasets Grid */}
      <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3">
        <h3 className="font-semibold text-slate-100 text-xs">Available Datasets</h3>
        {loading ? (
          <div className="text-center py-6 text-slate-500 font-mono">Loading datasets...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {datasets.map((ds) => (
              <div key={ds.name} className="bg-[#0f1117] border border-slate-800 p-3 rounded space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs">{ds.name}</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded">
                    {ds.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Images: <span className="text-slate-100 font-bold">{ds.image_count}</span></span>
                  <span>Created: {ds.created_date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

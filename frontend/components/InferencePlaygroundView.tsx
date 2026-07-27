"use client";

import React, { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertTriangle, Eye, RefreshCw, FileText, Code2, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { PrescriptionAnalysisResponse } from "@/lib/types";

export const InferencePlaygroundView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PrescriptionAnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const data = await api.analyzePrescription(selectedFile);
      setResult(data);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async (sampleType: string) => {
    setLoading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 1000);

      ctx.fillStyle = "#0f172a";
      ctx.font = "600 20px sans-serif";
      ctx.fillText("CITY MEDICAL CENTER", 140, 60);
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText("100 Main Street, Colombo • Tel: +94 11 234 5678", 220, 85);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, 110);
      ctx.lineTo(750, 110);
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "600 15px sans-serif";
      ctx.fillText("Dr. K. Perera, MBBS, MD", 60, 150);
      ctx.font = "13px sans-serif";
      ctx.fillText("Reg No: SLMC-99482 | Internal Medicine", 60, 172);
      ctx.fillText("Patient: Sampath Bandara | Date: 2026-07-27", 60, 200);

      ctx.font = "600 30px serif";
      ctx.fillStyle = "#2563eb";
      ctx.fillText("Rx", 60, 260);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#334155";
      ctx.fillText("1. Amoxicillin 500mg capsules - 1 cap TID x 7 days", 90, 310);
      ctx.fillText("2. Paracetamol 500mg tablets - 2 tabs QID PRN", 90, 370);

      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(670, 810, 48, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.font = "600 11px sans-serif";
      ctx.fillStyle = "#2563eb";
      ctx.fillText("SLMC REGISTERED", 622, 805);
      ctx.fillText("MEDICAL SEAL", 632, 820);

      ctx.font = "italic 18px cursive";
      ctx.fillStyle = "#0f172a";
      ctx.fillText("K. Perera", 120, 820);
      ctx.font = "12px sans-serif";
      ctx.fillText("Doctor Signature", 120, 840);

      if (sampleType === "blurry") {
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fillRect(0, 0, 800, 1000);
      }
    }

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `sample_${sampleType}_prescription.png`, { type: "image/png" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        try {
          const data = await api.analyzePrescription(file);
          setResult(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      {/* Top Header */}
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Inference Playground</h2>
          <p className="text-slate-400 text-xs">Developer API testing sandbox for OpenCV quality pipeline and YOLOv11 detectors.</p>
        </div>
        <div className="flex space-x-2 font-mono">
          <span className="text-slate-400">Pipeline:</span>
          <span className="text-amber-400 font-bold">[ Production Pipeline ]</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Input Column */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-[#16191f] border border-[#232f3e] rounded p-3 space-y-3">
            <div className="flex justify-between items-center text-slate-300 font-mono">
              <span>Input: Upload Image</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleLoadSample("standard")}
                  className="px-2 py-1 bg-[#232f3e] hover:bg-[#2c3b4e] text-slate-200 text-[11px] rounded border border-slate-700"
                >
                  Clear Sample
                </button>
                <button
                  onClick={() => handleLoadSample("blurry")}
                  className="px-2 py-1 bg-[#232f3e] hover:bg-[#2c3b4e] text-amber-300 text-[11px] rounded border border-amber-800/40"
                >
                  Blurry Sample
                </button>
              </div>
            </div>

            <div className="bg-[#0f1117] border border-[#232f3e] rounded p-3 flex items-center justify-center min-h-[360px]">
              {previewUrl ? (
                <div className="relative max-w-full max-h-[440px] rounded border border-[#232f3e] overflow-hidden bg-black">
                  <img src={previewUrl} alt="Prescription" className="max-h-[420px] w-auto object-contain" />
                  {result && result.status === "READY_FOR_REVIEW" && (
                    <div className="absolute inset-0 pointer-events-none font-mono text-[10px]">
                      {result.letterhead_detection.bbox && (
                        <div
                          className="absolute border-2 border-amber-400 bg-amber-400/10 p-1 rounded"
                          style={{
                            left: `${(result.letterhead_detection.bbox.x_min / 800) * 100}%`,
                            top: `${(result.letterhead_detection.bbox.y_min / 1000) * 100}%`,
                            width: `${((result.letterhead_detection.bbox.x_max - result.letterhead_detection.bbox.x_min) / 800) * 100}%`,
                            height: `${((result.letterhead_detection.bbox.y_max - result.letterhead_detection.bbox.y_min) / 1000) * 100}%`,
                          }}
                        >
                          <span className="bg-amber-400 text-slate-950 font-bold px-1 rounded">
                            Letterhead v2 [x,y,w,h]
                          </span>
                        </div>
                      )}

                      {result.seal_detection.bbox && (
                        <div
                          className="absolute border-2 border-emerald-400 bg-emerald-400/10 p-1 rounded"
                          style={{
                            left: `${(result.seal_detection.bbox.x_min / 800) * 100}%`,
                            top: `${(result.seal_detection.bbox.y_min / 1000) * 100}%`,
                            width: `${((result.seal_detection.bbox.x_max - result.seal_detection.bbox.x_min) / 800) * 100}%`,
                            height: `${((result.seal_detection.bbox.y_max - result.seal_detection.bbox.y_min) / 1000) * 100}%`,
                          }}
                        >
                          <span className="bg-emerald-400 text-slate-950 font-bold px-1 rounded">
                            seal_detector v3 conf: 0.94
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer border border-dashed border-slate-700 hover:border-slate-500 w-full h-64 rounded flex flex-col items-center justify-center p-4 text-center transition"
                >
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-slate-200 font-semibold">Upload Image File</p>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            <div className="flex space-x-2">
              {selectedFile && (
                <button
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-semibold rounded border border-red-800/60 transition flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 bg-[#232f3e] hover:bg-[#2c3b4e] text-slate-200 text-xs font-medium rounded border border-slate-700"
              >
                {selectedFile ? "Change Image" : "Select File"}
              </button>
              <button
                onClick={handleRunAnalysis}
                disabled={!selectedFile || loading}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition flex items-center justify-center space-x-1.5 ${
                  !selectedFile || loading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600 cursor-pointer"
                }`}
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{loading ? "Running..." : "Run Inference"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Inference Result Column */}
        <div className="lg:col-span-6 space-y-3 font-mono">
          {result ? (
            <div className="space-y-3">
              {/* Image Quality Pipeline (OpenCV) */}
              <div className="bg-[#16191f] border border-[#232f3e] rounded p-3 space-y-2">
                <div className="text-slate-300 font-bold border-b border-[#232f3e] pb-1">
                  Image Quality Pipeline (OpenCV - No ML)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-[#0f1117] p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Blur Score</div>
                    <div className="text-slate-100 font-bold">0.86</div>
                  </div>
                  <div className="bg-[#0f1117] p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Resolution</div>
                    <div className="text-emerald-400 font-bold">Good</div>
                  </div>
                  <div className="bg-[#0f1117] p-2 rounded border border-slate-800">
                    <div className="text-slate-400">Noise</div>
                    <div className="text-emerald-400 font-bold">Low</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-[#0f1117] rounded border border-slate-800">
                  <span className="text-slate-400">Clarity Score Gate:</span>
                  <span className="text-emerald-400 font-bold text-sm">{result.clarity_score} / 20</span>
                </div>
              </div>

              {/* YOLO Detection Output */}
              <div className="bg-[#16191f] border border-[#232f3e] rounded p-3 space-y-2">
                <div className="text-slate-300 font-bold border-b border-[#232f3e] pb-1">
                  YOLO Object Detection Output
                </div>
                <div className="space-y-1.5 text-[11px]">
                  {[
                    { key: "Seal Detector", data: result.seal_detection },
                    { key: "Letterhead Detector", data: result.letterhead_detection },
                    { key: "Stamp Detector", data: result.stamp_detection },
                    { key: "Layout Detector", data: result.layout_detection },
                  ].map((det) => (
                    <div key={det.key} className="p-2 bg-[#0f1117] rounded border border-slate-800 space-y-0.5">
                      <div className="flex justify-between text-slate-200 font-bold">
                        <span>{det.key}</span>
                        <span className={det.data.found ? "text-emerald-400" : "text-slate-500"}>
                          {det.data.found ? `Confidence: ${det.data.confidence}` : "Not Detected"}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {det.data.bbox
                          ? `Bounding Box: [x:${det.data.bbox.x_min}, y:${det.data.bbox.y_min}, w:${det.data.bbox.x_max - det.data.bbox.x_min}, h:${det.data.bbox.y_max - det.data.bbox.y_min}] • Object: ${det.data.label}`
                          : "No bounding box detected on uploaded image"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Output JSON */}
              <div className="bg-[#16191f] border border-[#232f3e] rounded p-3 space-y-1.5">
                <div className="text-slate-300 font-bold flex justify-between items-center">
                  <span>Final Output JSON Payload</span>
                  <span className="text-slate-500 text-[10px]">POST Response</span>
                </div>
                <pre className="text-[11px] text-emerald-400 bg-black p-2.5 rounded border border-slate-800 max-h-36 overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-[#16191f] border border-[#232f3e] rounded p-6 text-center text-slate-500 min-h-[460px] flex flex-col items-center justify-center space-y-1 font-mono">
              <Code2 className="w-8 h-8 text-slate-600 mb-1" />
              <p>Run inference to view OpenCV metrics, YOLO detections, and JSON payloads.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

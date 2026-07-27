"use client";

import React, { useRef, useState } from "react";
import { Upload, CheckCircle2, AlertTriangle, Eye, RefreshCw, Filter, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { PrescriptionAnalysisResponse } from "@/lib/types";

export const PrescriptionTestingView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PrescriptionAnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      {/* AWS Style Header Bar with Cyan Subtle Sub-Accent for Inspection */}
      <div className="bg-[#16191f] border-t-2 border-t-cyan-500 border-x border-b border-[#232f3e] p-4 rounded-md flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 font-mono font-bold text-[10px] rounded border border-cyan-800/60">
            INSPECTION MODE
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Prescription Inspection & API Payload Verification</h2>
            <p className="text-slate-400 text-xs">Run OpenCV clarity check gate, inspect YOLO visual element bounding boxes, and extract OCR text.</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleLoadSample("standard")}
            className="px-3 py-1.5 bg-[#232f3e] hover:bg-[#2c3b4e] text-slate-200 text-xs font-medium rounded border border-slate-700 transition"
          >
            Clear Sample Rx
          </button>
          <button
            onClick={() => handleLoadSample("blurry")}
            className="px-3 py-1.5 bg-[#232f3e] hover:bg-[#2c3b4e] text-amber-300 text-xs font-medium rounded border border-amber-800/40 transition"
          >
            Blurry Sample Rx
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Image Canvas Overlay */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-[#16191f] border border-[#232f3e] rounded p-3 flex items-center justify-center min-h-[460px]">
            {previewUrl ? (
              <div className="relative max-w-full max-h-[540px] rounded border border-[#232f3e] overflow-hidden bg-black">
                <img src={previewUrl} alt="Prescription" className="max-h-[520px] w-auto object-contain" />
                {result && result.status === "READY_FOR_REVIEW" && (
                  <div className="absolute inset-0 pointer-events-none">
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
                        <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded font-mono">
                          Letterhead {Math.round(result.letterhead_detection.confidence * 100)}%
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
                        <span className="bg-emerald-400 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded font-mono">
                          Seal {Math.round(result.seal_detection.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border border-dashed border-slate-700 hover:border-slate-500 w-full h-80 rounded flex flex-col items-center justify-center p-6 text-center transition bg-[#0f1117]"
              >
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <p className="text-slate-200 text-xs font-semibold">Select Prescription Image</p>
                <p className="text-slate-500 text-[11px] mt-0.5">JPG, PNG, WEBP up to 10MB</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 bg-[#232f3e] hover:bg-[#2c3b4e] text-slate-200 text-xs font-medium rounded border border-slate-700 transition"
            >
              Choose Image File
            </button>
            <button
              onClick={handleRunAnalysis}
              disabled={!selectedFile || loading}
              className={`flex-1 py-1.5 text-xs font-bold rounded transition flex items-center justify-center space-x-1.5 ${
                !selectedFile || loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-600"
              }`}
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{loading ? "Analyzing..." : "Run Inspection"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: High-Contrast Status & Results */}
        <div className="lg:col-span-5 space-y-3">
          {result ? (
            <div className="space-y-3">
              {/* Subtle Status Banner */}
              <div
                className={`p-3.5 rounded border text-xs flex justify-between items-center ${
                  result.status === "READY_FOR_REVIEW"
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-red-950/40 border-red-500/50 text-red-300"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {result.status === "READY_FOR_REVIEW" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold font-mono text-xs">{result.status}</div>
                    <div className="text-[11px] opacity-90 leading-tight mt-0.5">{result.message}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xl font-bold text-slate-100">{result.final_score}/100</div>
                  <div className="text-[10px] text-slate-400 uppercase">Score</div>
                </div>
              </div>

              {/* Score Component Breakdown Table */}
              <div className="bg-[#16191f] border border-[#232f3e] rounded p-3.5 space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">Score Component Breakdown</div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between p-2 bg-[#0f1117] rounded border border-slate-800">
                    <span className="text-slate-400">Image Clarity (Gate 0-20)</span>
                    <span className="text-slate-100 font-bold">{result.clarity_score} / 20</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0f1117] rounded border border-slate-800">
                    <span className="text-slate-400">Letterhead / Doctor Info (0-30)</span>
                    <span className="text-slate-100 font-bold">{result.score_breakdown.letterhead_score} / 30</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0f1117] rounded border border-slate-800">
                    <span className="text-slate-400">Seal & Official Stamp (0-25)</span>
                    <span className="text-slate-100 font-bold">{result.score_breakdown.seal_stamp_score} / 25</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0f1117] rounded border border-slate-800">
                    <span className="text-slate-400">Prescription Layout (0-15)</span>
                    <span className="text-slate-100 font-bold">{result.score_breakdown.layout_score} / 15</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#0f1117] rounded border border-slate-800">
                    <span className="text-slate-400">OCR Assistance (0-10)</span>
                    <span className="text-slate-100 font-bold">{result.score_breakdown.ocr_score} / 10</span>
                  </div>
                </div>
              </div>

              {/* OCR Text Box */}
              {result.ocr_result && (
                <div className="bg-[#16191f] border border-[#232f3e] rounded p-3.5 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-300 font-mono">Extracted Text (OCR)</div>
                  <pre className="text-xs text-slate-300 font-mono bg-black p-2.5 rounded border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {result.ocr_result}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#16191f] border border-[#232f3e] rounded p-6 text-center text-slate-500 text-xs min-h-[460px] flex flex-col items-center justify-center space-y-1 font-mono">
              <FileText className="w-8 h-8 text-slate-600 mb-1" />
              <p>Select or upload a prescription image to run inspection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

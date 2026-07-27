"use client";

import React from "react";
import { FileCode2, Terminal, Copy, Check } from "lucide-react";

export const ApiDocsView: React.FC = () => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const sampleCurl = `curl -X POST "http://localhost:8000/api/v1/prescription/analyze" \\
  -H "accept: application/json" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@prescription_sample.jpg"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">API Documentation & Endpoints</h2>
          <p className="text-slate-400 text-xs">Developer reference specification for external applications and mobile clients.</p>
        </div>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded border border-amber-600 transition font-mono"
        >
          Open Swagger UI ↗
        </a>
      </div>

      <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-4 font-mono">
        <div className="flex items-center space-x-2 border-b border-[#232f3e] pb-3">
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 font-bold text-xs rounded border border-emerald-800">
            POST
          </span>
          <span className="text-sm font-bold text-slate-100">/api/v1/prescription/analyze</span>
        </div>

        <div className="space-y-2">
          <div className="text-slate-300 font-bold text-xs">cURL Example Request</div>
          <div className="relative">
            <pre className="text-xs text-slate-300 bg-black p-3 rounded border border-slate-800 overflow-x-auto font-mono">
              {sampleCurl}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-1.5 bg-[#232f3e] hover:bg-[#2c3b4e] text-slate-200 rounded border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-slate-300 font-bold text-xs">Response JSON Schema</div>
          <pre className="text-[11px] text-emerald-400 bg-black p-3 rounded border border-slate-800 max-h-56 overflow-y-auto">
{`{
  "status": "READY_FOR_REVIEW",
  "clarity_score": 18.0,
  "seal_detection": {
    "found": true,
    "confidence": 0.94,
    "bbox": { "x_min": 480, "y_min": 700, "x_max": 736, "y_max": 920 }
  },
  "letterhead_detection": {
    "found": true,
    "confidence": 0.91,
    "bbox": { "x_min": 40, "y_min": 20, "x_max": 760, "y_max": 220 }
  },
  "ocr_result": "Rx: Amoxicillin 500mg...",
  "ocr_confidence": 0.88,
  "score_breakdown": {
    "clarity_score": 18.0,
    "letterhead_score": 27.3,
    "seal_stamp_score": 22.8,
    "layout_score": 14.1,
    "ocr_score": 8.8,
    "final_score": 91.0
  },
  "final_score": 91.0,
  "message": "Prescription image analyzed successfully."
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

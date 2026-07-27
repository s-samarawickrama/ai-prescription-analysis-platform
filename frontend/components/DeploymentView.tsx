"use client";

import React from "react";
import { Server, Smartphone, Code2, Terminal } from "lucide-react";

export const DeploymentView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      <div className="glass-panel p-5 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">API & Production Deployment Integration</h2>
          <p className="text-xs text-zinc-400">Documentation and integration specs for connecting external apps and mobile clients to the live API.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mobile Integration Spec */}
        <div className="glass-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>Mobile App Integration (iOS / Android / Flutter)</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Mobile clients upload captured prescription photos via standard multipart POST requests.
          </p>
          <pre className="text-xs text-zinc-300 font-mono bg-black/80 p-3 rounded-lg border border-zinc-800 whitespace-pre-wrap leading-relaxed">
{`POST /api/v1/prescription/analyze
Content-Type: multipart/form-data

Body: { file: <prescription_image.jpg> }

Response:
{
  "status": "READY_FOR_REVIEW",
  "clarity_score": 18.0,
  "final_score": 91.0,
  "seal_detection": { "found": true, "confidence": 0.94 }
}`}
          </pre>
        </div>

        {/* Server Endpoints Spec */}
        <div className="glass-panel rounded-xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Server className="w-4 h-4 text-zinc-400" />
            <span>API Server Endpoints</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-black/60 rounded border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">Production Base URL:</span>
              <span className="text-white font-semibold">http://localhost:8000/api/v1</span>
            </div>
            <div className="p-3 bg-black/60 rounded border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">Interactive Swagger Docs:</span>
              <span className="text-emerald-400 font-semibold">http://localhost:8000/docs</span>
            </div>
            <div className="p-3 bg-black/60 rounded border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400">ReDoc Specification:</span>
              <span className="text-zinc-200">http://localhost:8000/redoc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

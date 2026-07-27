"use client";

import React from "react";
import { BarChart3, TrendingUp, ShieldCheck, Target, CheckCircle2 } from "lucide-react";

export const EvaluationView: React.FC = () => {
  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      {/* AWS Console Header Bar */}
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Model Evaluation & Benchmark Matrix</h2>
          <p className="text-slate-400 text-xs">Precision-recall benchmarks, confusion matrices, and mAP performance analysis across detector versions.</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#16191f] border border-[#232f3e] p-3.5 rounded space-y-1">
          <div className="text-[11px] text-slate-400">Seal Detector mAP</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">94.0%</div>
          <div className="text-[10px] text-slate-400">+3.0% vs candidate v2</div>
        </div>
        <div className="bg-[#16191f] border border-[#232f3e] p-3.5 rounded space-y-1">
          <div className="text-[11px] text-slate-400">Letterhead Detector mAP</div>
          <div className="text-xl font-bold text-cyan-400 font-mono">91.2%</div>
          <div className="text-[10px] text-slate-400">+1.2% vs candidate v1</div>
        </div>
        <div className="bg-[#16191f] border border-[#232f3e] p-3.5 rounded space-y-1">
          <div className="text-[11px] text-slate-400">Stamp Detector mAP</div>
          <div className="text-xl font-bold text-amber-400 font-mono">86.5%</div>
          <div className="text-[10px] text-slate-400">Stable candidate</div>
        </div>
        <div className="bg-[#16191f] border border-[#232f3e] p-3.5 rounded space-y-1">
          <div className="text-[11px] text-slate-400">Layout Detector mAP</div>
          <div className="text-xl font-bold text-purple-400 font-mono">92.8%</div>
          <div className="text-[10px] text-slate-400">+2.4% vs baseline</div>
        </div>
      </div>

      {/* Detailed Benchmark Summary Table */}
      <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3 font-mono">
        <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wider">Benchmark Dataset Evaluation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1117] text-slate-400 border-b border-[#232f3e]">
              <tr>
                <th className="p-2.5">Model Name</th>
                <th className="p-2.5">Version</th>
                <th className="p-2.5">Precision</th>
                <th className="p-2.5">Recall</th>
                <th className="p-2.5">mAP@50</th>
                <th className="p-2.5">mAP@50-95</th>
                <th className="p-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232f3e]">
              <tr className="hover:bg-[#0f1117]/60">
                <td className="p-2.5 font-semibold text-slate-200">Seal Detector</td>
                <td className="p-2.5 text-cyan-400 font-bold">v3</td>
                <td className="p-2.5 text-slate-300">0.952</td>
                <td className="p-2.5 text-slate-300">0.938</td>
                <td className="p-2.5 font-bold text-emerald-400">0.940</td>
                <td className="p-2.5 text-slate-400">0.784</td>
                <td className="p-2.5 text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-950/60 border border-amber-800/60 text-amber-300 rounded">
                    CANDIDATE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0f1117]/60 bg-emerald-950/20">
                <td className="p-2.5 font-semibold text-slate-200">Seal Detector</td>
                <td className="p-2.5 text-emerald-400 font-bold">v1 (Active)</td>
                <td className="p-2.5 text-slate-300">0.840</td>
                <td className="p-2.5 text-slate-300">0.810</td>
                <td className="p-2.5 font-bold text-emerald-400">0.820</td>
                <td className="p-2.5 text-slate-400">0.690</td>
                <td className="p-2.5 text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 rounded">
                    ACTIVE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#0f1117]/60">
                <td className="p-2.5 font-semibold text-slate-200">Letterhead Detector</td>
                <td className="p-2.5 text-emerald-400 font-bold">v1 (Active)</td>
                <td className="p-2.5 text-slate-300">0.915</td>
                <td className="p-2.5 text-slate-300">0.902</td>
                <td className="p-2.5 font-bold text-emerald-400">0.912</td>
                <td className="p-2.5 text-slate-400">0.760</td>
                <td className="p-2.5 text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-300 rounded">
                    ACTIVE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { Server, Smartphone, ShieldCheck, CheckCircle2, RefreshCw, ArrowLeftRight } from "lucide-react";
import { api } from "@/lib/api";
import { ModelGroup } from "@/lib/types";

export const DeploymentView: React.FC = () => {
  const [models, setModels] = useState<Record<string, ModelGroup>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activating, setActivating] = useState<string | null>(null);

  const fetchDeploymentData = async () => {
    try {
      const data = await api.listModels();
      setModels(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeploymentData();
  }, []);

  const handleActivate = async (modelName: string, version: string) => {
    setActivating(`${modelName}:${version}`);
    try {
      await api.activateModel(modelName, version);
      await fetchDeploymentData();
    } catch (e) {
      console.error(e);
    } finally {
      setActivating(null);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans text-xs">
      <div className="bg-[#16191f] border border-[#232f3e] p-4 rounded flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Production Deployment & Version Switcher</h2>
          <p className="text-slate-400 text-xs">Manage active production model deployments, switch environment builds, and inspect REST API endpoints.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono">Loading active production deployments...</div>
      ) : (
        <div className="space-y-4">
          {/* Active Production Deployment Table */}
          <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3 font-mono">
            <h3 className="font-semibold text-slate-100 text-xs uppercase tracking-wider">Active Production Model Deployments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f1117] text-slate-400 border-b border-[#232f3e]">
                  <tr>
                    <th className="p-2.5">Model Name</th>
                    <th className="p-2.5">Active Version</th>
                    <th className="p-2.5">Dataset</th>
                    <th className="p-2.5">mAP@50</th>
                    <th className="p-2.5">Available Candidates</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232f3e]">
                  {Object.entries(models).map(([modelKey, group]) => {
                    const activeVerKey = group.active_version;
                    const activeVer = group.versions[activeVerKey] || {};
                    const candidates = Object.keys(group.versions).filter((v) => v !== activeVerKey);

                    return (
                      <tr key={modelKey} className="hover:bg-[#0f1117]/60">
                        <td className="p-2.5 font-semibold text-slate-200">{modelKey}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{activeVerKey}</td>
                        <td className="p-2.5 text-slate-400">{activeVer.dataset || "v1"}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{activeVer.accuracy || "94%"}</td>
                        <td className="p-2.5 text-slate-300">
                          {candidates.length > 0 ? candidates.join(", ") : "None"}
                        </td>
                        <td className="p-2.5 text-right">
                          {candidates.length > 0 ? (
                            <button
                              onClick={() => handleActivate(modelKey, candidates[candidates.length - 1])}
                              disabled={activating === `${modelKey}:${candidates[candidates.length - 1]}`}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold rounded transition"
                            >
                              {activating === `${modelKey}:${candidates[candidates.length - 1]}` ? "Deploying..." : `Promote ${candidates[candidates.length - 1]} ↗`}
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Latest Active</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Integration Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-2">
              <div className="flex items-center space-x-2 text-slate-100 font-bold">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Mobile Client Endpoint</span>
              </div>
              <div className="p-3 bg-[#0f1117] rounded border border-slate-800 text-[11px] text-emerald-400">
                POST http://localhost:8000/api/v1/prescription/analyze
              </div>
            </div>

            <div className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-2">
              <div className="flex items-center space-x-2 text-slate-100 font-bold">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Interactive Swagger UI</span>
              </div>
              <div className="p-3 bg-[#0f1117] rounded border border-slate-800 text-[11px] text-cyan-400">
                http://localhost:8000/docs
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { Boxes, CheckCircle2, Award, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { ModelGroup, ModelVersionInfo } from "@/lib/types";

export const ModelsView: React.FC = () => {
  const [models, setModels] = useState<Record<string, ModelGroup>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activating, setActivating] = useState<string | null>(null);

  const fetchModels = async () => {
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
    fetchModels();
  }, []);

  const handleActivate = async (modelName: string, version: string) => {
    setActivating(`${modelName}:${version}`);
    try {
      await api.activateModel(modelName, version);
      await fetchModels();
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
          <h2 className="text-sm font-semibold text-slate-100">YOLOv11 Model Version Registry</h2>
          <p className="text-slate-400 text-xs">Manage active detector models, compare candidate version accuracies, and deploy to production.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono text-xs">Loading model registry...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(models).map(([modelKey, group]) => (
            <div key={modelKey} className="bg-[#16191f] border border-[#232f3e] rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-xs capitalize">{modelKey.replace("_", " ")}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Active Version: <span className="text-emerald-400 font-semibold">{group.active_version}</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {Object.values(group.versions).map((ver: ModelVersionInfo) => {
                  const isActivatingThis = activating === `${ver.model_name}:${ver.version}`;
                  return (
                    <div
                      key={ver.version}
                      className={`p-2.5 rounded border transition flex items-center justify-between font-mono ${
                        ver.active
                          ? "bg-[#0f1117] border-emerald-500/50"
                          : "bg-[#0f1117]/60 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-slate-100">{ver.version}</span>
                          {ver.active ? (
                            <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-950 text-emerald-300 rounded border border-emerald-800/60 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVE
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 text-[9px] font-medium bg-slate-800 text-slate-400 rounded">
                              CANDIDATE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Dataset: {ver.dataset} | Trained: {ver.trained_date}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-100">{ver.accuracy}</div>
                          <div className="text-[9px] text-slate-500 uppercase">mAP@50</div>
                        </div>

                        {!ver.active && (
                          <button
                            onClick={() => handleActivate(ver.model_name, ver.version)}
                            disabled={isActivatingThis}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs rounded border border-amber-600 transition"
                          >
                            {isActivatingThis ? "Activating..." : "Activate"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

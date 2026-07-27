"use client";

import React from "react";
import { 
  LayoutDashboard, 
  FlaskConical, 
  Boxes, 
  Database, 
  Cpu, 
  GitMerge,
  BarChart3, 
  ShieldCheck, 
  FileCode2,
  ChevronDown
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inference", label: "Inference Playground", icon: FlaskConical },
    { id: "models", label: "Model Registry", icon: Boxes },
    { id: "datasets", label: "Dataset Registry", icon: Database },
    { id: "training", label: "Training Jobs", icon: Cpu },
    { id: "experiments", label: "Experiments", icon: GitMerge },
    { id: "evaluation", label: "Model Evaluation", icon: BarChart3 },
    { id: "deployment", label: "Deployment", icon: ShieldCheck },
    { id: "api-docs", label: "API Reference", icon: FileCode2 },
  ];

  return (
    <aside className="w-60 bg-[#16191f] border-r border-[#232f3e] text-slate-300 flex flex-col justify-between h-screen sticky top-0 select-none shrink-0 font-sans">
      <div>
        {/* Top Header */}
        <div className="p-3.5 border-b border-[#232f3e] bg-[#0f1117] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black flex items-center justify-center font-mono text-[11px]">
              Rx
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-xs tracking-tight leading-none">RxVision Platform</h1>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">MLOps v1.0</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#232f3e] text-white font-semibold border-l-2 border-amber-500 pl-2"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#1f2530]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Engine Status */}
      <div className="p-3 border-t border-[#232f3e] bg-[#0f1117] text-[11px] font-mono text-slate-400 flex justify-between items-center">
        <span>YOLOv11 Pipeline</span>
        <span className="text-emerald-400 font-semibold">HEALTHY</span>
      </div>
    </aside>
  );
};

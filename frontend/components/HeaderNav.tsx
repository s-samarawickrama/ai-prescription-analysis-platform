"use client";

import React from "react";
import { 
  LayoutDashboard, 
  FlaskConical, 
  Layers, 
  FolderArchive, 
  Cpu, 
  BarChart2, 
  Globe,
  Settings,
  ChevronDown
} from "lucide-react";

interface HeaderNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "prescription-testing", label: "API Inspection", icon: FlaskConical },
    { id: "models", label: "Models", icon: Layers },
    { id: "datasets", label: "Datasets", icon: FolderArchive },
    { id: "training", label: "Training", icon: Cpu },
    { id: "evaluation", label: "Evaluation", icon: BarChart2 },
    { id: "deployment", label: "Deployment", icon: Globe },
  ];

  return (
    <header className="bg-black border-b border-zinc-800 text-zinc-100 sticky top-0 z-50 font-sans select-none">
      {/* Top Workspace Bar */}
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center space-x-4">
          {/* Vercel-style SVG Logo */}
          <div className="flex items-center space-x-2">
            <svg width="20" height="20" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="white" />
            </svg>
            <span className="text-zinc-600 text-sm">/</span>
            <div className="flex items-center space-x-1.5 cursor-pointer hover:opacity-80 transition">
              <span className="font-semibold text-sm text-white">rx-prescription-ai</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Production</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition font-mono">
            API Reference ↗
          </a>
          <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold flex items-center justify-center text-xs">
            AD
          </div>
        </div>
      </div>

      {/* Sub Header Horizontal Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-white text-white font-semibold"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

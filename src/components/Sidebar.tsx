import React from "react";
import {
  LayoutDashboard,
  Radio,
  Network,
  Cpu,
  Siren,
  AlertTriangle,
  PlayCircle,
  BarChart3,
  GitCompare,
  History,
  BookOpen,
  Settings,
  Database,
  Layers,
  Sparkles,
  Leaf,
  Zap,
  GraduationCap,
  Camera,
} from "lucide-react";
import { PageId } from "../types";
import { TechnicalTooltip } from "./TechnicalTooltip";

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  dbConnected: boolean;
  activeQubits: number;
  nodeCount: number;
  onRunFullDemo?: () => void;
  onOpenJudgeGuide?: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "yolo-vision", label: "AI Vision (YOLOv8)", icon: Camera, badge: "AUTO AI" },
  { id: "live-traffic", label: "Live Traffic", icon: Radio, badge: "LIVE" },
  { id: "traffic-network", label: "Traffic Network", icon: Network },
  { id: "quantum-optimizer", label: "Quantum Optimizer", icon: Cpu, badge: "QAOA" },
  { id: "emergency-corridor", label: "Emergency Corridor", icon: Siren },
  { id: "events-incidents", label: "Events & Incidents", icon: AlertTriangle },
  { id: "simulation", label: "Simulation", icon: PlayCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "environmental", label: "Environmental Analysis", icon: Leaf, badge: "PHASE 10" },
  { id: "classical-vs-quantum", label: "Classical vs Quantum", icon: GitCompare },
  { id: "optimization-history", label: "Optimization History", icon: History },
  { id: "documentation", label: "Documentation", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  dbConnected,
  activeQubits,
  nodeCount,
  onRunFullDemo,
  onOpenJudgeGuide,
}) => {
  return (
    <aside
      id="command-sidebar"
      className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
              Quantum Traffic
            </h1>
            <p className="text-[11px] text-cyan-400/80 font-mono tracking-wide">
              Smart City Command
            </p>
          </div>
        </div>

        {/* Global Live Status Pill */}
        <div className="mt-3 px-2.5 py-1.5 rounded-md bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300 font-mono">
              SYSTEM ONLINE
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-800/50 font-mono">
            32-QUBIT
          </span>
        </div>

        {/* Demo Mode Quick Trigger Button in Sidebar */}
        {onRunFullDemo && (
          <button
            onClick={onRunFullDemo}
            className="w-full mt-3 p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-emerald-600 to-cyan-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20 cursor-pointer animate-pulse hover:animate-none"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>RUN FULL DEMO</span>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav id="sidebar-navigation" className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    item.badge === "LIVE"
                      ? "bg-red-950/70 text-red-400 border border-red-800/40"
                      : "bg-cyan-950/80 text-cyan-300 border border-cyan-800/40"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Judge Guide Quick Action in Sidebar */}
      {onOpenJudgeGuide && (
        <div className="px-3 py-1.5 border-t border-slate-800/60">
          <button
            onClick={onOpenJudgeGuide}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs flex items-center justify-between border border-slate-700/60 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              Judge Guide & Glossary
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">INFO</span>
          </button>
        </div>
      )}

      {/* System Hardware & DB Health Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            SQLite Engine
          </span>
          <span className={`font-mono text-[10px] ${dbConnected ? "text-emerald-400" : "text-amber-400"}`}>
            {dbConnected ? "Connected" : "Reconnecting"}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            Grid Intersections
          </span>
          <span className="font-mono text-[10px] text-slate-300">{nodeCount} Nodes</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <TechnicalTooltip termKey="Qubit Mapping">
            <span className="flex items-center gap-1.5 cursor-help">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              QPU Simulator
            </span>
          </TechnicalTooltip>
          <span className="font-mono text-[10px] text-cyan-400">{activeQubits} Qubits</span>
        </div>
      </div>
    </aside>
  );
};


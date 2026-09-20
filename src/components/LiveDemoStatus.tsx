import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { TechnicalTooltip } from "./TechnicalTooltip";

export type DemoStageStatus = "pending" | "running" | "completed";

export interface DemoChecklistItem {
  id: string;
  name: string;
  status: DemoStageStatus;
  description: string;
  tooltipKey?: string;
}

interface LiveDemoStatusProps {
  items: DemoChecklistItem[];
  currentStepIndex: number;
  totalSteps: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onSelectStep?: (index: number) => void;
  isCompact?: boolean;
  className?: string;
}

export const LiveDemoStatus: React.FC<LiveDemoStatusProps> = ({
  items,
  currentStepIndex,
  totalSteps,
  isRunning,
  onTogglePlay,
  onReset,
  onSelectStep,
  isCompact = false,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(!isCompact);

  const completedCount = items.filter((item) => item.status === "completed").length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div
      id="live-demo-status-panel"
      className={`bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl shadow-black/40 overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute inset-0 opacity-75"></div>
            <div className="w-3 h-3 rounded-full bg-cyan-500 relative"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                LIVE DEMO STATUS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {completedCount}/{items.length} Ready
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Minimize */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono transition cursor-pointer ${
              isRunning
                ? "bg-amber-950/50 text-amber-300 border-amber-800 hover:bg-amber-900/60"
                : "bg-emerald-950/50 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60"
            }`}
            title={isRunning ? "Pause Demo" : "Resume / Run Demo"}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{isRunning ? "PAUSE" : "PLAY"}</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer"
            title="Reset Demo Sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-950">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Checklist Content */}
      {isExpanded && (
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {items.map((item, idx) => {
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={item.id}
                onClick={() => onSelectStep && onSelectStep(idx)}
                className={`p-2 rounded-xl flex items-center justify-between text-xs transition border cursor-pointer ${
                  isCurrent
                    ? "bg-cyan-950/40 border-cyan-500/70 shadow-sm shadow-cyan-500/20"
                    : item.status === "completed"
                    ? "bg-slate-950/40 border-slate-800/60 hover:border-slate-700"
                    : "bg-slate-950/20 border-slate-800/30 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Status Indicator Icon */}
                  {item.status === "completed" ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : item.status === "running" ? (
                    <div className="w-5 h-5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/80 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-[10px] font-mono">
                      {idx + 1}
                    </div>
                  )}

                  <div>
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      {item.tooltipKey ? (
                        <TechnicalTooltip termKey={item.tooltipKey}>
                          <span>{item.name}</span>
                        </TechnicalTooltip>
                      ) : (
                        <span>{item.name}</span>
                      )}
                      {isCurrent && (
                        <span className="text-[9px] font-mono px-1 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700 uppercase animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[210px] sm:max-w-xs">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-right">
                  {item.status === "completed" ? (
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                  ) : item.status === "running" ? (
                    <span className="text-cyan-400 font-mono text-[10px]">RUNNING</span>
                  ) : (
                    <span className="text-slate-500 font-mono text-[10px]">PENDING</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

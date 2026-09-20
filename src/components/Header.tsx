import React from "react";
import {
  Activity,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Zap,
  Gauge,
  Siren,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { PageId, HealthCheckResponse, LiveMetrics } from "../types";
import { TechnicalTooltip } from "./TechnicalTooltip";

interface HeaderProps {
  currentPage: PageId;
  health: HealthCheckResponse | null;
  liveMetrics: LiveMetrics | null;
  activeEmergencyCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  onRunFullDemo?: () => void;
  onOpenJudgeGuide?: () => void;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Smart City Operations Dashboard",
    subtitle: "Real-time metropolitan traffic surveillance and quantum optimization metrics.",
  },
  "yolo-vision": {
    title: "Automated YOLOv8 Traffic Perception Center",
    subtitle: "Real-time CCTV computer vision, automated vehicle detection, queue estimation & emergency sirens.",
  },
  "live-traffic": {
    title: "Live Traffic GIS Map",
    subtitle: "OpenStreetMap spatial visualization with real-time corridor congestion layers.",
  },
  "traffic-network": {
    title: "Traffic Network Topology",
    subtitle: "Graph-theoretic arterial node representation, throughput, and capacity constraints.",
  },
  "quantum-optimizer": {
    title: "Quantum Traffic Optimizer (QUBO / QAOA)",
    subtitle: "Variational ansatz parameter tuning, Hamiltonian formulation, and circuit execution.",
  },
  "emergency-corridor": {
    title: "Emergency Corridor Preemption",
    subtitle: "Automated green-wave phase lock for first responders and trauma transport.",
  },
  "events-incidents": {
    title: "Events, Hazards & Incident Log",
    subtitle: "Active arterial incidents, road construction, and stadium crowd diversions.",
  },
  simulation: {
    title: "Microscopic Traffic Simulation",
    subtitle: "Dynamic vehicle injection, scenario stress-testing, and throughput playback.",
  },
  analytics: {
    title: "Traffic & Emissions Analytics",
    subtitle: "Comparative diurnal delay curves, fuel conservation, and carbon offset tracking.",
  },
  "classical-vs-quantum": {
    title: "Classical vs Quantum Benchmarks",
    subtitle: "Side-by-side performance evaluation: Dijkstra / Heuristics vs QAOA / VQE.",
  },
  "optimization-history": {
    title: "Optimization Run Ledger",
    subtitle: "Immutable audit history of circuit runs, energy convergence, and speedup factors.",
  },
  documentation: {
    title: "System Architecture & Formulation",
    subtitle: "Technical specifications, mathematical QUBO derivations, and Phase 1-5 roadmap.",
  },
  environmental: {
    title: "Environmental Analysis & Emissions (Phase 10)",
    subtitle: "Configurable Akçelik fuel consumption & CO2 emissions model calibrated from microscopic simulation telemetry.",
  },
  settings: {
    title: "System Settings & Diagnostics",
    subtitle: "Backend QPU provider configuration, SQLite integrity checks, and telemetry polling.",
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  health,
  liveMetrics,
  activeEmergencyCount,
  onRefresh,
  isRefreshing,
  onRunFullDemo,
  onOpenJudgeGuide,
}) => {
  const pageInfo = PAGE_TITLES[currentPage] || {
    title: "Command Center",
    subtitle: "Quantum-Enhanced Adaptive Urban Traffic Optimization",
  };

  const isHealthy = health?.status === "ok" && health?.database?.connected;

  return (
    <header
      id="command-header"
      className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 select-none z-10"
    >
      {/* Title & Context */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {pageInfo.title}
          {activeEmergencyCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded-full animate-pulse font-mono font-medium">
              <Siren className="w-3 h-3" />
              {activeEmergencyCount} EMERGENCY CORRIDOR ACTIVE
            </span>
          )}
        </h2>
        <p className="text-xs text-slate-400">{pageInfo.subtitle}</p>
      </div>

      {/* Real-time Ticker Metrics & Controls */}
      <div className="flex items-center gap-3">
        {/* KPI Ticker Badges with Tooltips */}
        {liveMetrics && (
          <div className="hidden lg:flex items-center gap-2">
            <TechnicalTooltip
              customTerm="Average Network Speed"
              customDefinition="Real-time macroscopic average speed across all 6 metropolitan arterial junctions."
              category="Traffic"
            >
              <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 hover:border-cyan-500/50 transition cursor-help">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Avg Speed:</span>
                <span className="text-slate-200 font-mono font-semibold">
                  {liveMetrics.average_network_speed_kmh} km/h
                </span>
              </div>
            </TechnicalTooltip>

            <TechnicalTooltip
              termKey="Backpressure"
              customTerm="Arterial Density"
              customDefinition="Percentage of road network carrying vehicle capacity. Spikes indicate congestion backpressure."
              category="Traffic"
            >
              <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 hover:border-amber-500/50 transition cursor-help">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Avg Density:</span>
                <span className="text-slate-200 font-mono font-semibold">
                  {liveMetrics.avg_density_percentage}%
                </span>
              </div>
            </TechnicalTooltip>

            <TechnicalTooltip
              termKey="QAOA"
              customTerm="Quantum Readiness"
              customDefinition="State of 32-qubit register, ansatz convergence, and QPU circuit availability."
              category="Quantum"
            >
              <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 hover:border-emerald-500/50 transition cursor-help">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Q-Readiness:</span>
                <span className="text-emerald-300 font-mono font-semibold">
                  {liveMetrics.quantum_readiness_score}%
                </span>
              </div>
            </TechnicalTooltip>
          </div>
        )}

        {/* Judge & Evaluator Guide Button */}
        {onOpenJudgeGuide && (
          <button
            onClick={onOpenJudgeGuide}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition border border-slate-700 text-xs flex items-center gap-1.5 font-medium cursor-pointer shadow-sm"
            title="Open Judge Guide & Glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Judge Guide</span>
          </button>
        )}

        {/* HERO: RUN FULL DEMO ONE-BUTTON TRIGGER */}
        {onRunFullDemo && (
          <button
            id="run-full-demo-header-btn"
            onClick={onRunFullDemo}
            className="px-3 py-1 rounded-md bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer animate-pulse hover:animate-none"
            title="Launch 11-Stage Automated Live Demonstration"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>RUN FULL DEMO</span>
          </button>
        )}

        {/* Backend / Database Connection Status Badge */}
        <div
          id="api-health-status"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono ${
            isHealthy
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
              : "bg-red-950/40 text-red-300 border-red-800/60"
          }`}
          title={
            isHealthy
              ? `Backend: OK | SQLite: Connected (${health?.database?.tables_found ?? 0} tables)`
              : "Backend or Database Disconnected"
          }
        >
          {isHealthy ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>/api/health: {isHealthy ? "200 OK" : "ERROR"}</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          id="refresh-telemetry-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition border border-slate-700 disabled:opacity-50 cursor-pointer"
          title="Refresh Telemetry & Health"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
        </button>
      </div>
    </header>
  );
};


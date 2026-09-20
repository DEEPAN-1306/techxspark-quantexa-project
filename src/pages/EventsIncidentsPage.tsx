import React, { useState, useEffect } from "react";
import { TrafficAPI } from "../services/api";
import { TrafficEvent, DynamicEventType, EventSeverity } from "../types";
import {
  AlertTriangle,
  Construction,
  Ban,
  Siren,
  Clock,
  MapPin,
  CheckCircle,
  RefreshCw,
  Zap,
  Activity,
  ArrowRight,
  History,
  ShieldAlert,
  Car,
  Bot,
  Sliders,
  Sparkles,
  Radio,
  Cpu,
  Eye,
  Check,
  Flame,
  Info
} from "lucide-react";
import { TechnicalTooltip } from "../components/TechnicalTooltip";
import { AlertsTicker } from "../components/AlertsTicker";

interface EventsIncidentsPageProps {
  incidents?: any[];
  onRefresh?: () => void;
  onNavigateToQuantum?: () => void;
}

const AVAILABLE_INTERSECTIONS = [
  { id: "I1", name: "Gandhipuram Cross Cut Junction", lat: 11.0176, lng: 76.9675 },
  { id: "I2", name: "RS Puram DB Road Junction", lat: 11.0118, lng: 76.9495 },
  { id: "I3", name: "Peelamedu Avinashi Road", lat: 11.0285, lng: 77.0028 },
  { id: "I4", name: "Town Hall Ukkadam Junction", lat: 10.9925, lng: 76.9610 },
  { id: "I5", name: "Saibaba Colony MTP Road", lat: 11.0345, lng: 76.9450 },
  { id: "I6", name: "CMCH Hospital Trichy Road", lat: 11.0015, lng: 76.9740 },
];

const AVAILABLE_ROADS = [
  { id: "R1_1_2", name: "Cross Cut - DB Road Link", source: "I1", target: "I2", baseCap: 85 },
  { id: "R1_2_1", name: "DB Road - Cross Cut Arterial", source: "I2", target: "I1", baseCap: 85 },
  { id: "R2_1_4", name: "Big Bazaar Road Arterial", source: "I1", target: "I4", baseCap: 90 },
  { id: "R2_4_1", name: "Dr. Nanjappa Road Northbound", source: "I4", target: "I1", baseCap: 90 },
  { id: "R3_1_5", name: "100 Feet Road Connector", source: "I1", target: "I5", baseCap: 75 },
  { id: "R3_5_1", name: "Mettupalayam Rd to Gandhipuram", source: "I5", target: "I1", baseCap: 75 },
  { id: "R4_2_3", name: "Avinashi Road Express Flyover", source: "I2", target: "I3", baseCap: 85 },
  { id: "R4_3_2", name: "Peelamedu to RS Puram Arterial", source: "I3", target: "I2", baseCap: 85 },
  { id: "R5_3_5", name: "Sathy Road Link (NH 209)", source: "I3", target: "I5", baseCap: 80 },
  { id: "R5_5_3", name: "Ganapathy-Peelamedu Link", source: "I5", target: "I3", baseCap: 80 },
  { id: "R6_4_5", name: "Brookefields-Sukrawarpet Link", source: "I4", target: "I5", baseCap: 75 },
  { id: "R6_5_4", name: "Thadagam Rd to Town Hall", source: "I5", target: "I4", baseCap: 75 },
  { id: "R7_4_6", name: "Trichy Road Medical Corridor", source: "I4", target: "I6", baseCap: 70 },
  { id: "R7_6_4", name: "CMCH Emergency Exit Route", source: "I6", target: "I4", baseCap: 70 },
];

export const EventsIncidentsPage: React.FC<EventsIncidentsPageProps> = ({ onRefresh, onNavigateToQuantum }) => {
  // State for active events and event history
  const [activeEvents, setActiveEvents] = useState<TrafficEvent[]>([]);
  const [eventHistory, setEventHistory] = useState<TrafficEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastActionMessage, setLastActionMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Phase 9b: Autonomous AI Incident Sentinel States
  const [autoDetectEnabled, setAutoDetectEnabled] = useState<boolean>(true);
  const [autoDetectStats, setAutoDetectStats] = useState<{
    total_scans: number;
    incidents_detected: number;
    incidents_auto_cleared: number;
    last_scan_time: string | null;
  }>({
    total_scans: 0,
    incidents_detected: 0,
    incidents_auto_cleared: 0,
    last_scan_time: null,
  });
  const [autoDetectThresholds, setAutoDetectThresholds] = useState<{
    queue_critical: number;
    speed_min_kmh: number;
    congestion_ratio: number;
  }>({
    queue_critical: 48,
    speed_min_kmh: 16.0,
    congestion_ratio: 0.70,
  });
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showThresholdConfig, setShowThresholdConfig] = useState<boolean>(false);
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "AUTO" | "MANUAL">("ALL");
  const [isOptimizingQuantum, setIsOptimizingQuantum] = useState<boolean>(false);

  // Form states for manual disturbance injection
  // Card 1: Congestion
  const [congIntersection, setCongIntersection] = useState<string>("I1");
  const [congQueueSurge, setCongQueueSurge] = useState<number>(35);
  const [congDensityMult, setCongDensityMult] = useState<number>(2.5);
  const [congSubmitting, setCongSubmitting] = useState<boolean>(false);

  // Card 2: Accident
  const [accIntersection, setAccIntersection] = useState<string>("I2");
  const [accRoad, setAccRoad] = useState<string>("R1_2_1");
  const [accSeverity, setAccSeverity] = useState<"MINOR" | "MODERATE" | "SEVERE">("SEVERE");
  const [accSubmitting, setAccSubmitting] = useState<boolean>(false);

  // Card 3: Road Closure
  const [closeRoad, setCloseRoad] = useState<string>("R2_4_1");
  const [closeReason, setCloseReason] = useState<string>("Hazard / Water Main Rupture");
  const [closeSubmitting, setCloseSubmitting] = useState<boolean>(false);

  // Card 4: Emergency
  const [emVehicleId, setEmVehicleId] = useState<string>("EV-001");
  const [emVehicleType, setEmVehicleType] = useState<"Ambulance" | "Fire Truck" | "Police">("Ambulance");
  const [emStart, setEmStart] = useState<string>("Hospital");
  const [emDest, setEmDest] = useState<string>("Emergency Center");
  const [emPriority, setEmPriority] = useState<"CRITICAL" | "HIGH">("CRITICAL");
  const [emSubmitting, setEmSubmitting] = useState<boolean>(false);

  // Resolving IDs tracking
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // History filter
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");

  // Load active events, history, and autodetect status
  const fetchEventsData = async () => {
    try {
      setLoading(true);
      const [active, history, autoStatus] = await Promise.all([
        TrafficAPI.getActiveEvents().catch(() => []),
        TrafficAPI.getEventHistory(50).catch(() => []),
        TrafficAPI.getAutoDetectStatus().catch(() => null),
      ]);
      setActiveEvents(Array.isArray(active) ? active : []);
      setEventHistory(Array.isArray(history) ? history : []);
      if (autoStatus && autoStatus.status === "SUCCESS") {
        setAutoDetectEnabled(autoStatus.enabled);
        if (autoStatus.stats) setAutoDetectStats(autoStatus.stats);
        if (autoStatus.thresholds) setAutoDetectThresholds(autoStatus.thresholds);
      }
    } catch (err: any) {
      console.error("Failed to load events data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsData();
    const interval = setInterval(fetchEventsData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Autonomous Sentinel Actions
  const handleToggleSentinel = async () => {
    try {
      const next = !autoDetectEnabled;
      const res = await TrafficAPI.toggleAutoDetect(next);
      setAutoDetectEnabled(res.enabled);
      setLastActionMessage({
        text: next
          ? "🤖 AI Autonomous Incident Detection Sentinel ACTIVATED. Continuous real-time anomaly scanning active across 6 junctions & 12 corridors."
          : "⏸ AI Incident Sentinel PAUSED. Switched to manual trigger mode.",
        type: next ? "success" : "info",
      });
      await fetchEventsData();
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to toggle Sentinel: ${err.message}`, type: "error" });
    }
  };

  const handleTriggerRadarScan = async () => {
    setIsScanning(true);
    try {
      const res = await TrafficAPI.triggerAutoDetectScan(true);
      const newCount = res.new_events_count || 0;
      const resolvedCount = res.resolved_events_count || 0;
      setLastActionMessage({
        text: `📡 Sensor Radar Scan Complete: ${newCount} new incident${newCount === 1 ? "" : "s"} auto-detected, ${resolvedCount} auto-cleared.`,
        type: newCount > 0 ? "success" : "info",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Radar scan error: ${err.message}`, type: "error" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await TrafficAPI.toggleAutoDetect(autoDetectEnabled, autoDetectThresholds);
      setShowThresholdConfig(false);
      setLastActionMessage({
        text: `⚙ AI Sentinel Detection thresholds updated (Queue ≥ ${autoDetectThresholds.queue_critical} veh, Speed ≤ ${autoDetectThresholds.speed_min_kmh} km/h).`,
        type: "success",
      });
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to update thresholds: ${err.message}`, type: "error" });
    }
  };

  const handleRunQuantumRebalance = async () => {
    setIsOptimizingQuantum(true);
    try {
      const res = await TrafficAPI.runNetworkQAOA({ p_steps: 2, shots: 512 });
      await TrafficAPI.applyOptimizedSignals();
      setLastActionMessage({
        text: `⚛ QAOA Quantum Variational Optimization executed! New green splits applied across network to resolve bottlenecks.`,
        type: "success",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Quantum rebalance failed: ${err.message}`, type: "error" });
    } finally {
      setIsOptimizingQuantum(false);
    }
  };

  // Handlers for manual disturbance events
  const handleTriggerCongestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCongSubmitting(true);
    try {
      const res = await TrafficAPI.triggerEvent({
        event_type: "CONGESTION",
        intersection_id: congIntersection,
        queue_surge: Number(congQueueSurge),
        density_multiplier: Number(congDensityMult),
      });
      setLastActionMessage({
        text: `⚠ Sudden congestion surge injected at ${congIntersection} (+${congQueueSurge} veh). Physical queue adjusted in simulation.`,
        type: "success",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to trigger congestion: ${err.message}`, type: "error" });
    } finally {
      setCongSubmitting(false);
    }
  };

  const handleTriggerAccident = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccSubmitting(true);
    try {
      const res = await TrafficAPI.triggerEvent({
        event_type: "ACCIDENT",
        intersection_id: accIntersection,
        road_id: accRoad,
        severity: accSeverity,
      });
      const capText = accSeverity === "SEVERE" ? "30 veh/min" : accSeverity === "MODERATE" ? "50 veh/min" : "70 veh/min";
      setLastActionMessage({
        text: `🚧 ${accSeverity} Accident registered on ${accRoad}! Road capacity choked to ${capText}.`,
        type: "success",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to trigger accident: ${err.message}`, type: "error" });
    } finally {
      setAccSubmitting(false);
    }
  };

  const handleTriggerRoadClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    setCloseSubmitting(true);
    try {
      const res = await TrafficAPI.triggerEvent({
        event_type: "ROAD_CLOSURE",
        road_id: closeRoad,
        reason: closeReason,
      });
      const detourNames = res?.detour?.alternate_route_names?.join(" → ") || "Computed Detour";
      setLastActionMessage({
        text: `⛔ Road ${closeRoad} closed (0 veh/min). NetworkX routing edge removed. Detour: ${detourNames}.`,
        type: "success",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to close road: ${err.message}`, type: "error" });
    } finally {
      setCloseSubmitting(false);
    }
  };

  const handleTriggerEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmSubmitting(true);
    try {
      const res = await TrafficAPI.triggerEvent({
        event_type: "EMERGENCY",
        vehicle_id: emVehicleId,
        vehicle_type: emVehicleType,
        start: emStart,
        destination: emDest,
        priority: emPriority,
      });
      setLastActionMessage({
        text: `🚑 ${emPriority} ${emVehicleType} (${emVehicleId}) dispatched! Green Wave priority preemption activated.`,
        type: "success",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to launch emergency vehicle: ${err.message}`, type: "error" });
    } finally {
      setEmSubmitting(false);
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    setResolvingId(eventId);
    try {
      const res = await TrafficAPI.resolveEvent(eventId);
      setLastActionMessage({
        text: `✓ Incident ${eventId} resolved: ${res.resolution_summary || "Simulation restored to nominal physics."}`,
        type: "info",
      });
      await fetchEventsData();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setLastActionMessage({ text: `Failed to resolve incident: ${err.message}`, type: "error" });
    } finally {
      setResolvingId(null);
    }
  };

  // Filtered active events
  const filteredActiveEvents = activeEvents.filter((evt) => {
    if (activeTabFilter === "ALL") return true;
    if (activeTabFilter === "AUTO") return evt.is_auto_detected === true;
    if (activeTabFilter === "MANUAL") return evt.is_auto_detected !== true;
    return true;
  });

  const autoDetectedActiveCount = activeEvents.filter((e) => e.is_auto_detected).length;
  const manualActiveCount = activeEvents.filter((e) => !e.is_auto_detected).length;

  // Filtered history
  const filteredHistory = eventHistory.filter((evt) => {
    if (historyFilter === "ALL") return true;
    if (historyFilter === "AUTO") return evt.is_auto_detected === true;
    if (historyFilter === "MANUAL") return evt.is_auto_detected !== true;
    if (historyFilter === "ACTIVE") return evt.status === "ACTIVE";
    if (historyFilter === "RESOLVED") return evt.status === "RESOLVED";
    return evt.event_type === historyFilter;
  });

  const getEventBadge = (type: DynamicEventType) => {
    switch (type) {
      case "CONGESTION":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: "⚠ Congestion",
          bg: "bg-amber-950/60 border-amber-800 text-amber-300",
        };
      case "ACCIDENT":
        return {
          icon: <Construction className="w-4 h-4 text-orange-400" />,
          label: "🚧 Accident",
          bg: "bg-orange-950/60 border-orange-800 text-orange-300",
        };
      case "ROAD_CLOSURE":
        return {
          icon: <Ban className="w-4 h-4 text-red-400" />,
          label: "⛔ Road Closure",
          bg: "bg-red-950/60 border-red-800 text-red-300",
        };
      case "EMERGENCY":
        return {
          icon: <Siren className="w-4 h-4 text-cyan-400" />,
          label: "🚑 Emergency",
          bg: "bg-cyan-950/60 border-cyan-800 text-cyan-300",
        };
    }
  };

  const getSeverityBadge = (sev: EventSeverity) => {
    const s = String(sev).toUpperCase();
    if (s === "CRITICAL" || s === "SEVERE") {
      return "bg-red-950 text-red-300 border-red-800";
    }
    if (s === "HIGH" || s === "MODERATE") {
      return "bg-orange-950 text-orange-300 border-orange-800";
    }
    return "bg-amber-950 text-amber-300 border-amber-800";
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto overflow-y-auto pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 rounded-lg text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Phase 9: Dynamic Event &amp; Incident Management
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80">
                  AUTONOMOUS AI SENTINEL
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous real-time AI anomaly detection &amp; manual disruption simulations with physical capacity adjustments and quantum rebalancing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${autoDetectEnabled ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`}></span>
            <span className="text-slate-400">AI Sentinel:</span>
            <span className="font-mono font-bold text-white">{autoDetectEnabled ? "ACTIVE" : "PAUSED"}</span>
          </div>
          <button
            onClick={fetchEventsData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification / Status Message */}
      {lastActionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all duration-300 ${
            lastActionMessage.type === "success"
              ? "bg-emerald-950/70 border-emerald-800 text-emerald-200"
              : lastActionMessage.type === "error"
              ? "bg-red-950/70 border-red-800 text-red-200"
              : "bg-cyan-950/70 border-cyan-800 text-cyan-200"
          }`}
        >
          <div className="flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 shrink-0" />
            <span>{lastActionMessage.text}</span>
          </div>
          <button
            onClick={() => setLastActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-mono ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* HERO SECTION: Autonomous AI Incident Detection Sentinel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 border border-cyan-900/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow radar accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cyan-900/30">
          <div className="flex items-start gap-4">
            <div className="relative p-3.5 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl shadow-inner text-cyan-400">
              <Bot className="w-7 h-7" />
              {autoDetectEnabled && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Autonomous AI Incident Detection Sentinel
                </h2>
                <TechnicalTooltip termKey="QAOA">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/80 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> 2s TELEMETRY SCAN
                  </span>
                </TechnicalTooltip>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Continuously monitors all 6 urban intersections and 12 road segments. Automatically detects abnormal queue accumulation, arterial bottlenecks, and speed drops in real time without requiring manual intervention.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerRadarScan}
              disabled={isScanning}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg flex items-center gap-2"
            >
              <Radio className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-slate-950" : "text-slate-950"}`} />
              <span>{isScanning ? "Scanning Radar..." : "Run Radar Scan Now"}</span>
            </button>

            <button
              onClick={handleToggleSentinel}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                autoDetectEnabled
                  ? "bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-amber-700/60"
                  : "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-700/60"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{autoDetectEnabled ? "Pause Sentinel" : "Activate Sentinel"}</span>
            </button>

            <button
              onClick={() => setShowThresholdConfig(!showThresholdConfig)}
              className="px-3 py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Thresholds</span>
            </button>
          </div>
        </div>

        {/* 4 Real-Time Telemetry Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Coimbatore Junctions
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">6 Nodes</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Gandhipuram, RS Puram, Peelamedu...</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-400" /> Monitored Corridors
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">14 Arterials</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Avinashi, DB Rd, Trichy Rd</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-900/50 shadow-sm">
            <div className="flex items-center justify-between text-cyan-400 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Auto-Detected
              </span>
              <span className="font-mono text-[10px] text-cyan-300">Total</span>
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {autoDetectStats.incidents_detected}
            </div>
            <div className="text-[10px] text-cyan-400/70 font-mono mt-0.5">
              {autoDetectedActiveCount} Currently Active
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-900/50 shadow-sm">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Auto-Cleared
              </span>
              <span className="font-mono text-[10px] text-emerald-300">Resolved</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
              {autoDetectStats.incidents_auto_cleared}
            </div>
            <div className="text-[10px] text-emerald-400/70 font-mono mt-0.5">
              Auto-Restored Normal Flow
            </div>
          </div>
        </div>

        {/* Collapsible Threshold Configuration */}
        {showThresholdConfig && (
          <form onSubmit={handleSaveThresholds} className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center justify-between">
                <span>Queue Critical Trigger:</span>
                <span className="font-mono text-cyan-400 font-bold">≥ {autoDetectThresholds.queue_critical} veh</span>
              </label>
              <input
                type="range"
                min="30"
                max="70"
                step="2"
                value={autoDetectThresholds.queue_critical}
                onChange={(e) => setAutoDetectThresholds({ ...autoDetectThresholds, queue_critical: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Auto-flags congestion when junction queue exceeds limit.</span>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center justify-between">
                <span>Speed Choke Floor:</span>
                <span className="font-mono text-amber-400 font-bold">≤ {autoDetectThresholds.speed_min_kmh} km/h</span>
              </label>
              <input
                type="range"
                min="10"
                max="25"
                step="1"
                value={autoDetectThresholds.speed_min_kmh}
                onChange={(e) => setAutoDetectThresholds({ ...autoDetectThresholds, speed_min_kmh: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Detects traffic breakdown / lane stall anomalies.</span>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Thresholds
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 2: Active Incidents / In-Flight Disturbances */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Active Incidents ({activeEvents.length})</span>
              <span className="text-[10px] text-cyan-400 font-normal">
                {autoDetectedActiveCount} Auto-Detected | {manualActiveCount} Manual Injections
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTabFilter("ALL")}
                className={`px-3 py-1 rounded text-xs font-mono transition ${
                  activeTabFilter === "ALL" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({activeEvents.length})
              </button>
              <button
                onClick={() => setActiveTabFilter("AUTO")}
                className={`px-3 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 ${
                  activeTabFilter === "AUTO" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bot className="w-3 h-3 text-cyan-400" />
                <span>Auto-Detected ({autoDetectedActiveCount})</span>
              </button>
              <button
                onClick={() => setActiveTabFilter("MANUAL")}
                className={`px-3 py-1 rounded text-xs font-mono transition ${
                  activeTabFilter === "MANUAL" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Manual ({manualActiveCount})
              </button>
            </div>

            {activeEvents.length > 0 && (
              <button
                onClick={handleRunQuantumRebalance}
                disabled={isOptimizingQuantum}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow"
              >
                <Zap className={`w-3.5 h-3.5 ${isOptimizingQuantum ? "animate-spin" : "text-amber-300"}`} />
                <span>{isOptimizingQuantum ? "Rebalancing..." : "Quantum QAOA Rebalance"}</span>
              </button>
            )}
          </div>
        </div>

        {filteredActiveEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-200">No Active Disruptive Incidents</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              The urban traffic network is currently running nominal physics. The Autonomous AI Sentinel will automatically detect any surge when traffic exceeds threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActiveEvents.map((evt) => {
              const badge = getEventBadge(evt.event_type);
              const isResolving = resolvingId === evt.id;
              const isAuto = evt.is_auto_detected === true;

              return (
                <div
                  key={evt.id}
                  className={`bg-slate-900 border rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl relative overflow-hidden transition ${
                    isAuto ? "border-cyan-800/80 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20" : "border-slate-800"
                  }`}
                >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 ${isAuto ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" : "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"}`} />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {isAuto ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-600/80 text-cyan-300 font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Bot className="w-3 h-3 text-cyan-400" /> AI AUTO-DETECTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono text-[10px]">
                            MANUAL INJECTION
                          </span>
                        )}
                        <span className="font-mono text-xs text-slate-400">{evt.id}</span>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${getSeverityBadge(evt.severity)}`}>
                        {evt.severity}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {badge.icon}
                      <span>{evt.title}</span>
                    </h4>

                    <div className="mt-2 space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Location: <strong className="text-slate-200">{evt.location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Detected: {new Date(evt.start_time).toLocaleTimeString()}</span>
                      </div>
                      <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 mt-2 leading-relaxed">
                        {evt.impact_summary}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>ACTIVE IN PHYSICS ENGINE</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRunQuantumRebalance}
                        disabled={isOptimizingQuantum}
                        className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                        title="Run QAOA Variational Circuit to mitigate this queue"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Quantum Rebalance</span>
                      </button>

                      <button
                        onClick={() => handleResolveEvent(evt.id)}
                        disabled={isResolving}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow"
                      >
                        {isResolving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>RESOLVE</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: Trigger Manual Disturbance Simulation Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Manual Disturbance Test Injections</span>
            <span className="text-[10px] text-slate-500 font-normal">
              (Simulates stress scenarios to test AI auto-detection &amp; quantum resilience)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* CARD 1: ⚠ Congestion */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-900/50 hover:border-amber-700/60 rounded-xl p-4 flex flex-col justify-between shadow-lg transition duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-amber-200 text-sm">⚠ Congestion</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  SURGE
                </span>
              </div>

              <form id="form-congestion" onSubmit={handleTriggerCongestion} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Intersection:</label>
                  <select
                    value={congIntersection}
                    onChange={(e) => setCongIntersection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {AVAILABLE_INTERSECTIONS.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.id} - {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Queue Surge:</span>
                    <span className="font-mono text-amber-400 font-bold">+{congQueueSurge} veh</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="5"
                    value={congQueueSurge}
                    onChange={(e) => setCongQueueSurge(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Density Multiplier:</span>
                    <span className="font-mono text-amber-400 font-bold">{congDensityMult}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="3.5"
                    step="0.5"
                    value={congDensityMult}
                    onChange={(e) => setCongDensityMult(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300/80 leading-relaxed">
                  Surges queues &amp; immediately tests AI sentinel anomaly response.
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="form-congestion"
              disabled={congSubmitting}
              className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-lg text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
            >
              {congSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
              <span>INJECT CONGESTION</span>
            </button>
          </div>

          {/* CARD 2: 🚧 Accident */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-orange-900/50 hover:border-orange-700/60 rounded-xl p-4 flex flex-col justify-between shadow-lg transition duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-orange-900/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Construction className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-orange-200 text-sm">🚧 Accident</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
                  CHOKE
                </span>
              </div>

              <form id="form-accident" onSubmit={handleTriggerAccident} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Road Corridor:</label>
                  <select
                    value={accRoad}
                    onChange={(e) => {
                      setAccRoad(e.target.value);
                      const sel = AVAILABLE_ROADS.find((r) => r.id === e.target.value);
                      if (sel) setAccIntersection(sel.source);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-orange-500 focus:outline-none font-mono text-[11px]"
                  >
                    {AVAILABLE_ROADS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.source}→{r.target})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Incident Severity:</label>
                  <select
                    value={accSeverity}
                    onChange={(e) => setAccSeverity(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="MINOR">MINOR (Cap → 70 veh/min)</option>
                    <option value="MODERATE">MODERATE (Cap → 50 veh/min)</option>
                    <option value="SEVERE">SEVERE (Cap → 30 veh/min)</option>
                  </select>
                </div>

                <div className="p-2 rounded bg-orange-950/30 border border-orange-900/50 text-[11px] text-orange-300/80 leading-relaxed">
                  Reduces capacity from nominal 85 to {accSeverity === "SEVERE" ? "30" : accSeverity === "MODERATE" ? "50" : "70"} veh/min.
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="form-accident"
              disabled={accSubmitting}
              className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-slate-950 font-bold rounded-lg text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
            >
              {accSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Car className="w-3.5 h-3.5" />}
              <span>DISPATCH ACCIDENT</span>
            </button>
          </div>

          {/* CARD 3: ⛔ Road Closure */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-red-900/50 hover:border-red-700/60 rounded-xl p-4 flex flex-col justify-between shadow-lg transition duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-red-900/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                    <Ban className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-red-200 text-sm">⛔ Road Closure</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  GRAPH SEVER
                </span>
              </div>

              <form id="form-closure" onSubmit={handleTriggerRoadClosure} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Road to Sever/Close:</label>
                  <select
                    value={closeRoad}
                    onChange={(e) => setCloseRoad(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-red-500 focus:outline-none font-mono text-[11px]"
                  >
                    {AVAILABLE_ROADS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id}: {r.name} ({r.source}→{r.target})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Closure Cause:</label>
                  <input
                    type="text"
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                    placeholder="e.g. Water Main Rupture"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="p-2 rounded bg-red-950/30 border border-red-900/50 text-[11px] text-red-300/80 leading-relaxed">
                  Disables road (0 veh/min), strips edge from NetworkX graph, and recalculates dynamic detour routes.
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="form-closure"
              disabled={closeSubmitting}
              className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
            >
              {closeSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              <span>ENFORCE CLOSURE</span>
            </button>
          </div>

          {/* CARD 4: 🚑 Emergency */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-900/50 hover:border-cyan-700/60 rounded-xl p-4 flex flex-col justify-between shadow-lg transition duration-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Siren className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-cyan-200 text-sm">🚑 Emergency</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  GREEN WAVE
                </span>
              </div>

              <form id="form-emergency" onSubmit={handleTriggerEmergency} className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Vehicle ID:</label>
                    <input
                      type="text"
                      value={emVehicleId}
                      onChange={(e) => setEmVehicleId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Type:</label>
                    <select
                      value={emVehicleType}
                      onChange={(e) => setEmVehicleType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-[11px]"
                    >
                      <option value="Ambulance">Ambulance</option>
                      <option value="Fire Truck">Fire Truck</option>
                      <option value="Police">Police</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Start Hub:</label>
                    <input
                      type="text"
                      value={emStart}
                      onChange={(e) => setEmStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Destination:</label>
                    <input
                      type="text"
                      value={emDest}
                      onChange={(e) => setEmDest(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-[11px]"
                    />
                  </div>
                </div>

                <div className="p-2 rounded bg-cyan-950/30 border border-cyan-900/50 text-[11px] text-cyan-300/80 leading-relaxed">
                  Computes shortest route with Dijkstra, locks corridor signals to continuous GREEN wave.
                </div>
              </form>
            </div>

            <button
              type="submit"
              form="form-emergency"
              disabled={emSubmitting}
              className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-slate-950 font-bold rounded-lg text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
            >
              {emSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Siren className="w-3.5 h-3.5" />}
              <span>DISPATCH CORRIDOR</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Persistent SQLite Event History */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>SQLite Event History ({eventHistory.length} Logged)</span>
          </h2>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {["ALL", "AUTO", "MANUAL", "CONGESTION", "ACCIDENT", "ROAD_CLOSURE", "EMERGENCY", "ACTIVE", "RESOLVED"].map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                  historyFilter === f
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Title &amp; Location</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Impact &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500 font-sans text-xs">
                      No matching events found in database history.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((evt) => {
                    const badge = getEventBadge(evt.event_type);
                    const isResolved = evt.status === "RESOLVED";
                    const isAuto = evt.is_auto_detected === true;

                    return (
                      <tr key={evt.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-cyan-400 font-bold">{evt.id}</td>
                        <td className="py-3 px-4">
                          {isAuto ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold flex items-center gap-1 w-fit">
                              <Bot className="w-3 h-3 text-cyan-400" /> AI AUTO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-400 border border-slate-800 w-fit block">
                              MANUAL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-200">
                          <div className="font-semibold">{evt.title}</div>
                          <div className="text-[11px] text-slate-400">{evt.location}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getSeverityBadge(evt.severity)}`}>
                            {evt.severity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(evt.start_time).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {evt.end_time ? new Date(evt.end_time).toLocaleTimeString() : "—"}
                        </td>
                        <td className="py-3 px-4">
                          {isResolved ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                              RESOLVED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate" title={evt.impact_summary}>
                          {evt.impact_summary || "Operational disturbance recorded."}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

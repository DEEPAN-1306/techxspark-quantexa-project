import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Siren,
  Zap,
  Eye,
  Activity,
  ArrowUpRight,
  X,
  Bell,
  ChevronRight,
  ShieldAlert,
  Flame,
} from "lucide-react";
import { PageId } from "../types";

export interface LiveAlertItem {
  id: string;
  title: string;
  category: "CONGESTION" | "QUANTUM" | "EMERGENCY" | "YOLO_VISION" | "INCIDENT" | "ENVIRONMENT";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  location: string;
  time: string;
  details: string;
  targetPage?: PageId;
}

const COIMBATORE_ALERT_TEMPLATES: Omit<LiveAlertItem, "id" | "time">[] = [
  {
    title: "Heavy Queue Surge at Gandhipuram Cross Cut",
    category: "CONGESTION",
    severity: "HIGH",
    location: "Gandhipuram (I1)",
    details: "Queue reached 54 vehicles. Adaptive Green time extended to 45s.",
    targetPage: "live-traffic",
  },
  {
    title: "YOLOv8 Automated CCTV Detection: High Bus Volume",
    category: "YOLO_VISION",
    severity: "MEDIUM",
    location: "Town Hall Ukkadam Junction (I4)",
    details: "CAM-I4 detected 8 TNSTC buses & 42 mixed vehicles within ROI boundary.",
    targetPage: "yolo-vision",
  },
  {
    title: "Emergency Corridor Preemption Requested",
    category: "EMERGENCY",
    severity: "CRITICAL",
    location: "Trichy Road → CMCH Hospital (I6 → I4)",
    details: "Ambulance AMB-911 broadcasting Code-3 beacon. Green-wave lock armed.",
    targetPage: "emergency-corridor",
  },
  {
    title: "Quantum QAOA Phase Recalibration Complete",
    category: "QUANTUM",
    severity: "INFO",
    location: "Network-Wide (6 QPU Nodes)",
    details: "Objective value: -42.85. Network delay reduced by 34.2% across arterial corridors.",
    targetPage: "quantum-optimizer",
  },
  {
    title: "Avinashi Road Express Flyover Flow Velocity Shift",
    category: "INCIDENT",
    severity: "MEDIUM",
    location: "Peelamedu Avinashi Road (I3)",
    details: "Traffic speed normalized to 48.0 km/h following signal phase synchronization.",
    targetPage: "live-traffic",
  },
  {
    title: "Autonomous Hazard Sentinel Scan Clean",
    category: "INCIDENT",
    severity: "INFO",
    location: "Saibaba Colony MTP Road (I5)",
    details: "Zero micro-stalls or stalled vehicles detected by Sentinel scanner.",
    targetPage: "events-incidents",
  },
  {
    title: "Carbon Offset Metric Milestone Reached",
    category: "ENVIRONMENT",
    severity: "INFO",
    location: "RS Puram DB Road (I2)",
    details: "Quantum adaptive timing saved 28.4 kg of idling CO2 emissions this hour.",
    targetPage: "environmental",
  },
  {
    title: "AI Vision Auto-Cleared Micro Congestion",
    category: "YOLO_VISION",
    severity: "INFO",
    location: "Cross Cut Road (I1 → I2)",
    details: "Queue cleared below 15 vehicles; normal cycle timing restored.",
    targetPage: "yolo-vision",
  },
];

interface AlertsTickerProps {
  onNavigate?: (page: PageId) => void;
  className?: string;
}

export const AlertsTicker: React.FC<AlertsTickerProps> = ({ onNavigate, className = "" }) => {
  const [alerts, setAlerts] = useState<LiveAlertItem[]>([
    {
      id: "ALT-101",
      title: "Active Emergency Corridor: CMCH Trauma Unit Dispatched",
      category: "EMERGENCY",
      severity: "CRITICAL",
      location: "Trichy Road Medical Corridor (I6)",
      time: "Just now",
      details: "Code 3 Preemption active on Trichy Road → Ukkadam. Green wave holding.",
      targetPage: "emergency-corridor",
    },
    {
      id: "ALT-102",
      title: "YOLOv8 Automated Traffic Detection Stream Synchronized",
      category: "YOLO_VISION",
      severity: "HIGH",
      location: "Gandhipuram Cross Cut (CAM-I1)",
      time: "15s ago",
      details: "Real-time AI bounding boxes active. 38 vehicles tracked with 94.2% mAP confidence.",
      targetPage: "yolo-vision",
    },
    {
      id: "ALT-103",
      title: "QAOA Quantum Energy Minimum Phase Locked",
      category: "QUANTUM",
      severity: "INFO",
      location: "Coimbatore 6-Node Urban Network",
      time: "35s ago",
      details: "Global delay minimized. 32-qubit statevector converged in 34ms.",
      targetPage: "quantum-optimizer",
    },
  ]);

  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);

  // Dynamic Increasing Alerts Generator: Adds new realistic alerts every 8-12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const template = COIMBATORE_ALERT_TEMPLATES[Math.floor(Math.random() * COIMBATORE_ALERT_TEMPLATES.length)];
      const newAlert: LiveAlertItem = {
        ...template,
        id: `ALT-${Date.now().toString().slice(-4)}`,
        time: "Just now",
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 19)]);
    }, 9000);

    return () => clearInterval(timer);
  }, []);

  // Carousel cycle for ticker header
  useEffect(() => {
    if (alerts.length === 0) return;
    const interval = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % alerts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [alerts.length]);

  const currentAlert = alerts[activeAlertIndex] || alerts[0];

  const getSeverityStyle = (severity: LiveAlertItem["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return {
          badgeBg: "bg-rose-950/80 border-rose-700 text-rose-300",
          dot: "bg-rose-500",
          icon: Siren,
        };
      case "HIGH":
        return {
          badgeBg: "bg-amber-950/80 border-amber-700 text-amber-300",
          dot: "bg-amber-400",
          icon: AlertTriangle,
        };
      case "MEDIUM":
        return {
          badgeBg: "bg-cyan-950/80 border-cyan-700 text-cyan-300",
          dot: "bg-cyan-400",
          icon: Zap,
        };
      default:
        return {
          badgeBg: "bg-emerald-950/80 border-emerald-700 text-emerald-300",
          dot: "bg-emerald-400",
          icon: Activity,
        };
    }
  };

  const currentStyle = currentAlert ? getSeverityStyle(currentAlert.severity) : getSeverityStyle("INFO");
  const CurrentIcon = currentStyle.icon;

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-lg overflow-hidden ${className}`}>
      {/* Ticker Bar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-300">
              ALERTS ({alerts.length})
            </span>
          </div>

          {currentAlert && (
            <div className="flex items-center gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${currentStyle.badgeBg} shrink-0`}>
                {currentAlert.category}
              </span>
              <span className="font-medium text-slate-200 truncate">
                {currentAlert.title}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline shrink-0">
                &bull; {currentAlert.location}
              </span>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                ({currentAlert.time})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentAlert?.targetPage && onNavigate && (
            <button
              onClick={() => onNavigate(currentAlert.targetPage!)}
              className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/70 text-cyan-300 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
            >
              Inspect <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition cursor-pointer"
          >
            {expanded ? "Hide Log" : "View All"}
          </button>
        </div>
      </div>

      {/* Expanded Live Alerts Drawer */}
      {expanded && (
        <div className="border-t border-slate-800 bg-slate-950/90 p-3 max-h-60 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <span>REAL-TIME COIMBATORE INCIDENT & SYSTEM LOG</span>
            <span>AUTO-UPDATING STREAM</span>
          </div>
          {alerts.map((alt) => {
            const style = getSeverityStyle(alt.severity);
            const Icon = style.icon;
            return (
              <div
                key={alt.id}
                className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 transition"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-md ${style.badgeBg} shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-100">{alt.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-medium">@{alt.location}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{alt.details}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">{alt.time}</span>
                  {alt.targetPage && onNavigate && (
                    <button
                      onClick={() => {
                        onNavigate(alt.targetPage!);
                        setExpanded(false);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                    >
                      View <ChevronRight className="w-2.5 h-2.5" />
                    </button>
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

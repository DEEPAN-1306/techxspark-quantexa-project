import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import {
  Siren,
  Shield,
  CheckCircle2,
  AlertOctagon,
  Zap,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Clock,
  Gauge,
  MapPin,
  Flame,
  ShieldAlert,
  Car,
  Radio,
  Wifi,
  Sparkles,
  Crosshair,
  Activity,
  Scan,
  Check,
} from "lucide-react";
import { ApiService } from "../services/api";
import { AlertsTicker } from "../components/AlertsTicker";
import {
  EmergencyRoutePlan,
  EmergencyStatusResponse,
  EmergencyVehicleType,
  EmergencyPriority,
  EmergencyCorridor,
} from "../types";

export interface DetectedVehicle {
  id: string;
  type: EmergencyVehicleType;
  name: string;
  department: string;
  startLocation: string;
  startNode: string;
  destination: string;
  destNode: string;
  priority: EmergencyPriority;
  status: "DISPATCHED" | "RESPONDING" | "EN_ROUTE" | "STANDBY";
  speedKmh: number;
  transponderId: string;
  transponderProtocol: string;
  signalStrengthDbm: number;
  sirenActive: boolean;
  gpsCoordinates: { lat: number; lng: number };
  calloutReason: string;
}

export const DETECTED_FLEET_VEHICLES: DetectedVehicle[] = [
  {
    id: "AMB-911",
    type: "Ambulance",
    name: "CMCH Trauma Life Support Alpha-911",
    department: "Coimbatore Medical College Hospital EMS",
    startLocation: "CMCH Hospital",
    startNode: "I6",
    destination: "RS Puram DB Road",
    destNode: "I2",
    priority: "CRITICAL",
    status: "DISPATCHED",
    speedKmh: 68.5,
    transponderId: "V2X-DSRC-911-CBE",
    transponderProtocol: "SAE J2735 / 5.9 GHz DSRC",
    signalStrengthDbm: -42,
    sirenActive: true,
    gpsCoordinates: { lat: 11.0015, lng: 76.9740 },
    calloutReason: "Code 3 Critical Cardiac Preemption to RS Puram Specialty Clinic",
  },
  {
    id: "FIRE-104",
    type: "Fire Truck",
    name: "Heavy Rescue Engine 104",
    department: "Coimbatore Fire & Rescue Station (South)",
    startLocation: "RS Puram DB Road",
    startNode: "I2",
    destination: "Gandhipuram Cross Cut",
    destNode: "I1",
    priority: "CRITICAL",
    status: "RESPONDING",
    speedKmh: 52.0,
    transponderId: "V2X-OPTI-104-TN",
    transponderProtocol: "Opticom Infrared / GPS Strobe",
    signalStrengthDbm: -48,
    sirenActive: true,
    gpsCoordinates: { lat: 11.0118, lng: 76.9495 },
    calloutReason: "Multi-Alarm Commercial Complex Fire Emergency",
  },
  {
    id: "POLICE-202",
    type: "Police",
    name: "Tactical Interceptor Cruiser 202",
    department: "Coimbatore City Traffic Police Division",
    startLocation: "Town Hall Ukkadam",
    startNode: "I4",
    destination: "Peelamedu Avinashi Road",
    destNode: "I3",
    priority: "HIGH",
    status: "EN_ROUTE",
    speedKmh: 74.0,
    transponderId: "V2X-CV2X-202-CBE",
    transponderProtocol: "3GPP Release 16 C-V2X (5G NR)",
    signalStrengthDbm: -39,
    sirenActive: true,
    gpsCoordinates: { lat: 10.9925, lng: 76.9610 },
    calloutReason: "VIP & Critical Medical Corridor Escort",
  },
  {
    id: "MEDIC-07",
    type: "Ambulance",
    name: "KMCH Critical Care Medic-07",
    department: "Kovai Medical Center Emergency Response",
    startLocation: "Saibaba Colony MTP Road",
    startNode: "I5",
    destination: "CMCH Hospital",
    destNode: "I6",
    priority: "CRITICAL",
    status: "DISPATCHED",
    speedKmh: 62.0,
    transponderId: "V2X-DSRC-007-CBE",
    transponderProtocol: "SAE J2735 / 5.9 GHz DSRC",
    signalStrengthDbm: -45,
    sirenActive: true,
    gpsCoordinates: { lat: 11.0345, lng: 76.9450 },
    calloutReason: "Emergency Organ Transplant Green Wave Transit",
  },
];

interface EmergencyCorridorPageProps {
  corridors?: EmergencyCorridor[];
  onRefresh?: () => void;
}

const INTERSECTION_OPTIONS = [
  { id: "CMCH Hospital", label: "CMCH Hospital (I6 - Trichy Road Trauma Center)", code: "I6" },
  { id: "RS Puram DB Road", label: "RS Puram (I2 - DB Road Commercial Junction)", code: "I2" },
  { id: "Gandhipuram Cross Cut", label: "Gandhipuram (I1 - Cross Cut Central Bus Terminal)", code: "I1" },
  { id: "Town Hall Ukkadam", label: "Town Hall / Ukkadam (I4 - South Expressway Hub)", code: "I4" },
  { id: "Saibaba Colony MTP Road", label: "Saibaba Colony (I5 - MTP Road West Feeder)", code: "I5" },
  { id: "Peelamedu Avinashi Road", label: "Peelamedu (I3 - Avinashi Road Airport Corridor)", code: "I3" },
];

export const EmergencyCorridorPage: React.FC<EmergencyCorridorPageProps> = ({
  onRefresh,
}) => {
  // Auto-detection states
  const [selectedVehicleObj, setSelectedVehicleObj] = useState<DetectedVehicle>(DETECTED_FLEET_VEHICLES[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [detectionNotice, setDetectionNotice] = useState<{
    title: string;
    detail: string;
    time: string;
  }>({
    title: "V2X Telemetry Auto-Detected: AMB-911 (Trauma Life Support)",
    detail: "Beacon broadcast from Node I6 (Hospital Junction) → Target: Node I2 (Emergency Center). Priority: CRITICAL. Signal: -42 dBm (100% V2X Sync).",
    time: new Date().toLocaleTimeString(),
  });

  // Form state
  const [vehicleId, setVehicleId] = useState(DETECTED_FLEET_VEHICLES[0].id);
  const [vehicleType, setVehicleType] = useState<EmergencyVehicleType>(DETECTED_FLEET_VEHICLES[0].type);
  const [startLocation, setStartLocation] = useState(DETECTED_FLEET_VEHICLES[0].startLocation);
  const [destination, setDestination] = useState(DETECTED_FLEET_VEHICLES[0].destination);
  const [priority, setPriority] = useState<EmergencyPriority>(DETECTED_FLEET_VEHICLES[0].priority);

  // Routing & execution state
  const [plan, setPlan] = useState<EmergencyRoutePlan | null>(null);
  const [status, setStatus] = useState<EmergencyStatusResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const corridorLayerRef = useRef<L.LayerGroup | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const animationTimerRef = useRef<any>(null);

  // Auto-detect vehicle handler
  const handleAutoDetect = (veh?: DetectedVehicle) => {
    setIsScanning(true);
    setTimeout(() => {
      const target = veh || DETECTED_FLEET_VEHICLES[Math.floor(Math.random() * DETECTED_FLEET_VEHICLES.length)];
      setSelectedVehicleObj(target);
      setVehicleId(target.id);
      setVehicleType(target.type);
      setStartLocation(target.startLocation);
      setDestination(target.destination);
      setPriority(target.priority);
      setIsScanning(false);
      setDetectionNotice({
        title: `V2X Telemetry Auto-Detected: ${target.id} (${target.name})`,
        detail: `Transponder broadcasting at Node ${target.startNode} (${target.startLocation}) → Destination: Node ${target.destNode} (${target.destination}). Priority: ${target.priority}. Signal: ${target.signalStrengthDbm} dBm (Active).`,
        time: new Date().toLocaleTimeString(),
      });
    }, 450);
  };

  // 1. Fetch current status on mount
  const fetchEmergencyStatus = useCallback(async () => {
    try {
      const res = await ApiService.getEmergencyStatus();
      setStatus(res);
      if (res.plan && !plan) {
        setPlan(res.plan);
      }
      if (res.status === "CORRIDOR_ACTIVE" || res.status === "IN_TRANSIT") {
        setIsAnimating(true);
      } else if (res.status === "ARRIVED" || res.status === "COMPLETED") {
        setIsAnimating(false);
      }
    } catch (err) {
      console.warn("Failed to fetch emergency status", err);
    }
  }, [plan]);

  useEffect(() => {
    fetchEmergencyStatus();
    const interval = setInterval(fetchEmergencyStatus, 4000);
    return () => clearInterval(interval);
  }, [fetchEmergencyStatus]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [11.0168, 76.9675],
      zoom: 13.5,
      zoomControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    corridorLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 3. Render Map Layers: Network roads, Glowing corridor, Intersections, Vehicle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = corridorLayerRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Coimbatore Intersection coordinates
    const intersectionCoords: Record<string, [number, number]> = {
      I1: [11.0176, 76.9675],
      I2: [11.0118, 76.9495],
      I3: [11.0285, 77.0028],
      I4: [10.9925, 76.9610],
      I5: [11.0345, 76.9450],
      I6: [11.0015, 76.9740],
    };

    // Draw background road network
    const networkEdges = [
      ["I1", "I2"],
      ["I1", "I4"],
      ["I1", "I5"],
      ["I2", "I3"],
      ["I3", "I5"],
      ["I4", "I5"],
      ["I4", "I6"],
    ];

    networkEdges.forEach(([u, v]) => {
      const p1 = intersectionCoords[u];
      const p2 = intersectionCoords[v];
      if (p1 && p2) {
        L.polyline([p1, p2], {
          color: "#334155",
          weight: 4,
          opacity: 0.6,
          dashArray: "4, 6",
        }).addTo(layerGroup);
      }
    });

    const activeRoute = status?.route || plan?.route || [];
    const isCorridorActive = status?.status === "CORRIDOR_ACTIVE" || status?.status === "IN_TRANSIT";

    // Draw Green Corridor Route if active
    if (activeRoute.length >= 2) {
      const latlngs = activeRoute.map((node) => intersectionCoords[node]).filter(Boolean);

      // Outer glow polyline
      L.polyline(latlngs, {
        color: isCorridorActive ? "#10b981" : "#06b6d4",
        weight: 10,
        opacity: isCorridorActive ? 0.45 : 0.25,
        lineCap: "round",
      }).addTo(layerGroup);

      // Core highlighted line
      L.polyline(latlngs, {
        color: isCorridorActive ? "#34d399" : "#22d3ee",
        weight: 5,
        opacity: 0.95,
      }).addTo(layerGroup);
    }

    // Draw Intersections with preemption status
    Object.entries(intersectionCoords).forEach(([id, coords]) => {
      const onRoute = activeRoute.includes(id);
      const isOrigin = activeRoute[0] === id;
      const isDestination = activeRoute[activeRoute.length - 1] === id;

      let markerBg = "bg-slate-800 border-slate-600 text-slate-300";
      let statusBadge = "";

      if (onRoute && isCorridorActive) {
        markerBg = "bg-emerald-950 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-500 animate-pulse";
        statusBadge = '<span class="text-[9px] px-1 py-0.2 rounded bg-emerald-900 border border-emerald-500 text-emerald-200 font-bold">PREEMPTED GREEN</span>';
      } else if (onRoute) {
        markerBg = "bg-cyan-950 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400";
        statusBadge = '<span class="text-[9px] px-1 py-0.2 rounded bg-cyan-900 border border-cyan-500 text-cyan-200">CORRIDOR WAYPOINT</span>';
      } else if (isCorridorActive) {
        markerBg = "bg-rose-950 border-rose-500 text-rose-300";
        statusBadge = '<span class="text-[9px] px-1 py-0.2 rounded bg-rose-900 border border-rose-600 text-rose-200">CROSS-TRAFFIC HELD</span>';
      }

      const iconHtml = `
        <div class="flex flex-col items-center pointer-events-auto cursor-pointer">
          <div class="w-8 h-8 rounded-full ${markerBg} border-2 flex items-center justify-center font-mono font-black text-xs">
            ${id}
          </div>
          <div class="mt-1 text-center whitespace-nowrap">
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-slate-200 font-mono">
              ${isOrigin ? "ORIGIN" : isDestination ? "DEST" : id}
            </span>
            ${statusBadge ? `<div class="mt-0.5">${statusBadge}</div>` : ""}
          </div>
        </div>
      `;

      const marker = L.marker(coords, {
        icon: L.divIcon({
          html: iconHtml,
          className: "custom-intersection-node",
          iconSize: [40, 48],
          iconAnchor: [20, 24],
        }),
      }).addTo(layerGroup);

      marker.bindPopup(`
        <div class="p-2 text-slate-900 text-xs">
          <div class="font-bold text-sm font-mono">${id} - ${id === "I6" ? "Hospital" : id === "I2" ? "Emergency Center" : id}</div>
          <div class="mt-1">Status: ${onRoute ? (isCorridorActive ? "PREEMPTED GREEN (Corridor Locked)" : "On Planned Route") : (isCorridorActive ? "Cross-Traffic Held at RED" : "Standard Cycle")}</div>
        </div>
      `);
    });

    // Draw Emergency Vehicle Marker
    if (status && status.current_location && (isCorridorActive || status.status === "ARRIVED")) {
      const pos: [number, number] = [
        status.current_location.lat,
        status.current_location.lng,
      ];

      const vIcon =
        vehicleType === "Ambulance" ? "🚑" : vehicleType === "Fire Truck" ? "🚒" : "🚓";

      const vehicleHtml = `
        <div class="relative flex items-center justify-center pointer-events-auto">
          <div class="absolute w-12 h-12 rounded-full bg-red-600/40 animate-ping"></div>
          <div class="absolute w-9 h-9 rounded-full bg-emerald-500/30 ring-2 ring-emerald-400"></div>
          <div class="relative w-8 h-8 rounded-full bg-slate-950 border-2 border-red-500 flex items-center justify-center text-lg shadow-xl shadow-red-500/50">
            ${vIcon}
          </div>
          <div class="absolute -top-7 whitespace-nowrap bg-red-950/90 border border-red-500 text-red-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
            ${vehicleId} • ${status.status}
          </div>
        </div>
      `;

      vehicleMarkerRef.current = L.marker(pos, {
        icon: L.divIcon({
          html: vehicleHtml,
          className: "emergency-vehicle-marker",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
        zIndexOffset: 1000,
      }).addTo(layerGroup);
    }
  }, [plan, status, vehicleType, vehicleId]);

  // 4. Calculate Route via NetworkX
  const handleCalculateRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    try {
      const result = await ApiService.createEmergency({
        vehicle_id: vehicleId,
        type: vehicleType,
        start: startLocation,
        destination: destination,
        priority: priority,
      });
      setPlan(result);
      // Fetch latest status
      const updatedStatus = await ApiService.getEmergencyStatus();
      setStatus(updatedStatus);
    } catch (err: any) {
      console.error("Error creating emergency route:", err);
      alert(`Routing error: ${err.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // 5. Activate Green Corridor
  const handleActivateCorridor = async () => {
    setIsActivating(true);
    try {
      // If plan not yet calculated, calculate first
      if (!plan) {
        await handleCalculateRoute();
      }
      const actRes = await ApiService.activateEmergency({ vehicle_id: vehicleId });
      const updatedStatus = await ApiService.getEmergencyStatus();
      setStatus(updatedStatus);
      setIsAnimating(true);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Error activating corridor:", err);
      alert(`Activation error: ${err.message}`);
    } finally {
      setIsActivating(false);
    }
  };

  // 6. Step Animation Loop
  const handleStepSimulation = useCallback(async () => {
    try {
      const stepRes = await ApiService.stepEmergency(2.5 * simulationSpeed);
      setStatus(stepRes);
      if (stepRes.status === "ARRIVED" || stepRes.status === "COMPLETED") {
        setIsAnimating(false);
      }
    } catch (err) {
      console.warn("Step error", err);
    }
  }, [simulationSpeed]);

  useEffect(() => {
    if (isAnimating && status?.status !== "ARRIVED" && status?.status !== "COMPLETED") {
      animationTimerRef.current = setInterval(handleStepSimulation, 750);
    } else {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    }
    return () => {
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [isAnimating, handleStepSimulation, status?.status]);

  // 7. Complete Emergency & Restore Signals
  const handleCompleteEmergency = async () => {
    setIsCompleting(true);
    try {
      await ApiService.completeEmergency({ vehicle_id: vehicleId });
      setIsAnimating(false);
      const updatedStatus = await ApiService.getEmergencyStatus();
      setStatus(updatedStatus);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error("Error completing emergency:", err);
      alert(`Completion error: ${err.message}`);
    } finally {
      setIsCompleting(false);
    }
  };

  const isCorridorActive = status?.status === "CORRIDOR_ACTIVE" || status?.status === "IN_TRANSIT";
  const isArrived = status?.status === "ARRIVED";
  const isCompleted = status?.status === "COMPLETED";

  const getVehicleIcon = (type: EmergencyVehicleType) => {
    if (type === "Ambulance") return "🚑";
    if (type === "Fire Truck") return "🚒";
    return "🚓";
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-900/60 border border-red-700 text-red-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
                <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                PHASE 8: EMERGENCY VEHICLE MANAGEMENT
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                NetworkX Dijkstra / A* Routing
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
              Automated Emergency Green Corridor Preemption
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
              Dynamically clears corridors for high-priority emergency vehicles, switches affected
              signals to coordinated Green hold, blocks conflicting cross-traffic at Red, and restores
              normal Quantum Optimization upon mission completion.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-mono text-xs font-bold transition shadow ${isCorridorActive
                ? "bg-red-950/80 border-red-600 text-red-200 shadow-red-950/40 animate-pulse"
                : isArrived
                  ? "bg-emerald-950 border-emerald-600 text-emerald-200"
                  : "bg-slate-900 border-slate-800 text-slate-400"
                }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${isCorridorActive ? "bg-red-500 animate-ping" : isArrived ? "bg-emerald-400" : "bg-slate-600"
                  }`}
              />
              STATUS: {status?.status || (plan ? "ROUTE_CALCULATED" : "IDLE")}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Corridor Resumed Mode: <span className="text-cyan-400 font-semibold">{status?.resumed_mode || "QUANTUM_OPTIMIZED"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Coimbatore Alerts Stream */}
      <AlertsTicker className="mb-6" />

      {/* Main Grid: Left Control Panel + Right Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Telemetry Dashboard */}
        <div className="lg:col-span-5 space-y-6">
          {/* Automatic Vehicle Detection & V2X Sensor Scanner Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
                  <Radio className={`w-4 h-4 ${isScanning ? "animate-spin text-cyan-400" : "animate-pulse text-red-400"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Auto-Vehicle Detection
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                      V2X SENSORS ACTIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    SAE J2735 DSRC 5.9GHz &bull; Opticom Strobe Preemption
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAutoDetect()}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                title="Scan connected V2X beacons and auto-detect highest priority emergency vehicle"
              >
                <Scan className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-cyan-200" : ""}`} />
                <span>{isScanning ? "Scanning..." : "Auto-Detect Vehicle"}</span>
              </button>
            </div>

            {/* Real-time Detection Status Banner */}
            <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Live Sensor Broadcast:
                </span>
                <span className="text-[10px] text-slate-500">{detectionNotice.time}</span>
              </div>
              <div className="text-emerald-300 font-bold text-[11px] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{detectionNotice.title}</span>
              </div>
              <div className="text-slate-400 text-[10px] leading-relaxed">
                {detectionNotice.detail}
              </div>
            </div>

            {/* Detected Emergency Fleet Feed (Click to Load) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>DETECTED MUNICIPAL EMERGENCY FLEET:</span>
                <span className="text-cyan-400">Click to Select</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DETECTED_FLEET_VEHICLES.map((veh) => {
                  const isSelected = vehicleId === veh.id;
                  return (
                    <button
                      key={veh.id}
                      type="button"
                      onClick={() => handleAutoDetect(veh)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-red-950/60 border-red-500 shadow-md shadow-red-950/40 ring-1 ring-red-500"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{getVehicleIcon(veh.type)}</span>
                          <span className="font-mono font-black text-xs text-slate-100">{veh.id}</span>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            veh.priority === "CRITICAL"
                              ? "bg-red-900/80 text-red-200 border border-red-700"
                              : "bg-amber-900/80 text-amber-200 border border-amber-700"
                          }`}
                        >
                          {veh.priority}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-300 truncate font-semibold">
                        {veh.startNode} &rarr; {veh.destNode}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 flex items-center justify-between mt-1">
                        <span>{veh.speedKmh} km/h</span>
                        <span className="text-emerald-400">{veh.signalStrengthDbm} dBm</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Auto-Detected Transponder Telemetry Specs */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Transponder ID:</span>
                <span className="text-cyan-300 font-bold">{selectedVehicleObj.transponderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">V2X Protocol:</span>
                <span className="text-slate-200">{selectedVehicleObj.transponderProtocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Coordinates:</span>
                <span className="text-emerald-300">
                  {selectedVehicleObj.gpsCoordinates.lat.toFixed(4)}, {selectedVehicleObj.gpsCoordinates.lng.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dispatch Reason:</span>
                <span className="text-rose-300 truncate max-w-[200px]">{selectedVehicleObj.calloutReason}</span>
              </div>
            </div>
          </div>

          {/* Emergency Creation & Route Calculation Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Emergency Mission Configuration
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                NetworkX Graph Engine
              </span>
            </div>

            <form onSubmit={handleCalculateRoute} className="space-y-3.5">
              {/* Vehicle ID & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Vehicle ID (Auto-Detected)
                  </label>
                  <input
                    type="text"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-red-500 focus:outline-none"
                    placeholder="EV-001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as EmergencyPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-red-500 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Code 3)</option>
                    <option value="HIGH">HIGH (Urgent)</option>
                    <option value="MEDIUM">MEDIUM (Standard)</option>
                  </select>
                </div>
              </div>

              {/* Emergency Type Selector */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  Emergency Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Ambulance", "Fire Truck", "Police"] as EmergencyVehicleType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleType(type)}
                      className={`px-2.5 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${vehicleType === type
                        ? "bg-red-950/60 border-red-600 text-red-200 shadow-md shadow-red-950/30"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                    >
                      <span className="text-base">{getVehicleIcon(type)}</span>
                      <span className="truncate">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start & Destination */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Start Location (Origin)
                  </label>
                  <select
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-red-500 focus:outline-none"
                  >
                    {INTERSECTION_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Destination (Target)
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-red-500 focus:outline-none"
                  >
                    {INTERSECTION_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Calculate Button */}
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5" />
                {isCalculating ? "CALCULATING SHORTEST ROUTE..." : "CALCULATE OPTIMAL ROUTE (NetworkX)"}
              </button>
            </form>
          </div>

          {/* Action Control Panel: Activate / Step / Complete */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              Green Corridor Preemption Controls
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={handleActivateCorridor}
                disabled={isActivating || isCorridorActive}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${isCorridorActive
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30"
                  }`}
              >
                <Siren className="w-4 h-4 animate-bounce" />
                {isActivating ? "PREEMPTING SIGNALS..." : "ACTIVATE EMERGENCY GREEN CORRIDOR"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  disabled={!isCorridorActive && !status?.active}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${isAnimating
                    ? "bg-amber-950/60 border-amber-600 text-amber-300"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    } disabled:opacity-40`}
                >
                  {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isAnimating ? "PAUSE TRANSIT" : "RUN TRANSIT"}
                </button>

                <button
                  onClick={handleStepSimulation}
                  disabled={!isCorridorActive && !status?.active}
                  className="py-2 px-3 rounded-lg border bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  STEP 2.5s
                </button>
              </div>

              <button
                onClick={handleCompleteEmergency}
                disabled={isCompleting || (!isCorridorActive && !status?.active && !isArrived)}
                className="w-full py-2.5 rounded-lg border bg-slate-950 border-emerald-800/80 hover:bg-emerald-950/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {isCompleting ? "RESTORING SIGNALS..." : "COMPLETE EMERGENCY & RESTORE SIGNALS"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map & Live Corridor Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-Time Telemetry Dashboard Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Vehicle ID</span>
                <Car className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div className="font-mono text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>{getVehicleIcon(vehicleType)}</span>
                <span>{status?.vehicle_id || vehicleId}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{vehicleType}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Distance Rem.</span>
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="font-mono text-sm font-black text-cyan-300">
                {status?.distance_remaining_km !== undefined
                  ? `${status.distance_remaining_km} km`
                  : plan
                    ? `${plan.distance_km} km`
                    : "--"}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Total: {plan ? `${plan.distance_km} km` : "--"}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>ETA</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="font-mono text-sm font-black text-amber-300">
                {status?.eta_formatted || plan?.estimated_travel_time_formatted || "--"}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {status?.current_speed_kmh ? `${status.current_speed_kmh} km/h` : "Priority Speed"}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Signals Ready</span>
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="font-mono text-sm font-black text-emerald-400">
                {status?.signals_prepared ||
                  (plan ? `${plan.signals_to_preempt_count}/${plan.signals_to_preempt_count} Preempted` : "0/0")}
              </div>
              <div className="text-[10px] text-emerald-300/80 font-mono">100% Phase Lock</div>
            </div>
          </div>

          {/* Interactive Leaflet Map Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">
                  Live Emergency Corridor Map & Kinematics
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Green Corridor
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Cross Held Red
                </span>
              </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-slate-800 relative">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Overlay Badge on Map */}
              <div className="absolute top-3 left-3 z-[500] bg-slate-950/85 backdrop-blur border border-slate-800 p-2.5 rounded-lg text-xs font-mono space-y-1">
                <div className="text-slate-400 text-[10px]">CURRENT INTERSECTION:</div>
                <div className="text-emerald-300 font-bold">
                  {status?.current_location?.current_intersection || (plan?.route ? plan.route[0] : "I6")} -{" "}
                  {status?.current_location?.current_intersection_name || "Hospital Junction"}
                </div>
                <div className="text-[10px] text-slate-400">
                  Progress: {status?.progress_pct ?? 0}%
                </div>
              </div>
            </div>

            {/* Route Sequence Waypoints Banner */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 shrink-0">
                <span className="text-slate-400 text-[11px] font-semibold">ROUTE:</span>
                <span className="text-base">{getVehicleIcon(vehicleType)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="flex items-center gap-2 font-mono text-xs overflow-x-auto">
                {(status?.route || plan?.route || ["I6", "I4", "I1", "I2"]).map((node, idx, arr) => {
                  const currInter = status?.current_location?.current_intersection;
                  const isCurrent = currInter === node;
                  const isPassed =
                    arr.indexOf(currInter || "") > idx || status?.status === "ARRIVED";

                  return (
                    <React.Fragment key={node}>
                      <span
                        className={`px-2 py-1 rounded border font-bold flex items-center gap-1 ${isCurrent
                          ? "bg-red-950 border-red-500 text-red-200 ring-2 ring-red-400 animate-pulse"
                          : isPassed
                            ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                            : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                      >
                        {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {node}
                      </span>
                      {idx < arr.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <span className="text-[11px] font-mono text-cyan-400 shrink-0 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800">
                {plan?.distance_km || 2.9} km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preemption Signal Table & Impact on Traffic */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Signal Preemption & Approach Control Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Corridor intersections are held at continuous Green in the vehicle transit vector, while orthogonal
              cross-traffic approaches are held at Red with zero green clearance until the emergency clears.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded border border-emerald-800 font-semibold">
            {isCorridorActive ? "CORRIDOR ACTIVE" : "STANDBY"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Intersection</th>
                <th className="py-2.5 px-3">Corridor Direction</th>
                <th className="py-2.5 px-3">Preempted Phase (Emergency)</th>
                <th className="py-2.5 px-3">Conflicting Phase (Cross-Street)</th>
                <th className="py-2.5 px-3">Cross-Traffic Impact</th>
                <th className="py-2.5 px-3 text-right">Physical Signal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {(plan?.intersections_on_route || [
                {
                  id: "I6",
                  name: "Hospital Junction",
                  corridor_direction: "North-South",
                  corridor_phase: "North-South GREEN",
                  conflicting_phase: "East-West RED",
                },
                {
                  id: "I4",
                  name: "South Junction",
                  corridor_direction: "North-South",
                  corridor_phase: "North-South GREEN",
                  conflicting_phase: "East-West RED",
                },
                {
                  id: "I1",
                  name: "Central Junction",
                  corridor_direction: "North-South",
                  corridor_phase: "North-South GREEN",
                  conflicting_phase: "East-West RED",
                },
                {
                  id: "I2",
                  name: "North Junction",
                  corridor_direction: "North-South",
                  corridor_phase: "North-South GREEN",
                  conflicting_phase: "East-West RED",
                },
              ]).map((inter) => (
                <tr key={inter.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold flex items-center justify-center text-[11px]">
                        {inter.id}
                      </span>
                      <span className="font-semibold text-slate-200">{inter.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{inter.corridor_direction}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold">
                      {inter.corridor_phase}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-600 text-rose-300 font-bold">
                      {inter.conflicting_phase}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    <span className="text-rose-300 font-semibold">HELD AT RED</span> — Discharging Paused
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${isCorridorActive
                        ? "bg-emerald-900/80 border border-emerald-500 text-emerald-200 animate-pulse"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                    >
                      {isCorridorActive ? "100% GREEN HOLD" : "STANDBY"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

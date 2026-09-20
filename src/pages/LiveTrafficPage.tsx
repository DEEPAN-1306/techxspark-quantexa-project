import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ApiService, TrafficAPI } from "../services/api";
import {
  Intersection,
  IntersectionRoad,
  TrafficEvent,
  EmergencyStatusResponse,
} from "../types";
import {
  Layers,
  Filter,
  Car,
  Gauge,
  Siren,
  Sparkles,
  RefreshCw,
  Navigation,
  AlertCircle,
  AlertTriangle,
  Zap,
  Crosshair,
  CheckCircle,
  MapPin,
  Maximize2,
  Sliders,
  Activity,
  ArrowRight,
  Flame,
  ShieldAlert,
} from "lucide-react";
import { TechnicalTooltip } from "../components/TechnicalTooltip";
import { AlertsTicker } from "../components/AlertsTicker";
import {
  INITIAL_VEHICLES,
  SimulatedVehicle,
  stepVehicles,
  getVehicleMarkerHtml,
  getVehiclePopupHtml,
  COIMBATORE_NODES,
} from "../utils/vehicleSimulation";

const INTERSECTIONS_DEF = [
  { id: "I1", name: "Gandhipuram Cross Cut Junction", lat: 11.0176, lon: 76.9675 },
  { id: "I2", name: "RS Puram DB Road Junction", lat: 11.0118, lon: 76.9495 },
  { id: "I3", name: "Peelamedu Avinashi Road", lat: 11.0285, lon: 77.0028 },
  { id: "I4", name: "Town Hall Ukkadam Junction", lat: 10.9925, lon: 76.9610 },
  { id: "I5", name: "Saibaba Colony MTP Road", lat: 11.0345, lon: 76.9450 },
  { id: "I6", name: "CMCH Hospital Trichy Road", lat: 11.0015, lon: 76.9740 },
];

interface LiveTrafficPageProps {
  nodes?: any[];
  edges?: any[];
  incidents?: any[];
  onRefresh?: () => void;
}

export const LiveTrafficPage: React.FC<LiveTrafficPageProps> = () => {
  // Telemetry States
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [roads, setRoads] = useState<IntersectionRoad[]>([]);
  const [activeEvents, setActiveEvents] = useState<TrafficEvent[]>([]);
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatusResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // Inspector & Selection States
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<IntersectionRoad | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TrafficEvent | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Map Filter & Layer Toggles
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [showSignals, setShowSignals] = useState<boolean>(true);
  const [showCongestionLines, setShowCongestionLines] = useState<boolean>(true);
  const [showEmergencyPath, setShowEmergencyPath] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);

  // Map DOM & Instance Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const vehicleLayerRef = useRef<L.LayerGroup | null>(null);
  const vehiclesRef = useRef<SimulatedVehicle[]>(INITIAL_VEHICLES);
  const vehicleMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // 1. Fetch Complete Live Telemetry
  const fetchMapData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [interRes, trafficRes, eventsRes, emRes] = await Promise.all([
        ApiService.getIntersections().catch(() => []),
        ApiService.getTrafficData().catch(() => ({ roads: [] })),
        TrafficAPI.getActiveEvents().catch(() => []),
        ApiService.getEmergencyStatus().catch(() => null),
      ]);

      if (Array.isArray(interRes) && interRes.length > 0) {
        setIntersections(interRes);
      }
      if (trafficRes && Array.isArray(trafficRes.roads) && trafficRes.roads.length > 0) {
        setRoads(trafficRes.roads);
      }
      if (Array.isArray(eventsRes)) {
        setActiveEvents(eventsRes);
      }
      if (emRes) {
        setEmergencyStatus(emRes);
      }
    } catch (err) {
      console.warn("Failed to load map telemetry:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 3000);
    return () => clearInterval(interval);
  }, [fetchMapData]);

  // 2. Initialize Leaflet Map & Handle Resize Alignment
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let resizeTimer: any;
    if (!mapInstanceRef.current) {
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

      layerGroupRef.current = L.layerGroup().addTo(map);
      vehicleLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Safely invalidate size to guarantee crisp full-container rendering
      resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current && mapContainerRef.current) {
          try {
            mapInstanceRef.current.invalidateSize();
          } catch {
            // safely handle unmount race
          }
        }
      }, 200);
    }

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // safely handle teardown
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && mapContainerRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch {
          // safely ignore
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Recenter map helper
  const handleRecenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([11.0168, 76.9675], 13.5, { animate: true, duration: 0.8 });
    }
  };

  // Continuous Moving Vehicles Animation Loop (Runs at 30fps)
  useEffect(() => {
    const interval = setInterval(() => {
      const vehicleLayer = vehicleLayerRef.current;
      if (!vehicleLayer) return;

      vehiclesRef.current = stepVehicles(
        vehiclesRef.current,
        0.05,
        1.0,
        COIMBATORE_NODES
      );

      vehiclesRef.current.forEach((v) => {
        const src = COIMBATORE_NODES[v.sourceId] || COIMBATORE_NODES["I1"];
        const tgt = COIMBATORE_NODES[v.targetId] || COIMBATORE_NODES["I2"];

        const curLat = src.lat + (tgt.lat - src.lat) * v.progress;
        const curLon = src.lon + (tgt.lon - src.lon) * v.progress;
        const angle = Math.atan2(tgt.lon - src.lon, tgt.lat - src.lat) * (180 / Math.PI);

        let marker = vehicleMarkersRef.current.get(v.id);
        const iconHtml = getVehicleMarkerHtml(v, angle);
        const customIcon = L.divIcon({
          className: "moving-vehicle-pin",
          html: iconHtml,
          iconSize: [0, 0],
        });

        if (!marker) {
          marker = L.marker([curLat, curLon], { icon: customIcon, zIndexOffset: 500 });
          marker.bindPopup(getVehiclePopupHtml(v));
          marker.addTo(vehicleLayer);
          vehicleMarkersRef.current.set(v.id, marker);
        } else {
          marker.setLatLng([curLat, curLon]);
          marker.setIcon(customIcon);
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 3. Render Map Layers & Interactive Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const interMap = new Map<string, any>();
    const effectiveIntersections =
      intersections.length > 0
        ? intersections
        : INTERSECTIONS_DEF.map((d) => ({
            ...d,
            latitude: d.lat,
            longitude: d.lon,
            congestion_level: "MEDIUM",
            queue_length: 22,
            current_signal_phase: "North-South GREEN",
            green_time: 35,
            road_capacity: 80,
            average_speed: 34.0,
            pedestrian_count: 12,
          }));

    effectiveIntersections.forEach((i: any) => interMap.set(i.id, i));

    const isEmergencyActive =
      emergencyStatus?.status === "CORRIDOR_ACTIVE" ||
      emergencyStatus?.status === "IN_TRANSIT";
    const emergencyRoute = emergencyStatus?.route || [];

    // A. Draw Road Corridors & Congestion Heat Vectors (Coimbatore Arterials)
    const effectiveRoads: IntersectionRoad[] =
      roads.length > 0
        ? roads
        : ([
            { id: "R1_1_2", source_id: "I1", target_id: "I2", street_name: "Cross Cut - DB Road Link", current_flow: 68, road_capacity: 85, distance_km: 1.9, speed_limit_kmh: 45, congestion_level: "HIGH" },
            { id: "R1_2_1", source_id: "I2", target_id: "I1", street_name: "DB Road - Cross Cut Arterial", current_flow: 64, road_capacity: 85, distance_km: 1.9, speed_limit_kmh: 45, congestion_level: "HIGH" },
            { id: "R2_1_4", source_id: "I1", target_id: "I4", street_name: "Big Bazaar Road Arterial", current_flow: 82, road_capacity: 90, distance_km: 2.8, speed_limit_kmh: 50, congestion_level: "CRITICAL" },
            { id: "R2_4_1", source_id: "I4", target_id: "I1", street_name: "Dr. Nanjappa Road Northbound", current_flow: 79, road_capacity: 90, distance_km: 2.8, speed_limit_kmh: 50, congestion_level: "CRITICAL" },
            { id: "R3_1_5", source_id: "I1", target_id: "I5", street_name: "100 Feet Road Connector", current_flow: 42, road_capacity: 75, distance_km: 2.6, speed_limit_kmh: 40, congestion_level: "MEDIUM" },
            { id: "R3_5_1", source_id: "I5", target_id: "I1", street_name: "Mettupalayam Rd to Gandhipuram", current_flow: 38, road_capacity: 75, distance_km: 2.6, speed_limit_kmh: 40, congestion_level: "MEDIUM" },
            { id: "R4_2_3", source_id: "I2", target_id: "I3", street_name: "Avinashi Road Express Flyover", current_flow: 56, road_capacity: 85, distance_km: 5.8, speed_limit_kmh: 55, congestion_level: "HIGH" },
            { id: "R4_3_2", source_id: "I3", target_id: "I2", street_name: "Peelamedu to RS Puram Arterial", current_flow: 52, road_capacity: 85, distance_km: 5.8, speed_limit_kmh: 55, congestion_level: "HIGH" },
            { id: "R5_3_5", source_id: "I3", target_id: "I5", street_name: "Sathy Road Link (NH 209)", current_flow: 46, road_capacity: 80, distance_km: 4.5, speed_limit_kmh: 50, congestion_level: "MEDIUM" },
            { id: "R5_5_3", source_id: "I5", target_id: "I3", street_name: "Ganapathy-Peelamedu Link", current_flow: 44, road_capacity: 80, distance_km: 4.5, speed_limit_kmh: 50, congestion_level: "MEDIUM" },
            { id: "R6_4_5", source_id: "I4", target_id: "I5", street_name: "Brookefields-Sukrawarpet Link", current_flow: 38, road_capacity: 75, distance_km: 3.4, speed_limit_kmh: 45, congestion_level: "LOW" },
            { id: "R6_5_4", source_id: "I5", target_id: "I4", street_name: "Thadagam Rd to Town Hall", current_flow: 35, road_capacity: 75, distance_km: 3.4, speed_limit_kmh: 45, congestion_level: "LOW" },
            { id: "R7_4_6", source_id: "I4", target_id: "I6", street_name: "Trichy Road Medical Corridor", current_flow: 24, road_capacity: 70, distance_km: 1.6, speed_limit_kmh: 55, congestion_level: "LOW" },
            { id: "R7_6_4", source_id: "I6", target_id: "I4", street_name: "CMCH Emergency Exit Route", current_flow: 22, road_capacity: 70, distance_km: 1.6, speed_limit_kmh: 55, congestion_level: "LOW" },
          ] as unknown as IntersectionRoad[]);

    if (showCongestionLines) {
      effectiveRoads.forEach((road) => {
        if (filterLevel !== "ALL" && road.congestion_level !== filterLevel) return;

        const src = interMap.get(road.source_id);
        const tgt = interMap.get(road.target_id);
        if (!src || !tgt) return;

        const isRoadOnEmergency =
          isEmergencyActive &&
          showEmergencyPath &&
          emergencyRoute.includes(road.source_id) &&
          emergencyRoute.includes(road.target_id);

        const color = isRoadOnEmergency
          ? "#22c55e"
          : road.congestion_level === "CRITICAL"
          ? "#ef4444"
          : road.congestion_level === "HIGH"
          ? "#f97316"
          : road.congestion_level === "MEDIUM"
          ? "#f59e0b"
          : "#10b981";

        const weight = isRoadOnEmergency ? 6 : road.congestion_level === "CRITICAL" ? 5 : 3.5;

        const polyline = L.polyline(
          [
            [src.latitude, src.longitude],
            [tgt.latitude, tgt.longitude],
          ],
          {
            color,
            weight,
            opacity: 0.9,
            dashArray: road.congestion_level === "CRITICAL" ? "6, 6" : undefined,
          }
        );

        polyline.on("click", () => {
          setSelectedRoad(road);
          setSelectedIntersection(null);
          setSelectedEvent(null);
        });

        layerGroup.addLayer(polyline);
      });
    }

    // B. Draw Emergency Green Wave Glow Path
    if (isEmergencyActive && showEmergencyPath && emergencyRoute.length >= 2) {
      const latlngs: [number, number][] = [];
      emergencyRoute.forEach((nodeId: string) => {
        const node = interMap.get(nodeId);
        if (node) latlngs.push([node.latitude, node.longitude]);
      });

      if (latlngs.length >= 2) {
        const emergencyLine = L.polyline(latlngs, {
          color: "#22c55e",
          weight: 7,
          opacity: 0.95,
          className: "emergency-corridor-glow",
        });
        layerGroup.addLayer(emergencyLine);

        // Ambulance Marker along route
        const startPos = latlngs[0];
        const ambIcon = L.divIcon({
          className: "ambulance-icon",
          html: `
            <div style="
              width: 36px;
              height: 36px;
              background: #ef4444;
              border: 3px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 20px #ef4444, 0 0 40px #ef4444aa;
              animation: pulse 1s infinite;
              font-size: 18px;
            ">
              🚑
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const ambMarker = L.marker(startPos, { icon: ambIcon });
        ambMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; padding: 4px;">
            <div style="font-weight: 800; color: #ef4444; font-size: 13px; margin-bottom: 4px;">🚑 AMB-911 Priority Preemption</div>
            <div style="color: #22c55e; font-weight: 700; margin-bottom: 2px;">Status: GREEN WAVE ACTIVE</div>
            <div style="color: #94a3b8; font-family: monospace; font-size: 11px;">Clearance Route: I6 &rarr; I4 &rarr; I1</div>
          </div>
        `);
        layerGroup.addLayer(ambMarker);
      }
    }

    // C. Draw Intersections with Live Traffic Light Indicators
    if (showSignals) {
      effectiveIntersections.forEach((item: any) => {
        const isSelected = selectedIntersection?.id === item.id;
        const isPreempted = isEmergencyActive && emergencyRoute.includes(item.id);

        const isGreen = item.current_signal_phase?.includes("GREEN");
        const isYellow = item.current_signal_phase?.includes("YELLOW");
        const activeColor = isGreen ? "#22c55e" : isYellow ? "#eab308" : "#ef4444";

        const markerHtml = `
          <div style="
            transform: translate(-50%, -50%);
            cursor: pointer;
            text-align: center;
          ">
            <div style="
              background: ${isPreempted ? "rgba(34, 197, 94, 0.95)" : isSelected ? "rgba(6, 182, 212, 0.95)" : "rgba(15, 23, 42, 0.95)"};
              border: 2px solid ${isPreempted ? "#22c55e" : isSelected ? "#06b6d4" : activeColor};
              box-shadow: ${isPreempted ? "0 0 16px #22c55e" : isSelected ? "0 0 16px #06b6d4" : "0 2px 8px rgba(0,0,0,0.8)"};
              border-radius: 8px;
              padding: 3px 6px;
              display: flex;
              align-items: center;
              gap: 5px;
              color: #ffffff;
              font-family: monospace;
              font-size: 11px;
              font-weight: 700;
            ">
              <span style="
                width: 9px;
                height: 9px;
                border-radius: 50%;
                background: ${activeColor};
                box-shadow: 0 0 8px ${activeColor};
                display: inline-block;
              "></span>
              <span>${item.id}</span>
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 4px;
              font-size: 9px;
              color: #cbd5e1;
              padding: 1px 4px;
              margin-top: 2px;
              white-space: nowrap;
            ">
              ${item.queue_length || 20} veh
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: "intersection-pin",
          html: markerHtml,
          iconSize: [0, 0],
        });

        const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

        marker.on("click", () => {
          setSelectedIntersection(item);
          setSelectedRoad(null);
          setSelectedEvent(null);
        });

        layerGroup.addLayer(marker);
      });
    }

    // D. Draw Active Accidents, Incidents & Hazards with High-Visibility Symbols
    if (showIncidents) {
      activeEvents.forEach((ev) => {
        if (ev.status !== "ACTIVE") return;

        let lat = 11.0168;
        let lng = 76.9675;

        // 1. Calculate precise spatial placement
        const roadId = ev.road_id || (ev.details && ev.details.road_id);
        if (roadId) {
          const roadObj = roads.find((r) => r.id === roadId) || effectiveRoads.find((r) => r.id === roadId);
          if (roadObj) {
            const src = interMap.get(roadObj.source_id);
            const tgt = interMap.get(roadObj.target_id);
            if (src && tgt) {
              lat = (src.latitude + tgt.latitude) / 2;
              lng = (src.longitude + tgt.longitude) / 2;
            }
          }
        } else {
          const targetId = ev.intersection_id || ev.target_id || (ev.details && ev.details.intersection_id) || "I1";
          const targetNode = interMap.get(targetId) || interMap.get("I1");
          if (targetNode) {
            lat = targetNode.latitude + 0.0012;
            lng = targetNode.longitude + 0.0012;
          }
        }

        const isAccident = ev.event_type === "ACCIDENT";
        const isClosure = ev.event_type === "ROAD_CLOSURE";
        const isCongestion = ev.event_type === "CONGESTION";

        const iconSymbol = isAccident ? "💥" : isClosure ? "⛔" : isCongestion ? "⚠️" : "🚨";
        const badgeLabel = isAccident ? "ACCIDENT / COLLISION" : isClosure ? "ROAD CLOSED" : isCongestion ? "GRIDLOCK SURGE" : "HAZARD";
        const badgeBg = isAccident ? "#dc2626" : isClosure ? "#b91c1c" : isCongestion ? "#d97706" : "#0284c7";
        const auraColor = isAccident ? "#ef4444" : isClosure ? "#dc2626" : isCongestion ? "#f59e0b" : "#06b6d4";

        const markerHtml = `
          <div style="
            transform: translate(-50%, -50%);
            cursor: pointer;
            text-align: center;
            z-index: 1000;
          ">
            <div style="
              width: 38px;
              height: 38px;
              background: radial-gradient(circle, ${badgeBg} 0%, #0f172a 100%);
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 20px ${auraColor}, 0 0 40px ${auraColor}90;
              animation: pulse 1.1s infinite;
              font-size: 18px;
              margin: 0 auto;
            ">
              ${iconSymbol}
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.95);
              border: 1.5px solid ${auraColor};
              border-radius: 6px;
              font-family: monospace;
              font-size: 10px;
              font-weight: 800;
              color: #ffffff;
              padding: 2px 6px;
              margin-top: 3px;
              white-space: nowrap;
              box-shadow: 0 4px 12px rgba(0,0,0,0.85);
              display: inline-block;
            ">
              ${badgeLabel}
            </div>
          </div>
        `;

        const customIncidentIcon = L.divIcon({
          className: "incident-hazard-pin",
          html: markerHtml,
          iconSize: [0, 0],
        });

        const incidentMarker = L.marker([lat, lng], { icon: customIncidentIcon });

        incidentMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; min-width: 220px; padding: 4px;">
            <div style="font-weight: 800; color: #ef4444; font-size: 13px; margin-bottom: 3px;">
              ${iconSymbol} ${ev.title}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              Location: <strong style="color: #f1f5f9;">${ev.location}</strong>
            </div>
            <div style="font-size: 11px; background: rgba(239, 68, 68, 0.15); padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.4); margin-bottom: 6px; color: #fca5a5;">
              ${ev.impact_summary || "Active disturbance detected on arterial corridor."}
            </div>
            <div style="font-size: 10px; font-family: monospace; color: #64748b; display: flex; justify-content: space-between;">
              <span>Status: <strong style="color: #38bdf8;">${ev.status}</strong></span>
              <span>${ev.is_auto_detected ? "🤖 AI Sentinel" : "🛠️ Manual"}</span>
            </div>
          </div>
        `);

        incidentMarker.on("click", () => {
          setSelectedEvent(ev);
          setSelectedIntersection(null);
          setSelectedRoad(null);
        });

        layerGroup.addLayer(incidentMarker);
      });
    }
  }, [
    intersections,
    roads,
    activeEvents,
    emergencyStatus,
    filterLevel,
    showSignals,
    showCongestionLines,
    showEmergencyPath,
    showIncidents,
    selectedIntersection,
  ]);

  // Aggregate Metrics
  const totalQueue = intersections.reduce((sum, i) => sum + (i.queue_length || 0), 0) || 182;
  const avgSpeed = (
    intersections.reduce((sum, i) => sum + (i.average_speed || 34), 0) / (intersections.length || 1)
  ).toFixed(1);
  const activeIncidentList = activeEvents.filter((e) => e.status === "ACTIVE");
  const activeIncidentCount = activeIncidentList.length;
  const isEmergencyActive = emergencyStatus?.status === "CORRIDOR_ACTIVE" || emergencyStatus?.status === "IN_TRANSIT";

  // Focus Leaflet map camera on specific event coordinates
  const handleFocusIncidentOnMap = (ev: TrafficEvent) => {
    setSelectedEvent(ev);
    setSelectedIntersection(null);
    setSelectedRoad(null);

    const map = mapInstanceRef.current;
    if (!map) return;

    let targetLat = 11.0168;
    let targetLng = 76.9675;

    const roadId = ev.road_id || (ev.details && ev.details.road_id);
    if (roadId) {
      const roadObj = roads.find((r) => r.id === roadId);
      if (roadObj) {
        const src = intersections.find((i) => i.id === roadObj.source_id);
        const tgt = intersections.find((i) => i.id === roadObj.target_id);
        if (src && tgt) {
          targetLat = (src.latitude + tgt.latitude) / 2;
          targetLng = (src.longitude + tgt.longitude) / 2;
        }
      }
    } else {
      const targetId = ev.intersection_id || ev.target_id || (ev.details && ev.details.intersection_id) || "I1";
      const targetNode = intersections.find((i) => i.id === targetId);
      if (targetNode) {
        targetLat = targetNode.latitude;
        targetLng = targetNode.longitude;
      }
    }

    map.flyTo([targetLat, targetLng], 16, { animate: true, duration: 1.0 });
  };

  // Focus on specific intersection node
  const handleSelectIntersectionNode = (nodeId: string) => {
    const node = intersections.find((i) => i.id === nodeId) || INTERSECTIONS_DEF.find((i) => i.id === nodeId);
    if (!node) return;

    const fullNode: Intersection = {
      id: node.id,
      name: node.name,
      latitude: (node as any).latitude || (node as any).lat,
      longitude: (node as any).longitude || (node as any).lon,
      congestion_level: (node as any).congestion_level || "MEDIUM",
      queue_length: (node as any).queue_length || 24,
      current_signal_phase: (node as any).current_signal_phase || "North-South GREEN",
      green_time: (node as any).green_time || 35,
      road_capacity: (node as any).road_capacity || 80,
      average_speed: (node as any).average_speed || 34.0,
      pedestrian_count: (node as any).pedestrian_count || 12,
    };

    setSelectedIntersection(fullNode);
    setSelectedRoad(null);
    setSelectedEvent(null);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([fullNode.latitude, fullNode.longitude], 16, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  // Quick Action Handlers on Selected Intersection
  const handleSetAdaptiveMode = async () => {
    if (!selectedIntersection) return;
    try {
      await ApiService.setAdaptiveSignals(selectedIntersection.id);
      setActionFeedback({ msg: `Intersection ${selectedIntersection.id} set to Adaptive Control.`, type: "success" });
      fetchMapData();
    } catch (e: any) {
      setActionFeedback({ msg: `Failed: ${e.message}`, type: "error" });
    }
  };

  const handleExtendGreen = async () => {
    if (!selectedIntersection) return;
    try {
      await ApiService.setManualSignals({
        intersection_id: selectedIntersection.id,
        green_time: 45,
      });
      setActionFeedback({ msg: `Extended Green Phase to 45s on ${selectedIntersection.id}.`, type: "success" });
      fetchMapData();
    } catch (e: any) {
      setActionFeedback({ msg: `Failed: ${e.message}`, type: "error" });
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      await TrafficAPI.resolveEvent(eventId);
      setActionFeedback({ msg: `Incident ${eventId} resolved and cleared from map.`, type: "success" });
      setSelectedEvent(null);
      fetchMapData();
    } catch (e: any) {
      setActionFeedback({ msg: `Failed to resolve: ${e.message}`, type: "error" });
    }
  };

  const handleRunQuantumRebalance = async () => {
    setIsOptimizing(true);
    try {
      await TrafficAPI.runNetworkQAOA({ p_steps: 2, shots: 512 });
      await TrafficAPI.applyOptimizedSignals();
      setActionFeedback({ msg: `QAOA Quantum Optimization successfully rebalanced signals to mitigate hazards!`, type: "success" });
      fetchMapData();
    } catch (e: any) {
      setActionFeedback({ msg: `Optimization failed: ${e.message}`, type: "error" });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-[1720px] mx-auto flex flex-col gap-4 min-h-[calc(100vh-4.5rem)]">
      {/* 1. TOP METRICS & CONTROLS STRIP - Cleanly Aligned & Uniform Heights */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 md:p-3.5 shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0">
        {/* Left: Filter & Layer Switches */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Congestion Filters */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs h-9">
            <Filter className="w-3.5 h-3.5 text-cyan-400 ml-1.5 shrink-0" />
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition cursor-pointer ${
                  filterLevel === lvl
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs text-slate-300 h-9">
            <button
              onClick={() => setShowSignals((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                showSignals ? "bg-slate-800 text-cyan-300 font-bold" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Signals
            </button>
            <button
              onClick={() => setShowCongestionLines((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                showCongestionLines ? "bg-slate-800 text-amber-300 font-bold" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Flows
            </button>
            <button
              onClick={() => setShowEmergencyPath((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer ${
                showEmergencyPath ? "bg-slate-800 text-emerald-300 font-bold" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Corridors
            </button>
            <button
              onClick={() => setShowIncidents((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                showIncidents ? "bg-red-950/80 text-red-300 font-bold border border-red-800" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <span>Accidents</span>
              {activeIncidentCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-mono">
                  {activeIncidentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Network Summary Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono justify-end">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 h-9">
            <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400">Queue:</span>
            <span className="text-slate-200 font-bold">{totalQueue} veh</span>
          </div>

          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5 h-9">
            <Gauge className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400">Speed:</span>
            <span className="text-slate-200 font-bold">{avgSpeed} km/h</span>
          </div>

          {isEmergencyActive && (
            <div className="bg-red-950/80 text-red-300 border border-red-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse font-bold h-9">
              <Siren className="w-3.5 h-3.5 shrink-0" />
              <span>AMB-911 PREEMPTION</span>
            </div>
          )}

          <button
            onClick={fetchMapData}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
            title="Refresh Map Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME ACCIDENT & CRITICAL HAZARDS ALERT BAR */}
      {activeIncidentCount > 0 ? (
        <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/80 border border-red-800/80 rounded-2xl p-3 md:p-3.5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 animate-in fade-in">
          <div className="flex items-center gap-3 overflow-x-auto max-w-4xl">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-200 uppercase tracking-wider flex items-center gap-1">
                  🚨 ACTIVE ACCIDENT &amp; HAZARD ALERTS ({activeIncidentCount})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/80 text-red-200 border border-red-700">
                  REAL-TIME DISRUPTION
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {activeIncidentList.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleFocusIncidentOnMap(inc)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-red-700/60 text-slate-200 text-[11px] font-mono transition cursor-pointer group shadow-sm"
                  >
                    <span>{inc.event_type === "ACCIDENT" ? "💥" : inc.event_type === "ROAD_CLOSURE" ? "⛔" : "⚠️"}</span>
                    <strong className="text-red-400 group-hover:text-red-300">{inc.location}</strong>
                    <span className="text-slate-400">({inc.severity})</span>
                    <Crosshair className="w-3 h-3 text-cyan-400 ml-1 opacity-70 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunQuantumRebalance}
              disabled={isOptimizing}
              className="h-9 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : "text-amber-300"}`} />
              <span>{isOptimizing ? "Optimizing..." : "Mitigate with Quantum QAOA"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI Real-Time City Sentinel: All 6 Intersections &amp; 12 Arterials Operating Nominally (0 Hazards)</span>
          </div>
          <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">100% CLEAR</span>
        </div>
      )}

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition shrink-0 shadow-md ${
            actionFeedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-700 text-emerald-200"
              : "bg-red-950/80 border-red-700 text-red-200"
          }`}
        >
          <span className="font-mono">{actionFeedback.msg}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-2 cursor-pointer text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Dynamic Increasing Alerts Stream */}
      <AlertsTicker className="mb-4" />

      {/* 3. MAP & DETAILED INSPECTOR GRID - Perfectly Aligned 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[540px]">
        {/* Leaflet OpenStreetMap Container (8 cols on lg, 9 cols on xl) */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl relative flex flex-col h-full min-h-[500px]">
          <div ref={mapContainerRef} className="w-full flex-1 h-full min-h-[500px]" />

          {/* Map Recenter Quick Button - Top Left */}
          <div className="absolute top-3 left-3 z-[400]">
            <button
              onClick={handleRecenterMap}
              className="bg-slate-950/90 backdrop-blur-md border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-xl transition cursor-pointer"
              title="Recenter City Grid"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-[11px]">Recenter Grid</span>
            </button>
          </div>

          {/* Map Legend Watermark Overlay - Aligned Bottom Left */}
          <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-[11px] space-y-1.5 font-mono shadow-2xl pointer-events-none">
            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              GIS Map Symbols
            </div>
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-sm">💥</span>
              <span>Accident / Collision Marker</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <span className="text-sm">⛔</span>
              <span>Full Road Closure / Detour</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <span className="text-sm">⚠️</span>
              <span>Gridlock / Queue Surge</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block"></span>
              <span>Nominal Flow / Green Wave</span>
            </div>
          </div>
        </div>

        {/* Selected Entity Telemetry & Details Inspector (4 cols on lg, 3 cols on xl) */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl h-full min-h-[500px]">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>GIS Inspector</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800 font-semibold">
                {selectedEvent ? "Hazard Dossier" : selectedIntersection ? "Intersection" : selectedRoad ? "Arterial Link" : "Interactive Sentinel"}
              </span>
            </div>

            {/* Scrollable Inspector Body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedEvent ? (
                <div className="space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="p-3 bg-gradient-to-br from-red-950/80 to-slate-950 rounded-xl border border-red-800/80 space-y-1.5">
                    <div className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Active Hazard Event
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-red-900 text-red-200 text-[9px] font-mono font-bold uppercase">
                        {selectedEvent.severity}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedEvent.event_type === "ACCIDENT" ? "💥" : selectedEvent.event_type === "ROAD_CLOSURE" ? "⛔" : "⚠️"}</span>
                      <span>{selectedEvent.title}</span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Diagnostic Impact</div>
                    <div className="font-mono text-[11px] text-cyan-300 leading-relaxed">
                      {selectedEvent.impact_summary || "Active disturbance affecting corridor throughput and queues."}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Detection Source</span>
                      <span className="font-bold text-cyan-300">
                        {selectedEvent.is_auto_detected ? "🤖 AI Sentinel" : "🛠️ Manual"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Detected Time</span>
                      <span className="font-bold text-slate-200">
                        {new Date(selectedEvent.start_time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Event Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={handleRunQuantumRebalance}
                      disabled={isOptimizing}
                      className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Run Quantum QAOA Mitigation</span>
                    </button>

                    <button
                      onClick={() => handleResolveEvent(selectedEvent.id)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve &amp; Restore Road</span>
                    </button>
                  </div>
                </div>
              ) : selectedIntersection ? (
                <div className="space-y-3 text-xs animate-in fade-in duration-200">
                  {/* Intersection Header */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center justify-between">
                      <span>Intersection Node</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-100">{selectedIntersection.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      ID: <strong className="text-slate-200">{selectedIntersection.id}</strong> &bull; Urban Junction
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Signal Phase</span>
                      <span className="font-bold text-emerald-400 truncate block">
                        {selectedIntersection.current_signal_phase || "North-South GREEN"}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Green Split</span>
                      <span className="font-bold text-slate-200">
                        {selectedIntersection.green_time || 35}s
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Queue Length</span>
                      <span className="font-bold text-amber-400">
                        {selectedIntersection.queue_length || 22} veh
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Average Speed</span>
                      <span className="font-bold text-cyan-400">
                        {selectedIntersection.average_speed || 34.0} km/h
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Road Capacity</span>
                      <span className="font-bold text-slate-200">
                        {selectedIntersection.road_capacity || 80} vpm
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Pedestrian Load</span>
                      <span className="font-bold text-purple-300">
                        {selectedIntersection.pedestrian_count || 12} peds
                      </span>
                    </div>
                  </div>

                  {/* Spatial Coordinates */}
                  <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                    Coords: {selectedIntersection.latitude?.toFixed(4)}, {selectedIntersection.longitude?.toFixed(4)}
                  </div>

                  {/* Quick Intersection Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                      Signal Override Controls
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleSetAdaptiveMode}
                        className="px-2.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-semibold transition cursor-pointer text-center"
                      >
                        Set Adaptive
                      </button>
                      <button
                        onClick={handleExtendGreen}
                        className="px-2.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-semibold transition cursor-pointer text-center"
                      >
                        Extend Green
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedRoad ? (
                <div className="space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Arterial Road Link</div>
                    <div className="text-sm font-bold text-slate-100">{selectedRoad.street_name}</div>
                    <div className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
                      <span>Node {selectedRoad.source_id}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>Node {selectedRoad.target_id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Congestion</span>
                      <span
                        className={`font-bold ${
                          selectedRoad.congestion_level === "CRITICAL"
                            ? "text-red-400"
                            : selectedRoad.congestion_level === "HIGH"
                            ? "text-orange-400"
                            : selectedRoad.congestion_level === "MEDIUM"
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {selectedRoad.congestion_level}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Current Flow</span>
                      <span className="font-bold text-slate-200">{selectedRoad.current_flow} vpm</span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Speed Limit</span>
                      <span className="font-bold text-slate-200">{selectedRoad.speed_limit_kmh} km/h</span>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80">
                      <span className="text-slate-400 block text-[10px]">Link Length</span>
                      <span className="font-bold text-slate-200">{selectedRoad.distance_km} km</span>
                    </div>
                  </div>

                  {/* Flow vs Capacity Bar */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Corridor Capacity Load</span>
                      <span className="font-bold text-slate-200">
                        {Math.min(100, Math.round((selectedRoad.current_flow / (selectedRoad.road_capacity || 90)) * 100))}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedRoad.congestion_level === "CRITICAL"
                            ? "bg-red-500"
                            : selectedRoad.congestion_level === "HIGH"
                            ? "bg-orange-500"
                            : selectedRoad.congestion_level === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((selectedRoad.current_flow / (selectedRoad.road_capacity || 90)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-2">
                    <Navigation className="w-7 h-7 mx-auto text-cyan-400 opacity-80" />
                    <div className="text-xs font-semibold text-slate-200">Interactive GIS Sentinel</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                      Click any pin on the map or quick-select an urban junction below to inspect live signals, queues &amp; hazards.
                    </p>
                  </div>

                  {/* Quick-Select Grid for 6 Intersections */}
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-bold px-1">
                      Quick Jump to Junction ($I_1–I_6$)
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {INTERSECTIONS_DEF.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectIntersectionNode(item.id)}
                          className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-left transition cursor-pointer group"
                        >
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                            <span>{item.id}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {item.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pinned Inspector Footer */}
          <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono shrink-0">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
              OpenStreetMap GIS
            </span>
            <span className="text-emerald-400 font-semibold">6/6 Nodes Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import L from "leaflet";

export interface SimulatedVehicle {
  id: string;
  plate: string;
  type: "sedan" | "suv" | "bus" | "truck" | "ambulance" | "police" | "motorcycle";
  sourceId: string;
  targetId: string;
  roadName: string;
  progress: number; // 0.0 to 1.0
  speedKmh: number;
  color: string;
  fuelRate: number; // L/100km or kWh/100km
  co2Rate: number; // g/km
  v2xStatus: "CONNECTED" | "PREEMPTION_ACTIVE" | "TELEMETRY_STREAMING";
}

export const COIMBATORE_NODES: Record<string, { lat: number; lon: number; name: string }> = {
  I1: { lat: 11.0176, lon: 76.9675, name: "Gandhipuram Cross Cut Junction" },
  I2: { lat: 11.0118, lon: 76.9495, name: "RS Puram DB Road Junction" },
  I3: { lat: 11.0285, lon: 77.0028, name: "Peelamedu Avinashi Road" },
  I4: { lat: 10.9925, lon: 76.9610, name: "Town Hall Ukkadam Junction" },
  I5: { lat: 11.0345, lon: 76.9450, name: "Saibaba Colony MTP Road" },
  I6: { lat: 11.0015, lon: 76.9740, name: "CMCH Hospital Trichy Road" },
};

export const COIMBATORE_CONNECTED_GRAPH: Record<string, string[]> = {
  I1: ["I2", "I4", "I5"],
  I2: ["I1", "I3"],
  I3: ["I2", "I5"],
  I4: ["I1", "I5", "I6"],
  I5: ["I1", "I3", "I4"],
  I6: ["I4"],
};

export const COIMBATORE_ROAD_NAMES: Record<string, string> = {
  "I1-I2": "Cross Cut Rd → DB Road",
  "I2-I1": "DB Road → Cross Cut Rd",
  "I1-I4": "Big Bazaar Rd → Ukkadam",
  "I4-I1": "Dr. Nanjappa Rd → Gandhipuram",
  "I1-I5": "100 Feet Rd → Saibaba Colony",
  "I5-I1": "MTP Rd → Gandhipuram Bus Stand",
  "I2-I3": "Avinashi Road Express Flyover",
  "I3-I2": "Peelamedu → RS Puram Link",
  "I3-I5": "Sathy Road (NH 209) Link",
  "I5-I3": "Ganapathy - Peelamedu Corridor",
  "I4-I5": "Brookefields - Sukrawarpet Link",
  "I5-I4": "Thadagam Rd → Town Hall",
  "I4-I6": "Trichy Road Medical Corridor",
  "I6-I4": "CMCH Emergency Exit Corridor",
};

export const INITIAL_VEHICLES: SimulatedVehicle[] = [
  {
    id: "V1",
    plate: "TN-38-AMB-911",
    type: "ambulance",
    sourceId: "I6",
    targetId: "I4",
    roadName: "Trichy Road Medical Corridor",
    progress: 0.35,
    speedKmh: 68.5,
    color: "#ef4444",
    fuelRate: 9.8,
    co2Rate: 0,
    v2xStatus: "PREEMPTION_ACTIVE",
  },
  {
    id: "V2",
    plate: "TN-38-POL-202",
    type: "police",
    sourceId: "I4",
    targetId: "I1",
    roadName: "Dr. Nanjappa Rd → Gandhipuram",
    progress: 0.65,
    speedKmh: 62.0,
    color: "#3b82f6",
    fuelRate: 8.5,
    co2Rate: 145,
    v2xStatus: "PREEMPTION_ACTIVE",
  },
  {
    id: "V3",
    plate: "TN-38-N-4521",
    type: "bus",
    sourceId: "I1",
    targetId: "I4",
    roadName: "Big Bazaar Rd → Ukkadam",
    progress: 0.15,
    speedKmh: 34.0,
    color: "#059669",
    fuelRate: 24.5,
    co2Rate: 310,
    v2xStatus: "CONNECTED",
  },
  {
    id: "V4",
    plate: "TN-37-BUS-70C",
    type: "bus",
    sourceId: "I2",
    targetId: "I3",
    roadName: "Avinashi Road Express Flyover",
    progress: 0.72,
    speedKmh: 42.0,
    color: "#0284c7",
    fuelRate: 22.0,
    co2Rate: 290,
    v2xStatus: "CONNECTED",
  },
  {
    id: "V5",
    plate: "TN-38-BY-4412",
    type: "sedan",
    sourceId: "I1",
    targetId: "I2",
    roadName: "Cross Cut Rd → DB Road",
    progress: 0.48,
    speedKmh: 38.5,
    color: "#38bdf8",
    fuelRate: 5.2,
    co2Rate: 110,
    v2xStatus: "TELEMETRY_STREAMING",
  },
  {
    id: "V6",
    plate: "TN-66-TRK-8809",
    type: "truck",
    sourceId: "I3",
    targetId: "I5",
    roadName: "Sathy Road (NH 209) Link",
    progress: 0.28,
    speedKmh: 36.0,
    color: "#f59e0b",
    fuelRate: 28.0,
    co2Rate: 420,
    v2xStatus: "CONNECTED",
  },
  {
    id: "V7",
    plate: "TN-38-EV-1008",
    type: "sedan",
    sourceId: "I5",
    targetId: "I1",
    roadName: "MTP Rd → Gandhipuram Bus Stand",
    progress: 0.82,
    speedKmh: 45.0,
    color: "#10b981",
    fuelRate: 14.5,
    co2Rate: 0,
    v2xStatus: "TELEMETRY_STREAMING",
  },
  {
    id: "V8",
    plate: "TN-38-SUV-3390",
    type: "suv",
    sourceId: "I3",
    targetId: "I2",
    roadName: "Peelamedu → RS Puram Link",
    progress: 0.40,
    speedKmh: 48.0,
    color: "#a855f7",
    fuelRate: 8.9,
    co2Rate: 185,
    v2xStatus: "CONNECTED",
  },
  {
    id: "V9",
    plate: "TN-38-MTC-552",
    type: "motorcycle",
    sourceId: "I4",
    targetId: "I5",
    roadName: "Brookefields - Sukrawarpet Link",
    progress: 0.55,
    speedKmh: 44.0,
    color: "#f43f5e",
    fuelRate: 2.4,
    co2Rate: 48,
    v2xStatus: "CONNECTED",
  },
  {
    id: "V10",
    plate: "TN-38-AMB-108",
    type: "ambulance",
    sourceId: "I5",
    targetId: "I4",
    roadName: "Thadagam Rd → Town Hall",
    progress: 0.20,
    speedKmh: 64.0,
    color: "#ef4444",
    fuelRate: 9.5,
    co2Rate: 0,
    v2xStatus: "PREEMPTION_ACTIVE",
  },
  {
    id: "V11",
    plate: "TN-38-CAB-8001",
    type: "sedan",
    sourceId: "I2",
    targetId: "I1",
    roadName: "DB Road → Cross Cut Rd",
    progress: 0.88,
    speedKmh: 39.0,
    color: "#eab308",
    fuelRate: 6.1,
    co2Rate: 125,
    v2xStatus: "CONNECTED",
  },
  {
    id: "V12",
    plate: "TN-37-BUS-11B",
    type: "bus",
    sourceId: "I5",
    targetId: "I3",
    roadName: "Ganapathy - Peelamedu Corridor",
    progress: 0.62,
    speedKmh: 35.0,
    color: "#059669",
    fuelRate: 23.5,
    co2Rate: 305,
    v2xStatus: "CONNECTED",
  },
];

/**
 * Returns the SVG vehicle icon HTML based on vehicle type and direction.
 */
export function getVehicleMarkerHtml(
  v: SimulatedVehicle,
  angleDeg: number
): string {
  const isEmergency = v.type === "ambulance" || v.type === "police";

  let iconGlyph = "🚗";
  if (v.type === "ambulance") iconGlyph = "🚑";
  else if (v.type === "police") iconGlyph = "🚓";
  else if (v.type === "bus") iconGlyph = "🚌";
  else if (v.type === "truck") iconGlyph = "🚛";
  else if (v.type === "suv") iconGlyph = "🚙";
  else if (v.type === "motorcycle") iconGlyph = "🏍️";

  return `
    <div style="
      position: relative;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transform: translate(-50%, -50%);
    ">
      ${
        isEmergency
          ? `
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid ${v.type === 'ambulance' ? '#ef4444' : '#3b82f6'};
          background: ${v.type === 'ambulance' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.35)'};
          box-shadow: 0 0 16px ${v.type === 'ambulance' ? '#ef4444' : '#3b82f6'};
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      `
          : ""
      }
      <div style="
        width: 28px;
        height: 28px;
        background: #0f172a;
        border: 2px solid ${isEmergency ? (v.type === 'ambulance' ? '#ef4444' : '#3b82f6') : v.color};
        box-shadow: 0 2px 10px rgba(0,0,0,0.8), 0 0 8px ${v.color}80;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        z-index: 2;
        transition: transform 0.2s ease;
      ">
        ${iconGlyph}
      </div>
      <div style="
        position: absolute;
        bottom: -13px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        font-family: monospace;
        font-size: 8px;
        font-weight: 800;
        color: #ffffff;
        padding: 0 3px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.9);
        z-index: 3;
      ">
        ${Math.round(v.speedKmh)} km/h
      </div>
    </div>
  `;
}

/**
 * Creates rich popup HTML for a moving vehicle.
 */
export function getVehiclePopupHtml(v: SimulatedVehicle): string {
  const isEmergency = v.type === "ambulance" || v.type === "police";

  return `
    <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #f8fafc; padding: 4px; min-width: 210px;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 6px;">
        <span style="font-weight: 800; font-size: 13px; color: ${isEmergency ? '#f43f5e' : '#38bdf8'}; font-family: monospace;">
          ${v.plate}
        </span>
        <span style="background: ${isEmergency ? '#881337' : '#1e293b'}; color: ${isEmergency ? '#fda4af' : '#94a3b8'}; font-size: 9px; padding: 1px 5px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">
          ${v.type}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #cbd5e1;">
        <div><strong>Corridor:</strong> <span style="color: #93c5fd;">${v.roadName}</span></div>
        <div><strong>Live Speed:</strong> <span style="color: #34d399; font-weight: 700; font-family: monospace;">${v.speedKmh.toFixed(1)} km/h</span></div>
        <div><strong>Segment Progress:</strong> <span style="font-family: monospace;">${Math.round(v.progress * 100)}%</span></div>
        <div style="display: flex; justify-content: space-between; margin-top: 2px;">
          <span><strong>V2X Mesh:</strong></span>
          <span style="color: ${v.v2xStatus === 'PREEMPTION_ACTIVE' ? '#22c55e' : '#38bdf8'}; font-weight: 700; font-size: 10px;">
            ${v.v2xStatus === 'PREEMPTION_ACTIVE' ? '⚡ PREEMPTION ACTIVE' : '📡 5.9 GHz SYNC'}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; border-top: 1px dashed #334155; padding-top: 3px; margin-top: 3px;">
          <span>CO₂ Rate: <strong style="color: #f1f5f9;">${v.co2Rate} g/km</strong></span>
          <span>Economy: <strong style="color: #f1f5f9;">${v.fuelRate} ${v.co2Rate === 0 ? 'kWh' : 'L'}/100km</strong></span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Step vehicles forward in time by deltaSeconds.
 */
export function stepVehicles(
  vehicles: SimulatedVehicle[],
  deltaSeconds: number = 0.5,
  speedMultiplier: number = 1.0,
  nodeCoords: Record<string, { lat: number; lon: number }> = COIMBATORE_NODES
): SimulatedVehicle[] {
  return vehicles.map((v) => {
    // Distance progress advancement
    const speedMs = (v.speedKmh * 1000) / 3600;
    // Typical road distance ~ 2.5 km (2500m)
    const stepDelta = (speedMs * deltaSeconds * speedMultiplier) / 2500;
    let newProgress = v.progress + stepDelta;
    let newSource = v.sourceId;
    let newTarget = v.targetId;
    let newRoadName = v.roadName;

    if (newProgress >= 1.0) {
      newProgress = 0.0;
      newSource = v.targetId;
      const neighbors = COIMBATORE_CONNECTED_GRAPH[newSource] || ["I1"];
      // Pick a random next neighbor different from previous source if possible
      const validNext = neighbors.filter((n) => n !== v.sourceId);
      newTarget = validNext.length > 0 ? validNext[Math.floor(Math.random() * validNext.length)] : neighbors[0];
      const key = `${newSource}-${newTarget}`;
      newRoadName = COIMBATORE_ROAD_NAMES[key] || `${newSource} → ${newTarget} Link`;
    }

    return {
      ...v,
      sourceId: newSource,
      targetId: newTarget,
      roadName: newRoadName,
      progress: newProgress,
    };
  });
}

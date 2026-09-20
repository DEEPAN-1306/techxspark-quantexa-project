import {
  HealthCheckResponse,
  TrafficNode,
  TrafficEdge,
  LiveMetrics,
  OptimizationRun,
  EmergencyCorridor,
  Incident,
  SimulationState,
  AnalyticsData,
  Intersection,
  IntersectionRoad,
  TrafficSignal,
  NetworkGraphData,
  TrafficSummaryData,
  SimulationEngineStatus,
  TrafficIntensity,
  SignalsTelemetryResponse,
} from "../types";

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API error (${res.status}): ${errorBody}`);
    }

    return res.json();
  }

  static async getHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>("/api/health");
  }

  static async getTrafficNodes(): Promise<TrafficNode[]> {
    return this.request<TrafficNode[]>("/api/traffic/nodes");
  }

  static async getTrafficEdges(): Promise<TrafficEdge[]> {
    return this.request<TrafficEdge[]>("/api/traffic/edges");
  }

  static async getLiveMetrics(): Promise<LiveMetrics> {
    return this.request<LiveMetrics>("/api/traffic/live-metrics");
  }

  static async getQuantumStatus(): Promise<any> {
    return this.request<any>("/api/quantum/status");
  }

  static async getOptimizationHistory(): Promise<OptimizationRun[]> {
    return this.request<OptimizationRun[]>("/api/quantum/history");
  }

  static async triggerOptimization(params: {
    algorithm: string;
    backend: string;
    p_steps?: number;
    shots?: number;
  }): Promise<any> {
    return this.request<any>("/api/quantum/optimize", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async getEmergencyCorridors(): Promise<EmergencyCorridor[]> {
    return this.request<EmergencyCorridor[]>("/api/emergency/corridors");
  }

  static async toggleEmergencyCorridor(corridor_id: string, active: boolean): Promise<EmergencyCorridor> {
    return this.request<EmergencyCorridor>("/api/emergency/toggle", {
      method: "POST",
      body: JSON.stringify({ corridor_id, active }),
    });
  }

  static async getIncidents(): Promise<Incident[]> {
    return this.request<Incident[]>("/api/incidents");
  }

  static async getSimulationState(): Promise<SimulationState> {
    return this.request<SimulationState>("/api/simulation/state");
  }

  static async controlSimulation(action: "play" | "pause" | "reset", speed: number = 1.0): Promise<SimulationState> {
    return this.request<SimulationState>("/api/simulation/control", {
      method: "POST",
      body: JSON.stringify({ action, speed }),
    });
  }

  static async getAnalyticsSummary(): Promise<AnalyticsData> {
    return this.request<AnalyticsData>("/api/analytics/summary");
  }

  // Phase 2: Multi-Intersection Traffic Network
  static async getIntersections(): Promise<Intersection[]> {
    return this.request<Intersection[]>("/api/intersections");
  }

  static async getIntersectionById(id: string): Promise<Intersection> {
    return this.request<Intersection>(`/api/intersections/${id}`);
  }

  static async getTrafficData(): Promise<TrafficSummaryData> {
    return this.request<TrafficSummaryData>("/api/traffic");
  }

  static async getSignals(): Promise<TrafficSignal[]> {
    return this.request<TrafficSignal[]>("/api/signals");
  }

  static async getNetworkGraph(): Promise<NetworkGraphData> {
    return this.request<NetworkGraphData>("/api/network");
  }

  // Phase 3: Real-Time Traffic Simulation APIs
  static async startSimulation(): Promise<SimulationEngineStatus> {
    return this.request<SimulationEngineStatus>("/api/simulation/start", {
      method: "POST",
    });
  }

  static async pauseSimulation(): Promise<SimulationEngineStatus> {
    return this.request<SimulationEngineStatus>("/api/simulation/pause", {
      method: "POST",
    });
  }

  static async resetSimulation(): Promise<SimulationEngineStatus> {
    return this.request<SimulationEngineStatus>("/api/simulation/reset", {
      method: "POST",
    });
  }

  static async getSimulationStatus(): Promise<SimulationEngineStatus> {
    return this.request<SimulationEngineStatus>("/api/simulation/status");
  }

  static async setSimulationSpeed(speed: number): Promise<SimulationEngineStatus> {
    return this.request<SimulationEngineStatus>("/api/simulation/speed", {
      method: "POST",
      body: JSON.stringify({ speed }),
    });
  }

  static async setTrafficIntensity(intensity: TrafficIntensity, custom_rate?: number): Promise<SimulationEngineStatus> {
    return this.request<SimulationEngineStatus>("/api/simulation/intensity", {
      method: "POST",
      body: JSON.stringify({ intensity, custom_rate }),
    });
  }

  // Phase 4: Adaptive Traffic Signal Control APIs
  static async getSignalsTelemetry(): Promise<SignalsTelemetryResponse> {
    return this.request<SignalsTelemetryResponse>("/api/signals");
  }

  static async setAdaptiveSignals(intersection_id?: string): Promise<SignalsTelemetryResponse> {
    return this.request<SignalsTelemetryResponse>("/api/signals/adaptive", {
      method: "POST",
      body: JSON.stringify({ intersection_id }),
    });
  }

  static async setManualSignals(payload: {
    intersection_id?: string;
    green_time?: number;
    yellow_time?: number;
    all_red_time?: number;
  }): Promise<SignalsTelemetryResponse> {
    return this.request<SignalsTelemetryResponse>("/api/signals/manual", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Phase 5: QUBO Formulation APIs
  static async buildQUBO(params?: import("../types").QUBOBuildRequest): Promise<import("../types").QUBOModelResponse> {
    return this.request<import("../types").QUBOModelResponse>("/api/quantum/qubo", {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  static async getLatestQUBO(): Promise<import("../types").QUBOModelResponse> {
    return this.request<import("../types").QUBOModelResponse>("/api/quantum/qubo/latest");
  }

  // Phase 6: QAOA Quantum Optimization Engine APIs
  static async runQAOA(params?: import("../types").QAOARequest): Promise<import("../types").QAOAResultResponse> {
    return this.request<import("../types").QAOAResultResponse>("/api/quantum/qaoa", {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  static async getQAOAStatus(): Promise<import("../types").QAOAStatusResponse> {
    return this.request<import("../types").QAOAStatusResponse>("/api/quantum/status");
  }

  // Phase 7: Quantum-Optimized Traffic Signals APIs
  static async runNetworkQAOA(params?: {
    p_steps?: number;
    shots?: number;
    weights?: any;
    penalties?: any;
    traffic_states?: any;
  }): Promise<import("../types").NetworkQAOAResult> {
    return this.request<import("../types").NetworkQAOAResult>("/api/quantum/optimize-network", {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  static async applyOptimizedSignals(timingsData?: any): Promise<import("../types").ApplyOptimizedSignalsResponse> {
    return this.request<import("../types").ApplyOptimizedSignalsResponse>("/api/quantum/apply-signals", {
      method: "POST",
      body: JSON.stringify({ timings: timingsData }),
    });
  }

  static async runControlledBenchmark(
    durationSec: number = 60,
    timingsData?: any,
  ): Promise<import("../types").ControlledBenchmarkResponse> {
    return this.request<import("../types").ControlledBenchmarkResponse>("/api/quantum/benchmark", {
      method: "POST",
      body: JSON.stringify({ duration_sec: durationSec, timings: timingsData }),
    });
  }

  // Phase 8: Emergency Green Corridor APIs
  static async createEmergency(params: {
    vehicle_id: string;
    type: string;
    start: string;
    destination: string;
    priority: string;
  }): Promise<import("../types").EmergencyRoutePlan> {
    return this.request<import("../types").EmergencyRoutePlan>("/api/emergency/create", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async activateEmergency(params?: {
    vehicle_id?: string;
  }): Promise<any> {
    return this.request<any>("/api/emergency/activate", {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  static async getEmergencyStatus(): Promise<import("../types").EmergencyStatusResponse> {
    return this.request<import("../types").EmergencyStatusResponse>("/api/emergency/status");
  }

  static async stepEmergency(delta_sec: number = 1.0): Promise<import("../types").EmergencyStatusResponse> {
    return this.request<import("../types").EmergencyStatusResponse>("/api/emergency/step", {
      method: "POST",
      body: JSON.stringify({ delta_sec }),
    });
  }

  static async completeEmergency(params?: {
    vehicle_id?: string;
  }): Promise<any> {
    return this.request<any>("/api/emergency/complete", {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  // Phase 9: Dynamic Event Management APIs
  static async triggerEvent(payload: import("../types").TriggerEventPayload): Promise<any> {
    return this.request<any>("/api/events/trigger", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async resolveEvent(eventId: string): Promise<any> {
    return this.request<any>("/api/events/resolve", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId }),
    });
  }

  static async getActiveEvents(): Promise<import("../types").TrafficEvent[]> {
    return this.request<import("../types").TrafficEvent[]>("/api/events/active");
  }

  static async getEventHistory(limit: number = 50): Promise<import("../types").TrafficEvent[]> {
    return this.request<import("../types").TrafficEvent[]>(`/api/events/history?limit=${limit}`);
  }

  // Phase 9b: Autonomous AI Incident Detection Sentinel
  static async getAutoDetectStatus(): Promise<{
    status: string;
    enabled: boolean;
    thresholds: { queue_critical: number; speed_min_kmh: number; congestion_ratio: number };
    stats: { total_scans: number; incidents_detected: number; incidents_auto_cleared: number; last_scan_time: string };
    active_auto_detected_count: number;
    active_auto_detected_events: import("../types").TrafficEvent[];
    total_monitored_nodes: number;
    total_monitored_corridors: number;
    scanner_health: string;
  }> {
    return this.request<any>("/api/events/autodetect/status");
  }

  static async toggleAutoDetect(enabled?: boolean, thresholds?: any): Promise<any> {
    return this.request<any>("/api/events/autodetect/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled, thresholds }),
    });
  }

  static async triggerAutoDetectScan(force: boolean = true): Promise<any> {
    return this.request<any>("/api/events/scan", {
      method: "POST",
      body: JSON.stringify({ force }),
    });
  }

  // Phase 10: Environmental Analysis APIs
  static async getEnvironmentalAnalysis(configOverride?: Partial<import("../types").EnvironmentalConfig>): Promise<import("../types").EnvironmentalAnalysisResponse> {
    if (configOverride && Object.keys(configOverride).length > 0) {
      return this.request<import("../types").EnvironmentalAnalysisResponse>("/api/environmental/analysis", {
        method: "POST",
        body: JSON.stringify(configOverride),
      });
    }
    return this.request<import("../types").EnvironmentalAnalysisResponse>("/api/environmental/analysis");
  }

  static async updateEnvironmentalConfig(configData: Partial<import("../types").EnvironmentalConfig>): Promise<any> {
    return this.request<any>("/api/environmental/config", {
      method: "POST",
      body: JSON.stringify(configData),
    });
  }

  static async getEnvironmentalConfig(): Promise<{ status: string; config: import("../types").EnvironmentalConfig }> {
    return this.request<{ status: string; config: import("../types").EnvironmentalConfig }>("/api/environmental/config");
  }

  // Phase 11: Classical vs Quantum Comparison APIs
  static async getComparisonScenarios(): Promise<{ scenarios: import("../types").ComparisonScenario[] }> {
    return this.request<{ scenarios: import("../types").ComparisonScenario[] }>("/api/comparison/scenarios");
  }

  static async getLatestComparison(): Promise<import("../types").ComparisonRunResponse> {
    return this.request<import("../types").ComparisonRunResponse>("/api/comparison/latest");
  }

  static async runComparison(payload?: {
    scenario_id?: string;
    custom_params?: Partial<import("../types").ComparisonScenario>;
  }): Promise<import("../types").ComparisonRunResponse> {
    return this.request<import("../types").ComparisonRunResponse>("/api/comparison/run", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  }

  // Automated YOLOv8 Traffic Perception APIs
  static async getYoloStatus(): Promise<import("../types").YoloStatusResponse> {
    return this.request<import("../types").YoloStatusResponse>("/api/vision/yolo/status");
  }

  static async getYoloDetections(intersectionId?: string): Promise<import("../types").YoloDetectionResponse> {
    const url = intersectionId
      ? `/api/vision/yolo/detections?intersection_id=${intersectionId}`
      : "/api/vision/yolo/detections";
    return this.request<import("../types").YoloDetectionResponse>(url);
  }

  static async syncYoloSimulation(): Promise<{
    synced_intersections_count: number;
    total_vision_vehicles: number;
    emergency_preemptions_triggered: string[];
    message: string;
  }> {
    return this.request<any>("/api/vision/yolo/sync", {
      method: "POST",
    });
  }

  static async toggleYoloAuto(enabled: boolean): Promise<{
    status: string;
    automated_mode_active: boolean;
  }> {
    return this.request<any>("/api/vision/yolo/toggle_auto", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    });
  }
}

export const TrafficAPI = ApiService;
export default ApiService;


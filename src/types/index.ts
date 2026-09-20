export type PageId =
  | "dashboard"
  | "yolo-vision"
  | "live-traffic"
  | "traffic-network"
  | "quantum-optimizer"
  | "emergency-corridor"
  | "events-incidents"
  | "simulation"
  | "analytics"
  | "classical-vs-quantum"
  | "optimization-history"
  | "environmental"
  | "documentation"
  | "settings";

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  timestamp: number;
  database: {
    status: string;
    engine: string;
    file: string;
    tables_found?: number;
    connected: boolean;
  };
  quantum_backend: {
    status: string;
    provider: string;
    active_qubits: number;
    fidelity?: string;
  };
  modules_loaded: string[];
}

export interface TrafficNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  node_type: "intersection" | "highway_ramp" | "emergency_hub" | "transit_center";
  signal_state: "ADAPTIVE" | "GREEN_NS" | "GREEN_EW" | "HOLD";
  cycle_time_sec: number;
  qubit_assigned: number;
  current_load: number;
}

export interface TrafficEdge {
  id: string;
  source_id: string;
  target_id: string;
  street_name: string;
  distance_km: number;
  speed_limit_kmh: number;
  capacity_vph: number;
  current_flow_vph: number;
  density_percentage: number;
  congestion_level: "LOW" | "MODERATE" | "HEAVY" | "CRITICAL";
  quantum_weight: number;
}

export interface LiveMetrics {
  total_nodes: number;
  total_edges: number;
  total_flow_vph: number;
  avg_density_percentage: number;
  critical_segments_count: number;
  average_network_speed_kmh: number;
  quantum_readiness_score: number;
  active_adaptive_signals: number;
}

export interface OptimizationRun {
  id: string;
  timestamp: string;
  algorithm: string;
  backend_name: string;
  qubits_used: number;
  circuit_depth: number;
  execution_time_ms: number;
  cost_value: number;
  congestion_reduction_pct: number;
  co2_saved_kg: number;
  status: string;
}

export interface EmergencyCorridor {
  id: string;
  name: string;
  source_node_id: string;
  target_node_id: string;
  active: boolean;
  priority_level: "AMBULANCE" | "FIRE" | "POLICE" | "VIP";
  eta_minutes: number;
  green_wave_active: boolean;
  nodes_sequence: string[];
}

export interface Incident {
  id: string;
  title: string;
  incident_type: "ACCIDENT" | "ROADWORK" | "WEATHER" | "STADIUM_EVENT";
  severity: "MINOR" | "MODERATE" | "SEVERE" | "CRITICAL";
  latitude: number;
  longitude: number;
  affected_edge_id?: string;
  status: "ACTIVE" | "INVESTIGATING" | "CLEARED";
  reported_at: string;
}

export interface SimulationState {
  step: number;
  running: boolean;
  speed: number;
  active_vehicles: number;
  throughput_vpm: number;
  average_delay_sec: number;
}

export interface AnalyticsData {
  kpi: {
    total_co2_reduction_tons: number;
    average_commute_savings_min: number;
    fuel_saved_liters: number;
    emergency_response_gain_pct: number;
    quantum_fidelity_score: number;
  };
  time_series: Array<{
    time: string;
    classical_delay_sec: number;
    quantum_delay_sec: number;
    savings_pct: number;
    vehicles_processed: number;
  }>;
}

// Phase 2: Multi-Intersection Traffic Network
export type CongestionLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DensityLevel = CongestionLevel | string;

export interface Intersection {
  id: string; // I1, I2, I3, I4, I5, I6
  name: string;
  latitude: number;
  longitude: number;
  vehicle_density: CongestionLevel;
  queue_length: number;
  road_capacity: number; // vehicles/min
  average_speed: number; // km/h
  current_signal_phase: string;
  green_time: number; // sec
  yellow_time: number; // sec
  red_time: number; // sec
  pedestrian_count: number;
  congestion_level: CongestionLevel;
  created_at?: string;
  connected_roads?: IntersectionRoad[];
  neighbor_ids?: string[];
}

export interface IntersectionRoad {
  id: string;
  source_id: string;
  target_id: string;
  street_name: string;
  distance_km: number;
  speed_limit_kmh: number;
  road_capacity: number;
  current_flow: number;
  congestion_level: CongestionLevel;
}

export interface TrafficSignal {
  intersection_id: string;
  name: string;
  current_signal_phase: string;
  green_time_sec: number;
  yellow_time_sec: number;
  red_time_sec: number;
  cycle_time_sec: number;
  pedestrian_count: number;
  congestion_level: CongestionLevel;
  light_status: {
    red: boolean;
    yellow: boolean;
    green: boolean;
  };
  active_corridor_direction: string;
}

export interface NetworkGraphData {
  node_count: number;
  edge_count: number;
  is_connected: boolean;
  graph_density: number;
  intersections: Intersection[];
  roads: IntersectionRoad[];
  topology: Record<string, string[]>;
  shortest_paths: Record<string, { source: string; target: string; path: string[] }>;
  networkx_version: string;
}

export interface TrafficSummaryData {
  intersections: Intersection[];
  roads: IntersectionRoad[];
  summary: {
    total_intersections: number;
    total_connected_roads: number;
    total_queue_vehicles: number;
    average_speed_kmh: number;
    total_road_capacity_vpm: number;
    critical_intersections_count: number;
    high_intersections_count: number;
    network_congestion_status: string;
  };
}

// Phase 3: Real-Time Traffic Simulation Types
export type TrafficIntensity = "LOW" | "MEDIUM" | "HIGH" | "CUSTOM";
export type SimulationSpeed = 1 | 2 | 5 | 10;

export interface RealTimeSimulationKPIs {
  average_waiting_time: number; // seconds
  total_queue_length: number;   // queued vehicles across network
  traffic_throughput: number;   // vehicles/min
  average_speed: number;        // km/h
  fuel_consumption: number;     // liters
  co2_estimate: number;         // kg CO2
}

export interface SimulationHistoryEntry {
  timestamp: number;
  waiting_time: number;
  queue_length: number;
  throughput: number;
  speed: number;
  co2: number;
}

export interface SimulationEngineStatus {
  sim_time: number;
  is_running: boolean;
  speed_multiplier: number;
  traffic_intensity: TrafficIntensity;
  custom_rate: number;
  step_count: number;
  kpis: RealTimeSimulationKPIs;
  intersections: Intersection[];
  roads: IntersectionRoad[];
  history: SimulationHistoryEntry[];
}

// Phase 4: Adaptive Traffic Signal Control Types
export type SignalControlMode = "ADAPTIVE" | "FIXED" | "QUANTUM_OPTIMIZED";
export type SignalPhaseState =
  | "North-South GREEN"
  | "North-South YELLOW"
  | "East-West GREEN"
  | "East-West YELLOW"
  | "ALL RED";

export interface LightHeadState {
  red: boolean;
  yellow: boolean;
  green: boolean;
}

export interface AdaptiveTimingRecommendation {
  calculated_green_time: number;
  base_green_time: number;
  density_modifier: number;
  pedestrian_modifier: number;
  speed_modifier: number;
  capacity_modifier: number;
  neighbor_modifier: number;
  applied_min_limit: boolean;
  applied_max_limit: boolean;
  rule_trigger: string;
  rationale: string;
}

export interface DetailedTrafficSignal {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  vehicle_density: DensityLevel;
  queue_length: number;
  road_capacity: number;
  average_speed: number;
  current_signal_phase: SignalPhaseState | string;
  remaining_time_sec: number;
  phase_elapsed_sec: number;
  phase_total_duration: number;
  green_time: number;
  yellow_time: number;
  red_time: number;
  all_red_time: number;
  cycle_time: number;
  capacity?: number;
  pedestrian_count: number;
  congestion_level: CongestionLevel;
  waiting_time_avg: number;
  throughput_vpm: number;
  phase_state: string;
  control_mode: SignalControlMode;
  light_status: LightHeadState;
  light_status_ns: LightHeadState;
  light_status_ew: LightHeadState;
  active_corridor_direction: string;
  adaptive_recommendation?: AdaptiveTimingRecommendation;
  fixed_timing?: {
    green_time: number;
    yellow_time: number;
    all_red_time: number;
  };
}

export interface PerformanceMethodMetrics {
  waiting_time: number;
  queue_length: number;
  throughput: number;
  average_speed: number;
  co2: number;
  fuel: number;
  samples_count: number;
}

export interface SignalComparisonSummary {
  fixed: PerformanceMethodMetrics;
  adaptive: PerformanceMethodMetrics;
  improvement: {
    waiting_time_reduction_pct: number;
    queue_reduction_pct: number;
    throughput_gain_pct: number;
    speed_gain_pct: number;
    co2_reduction_pct: number;
    fuel_reduction_pct: number;
  };
}

export interface SignalsTelemetryResponse {
  mode: SignalControlMode;
  signals: DetailedTrafficSignal[];
  comparison: SignalComparisonSummary;
}

// Phase 5: QUBO Formulation for Traffic Signal Optimization
export interface QUBOVariable {
  index: number;
  id: string; // x1, x2, x3, x4, x5, x6
  name: string; // e.g. "North-South green 20 sec"
  code: string;
  direction: "North-South" | "East-West" | string;
  direction_code: "NS" | "EW" | string;
  duration_sec: number;
  intersection_id: string;
}

export interface QUBOObjectiveWeights {
  waiting: number; // w1: waiting time
  queue: number; // w2: queue length
  congestion: number; // w3: congestion
  fuel: number; // w4: fuel consumption
  co2: number; // w5: CO2 emissions
  emergency: number; // w6: emergency delay
  switching: number; // w7: unnecessary signal switching
}

export interface QUBOPenalties {
  one_hot: number;
  conflict: number;
  min_green: number;
  max_green: number;
  pedestrian: number;
  emergency_priority: number;
}

export interface QUBOObjectiveBreakdownItem {
  var: string;
  name: string;
  waiting_metric: number;
  queue_metric: number;
  congestion_metric: number;
  fuel_metric: number;
  co2_metric: number;
  emergency_metric: number;
  switching_metric: number;
  total_linear_cost: number;
}

export interface QUBOOptimalSolution {
  binary_vector: number[];
  assignments: Array<{
    variable: string;
    name: string;
    selected: boolean;
    direction: string;
    duration_sec: number;
  }>;
  minimum_energy: number;
  selected_ns: string;
  selected_ew: string;
}

export interface QUBOIsingRepresentation {
  h: number[];
  J: Record<string, number>;
  offset: number;
  num_spins: number;
  ising_equation: string;
}

export interface QUBOModelResponse {
  status: string; // "FORMULATED"
  num_variables: number;
  variables: QUBOVariable[];
  q_matrix: number[][];
  q_dict: Record<string, number>;
  constant_offset: number;
  ising: QUBOIsingRepresentation;
  weights: QUBOObjectiveWeights;
  penalties: QUBOPenalties;
  penalties_detail: Record<string, any>;
  objective_breakdown: QUBOObjectiveBreakdownItem[];
  traffic_inputs: {
    queue_ns: number;
    queue_ew: number;
    capacity_ns: number;
    capacity_ew: number;
    pedestrian_ns: number;
    pedestrian_ew: number;
    current_phase: string;
    emergency_active: boolean;
    emergency_corridor: string | null;
  };
  optimal_solution: QUBOOptimalSolution;
  total_feasible_states: number;
  intersection_id: string;
}

export interface QUBOBuildRequest {
  intersection_id?: string;
  weights?: Partial<QUBOObjectiveWeights>;
  penalties?: Partial<QUBOPenalties>;
  traffic_state?: {
    queue_ns?: number;
    queue_ew?: number;
    queue_length?: number;
    road_capacity_ns?: number;
    road_capacity_ew?: number;
    pedestrian_ns?: number;
    pedestrian_ew?: number;
    current_signal_phase?: string;
    emergency_active?: boolean;
    emergency_corridor?: string | null;
  };
}

// Phase 6: QAOA Quantum Optimization Engine Types
export interface QAOAHilbertCandidate {
  bitstring: string;
  count: number;
  probability: number;
  objective_value: number;
}

export interface QAOAGateBreakdown {
  hadamard_gates: number;
  rzz_entangling_gates: number;
  rz_phase_gates: number;
  rx_mixer_gates: number;
  measurement_gates: number;
}

export interface QAOACircuitLayer {
  layer_index: number;
  name: string;
  type: string;
  parameter?: string;
  rz_gates?: number;
  rzz_gates?: number;
  rx_gates?: number;
  description: string;
  qubits_affected?: number[];
}

export interface QAOACircuitSpec {
  num_qubits: number;
  layers_p: number;
  gamma: number[];
  beta: number[];
  circuit_depth: number;
  total_gates: number;
  gate_breakdown: QAOAGateBreakdown;
  ascii_diagram: string;
  circuit_layers: QAOACircuitLayer[];
}

export interface QAOASignalTimings {
  north_south_green_sec: number;
  east_west_green_sec: number;
  yellow_time_sec: number;
  all_red_clearance_sec: number;
  total_cycle_time_sec: number;
  split_ratio: string;
}

export interface QAOAResultResponse {
  status: string;
  algorithm: "QAOA" | string;
  backend: string; // e.g. "Qiskit Aer Simulator" or "Quantum Simulation Fallback"
  is_fallback: boolean;
  backend_detail: string;
  best_bitstring: string;
  objective_value: number;
  execution_time_ms: number;
  number_of_qubits: number;
  circuit_depth: number;
  layers_p: number;
  shots: number;
  measurement_counts: Record<string, number>;
  top_histogram: QAOAHilbertCandidate[];
  signal_timings: QAOASignalTimings;
  decoded_solution: {
    bitstring: string;
    assignments: Array<{
      variable: string;
      name: string;
      selected: boolean;
      direction: string;
      duration_sec: number;
    }>;
    is_feasible: boolean;
    signal_timings: QAOASignalTimings;
    selected_ns_phase: string;
    selected_ew_phase: string;
  };
  circuit_specification: QAOACircuitSpec;
  intersection_id: string;
  qubo_offset: number;
  workflow_steps: Array<{
    step: number;
    name: string;
    status: string;
  }>;
}

export interface QAOARequest {
  intersection_id?: string;
  p_steps?: number;
  shots?: number;
  traffic_state?: any;
  weights?: Partial<QUBOObjectiveWeights>;
  penalties?: Partial<QUBOPenalties>;
  qubo_data?: any;
}

export interface QAOAStatusResponse {
  status: string;
  qiskit_available: boolean;
  backend_name: string;
  is_fallback: boolean;
  available_qubits: number;
  supported_p_depth: number[];
  default_shots: number;
  simulated_architecture: string;
}

// Phase 7: Quantum-Optimized Traffic Signals
export interface QuantumTimingComparisonRow {
  id: string;
  intersection: string;
  name: string;
  current_timing: string;
  current_green_sec: number;
  quantum_timing: string;
  quantum_green_sec: number;
  north_south_green_sec: number;
  east_west_green_sec: number;
  yellow_time_sec: number;
  all_red_clearance_sec: number;
  cycle_time_sec: number;
  split_ratio: string;
  difference_sec: number;
  difference_formatted: string;
  best_bitstring: string;
  objective_value: number;
  qubits: number;
  depth: number;
}

export interface NetworkQAOAResult {
  status: string;
  algorithm: string;
  backend: string;
  is_fallback: boolean;
  total_intersections: number;
  execution_time_ms: number;
  layers_p: number;
  shots: number;
  total_network_qubits: number;
  max_circuit_depth: number;
  average_objective_value: number;
  comparison_table: QuantumTimingComparisonRow[];
  intersections: QuantumTimingComparisonRow[];
  per_intersection: Record<string, QAOAResultResponse>;
  workflow: Array<{
    step: number;
    name: string;
    status: string;
  }>;
}

export interface ApplyOptimizedSignalsResponse {
  status: string;
  message: string;
  mode: string;
  applied_intersections: Array<{
    intersection_id: string;
    name: string;
    applied_quantum_green_sec: number;
    ns_green_sec: number;
    ew_green_sec: number;
    cycle_time_sec: number;
    status: string;
  }>;
  signals: DetailedTrafficSignal[];
}

export interface ControlledBenchmarkMetrics {
  waiting_time_sec: number;
  queue_length: number;
  throughput_vpm: number;
  fuel_consumed_liters: number;
  co2_emissions_kg: number;
}

export interface ControlledBenchmarkImprovements {
  waiting_time_pct: number;
  queue_pct: number;
  throughput_pct: number;
  fuel_pct: number;
  co2_pct: number;
}

export interface ControlledBenchmarkTimelinePoint {
  time_sec: number;
  waiting_time: number;
  queue_length: number;
  throughput: number;
}

export interface ControlledBenchmarkResponse {
  status: string;
  duration_sec: number;
  signal_mode_active: string;
  before: ControlledBenchmarkMetrics;
  after: ControlledBenchmarkMetrics;
  improvements: ControlledBenchmarkImprovements;
  timeline: {
    before: ControlledBenchmarkTimelinePoint[];
    after: ControlledBenchmarkTimelinePoint[];
  };
  simulation_affected: boolean;
  applied_timings: Array<{
    intersection_id: string;
    name: string;
    current_timing: string;
    quantum_timing: string;
  }>;
}

// Phase 8: Emergency Green Corridor Types
export type EmergencyVehicleType = "Ambulance" | "Fire Truck" | "Police";
export type EmergencyPriority = "CRITICAL" | "HIGH" | "MEDIUM";

export interface EmergencyIntersectionPreemption {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order_index: number;
  is_origin: boolean;
  is_destination: boolean;
  corridor_direction: string;
  corridor_phase: string;
  conflicting_phase: string;
  signal_status: string;
}

export interface EmergencyRouteSegment {
  from_id: string;
  to_id: string;
  street_name: string;
  distance_km: number;
  speed_limit_kmh: number;
  emergency_speed_kmh: number;
  travel_time_sec: number;
}

export interface EmergencyWaypoint {
  lat: number;
  lng: number;
  segment_from: string;
  segment_to: string;
}

export interface EmergencyRoutePlan {
  status: string;
  vehicle_id: string;
  vehicle_type: EmergencyVehicleType;
  start_location: string;
  start_id: string;
  destination: string;
  destination_id: string;
  priority: EmergencyPriority;
  route: string[];
  route_names: string[];
  distance_km: number;
  estimated_travel_time_sec: number;
  estimated_travel_time_formatted: string;
  intersections_on_route: EmergencyIntersectionPreemption[];
  segments: EmergencyRouteSegment[];
  waypoints: EmergencyWaypoint[];
  routing_algorithm: string;
  signals_to_preempt_count: number;
}

export interface EmergencyStatusResponse {
  status: "IDLE" | "ROUTE_CALCULATED" | "CORRIDOR_ACTIVE" | "IN_TRANSIT" | "ARRIVED" | "COMPLETED";
  active?: boolean;
  vehicle_id?: string;
  vehicle_type?: EmergencyVehicleType;
  priority?: EmergencyPriority;
  route?: string[];
  route_names?: string[];
  distance_km?: number;
  distance_remaining_km?: number;
  eta_seconds?: number;
  eta_formatted?: string;
  current_speed_kmh?: number;
  progress_pct?: number;
  current_waypoint_idx?: number;
  signals_prepared?: string;
  current_location?: {
    lat: number;
    lng: number;
    current_intersection: string;
    current_intersection_name: string;
    segment_from?: string;
    segment_to?: string;
  };
  intersections_on_route?: EmergencyIntersectionPreemption[];
  plan?: EmergencyRoutePlan;
  message?: string;
  resumed_mode?: string;
}

// Phase 9: Dynamic Event Management
export type DynamicEventType = "CONGESTION" | "ACCIDENT" | "ROAD_CLOSURE" | "EMERGENCY";
export type EventSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "SEVERE" | "MINOR" | "MODERATE";
export type EventStatus = "ACTIVE" | "RESOLVED";

export interface TrafficEvent {
  id: string;
  event_type: DynamicEventType;
  title: string;
  location: string;
  target_id: string;
  road_id?: string;
  intersection_id?: string;
  severity: EventSeverity;
  start_time: string;
  end_time?: string | null;
  status: EventStatus;
  impact_summary: string;
  is_auto_detected?: boolean;
  details?: Record<string, any>;
}

export interface TriggerCongestionPayload {
  event_type: "CONGESTION";
  intersection_id: string;
  road_id?: string;
  density_multiplier?: number;
  queue_surge?: number;
}

export interface TriggerAccidentPayload {
  event_type: "ACCIDENT";
  intersection_id: string;
  road_id: string;
  severity: "MINOR" | "MODERATE" | "SEVERE";
}

export interface TriggerRoadClosurePayload {
  event_type: "ROAD_CLOSURE";
  road_id: string;
  reason?: string;
  detour_start?: string;
  detour_dest?: string;
}

export interface TriggerEmergencyPayload {
  event_type: "EMERGENCY";
  vehicle_id: string;
  vehicle_type: EmergencyVehicleType;
  start: string;
  destination: string;
  priority: EmergencyPriority;
}

export type TriggerEventPayload =
  | TriggerCongestionPayload
  | TriggerAccidentPayload
  | TriggerRoadClosurePayload
  | TriggerEmergencyPayload;

// Phase 10: Environmental Analysis
export interface EnvironmentalConfig {
  idle_fuel_rate_lph: number;
  stop_penalty_fuel_liters: number;
  base_cruising_fuel_rate_l100km: number;
  optimal_speed_kmh: number;
  co2_emission_factor_kg_per_l: number;
  fuel_type: string;
  disclaimer: string;
}

export interface EnvironmentalCardMetric {
  title: string;
  unit: string;
  before: number;
  classical: number;
  quantum: number;
  estimated_change_pct: number;
  estimated_change_classical_pct?: number;
  disclaimer: string;
  description: string;
}

export interface EnvironmentalCards {
  fuel_consumption: EnvironmentalCardMetric;
  co2_emissions: EnvironmentalCardMetric;
  idle_time: EnvironmentalCardMetric;
  number_of_stops: EnvironmentalCardMetric;
}

export interface EnvironmentalComparativeBar {
  metric: string;
  before: number;
  classical: number;
  quantum: number;
}

export interface EnvironmentalTimeSeriesPoint {
  step: string;
  before: number;
  classical: number;
  quantum: number;
  unit: string;
}

export interface EnvironmentalAnalysisResponse {
  status: string;
  disclaimer: string;
  config: EnvironmentalConfig;
  cards: EnvironmentalCards;
  detailed_metrics: {
    before: any;
    classical: any;
    quantum: any;
  };
  charts: {
    comparative_bars: EnvironmentalComparativeBar[];
    time_series: EnvironmentalTimeSeriesPoint[];
  };
}

// Phase 11: Classical vs Quantum Comparison Types
export interface ComparisonScenario {
  id: string;
  name: string;
  description: string;
  duration_sec: number;
  intensity: string;
  seed: number;
  emergency_corridor?: string | null;
  active_incident?: any;
  traffic_multiplier?: number;
}

export interface MethodKPISet {
  avg_waiting_time_sec: number;
  avg_queue_length: number;
  throughput_veh_hr: number;
  total_vehicles_cleared: number;
  fuel_consumption_liters: number;
  fuel_consumption_l100km: number;
  co2_emissions_kg: number;
  co2_emissions_g_km: number;
  emergency_travel_time_sec: number | null;
  avg_speed_kmh: number;
  number_of_stops: number;
  stops_per_vehicle: number;
}

export interface ComparisonTableRow {
  metric: string;
  unit: string;
  fixed: number | string;
  rule_based: number | string;
  quantum_hybrid: number | string;
  better: "LOWER" | "HIGHER";
  quantum_vs_fixed_pct: number;
  quantum_vs_rule_pct: number;
}

export interface ComparisonTimeSeriesEntry {
  time_sec: number;
  fixed: {
    queue_length: number;
    waiting_time: number;
    speed: number;
    stops: number;
    throughput: number;
  };
  rule_based: {
    queue_length: number;
    waiting_time: number;
    speed: number;
    stops: number;
    throughput: number;
  };
  quantum_hybrid: {
    queue_length: number;
    waiting_time: number;
    speed: number;
    stops: number;
    throughput: number;
  };
}

export interface RadarDimension {
  subject: string;
  fixed: number;
  rule_based: number;
  quantum_hybrid: number;
}

export interface ComparisonRunResponse {
  status: string;
  title: string;
  label: string;
  disclaimer: string;
  is_simulation_result: boolean;
  timestamp: string;
  execution_time_ms: number;
  scenario: ComparisonScenario;
  kpi: {
    fixed: MethodKPISet;
    rule_based: MethodKPISet;
    quantum_hybrid: MethodKPISet;
  };
  table: ComparisonTableRow[];
  time_series: ComparisonTimeSeriesEntry[];
  radar: RadarDimension[];
  analysis: {
    neutral_findings: string[];
    metrics_evaluated_count: number;
    quantum_outperformed_fixed_count: number;
    quantum_speedup_ratio: number;
  };
}

// ==========================================
// Automated YOLOv8 Vision Perception Types
// ==========================================

export interface YoloDetectionBox {
  track_id: string;
  class_name: "car" | "truck" | "bus" | "motorcycle" | "emergency_ambulance" | "emergency_fire" | "emergency_police" | "pedestrian" | "bicycle";
  confidence: number;
  bbox_normalized: [number, number, number, number]; // [x, y, w, h] %
  bbox_pixels_1080p: [number, number, number, number]; // [x, y, w, h] px
  speed_kmh: number;
  is_queued: boolean;
  lane: string;
  color: string;
  is_emergency: boolean;
  vehicle_identifier?: string | null;
  badge?: string;
}

export interface YoloIntersectionFeed {
  camera_id: string;
  camera_name: string;
  location: string;
  total_vehicles_detected: number;
  queue_length_vehicles: number;
  average_speed_kmh: number;
  flow_rate_vpm: number;
  has_emergency_vehicle: boolean;
  lane_occupancy_pct: Record<string, number>;
  breakdown: {
    cars: number;
    trucks: number;
    buses: number;
    motorcycles: number;
    emergency: number;
  };
  detections: YoloDetectionBox[];
}

export interface YoloStatusResponse {
  status: string;
  model_name: string;
  version: string;
  framework: string;
  inference_speed_fps: number;
  inference_latency_ms: number;
  mAP_accuracy_pct: number;
  active_cctv_streams_count: number;
  total_frames_processed: number;
  total_vehicles_detected_cumulative: number;
  classes_supported: string[];
  hardware_accelerator: string;
  timestamp: number;
}

export interface YoloDetectionResponse {
  status: string;
  model: string;
  inference_timestamp: number;
  automated_mode_active: boolean;
  total_network_vehicles_detected: number;
  total_network_queue_vehicles: number;
  active_emergency_detections: Array<{
    intersection_id: string;
    intersection_name: string;
    vehicle_id: string;
    vehicle_type: string;
    confidence: number;
    speed_kmh: number;
    detected_at: number;
  }>;
  fps: number;
  latency_ms: number;
  intersections: Record<string, YoloIntersectionFeed>;
}



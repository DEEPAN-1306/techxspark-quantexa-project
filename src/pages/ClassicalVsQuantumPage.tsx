import React, { useState, useEffect, useCallback } from "react";
import {
  GitCompare,
  Cpu,
  Zap,
  Play,
  RotateCcw,
  Clock,
  Car,
  TrendingUp,
  Fuel,
  CloudRain,
  ShieldAlert,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  Layers,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { ApiService } from "../services/api";
import {
  ComparisonScenario,
  ComparisonRunResponse,
  ComparisonTableRow,
  ComparisonTimeSeriesEntry,
  RadarDimension,
} from "../types";
import { TechnicalTooltip } from "../components/TechnicalTooltip";

export const ClassicalVsQuantumPage: React.FC = () => {
  // Scenario state
  const [scenarios, setScenarios] = useState<ComparisonScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("morning_rush");
  const [durationSec, setDurationSec] = useState<number>(120);
  const [seed, setSeed] = useState<number>(42);
  const [trafficMultiplier, setTrafficMultiplier] = useState<number>(1.0);

  // Simulation execution state
  const [comparisonData, setComparisonData] = useState<ComparisonRunResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Visual tab state
  const [activeChartTab, setActiveChartTab] = useState<"bar" | "line" | "radar">("bar");
  const [lineChartMetric, setLineChartMetric] = useState<"queue_length" | "waiting_time" | "speed" | "stops" | "throughput">("queue_length");

  // Load scenarios and latest benchmark on mount
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [scenariosRes, latestRes] = await Promise.all([
        ApiService.getComparisonScenarios().catch(() => ({ scenarios: [] })),
        ApiService.getLatestComparison().catch(() => null),
      ]);

      if (scenariosRes.scenarios && scenariosRes.scenarios.length > 0) {
        setScenarios(scenariosRes.scenarios);
      }
      if (latestRes) {
        setComparisonData(latestRes);
        if (latestRes.scenario) {
          setSelectedScenarioId(latestRes.scenario.id);
          setDurationSec(latestRes.scenario.duration_sec || 120);
          setSeed(latestRes.scenario.seed || 42);
          setTrafficMultiplier(latestRes.scenario.traffic_multiplier || 1.0);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load simulation benchmark data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle running simulation comparison across all 3 methods
  const handleRunComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await ApiService.runComparison({
        scenario_id: selectedScenarioId,
        custom_params: {
          duration_sec: durationSec,
          seed: seed,
          traffic_multiplier: trafficMultiplier,
        },
      });
      setComparisonData(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute simulation run");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scId = e.target.value;
    setSelectedScenarioId(scId);
    const targetSc = scenarios.find((s) => s.id === scId);
    if (targetSc) {
      setDurationSec(targetSc.duration_sec || 120);
      setSeed(targetSc.seed || 42);
      setTrafficMultiplier(targetSc.traffic_multiplier || 1.0);
    }
  };

  const handleExportData = () => {
    if (!comparisonData) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(comparisonData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `simulation_comparison_${selectedScenarioId}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const kpi = comparisonData?.kpi;
  const table = comparisonData?.table || [];
  const timeSeries = comparisonData?.time_series || [];
  const radar = comparisonData?.radar || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto text-slate-100 pb-16">
      {/* 1. Header Banner & Scientific Label */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <GitCompare className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                  Classical vs. Quantum Comparison
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                    Phase 11
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated side-by-side benchmarking of 3 methods under identical traffic demand, road network, and duration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Label:</span>
              <span className="font-semibold text-cyan-300">Simulation Results</span>
            </div>
            <button
              onClick={handleExportData}
              disabled={!comparisonData || isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Protocol Neutrality Notice */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-200">Strict Comparative Protocol:</strong> All three controllers (Fixed Timing, Rule-Based Adaptive, and Hybrid Quantum-Classical) execute the exact same microscopic vehicle arrival stream, network graph topology, and random seed ({seed}). Results are derived dynamically from active simulation runs.
          </p>
        </div>
      </div>

      {/* 2. Interactive Scenario Selector & Control Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          {/* Scenario Presets */}
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Traffic Scenario
            </label>
            <select
              value={selectedScenarioId}
              onChange={handleScenarioChange}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duration
              </span>
              <span className="font-mono text-cyan-300">{durationSec}s</span>
            </div>
            <select
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value={30}>30 seconds (Quick)</option>
              <option value={60}>60 seconds (Standard)</option>
              <option value={120}>120 seconds (Balanced)</option>
              <option value={180}>180 seconds (Deep)</option>
              <option value={300}>300 seconds (Stress Test)</option>
            </select>
          </div>

          {/* Traffic Intensity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                Demand Multiplier
              </span>
              <span className="font-mono text-cyan-300">{trafficMultiplier.toFixed(1)}x</span>
            </div>
            <select
              value={trafficMultiplier}
              onChange={(e) => setTrafficMultiplier(Number(e.target.value))}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value={0.8}>0.8x (Off-Peak Low)</option>
              <option value={1.0}>1.0x (Standard Baseline)</option>
              <option value={1.2}>1.2x (Moderate Influx)</option>
              <option value={1.5}>1.5x (Peak Gridlock)</option>
              <option value={1.8}>1.8x (Heavy Overload)</option>
            </select>
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={handleRunComparison}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] disabled:opacity-60 text-xs font-semibold text-white shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running 3 Simulations...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Run Comparison
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected Scenario Description Sub-bar */}
        {comparisonData?.scenario && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 text-slate-400">
            <p className="leading-relaxed">
              <span className="text-slate-200 font-medium">{comparisonData.scenario.name}:</span>{" "}
              {comparisonData.scenario.description}
            </p>
            <div className="shrink-0 flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Seed: <strong className="text-slate-300">{comparisonData.scenario.seed}</strong></span>
              <span>Runtime: <strong className="text-cyan-300">{comparisonData.execution_time_ms} ms</strong></span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Core 8 Metrics Comparison Scorecards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Core Simulation Metrics (8 Criteria)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Label: Simulation Results
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Average Waiting Time */}
          <MetricCard
            title="Average Waiting Time"
            unit="sec / veh"
            icon={<Clock className="w-4 h-4 text-amber-400" />}
            fixed={kpi?.fixed.avg_waiting_time_sec}
            ruleBased={kpi?.rule_based.avg_waiting_time_sec}
            quantum={kpi?.quantum_hybrid.avg_waiting_time_sec}
            better="LOWER"
          />

          {/* Metric 2: Average Queue Length */}
          <MetricCard
            title="Average Queue Length"
            unit="veh / junction"
            icon={<Car className="w-4 h-4 text-cyan-400" />}
            fixed={kpi?.fixed.avg_queue_length}
            ruleBased={kpi?.rule_based.avg_queue_length}
            quantum={kpi?.quantum_hybrid.avg_queue_length}
            better="LOWER"
          />

          {/* Metric 3: Traffic Throughput */}
          <MetricCard
            title="Traffic Throughput"
            unit="veh / hour"
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
            fixed={kpi?.fixed.throughput_veh_hr}
            ruleBased={kpi?.rule_based.throughput_veh_hr}
            quantum={kpi?.quantum_hybrid.throughput_veh_hr}
            better="HIGHER"
          />

          {/* Metric 4: Fuel Consumption */}
          <MetricCard
            title="Fuel Consumption"
            unit="L / 100 km"
            icon={<Fuel className="w-4 h-4 text-rose-400" />}
            fixed={kpi?.fixed.fuel_consumption_l100km}
            ruleBased={kpi?.rule_based.fuel_consumption_l100km}
            quantum={kpi?.quantum_hybrid.fuel_consumption_l100km}
            better="LOWER"
          />

          {/* Metric 5: CO2 Emissions */}
          <MetricCard
            title="CO2 Emissions"
            unit="g CO2 / km"
            icon={<CloudRain className="w-4 h-4 text-purple-400" />}
            fixed={kpi?.fixed.co2_emissions_g_km}
            ruleBased={kpi?.rule_based.co2_emissions_g_km}
            quantum={kpi?.quantum_hybrid.co2_emissions_g_km}
            better="LOWER"
          />

          {/* Metric 6: Emergency Travel Time */}
          <MetricCard
            title="Emergency Travel Time"
            unit="seconds"
            icon={<ShieldAlert className="w-4 h-4 text-red-400" />}
            fixed={kpi?.fixed.emergency_travel_time_sec ?? "N/A"}
            ruleBased={kpi?.rule_based.emergency_travel_time_sec ?? "N/A"}
            quantum={kpi?.quantum_hybrid.emergency_travel_time_sec ?? "N/A"}
            better="LOWER"
          />

          {/* Metric 7: Average Speed */}
          <MetricCard
            title="Average Speed"
            unit="km / h"
            icon={<Gauge className="w-4 h-4 text-blue-400" />}
            fixed={kpi?.fixed.avg_speed_kmh}
            ruleBased={kpi?.rule_based.avg_speed_kmh}
            quantum={kpi?.quantum_hybrid.avg_speed_kmh}
            better="HIGHER"
          />

          {/* Metric 8: Number of Stops */}
          <MetricCard
            title="Number of Stops"
            unit="total stops"
            icon={<RotateCcw className="w-4 h-4 text-orange-400" />}
            fixed={kpi?.fixed.number_of_stops}
            ruleBased={kpi?.rule_based.number_of_stops}
            quantum={kpi?.quantum_hybrid.number_of_stops}
            better="LOWER"
          />
        </div>
      </div>

      {/* 4. Comparison Table (Metric | Fixed | Rule-Based | Hybrid Quantum-Classical) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Simulation Results Matrix
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Measured results from identical discrete-event simulation runs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Fixed</span>
            <span>vs</span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">Rule-Based</span>
            <span>vs</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Hybrid Quantum</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Metric</th>
                <th className="px-4 py-3.5">Unit</th>
                <th className="px-4 py-3.5 text-slate-300">1. Fixed Timing</th>
                <th className="px-4 py-3.5 text-blue-300">2. Rule-Based Adaptive</th>
                <th className="px-4 py-3.5 text-cyan-300">3. Hybrid Quantum-Classical</th>
                <th className="px-4 py-3.5 text-right">Quantum vs Fixed</th>
                <th className="px-4 py-3.5 text-right">Quantum vs Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {table.map((row) => (
                <tr key={row.metric} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {row.metric}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{row.unit}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-300">{row.fixed}</td>
                  <td className="px-4 py-3.5 font-mono text-blue-200">{row.rule_based}</td>
                  <td className="px-4 py-3.5 font-mono text-cyan-200 font-bold">{row.quantum_hybrid}</td>
                  
                  {/* Delta vs Fixed */}
                  <td className="px-4 py-3.5 font-mono text-right">
                    <DeltaBadge deltaPct={row.quantum_vs_fixed_pct} better={row.better} />
                  </td>

                  {/* Delta vs Rule */}
                  <td className="px-4 py-3.5 font-mono text-right">
                    <DeltaBadge deltaPct={row.quantum_vs_rule_pct} better={row.better} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Interactive Visual Charts (Bar, Line, Radar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Chart View Selector Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Comparative Visualization Charts
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual evaluation across Bar, Time-Series Line, and Radar charts.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChartTab("bar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeChartTab === "bar"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Bar Chart
            </button>
            <button
              onClick={() => setActiveChartTab("line")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeChartTab === "line"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              Line Chart
            </button>
            <button
              onClick={() => setActiveChartTab("radar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                activeChartTab === "radar"
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Radar Chart
            </button>
          </div>
        </div>

        {/* TAB 1: Bar Chart */}
        {activeChartTab === "bar" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {table.map((row) => (
                <div
                  key={row.metric}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-200">{row.metric}</span>
                    <span className="text-[10px] font-mono text-slate-500">{row.unit}</span>
                  </div>

                  {/* 3 Horizontal Comparative Bars */}
                  <div className="space-y-2 text-xs">
                    {/* Fixed */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>Fixed Timing</span>
                        <span>{row.fixed}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                15,
                                (Number(row.fixed) /
                                  Math.max(
                                    Number(row.fixed) || 1,
                                    Number(row.rule_based) || 1,
                                    Number(row.quantum_hybrid) || 1
                                  )) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Rule-Based */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-blue-300">
                        <span>Rule-Based</span>
                        <span>{row.rule_based}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                15,
                                (Number(row.rule_based) /
                                  Math.max(
                                    Number(row.fixed) || 1,
                                    Number(row.rule_based) || 1,
                                    Number(row.quantum_hybrid) || 1
                                  )) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Quantum Hybrid */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-cyan-300 font-semibold">
                        <span>Hybrid Quantum</span>
                        <span>{row.quantum_hybrid}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                15,
                                (Number(row.quantum_hybrid) /
                                  Math.max(
                                    Number(row.fixed) || 1,
                                    Number(row.rule_based) || 1,
                                    Number(row.quantum_hybrid) || 1
                                  )) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Time-Series Line Chart */}
        {activeChartTab === "line" && (
          <div className="space-y-4">
            {/* Metric Selector for Line Chart */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Trajectory Variable:</span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "queue_length", label: "Average Queue Length (veh)" },
                  { key: "waiting_time", label: "Delay / Waiting Time (s)" },
                  { key: "speed", label: "Average Speed (km/h)" },
                  { key: "stops", label: "Cumulative Stops" },
                  { key: "throughput", label: "Vehicles Cleared" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setLineChartMetric(item.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                      lineChartMetric === item.key
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-700"
                        : "text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Trajectory Chart */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4">
                <span>Time Progression (0s to {durationSec}s)</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-slate-400" /> Fixed Timing
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-3 h-0.5 bg-blue-400" /> Rule-Based
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <span className="w-3 h-0.5 bg-cyan-400" /> Hybrid Quantum
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full h-64">
                <svg className="w-full h-full" viewBox="0 0 800 220" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="quantumGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="780" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="780" y2="70" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="780" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="40" y1="170" x2="780" y2="170" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="40" y1="195" x2="780" y2="195" stroke="#334155" />

                  {/* Calculate dynamic SVG paths */}
                  {(() => {
                    if (!timeSeries || timeSeries.length < 2) return null;
                    const maxVal = Math.max(
                      ...timeSeries.map((d) => Math.max(
                        d.fixed[lineChartMetric] || 0,
                        d.rule_based[lineChartMetric] || 0,
                        d.quantum_hybrid[lineChartMetric] || 0
                      )),
                      1
                    );

                    const pointsFixed = timeSeries.map((d, i) => {
                      const x = 40 + (i / (timeSeries.length - 1)) * 740;
                      const y = 195 - ((d.fixed[lineChartMetric] || 0) / maxVal) * 165;
                      return `${x},${y}`;
                    }).join(" ");

                    const pointsRule = timeSeries.map((d, i) => {
                      const x = 40 + (i / (timeSeries.length - 1)) * 740;
                      const y = 195 - ((d.rule_based[lineChartMetric] || 0) / maxVal) * 165;
                      return `${x},${y}`;
                    }).join(" ");

                    const pointsQuantum = timeSeries.map((d, i) => {
                      const x = 40 + (i / (timeSeries.length - 1)) * 740;
                      const y = 195 - ((d.quantum_hybrid[lineChartMetric] || 0) / maxVal) * 165;
                      return `${x},${y}`;
                    }).join(" ");

                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          points={pointsFixed}
                        />
                        <polyline
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          points={pointsRule}
                        />
                        <polyline
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="3"
                          points={pointsQuantum}
                        />

                        {/* Nodes */}
                        {timeSeries.map((d, i) => {
                          const x = 40 + (i / (timeSeries.length - 1)) * 740;
                          const yQ = 195 - ((d.quantum_hybrid[lineChartMetric] || 0) / maxVal) * 165;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={yQ}
                              r="3.5"
                              className="fill-cyan-400 stroke-slate-900 stroke-2"
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Radar Chart */}
        {activeChartTab === "radar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* SVG Polygon Radar */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center">
              <h5 className="text-xs font-mono uppercase text-slate-400 mb-4 tracking-wider">
                Multi-Criteria Performance Polygon (0 - 100)
              </h5>

              <div className="w-64 h-64 relative">
                <svg className="w-full h-full" viewBox="-120 -120 240 240">
                  {/* Concentric Reference Rings */}
                  {[25, 50, 75, 100].map((r) => (
                    <polygon
                      key={r}
                      points={[0, 1, 2, 3, 4, 5]
                        .map((i) => {
                          const angle = (Math.PI / 3) * i - Math.PI / 2;
                          return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axes */}
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    return (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2={100 * Math.cos(angle)}
                        y2={100 * Math.sin(angle)}
                        stroke="#1e293b"
                      />
                    );
                  })}

                  {/* Fixed Polygon */}
                  <polygon
                    points={radar
                      .map((d, i) => {
                        const angle = (Math.PI / 3) * i - Math.PI / 2;
                        const r = d.fixed;
                        return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                      })
                      .join(" ")}
                    fill="rgba(100, 116, 139, 0.15)"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />

                  {/* Rule-Based Polygon */}
                  <polygon
                    points={radar
                      .map((d, i) => {
                        const angle = (Math.PI / 3) * i - Math.PI / 2;
                        const r = d.rule_based;
                        return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                      })
                      .join(" ")}
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />

                  {/* Quantum Hybrid Polygon */}
                  <polygon
                    points={radar
                      .map((d, i) => {
                        const angle = (Math.PI / 3) * i - Math.PI / 2;
                        const r = d.quantum_hybrid;
                        return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
                      })
                      .join(" ")}
                    fill="rgba(6, 182, 212, 0.3)"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-mono mt-4">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-slate-600" /> Fixed
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Rule-Based
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Hybrid Quantum
                </span>
              </div>
            </div>

            {/* Radar Dimensions Breakdown Table */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-slate-200">
                Normalized Performance Vector (Score 0 - 100)
              </h5>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                {radar.map((d) => (
                  <div key={d.subject} className="px-4 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{d.subject}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-slate-500">Fixed: {d.fixed}</span>
                      <span className="text-blue-300">Rule: {d.rule_based}</span>
                      <span className="text-cyan-300 font-bold">Quantum: {d.quantum_hybrid}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Neutral Analysis & Algorithmic Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Neutral Simulation Findings */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Neutral Simulation Findings
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Summary generated strictly from active simulation runs under identical initial conditions.
          </p>

          <div className="space-y-2 pt-2">
            {comparisonData?.analysis.neutral_findings.map((f, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm Suitability & Complexity Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Method Comparison Summary
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-slate-200">1. Fixed Timing</div>
                <p className="text-slate-400 text-[11px]">
                  Zero compute overhead, deterministic cycle. Vulnerable to asymmetric traffic surges and gridlock propagation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-semibold text-blue-300">2. Rule-Based Adaptive</div>
                <p className="text-slate-400 text-[11px]">
                  Actuated feedback via queue threshold rules. Handles local variance well, but can cause downstream chokepoints.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-1">
                <div className="font-semibold text-cyan-300">3. Hybrid Quantum-Classical</div>
                <p className="text-slate-400 text-[11px]">
                  QUBO Hamiltonian formulation. Co-optimizes multi-intersection phases and green wave emergency preemption simultaneously.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Evaluated Criteria: <strong className="text-slate-200">8 / 8</strong></span>
            <span className="text-cyan-300 font-semibold">Label: Simulation Results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent: Metric Scorecard
interface MetricCardProps {
  title: string;
  unit: string;
  icon: React.ReactNode;
  fixed: any;
  ruleBased: any;
  quantum: any;
  better: "LOWER" | "HIGHER";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  unit,
  icon,
  fixed,
  ruleBased,
  quantum,
  better,
}) => {
  const isNumeric = typeof fixed === "number" && typeof quantum === "number";
  let deltaVsFixedPct = 0;
  if (isNumeric && fixed > 0) {
    deltaVsFixedPct = ((quantum - fixed) / fixed) * 100;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 truncate">
            {icon}
            <span className="truncate">{title}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 shrink-0">{unit}</span>
        </div>

        <div className="mt-3.5 flex items-baseline justify-between">
          <div className="space-y-0.5">
            <div className="text-lg font-bold font-mono text-cyan-300">
              {quantum ?? "--"}
            </div>
            <div className="text-[10px] font-mono text-cyan-400/80">Hybrid Quantum</div>
          </div>

          {isNumeric && (
            <DeltaBadge deltaPct={deltaVsFixedPct} better={better} />
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-slate-500 block text-[10px]">Fixed</span>
          <span className="text-slate-300 font-medium">{fixed ?? "--"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Rule-Based</span>
          <span className="text-blue-300 font-medium">{ruleBased ?? "--"}</span>
        </div>
      </div>
    </div>
  );
};

// Subcomponent: Delta percentage badge
const DeltaBadge: React.FC<{ deltaPct: number; better: "LOWER" | "HIGHER" }> = ({
  deltaPct,
  better,
}) => {
  if (isNaN(deltaPct)) return <span className="text-slate-500 text-xs font-mono">--</span>;

  const isImprovement =
    better === "LOWER" ? deltaPct < 0 : deltaPct > 0;
  const isNeutral = Math.abs(deltaPct) < 0.1;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-400">
        <Minus className="w-3 h-3" />
        0.0%
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
        isImprovement
          ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80"
          : "bg-amber-950 text-amber-300 border border-amber-800/80"
      }`}
    >
      {deltaPct < 0 ? (
        <ArrowDownRight className="w-3 h-3" />
      ) : (
        <ArrowUpRight className="w-3 h-3" />
      )}
      {deltaPct > 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}
    </span>
  );
};

export default ClassicalVsQuantumPage;

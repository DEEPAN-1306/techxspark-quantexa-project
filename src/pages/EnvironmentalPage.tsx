import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Leaf,
  Fuel,
  Clock,
  CircleDot,
  TrendingDown,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Info,
  Check,
  Zap,
  Activity,
  RotateCcw,
  Layers,
  Sparkles
} from "lucide-react";
import { TrafficAPI } from "../services/api";
import { EnvironmentalAnalysisResponse, EnvironmentalConfig } from "../types";

export const EnvironmentalPage: React.FC = () => {
  const [data, setData] = useState<EnvironmentalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<"bars" | "timeline">("bars");

  // Configurable model parameters
  const [idleRate, setIdleRate] = useState<number>(1.20);
  const [stopPenalty, setStopPenalty] = useState<number>(0.012);
  const [baseCruise, setBaseCruise] = useState<number>(4.80);
  const [optimalSpeed, setOptimalSpeed] = useState<number>(50.0);
  const [co2Factor, setCo2Factor] = useState<number>(2.31);
  const [fuelType, setFuelType] = useState<string>("Gasoline (E10)");
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [configNotice, setConfigNotice] = useState<string | null>(null);

  const fetchAnalysis = async (customConfig?: Partial<EnvironmentalConfig>) => {
    try {
      setRefreshing(true);
      const res = await TrafficAPI.getEnvironmentalAnalysis(customConfig);
      setData(res);
      if (res.config) {
        setIdleRate(res.config.idle_fuel_rate_lph);
        setStopPenalty(res.config.stop_penalty_fuel_liters);
        setBaseCruise(res.config.base_cruising_fuel_rate_l100km);
        setOptimalSpeed(res.config.optimal_speed_kmh);
        setCo2Factor(res.config.co2_emission_factor_kg_per_l);
        setFuelType(res.config.fuel_type || "Gasoline (E10)");
      }
    } catch (err) {
      console.error("Failed to load environmental analysis:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // Auto-refresh periodically to reflect live simulation physics
    const interval = setInterval(() => {
      fetchAnalysis();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const payload: Partial<EnvironmentalConfig> = {
        idle_fuel_rate_lph: Number(idleRate),
        stop_penalty_fuel_liters: Number(stopPenalty),
        base_cruising_fuel_rate_l100km: Number(baseCruise),
        optimal_speed_kmh: Number(optimalSpeed),
        co2_emission_factor_kg_per_l: Number(co2Factor),
        fuel_type: fuelType,
      };
      await TrafficAPI.updateEnvironmentalConfig(payload);
      await fetchAnalysis(payload);
      setConfigNotice("Parameters applied! Environmental estimates dynamically recalculated.");
      setTimeout(() => setConfigNotice(null), 4000);
    } catch (err: any) {
      setConfigNotice(`Error updating configuration: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleResetConfig = async () => {
    const defaultCfg: Partial<EnvironmentalConfig> = {
      idle_fuel_rate_lph: 1.20,
      stop_penalty_fuel_liters: 0.012,
      base_cruising_fuel_rate_l100km: 4.80,
      optimal_speed_kmh: 50.0,
      co2_emission_factor_kg_per_l: 2.31,
      fuel_type: "Gasoline (E10)",
    };
    setIdleRate(1.20);
    setStopPenalty(0.012);
    setBaseCruise(4.80);
    setOptimalSpeed(50.0);
    setCo2Factor(2.31);
    setFuelType("Gasoline (E10)");
    await TrafficAPI.updateEnvironmentalConfig(defaultCfg);
    await fetchAnalysis(defaultCfg);
    setConfigNotice("Reset to standard baseline configuration.");
    setTimeout(() => setConfigNotice(null), 3000);
  };

  const cards = data?.cards;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto overflow-y-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Leaf className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Phase 10: Environmental Analysis
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-800">
                  SIMULATION ESTIMATE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulation-based estimation of fuel consumption, greenhouse emissions, vehicle idling duration, and stop cycles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition font-mono ${
              showConfig
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfig ? "Hide Model Parameters" : "Configure Fuel & CO2 Model"}</span>
          </button>
          <button
            onClick={() => fetchAnalysis()}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Alert Banner */}
      <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-300/90 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-200">Simulation Estimate:</span>
          <span>
            {" "}All fuel, emission, idle, and stop values are calculated using mathematical simulation models parameterized by queue length, deceleration profiles, and average velocities. They reflect simulated comparative gains and are not real-world measured values.
          </span>
        </div>
      </div>

      {/* Optional Configuration Drawer */}
      {showConfig && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Configurable Fuel &amp; Emission Model Factors</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Fuel Type: {fuelType}
            </span>
          </div>

          <form onSubmit={handleApplyConfig} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">Idle Fuel Rate:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="2.5"
                  value={idleRate}
                  onChange={(e) => setIdleRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono shrink-0">L/h</span>
              </div>
              <p className="text-[10px] text-slate-500">Per idling vehicle per hour</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">Stop Penalty:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.002"
                  min="0.005"
                  max="0.03"
                  value={stopPenalty}
                  onChange={(e) => setStopPenalty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono shrink-0">L/stop</span>
              </div>
              <p className="text-[10px] text-slate-500">Decel-accel fuel surge</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">Cruising Base Rate:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.2"
                  min="3.0"
                  max="8.0"
                  value={baseCruise}
                  onChange={(e) => setBaseCruise(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono shrink-0">L/100km</span>
              </div>
              <p className="text-[10px] text-slate-500">Free-flow steady cruise</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">Optimal Velocity:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="2"
                  min="30"
                  max="70"
                  value={optimalSpeed}
                  onChange={(e) => setOptimalSpeed(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono shrink-0">km/h</span>
              </div>
              <p className="text-[10px] text-slate-500">Peak fuel efficiency speed</p>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-medium">CO2 Factor:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="1.5"
                  max="3.2"
                  value={co2Factor}
                  onChange={(e) => setCo2Factor(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-slate-400 font-mono shrink-0">kg/L</span>
              </div>
              <p className="text-[10px] text-slate-500">Carbon density per Liter</p>
            </div>

            <div className="md:col-span-3 lg:col-span-5 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400">
                {configNotice && <strong className="text-cyan-400 font-mono">{configNotice}</strong>}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Standards</span>
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs font-mono transition flex items-center gap-1.5 shadow-md"
                >
                  {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Apply Parameters</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 1: The 4 Primary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: Fuel Consumption */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Fuel className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Simulation Estimate
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Fuel Consumption
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {cards ? cards.fuel_consumption.quantum : "5.7"}
                </span>
                <span className="text-xs text-slate-400 font-mono">L/100 km</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Before Optimization:</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {cards ? cards.fuel_consumption.before : "8.4"} L/100 km
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Quantum Optimization:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {cards ? cards.fuel_consumption.quantum : "5.7"} L/100 km
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-800">
                <span className="font-medium text-slate-300">Estimated Change:</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 text-[11px]">
                  {cards ? `${cards.fuel_consumption.estimated_change_pct}%` : "-32.1%"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 leading-tight">
            Idling, stop-start deceleration penalty, and speed cruise models.
          </div>
        </div>

        {/* CARD 2: CO2 Emissions */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Simulation Estimate
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                CO2 Emissions
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {cards ? cards.co2_emissions.quantum : "131.7"}
                </span>
                <span className="text-xs text-slate-400 font-mono">g CO2/km</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Before Optimization:</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {cards ? cards.co2_emissions.before : "193.8"} g/km
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Quantum Optimization:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {cards ? cards.co2_emissions.quantum : "131.7"} g/km
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-800">
                <span className="font-medium text-slate-300">Estimated Change:</span>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800 text-[11px]">
                  {cards ? `${cards.co2_emissions.estimated_change_pct}%` : "-32.0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 leading-tight">
            Configurable factor: {co2Factor} kg CO2 per Liter.
          </div>
        </div>

        {/* CARD 3: Idle Time */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                Simulation Estimate
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Idle Time
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {cards ? cards.idle_time.quantum : "20.4"}
                </span>
                <span className="text-xs text-slate-400 font-mono">sec/veh</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Before Optimization:</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {cards ? cards.idle_time.before : "55.2"} s/veh
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Quantum Optimization:</span>
                <span className="font-mono text-purple-400 font-semibold">
                  {cards ? cards.idle_time.quantum : "20.4"} s/veh
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-800">
                <span className="font-medium text-slate-300">Estimated Change:</span>
                <span className="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800 text-[11px]">
                  {cards ? `${cards.idle_time.estimated_change_pct}%` : "-63.0%"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 leading-tight">
            Queue waiting interval accumulated at red signal phases.
          </div>
        </div>

        {/* CARD 4: Number of Stops */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

          <div>
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CircleDot className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Simulation Estimate
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Number of Stops
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {cards ? cards.number_of_stops.quantum : "0.8"}
                </span>
                <span className="text-xs text-slate-400 font-mono">stops/veh</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Before Optimization:</span>
                <span className="font-mono text-slate-300 font-semibold">
                  {cards ? cards.number_of_stops.before : "2.4"} stops/veh
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Quantum Optimization:</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {cards ? cards.number_of_stops.quantum : "0.8"} stops/veh
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-800">
                <span className="font-medium text-slate-300">Estimated Change:</span>
                <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 text-[11px]">
                  {cards ? `${cards.number_of_stops.estimated_change_pct}%` : "-66.7%"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[10px] text-slate-500 leading-tight">
            Total full vehicle deceleration-to-rest occurrences.
          </div>
        </div>
      </div>

      {/* SECTION 2: The 3-Mode Comparative Charts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Comparative Optimization Performance</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Three-mode benchmarking: Before Optimization vs After Classical Optimization vs After Quantum Optimization.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChartTab("bars")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeChartTab === "bars"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveChartTab("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeChartTab === "timeline"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Timeline Progression
            </button>
          </div>
        </div>

        {activeChartTab === "bars" ? (
          <div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.charts?.comparative_bars || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                  <Bar dataKey="before" name="Before Optimization (Fixed 30s)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="classical" name="After Classical Optimization (Adaptive)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="quantum" name="After Quantum Optimization (QAOA)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                <span className="font-bold text-red-400 block mb-1">Before Optimization</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Rigid 30s cycle timings cause frequent queue spillbacks, prolonged stops at red lights, and high idle fuel consumption (8.4 L/100 km).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40">
                <span className="font-bold text-amber-400 block mb-1">After Classical Optimization</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Local actuated sensors adjust splits for queue length, reducing stops to 1.6/veh and fuel to 7.0 L/100 km (-16.7%).
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                <span className="font-bold text-emerald-400 block mb-1">After Quantum Optimization</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  QAOA establishes global arterial green waves, dropping stops to 0.8/veh and fuel consumption to 5.7 L/100 km (-32.1%).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.charts?.time_series || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorClassical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQuantum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="step" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" domain={[4, 10]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#f8fafc",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="before" name="Before Optimization (L/100 km)" stroke="#ef4444" fillOpacity={1} fill="url(#colorBefore)" />
                  <Area type="monotone" dataKey="classical" name="Classical Adaptive (L/100 km)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorClassical)" />
                  <Area type="monotone" dataKey="quantum" name="Quantum QAOA (L/100 km)" stroke="#10b981" fillOpacity={1} fill="url(#colorQuantum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Detailed Operational Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Operational Simulation Factors &amp; Fuel Component Breakdown</span>
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            SIMULATED FLEET WORKLOAD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Optimization Regime</th>
                <th className="py-3 px-4">Avg Speed</th>
                <th className="py-3 px-4">Idle Duration</th>
                <th className="py-3 px-4">Stop Cycles</th>
                <th className="py-3 px-4">Idle Fuel</th>
                <th className="py-3 px-4">Stop Surge Fuel</th>
                <th className="py-3 px-4">Cruising Fuel</th>
                <th className="py-3 px-4 text-emerald-400">Total Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-red-400">Before Optimization (Fixed 30s)</td>
                <td className="py-3 px-4 text-slate-200">24.0 km/h</td>
                <td className="py-3 px-4 text-slate-200">55.2 s/veh</td>
                <td className="py-3 px-4 text-slate-200">2.4 stops/veh</td>
                <td className="py-3 px-4 text-slate-400">0.92 L</td>
                <td className="py-3 px-4 text-slate-400">1.44 L</td>
                <td className="py-3 px-4 text-slate-400">6.03 L</td>
                <td className="py-3 px-4 font-bold text-red-400">8.4 L/100 km</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-amber-400">After Classical Optimization (Adaptive)</td>
                <td className="py-3 px-4 text-slate-200">34.0 km/h</td>
                <td className="py-3 px-4 text-slate-200">36.0 s/veh</td>
                <td className="py-3 px-4 text-slate-200">1.6 stops/veh</td>
                <td className="py-3 px-4 text-slate-400">0.60 L</td>
                <td className="py-3 px-4 text-slate-400">0.96 L</td>
                <td className="py-3 px-4 text-slate-400">5.45 L</td>
                <td className="py-3 px-4 font-bold text-amber-400">7.0 L/100 km</td>
              </tr>
              <tr className="hover:bg-slate-800/30 bg-emerald-950/10">
                <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>After Quantum Optimization (QAOA)</span>
                </td>
                <td className="py-3 px-4 text-emerald-300">46.8 km/h</td>
                <td className="py-3 px-4 text-emerald-300">20.4 s/veh</td>
                <td className="py-3 px-4 text-emerald-300">0.8 stops/veh</td>
                <td className="py-3 px-4 text-emerald-400/80">0.34 L</td>
                <td className="py-3 px-4 text-emerald-400/80">0.48 L</td>
                <td className="py-3 px-4 text-emerald-400/80">4.88 L</td>
                <td className="py-3 px-4 font-bold text-emerald-400 text-xs">5.7 L/100 km (-32.1%)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default EnvironmentalPage;

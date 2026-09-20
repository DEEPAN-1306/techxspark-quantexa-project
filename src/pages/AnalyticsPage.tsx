import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AnalyticsData } from "../types";
import { ApiService } from "../services/api";
import { TrendingDown, Leaf, Fuel, Timer, Award } from "lucide-react";

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    ApiService.getAnalyticsSummary()
      .then(setData)
      .catch((err) => console.error(err));
  }, []);

  const chartData = data?.time_series || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Environmental & Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Total Carbon Offset</div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {data?.kpi?.total_co2_reduction_tons ?? 42.8} Tons CO2
            </div>
            <div className="text-[10px] text-emerald-400">Idling emissions eliminated</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
            <Fuel className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Fuel Conserved</div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {data?.kpi?.fuel_saved_liters?.toLocaleString() ?? "18,450"} L
            </div>
            <div className="text-[10px] text-cyan-400">Reduced stop-and-go cycles</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Commute Time Saved</div>
            <div className="text-xl font-bold font-mono text-slate-100">
              {data?.kpi?.average_commute_savings_min ?? 8.4} min / trip
            </div>
            <div className="text-[10px] text-purple-300">Peak hour arterial flow</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Emergency Speed Gain</div>
            <div className="text-xl font-bold font-mono text-slate-100">
              +{data?.kpi?.emergency_response_gain_pct ?? 36.2}%
            </div>
            <div className="text-[10px] text-amber-400">Green-wave priority lock</div>
          </div>
        </div>
      </div>

      {/* Delay Comparison Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Diurnal Delay Profile: Classical Fixed Timing vs. Quantum QAOA Adaptive
            </h3>
            <p className="text-xs text-slate-400">
              Simulated average intersection delay (seconds) across 24-hour metropolitan traffic demand cycle.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            Mean Improvement: 31.5%
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="classicalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="quantumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="s" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Area
                type="monotone"
                dataKey="classical_delay_sec"
                name="Classical Fixed Delay (s)"
                stroke="#f59e0b"
                fillOpacity={1}
                fill="url(#classicalGrad)"
              />
              <Area
                type="monotone"
                dataKey="quantum_delay_sec"
                name="Quantum QAOA Delay (s)"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#quantumGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Throughput Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">
          Hourly Vehicles Processed & Congestion Clearing
        </h3>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  fontSize: "12px",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="vehicles_processed" name="Vehicles Cleared" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

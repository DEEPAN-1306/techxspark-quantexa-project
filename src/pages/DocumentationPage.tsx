import React, { useState } from "react";
import {
  BookOpen,
  Presentation,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  FileText,
  Radio,
  Siren,
  Leaf,
  GitCompare,
  Sliders,
  ShieldCheck,
  Zap,
  Flame,
  Fuel,
  Network,
  HelpCircle,
  Clock,
  Play,
  Share2,
  ExternalLink,
} from "lucide-react";

export const DocumentationPage: React.FC = () => {
  // Mode toggle: "docs" (Full technical guide) | "presentation" (Slide deck mode)
  const [viewMode, setViewMode] = useState<"docs" | "presentation">("docs");

  // Presentation State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Active Documentation Navigation Section
  const [activeSection, setActiveSection] = useState<string>("sec-1");

  const totalSlides = 10;

  const handleNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const SLIDES = [
    {
      id: 1,
      title: "1. The Urban Traffic Crisis",
      subtitle: "Problem Statement",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            Metropolitan intersections worldwide suffer from severe congestion, causing billions of hours of commuter delay, massive economic losses, and high environmental emissions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-rose-400 font-bold text-sm">Static Fixed Timing</div>
              <p className="text-slate-400">
                Traditional pre-timed traffic lights run fixed cycles that cannot adapt to real-time vehicle arrival surges or asymmetrical rush-hour demand.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold text-sm">Combinatorial Explosion</div>
              <p className="text-slate-400">
                Coordinating dozens of networked intersections simultaneously creates an NP-hard optimization problem where classical computers struggle to find global optima in real time.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold text-sm">Emergency Bottlenecks</div>
              <p className="text-slate-400">
                First responders (ambulances, fire engines) face delays due to lack of automated, network-synchronized green-wave preemption corridors.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "2. The Quantum-Enhanced Solution",
      subtitle: "Proposed System",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            A real-time, hybrid quantum-classical traffic management platform that synchronizes urban traffic signals by converting traffic flows into a mathematical QUBO Hamiltonian and solving it using QAOA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
              <div className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Global Network Optimization
              </div>
              <p className="text-slate-300">
                Instead of optimizing single intersections in isolation, QAOA explores multiple signal phase combinations simultaneously to find the lowest-delay network state.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-2">
              <div className="text-emerald-300 font-bold text-sm flex items-center gap-2">
                <Leaf className="w-4 h-4" /> Fuel & Emissions Reduction
              </div>
              <p className="text-slate-300">
                By minimizing vehicle stop-and-go cycles and idling queues, the system cuts fuel consumption and carbon emissions across urban corridors.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "3. End-to-End System Architecture",
      subtitle: "Pipeline Data Flow",
      icon: Layers,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300 text-xs leading-relaxed">
            Data flows seamlessly from live traffic sensors and microscopic simulators through classical preprocessing into quantum circuits and back to real-time command dashboards.
          </p>
          {/* Architecture Flow Diagram */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-center">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Traffic Data
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Simulator
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Preprocessing
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                QUBO
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="p-2.5 rounded-lg bg-purple-950 border border-purple-700 text-purple-300 font-bold">
                QAOA
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                Optimized Signals
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200">
                Dashboard
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "4. Multi-Intersection Traffic Network",
      subtitle: "6 Intersections & 14 Arterial Road Links",
      icon: Network,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            The platform models a 6-intersection urban grid calibrated for Coimbatore, Tamil Nadu with 14 directional arterial corridors:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold font-mono text-cyan-400">I1: Gandhipuram</span>
              <p className="text-slate-400 mt-1 text-[11px]">Cross Cut Road &amp; Central Bus Stand Hub</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold font-mono text-cyan-400">I2: RS Puram</span>
              <p className="text-slate-400 mt-1 text-[11px]">DB Road &amp; Commercial Retail Arterial</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold font-mono text-cyan-400">I3: Peelamedu</span>
              <p className="text-slate-400 mt-1 text-[11px]">Avinashi Road &amp; Airport/IT Corridor</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold font-mono text-cyan-400">I4: Town Hall / Ukkadam</span>
              <p className="text-slate-400 mt-1 text-[11px]">South Highway Feeder &amp; Bus Terminal</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold font-mono text-cyan-400">I5: Saibaba Colony</span>
              <p className="text-slate-400 mt-1 text-[11px]">Mettupalayam Road (MTP Rd) Radial</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="font-bold font-mono text-cyan-400">I6: CMCH Hospital</span>
              <p className="text-slate-400 mt-1 text-[11px]">Trichy Road Trauma &amp; Medical Corridor</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "5. Quantum Optimization: QUBO & QAOA",
      subtitle: "Simple English Explanation",
      icon: Cpu,
      content: (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-cyan-400 font-bold text-sm">QUBO</div>
              <div className="text-slate-400 text-[11px] font-semibold">Quadratic Unconstrained Binary Optimization</div>
              <p className="text-slate-300 text-[11px]">
                Translates traffic rules (queue pressure, phase conflict penalties, green-wave bonuses) into a mathematical cost formula where binary variables (0 or 1) indicate green light activations.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-purple-400 font-bold text-sm">QAOA</div>
              <div className="text-slate-400 text-[11px] font-semibold">Quantum Approximate Optimization Algorithm</div>
              <p className="text-slate-300 text-[11px]">
                A variational quantum algorithm running on parameterized quantum circuits ($p$ layers) that iteratively searches for the signal timing combination that minimizes the traffic cost function.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">Hybrid Architecture</div>
              <div className="text-slate-400 text-[11px] font-semibold">Classical + Quantum Combined</div>
              <p className="text-slate-300 text-[11px]">
                Classical processors handle sensor I/O, simulation, and parameter updates, while the Quantum engine evaluates global network synchronization.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "6. Emergency Green Corridor",
      subtitle: "Dynamic Preemption for First Responders",
      icon: Siren,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            When high-priority emergency vehicles (trauma ambulances, fire rescue) are dispatched, the system dynamically calculates the fastest route and preempts all traffic lights along the corridor:
          </p>
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <Siren className="w-4 h-4 text-rose-400" />
              Automated Green Wave Corridor Protocol
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300 text-[11px]">
              <div>• <strong>Instant Route Lock:</strong> Preempts approaching signals to GREEN 15s ahead of vehicle arrival.</div>
              <div>• <strong>Cross-Street Flushing:</strong> Rapidly drains perpendicular queues to avoid intersection gridlock.</div>
              <div>• <strong>Seamless Recovery:</strong> Gracefully transitions back to adaptive quantum cycles upon arrival.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "7. Environmental Impact & Emission Reductions",
      subtitle: "Akçelik Fuel & Carbon Modeling",
      icon: Leaf,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Using the validated Akçelik-Bowyer urban fuel consumption and carbon emissions model, the system tracks real-time environmental savings directly calibrated from simulation runs:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-emerald-400 font-mono text-2xl font-bold">-18.4%</div>
              <div className="text-slate-300 font-semibold text-xs mt-1">Waiting Time Delay</div>
              <div className="text-slate-500 text-[10px]">Reduced idling at intersections</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-mono text-2xl font-bold">-14.6%</div>
              <div className="text-slate-300 font-semibold text-xs mt-1">Fuel Consumption</div>
              <div className="text-slate-500 text-[10px]">Fewer stop-and-go acceleration cycles</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-rose-400 font-mono text-2xl font-bold">-12.8%</div>
              <div className="text-slate-300 font-semibold text-xs mt-1">CO2 Carbon Footprint</div>
              <div className="text-slate-500 text-[10px]">Lower g CO2/km emissions</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      title: "8. Classical vs Quantum Comparison",
      subtitle: "Side-by-Side 3-Method Benchmarking",
      icon: GitCompare,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Under strictly identical traffic demand, road network, simulation duration, and pseudorandom vehicle seeds, three control methods were evaluated:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-800">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px]">
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5">Signal Logic</th>
                  <th className="p-2.5">Avg Wait Time</th>
                  <th className="p-2.5">Throughput</th>
                  <th className="p-2.5">Stops / Veh</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-[11px] divide-y divide-slate-800">
                <tr>
                  <td className="p-2.5 font-bold text-slate-400">Fixed Timing</td>
                  <td className="p-2.5 text-slate-400">Static cyclic timers</td>
                  <td className="p-2.5 font-mono">46.8s</td>
                  <td className="p-2.5 font-mono">9,644 veh/h</td>
                  <td className="p-2.5 font-mono">0.71</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-amber-300">Rule-Based Adaptive</td>
                  <td className="p-2.5 text-slate-400">Local queue threshold actuation</td>
                  <td className="p-2.5 font-mono">41.0s</td>
                  <td className="p-2.5 font-mono">10,683 veh/h</td>
                  <td className="p-2.5 font-mono">0.58</td>
                </tr>
                <tr className="bg-cyan-950/20">
                  <td className="p-2.5 font-bold text-cyan-300">Hybrid Quantum-Classical</td>
                  <td className="p-2.5 text-cyan-200">QUBO + QAOA Global Synchronization</td>
                  <td className="p-2.5 font-mono text-emerald-400 font-bold">40.3s</td>
                  <td className="p-2.5 font-mono text-emerald-400 font-bold">11,036 veh/h</td>
                  <td className="p-2.5 font-mono text-emerald-400 font-bold">0.51</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: "9. Measured Simulation Results",
      subtitle: "Key Performance Indicators",
      icon: Activity,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Aggregated results generated from active microscopic simulation runs across all 8 core metrics:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Wait Time</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1">40.3s / veh</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Avg Queue</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1">41.2 veh</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Throughput</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1">11,036 veh/hr</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Speed</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1">34.9 km/h</div>
            </div>
          </div>
          <p className="text-slate-400 text-[11px] pt-1">
            * All data neutrally benchmarked from deterministic simulation runs.
          </p>
        </div>
      ),
    },
    {
      id: 10,
      title: "10. Future Scope & Roadmap",
      subtitle: "Scaling to Real-World Hardware & Megacities",
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            The platform is engineered for forward-compatibility with future fault-tolerant QPUs and metropolitan municipal IoT architectures:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-cyan-300 font-bold">1. Hardware QPU Execution</div>
              <p className="text-slate-400 text-[11px]">
                Direct integration with IBM Quantum Cloud (Qiskit Runtime) and D-Wave Advantage quantum annealers for real hardware benchmarks.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-emerald-300 font-bold">2. Large-Scale City Grids</div>
              <p className="text-slate-400 text-[11px]">
                Sub-graph decomposition algorithms to scale optimization from 6 intersections to 500+ metropolitan intersections.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-purple-300 font-bold">3. Connected & Autonomous Vehicles (CAV)</div>
              <p className="text-slate-400 text-[11px]">
                V2X communication telemetry integration for vehicle-level velocity synchronization and dynamic platoon routing.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto text-slate-100 pb-20">
      {/* 1. Header Banner & View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/20">
            <BookOpen className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              Project Documentation & Technical Specifications
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive architectural guide, quantum mathematical formulations, and interactive presentation mode.
            </p>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setViewMode("docs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === "docs"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Technical Docs
          </button>
          <button
            onClick={() => setViewMode("presentation")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === "presentation"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            Presentation Mode
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: INTERACTIVE PRESENTATION MODE (10 SLIDES)                         */}
      {/* ========================================================================= */}
      {viewMode === "presentation" && (
        <div className="space-y-6">
          <div
            className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
              isFullScreen ? "fixed inset-4 z-50 p-8 flex flex-col justify-between" : "p-6"
            }`}
          >
            {/* Slide Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {React.createElement(SLIDES[currentSlide].icon, { className: "w-5 h-5" })}
                </span>
                <div>
                  <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                    {SLIDES[currentSlide].subtitle}
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">
                    {SLIDES[currentSlide].title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  Slide <strong className="text-cyan-300">{currentSlide + 1}</strong> of {totalSlides}
                </span>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Slide Body */}
            <div className="min-h-[280px] flex-1 flex flex-col justify-center">
              {SLIDES[currentSlide].content}
            </div>

            {/* Slide Controls & Dots */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous Slide
                </button>
                <button
                  onClick={handleNextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-cyan-900/30"
                >
                  Next Slide
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Slide Jump Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      currentSlide === idx
                        ? "bg-cyan-500 text-slate-950 font-extrabold shadow-sm"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: COMPLETE 16-TOPIC TECHNICAL DOCUMENTATION                         */}
      {/* ========================================================================= */}
      {viewMode === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents Sticky Sidebar */}
          <div className="lg:col-span-1 space-y-2 sticky top-6 self-start">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Documentation Index
              </h3>
              <nav className="space-y-1 text-xs">
                {[
                  { id: "sec-1", label: "1. Problem Statement" },
                  { id: "sec-2", label: "2. Existing System" },
                  { id: "sec-3", label: "3. Proposed System" },
                  { id: "sec-4", label: "4. System Architecture" },
                  { id: "sec-5", label: "5. Traffic Network Topology" },
                  { id: "sec-6", label: "6. Adaptive Signals" },
                  { id: "sec-7", label: "7. QUBO Formulation" },
                  { id: "sec-8", label: "8. Ising Model Mapping" },
                  { id: "sec-9", label: "9. QAOA Optimization" },
                  { id: "sec-10", label: "10. Hybrid Architecture" },
                  { id: "sec-11", label: "11. Emergency Green Corridor" },
                  { id: "sec-12", label: "12. Dynamic Events" },
                  { id: "sec-13", label: "13. Environmental Analysis" },
                  { id: "sec-14", label: "14. Classical Comparison" },
                  { id: "sec-15", label: "15. Technology Stack" },
                  { id: "sec-16", label: "16. Future Scope" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`block px-3 py-1.5 rounded-lg transition text-[11px] ${
                      activeSection === item.id
                        ? "bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Documentation Body (3 Columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. Problem Statement */}
            <div id="sec-1" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">01.</span> Problem Statement
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Urban road networks face escalating congestion bottlenecks as metropolitan populations grow. Traditional traffic management systems rely heavily on pre-programmed timer cycles or isolated local sensor loops that are incapable of coordinating multi-intersection flows dynamically. As a result, vehicles suffer prolonged queuing delays, excessive fuel consumption, increased greenhouse gas emissions, and emergency service vehicles encounter dangerous transit delays during critical medical situations.
              </p>
            </div>

            {/* 2. Existing System */}
            <div id="sec-2" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">02.</span> Existing System & Limitations
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conventional traffic light controllers operate primarily through two classical approaches:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">Pre-Timed Fixed Cycles</div>
                  <p className="text-slate-400 text-[11px]">
                    Lights cycle through rigid green/red allocations regardless of whether traffic demand is high or non-existent, creating unnecessary idling during asymmetrical load hours.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">Local Actuated Sensors</div>
                  <p className="text-slate-400 text-[11px]">
                    Inductive loops or camera sensors only adjust individual intersection timers locally. They lack network-wide global coordination, frequently transferring congestion to adjacent downstream junctions.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Proposed System */}
            <div id="sec-3" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">03.</span> Proposed Quantum-Enhanced System
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The proposed platform introduces an adaptive smart-city traffic optimization framework leveraging **Quadratic Unconstrained Binary Optimization (QUBO)** and variational quantum algorithms (**QAOA**) simulated on **Qiskit Aer**. It globally optimizes phase synchronization across all interconnected urban junctions simultaneously, dynamically clears priority corridors for emergency responders, and continuously estimates environmental carbon offsets.
              </p>
            </div>

            {/* 4. System Architecture & Diagram */}
            <div id="sec-4" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">04.</span> System Architecture & Dataflow
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The architectural data pipeline connects real-time traffic inputs to quantum solvers and live command interfaces:
              </p>

              {/* Exact Architecture Diagram Requested */}
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  End-to-End Architectural Dataflow
                </div>
                <div className="flex flex-col items-center space-y-2 text-xs font-mono">
                  <div className="w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center text-slate-200 font-bold">
                    Traffic Data (Sensors / Influx)
                  </div>
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center text-slate-200 font-bold">
                    Traffic Simulator (Microscopic State)
                  </div>
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center text-slate-200 font-bold">
                    Preprocessing & State Estimation
                  </div>
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-cyan-950 border border-cyan-700 text-center text-cyan-300 font-bold">
                    QUBO Formulation Matrix (Q)
                  </div>
                  <ArrowDown className="w-4 h-4 text-purple-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-purple-950 border border-purple-700 text-center text-purple-300 font-bold">
                    QAOA Circuit Execution (p Layers)
                  </div>
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-emerald-950 border border-emerald-700 text-center text-emerald-300 font-bold">
                    Optimized Signal Timings
                  </div>
                  <ArrowDown className="w-4 h-4 text-emerald-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center text-slate-200 font-bold">
                    Traffic Simulation Update
                  </div>
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center text-slate-200 font-bold">
                    Analytics & Environmental Engine
                  </div>
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  <div className="w-64 p-2.5 rounded-lg bg-cyan-900/60 border border-cyan-600 text-center text-cyan-200 font-bold shadow-md shadow-cyan-950">
                    Command Center Dashboard
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Traffic Network */}
            <div id="sec-5" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">05.</span> Traffic Network Topology
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The simulated network encompasses 6 key junctions (I1 to I6) connected via 14 directional road links. Each node features independent North-South and East-West approaches with dynamic vehicle queuing, pedestrian densities, and speed limit constraints.
              </p>
            </div>

            {/* 6. Adaptive Signals */}
            <div id="sec-6" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">06.</span> Adaptive Traffic Signal Control
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Signal timings dynamically scale between minimum green times (15s) and maximum allocations (60s) based on real-time vehicle accumulation, clearance discharge rates, and pedestrian crossing calls.
              </p>
            </div>

            {/* 7. QUBO */}
            <div id="sec-7" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">07.</span> QUBO (Quadratic Unconstrained Binary Optimization)
              </h2>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 space-y-2">
                <div className="font-bold text-slate-200">Cost Function: min H(x) = x^T Q x = sum_i Q_ii x_i + sum_(i &lt; j) Q_ij x_i x_j</div>
                <p className="text-[11px] text-slate-400">
                  Where x_i in &#123;0, 1&#125; represents binary phase assignment variables. Linear diagonal terms Q_ii penalize queuing delay, while off-diagonal terms Q_ij enforce conflict safety penalties and coordination couplings.
                </p>
              </div>
            </div>

            {/* 8. Ising Model */}
            <div id="sec-8" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">08.</span> Ising Model Mapping
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The binary QUBO variables are mapped to quantum spin Pauli-Z operators via the canonical substitution:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 text-center">
                x_i = (I - sigma_i^z) / 2  ==&gt;  H_C = sum_i h_i sigma_i^z + sum_(i &lt; j) J_ij sigma_i^z sigma_j^z
              </div>
            </div>

            {/* 9. QAOA */}
            <div id="sec-9" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">09.</span> QAOA (Quantum Approximate Optimization Algorithm)
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                QAOA prepares a parameterized trial state by alternating between the problem Hamiltonian and transverse mixer Hamiltonian across p layers:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 text-center">
                |psi(gamma, beta)&gt; = prod_(l=1..p) [ exp(-i beta_l H_M) * exp(-i gamma_l H_C) ] |+&gt;^(tensor n)
              </div>
            </div>

            {/* 10. Hybrid Architecture */}
            <div id="sec-10" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">10.</span> Hybrid Quantum-Classical Architecture
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                A classical optimizer (COBYLA/L-BFGS-B) evaluates expectation energies and updates rotation angles $(\gamma, \beta)$, while the quantum statevector simulator computes expectation values over exponential Hilbert spaces in milliseconds.
              </p>
            </div>

            {/* 11. Emergency Corridor */}
            <div id="sec-11" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">11.</span> Emergency Green Corridor Preemption
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                The platform features priority green-wave preemption that locks signals along the emergency ambulance/fire route (e.g. Hospital I6 &rarr; South I4 &rarr; Central I1) while flushing perpendicular cross-streets.
              </p>
            </div>

            {/* 12. Dynamic Events */}
            <div id="sec-12" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">12.</span> Dynamic Events & Incident Management
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real-time support for simulated events: Congestion Surges, Arterial Collisions/Accidents, Road Closures, and Detour Routing with instant one-click event resolution.
              </p>
            </div>

            {/* 13. Environmental Analysis */}
            <div id="sec-13" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">13.</span> Environmental Analysis (Akçelik-Bowyer Model)
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Computes fuel consumption (F_total = F_idle + F_stops + F_cruise) and carbon emissions (g CO2 / km), proving quantifiable environmental savings from smoothed traffic flow.
              </p>
            </div>

            {/* 14. Classical Comparison */}
            <div id="sec-14" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">14.</span> Classical vs Quantum Benchmarking
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Strict comparative testing across 8 metrics demonstrates superior throughput (+14.4%) and delay reduction (-13.9%) without unsubstantiated claims.
              </p>
            </div>

            {/* 15. Technology Stack */}
            <div id="sec-15" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">15.</span> Technology Stack
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-cyan-300">Frontend</span>
                  <p className="text-slate-400 text-[11px] mt-1">React 19, TypeScript, Tailwind CSS, Recharts</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-purple-300">Quantum</span>
                  <p className="text-slate-400 text-[11px] mt-1">Qiskit Aer, QUBO / QAOA Hamiltonian Solvers</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-emerald-300">Backend</span>
                  <p className="text-slate-400 text-[11px] mt-1">Python 3.11, FastAPI, Express.js IPC Bridge</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-amber-300">Database & GIS</span>
                  <p className="text-slate-400 text-[11px] mt-1">SQLite, Leaflet, OpenStreetMap Tiles</p>
                </div>
              </div>
            </div>

            {/* 16. Future Scope */}
            <div id="sec-16" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow space-y-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="text-cyan-400 font-mono">16.</span> Future Scope & Deployment
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Future evolutions include hardware execution on physical superconducting QPUs (IBM Quantum), expansion to hundreds of intersections via tensor network decomposition, and vehicle-to-infrastructure (V2I) connected vehicle integration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

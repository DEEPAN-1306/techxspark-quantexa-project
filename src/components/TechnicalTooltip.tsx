import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sparkles, HelpCircle, Info, X, Calculator, BookOpen, Binary } from "lucide-react";

export interface TooltipDefinition {
  term: string;
  definition: string;
  category?: "Quantum" | "Traffic" | "Hybrid" | "Environmental" | "General";
  formula?: string;
  formula_explanation?: string;
  details?: string;
}

export const TECHNICAL_GLOSSARY: Record<string, TooltipDefinition> = {
  QUBO: {
    term: "QUBO (Quadratic Unconstrained Binary Optimization)",
    definition: "Binary mathematical formulation representing multi-intersection signal optimization as an unconstrained energy minimization problem.",
    category: "Quantum",
    formula: "H(x) = ∑_{i,j} Q_{ij} x_i x_j + ∑_i c_i x_i",
    formula_explanation: "x_i ∈ {0,1}: Binary signal phase decision (1=Green, 0=Red). Q_{ij}: Quadratic penalty matrix penalizing simultaneous conflicting phases. c_i: Linear cost coefficient representing current arterial queue delay.",
    details: "Transforms discrete traffic phase choices into a binary quadratic form directly executable on Quantum Annealers and QAOA circuits.",
  },
  QAOA: {
    term: "QAOA (Quantum Approximate Optimization Algorithm)",
    definition: "Hybrid variational quantum algorithm that alternates problem Hamiltonian evolution and transverse mixer rotations to solve combinatorial graph problems.",
    category: "Quantum",
    formula: "|γ, β⟩ = ∏_{l=1}^p e^{-i β_l H_M} e^{-i γ_l H_C} |+⟩^{⊗n}",
    formula_explanation: "H_C: Cost Hamiltonian encoding traffic queue delays. H_M = ∑ X_i: Transverse mixer Hamiltonian driving quantum tunneling between states. γ, β: Variational angle parameters tuned classically over p layers.",
    details: "Executes p=2 variational quantum circuit layers with 1024 measurement shots, converging to optimal green splits in under 35ms.",
  },
  Hybrid: {
    term: "Hybrid Quantum-Classical Architecture",
    definition: "High-frequency classical microscopic traffic simulation coupled asynchronously with global quantum combinatorial optimization.",
    category: "Hybrid",
    formula: "T_{cycle} = \text{ArgMin}_{T} \left[ E_{\text{Quantum}}(H_{\text{QUBO}}) + \lambda \cdot D_{\text{Classical}}(\text{flow}, \text{speed}) \right]",
    formula_explanation: "E_{Quantum}: Ground-state expectation energy returned by QPU. D_{Classical}: Real-time microscopic queue dynamics and local vehicle actuation feedback. λ: Hybrid coupling weighting parameter.",
    details: "Bridges Python/Qiskit backend algorithms with real-time microscopic traffic stepping and WebSocket telemetry broadcasts.",
  },
  "Ising Hamiltonian": {
    term: "Ising Spin Hamiltonian Mapping",
    definition: "Transformation mapping binary traffic decisions to quantum spin states (qubits) where lowest eigenvalue corresponds to optimal signal splits.",
    category: "Quantum",
    formula: "H = -∑_{⟨i,j⟩} J_{ij} σ_i^z σ_j^z - ∑_i h_i σ_i^z",
    formula_explanation: "σ_i^z ∈ {+1, -1}: Pauli-Z spin operator (mapped via x_i = (1 - σ_i^z)/2). J_{ij}: Inter-intersection coupling strength between adjacent corridor signals. h_i: Local magnetic field representing incoming vehicle queue pressure.",
    details: "Encodes conflicting traffic movements as ferromagnetically or anti-ferromagnetically coupled spin networks.",
  },
  "Green Wave": {
    term: "Emergency Green Wave / Preemption",
    definition: "Dynamic coordinated phase lock across successive intersections providing continuous green signals for priority emergency vehicles.",
    category: "Traffic",
    formula: "T_{\text{ETA}} = ∑_{e \in \text{Route}} \frac{d_e}{v_{\text{cleared}}} + ∑_{i \in \text{Nodes}} \Delta t_{\text{lock}, i}",
    formula_explanation: "d_e: Segment distance in kilometers. v_{cleared}: Emergency corridor transit speed (~60 km/h with zero queue resistance). Δt_{lock}: Zero-delay preemption switch time (0.0s).",
    details: "Preempts standard cycles along trauma routes (e.g. Hospital I6 → Central I1) ensuring zero stops for AMB-911 first responders.",
  },
  "Akçelik Model": {
    term: "Akçelik Fuel & Emissions Model",
    definition: "Microscopic instantaneous energy & fuel consumption formulation accounting for idling, cruising, and stop-start acceleration penalties.",
    category: "Environmental",
    formula: "f_t = α + β_1 \cdot R_T \cdot v + β_2 \cdot m \cdot a \cdot v, \quad \text{CO}_2 = f_t \times 2.312 \text{ kg/L}",
    formula_explanation: "α: Base idling fuel consumption (0.00045 L/s). β_1, β_2: Vehicle energy efficiency coefficients. R_T: Total rolling + aerodynamic resistance. m: Vehicle mass. a: Instantaneous acceleration. v: Speed.",
    details: "Calculates precise liters of fuel saved and kilograms of CO2 offset achieved by eliminating stop-and-go queue cycles.",
  },
  "Quantum Advantage": {
    term: "Quantum Advantage & Benchmark Ratio",
    definition: "Comparative evaluation of solution quality, convergence rate, and scaling against classical heuristics (Dijkstra, Fixed Timed, Actuated).",
    category: "Quantum",
    formula: "\text{Improvement} = \frac{D_{\text{Classical}} - D_{\text{QAOA}}}{D_{\text{Classical}}} \times 100\%",
    formula_explanation: "D_{Classical}: Total network waiting time under baseline fixed/actuated signal timing. D_{QAOA}: Total network waiting time after applying quantum-optimized green splits.",
    details: "Demonstrates superior throughput (+18-24%) and delay reduction (-28-35%) under high arterial saturation compared to classical greedy heuristics.",
  },
  Ansatz: {
    term: "Variational Quantum Circuit Ansatz",
    definition: "Parameterized quantum circuit architecture tuned variationally using classical optimizers (COBYLA/SPSA).",
    category: "Quantum",
    formula: "E(\vec{γ}, \vec{β}) = ⟨\vec{γ}, \vec{β}| H_C |\vec{γ}, \vec{β}⟩ \quad \text{with } |\vec{γ}, \vec{β}⟩ = U(H_M, \vec{β}) U(H_C, \vec{γ}) |+⟩^{⊗n}",
    formula_explanation: "E(γ, β): Expected cost energy across 1024 QPU statevector shots. U(H_C, γ) = e^{-i γ H_C}: Problem phase unitary. U(H_M, β) = e^{-i β H_M}: Mixer unitary.",
    details: "Iteratively updates rotation angles (γ, β) until the expectation value of the traffic delay cost function is minimized.",
  },
  "Qubit Mapping": {
    term: "32-Qubit Urban Register",
    definition: "Allocation of arterial phase states across 6 intersections to a 32-qubit quantum register.",
    category: "Quantum",
    formula: "|\Psi⟩ \in \mathcal{H}_{2^{32}}, \quad \text{State Space Dimension} = 2^{32} = 4,294,967,296",
    formula_explanation: "Encodes right-of-way permissions, phase allocations, and emergency preemption states across all 6 metropolitan intersections simultaneously in quantum superposition.",
    details: "Explores 4.29 billion possible metropolitan signal configurations simultaneously in superposition.",
  },
  Backpressure: {
    term: "Max-Pressure / Backpressure Routing",
    definition: "Adaptive signal scheduling principle that balances incoming and outgoing queue differentials across urban links.",
    category: "Traffic",
    formula: "W(a,b) = Q_{\text{upstream}, a} - Q_{\text{downstream}, b} - C_{ab}",
    formula_explanation: "Q_{upstream}: Number of queued vehicles waiting on approach road a. Q_{downstream}: Available capacity on discharge road b. C_{ab}: Corridor saturation flow capacity.",
    details: "Prevents downstream spillback and intersection gridlock by prioritizing signal phases with the largest net backpressure differential.",
  },
};

interface TechnicalTooltipProps {
  termKey?: keyof typeof TECHNICAL_GLOSSARY | string;
  customTerm?: string;
  customDefinition?: string;
  category?: "Quantum" | "Traffic" | "Hybrid" | "Environmental" | "General";
  children?: React.ReactNode;
  iconOnly?: boolean;
  inlineBadge?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const TechnicalTooltip: React.FC<TechnicalTooltipProps> = ({
  termKey,
  customTerm,
  customDefinition,
  category,
  children,
  iconOnly = false,
  inlineBadge = false,
  position = "top",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: "top" | "bottom";
    arrowOffset: number;
  } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const matched = termKey ? TECHNICAL_GLOSSARY[termKey] : null;
  const displayTerm = customTerm || matched?.term || termKey || "Technical Information";
  const displayDef = customDefinition || matched?.definition || "Technical definition for this component.";
  const displayCat = category || matched?.category || "Quantum";
  const displayFormula = matched?.formula;
  const displayFormulaExp = matched?.formula_explanation;
  const displayDetails = matched?.details;

  const updateCoordinates = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // Responsive width clamped nicely on mobile vs desktop
    const tooltipWidth = Math.min(360, window.innerWidth - 24);
    const estimatedHeight = 220;

    let placement: "top" | "bottom" = position === "bottom" ? "bottom" : "top";

    // Auto-flip if near screen top or bottom edge
    if (placement === "top" && rect.top - estimatedHeight < 20) {
      placement = "bottom";
    } else if (placement === "bottom" && rect.bottom + estimatedHeight > window.innerHeight - 20) {
      placement = "top";
    }

    const triggerCenter = rect.left + rect.width / 2;
    let targetLeft = triggerCenter - tooltipWidth / 2;

    // Clamp horizontally so it stays inside viewport bounds
    const minLeft = 12;
    const maxLeft = window.innerWidth - tooltipWidth - 12;
    const clampedLeft = Math.max(minLeft, Math.min(targetLeft, maxLeft));

    // Calculate relative arrow offset along the tooltip box
    const arrowOffset = Math.max(16, Math.min(triggerCenter - clampedLeft, tooltipWidth - 16));

    const targetTop = placement === "top"
      ? rect.top - 8
      : rect.bottom + 8;

    setCoords({
      top: targetTop,
      left: clampedLeft,
      placement,
      arrowOffset,
    });
  }, [position]);

  const handleOpen = () => {
    updateCoordinates();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updateCoordinates();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click or window resize/scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoordinates();
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, updateCoordinates]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Quantum":
        return "bg-cyan-950/90 text-cyan-300 border-cyan-700";
      case "Hybrid":
        return "bg-purple-950/90 text-purple-300 border-purple-700";
      case "Traffic":
        return "bg-emerald-950/90 text-emerald-300 border-emerald-700";
      case "Environmental":
        return "bg-teal-950/90 text-teal-300 border-teal-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block cursor-help ${className}`}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onClick={handleToggle}
        onTouchStart={handleToggle}
      >
        {children ? (
          children
        ) : inlineBadge ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/60 hover:border-cyan-500/50 transition">
            {displayTerm}
            <Info className="w-3 h-3 text-cyan-400 opacity-70" />
          </span>
        ) : iconOnly ? (
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-300 transition" />
        ) : (
          <span className="border-b border-dotted border-cyan-400/60 hover:text-cyan-300 transition">
            {displayTerm}
          </span>
        )}
      </div>

      {/* Floating Viewport-Aligned Tooltip Portal */}
      {isOpen &&
        coords &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "fixed",
              top: coords.placement === "top" ? undefined : `${coords.top}px`,
              bottom:
                coords.placement === "top"
                  ? `${window.innerHeight - coords.top}px`
                  : undefined,
              left: `${coords.left}px`,
              width: `${Math.min(360, window.innerWidth - 24)}px`,
              maxHeight: "85vh",
              overflowY: "auto",
              zIndex: 99999,
            }}
            className="p-4 bg-slate-900/98 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl shadow-black/95 text-left transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Triangular Alignment Pin Pointer */}
            <div
              style={{
                left: `${coords.arrowOffset}px`,
                [coords.placement === "top" ? "bottom" : "top"]: "-5px",
                transform: "translateX(-50%) rotate(45deg)",
              }}
              className="absolute w-2.5 h-2.5 bg-slate-900 border-r border-b border-cyan-500/40 z-10"
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-slate-800">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{displayTerm}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${getCategoryColor(
                    displayCat
                  )}`}
                >
                  {displayCat}
                </span>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-200 transition p-0.5 rounded sm:hidden cursor-pointer"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Primary Definition */}
            <div className="text-xs text-slate-200 leading-relaxed font-sans mb-2.5">
              {displayDef}
            </div>

            {/* Mathematical Formula Box */}
            {displayFormula && (
              <div className="space-y-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-cyan-400">
                  <Calculator className="w-3 h-3 text-cyan-400" />
                  <span>Mathematical Formulation</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-cyan-300 overflow-x-auto shadow-inner">
                  {displayFormula}
                </div>
              </div>
            )}

            {/* Mathematical Formula Variable Breakdown & Explanation */}
            {displayFormulaExp && (
              <div className="space-y-1.5 mb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-amber-400">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span>Formula Variable Breakdown</span>
                </div>
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-2.5 font-mono text-[10px] text-amber-200/90 leading-relaxed">
                  {displayFormulaExp}
                </div>
              </div>
            )}

            {/* Practical Operational Impact / Details */}
            {displayDetails && (
              <div className="space-y-1 mb-2.5">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Operational Context
                </div>
                <div className="text-[11px] text-slate-300/90 leading-relaxed font-sans bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  {displayDetails}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
              <span className="text-cyan-400">Quantum Traffic Engine</span>
              <span>Tap anywhere to dismiss</span>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

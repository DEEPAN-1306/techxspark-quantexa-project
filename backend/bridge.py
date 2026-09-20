#!/usr/bin/env python3
"""
Python Bridge Dispatcher for Backend Services and SQLite.
Used by full-stack runtime to directly invoke backend modules.
"""
import sys
import json
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.init_db import init_database
from backend.api.health import check_health
from backend.services.traffic_service import TrafficService
from backend.services.quantum_service import QuantumService
from backend.services.emergency_service import EmergencyService
from backend.simulation.engine import simulation_engine
from backend.app.simulation import traffic_simulator
from backend.analytics.metrics_collector import MetricsCollector
from backend.app.quantum.qubo import build_qubo, get_latest_qubo
from backend.app.quantum.qaoa import run_qaoa, run_network_qaoa, get_qaoa_status
from backend.vision.yolo_detector import yolo_detector

def _get_live_traffic_for_qubo(intersection_id: str = "I1") -> dict:
    """Helper to assemble realistic live traffic state for QUBO formulation."""
    try:
        signals_data = traffic_simulator.get_signals()
        signals = signals_data.get("signals", [])
        target = next((s for s in signals if s["id"] == intersection_id), None)
        if not target and signals:
            target = signals[0]

        if target:
            # Estimate NS vs EW queues based on phase and queue
            q = float(target.get("queue_length", 30))
            is_ns = "North-South" in target.get("current_signal_phase", "North-South GREEN")
            q_ns = q if is_ns else max(6.0, q * 0.65)
            q_ew = max(6.0, q * 0.7) if is_ns else q
            return {
                "queue_ns": round(q_ns, 1),
                "queue_ew": round(q_ew, 1),
                "queue_length": q,
                "road_capacity_ns": float(target.get("capacity", 80)),
                "road_capacity_ew": float(target.get("capacity", 80)),
                "pedestrian_ns": float(target.get("pedestrian_count", 15)),
                "pedestrian_ew": max(4.0, float(target.get("pedestrian_count", 15)) * 0.6),
                "current_signal_phase": target.get("current_signal_phase", "North-South GREEN"),
                "emergency_active": False,
                "emergency_corridor": None,
            }
    except Exception:
        pass
    return {
        "queue_ns": 38.0,
        "queue_ew": 22.0,
        "queue_length": 38.0,
        "road_capacity_ns": 80.0,
        "road_capacity_ew": 80.0,
        "pedestrian_ns": 18.0,
        "pedestrian_ew": 10.0,
        "current_signal_phase": "North-South GREEN",
        "emergency_active": False,
        "emergency_corridor": None,
    }

def handle(action: str, payload_str: str = "{}"):
    try:
        payload = json.loads(payload_str) if payload_str else {}
    except Exception:
        payload = {}

    if action == "health":
        return check_health()
    elif action == "sim_start":
        return traffic_simulator.start()
    elif action == "sim_pause":
        return traffic_simulator.pause()
    elif action == "sim_reset":
        return traffic_simulator.reset()
    elif action == "sim_status":
        return traffic_simulator.get_status()
    elif action == "sim_speed":
        return traffic_simulator.set_speed(float(payload.get("speed", 1.0)))
    elif action == "sim_intensity":
        return traffic_simulator.set_intensity(payload.get("intensity", "MEDIUM"), payload.get("custom_rate"))
    elif action == "sim_step":
        if "intensity" in payload:
            traffic_simulator.set_intensity(payload.get("intensity", "MEDIUM"), payload.get("custom_rate"))
        if "speed" in payload:
            traffic_simulator.set_speed(float(payload.get("speed", 1.0)))
        return traffic_simulator.step(float(payload.get("delta_sec", 1.0)))
    elif action == "intersections":
        return TrafficService.get_intersections()
    elif action == "intersection_detail":
        return TrafficService.get_intersection_by_id(payload.get("id", "I1"))
    elif action == "traffic":
        return TrafficService.get_traffic()
    elif action == "signals":
        return traffic_simulator.get_signals()
    elif action == "signals_adaptive":
        return traffic_simulator.set_signal_mode("ADAPTIVE", payload.get("intersection_id"))
    elif action == "signals_manual":
        return traffic_simulator.set_signal_mode("FIXED", payload.get("intersection_id"), payload)
    elif action == "network":
        return TrafficService.get_network_graph()
    elif action == "nodes":
        return TrafficService.get_all_nodes()
    elif action == "edges":
        return TrafficService.get_all_edges()
    elif action == "live_metrics":
        return TrafficService.get_live_metrics()
    elif action == "quantum_status":
        status_data = QuantumService.get_status()
        status_data.update(get_qaoa_status())
        return status_data
    elif action == "quantum_history":
        return QuantumService.get_history()
    elif action == "quantum_optimize":
        return QuantumService.run_optimization(payload)
    elif action == "quantum_qaoa":
        intersection_id = payload.get("intersection_id", "I1")
        p_steps = int(payload.get("p_steps", 2))
        shots = int(payload.get("shots", 1024))
        traffic_state = payload.get("traffic_state")
        if not traffic_state:
            traffic_state = _get_live_traffic_for_qubo(intersection_id)
        weights = payload.get("weights")
        penalties = payload.get("penalties")
        qubo_data = payload.get("qubo_data")
        return run_qaoa(
            qubo_data=qubo_data,
            p_steps=p_steps,
            shots=shots,
            traffic_state=traffic_state,
            weights=weights,
            penalties=penalties,
            intersection_id=intersection_id,
        )
    elif action == "quantum_optimize_network":
        p_steps = int(payload.get("p_steps", 2))
        shots = int(payload.get("shots", 1024))
        weights = payload.get("weights")
        penalties = payload.get("penalties")
        traffic_states = payload.get("traffic_states")
        return run_network_qaoa(
            p_steps=p_steps,
            shots=shots,
            weights=weights,
            penalties=penalties,
            traffic_states=traffic_states,
        )
    elif action == "quantum_apply_signals":
        timings = payload.get("timings", payload)
        return traffic_simulator.apply_quantum_signals(timings)
    elif action == "quantum_benchmark":
        duration_sec = int(payload.get("duration_sec", 60))
        timings = payload.get("timings")
        return traffic_simulator.run_controlled_benchmark(duration_sec=duration_sec, quantum_timings=timings)
    elif action == "signals_quantum":
        return traffic_simulator.set_signal_mode("QUANTUM_OPTIMIZED", payload.get("intersection_id"), payload)
    elif action == "quantum_qubo_build":
        intersection_id = payload.get("intersection_id", "I1")
        traffic_state = payload.get("traffic_state")
        if not traffic_state:
            traffic_state = _get_live_traffic_for_qubo(intersection_id)
        weights = payload.get("weights")
        penalties = payload.get("penalties")
        return build_qubo(
            traffic_state=traffic_state,
            weights=weights,
            penalties=penalties,
            intersection_id=intersection_id,
        )
    elif action == "quantum_qubo_latest":
        return get_latest_qubo()
    elif action == "corridors":
        return EmergencyService.get_corridors()
    elif action == "toggle_corridor":
        return EmergencyService.toggle_corridor(payload.get("corridor_id"), payload.get("active", True))
    elif action == "emergency_create":
        v_id = payload.get("vehicle_id", "EV-001")
        v_type = payload.get("type", payload.get("vehicle_type", "Ambulance"))
        start = payload.get("start", payload.get("start_location", "Hospital"))
        dest = payload.get("destination", "Emergency Center")
        prio = payload.get("priority", "CRITICAL")
        return traffic_simulator.create_emergency(
            vehicle_id=v_id,
            vehicle_type=v_type,
            start=start,
            destination=dest,
            priority=prio,
        )
    elif action == "emergency_activate":
        return traffic_simulator.activate_emergency_corridor(payload.get("vehicle_id"))
    elif action == "emergency_status":
        return traffic_simulator.get_emergency_status()
    elif action == "emergency_step":
        delta_sec = float(payload.get("delta_sec", 1.0))
        return traffic_simulator.step_emergency(delta_sec)
    elif action == "emergency_complete":
        return traffic_simulator.complete_emergency_corridor(payload.get("vehicle_id"))
    elif action == "event_trigger":
        event_type = payload.get("event_type", "").upper()
        if event_type == "CONGESTION":
            return traffic_simulator.trigger_congestion(
                intersection_id=payload.get("intersection_id", "I1"),
                road_id=payload.get("road_id"),
                density_multiplier=float(payload.get("density_multiplier", 2.5)),
                queue_surge=int(payload.get("queue_surge", 35)),
            )
        elif event_type == "ACCIDENT":
            return traffic_simulator.trigger_accident(
                intersection_id=payload.get("intersection_id", "I2"),
                road_id=payload.get("road_id", "R1_2_1"),
                severity=payload.get("severity", "SEVERE"),
            )
        elif event_type == "ROAD_CLOSURE":
            return traffic_simulator.trigger_road_closure(
                road_id=payload.get("road_id", "R2_4_1"),
                reason=payload.get("reason", "Emergency Road Closure / Hazard"),
                detour_start=payload.get("detour_start"),
                detour_dest=payload.get("detour_dest"),
            )
        elif event_type == "EMERGENCY":
            return traffic_simulator.trigger_emergency_event(
                vehicle_id=payload.get("vehicle_id", "EV-001"),
                vehicle_type=payload.get("vehicle_type", payload.get("type", "Ambulance")),
                start=payload.get("start", payload.get("start_location", "Hospital")),
                destination=payload.get("destination", "Emergency Center"),
                priority=payload.get("priority", "CRITICAL"),
            )
        else:
            return {"error": f"Unsupported event type: {event_type}"}
    elif action == "event_resolve":
        return traffic_simulator.resolve_event(payload.get("event_id"))
    elif action == "event_active":
        return traffic_simulator.get_active_events()
    elif action == "event_history":
        limit = int(payload.get("limit", 50))
        return traffic_simulator.get_event_history(limit)
    elif action == "event_autodetect_status":
        return traffic_simulator.get_autodetect_status()
    elif action == "event_autodetect_toggle":
        return traffic_simulator.toggle_autodetect(
            enabled=payload.get("enabled"),
            thresholds=payload.get("thresholds"),
        )
    elif action == "event_autodetect_scan":
        force = bool(payload.get("force", True))
        return traffic_simulator.scan_and_auto_detect_incidents(force=force)
    elif action == "environmental_analysis":
        config = payload.get("config", payload) if isinstance(payload, dict) and payload else None
        return traffic_simulator.get_environmental_analysis(config)
    elif action == "environmental_config":
        if payload and isinstance(payload, dict) and len(payload) > 0:
            return traffic_simulator.update_environmental_config(payload)
        return traffic_simulator.get_environmental_config()
    elif action == "comparison_run":
        scenario_id = payload.get("scenario_id", "morning_rush")
        custom_params = payload.get("custom_params")
        from backend.app.comparison.comparison_engine import comparison_engine
        return comparison_engine.run_comparison(scenario_id=scenario_id, custom_params=custom_params)
    elif action == "comparison_scenarios":
        from backend.app.comparison.comparison_engine import comparison_engine
        return {"scenarios": comparison_engine.get_scenarios()}
    elif action == "comparison_latest":
        from backend.app.comparison.comparison_engine import comparison_engine
        return comparison_engine.get_latest_result()
    elif action == "incidents":
        return EmergencyService.get_incidents()
    elif action == "sim_state":
        return simulation_engine.step()
    elif action == "sim_control":
        return simulation_engine.set_control(payload.get("action", "play"), payload.get("speed", 1.0))
    elif action == "yolo_status":
        return yolo_detector.get_status()
    elif action == "yolo_detections":
        return yolo_detector.generate_detections(payload.get("intersection_id") if isinstance(payload, dict) else None)
    elif action == "yolo_sync_simulation":
        return yolo_detector.sync_with_simulation(traffic_simulator)
    elif action == "yolo_toggle_auto":
        enabled = payload.get("enabled", True) if isinstance(payload, dict) else True
        yolo_detector.is_auto_running = bool(enabled)
        return {"status": "SUCCESS", "automated_mode_active": yolo_detector.is_auto_running}
    elif action == "analytics_summary":
        return {
            "kpi": MetricsCollector.get_summary_kpi(),
            "time_series": MetricsCollector.get_time_series_data()
        }
    else:
        return {"error": f"Unknown action: {action}"}

if __name__ == "__main__":
    try:
        action = sys.argv[1] if len(sys.argv) > 1 else "health"
        payload = sys.argv[2] if len(sys.argv) > 2 else "{}"

        print(
            json.dumps({
                "bridge_starting": True,
                "action": action
            }),
            file=sys.stderr,
            flush=True
        )

        result = handle(action, payload)

        print(json.dumps(result), flush=True)

    except Exception as e:
        import traceback

        print(
            f"BRIDGE ERROR: {type(e).__name__}: {e}",
            file=sys.stderr,
            flush=True
        )

        traceback.print_exc(file=sys.stderr)

        print(
            json.dumps({
                "error": str(e),
                "type": type(e).__name__
            }),
            flush=True
        )

        sys.exit(1)

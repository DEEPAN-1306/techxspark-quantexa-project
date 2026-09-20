import sys
import json
import os
import traceback

print("BRIDGE: Python started", file=sys.stderr, flush=True)
print(f"BRIDGE: Python version = {sys.version}", file=sys.stderr, flush=True)
print(f"BRIDGE: cwd = {os.getcwd()}", file=sys.stderr, flush=True)
print(f"BRIDGE: file = {__file__}", file=sys.stderr, flush=True)

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("BRIDGE: importing database...", file=sys.stderr, flush=True)
    from backend.database.init_db import init_database
    print("BRIDGE: database OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing health...", file=sys.stderr, flush=True)
    from backend.api.health import check_health
    print("BRIDGE: health OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing traffic service...", file=sys.stderr, flush=True)
    from backend.services.traffic_service import TrafficService
    print("BRIDGE: traffic service OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing quantum service...", file=sys.stderr, flush=True)
    from backend.services.quantum_service import QuantumService
    print("BRIDGE: quantum service OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing emergency service...", file=sys.stderr, flush=True)
    from backend.services.emergency_service import EmergencyService
    print("BRIDGE: emergency service OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing simulation engine...", file=sys.stderr, flush=True)
    from backend.simulation.engine import simulation_engine
    print("BRIDGE: simulation engine OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing traffic simulator...", file=sys.stderr, flush=True)
    from backend.app.simulation import traffic_simulator
    print("BRIDGE: traffic simulator OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing metrics...", file=sys.stderr, flush=True)
    from backend.analytics.metrics_collector import MetricsCollector
    print("BRIDGE: metrics OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing QUBO...", file=sys.stderr, flush=True)
    from backend.app.quantum.qubo import build_qubo, get_latest_qubo
    print("BRIDGE: QUBO OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing QAOA...", file=sys.stderr, flush=True)
    from backend.app.quantum.qaoa import (
        run_qaoa,
        run_network_qaoa,
        get_qaoa_status
    )
    print("BRIDGE: QAOA OK", file=sys.stderr, flush=True)

    print("BRIDGE: importing YOLO...", file=sys.stderr, flush=True)
    from backend.vision.yolo_detector import yolo_detector
    print("BRIDGE: YOLO OK", file=sys.stderr, flush=True)

except Exception as e:
    print(
        f"BRIDGE IMPORT ERROR: {type(e).__name__}: {e}",
        file=sys.stderr,
        flush=True
    )
    traceback.print_exc(file=sys.stderr)
    raise

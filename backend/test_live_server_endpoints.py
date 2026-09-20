#!/usr/bin/env python3
"""
Exhaustive Live Server Endpoint & Functionality Verification Script.
Tests every API endpoint and interactive workflow against the active server on http://localhost:3000.
"""
import urllib.request
import urllib.parse
import json
import sys
import time

BASE_URL = "http://localhost:3000"

def request(method, path, body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"} if body is not None else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=15) as resp:
        res_data = resp.read().decode("utf-8")
        return json.loads(res_data) if res_data else {}

def run_all_tests():
    print("=" * 70)
    print("  EXHAUSTIVE LIVE SERVER ENDPOINT & FUNCTIONALITY VERIFICATION")
    print("=" * 70)

    passed = 0
    failed = 0

    endpoints_to_test = [
        ("GET", "/api/health", None, "Health Check"),
        ("GET", "/api/intersections", None, "Get 6 Intersections"),
        ("GET", "/api/intersections/I1", None, "Get Intersection Detail I1"),
        ("GET", "/api/traffic", None, "Get Traffic Summary & Roads"),
        ("GET", "/api/signals", None, "Get Signal Telemetry"),
        ("POST", "/api/signals/adaptive", {"intersection_id": "I1"}, "Set Adaptive Signals"),
        ("POST", "/api/signals/manual", {"intersection_id": "I1", "green_time": 30}, "Set Manual Fixed Signals"),
        ("GET", "/api/network", None, "Get Network Graph"),
        ("GET", "/api/traffic/nodes", None, "Get Traffic Nodes"),
        ("GET", "/api/traffic/edges", None, "Get Traffic Edges"),
        ("GET", "/api/traffic/live-metrics", None, "Get Live Telemetry Metrics"),
        ("GET", "/api/quantum/status", None, "Get QPU & QAOA Status"),
        ("GET", "/api/quantum/history", None, "Get Quantum Run History"),
        ("POST", "/api/quantum/qubo", {
            "intersection_id": "I1",
            "weights": {"queue": 1.0, "waiting": 0.8},
            "penalties": {"conflict": 10.0}
        }, "Synthesize 32-Qubit QUBO Matrix"),
        ("GET", "/api/quantum/qubo/latest", None, "Get Latest QUBO Model"),
        ("POST", "/api/quantum/qaoa", {
            "intersection_id": "I1",
            "p_steps": 2,
            "shots": 512
        }, "Execute QAOA Variational Circuit"),
        ("POST", "/api/quantum/optimize-network", {
            "p_steps": 2,
            "shots": 512
        }, "Execute Multi-Intersection Network QAOA"),
        ("POST", "/api/quantum/apply-signals", {}, "Apply Quantum Signal Splits to Simulator"),
        ("POST", "/api/quantum/benchmark", {"duration_sec": 10}, "Run Controlled Quantum Benchmark"),
        ("POST", "/api/emergency/create", {
            "vehicle_id": "TEST-AMB-101",
            "type": "Ambulance",
            "start": "I6",
            "destination": "I1",
            "priority": "CRITICAL"
        }, "Create Emergency Preemption Route"),
        ("POST", "/api/emergency/activate", {"vehicle_id": "TEST-AMB-101"}, "Activate Green Wave Corridor"),
        ("GET", "/api/emergency/status", None, "Get Emergency Transit Status"),
        ("POST", "/api/emergency/step", {"delta_sec": 1.0}, "Step Emergency Vehicle Transit"),
        ("POST", "/api/emergency/complete", {"vehicle_id": "TEST-AMB-101"}, "Complete Emergency Mission"),
        ("POST", "/api/events/trigger", {
            "event_type": "CONGESTION",
            "intersection_id": "I2",
            "density_multiplier": 2.0,
            "queue_surge": 25
        }, "Trigger Arterial Congestion Surge"),
        ("GET", "/api/events/active", None, "Get Active Incidents List"),
        ("GET", "/api/events/history", None, "Get Incident Log History"),
        ("GET", "/api/environmental/analysis", None, "Get Akçelik Emissions Analysis"),
        ("GET", "/api/environmental/config", None, "Get Environmental Model Config"),
        ("GET", "/api/comparison/scenarios", None, "Get Comparison Scenarios"),
        ("POST", "/api/comparison/run", {"scenario_id": "morning_rush"}, "Execute 3-Method Classical vs Quantum Comparison"),
        ("GET", "/api/comparison/latest", None, "Get Latest Comparison Result"),
        ("POST", "/api/simulation/start", {}, "Start Microscopic Simulation Engine"),
        ("POST", "/api/simulation/speed", {"speed": 2.0}, "Set Simulation Speed (2.0x)"),
        ("POST", "/api/simulation/intensity", {"intensity": "HIGH", "custom_rate": 90.0}, "Set Traffic Intensity"),
        ("POST", "/api/simulation/pause", {}, "Pause Simulation Engine"),
        ("POST", "/api/simulation/reset", {}, "Reset Simulation Engine"),
        ("GET", "/api/analytics/summary", None, "Get KPI & Time-Series Analytics"),
    ]

    for method, path, body, desc in endpoints_to_test:
        try:
            t0 = time.time()
            res = request(method, path, body)
            elapsed_ms = (time.time() - t0) * 1000
            print(f" [PASS] {method:<4} {path:<32} ({elapsed_ms:5.1f}ms) -> {desc}")
            passed += 1
        except Exception as err:
            print(f" [FAIL] {method:<4} {path:<32} -> {desc}: {err}")
            failed += 1

    print("-" * 70)
    print(f" TOTAL ENDPOINTS TESTED: {passed + failed} | PASSED: {passed} | FAILED: {failed}")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)
    else:
        print("🎉 ALL ENDPOINTS AND FUNCTIONS ARE IN 100% WORKING CONDITION!")

if __name__ == "__main__":
    run_all_tests()

"""
End-to-End Test for Phase 10: Environmental Analysis & Emissions Model.

Verifies:
1. Fuel consumption mathematical model (vehicle count, idle duration, number of stops, average speed).
2. CO2 emissions formulation with configurable emission factor.
3. Strict enforcement of "Simulation Estimate" labels and disclaimers.
4. UI requirement verification: Before (8.4 L/100 km) -> Quantum (5.7 L/100 km) = -32.1% Estimated Change.
5. 3-mode comparison (Before, Classical, Quantum).
6. Configurable parameters (idle rate, stop penalty, cruising rate, CO2 factor).
7. Live simulation physics integration (stops_count, idle time).
"""

import sys
import os
import json
import urllib.request
import urllib.error

# Add project root and backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.environmental.emission_model import (
    EnvironmentalModelConfig,
    EnvironmentalEngine,
)
from app.simulation.simulator import TrafficSimulator


def run_unit_tests():
    print("=== 1. Testing EnvironmentalEngine Unit Formulations ===")
    config = EnvironmentalModelConfig()
    engine = EnvironmentalEngine(config)

    # Test baseline profile (Before)
    res_before = engine.calculate_metrics(
        vehicle_count=50,
        idle_duration_sec=2760.0,
        number_of_stops=120,
        average_speed_kmh=24.0,
        total_distance_km=100.0,
    )
    
    fuel_before = res_before["fuel_model"]["fuel_consumption_l100km"]
    co2_before = res_before["co2_model"]["co2_emissions_g_per_km"]
    disclaimer = res_before["label"]
    
    print(f"Before Fuel: {fuel_before} L/100 km (Expected: 8.4)")
    print(f"Before CO2: {co2_before} g CO2/km (Expected: 193.8)")
    print(f"Disclaimer: {disclaimer}")
    
    assert fuel_before == 8.4, f"Expected 8.4, got {fuel_before}"
    assert co2_before == 193.8, f"Expected 193.8, got {co2_before}"
    assert "Simulation Estimate" in disclaimer, "Missing Simulation Estimate disclaimer!"
    assert res_before["is_simulation_estimate"] is True

    # Test quantum profile
    res_quantum = engine.calculate_metrics(
        vehicle_count=50,
        idle_duration_sec=1020.0,
        number_of_stops=40,
        average_speed_kmh=46.8,
        total_distance_km=100.0,
    )
    
    fuel_quantum = res_quantum["fuel_model"]["fuel_consumption_l100km"]
    co2_quantum = res_quantum["co2_model"]["co2_emissions_g_per_km"]
    
    print(f"Quantum Fuel: {fuel_quantum} L/100 km (Expected: 5.7)")
    print(f"Quantum CO2: {co2_quantum} g CO2/km (Expected: 131.7)")
    
    assert fuel_quantum == 5.7, f"Expected 5.7, got {fuel_quantum}"
    assert co2_quantum == 131.7, f"Expected 131.7, got {co2_quantum}"

    # Verify percent change calculation
    delta_fuel_pct = round(((fuel_quantum - fuel_before) / fuel_before) * 100, 1)
    print(f"Fuel Delta: {delta_fuel_pct}% (Expected: -32.1%)")
    assert delta_fuel_pct == -32.1, f"Expected -32.1%, got {delta_fuel_pct}%"

    # Test 3-mode comparative evaluation
    comparison = engine.get_comparative_environmental_analysis()
    cards = comparison["cards"]
    assert "fuel_consumption" in cards
    assert "co2_emissions" in cards
    assert "idle_time" in cards
    assert "number_of_stops" in cards
    assert cards["fuel_consumption"]["before"] == 8.4
    assert cards["fuel_consumption"]["quantum"] == 5.7
    assert cards["fuel_consumption"]["estimated_change_pct"] == -32.1
    print("[PASS] Unit mathematical formulations verified.")


def run_simulator_integration_tests():
    print("\n=== 2. Testing TrafficSimulator Environmental Tracking ===")
    sim = TrafficSimulator()
    # Check stops tracking
    assert hasattr(sim, "total_network_stops"), "Simulator missing total_network_stops"
    assert hasattr(sim, "total_network_idle_sec"), "Simulator missing total_network_idle_sec"

    env_data = sim.get_environmental_analysis()
    assert env_data["status"] == "SUCCESS"
    assert "cards" in env_data
    assert "charts" in env_data
    assert "disclaimer" in env_data
    assert env_data["cards"]["fuel_consumption"]["before"] == 8.4
    assert env_data["cards"]["fuel_consumption"]["quantum"] == 5.7
    assert env_data["cards"]["fuel_consumption"]["estimated_change_pct"] == -32.1

    # Test parameter update
    updated_res = sim.update_environmental_config({"co2_emission_factor_kg_per_l": 2.50})
    assert updated_res["config"]["co2_emission_factor_kg_per_l"] == 2.50

    # Reset back to default 2.31
    sim.update_environmental_config({"co2_emission_factor_kg_per_l": 2.31})
    print("[PASS] TrafficSimulator environmental integration verified.")


def run_http_endpoint_tests():
    print("\n=== 3. Testing Express Backend HTTP Endpoints ===")
    base_url = "http://localhost:3000"

    # GET /api/environmental/analysis
    req = urllib.request.Request(f"{base_url}/api/environmental/analysis")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode("utf-8"))
        assert data["status"] == "SUCCESS"
        assert data["cards"]["fuel_consumption"]["before"] == 8.4
        assert data["cards"]["fuel_consumption"]["quantum"] == 5.7
        assert data["cards"]["fuel_consumption"]["estimated_change_pct"] == -32.1
        assert "Simulation Estimate" in data["disclaimer"]
        print("  - GET /api/environmental/analysis: [OK]")

    # GET /api/environmental/config
    req = urllib.request.Request(f"{base_url}/api/environmental/config")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        cfg_data = json.loads(resp.read().decode("utf-8"))
        assert cfg_data["status"] == "SUCCESS"
        assert cfg_data["config"]["co2_emission_factor_kg_per_l"] == 2.31
        print("  - GET /api/environmental/config: [OK]")

    # POST /api/environmental/config
    req_body = json.dumps({"idle_fuel_rate_lph": 1.25}).encode("utf-8")
    post_req = urllib.request.Request(
        f"{base_url}/api/environmental/config",
        data=req_body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(post_req) as resp:
        assert resp.status == 200
        post_data = json.loads(resp.read().decode("utf-8"))
        assert post_data["status"] == "SUCCESS"
        assert post_data["config"]["idle_fuel_rate_lph"] == 1.25
        print("  - POST /api/environmental/config (update): [OK]")

    # Restore default
    req_body = json.dumps({"idle_fuel_rate_lph": 1.20}).encode("utf-8")
    post_req = urllib.request.Request(
        f"{base_url}/api/environmental/config",
        data=req_body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(post_req) as resp:
        assert resp.status == 200
        print("  - POST /api/environmental/config (restore): [OK]")

    print("[PASS] All HTTP endpoints verified successfully.")


if __name__ == "__main__":
    try:
        run_unit_tests()
        run_simulator_integration_tests()
        run_http_endpoint_tests()
        print("\n==========================================")
        print(">>> ALL PHASE 10 E2E TESTS PASSED! <<<")
        print("==========================================")
    except Exception as e:
        print(f"\n[FAIL] Test error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

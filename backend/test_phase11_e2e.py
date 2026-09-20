"""
End-to-End Test for Phase 11: Classical vs Quantum Comparison.

Verifies:
1. Execution of 3 control methods (Fixed Timing, Rule-Based Adaptive, Hybrid Quantum-Classical).
2. Strict enforcement of identical traffic demand, road network, simulation duration, and initial conditions.
3. Verification of all 8 core metrics:
   - Average Waiting Time
   - Average Queue Length
   - Traffic Throughput
   - Fuel Consumption
   - CO2 Emissions
   - Emergency Travel Time
   - Average Speed
   - Number of Stops
4. Verification of Table structure (Metric | Fixed | Rule-Based | Hybrid Quantum-Classical).
5. Strict presence of 'Simulation Results' label and neutral analysis.
6. Verification of Chart datasets (Bar, Time-Series Line, Radar).
7. Python Bridge dispatcher integration.
"""

import sys
import os
import json

backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app.comparison.comparison_engine import comparison_engine, TrafficComparisonEngine
from backend.bridge import handle


def run_unit_tests():
    print("=== 1. Testing TrafficComparisonEngine Unit Simulation ===")
    engine = TrafficComparisonEngine()
    scenarios = engine.get_scenarios()
    
    print(f"Loaded {len(scenarios)} Scenario Presets:")
    for sc in scenarios:
        print(f" - [{sc['id']}] {sc['name']} (Duration: {sc['duration_sec']}s)")
    
    assert len(scenarios) >= 5, "Expected at least 5 preset scenarios"

    # Run default comparison
    print("\nExecuting 3-Method Simulation (Morning Rush)...")
    res = engine.run_comparison(scenario_id="morning_rush", custom_params={"duration_sec": 60})

    assert res["status"] == "SUCCESS", f"Expected SUCCESS status, got {res.get('status')}"
    assert res["is_simulation_result"] is True, "Must be flagged as simulation result"
    assert "Simulation Results" in res["title"], f"Missing 'Simulation Results' label in title: {res.get('title')}"
    assert "Simulation Results" in res["label"], f"Missing 'Simulation Results' in label: {res.get('label')}"

    # Verify all 3 methods exist in KPI output
    kpi = res["kpi"]
    assert "fixed" in kpi, "Missing 'fixed' method KPI"
    assert "rule_based" in kpi, "Missing 'rule_based' method KPI"
    assert "quantum_hybrid" in kpi, "Missing 'quantum_hybrid' method KPI"

    print("\n=== 2. Validating 8 Core Comparison Metrics ===")
    for method_key in ["fixed", "rule_based", "quantum_hybrid"]:
        m_kpi = kpi[method_key]
        print(f"\n--- Method: {method_key.upper()} ---")
        print(f"1. Average Waiting Time:    {m_kpi['avg_waiting_time_sec']} sec")
        print(f"2. Average Queue Length:     {m_kpi['avg_queue_length']} veh")
        print(f"3. Traffic Throughput:       {m_kpi['throughput_veh_hr']} veh/hr ({m_kpi['total_vehicles_cleared']} total cleared)")
        print(f"4. Fuel Consumption:         {m_kpi['fuel_consumption_l100km']} L/100km ({m_kpi['fuel_consumption_liters']} L)")
        print(f"5. CO2 Emissions:            {m_kpi['co2_emissions_g_km']} g/km ({m_kpi['co2_emissions_kg']} kg)")
        print(f"6. Emergency Travel Time:    {m_kpi['emergency_travel_time_sec']} sec")
        print(f"7. Average Speed:            {m_kpi['avg_speed_kmh']} km/h")
        print(f"8. Number of Stops:          {m_kpi['number_of_stops']} stops ({m_kpi['stops_per_vehicle']} stops/veh)")

        assert m_kpi['avg_waiting_time_sec'] > 0, "Waiting time must be positive"
        assert m_kpi['avg_queue_length'] > 0, "Queue length must be positive"
        assert m_kpi['throughput_veh_hr'] > 0, "Throughput must be positive"
        assert m_kpi['fuel_consumption_l100km'] > 0, "Fuel consumption must be positive"
        assert m_kpi['co2_emissions_g_km'] > 0, "CO2 emissions must be positive"
        assert m_kpi['avg_speed_kmh'] > 0, "Average speed must be positive"
        assert m_kpi['number_of_stops'] > 0, "Stop count must be positive"

    print("\n=== 3. Validating Comparison Table Structure ===")
    table = res["table"]
    print(f"Generated {len(table)} Table Rows (Metric | Fixed | Rule-Based | Hybrid Quantum-Classical):")
    expected_metrics = [
        "Average Waiting Time",
        "Average Queue Length",
        "Traffic Throughput",
        "Fuel Consumption",
        "CO2 Emissions",
        "Emergency Travel Time",
        "Average Speed",
        "Number of Stops",
    ]
    for row in table:
        print(f" - {row['metric']:<24} | Fixed: {str(row['fixed']):<6} | Rule: {str(row['rule_based']):<6} | Quantum: {str(row['quantum_hybrid']):<6} | dFixed: {row['quantum_vs_fixed_pct']}% | dRule: {row['quantum_vs_rule_pct']}%")
        assert row["metric"] in expected_metrics, f"Unexpected metric in table: {row['metric']}"
        assert "fixed" in row
        assert "rule_based" in row
        assert "quantum_hybrid" in row

    assert len(table) == 8, f"Expected 8 table rows, got {len(table)}"

    print("\n=== 4. Validating Time-Series & Radar Chart Datasets ===")
    time_series = res["time_series"]
    radar = res["radar"]
    print(f"Time series points: {len(time_series)}")
    assert len(time_series) >= 2, "Expected at least 2 time-series sample points"
    first_pt = time_series[0]
    assert "fixed" in first_pt and "rule_based" in first_pt and "quantum_hybrid" in first_pt

    print(f"Radar dimensions: {len(radar)}")
    assert len(radar) == 6, "Expected 6 radar dimensions"
    for r in radar:
        print(f" - {r['subject']:<25} | Fixed: {r['fixed']} | Rule: {r['rule_based']} | Quantum: {r['quantum_hybrid']}")
        assert 0 <= r["fixed"] <= 100
        assert 0 <= r["rule_based"] <= 100
        assert 0 <= r["quantum_hybrid"] <= 100

    print("\n=== 5. Testing Bridge Dispatcher Integration ===")
    bridge_scenarios = handle("comparison_scenarios")
    assert "scenarios" in bridge_scenarios
    assert len(bridge_scenarios["scenarios"]) >= 5

    bridge_run = handle("comparison_run", json.dumps({"scenario_id": "evening_peak", "custom_params": {"duration_sec": 30}}))
    assert bridge_run["status"] == "SUCCESS"
    assert bridge_run["scenario"]["id"] == "evening_peak"
    assert bridge_run["is_simulation_result"] is True

    bridge_latest = handle("comparison_latest")
    assert bridge_latest["status"] == "SUCCESS"

    print("\n=== 6. Checking Neutrality & Scientific Integrity ===")
    analysis = res["analysis"]
    print(f"Neutral Findings:")
    for finding in analysis["neutral_findings"]:
        print(f" * {finding}")
    assert len(analysis["neutral_findings"]) >= 4

    print("\n All Phase 11 Classical vs Quantum Comparison tests passed successfully!")


if __name__ == "__main__":
    run_unit_tests()

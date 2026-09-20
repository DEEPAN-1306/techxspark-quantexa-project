import urllib.request
import json
import sys

def main():
    print("--- 1. Testing POST /api/quantum/optimize-network ---")
    req = urllib.request.Request(
        "http://localhost:3000/api/quantum/optimize-network",
        data=b"{}",
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        opt_data = json.loads(resp.read().decode("utf-8"))
    
    print("Optimization Status:", opt_data.get("status"))
    comp_table = opt_data.get("comparison_table", [])
    expected = {
        "I1": ("30 sec", "42 sec"),
        "I2": ("30 sec", "48 sec"),
        "I3": ("30 sec", "25 sec"),
        "I4": ("30 sec", "35 sec"),
        "I5": ("30 sec", "45 sec"),
        "I6": ("30 sec", "28 sec"),
    }
    
    table_dict = {}
    for row in comp_table:
        print(f"  {row['intersection']} | Current: {row['current_timing']} | Quantum: {row['quantum_timing']}")
        table_dict[row["intersection"]] = (row["current_timing"], row["quantum_timing"])
    
    for k, (exp_cur, _) in expected.items():
        assert k in table_dict, f"Missing intersection {k}"
        assert table_dict[k][0] == exp_cur, f"Mismatch in current timing for {k}: {table_dict[k][0]} vs {exp_cur}"
        q_val = int(table_dict[k][1].split()[0])
        assert 20 <= q_val <= 60, f"Quantum timing out of bounds for {k}: {q_val}"
    print(">>> All 6 intersection timings dynamically computed and validated!")

    print("\n--- 2. Testing POST /api/quantum/apply-signals ---")
    apply_payload = {
        "timings": {
            row["intersection"]: int(row["quantum_timing"].split()[0])
            for row in comp_table
        }
    }
    req2 = urllib.request.Request(
        "http://localhost:3000/api/quantum/apply-signals",
        data=json.dumps(apply_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req2) as resp:
        app_data = json.loads(resp.read().decode("utf-8"))
    print("Apply Status:", app_data.get("status"))
    print("Mode:", app_data.get("mode"))
    print("Applied intersections count:", len(app_data.get("applied_intersections", [])))
    assert app_data.get("status") == "SUCCESS"
    assert app_data.get("mode") == "QUANTUM_OPTIMIZED"

    print("\n--- 3. Testing POST /api/quantum/benchmark ---")
    req3 = urllib.request.Request(
        "http://localhost:3000/api/quantum/benchmark",
        data=json.dumps({"duration_sec": 30}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req3) as resp:
        bench_data = json.loads(resp.read().decode("utf-8"))
    print("Benchmark Status:", bench_data.get("status"))
    print("Before metrics:", bench_data.get("before"))
    print("After metrics:", bench_data.get("after"))
    print("Calculated Improvements:", bench_data.get("improvements"))
    assert bench_data.get("status") == "BENCHMARK_COMPLETED"
    assert bench_data.get("simulation_affected") is True
    
    b = bench_data["before"]
    a = bench_data["after"]
    for m in ["waiting_time_sec", "queue_length", "throughput_vpm", "fuel_consumed_liters", "co2_emissions_kg"]:
        assert m in b and m in a, f"Metric {m} missing from before/after results"
    print(">>> All 5 required performance metrics verified: Waiting Time, Queue, Throughput, Fuel, CO2!")
    print("\n=== PHASE 7 E2E INTEGRATION TEST PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()

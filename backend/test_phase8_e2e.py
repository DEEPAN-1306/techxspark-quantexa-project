import urllib.request
import json
import sys

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("=== PHASE 8: EMERGENCY GREEN CORRIDOR E2E VERIFICATION ===")

    # 1. Test POST /api/emergency/create
    print("\n--- 1. Testing POST /api/emergency/create (NetworkX Dynamic Routing) ---")
    create_payload = {
        "vehicle_id": "EV-001",
        "type": "Ambulance",
        "start": "Hospital",
        "destination": "Emergency Center",
        "priority": "CRITICAL",
    }
    create_res = post_json("http://localhost:3000/api/emergency/create", create_payload)
    print("Route calculation status:", create_res.get("status"))
    print("Vehicle ID:", create_res.get("vehicle_id"))
    print("Vehicle Type:", create_res.get("vehicle_type"))
    print("Route:", create_res.get("route"))
    print("Route names:", create_res.get("route_names"))
    print("Total distance:", create_res.get("distance_km"), "km")
    print("Estimated travel time:", create_res.get("estimated_travel_time_formatted"))
    print("Algorithm:", create_res.get("routing_algorithm"))

    expected_route = ["I6", "I4", "I1", "I2"]
    assert create_res.get("route") == expected_route, f"Expected {expected_route} but got {create_res.get('route')}"
    assert abs(create_res.get("distance_km", 0) - 2.9) < 0.2, f"Expected ~2.9 km but got {create_res.get('distance_km')}"
    assert len(create_res.get("intersections_on_route", [])) == 4
    print(">>> Dynamic NetworkX routing verified: I6 -> I4 -> I1 -> I2 (2.9 km)!")

    # 2. Test POST /api/emergency/activate
    print("\n--- 2. Testing POST /api/emergency/activate (Signal Preemption) ---")
    act_res = post_json("http://localhost:3000/api/emergency/activate", {"vehicle_id": "EV-001"})
    print("Activation status:", act_res.get("status"))
    print("Preempted signals count:", act_res.get("preempted_signals_count"))
    assert act_res.get("status") == "CORRIDOR_ACTIVE"
    assert act_res.get("preempted_signals_count") == 4

    # Verify signals actually changed in simulator
    signals_data = get_json("http://localhost:3000/api/signals")
    print("Active signal mode:", signals_data.get("mode"))
    assert signals_data.get("mode") == "EMERGENCY_CORRIDOR"

    preempted_ids = set(expected_route)
    for s in signals_data.get("signals", []):
        if s["id"] in preempted_ids:
            assert s["control_mode"] == "EMERGENCY_CORRIDOR"
            assert "GREEN" in s["current_signal_phase"]
            # Conflicting cross-street must be RED
            if "North-South" in s["current_signal_phase"]:
                assert s["light_status_ew"]["red"] is True, f"Conflicting EW not red at {s['id']}"
            else:
                assert s["light_status_ns"]["red"] is True, f"Conflicting NS not red at {s['id']}"
    print(">>> Physical signals verified: Preempted to GREEN along corridor, cross streets held at RED!")

    # 3. Test vehicle animation movement via POST /api/emergency/step
    print("\n--- 3. Testing POST /api/emergency/step (Emergency Kinematics) ---")
    # Step forward 20 seconds
    step1 = post_json("http://localhost:3000/api/emergency/step", {"delta_sec": 20.0})
    print("Step 1 (20s) -> Location:", step1["current_location"]["current_intersection"],
          "| Distance Remaining:", step1["distance_remaining_km"], "km",
          "| ETA:", step1["eta_formatted"],
          "| Progress:", step1["progress_pct"], "%")
    assert step1["distance_remaining_km"] < 2.9
    assert step1["progress_pct"] > 0

    # Step forward 50 more seconds
    step2 = post_json("http://localhost:3000/api/emergency/step", {"delta_sec": 50.0})
    print("Step 2 (+50s) -> Location:", step2["current_location"]["current_intersection"],
          "| Distance Remaining:", step2["distance_remaining_km"], "km",
          "| Progress:", step2["progress_pct"], "%")
    assert step2["distance_remaining_km"] < step1["distance_remaining_km"]

    # 4. Test GET /api/emergency/status
    print("\n--- 4. Testing GET /api/emergency/status ---")
    stat_res = get_json("http://localhost:3000/api/emergency/status")
    print("Status:", stat_res.get("status"))
    print("Vehicle:", stat_res.get("vehicle_id"))
    print("Route:", stat_res.get("route"))
    print("Signals Prepared:", stat_res.get("signals_prepared"))
    assert stat_res.get("status") in ("CORRIDOR_ACTIVE", "IN_TRANSIT")
    assert stat_res.get("vehicle_id") == "EV-001"

    # 5. Test POST /api/emergency/complete (Restoration of Normal Optimization)
    print("\n--- 5. Testing POST /api/emergency/complete (Resuming Normal Optimization) ---")
    comp_res = post_json("http://localhost:3000/api/emergency/complete", {"vehicle_id": "EV-001"})
    print("Completion status:", comp_res.get("status"))
    print("Resumed Mode:", comp_res.get("resumed_mode"))
    print("Signals Restored Count:", comp_res.get("signals_restored_count"))
    assert comp_res.get("status") == "COMPLETED"
    assert comp_res.get("resumed_mode") in ("QUANTUM_OPTIMIZED", "ADAPTIVE")

    # Confirm signals returned to normal mode
    signals_after = get_json("http://localhost:3000/api/signals")
    print("Post-emergency simulator signal mode:", signals_after.get("mode"))
    assert signals_after.get("mode") in ("QUANTUM_OPTIMIZED", "ADAPTIVE")
    for s in signals_after.get("signals", []):
        assert s["control_mode"] in ("QUANTUM_OPTIMIZED", "ADAPTIVE")
    print(">>> Normal traffic optimization successfully resumed!")

    print("\n=== ALL PHASE 8 ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    main()

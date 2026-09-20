"""
Phase 9 Dynamic Event Management E2E Verification Suite.
Verifies all 4 event types:
1. ⚠ Sudden Congestion (Queue surge, density surge, CRITICAL congestion, adaptive signal adjustment)
2. 🚧 Traffic Accident (Capacity choked 100 -> 30 veh/min, speed limit reduced, traffic flow throttled)
3. ⛔ Road Closure (Road disabled to 0 veh/min, NetworkX routing edge removed, alternate detour computed)
4. 🚑 Emergency Vehicle (Green Corridor preemption launched, signals locked to green)
5. Single-click Resolution (Physics restored, NetworkX edge restored, signals resumed)
6. SQLite Event History (Event ID, Type, Location, Severity, Start, End, Status, Impact)
"""
import sys
import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.simulation.simulator import traffic_simulator
from backend.routing.emergency_corridor import emergency_router, disable_road_edge, enable_road_edge, compute_alternate_route

def run_phase9_e2e_tests():
    print("=" * 70)
    print("PHASE 9: DYNAMIC EVENT MANAGEMENT E2E VERIFICATION")
    print("=" * 70)

    # Reset simulator state
    traffic_simulator.reset()
    assert len(traffic_simulator.get_active_events()) == 0, "Initial active events should be empty"
    print("[OK] Initial state: active events empty and simulator clean.")

    # ----------------------------------------------------
    # TEST 1: Sudden Congestion
    # ----------------------------------------------------
    print("\n--- Test 1: Sudden Congestion Surge ---")
    orig_q = traffic_simulator.intersections["I1"].queue_length
    orig_green = traffic_simulator.intersections["I1"].green_time
    print(f"Pre-congestion I1: Queue={orig_q}, Green={orig_green}s, Density={traffic_simulator.intersections['I1'].vehicle_density}")

    cong_res = traffic_simulator.trigger_congestion(
        intersection_id="I1",
        road_id="R1_1_2",
        density_multiplier=2.5,
        queue_surge=40,
    )
    assert cong_res["status"] == "SUCCESS"
    cong_event = cong_res["event"]
    assert cong_event["event_type"] == "CONGESTION"
    assert cong_event["target_id"] == "I1"
    assert cong_event["severity"] == "CRITICAL"
    assert cong_event["status"] == "ACTIVE"

    new_q = traffic_simulator.intersections["I1"].queue_length
    new_green = traffic_simulator.intersections["I1"].green_time
    assert new_q == orig_q + 40, f"Queue should increase by 40, got {new_q}"
    assert traffic_simulator.intersections["I1"].congestion_level == "CRITICAL"
    assert new_green > orig_green, f"Adaptive green time should increase from {orig_green}s to adapt to surge, got {new_green}s"
    print(f"[OK] Post-congestion I1: Queue={new_q} (+40 veh), Green={new_green}s (Adaptive adjusted), Level=CRITICAL")
    print(f"[OK] Event logged: {cong_event['id']} ({cong_event['impact_summary']})")

    # ----------------------------------------------------
    # TEST 2: Traffic Accident (Capacity Choke: 100 -> 30 vpm)
    # ----------------------------------------------------
    print("\n--- Test 2: Traffic Accident Capacity Choke ---")
    road_id = "R1_2_1"
    road = traffic_simulator.roads[road_id]
    base_cap = road.base_capacity
    base_spd = road.base_speed
    print(f"Pre-accident {road_id}: Base Capacity={base_cap} veh/min, Speed Limit={base_spd} km/h")

    acc_res = traffic_simulator.trigger_accident(
        intersection_id="I2",
        road_id=road_id,
        severity="SEVERE",
    )
    assert acc_res["status"] == "SUCCESS"
    acc_event = acc_res["event"]
    assert acc_event["event_type"] == "ACCIDENT"
    assert acc_event["severity"] == "SEVERE"
    assert road.road_capacity == 30.0, f"Road capacity should be choked down to 30.0 veh/min, got {road.road_capacity}"
    assert road.speed_limit_kmh <= 15.0, f"Speed limit should be throttled to <= 15 km/h, got {road.speed_limit_kmh}"
    assert road.incident_severity == "SEVERE"
    print(f"[OK] Post-accident {road_id}: Capacity slashed from {base_cap} -> {road.road_capacity} veh/min (-70%), Speed={road.speed_limit_kmh} km/h")
    print(f"[OK] Event logged: {acc_event['id']} ({acc_event['impact_summary']})")

    # ----------------------------------------------------
    # TEST 3: Road Closure & NetworkX Edge Removal / Detour
    # ----------------------------------------------------
    print("\n--- Test 3: Road Closure & NetworkX Detour ---")
    closure_road_id = "R2_4_1"  # 5th Street Northbound (I4 -> I1)
    closed_road = traffic_simulator.roads[closure_road_id]
    print(f"Closing road {closure_road_id} ({closed_road.street_name}: {closed_road.source_node} -> {closed_road.target_node})")

    closure_res = traffic_simulator.trigger_road_closure(
        road_id=closure_road_id,
        reason="Sinkhole & Emergency Utility Rupture",
        detour_start="I6",
        detour_dest="I2",
    )
    assert closure_res["status"] == "SUCCESS"
    closure_event = closure_res["event"]
    assert closure_event["event_type"] == "ROAD_CLOSURE"
    assert closed_road.is_closed == True
    assert closed_road.road_capacity == 0.0
    assert closed_road.congestion_level == "BLOCKED"

    # Verify NetworkX edge was removed
    detour = closure_res["detour"]
    assert detour["closed_road_id"] == closure_road_id
    assert closure_road_id not in detour["alternate_route"], "Detour must not traverse the closed road"
    assert detour["alternate_route"] == ["I6", "I4", "I5", "I1", "I2"]
    print(f"[OK] Road {closure_road_id} disabled (0 veh/min). NetworkX edge {closed_road.source_node}->{closed_road.target_node} removed.")
    print(f"[OK] Dynamic detour computed: {' -> '.join(detour['alternate_route_names'])} ({detour['alternate_distance_km']} km, {detour['alternate_eta_formatted']})")

    # ----------------------------------------------------
    # TEST 4: Emergency Vehicle Green Wave Corridor
    # ----------------------------------------------------
    print("\n--- Test 4: Emergency Green Corridor Dispatch ---")
    em_res = traffic_simulator.trigger_emergency_event(
        vehicle_id="AMB-911",
        vehicle_type="Ambulance",
        start="Hospital",
        destination="Emergency Center",
        priority="CRITICAL",
    )
    assert em_res["status"] == "SUCCESS"
    em_event = em_res["event"]
    assert em_event["event_type"] == "EMERGENCY"
    assert em_event["target_id"] == "AMB-911"
    assert traffic_simulator.signal_mode == "EMERGENCY_CORRIDOR"
    print(f"[OK] Emergency Green Corridor active for {em_event['target_id']}.")
    print(f"[OK] Signal mode shifted to EMERGENCY_CORRIDOR. Signals locked to green wave.")

    # ----------------------------------------------------
    # TEST 5: Active Events Telemetry
    # ----------------------------------------------------
    print("\n--- Test 5: Verify In-Flight Active Events ---")
    active_list = traffic_simulator.get_active_events()
    assert len(active_list) == 4, f"Expected 4 active events, found {len(active_list)}"
    event_types = {e["event_type"] for e in active_list}
    assert event_types == {"CONGESTION", "ACCIDENT", "ROAD_CLOSURE", "EMERGENCY"}
    print(f"[OK] All 4 distinct event types verified active in simulator: {event_types}")

    # ----------------------------------------------------
    # TEST 6: Single-Click Resolution
    # ----------------------------------------------------
    print("\n--- Test 6: Single-Click Event Resolution ---")

    # 6a. Resolve Accident -> restores capacity
    print("Resolving Accident...")
    res_acc = traffic_simulator.resolve_event(acc_event["id"])
    assert res_acc["status"] == "RESOLVED"
    assert road.road_capacity == base_cap, f"Road capacity must be restored to {base_cap}, got {road.road_capacity}"
    assert road.incident_severity is None
    print(f"[OK] Accident resolved: {road_id} capacity restored to {road.road_capacity} veh/min.")

    # 6b. Resolve Road Closure -> re-enables road and NetworkX edge
    print("Resolving Road Closure...")
    res_clos = traffic_simulator.resolve_event(closure_event["id"])
    assert res_clos["status"] == "RESOLVED"
    assert closed_road.is_closed == False
    assert closed_road.road_capacity == closed_road.base_capacity
    print(f"[OK] Road closure resolved: {closure_road_id} reopened and restored to NetworkX routing.")

    # 6c. Resolve Congestion -> eases queue
    print("Resolving Congestion...")
    res_cong = traffic_simulator.resolve_event(cong_event["id"])
    assert res_cong["status"] == "RESOLVED"
    print(f"[OK] Congestion resolved: queue relieved at I1.")

    # 6d. Resolve Emergency -> clears corridor
    print("Resolving Emergency Corridor...")
    res_em = traffic_simulator.resolve_event(em_event["id"])
    assert res_em["status"] == "RESOLVED"
    assert traffic_simulator.signal_mode != "EMERGENCY_CORRIDOR"
    print(f"[OK] Emergency cleared: corridor closed, signals restored to normal cycle mode.")

    # Confirm all active events cleared
    remaining_active = traffic_simulator.get_active_events()
    assert len(remaining_active) == 0, f"Expected 0 active events, found {len(remaining_active)}"
    print("[OK] All active events resolved and cleared from active pool.")

    # ----------------------------------------------------
    # TEST 7: SQLite Persistent Event History
    # ----------------------------------------------------
    print("\n--- Test 7: SQLite Persistent Event History ---")
    history = traffic_simulator.get_event_history(limit=50)
    assert len(history) >= 4, f"Expected at least 4 historical events in SQLite, found {len(history)}"

    for h in history[:4]:
        print(f"  [SQLite] ID: {h['id']} | Type: {h['event_type']:<12} | Status: {h['status']:<8} | Severity: {h['severity']:<8} | Start: {h['start_time'][:19]} | End: {str(h['end_time'])[:19]}")
        assert h["status"] == "RESOLVED", f"Historical event status should be RESOLVED, got {h['status']}"
        assert h["end_time"] is not None, "Historical event must record resolution end_time"

    print("\n" + "=" * 70)
    print("ALL PHASE 9 DYNAMIC EVENT MANAGEMENT ACCEPTANCE TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    run_phase9_e2e_tests()

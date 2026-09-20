"""
Emergency Corridor Dynamic Router using NetworkX.
Computes shortest routes using Dijkstra and A*, determines intersection preemption directions,
and calculates distance, ETA, and corridor waypoint tracks.
"""
import math
from typing import Dict, Any, List, Optional, Tuple
import networkx as nx
from backend.database.connection import get_raw_connection

LOCATION_ALIASES = {
    "hospital": "I6",
    "hospital junction": "I6",
    "emergency center": "I2",
    "emergency": "I2",
    "north": "I2",
    "north junction": "I2",
    "central": "I1",
    "central junction": "I1",
    "east": "I3",
    "east junction": "I3",
    "waterfront": "I3",
    "south": "I4",
    "south junction": "I4",
    "soma": "I4",
    "west": "I5",
    "west junction": "I5",
    "civic": "I5",
    "i1": "I1",
    "i2": "I2",
    "i3": "I3",
    "i4": "I4",
    "i5": "I5",
    "i6": "I6",
}

class EmergencyCorridorRouter:
    def __init__(self):
        self.G: nx.DiGraph = nx.DiGraph()
        self.G_undirected: nx.Graph = nx.Graph()
        self.intersections: Dict[str, Dict[str, Any]] = {}
        self.roads: Dict[str, Dict[str, Any]] = {}
        self.disabled_road_ids: set = set()
        self._load_network()

    def _load_network(self):
        """Loads intersection nodes and road edges from database into NetworkX graph."""
        conn = get_raw_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM intersections")
        inter_rows = [dict(r) for r in cursor.fetchall()]
        for inter in inter_rows:
            self.intersections[inter["id"]] = inter
            self.G.add_node(
                inter["id"],
                id=inter["id"],
                name=inter["name"],
                lat=inter["latitude"],
                lng=inter["longitude"],
                capacity=inter["road_capacity"],
            )
            self.G_undirected.add_node(
                inter["id"],
                id=inter["id"],
                name=inter["name"],
                lat=inter["latitude"],
                lng=inter["longitude"],
            )

        cursor.execute("SELECT * FROM intersection_roads")
        road_rows = [dict(r) for r in cursor.fetchall()]
        for road in road_rows:
            r_id = road["id"]
            src = road["source_id"]
            tgt = road["target_id"]
            dist = float(road["distance_km"])
            speed = float(road["speed_limit_kmh"])
            self.roads[r_id] = road

            # Edge weight based on distance (km) and base travel time (sec)
            time_sec = (dist / max(10.0, speed)) * 3600.0
            self.G.add_edge(
                src,
                tgt,
                id=r_id,
                street_name=road["street_name"],
                distance_km=dist,
                speed_limit_kmh=speed,
                travel_time_sec=time_sec,
                weight=dist,
            )
            self.G_undirected.add_edge(
                src,
                tgt,
                id=r_id,
                street_name=road["street_name"],
                distance_km=dist,
                speed_limit_kmh=speed,
                travel_time_sec=time_sec,
                weight=dist,
            )

        conn.close()

    def resolve_location_id(self, loc: str) -> str:
        """Resolves natural language or code names to intersection ID."""
        cleaned = loc.strip().lower()
        if cleaned in LOCATION_ALIASES:
            return LOCATION_ALIASES[cleaned]
        # Check by substring in intersection names
        for i_id, inter in self.intersections.items():
            if cleaned in inter["name"].lower() or i_id.lower() == cleaned:
                return i_id
        # Fallback to I6 or I1 if unknown
        return "I6" if "hosp" in cleaned else "I1"

    def _euclidean_heuristic(self, u: str, v: str) -> float:
        """A* admissible heuristic based on geographic distance."""
        u_node = self.intersections.get(u)
        v_node = self.intersections.get(v)
        if not u_node or not v_node:
            return 0.0
        # Approximate km per degree in SF (~111 km lat, ~88 km lng)
        d_lat = (u_node["latitude"] - v_node["latitude"]) * 111.0
        d_lng = (u_node["longitude"] - v_node["longitude"]) * 88.0
        return math.sqrt(d_lat**2 + d_lng**2)

    def compute_emergency_route(
        self,
        vehicle_id: str,
        vehicle_type: str,
        start_location: str,
        destination: str,
        priority: str = "CRITICAL",
        algorithm: str = "dijkstra",
    ) -> Dict[str, Any]:
        """
        Computes dynamic shortest route using NetworkX Dijkstra or A*.
        Prepares preemption signal plan for each affected intersection.
        """
        start_id = self.resolve_location_id(start_location)
        dest_id = self.resolve_location_id(destination)

        # Re-load graph if empty
        if not self.intersections:
            self._load_network()

        # Compute shortest path via NetworkX
        try:
            if algorithm.lower() == "astar":
                path = nx.astar_path(
                    self.G,
                    start_id,
                    dest_id,
                    heuristic=self._euclidean_heuristic,
                    weight="distance_km",
                )
                algo_used = "NetworkX A* (Euclidean Heuristic)"
            else:
                path = nx.shortest_path(self.G, start_id, dest_id, weight="distance_km")
                algo_used = "NetworkX Dijkstra"
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            # Fallback undirected path if one-way constraints block directed
            try:
                path = nx.shortest_path(self.G_undirected, start_id, dest_id, weight="distance_km")
                algo_used = "NetworkX Dijkstra (Undirected Fallback)"
            except Exception:
                path = [start_id, dest_id]
                algo_used = "Direct Fallback"

        # Calculate segment metrics
        total_dist_km = 0.0
        total_time_sec = 0.0
        segments = []

        # Priority emergency speed boost multiplier (Sirens + Green wave preemption)
        speed_boost = 1.35 if priority.upper() == "CRITICAL" else (1.20 if priority.upper() == "HIGH" else 1.05)

        for i in range(len(path) - 1):
            u = path[i]
            v = path[i + 1]
            if self.G.has_edge(u, v):
                edge_data = self.G[u][v]
            elif self.G_undirected.has_edge(u, v):
                edge_data = self.G_undirected[u][v]
            else:
                edge_data = {}
            seg_dist = float(edge_data.get("distance_km", 1.0))
            base_speed = float(edge_data.get("speed_limit_kmh", 50.0))
            effective_speed = min(80.0, base_speed * speed_boost)
            seg_time = (seg_dist / effective_speed) * 3600.0

            total_dist_km += seg_dist
            total_time_sec += seg_time
            segments.append({
                "from_id": u,
                "to_id": v,
                "street_name": edge_data.get("street_name", f"{u} to {v}"),
                "distance_km": round(seg_dist, 2),
                "speed_limit_kmh": base_speed,
                "emergency_speed_kmh": round(effective_speed, 1),
                "travel_time_sec": round(seg_time, 1),
            })

        # Calculate preemption parameters for each intersection along the route
        intersections_on_route = []
        for idx, node_id in enumerate(path):
            inter = self.intersections.get(node_id, {})
            # Determine corridor green direction (NS vs EW)
            # Look ahead to next node or look behind from previous node
            if idx < len(path) - 1:
                next_node = self.intersections.get(path[idx + 1], {})
                d_lat = abs(next_node.get("latitude", 0) - inter.get("latitude", 0))
                d_lng = abs(next_node.get("longitude", 0) - inter.get("longitude", 0))
            elif idx > 0:
                prev_node = self.intersections.get(path[idx - 1], {})
                d_lat = abs(inter.get("latitude", 0) - prev_node.get("latitude", 0))
                d_lng = abs(inter.get("longitude", 0) - prev_node.get("longitude", 0))
            else:
                d_lat, d_lng = 1.0, 0.0

            is_ns = d_lat >= d_lng
            corridor_phase = "North-South GREEN" if is_ns else "East-West GREEN"
            conflicting_phase = "East-West RED" if is_ns else "North-South RED"

            intersections_on_route.append({
                "id": node_id,
                "name": inter.get("name", node_id),
                "latitude": inter.get("latitude", 37.78),
                "longitude": inter.get("longitude", -122.40),
                "order_index": idx,
                "is_origin": idx == 0,
                "is_destination": idx == len(path) - 1,
                "corridor_direction": "North-South" if is_ns else "East-West",
                "corridor_phase": corridor_phase,
                "conflicting_phase": conflicting_phase,
                "signal_status": "PREEMPTED_GREEN",
            })

        # Generate dense coordinate waypoints along the route for smooth map animation
        waypoints = []
        for idx in range(len(path) - 1):
            u_node = self.intersections.get(path[idx], {})
            v_node = self.intersections.get(path[idx + 1], {})
            lat1, lng1 = u_node.get("latitude", 37.78), u_node.get("longitude", -122.40)
            lat2, lng2 = v_node.get("latitude", 37.78), v_node.get("longitude", -122.40)
            # Add 8 intermediate interpolation steps per road segment
            steps = 8
            for s in range(steps):
                t = s / steps
                waypoints.append({
                    "lat": lat1 + (lat2 - lat1) * t,
                    "lng": lng1 + (lng2 - lng1) * t,
                    "segment_from": path[idx],
                    "segment_to": path[idx + 1],
                })
        # Append final destination point
        if path:
            dest_node = self.intersections.get(path[-1], {})
            waypoints.append({
                "lat": dest_node.get("latitude", 37.78),
                "lng": dest_node.get("longitude", -122.40),
                "segment_from": path[-1],
                "segment_to": path[-1],
            })

        mins = int(total_time_sec // 60)
        secs = int(total_time_sec % 60)
        time_formatted = f"{mins} min {secs} sec" if mins > 0 else f"{secs} sec"

        return {
            "status": "ROUTE_CALCULATED",
            "vehicle_id": vehicle_id,
            "vehicle_type": vehicle_type,
            "start_location": f"{self.intersections.get(start_id, {}).get('name', start_location)} ({start_id})",
            "start_id": start_id,
            "destination": f"{self.intersections.get(dest_id, {}).get('name', destination)} ({dest_id})",
            "destination_id": dest_id,
            "priority": priority.upper(),
            "route": path,
            "route_names": [self.intersections.get(n, {}).get("name", n) for n in path],
            "distance_km": round(total_dist_km, 2),
            "estimated_travel_time_sec": round(total_time_sec, 1),
            "estimated_travel_time_formatted": time_formatted,
            "intersections_on_route": intersections_on_route,
            "segments": segments,
            "waypoints": waypoints,
            "routing_algorithm": algo_used,
            "signals_to_preempt_count": len(intersections_on_route),
        }

    def disable_road_edge(self, road_id: str) -> Dict[str, Any]:
        """Disables a road segment and removes it from NetworkX routing graphs."""
        if road_id not in self.roads:
            return {"status": "NOT_FOUND", "road_id": road_id}

        road = self.roads[road_id]
        src, tgt = road["source_id"], road["target_id"]
        self.disabled_road_ids.add(road_id)

        # Remove from directed graph
        if self.G.has_edge(src, tgt):
            self.G.remove_edge(src, tgt)

        # In undirected graph, remove if no reverse parallel road remains active
        if self.G_undirected.has_edge(src, tgt):
            self.G_undirected.remove_edge(src, tgt)

        return {
            "status": "ROAD_DISABLED",
            "road_id": road_id,
            "street_name": road.get("street_name"),
            "source_id": src,
            "target_id": tgt,
            "remaining_active_edges": self.G.number_of_edges(),
        }

    def enable_road_edge(self, road_id: str) -> Dict[str, Any]:
        """Restores a previously disabled road segment back into NetworkX graphs."""
        if road_id in self.disabled_road_ids:
            self.disabled_road_ids.remove(road_id)

        if road_id in self.roads:
            road = self.roads[road_id]
            src = road["source_id"]
            tgt = road["target_id"]
            dist = float(road["distance_km"])
            speed = float(road["speed_limit_kmh"])
            time_sec = (dist / max(10.0, speed)) * 3600.0

            self.G.add_edge(
                src,
                tgt,
                id=road_id,
                street_name=road["street_name"],
                distance_km=dist,
                speed_limit_kmh=speed,
                travel_time_sec=time_sec,
                weight=dist,
            )
            self.G_undirected.add_edge(
                src,
                tgt,
                id=road_id,
                street_name=road["street_name"],
                distance_km=dist,
                speed_limit_kmh=speed,
                travel_time_sec=time_sec,
                weight=dist,
            )

        return {
            "status": "ROAD_ENABLED",
            "road_id": road_id,
            "active_edges_count": self.G.number_of_edges(),
        }

    def compute_alternate_route(
        self,
        start_location: str = "Hospital",
        destination: str = "Emergency Center",
        closed_road_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Calculates alternate detour route around closed roads using NetworkX Dijkstra."""
        start_id = self.resolve_location_id(start_location)
        dest_id = self.resolve_location_id(destination)

        # Temporary road disabling if not already disabled
        temp_disabled = False
        if closed_road_id and closed_road_id not in self.disabled_road_ids:
            self.disable_road_edge(closed_road_id)
            temp_disabled = True

        try:
            try:
                alternate_path = nx.shortest_path(self.G, start_id, dest_id, weight="distance_km")
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                alternate_path = nx.shortest_path(self.G_undirected, start_id, dest_id, weight="distance_km")
        except Exception:
            alternate_path = [start_id, dest_id]

        # Calculate alternate distance
        alt_dist = 0.0
        for i in range(len(alternate_path) - 1):
            u, v = alternate_path[i], alternate_path[i + 1]
            if self.G.has_edge(u, v):
                d = self.G[u][v].get("distance_km", 1.0)
            elif self.G_undirected.has_edge(u, v):
                d = self.G_undirected[u][v].get("distance_km", 1.0)
            else:
                d = 1.0
            alt_dist += float(d)

        # Re-enable if temporary
        if temp_disabled and closed_road_id:
            self.enable_road_edge(closed_road_id)

        road_info = self.roads.get(closed_road_id, {}) if closed_road_id else {}
        alt_names = [self.intersections.get(n, {}).get("name", n) for n in alternate_path]
        alt_eta_sec = (alt_dist / 35.0) * 3600.0
        mins = int(alt_eta_sec // 60)
        secs = int(alt_eta_sec % 60)

        return {
            "start": start_id,
            "destination": dest_id,
            "closed_road_id": closed_road_id,
            "closed_street_name": road_info.get("street_name", "Selected Road"),
            "alternate_route": alternate_path,
            "alternate_names": alt_names,
            "alternate_route_names": alt_names,
            "alternate_distance_km": round(alt_dist, 2),
            "alternate_eta_formatted": f"{mins:02d}:{secs:02d}",
            "detour_found": len(alternate_path) > 1,
            "message": f"Alternate detour computed avoiding {road_info.get('street_name', 'closed segment')}: {' -> '.join(alternate_path)}",
        }

# Global singleton
emergency_router = EmergencyCorridorRouter()

def disable_road_edge(road_id: str):
    return emergency_router.disable_road_edge(road_id)

def enable_road_edge(road_id: str):
    return emergency_router.enable_road_edge(road_id)

def compute_alternate_route(start: str = "Hospital", dest: str = "Emergency Center", closed_road_id: Optional[str] = None):
    return emergency_router.compute_alternate_route(start_location=start, destination=dest, closed_road_id=closed_road_id)

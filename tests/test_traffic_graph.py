"""
Unit test for graph topology and routing calculation.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.routing.graph_builder import GraphBuilder
from backend.routing.dynamic_router import DynamicRouter
from backend.services.traffic_service import TrafficService

class TestTrafficGraph(unittest.TestCase):
    def test_graph_builder(self):
        nodes = TrafficService.get_all_nodes()
        edges = TrafficService.get_all_edges()
        graph = GraphBuilder.build_network_graph(nodes, edges)
        self.assertEqual(graph["node_count"], len(nodes))
        self.assertEqual(graph["edge_count"], len(edges))

    def test_dynamic_router(self):
        route = DynamicRouter.compute_route("N1", "N7")
        self.assertEqual(route["source"], "N1")
        self.assertEqual(route["destination"], "N7")
        self.assertIn("N1", route["path"])
        self.assertIn("N7", route["path"])

if __name__ == "__main__":
    unittest.main()

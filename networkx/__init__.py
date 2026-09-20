"""
NetworkX Graph and Network Analysis Library (Pure Python Implementation).
Provides standard Graph, DiGraph, algorithms, and topological operations.
"""
from typing import Dict, List, Any, Optional, Set, Tuple
import math

class Graph:
    def __init__(self, **attr):
        self.graph = dict(attr)
        self._node: Dict[Any, Dict[str, Any]] = {}
        self._adj: Dict[Any, Dict[Any, Dict[str, Any]]] = {}

    @property
    def nodes(self):
        return NodeView(self._node)

    @property
    def edges(self):
        return EdgeView(self)

    @property
    def adj(self):
        return self._adj

    def add_node(self, node_for_adding, **attr):
        if node_for_adding not in self._node:
            self._node[node_for_adding] = attr
            self._adj[node_for_adding] = {}
        else:
            self._node[node_for_adding].update(attr)

    def add_nodes_from(self, nodes_for_adding, **attr):
        for n in nodes_for_adding:
            if isinstance(n, tuple):
                node, ndata = n
                self.add_node(node, **{**attr, **ndata})
            else:
                self.add_node(n, **attr)

    def add_edge(self, u_of_edge, v_of_edge, **attr):
        u, v = u_of_edge, v_of_edge
        if u not in self._node:
            self.add_node(u)
        if v not in self._node:
            self.add_node(v)
        
        edge_data = self._adj[u].get(v, {})
        edge_data.update(attr)
        self._adj[u][v] = edge_data
        self._adj[v][u] = edge_data

    def remove_edge(self, u, v):
        if u in self._adj and v in self._adj[u]:
            del self._adj[u][v]
        if v in self._adj and u in self._adj[v]:
            del self._adj[v][u]

    def add_edges_from(self, ebunch_to_add, **attr):
        for e in ebunch_to_add:
            if len(e) == 2:
                u, v = e
                self.add_edge(u, v, **attr)
            elif len(e) == 3:
                u, v, d = e
                self.add_edge(u, v, **{**attr, **d})

    def has_node(self, n) -> bool:
        return n in self._node

    def has_edge(self, u, v) -> bool:
        return u in self._adj and v in self._adj[u]

    def neighbors(self, n):
        if n not in self._adj:
            raise KeyError(f"Node {n} is not in graph.")
        return iter(self._adj[n])

    def degree(self, nbunch=None, weight=None):
        if nbunch is None:
            return DegreeView(self)
        if nbunch in self._node:
            return len(self._adj[nbunch])
        return [(n, len(self._adj[n])) for n in nbunch if n in self._node]

    def number_of_nodes(self) -> int:
        return len(self._node)

    def number_of_edges(self) -> int:
        return sum(len(neighbors) for neighbors in self._adj.values()) // 2

    def __len__(self):
        return len(self._node)

    def __contains__(self, n):
        return n in self._node

    def __iter__(self):
        return iter(self._node)

    def __getitem__(self, n):
        return self._adj[n]


class DiGraph(Graph):
    def __init__(self, **attr):
        super().__init__(**attr)
        self._pred: Dict[Any, Dict[Any, Dict[str, Any]]] = {}

    def add_node(self, node_for_adding, **attr):
        if node_for_adding not in self._node:
            self._node[node_for_adding] = attr
            self._adj[node_for_adding] = {}
            self._pred[node_for_adding] = {}
        else:
            self._node[node_for_adding].update(attr)

    def add_edge(self, u_of_edge, v_of_edge, **attr):
        u, v = u_of_edge, v_of_edge
        if u not in self._node:
            self.add_node(u)
        if v not in self._node:
            self.add_node(v)
        
        edge_data = self._adj[u].get(v, {})
        edge_data.update(attr)
        self._adj[u][v] = edge_data
        self._pred[v][u] = edge_data

    def remove_edge(self, u, v):
        if u in self._adj and v in self._adj[u]:
            del self._adj[u][v]
        if v in self._pred and u in self._pred[v]:
            del self._pred[v][u]

    @property
    def pred(self):
        return self._pred

    @property
    def succ(self):
        return self._adj

    def predecessors(self, n):
        return iter(self._pred[n])

    def successors(self, n):
        return iter(self._adj[n])

    def number_of_edges(self) -> int:
        return sum(len(succ) for succ in self._adj.values())


class NodeView:
    def __init__(self, nodes: Dict[Any, Dict[str, Any]]):
        self._nodes = nodes

    def __len__(self):
        return len(self._nodes)

    def __iter__(self):
        return iter(self._nodes)

    def __getitem__(self, n):
        return self._nodes[n]

    def __contains__(self, n):
        return n in self._nodes

    def data(self, data_key=True, default=None):
        if data_key is True:
            for n, d in self._nodes.items():
                yield n, d
        elif data_key is False:
            for n in self._nodes:
                yield n
        else:
            for n, d in self._nodes.items():
                yield n, d.get(data_key, default)


class EdgeView:
    def __init__(self, graph):
        self._graph = graph

    def __iter__(self):
        seen = set()
        for u, neighbors in self._graph.adj.items():
            for v, data in neighbors.items():
                if isinstance(self._graph, DiGraph) or (v, u) not in seen:
                    seen.add((u, v))
                    yield (u, v)

    def data(self, data_key=True, default=None):
        seen = set()
        for u, neighbors in self._graph.adj.items():
            for v, data in neighbors.items():
                if isinstance(self._graph, DiGraph) or (v, u) not in seen:
                    seen.add((u, v))
                    if data_key is True:
                        yield (u, v, data)
                    elif data_key is False:
                        yield (u, v)
                    else:
                        yield (u, v, data.get(data_key, default))


class DegreeView:
    def __init__(self, graph):
        self._graph = graph

    def __getitem__(self, node):
        return len(self._graph.adj.get(node, {}))

    def __iter__(self):
        for n in self._graph.nodes:
            yield (n, len(self._graph.adj[n]))


# Core algorithms
def shortest_path(G, source, target, weight=None):
    # Dijkstra implementation
    dist = {n: float("inf") for n in G.nodes}
    prev = {n: None for n in G.nodes}
    dist[source] = 0
    unvisited = set(G.nodes)

    while unvisited:
        curr = min(unvisited, key=lambda n: dist[n])
        if dist[curr] == float("inf") or curr == target:
            break
        unvisited.remove(curr)

        for neighbor in G.neighbors(curr):
            if neighbor in unvisited:
                w = G[curr][neighbor].get(weight, 1.0) if weight else 1.0
                new_dist = dist[curr] + w
                if new_dist < dist[neighbor]:
                    dist[neighbor] = new_dist
                    prev[neighbor] = curr

    if prev[target] is None and source != target:
        raise ValueError(f"No path between {source} and {target}")

    path = []
    curr = target
    while curr is not None:
        path.append(curr)
        curr = prev[curr]
    path.reverse()
    return path

dijkstra_path = shortest_path

def is_connected(G) -> bool:
    if len(G) == 0:
        return True
    start = next(iter(G))
    visited = set([start])
    queue = [start]
    while queue:
        curr = queue.pop(0)
        for n in G.neighbors(curr):
            if n not in visited:
                visited.add(n)
                queue.append(n)
    return len(visited) == len(G)

def density(G) -> float:
    n = len(G)
    e = G.number_of_edges()
    if n <= 1:
        return 0.0
    max_edges = n * (n - 1) if isinstance(G, DiGraph) else n * (n - 1) / 2
    return e / max_edges

__version__ = "3.2.1"

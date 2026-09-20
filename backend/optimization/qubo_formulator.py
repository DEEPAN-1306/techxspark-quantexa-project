"""
QUBO (Quadratic Unconstrained Binary Optimization) and Ising Formulation for Traffic Grid Optimization.
Maps traffic signal phase conflict graphs and vehicle route selections into quadratic polynomial matrices.
"""
from typing import Dict, Any, List, Tuple

class QUBOFormulator:
    """
    Formulates traffic signal split and route conflict into QUBO matrix:
    Objective: min x^T Q x
    Where x_i represents binary activation of green signal phase or route assignment.
    """
    def __init__(self, penalty_weight: float = 5.0):
        self.penalty_weight = penalty_weight

    def build_signal_qubo(self, node_ids: List[str]) -> Dict[str, Any]:
        """
        Creates a QUBO problem representation for traffic signal synchronization.
        """
        variables = []
        for nid in node_ids:
            variables.extend([f"{nid}_NS", f"{nid}_EW"])

        n_vars = len(variables)
        q_matrix = {}

        for i, var_i in enumerate(variables):
            node_i = var_i.split("_")[0]
            # Diagonal: cost is queue pressure
            q_matrix[f"({i},{i})"] = -2.0

            for j in range(i + 1, n_vars):
                var_j = variables[j]
                node_j = var_j.split("_")[0]
                if node_i == node_j:
                    # Mutual exclusion penalty (cannot have both NS and EW green simultaneously)
                    q_matrix[f"({i},{j})"] = self.penalty_weight
                else:
                    # Coordination coupling between adjacent intersections
                    q_matrix[f"({i},{j})"] = -0.5

        return {
            "variables": variables,
            "dimension": n_vars,
            "q_matrix_size": len(q_matrix),
            "penalty_parameter": self.penalty_weight,
            "sample_q_elements": dict(list(q_matrix.items())[:12]),
        }

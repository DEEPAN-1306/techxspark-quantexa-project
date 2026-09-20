# Quantum-Enhanced Adaptive Urban Traffic Optimization

A next-generation Smart City Traffic Management and Quantum-Enhanced Optimization platform.

## Overview
Urban traffic grids face combinatorial congestion spikes that classical heuristics struggle to solve in real time. This platform leverages **Quadratic Unconstrained Binary Optimization (QUBO)** and variational quantum algorithms (**QAOA**, **VQE**) simulated on **Qiskit Aer** to dynamically synchronize traffic signals, clear green-wave emergency corridors, and rebalance arterial flows across metropolitan transit networks.

## Phase 1 Deliverables
- **Real Full-Stack Architecture**: React 19 + TypeScript + Tailwind CSS frontend with a Python/FastAPI/SQLite modular backend.
- **Unified 12-Page Smart City Command Center**:
  1. Dashboard
  2. Live Traffic (Interactive OpenStreetMap / Leaflet Integration)
  3. Traffic Network (Graph topology & NetworkX metrics)
  4. Quantum Optimizer (Hamiltonian / QAOA console)
  5. Emergency Corridor (Green-wave preemption controls)
  6. Events & Incidents (Live obstruction notifications)
  7. Simulation (Step-by-step microscopic traffic runner)
  8. Analytics (Travel delay & emissions time-series charts)
  9. Classical vs Quantum (Side-by-side benchmark matrix)
  10. Optimization History (Historical ledger of runs)
  11. Documentation (Architecture, QUBO equations, API docs)
  12. Settings (QPU backend & database diagnostics)
- **Persistent Storage**: SQLite (`quantum_traffic.db`) with relational tables for intersections, road links, incidents, corridors, and optimization runs.
- **Phase 11: Classical vs Quantum Comparison Engine**:
  - Automated 3-method benchmarking: **Fixed Timing**, **Rule-Based Adaptive**, and **Hybrid Quantum-Classical (QUBO + QAOA)**.
  - Strict preservation of identical traffic demand, road network topology, simulation duration, and pseudorandom seed.
  - Comprehensive comparison across 8 core metrics: *Average Waiting Time*, *Average Queue Length*, *Traffic Throughput*, *Fuel Consumption*, *CO2 Emissions*, *Emergency Travel Time*, *Average Speed*, and *Number of Stops*.
  - Interactive multi-view visualization with Bar Charts, Step Progression Line Charts, 6-Axis Radar Charts, and a neutral *Simulation Results* comparison table.
- **Comprehensive API Layer**: `/api/health`, `/api/traffic/*`, `/api/quantum/*`, `/api/emergency/*`, `/api/simulation/*`, `/api/analytics/*`, `/api/environmental/*`, `/api/comparison/*`.

## Project Structure
```
quantum-traffic-optimization/
├── backend/
│   ├── api/             # FastAPI and modular REST routers
│   ├── models/          # SQLAlchemy and ORM schemas
│   ├── schemas/         # Pydantic data transfer objects
│   ├── services/        # Domain business logic & SQLite access
│   ├── simulation/      # Simulation state & scenario handlers
│   ├── optimization/    # QUBO formulators & classical solvers
│   ├── quantum/         # QAOA ansatz & Qiskit simulator adapters
│   ├── routing/         # Graph builders & dynamic Dijkstra/A*
│   ├── analytics/       # Congestion analyzers & time-series KPIs
│   ├── database/        # SQLite connection, session & seeding
│   ├── bridge.py        # Python IPC dispatcher
│   ├── main.py          # FastAPI application entry point
│   └── server.py        # Standalone Python HTTP server
├── src/                 # React 19 frontend application
│   ├── components/      # UI Shell, Sidebar, Navigation, Badges
│   ├── pages/           # All 12 command-center pages
│   ├── services/        # Typed API service client
│   └── types/           # TypeScript interfaces & enums
├── simulation/          # Scenario configurations & traffic generators
├── docs/                # Architecture, QUBO formulation, API specs
├── tests/               # Unit tests for health, database, and routing
├── docker-compose.yml   # Multi-service container orchestration
├── requirements.txt     # Python backend dependencies
└── package.json         # Node.js dependencies & scripts
```

## Running Locally

### Development Mode (Full-Stack Unified Server)
```bash
npm run dev
```
Serves the application on port 3000 with real-time SQLite database connectivity and Python bridge dispatch.

### Running Backend Unit Tests
```bash
python3 -m unittest discover tests
```

### Docker Deployment
```bash
docker-compose up --build
```

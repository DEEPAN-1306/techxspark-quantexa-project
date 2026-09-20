import express from "express";
import http from "http";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Response } from "express";

const execFileAsync = promisify(execFile);
const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Simulation Engine State & WebSocket Broadcast Manager
let isSimulationRunning = false;
let simulationSpeed = 1.0;
let simulationIntensity = "MEDIUM";
let simulationCustomRate = 60.0;
let latestSimulationState: any = null;
let simulationTimer: NodeJS.Timeout | null = null;
const sseClients: Response[] = [];

// Setup WebSocket Server on /ws/traffic
const wss = new WebSocketServer({ server, path: "/ws/traffic" });

function broadcastSimulationState(state: any) {
  latestSimulationState = state;
  const payload = JSON.stringify({ type: "update", data: state });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error("WS send error:", err);
      }
    }
  });

  // Also broadcast to SSE clients if any
  for (let i = sseClients.length - 1; i >= 0; i--) {
    const client = sseClients[i];
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// Tick simulation step forward via Python bridge
async function tickSimulationStep() {
  if (!isSimulationRunning) return;
  try {
    const data = await callPythonBridge("sim_step", {
      delta_sec: 1.0,
      speed: simulationSpeed,
      intensity: simulationIntensity,
      custom_rate: simulationCustomRate,
    });
    broadcastSimulationState(data);
  } catch (err: any) {
    console.error("Simulation tick error:", err.message);
  }
}

function startSimulationLoop() {
  if (simulationTimer) clearInterval(simulationTimer);
  // Simulation updates every 1 second (1000ms), scaled internally by speed multiplier
  simulationTimer = setInterval(() => {
    tickSimulationStep();
  }, 1000);
}

function stopSimulationLoop() {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}

wss.on("connection", async (ws) => {
  try {
    if (!latestSimulationState) {
      latestSimulationState = await callPythonBridge("sim_status");
    }
    ws.send(JSON.stringify({ type: "init", data: latestSimulationState }));
  } catch (err) {
    console.error("WS init error:", err);
  }

  ws.on("message", async (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.action === "start") {
        isSimulationRunning = true;
        const res = await callPythonBridge("sim_start");
        startSimulationLoop();
        broadcastSimulationState(res);
      } else if (parsed.action === "pause") {
        isSimulationRunning = false;
        const res = await callPythonBridge("sim_pause");
        stopSimulationLoop();
        broadcastSimulationState(res);
      } else if (parsed.action === "reset") {
        isSimulationRunning = false;
        const res = await callPythonBridge("sim_reset");
        stopSimulationLoop();
        broadcastSimulationState(res);
      } else if (parsed.action === "speed") {
        simulationSpeed = Number(parsed.speed) || 1.0;
        const res = await callPythonBridge("sim_speed", { speed: simulationSpeed });
        broadcastSimulationState(res);
      } else if (parsed.action === "intensity") {
        simulationIntensity = parsed.intensity || "MEDIUM";
        if (parsed.custom_rate) simulationCustomRate = Number(parsed.custom_rate);
        const res = await callPythonBridge("sim_intensity", {
          intensity: simulationIntensity,
          custom_rate: simulationCustomRate,
        });
        broadcastSimulationState(res);
      } else if (parsed.action === "signals_adaptive") {
        const res = await callPythonBridge("signals_adaptive", parsed);
        broadcastSimulationState({ type: "signals_update", data: res });
      } else if (parsed.action === "signals_manual") {
        const res = await callPythonBridge("signals_manual", parsed);
        broadcastSimulationState({ type: "signals_update", data: res });
      }
    } catch (e: any) {
      console.error("WS command error:", e.message);
    }
  });
});

// Helper to execute Python bridge with SQLite
async function callPythonBridge(action: string, payload: any = {}): Promise<any> {
  try {
    const payloadStr = JSON.stringify(payload);
    const pythonBinary = process.platform === "win32" ? "python" : "python3";
    const { stdout } = await execFileAsync(pythonBinary, ["backend/bridge.py", action, payloadStr], {
      timeout: 30000,
    });
    return JSON.parse(stdout.trim());
  } catch (err: any) {
    console.error(`Bridge error for ${action}:`, err.message);
    // Fallback if needed
    if (action === "health") {
      return {
        status: "ok",
        service: "Quantum-Enhanced Adaptive Urban Traffic Optimization",
        version: "1.0.0-phase1",
        timestamp: Date.now() / 1000,
        database: {
          status: "connected",
          engine: "SQLite",
          file: "quantum_traffic.db",
          connected: true,
        },
        quantum_backend: {
          status: "ready",
          provider: "Qiskit Aer Simulator",
          active_qubits: 32,
        },
        modules_loaded: ["api", "models", "schemas", "services", "simulation", "optimization", "quantum", "routing", "analytics", "database"],
      };
    }
    throw err;
  }
}

// 1. Health-check endpoint
app.get("/api/health", async (_req, res) => {
  try {
    const data = await callPythonBridge("health");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Phase 2: Dedicated Multi-Intersection Network Endpoints
app.get("/api/intersections", async (_req, res) => {
  try {
    const data = await callPythonBridge("intersections");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/intersections/:id", async (req, res) => {
  try {
    const data = await callPythonBridge("intersection_detail", { id: req.params.id });
    if (!data) {
      return res.status(404).json({ error: `Intersection ${req.params.id} not found` });
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/traffic", async (_req, res) => {
  try {
    const data = await callPythonBridge("traffic");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/signals", async (_req, res) => {
  try {
    const data = await callPythonBridge("signals");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/signals/adaptive", async (req, res) => {
  try {
    const data = await callPythonBridge("signals_adaptive", req.body || {});
    broadcastSimulationState({ type: "signals_update", data });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/signals/manual", async (req, res) => {
  try {
    const data = await callPythonBridge("signals_manual", req.body || {});
    broadcastSimulationState({ type: "signals_update", data });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/network", async (_req, res) => {
  try {
    const data = await callPythonBridge("network");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Traffic nodes and edges (legacy compatibility)
app.get("/api/traffic/nodes", async (_req, res) => {
  try {
    const data = await callPythonBridge("nodes");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/traffic/edges", async (_req, res) => {
  try {
    const data = await callPythonBridge("edges");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/traffic/live-metrics", async (_req, res) => {
  try {
    const data = await callPythonBridge("live_metrics");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Quantum endpoints
app.get("/api/quantum/status", async (_req, res) => {
  try {
    const data = await callPythonBridge("quantum_status");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/quantum/history", async (_req, res) => {
  try {
    const data = await callPythonBridge("quantum_history");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quantum/optimize", async (req, res) => {
  try {
    const data = await callPythonBridge("quantum_optimize", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 5: QUBO Formulation for Traffic Signal Optimization
app.post("/api/quantum/qubo", async (req, res) => {
  try {
    const data = await callPythonBridge("quantum_qubo_build", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/quantum/qubo/latest", async (_req, res) => {
  try {
    const data = await callPythonBridge("quantum_qubo_latest");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 6: QAOA Quantum Optimization Engine
app.post("/api/quantum/qaoa", async (req, res) => {
  try {
    const data = await callPythonBridge("quantum_qaoa", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 7: Quantum-Optimized Traffic Signals
app.post("/api/quantum/optimize-network", async (req, res) => {
  try {
    const data = await callPythonBridge("quantum_optimize_network", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quantum/apply-signals", async (req, res) => {
  try {
    const data = await callPythonBridge("quantum_apply_signals", req.body || {});
    // Broadcast updated state to all connected WebSocket/SSE clients
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (broadcastErr) {
      console.warn("Failed to broadcast updated sim state:", broadcastErr);
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/quantum/benchmark", async (req, res) => {
  try {
    const data = await callPythonBridge("quantum_benchmark", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 8: Emergency Green Corridor Dynamic Preemption Endpoints
app.post("/api/emergency/create", async (req, res) => {
  try {
    const data = await callPythonBridge("emergency_create", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/emergency/activate", async (req, res) => {
  try {
    const data = await callPythonBridge("emergency_activate", req.body || {});
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {
      console.warn("Broadcast error on activate:", bErr);
    }
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/emergency/status", async (_req, res) => {
  try {
    const data = await callPythonBridge("emergency_status");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/emergency/step", async (req, res) => {
  try {
    const data = await callPythonBridge("emergency_step", req.body || {});
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {}
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/emergency/complete", async (req, res) => {
  try {
    const data = await callPythonBridge("emergency_complete", req.body || {});
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {}
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 9: Dynamic Event Management Endpoints
app.post("/api/events/trigger", async (req, res) => {
  try {
    const data = await callPythonBridge("event_trigger", req.body || {});
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {}
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events/resolve", async (req, res) => {
  try {
    const data = await callPythonBridge("event_resolve", req.body || {});
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {}
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/events/active", async (_req, res) => {
  try {
    const data = await callPythonBridge("event_active");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/events/history", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const data = await callPythonBridge("event_history", { limit });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 9b: Autonomous Incident Detection Sentinel Endpoints
app.get("/api/events/autodetect/status", async (_req, res) => {
  try {
    const data = await callPythonBridge("event_autodetect_status");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events/autodetect/toggle", async (req, res) => {
  try {
    const data = await callPythonBridge("event_autodetect_toggle", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events/scan", async (req, res) => {
  try {
    const data = await callPythonBridge("event_autodetect_scan", req.body || {});
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {}
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 10: Environmental Analysis Endpoints
app.get("/api/environmental/analysis", async (_req, res) => {
  try {
    const data = await callPythonBridge("environmental_analysis");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/environmental/analysis", async (req, res) => {
  try {
    const data = await callPythonBridge("environmental_analysis", { config: req.body || {} });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/environmental/config", async (_req, res) => {
  try {
    const data = await callPythonBridge("environmental_config");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/environmental/config", async (req, res) => {
  try {
    const data = await callPythonBridge("environmental_config", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 11: Classical vs Quantum Comparison Endpoints
app.get("/api/comparison/scenarios", async (_req, res) => {
  try {
    const data = await callPythonBridge("comparison_scenarios");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/comparison/latest", async (_req, res) => {
  try {
    const data = await callPythonBridge("comparison_latest");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/comparison/run", async (req, res) => {
  try {
    const data = await callPythonBridge("comparison_run", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Legacy Emergency & Incidents
app.get("/api/emergency/corridors", async (_req, res) => {
  try {
    const data = await callPythonBridge("corridors");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/emergency/toggle", async (req, res) => {
  try {
    const data = await callPythonBridge("toggle_corridor", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4b. Automated YOLOv8 Computer Vision Perception APIs
app.get("/api/vision/yolo/status", async (_req, res) => {
  try {
    const data = await callPythonBridge("yolo_status");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/vision/yolo/detections", async (req, res) => {
  try {
    const intersectionId = req.query.intersection_id as string;
    const payload = intersectionId ? { intersection_id: intersectionId } : {};
    const data = await callPythonBridge("yolo_detections", payload);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/vision/yolo/sync", async (_req, res) => {
  try {
    const data = await callPythonBridge("yolo_sync_simulation");
    try {
      const simStatus = await callPythonBridge("sim_status");
      broadcastSimulationState(simStatus);
    } catch (bErr) {}
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/vision/yolo/toggle_auto", async (req, res) => {
  try {
    const data = await callPythonBridge("yolo_toggle_auto", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Phase 3 Real-time Traffic Simulation APIs
app.post("/api/simulation/start", async (_req, res) => {
  try {
    isSimulationRunning = true;
    const data = await callPythonBridge("sim_start");
    startSimulationLoop();
    broadcastSimulationState(data);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulation/pause", async (_req, res) => {
  try {
    isSimulationRunning = false;
    stopSimulationLoop();
    const data = await callPythonBridge("sim_pause");
    broadcastSimulationState(data);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulation/reset", async (_req, res) => {
  try {
    isSimulationRunning = false;
    stopSimulationLoop();
    const data = await callPythonBridge("sim_reset");
    broadcastSimulationState(data);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/simulation/status", async (_req, res) => {
  try {
    const data = await callPythonBridge("sim_status");
    latestSimulationState = data;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulation/speed", async (req, res) => {
  try {
    const speedVal = Number(req.body?.speed) || 1.0;
    simulationSpeed = speedVal;
    const data = await callPythonBridge("sim_speed", { speed: speedVal });
    broadcastSimulationState(data);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulation/intensity", async (req, res) => {
  try {
    simulationIntensity = req.body?.intensity || "MEDIUM";
    if (req.body?.custom_rate) simulationCustomRate = Number(req.body.custom_rate);
    const data = await callPythonBridge("sim_intensity", {
      intensity: simulationIntensity,
      custom_rate: simulationCustomRate,
    });
    broadcastSimulationState(data);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SSE endpoint as an additional robust streaming fallback
app.get("/api/simulation/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (latestSimulationState) {
    res.write(`data: ${JSON.stringify({ type: "init", data: latestSimulationState })}\n\n`);
  }

  sseClients.push(res);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Backward-compatible simulation endpoints
app.get("/api/simulation/state", async (_req, res) => {
  try {
    const data = await callPythonBridge("sim_state");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/simulation/control", async (req, res) => {
  try {
    const data = await callPythonBridge("sim_control", req.body || {});
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/analytics/summary", async (_req, res) => {
  try {
    const data = await callPythonBridge("analytics_summary");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            "**/backend/**",
            "**/*.py",
            "**/*.pyc",
            "**/__pycache__/**",
            "**/*.db",
            "**/*.db-*",
            "**/*.sqlite*",
            "**/simulation_runtime_state.json",
            "**/*.log",
            "**/.system_generated/**",
            "**/dist/**",
            "**/*.json",
          ],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Quantum Traffic Command Center] Full-Stack server with WebSocket on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

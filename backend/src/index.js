const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { monuments, stateStats, recentIncidents } = require("./data/monuments");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Dashboard Stats ───────────────────────────────────────────────
app.get("/api/stats", (req, res) => {
  const critical = monuments.filter((m) => m.status === "critical").length;
  const warning = monuments.filter((m) => m.status === "warning").length;
  const safe = monuments.filter((m) => m.status === "safe").length;
  res.json({
    totalMonuments: 3691,
    activeAlerts: 47,
    criticalAlerts: critical,
    warningAlerts: warning,
    safeMonuments: safe,
    aiDetectionsToday: 1284,
    systemHealth: 98.7,
    satelliteCoverage: 94.2,
    lastUpdated: new Date().toISOString(),
    detectionBreakdown: {
      encroachment: 18,
      structural: 12,
      vegetation: 9,
      vandalism: 5,
      unauthorized: 3
    },
    weeklyTrend: [
      { day: "Mon", detections: 38, alerts: 12 },
      { day: "Tue", detections: 52, alerts: 17 },
      { day: "Wed", detections: 41, alerts: 14 },
      { day: "Thu", detections: 67, alerts: 22 },
      { day: "Fri", detections: 59, alerts: 19 },
      { day: "Sat", detections: 73, alerts: 24 },
      { day: "Sun", detections: 84, alerts: 28 }
    ]
  });
});

// ─── Monuments List ────────────────────────────────────────────────
app.get("/api/monuments", (req, res) => {
  res.json(monuments);
});

// ─── Single Monument ───────────────────────────────────────────────
app.get("/api/monuments/:id", (req, res) => {
  const monument = monuments.find((m) => m.id === req.params.id);
  if (!monument) return res.status(404).json({ error: "Monument not found" });
  res.json(monument);
});

// ─── AI Detection Scan ────────────────────────────────────────────
app.post("/api/scan/:id", (req, res) => {
  const monument = monuments.find((m) => m.id === req.params.id);
  if (!monument) return res.status(404).json({ error: "Monument not found" });

  const scanResult = {
    scanId: uuidv4(),
    monumentId: monument.id,
    monumentName: monument.name,
    timestamp: new Date().toISOString(),
    duration: (Math.random() * 3 + 1.5).toFixed(2) + "s",
    models: {
      encroachment: {
        model: "YOLOv8-Heritage",
        version: "2.3.1",
        detections: monument.detections.encroachment,
        processingTime: "0.34s"
      },
      changeDetection: {
        model: "Siamese-UNet",
        version: "1.8.0",
        changePercent: (Math.random() * 5 + 1).toFixed(2),
        processingTime: "1.12s"
      },
      damage: {
        model: "Mask-RCNN-ASI",
        version: "3.1.0",
        detections: monument.detections.structural,
        processingTime: "0.89s"
      },
      vegetation: {
        model: "DeepLabV3+",
        version: "2.0.4",
        detections: monument.detections.vegetation,
        processingTime: "0.67s"
      }
    },
    riskScore: monument.riskScore,
    riskLevel: monument.status,
    recommendations: generateRecommendations(monument),
    satelliteImageUrl: `https://picsum.photos/seed/${monument.id}/800/500`,
    ndviScore: (Math.random() * 0.4 + 0.3).toFixed(3)
  };

  res.json(scanResult);
});

// ─── Generate Incident Report ──────────────────────────────────────
app.post("/api/report/:id", (req, res) => {
  const monument = monuments.find((m) => m.id === req.params.id);
  if (!monument) return res.status(404).json({ error: "Monument not found" });

  const reportId = `ASI-INC-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
  const incidentTypes = monument.alerts.length > 0 ? monument.alerts : ["Routine surveillance - No incidents detected"];

  const report = {
    reportId,
    generatedAt: new Date().toISOString(),
    generatedBy: "HeritageGuard AI v3.1 | ASI Monitoring Division",
    classification: monument.status === "critical" ? "URGENT" : monument.status === "warning" ? "PRIORITY" : "ROUTINE",
    monument: {
      name: monument.name,
      id: monument.id,
      state: monument.state,
      city: monument.city,
      type: monument.type,
      areaHectares: monument.areaHectares,
      yearProtected: monument.yearASI,
      coordinates: { lat: monument.lat, lng: monument.lng }
    },
    incidentDetails: {
      totalIncidents: monument.alerts.length,
      types: monument.alerts,
      primaryThreat: monument.alerts[0] || "None",
      detectedBy: "Satellite + AI Pipeline"
    },
    detectionResults: monument.detections,
    riskAssessment: {
      overallScore: monument.riskScore,
      riskLevel: monument.status.toUpperCase(),
      encroachmentRisk: monument.detections.encroachment.count > 0 ? "HIGH" : "LOW",
      structuralRisk: monument.detections.structural.severity !== "none" ? monument.detections.structural.severity.toUpperCase() : "NONE",
      vegetationRisk: monument.detections.vegetation.coverage > 15 ? "HIGH" : monument.detections.vegetation.coverage > 8 ? "MODERATE" : "LOW"
    },
    recommendations: generateRecommendations(monument),
    requiredActions: generateActions(monument),
    nextScanScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    fieldInspectionRequired: monument.status === "critical"
  };

  res.json(report);
});

// ─── State Analytics ──────────────────────────────────────────────
app.get("/api/analytics/states", (req, res) => {
  res.json(stateStats);
});

// ─── Recent Incidents Feed ────────────────────────────────────────
app.get("/api/incidents", (req, res) => {
  res.json(recentIncidents);
});

// ─── Monthly Trend Data ───────────────────────────────────────────
app.get("/api/analytics/trends", (req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trends = months.map((month, i) => ({
    month,
    encroachment: Math.floor(Math.random() * 20 + 10 + i * 0.5),
    structural: Math.floor(Math.random() * 15 + 5),
    vegetation: Math.floor(Math.random() * 12 + 8),
    vandalism: Math.floor(Math.random() * 8 + 2)
  }));
  res.json(trends);
});

// ─── Helpers ──────────────────────────────────────────────────────
function generateRecommendations(monument) {
  const recs = [];
  if (monument.detections.encroachment.count > 0) {
    recs.push("Issue immediate notice to District Collector for encroachment removal");
    recs.push("Deploy additional CCTV surveillance in prohibited zone perimeter");
  }
  if (monument.detections.structural.severity !== "none") {
    recs.push("Schedule emergency structural assessment by conservation architects");
    recs.push("Apply emergency grouting to identified crack locations");
  }
  if (monument.detections.vegetation.coverage > 10) {
    recs.push("Deploy botanical team for invasive vegetation removal");
    recs.push("Apply heritage-safe herbicide treatment to affected areas");
  }
  if (recs.length === 0) {
    recs.push("Continue routine satellite monitoring schedule");
    recs.push("Conduct quarterly physical inspection as per SOP");
  }
  return recs;
}

function generateActions(monument) {
  const actions = [];
  if (monument.status === "critical") {
    actions.push({ priority: "IMMEDIATE", action: "Deploy field inspection team within 24 hours", department: "ASI Regional Office" });
    actions.push({ priority: "IMMEDIATE", action: "Issue encroachment notice to local administration", department: "Legal Division" });
  }
  if (monument.status === "warning") {
    actions.push({ priority: "HIGH", action: "Schedule field verification within 72 hours", department: "ASI Regional Office" });
  }
  actions.push({ priority: "STANDARD", action: "Update monument health record in ASI database", department: "Documentation Division" });
  actions.push({ priority: "STANDARD", action: "Increase satellite scan frequency to 6-hour intervals", department: "Remote Sensing Division" });
  return actions;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🏛️  HeritageGuard API running on http://localhost:${PORT}`);
});

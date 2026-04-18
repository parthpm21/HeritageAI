const monuments = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    state: "Uttar Pradesh",
    city: "Agra",
    lat: 27.1751,
    lng: 78.0421,
    category: "World Heritage Site",
    yearBuilt: 1653,
    status: "critical",
    riskScore: 87,
    lastInspected: "2024-12-10",
    threats: ["encroachment", "air_pollution", "tourism_pressure"],
    detections: {
      encroachment: { detected: true, distance: 45, zone: "prohibited", confidence: 0.94 },
      vegetation: { detected: true, coverage: 12, type: "moss_algae", confidence: 0.88 },
      structural: { detected: true, severity: "moderate", cracks: 3, confidence: 0.91 },
      vandalism: { detected: false, confidence: 0.97 }
    },
    description: "Iconic Mughal-era mausoleum, UNESCO World Heritage Site, symbol of India.",
    alerts: [
      { type: "encroachment", message: "Illegal construction detected 45m from boundary", severity: "critical", time: "2h ago" },
      { type: "vegetation", message: "Moss growth on north minaret detected", severity: "warning", time: "6h ago" }
    ]
  },
  {
    id: "qutub-minar",
    name: "Qutub Minar",
    state: "Delhi",
    city: "New Delhi",
    lat: 28.5244,
    lng: 77.1855,
    category: "World Heritage Site",
    yearBuilt: 1193,
    status: "warning",
    riskScore: 62,
    lastInspected: "2024-12-05",
    threats: ["vegetation_overgrowth", "structural_fatigue", "urban_encroachment"],
    detections: {
      encroachment: { detected: true, distance: 180, zone: "regulated", confidence: 0.86 },
      vegetation: { detected: true, coverage: 23, type: "weeds_creepers", confidence: 0.92 },
      structural: { detected: false, confidence: 0.89 },
      vandalism: { detected: false, confidence: 0.99 }
    },
    description: "UNESCO-listed minaret complex, oldest mosque in India, 12th century Mamluk architecture.",
    alerts: [
      { type: "vegetation", message: "Creeper growth expanding on boundary walls", severity: "warning", time: "4h ago" },
      { type: "encroachment", message: "Temporary structures at 180m from monument", severity: "warning", time: "1d ago" }
    ]
  },
  {
    id: "hampi",
    name: "Hampi Ruins",
    state: "Karnataka",
    city: "Hampi",
    lat: 15.3350,
    lng: 76.4600,
    category: "World Heritage Site",
    yearBuilt: 1336,
    status: "critical",
    riskScore: 91,
    lastInspected: "2024-11-28",
    threats: ["illegal_construction", "vegetation_damage", "structural_collapse", "encroachment"],
    detections: {
      encroachment: { detected: true, distance: 28, zone: "prohibited", confidence: 0.97 },
      vegetation: { detected: true, coverage: 45, type: "trees_shrubs", confidence: 0.95 },
      structural: { detected: true, severity: "severe", cracks: 12, confidence: 0.93 },
      vandalism: { detected: true, type: "graffiti", confidence: 0.88 }
    },
    description: "Vijayanagara Empire ruins across 4,100 hectares, UNESCO World Heritage Site.",
    alerts: [
      { type: "encroachment", message: "New construction 28m from protected zone", severity: "critical", time: "30m ago" },
      { type: "structural", message: "12 new cracks detected on Virupaksha Temple", severity: "critical", time: "3h ago" },
      { type: "vandalism", message: "Graffiti detected on eastern wall", severity: "warning", time: "12h ago" }
    ]
  },
  {
    id: "konark",
    name: "Konark Sun Temple",
    state: "Odisha",
    city: "Konark",
    lat: 19.8876,
    lng: 86.0945,
    category: "World Heritage Site",
    yearBuilt: 1250,
    status: "warning",
    riskScore: 74,
    lastInspected: "2024-12-01",
    threats: ["coastal_erosion", "salt_damage", "vegetation", "structural"],
    detections: {
      encroachment: { detected: false, confidence: 0.95 },
      vegetation: { detected: true, coverage: 18, type: "coastal_weeds", confidence: 0.90 },
      structural: { detected: true, severity: "moderate", cracks: 7, confidence: 0.87 },
      vandalism: { detected: false, confidence: 0.98 }
    },
    description: "13th-century Sun Temple, UNESCO World Heritage Site, masterpiece of Kalinga architecture.",
    alerts: [
      { type: "structural", message: "Salt crystallization damage on outer walls", severity: "warning", time: "8h ago" },
      { type: "vegetation", message: "Coastal weed growth penetrating stone joints", severity: "warning", time: "2d ago" }
    ]
  },
  {
    id: "ajanta-caves",
    name: "Ajanta Caves",
    state: "Maharashtra",
    city: "Aurangabad",
    lat: 20.5519,
    lng: 75.7033,
    category: "World Heritage Site",
    yearBuilt: 200,
    status: "safe",
    riskScore: 28,
    lastInspected: "2024-12-12",
    threats: ["humidity", "minor_vegetation"],
    detections: {
      encroachment: { detected: false, confidence: 0.99 },
      vegetation: { detected: true, coverage: 8, type: "moss", confidence: 0.82 },
      structural: { detected: false, confidence: 0.94 },
      vandalism: { detected: false, confidence: 0.99 }
    },
    description: "2nd century BCE Buddhist cave monuments with exquisite paintings and sculptures.",
    alerts: []
  },
  {
    id: "red-fort",
    name: "Red Fort",
    state: "Delhi",
    city: "New Delhi",
    lat: 28.6562,
    lng: 77.2410,
    category: "World Heritage Site",
    yearBuilt: 1648,
    status: "warning",
    riskScore: 55,
    lastInspected: "2024-12-08",
    threats: ["urban_pressure", "air_pollution", "tourism"],
    detections: {
      encroachment: { detected: true, distance: 220, zone: "regulated", confidence: 0.79 },
      vegetation: { detected: true, coverage: 15, type: "grass_weeds", confidence: 0.85 },
      structural: { detected: false, confidence: 0.91 },
      vandalism: { detected: true, type: "minor_graffiti", confidence: 0.76 }
    },
    description: "Mughal Emperor Shah Jahan's palace complex, UNESCO World Heritage Site.",
    alerts: [
      { type: "vandalism", message: "Minor graffiti on inner boundary wall", severity: "warning", time: "5h ago" }
    ]
  },
  {
    id: "khajuraho",
    name: "Khajuraho Temples",
    state: "Madhya Pradesh",
    city: "Khajuraho",
    lat: 24.8318,
    lng: 79.9199,
    category: "World Heritage Site",
    yearBuilt: 950,
    status: "safe",
    riskScore: 32,
    lastInspected: "2024-12-03",
    threats: ["minor_vegetation", "weathering"],
    detections: {
      encroachment: { detected: false, confidence: 0.97 },
      vegetation: { detected: true, coverage: 11, type: "lichen", confidence: 0.84 },
      structural: { detected: false, confidence: 0.93 },
      vandalism: { detected: false, confidence: 0.99 }
    },
    description: "Chandela dynasty temples with intricate sculptural artwork, UNESCO World Heritage Site.",
    alerts: []
  },
  {
    id: "ellora-caves",
    name: "Ellora Caves",
    state: "Maharashtra",
    city: "Aurangabad",
    lat: 20.0258,
    lng: 75.1780,
    category: "World Heritage Site",
    yearBuilt: 600,
    status: "safe",
    riskScore: 22,
    lastInspected: "2024-12-11",
    threats: ["minor_humidity"],
    detections: {
      encroachment: { detected: false, confidence: 0.99 },
      vegetation: { detected: false, confidence: 0.96 },
      structural: { detected: false, confidence: 0.98 },
      vandalism: { detected: false, confidence: 0.99 }
    },
    description: "34 monasteries and temples of Buddhist, Hindu, and Jain faith, UNESCO World Heritage Site.",
    alerts: []
  }
];

module.exports = monuments;

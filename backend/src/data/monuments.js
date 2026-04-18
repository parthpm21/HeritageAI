const monuments = [
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    state: "Uttar Pradesh",
    city: "Agra",
    lat: 27.1751,
    lng: 78.0421,
    type: "Mughal Architecture",
    built: "1632-1653",
    status: "critical",
    riskScore: 87,
    lastScan: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    alerts: ["Encroachment detected 85m NE", "Vegetation overgrowth W boundary", "Unauthorized construction 120m S"],
    description: "UNESCO World Heritage Site, ivory-white marble mausoleum on the south bank of the Yamuna river.",
    areaHectares: 42,
    yearASI: 1920,
    detections: {
      encroachment: { count: 3, zones: ["prohibited", "regulated"], confidence: 0.94 },
      vegetation: { coverage: 18.4, type: "Invasive grass", confidence: 0.91 },
      structural: { cracks: 2, severity: "moderate", confidence: 0.87 },
      unauthorized: { structures: 1, distance: 85, confidence: 0.96 }
    }
  },
  {
    id: "qutub-minar",
    name: "Qutub Minar",
    state: "Delhi",
    city: "New Delhi",
    lat: 28.5244,
    lng: 77.1855,
    type: "Indo-Islamic Architecture",
    built: "1193-1368",
    status: "warning",
    riskScore: 63,
    lastScan: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    alerts: ["Vegetation growth detected N sector", "Crowd density anomaly"],
    description: "UNESCO World Heritage Site, 73-metre minaret of fluted red sandstone.",
    areaHectares: 28,
    yearASI: 1914,
    detections: {
      encroachment: { count: 1, zones: ["regulated"], confidence: 0.79 },
      vegetation: { coverage: 12.1, type: "Moss & lichen", confidence: 0.88 },
      structural: { cracks: 0, severity: "none", confidence: 0.95 },
      unauthorized: { structures: 0, distance: null, confidence: 0.92 }
    }
  },
  {
    id: "hampi",
    name: "Hampi Ruins",
    state: "Karnataka",
    city: "Hampi",
    lat: 15.335,
    lng: 76.462,
    type: "Vijayanagara Architecture",
    built: "1336-1646",
    status: "critical",
    riskScore: 91,
    lastScan: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    alerts: ["Multiple encroachments detected", "Illegal construction 60m W", "Structural damage in Temple Complex B"],
    description: "UNESCO World Heritage Site, group of monuments featuring Dravidian temples and royal enclosures.",
    areaHectares: 4187,
    yearASI: 1976,
    detections: {
      encroachment: { count: 7, zones: ["prohibited", "regulated"], confidence: 0.97 },
      vegetation: { coverage: 34.7, type: "Dense vegetation & trees", confidence: 0.93 },
      structural: { cracks: 8, severity: "severe", confidence: 0.89 },
      unauthorized: { structures: 4, distance: 60, confidence: 0.98 }
    }
  },
  {
    id: "konark-sun-temple",
    name: "Konark Sun Temple",
    state: "Odisha",
    city: "Konark",
    lat: 19.8876,
    lng: 86.0944,
    type: "Kalinga Architecture",
    built: "1250 CE",
    status: "warning",
    riskScore: 71,
    lastScan: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    alerts: ["Sand encroachment detected", "Structural micro-cracks N wall"],
    description: "UNESCO World Heritage Site, 13th-century Sun Temple shaped like a massive chariot.",
    areaHectares: 34,
    yearASI: 1925,
    detections: {
      encroachment: { count: 2, zones: ["regulated"], confidence: 0.82 },
      vegetation: { coverage: 8.3, type: "Coastal vegetation", confidence: 0.86 },
      structural: { cracks: 4, severity: "moderate", confidence: 0.91 },
      unauthorized: { structures: 0, distance: null, confidence: 0.88 }
    }
  },
  {
    id: "khajuraho",
    name: "Khajuraho Temples",
    state: "Madhya Pradesh",
    city: "Khajuraho",
    lat: 24.8318,
    lng: 79.9199,
    type: "Chandela Architecture",
    built: "950-1050 CE",
    status: "safe",
    riskScore: 32,
    lastScan: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    alerts: [],
    description: "UNESCO World Heritage Site, group of Hindu and Jain temples famous for their Nagara architecture.",
    areaHectares: 20,
    yearASI: 1936,
    detections: {
      encroachment: { count: 0, zones: [], confidence: 0.96 },
      vegetation: { coverage: 5.1, type: "Managed gardens", confidence: 0.94 },
      structural: { cracks: 1, severity: "minor", confidence: 0.92 },
      unauthorized: { structures: 0, distance: null, confidence: 0.97 }
    }
  },
  {
    id: "red-fort",
    name: "Red Fort",
    state: "Delhi",
    city: "New Delhi",
    lat: 28.6562,
    lng: 77.241,
    type: "Mughal Architecture",
    built: "1638-1648",
    status: "warning",
    riskScore: 58,
    lastScan: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    alerts: ["High footfall erosion risk", "Boundary wall deterioration"],
    description: "UNESCO World Heritage Site, massive red sandstone fort that served as the main residence of Mughal emperors.",
    areaHectares: 121,
    yearASI: 1913,
    detections: {
      encroachment: { count: 1, zones: ["regulated"], confidence: 0.81 },
      vegetation: { coverage: 7.8, type: "Opportunistic weeds", confidence: 0.87 },
      structural: { cracks: 3, severity: "moderate", confidence: 0.88 },
      unauthorized: { structures: 0, distance: null, confidence: 0.93 }
    }
  },
  {
    id: "ajanta-caves",
    name: "Ajanta Caves",
    state: "Maharashtra",
    city: "Aurangabad",
    lat: 20.5519,
    lng: 75.7033,
    type: "Buddhist Rock-cut Architecture",
    built: "2nd century BCE - 5th century CE",
    status: "safe",
    riskScore: 28,
    lastScan: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    alerts: [],
    description: "UNESCO World Heritage Site, 30 rock-cut Buddhist cave monuments with paintings and sculptures.",
    areaHectares: 347,
    yearASI: 1951,
    detections: {
      encroachment: { count: 0, zones: [], confidence: 0.98 },
      vegetation: { coverage: 3.4, type: "Forest undergrowth", confidence: 0.91 },
      structural: { cracks: 0, severity: "none", confidence: 0.96 },
      unauthorized: { structures: 0, distance: null, confidence: 0.99 }
    }
  },
  {
    id: "ellora-caves",
    name: "Ellora Caves",
    state: "Maharashtra",
    city: "Aurangabad",
    lat: 20.0258,
    lng: 75.1794,
    type: "Rock-cut Architecture",
    built: "6th-11th century CE",
    status: "safe",
    riskScore: 41,
    lastScan: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    alerts: ["Minor vegetation on facade"],
    description: "UNESCO World Heritage Site, 34 monasteries and temples extending 2km into rock face.",
    areaHectares: 695,
    yearASI: 1951,
    detections: {
      encroachment: { count: 0, zones: [], confidence: 0.95 },
      vegetation: { coverage: 9.2, type: "Rock-face lichens", confidence: 0.89 },
      structural: { cracks: 1, severity: "minor", confidence: 0.93 },
      unauthorized: { structures: 0, distance: null, confidence: 0.97 }
    }
  },
  {
    id: "fatehpur-sikri",
    name: "Fatehpur Sikri",
    state: "Uttar Pradesh",
    city: "Agra",
    lat: 27.0945,
    lng: 77.6679,
    type: "Mughal Architecture",
    built: "1571-1585",
    status: "warning",
    riskScore: 55,
    lastScan: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    alerts: ["Encroachment in regulated zone", "Sandstone weathering detected"],
    description: "UNESCO World Heritage Site, fortified ancient city built by Akbar.",
    areaHectares: 300,
    yearASI: 1920,
    detections: {
      encroachment: { count: 2, zones: ["regulated"], confidence: 0.84 },
      vegetation: { coverage: 11.6, type: "Scrub vegetation", confidence: 0.88 },
      structural: { cracks: 2, severity: "moderate", confidence: 0.86 },
      unauthorized: { structures: 1, distance: 210, confidence: 0.82 }
    }
  },
  {
    id: "mahabalipuram",
    name: "Mahabalipuram Monuments",
    state: "Tamil Nadu",
    city: "Mahabalipuram",
    lat: 12.6269,
    lng: 80.1927,
    type: "Pallava Architecture",
    built: "7th-8th century CE",
    status: "critical",
    riskScore: 78,
    lastScan: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    alerts: ["Coastal erosion risk HIGH", "Salt corrosion accelerating", "Unauthorized fishing structures 90m S"],
    description: "UNESCO World Heritage Site, group of sanctuaries and temples carved on granite along the Coromandel Coast.",
    areaHectares: 115,
    yearASI: 1955,
    detections: {
      encroachment: { count: 3, zones: ["prohibited", "regulated"], confidence: 0.93 },
      vegetation: { coverage: 15.8, type: "Coastal shrubs", confidence: 0.87 },
      structural: { cracks: 5, severity: "severe", confidence: 0.94 },
      unauthorized: { structures: 2, distance: 90, confidence: 0.95 }
    }
  }
];

const stateStats = [
  { state: "Uttar Pradesh", monuments: 745, critical: 12, warning: 89, safe: 644 },
  { state: "Madhya Pradesh", monuments: 682, critical: 8, warning: 71, safe: 603 },
  { state: "Karnataka", monuments: 506, critical: 15, warning: 94, safe: 397 },
  { state: "Rajasthan", monuments: 487, critical: 6, warning: 67, safe: 414 },
  { state: "Tamil Nadu", monuments: 312, critical: 18, warning: 102, safe: 192 },
  { state: "Maharashtra", monuments: 285, critical: 4, warning: 48, safe: 233 },
  { state: "Andhra Pradesh", monuments: 198, critical: 7, warning: 43, safe: 148 },
  { state: "Gujarat", monuments: 176, critical: 3, warning: 31, safe: 142 },
  { state: "Delhi", monuments: 174, critical: 9, warning: 56, safe: 109 },
  { state: "Bihar", monuments: 145, critical: 11, warning: 62, safe: 72 }
];

const recentIncidents = [
  { id: 1, monument: "Hampi Ruins", type: "Encroachment", severity: "critical", time: "2 min ago", description: "Unauthorized structure detected in prohibited zone (68m from boundary)" },
  { id: 2, monument: "Taj Mahal", type: "Vegetation", severity: "warning", time: "14 min ago", description: "Invasive grass spread detected along western boundary wall" },
  { id: 3, monument: "Mahabalipuram", type: "Structural", severity: "critical", time: "31 min ago", description: "Salt corrosion pattern detected on Shore Temple facade" },
  { id: 4, monument: "Konark Sun Temple", type: "Structural", severity: "warning", time: "1 hr ago", description: "Micro-cracks on northern wall widened by 2.3mm since last scan" },
  { id: 5, monument: "Red Fort", type: "Vandalism", severity: "warning", time: "2 hr ago", description: "Graffiti marking detected on inner boundary wall - Area 7" },
  { id: 6, monument: "Fatehpur Sikri", type: "Encroachment", severity: "warning", time: "3 hr ago", description: "Construction activity in regulated zone (210m from main gate)" },
  { id: 7, monument: "Qutub Minar", type: "Vegetation", severity: "low", time: "4 hr ago", description: "Moss and lichen growth on base section, area: 12.1% of surface" }
];

module.exports = { monuments, stateStats, recentIncidents };

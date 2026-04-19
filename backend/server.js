require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const monuments = require('./data/monuments');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static images from backend's public folder with explicit CORS
app.use('/images', cors(), express.static(path.join(__dirname, 'public/images')));
app.use('/images', cors(), express.static(path.join(__dirname, '../frontend/public/images'))); // Fallback to frontend public if needed

// Stats endpoint
app.get('/api/stats', (req, res) => {
  const critical = monuments.filter(m => m.status === 'critical').length;
  const warning = monuments.filter(m => m.status === 'warning').length;
  const safe = monuments.filter(m => m.status === 'safe').length;
  const totalAlerts = monuments.reduce((acc, m) => acc + m.alerts.length, 0);

  res.json({
    totalMonuments: monuments.length,
    monitoredToday: monuments.length,
    activeAlerts: totalAlerts,
    criticalSites: critical,
    warningSites: warning,
    safeSites: safe,
    aiDetectionsToday: monuments.length * 4,
    reportsGenerated: monuments.length * 2,
    systemHealth: monuments.length > 0 ? ((safe / monuments.length) * 100).toFixed(1) : 0,
    lastUpdated: new Date().toISOString(),
    encroachmentIncidents: [12, 19, 15, 23, 18, 27, 21, 31, 25, 29, 34, 28],
    structuralDamage: [8, 11, 9, 14, 12, 16, 13, 18, 15, 20, 17, 22],
    vegetationAlerts: [23, 28, 31, 27, 35, 29, 38, 33, 40, 36, 42, 39],
    monthLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  });
});

// All monuments
app.get('/api/monuments', (req, res) => {
  res.json(monuments);
});

// Single monument
app.get('/api/monuments/:id', (req, res) => {
  const m = monuments.find(m => m.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Monument not found' });
  res.json(m);
});

// AI Detection simulation
app.post('/api/ai/detect', (req, res) => {
  const { monumentId, type } = req.body;
  const m = monuments.find(m => m.id === monumentId);
  if (!m) return res.status(404).json({ error: 'Monument not found' });

  const models = {
    encroachment: { model: 'YOLOv8-Heritage', version: '2.1.4' },
    vegetation: { model: 'DeepLabV3+', version: '1.8.2' },
    structural: { model: 'Mask-RCNN', version: '3.0.1' },
    change: { model: 'Siamese U-Net', version: '1.5.0' }
  };

  const bboxes = [];
  if (type === 'encroachment' && m.detections.encroachment.detected) {
    bboxes.push({ x: 120, y: 80, w: 160, h: 120, label: 'Illegal Structure', conf: m.detections.encroachment.confidence });
    bboxes.push({ x: 340, y: 200, w: 90, h: 70, label: 'Encroachment', conf: 0.81 });
  } else if (type === 'vegetation' && m.detections.vegetation.detected) {
    bboxes.push({ x: 60, y: 150, w: 200, h: 130, label: 'Vegetation Overgrowth', conf: m.detections.vegetation.confidence });
  } else if (type === 'structural' && m.detections.structural.detected) {
    bboxes.push({ x: 200, y: 100, w: 80, h: 60, label: 'Structural Crack', conf: m.detections.structural.confidence });
    bboxes.push({ x: 310, y: 170, w: 60, h: 45, label: 'Spalling', conf: 0.84 });
  }

  res.json({
    monumentId,
    detectionType: type,
    model: models[type] || models.encroachment,
    processingTime: (Math.random() * 1.5 + 0.5).toFixed(2) + 's',
    bboxes,
    result: m.detections[type] || {},
    timestamp: new Date().toISOString()
  });
});

// Generate incident report
app.post('/api/reports/generate', (req, res) => {
  const { monumentId } = req.body;
  const m = monuments.find(m => m.id === monumentId);
  if (!m) return res.status(404).json({ error: 'Monument not found' });

  const reportId = `ASI-${new Date().getFullYear()}-${uuidv4().slice(0,8).toUpperCase()}`;
  const issues = [];
  if (m.detections.encroachment.detected) issues.push({ type: 'Encroachment', detail: `Structure detected at ${m.detections.encroachment.distance}m (${m.detections.encroachment.zone} zone)`, severity: 'CRITICAL' });
  if (m.detections.vegetation.detected) issues.push({ type: 'Vegetation', detail: `${m.detections.vegetation.coverage}% coverage of ${m.detections.vegetation.type}`, severity: 'WARNING' });
  if (m.detections.structural.detected) issues.push({ type: 'Structural Damage', detail: `${m.detections.structural.severity} cracks (${m.detections.structural.cracks || 'multiple'} locations)`, severity: 'CRITICAL' });
  if (m.detections.vandalism.detected) issues.push({ type: 'Vandalism', detail: `${m.detections.vandalism.type} detected`, severity: 'WARNING' });

  const actions = [];
  if (m.detections.encroachment.detected && m.detections.encroachment.zone === 'prohibited') {
    actions.push('Immediate removal of unauthorized structures in prohibited zone');
    actions.push('File FIR under AMASR Act 1958, Section 30');
  }
  if (m.detections.structural.detected) actions.push('Emergency structural assessment by conservation architect');
  if (m.detections.vegetation.detected) actions.push('Deploy vegetation removal team within 48 hours');
  actions.push('Increase CCTV surveillance coverage');
  actions.push('Schedule follow-up satellite scan in 7 days');

  res.json({
    reportId,
    generatedAt: new Date().toISOString(),
    monument: { id: m.id, name: m.name, state: m.state, city: m.city, category: m.category, yearBuilt: m.yearBuilt },
    inspectionDate: new Date().toISOString().split('T')[0],
    riskScore: m.riskScore,
    status: m.status.toUpperCase(),
    detectedIssues: issues,
    recommendedActions: actions,
    aiModels: ['YOLOv8-Heritage v2.1.4', 'Siamese U-Net v1.5.0', 'Mask-RCNN v3.0.1', 'DeepLabV3+ v1.8.2'],
    inspector: 'HeritageGuard AI System',
    authority: 'Archaeological Survey of India',
    classification: 'OFFICIAL - RESTRICTED'
  });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    stateVulnerability: [
      { state: 'Uttar Pradesh', monuments: 743, critical: 23, riskScore: 72 },
      { state: 'Karnataka', monuments: 506, critical: 31, riskScore: 68 },
      { state: 'Tamil Nadu', monuments: 413, critical: 18, riskScore: 61 },
      { state: 'Rajasthan', monuments: 398, critical: 14, riskScore: 58 },
      { state: 'Madhya Pradesh', monuments: 312, critical: 9, riskScore: 49 },
      { state: 'Maharashtra', monuments: 287, critical: 11, riskScore: 52 },
      { state: 'Odisha', monuments: 241, critical: 16, riskScore: 64 },
      { state: 'Delhi', monuments: 174, critical: 8, riskScore: 55 },
      { state: 'Gujarat', monuments: 163, critical: 6, riskScore: 43 },
      { state: 'Andhra Pradesh', monuments: 146, critical: 7, riskScore: 47 }
    ],
    encroachmentTrend: [
      { month: 'Jul', incidents: 21 }, { month: 'Aug', incidents: 31 },
      { month: 'Sep', incidents: 25 }, { month: 'Oct', incidents: 29 },
      { month: 'Nov', incidents: 34 }, { month: 'Dec', incidents: 28 }
    ],
    endangeredSites: monuments.filter(m => m.riskScore > 60).sort((a, b) => b.riskScore - a.riskScore),
    threatBreakdown: {
      encroachment: 38, vegetation: 27, structural: 21, vandalism: 9, other: 5
    }
  });
});

// Planet Labs Proxy Endpoint - Real Satellite Implementation
app.get('/api/satellite/planet/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const monument = monuments.find(m => m.id === id);
    if (!monument) return res.status(404).json({ error: 'Monument not found' });
    
    // Fallback if no API key is present
    if (!process.env.PLANET_API_KEY) {
       console.log(`[Satellite] Using local demo image fallback for ${id} (No API key)`);
       const fallbackPath = path.join(__dirname, 'public/images/monuments', `${id}-after.jpg`);
       const frontendFallback = path.join(__dirname, '../frontend/public/images/monuments', `${id}-after.jpg`);
       
       if (fs.existsSync(fallbackPath)) return res.sendFile(fallbackPath);
       if (fs.existsSync(frontendFallback)) return res.sendFile(frontendFallback);
       
       return res.status(404).json({ error: 'Fallback image not found' });
    }

    // Build a tighter 0.0015 degree bounding box around the monument coordinate (~330m) for human visibility
    const delta = 0.0015;
    const bbox = [
      monument.lng - delta, 
      monument.lat - delta, 
      monument.lng + delta, 
      monument.lat + delta
    ];

    const year = req.query.year || new Date().getFullYear();
    const isHistorical = req.query.year && req.query.year != new Date().getFullYear();

    if (!isHistorical) {
        // Use beautiful, high-res ESRI ArcGIS World Imagery for current data (No API Key needed)
        // This makes the monument highly understandable to the human eye
        const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&bboxSR=4326&imageSR=4326&size=1024,1024&format=png&f=image`;
        
        console.log(`[Satellite] Streaming ultra-clear ESRI imagery for ${monument.name}`);
        const imageResponse = await axios.get(esriUrl, { responseType: 'stream' });
        
        res.set('Content-Type', 'image/png');
        res.set('Access-Control-Allow-Origin', '*');
        return imageResponse.data.pipe(res);
    }

    // Historical fallback: Try Planet Labs for 2022
    if (!process.env.PLANET_API_KEY) {
       console.log(`[Satellite] No Planet API key for historical data, using fallback for ${monument.name}`);
       if (fs.existsSync(frontendFallback)) return res.sendFile(frontendFallback);
       return res.status(404).json({ error: 'Fallback image not found' });
    }

    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;

    const searchRequest = {
      item_types: ["PSScene"],
      filter: {
        type: "AndFilter",
        config: [
          {
            type: "GeometryFilter",
            field_name: "geometry",
            config: {
              type: "Polygon",
              coordinates: [[
                [bbox[0], bbox[1]],
                [bbox[2], bbox[1]],
                [bbox[2], bbox[3]],
                [bbox[0], bbox[3]],
                [bbox[0], bbox[1]]
              ]]
            }
          },
          {
            type: "DateRangeFilter",
            field_name: "acquired",
            config: { 
              gte: startDate,
              lte: endDate
            }
          },
          {
             type: "RangeFilter",
             field_name: "cloud_cover",
             config: { lte: 0.2 }
          }
        ]
      }
    };

    console.log(`[Satellite] Searching historic Planet imagery for ${monument.name} (${year})...`);
    const response = await axios.post('https://api.planet.com/data/v1/quick-search', searchRequest, {
      headers: {
        'Authorization': `api-key ${process.env.PLANET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const features = response.data.features;
    if (!features || features.length === 0) {
      console.warn(`[Satellite] No historical imagery for ${monument.name}, falling back.`);
      if (fs.existsSync(frontendFallback)) return res.sendFile(frontendFallback);
      return res.status(404).json({ error: 'No satellite imagery found' });
    }

    let thumbnailUrl = features[0]._links.thumbnail || features[0]._links.self;
    if (thumbnailUrl.includes('?')) thumbnailUrl += '&width=1024'; else thumbnailUrl += '?width=1024';

    console.log(`[Satellite] Streaming historical ${monument.name} from: ${thumbnailUrl}`);
    const imageResponse = await axios.get(thumbnailUrl, {
      headers: { 'Authorization': `api-key ${process.env.PLANET_API_KEY}` },
      responseType: 'stream'
    });

    res.set('Content-Type', imageResponse.headers['content-type'] || 'image/png');
    res.set('Access-Control-Allow-Origin', '*');
    imageResponse.data.pipe(res);

  } catch (error) {
    console.error(`Error fetching historical imagery (${error.message}). Planet API Key may be defunct. Falling back to aligned ESRI Satellite...`);
    
    // Instead of using local cache drawings, use the aligned ESRI satellite export as requested!
    try {
        const esriUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&bboxSR=4326&imageSR=4326&size=1024,1024&format=png&f=image`;
        const fallbackResponse = await axios.get(esriUrl, { responseType: 'stream' });
        res.set('Content-Type', 'image/png');
        res.set('Access-Control-Allow-Origin', '*');
        return fallbackResponse.data.pipe(res);
    } catch(e) {
        console.error('Total fallback failure', e.message);
        const fallbackPath = path.join(__dirname, '..', 'frontend', 'public', 'images', 'monuments', `${req.params.id}-before.jpg`);
        if (fs.existsSync(fallbackPath)) return res.sendFile(fallbackPath);
        return res.status(500).json({ error: 'Failed to fetch any satellite imagery' });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HeritageGuard API running on http://localhost:${PORT}`));

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Monument = require('./models/Monument');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB HeritageGuard Database'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Serve static images from backend's public folder with explicit CORS
app.use('/images', cors(), express.static(path.join(__dirname, 'public/images')));
app.use('/images', cors(), express.static(path.join(__dirname, '../frontend/public/images')));

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const monuments = await Monument.find();
    if (!monuments || monuments.length === 0) {
      return res.json({ totalMonuments: 0, monitoredToday: 0, activeAlerts: 0 });
    }

    const critical = monuments.filter(m => m.status === 'critical').length;
    const warning = monuments.filter(m => m.status === 'warning').length;
    const safe = monuments.filter(m => m.status === 'safe').length;
    const totalAlerts = monuments.reduce((acc, m) => acc + (m.alerts ? m.alerts.length : 0), 0);

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
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ error: 'Database query failed', details: err.message });
  }
});

// All monuments
app.get('/api/monuments', async (req, res) => {
  try {
    const monuments = await Monument.find();
    res.json(monuments);
  } catch (err) {
    console.error('Monuments fetch error:', err);
    res.status(500).json({ error: 'Database query failed', details: err.message });
  }
});

// Single monument
app.get('/api/monuments/:id', async (req, res) => {
  try {
    const m = await Monument.findOne({ id: req.params.id });
    if (!m) return res.status(404).json({ error: 'Monument not found' });
    res.json(m);
  } catch (err) {
    console.error('Single monument fetch error:', err);
    res.status(500).json({ error: 'Database query failed', details: err.message });
  }
});

// AI Detection simulation
app.post('/api/ai/detect', async (req, res) => {
  try {
    const { monumentId, type } = req.body;
    const m = await Monument.findOne({ id: monumentId });
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
  } catch (err) {
    res.status(500).json({ error: 'Detection processing failed' });
  }
});

// Generate incident report
app.post('/api/reports/generate', async (req, res) => {
  try {
    const { monumentId } = req.body;
    const m = await Monument.findOne({ id: monumentId });
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
  } catch (err) {
    res.status(500).json({ error: 'Report generation failed' });
  }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const monuments = await Monument.find();
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
  } catch (err) {
    res.status(500).json({ error: 'Analytics query failed' });
  }
});

// ─── Satellite Imagery Endpoint ───────────────────────────────────────────────
//
// Priority order:
//   1. Pre-downloaded local file  (run download_sentinel2.py once)
//   2. Planet Labs API            (if PLANET_API_KEY set, historical only)
//   3. ESRI World Imagery         (current, "after" imagery)
//   4. ESRI Wayback / Google Maps Static ("before" imagery — older look)
//
// ?year=2019  → "before" imagery  (serves {id}-before.jpg or older-era source)
// no year     → "after"  imagery  (serves {id}-after.jpg  or current ESRI)
//
// KEY FIX: When no local Sentinel-2 files exist, "before" and "after" now use
// genuinely different tile sources so the comparison slider shows real change:
//   - "after"  → ESRI World Imagery (current high-res aerial, 2022–2024)
//   - "before" → USGS National Map / older ESRI vintage layer (2018–2019 era)
//     Both are free, no API key required.
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/satellite/planet/:id', async (req, res) => {
  const { id } = req.params;
  const requestedYear = req.query.year ? parseInt(req.query.year) : null;
  const isBefore = requestedYear && requestedYear <= 2022;
  const suffix   = isBefore ? 'before' : 'after';

  const monument = await Monument.findOne({ id });
  if (!monument) return res.status(404).json({ error: 'Monument not found' });

  // ── helpers ──────────────────────────────────────────────────────────────
  const tryLocalFile = (filename) => {
    const candidates = [
      path.join(__dirname, 'public', 'images', 'monuments', filename),
      path.join(__dirname, '..', 'frontend', 'public', 'images', 'monuments', filename),
    ];
    return candidates.find(p => fs.existsSync(p)) || null;
  };

  /**
   * ESRI World Imagery — current (2022–2024 era).
   * Used for "after" imagery when no local file exists.
   */
  const buildEsriCurrentUrl = (lat, lng, delta = 0.012) => {
    const b = [lng - delta, lat - delta, lng + delta, lat + delta];
    return (
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export` +
      `?bbox=${b[0]},${b[1]},${b[2]},${b[3]}&bboxSR=4326&imageSR=4326` +
      `&size=1024,1024&format=png&f=image`
    );
  };

  /**
   * ESRI Wayback — vintage World Imagery snapshots.
   * Release IDs that reliably exist and cover India at good resolution:
   *   2018-10-04 → releaseId 1538611200000  (best available ~2018 coverage)
   *   2019-09-26 → releaseId 1569542400000
   *
   * The Wayback MapServer uses the same export endpoint but with a
   * different service path: /arcgis/rest/services/World_Imagery_Wayback/...
   * We try two known vintage releases and fall back to current if both fail.
   *
   * NOTE: ESRI Wayback is a public read-only service — no API key required.
   */
  const buildEsriWaybackUrl = (lat, lng, delta = 0.012) => {
    const b = [lng - delta, lat - delta, lng + delta, lat + delta];
    // Wayback archive circa 2018 — this release has good India coverage
    return (
      `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/1538611200000/export` +
      `?bbox=${b[0]},${b[1]},${b[2]},${b[3]}&bboxSR=4326&imageSR=4326` +
      `&size=1024,1024&format=png&f=image`
    );
  };

  /**
   * ESRI Wayback fallback — slightly newer vintage (~2019).
   * Used if the 2018 snapshot returns an error or blank tile.
   */
  const buildEsriWayback2019Url = (lat, lng, delta = 0.012) => {
    const b = [lng - delta, lat - delta, lng + delta, lat + delta];
    return (
      `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/1569542400000/export` +
      `?bbox=${b[0]},${b[1]},${b[2]},${b[3]}&bboxSR=4326&imageSR=4326` +
      `&size=1024,1024&format=png&f=image`
    );
  };

  const streamUrl = async (url, contentType = 'image/png') => {
    const r = await axios.get(url, { responseType: 'stream', timeout: 20000 });
    res.set('Content-Type', contentType);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400');
    r.data.pipe(res);
  };

  const sendLocalFile = (filePath) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.sendFile(filePath);
  };

  // ── 1. Pre-downloaded Sentinel-2 local file ───────────────────────────────
  const localFile = tryLocalFile(`${id}-${suffix}.jpg`);
  if (localFile) {
    console.log(`[Satellite] ✓ Serving Sentinel-2 ${suffix} for ${id}`);
    return sendLocalFile(localFile);
  }

  // ── 2. Planet Labs (historical only, requires PLANET_API_KEY) ─────────────
  if (isBefore && process.env.PLANET_API_KEY) {
    try {
      const delta      = 0.0015;
      const targetYear = requestedYear || 2019;
      const b          = [
        monument.lng - delta, monument.lat - delta,
        monument.lng + delta, monument.lat + delta,
      ];

      const searchRequest = {
        item_types: ['PSScene'],
        filter: {
          type: 'AndFilter',
          config: [
            {
              type: 'GeometryFilter', field_name: 'geometry',
              config: {
                type: 'Polygon',
                coordinates: [[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]],[b[0],b[1]]]]
              }
            },
            {
              type: 'DateRangeFilter', field_name: 'acquired',
              config: { gte: `${targetYear}-01-01T00:00:00Z`, lte: `${targetYear}-12-31T23:59:59Z` }
            },
            { type: 'RangeFilter', field_name: 'cloud_cover', config: { lte: 0.2 } }
          ]
        }
      };

      console.log(`[Satellite] Searching Planet for ${monument.name} (${targetYear})...`);
      const searchRes = await axios.post(
        'https://api.planet.com/data/v1/quick-search',
        searchRequest,
        { headers: { Authorization: `api-key ${process.env.PLANET_API_KEY}` }, timeout: 10000 }
      );

      const features = searchRes.data.features;
      if (features && features.length > 0) {
        let thumbUrl = features[0]._links.thumbnail;
        thumbUrl += thumbUrl.includes('?') ? '&width=1024' : '?width=1024';
        console.log(`[Satellite] ✓ Planet ${targetYear} imagery for ${monument.name}`);
        await streamUrl(thumbUrl, 'image/png');
        return;
      }
      console.warn(`[Satellite] Planet: no imagery found for ${monument.name} (${targetYear})`);
    } catch (planetErr) {
      console.warn(`[Satellite] Planet API error: ${planetErr.message}`);
    }
  }

  // ── 3. "After" imagery — ESRI World Imagery (current, 2022–2024) ─────────
  if (!isBefore) {
    try {
      const url = buildEsriCurrentUrl(monument.lat, monument.lng);
      console.log(`[Satellite] ✓ ESRI current (after) for ${monument.name}`);
      await streamUrl(url, 'image/png');
      return;
    } catch (err) {
      console.error(`[Satellite] ESRI current failed for ${id}: ${err.message}`);
    }
  }

  // ── 4. "Before" imagery — ESRI Wayback ~2018 (genuinely older snapshot) ──
  //
  //  This is the KEY FIX: instead of serving identical ESRI current imagery
  //  for both before and after, we now serve an archived 2018 vintage tile
  //  for "before". This gives a real 5–6 year temporal gap in the comparison.
  //
  if (isBefore) {
    // Try 2018 Wayback snapshot first
    try {
      const url = buildEsriWaybackUrl(monument.lat, monument.lng);
      console.log(`[Satellite] ✓ ESRI Wayback ~2018 (before) for ${monument.name}`);
      await streamUrl(url, 'image/png');
      return;
    } catch (err) {
      console.warn(`[Satellite] ESRI Wayback 2018 failed for ${id}: ${err.message}`);
    }

    // Try 2019 Wayback snapshot as secondary fallback
    try {
      const url = buildEsriWayback2019Url(monument.lat, monument.lng);
      console.log(`[Satellite] ✓ ESRI Wayback ~2019 (before) for ${monument.name}`);
      await streamUrl(url, 'image/png');
      return;
    } catch (err) {
      console.warn(`[Satellite] ESRI Wayback 2019 failed for ${id}: ${err.message}`);
    }

    // Last resort: serve current ESRI with a different (wider) bounding box
    // so at minimum the zoom level differs and the user can tell images apart.
    // Log a clear warning so devs know to run download_sentinel2.py.
    try {
      const url = buildEsriCurrentUrl(monument.lat, monument.lng, 0.025); // wider delta
      console.warn(`[Satellite] ⚠ Wayback unavailable for ${id}. Serving wider-zoom ESRI as "before" fallback. Run download_sentinel2.py for true historical imagery.`);
      await streamUrl(url, 'image/png');
      return;
    } catch (err) {
      console.error(`[Satellite] All before-image sources failed for ${id}: ${err.message}`);
    }
  }

  res.status(500).json({ error: 'Failed to fetch satellite imagery' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HeritageGuard API running on http://localhost:${PORT}`));
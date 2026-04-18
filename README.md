# 🏛️ HeritageGuard AI
### Archaeological Survey of India — Monument Monitoring Platform

> AI-powered satellite monitoring system for India's 3600+ ASI protected monuments.
> Built for Hackathon Demo | Full-stack prototype with simulated AI pipeline.

---

## 🚀 Quick Start (3 options)

### Option A — Frontend Only (Fastest, zero setup)
Just open `frontend/index.html` in any browser. No server needed.
The frontend is fully self-contained with all data built-in.

---

### Option B — With Backend API

**Prerequisites:** Node.js 18+

```bash
# 1. Install backend
cd backend
npm install

# 2. Start backend (runs on port 3001)
npm run dev

# 3. Open frontend
# Open frontend/index.html in browser
```

---

### Option C — Full Stack (Frontend + Backend + AI Service)

**Prerequisites:** Node.js 18+, Python 3.9+

```bash
# Terminal 1 — Backend API
cd backend
npm install
npm run dev
# → http://localhost:3001

# Terminal 2 — AI Service (Python FastAPI)
cd ai-service
pip install -r requirements.txt
python main.py
# → http://localhost:8000

# Terminal 3 — Frontend (any static server)
cd frontend
npx serve .
# → http://localhost:3000
# OR just open index.html directly
```

---

## 📁 Project Structure

```
heritageguard-ai/
├── frontend/
│   ├── index.html          ← Complete frontend (single file, self-contained)
│   └── package.json        ← React deps (if using React version)
│
├── backend/
│   ├── src/
│   │   ├── index.js        ← Express API server
│   │   └── data/
│   │       └── monuments.js ← Monument database
│   └── package.json
│
├── ai-service/
│   ├── main.py             ← FastAPI AI simulation service
│   └── requirements.txt
│
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/monuments` | All monuments with detections |
| GET | `/api/monuments/:id` | Single monument detail |
| POST | `/api/scan/:id` | Run AI scan on monument |
| POST | `/api/report/:id` | Generate incident report |
| GET | `/api/analytics/states` | State-wise analytics |
| GET | `/api/incidents` | Recent incident feed |
| GET | `/api/analytics/trends` | Monthly trend data |

## 🤖 AI Service Endpoints (port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/ai/scan` | Run full AI pipeline scan |
| GET | `/ai/models/status` | Model operational status |

---

## 🎯 Demo Flow

1. **Open Dashboard** → View live stats: 3,691 monuments monitored, active alerts, AI detections
2. **Map Monitor** → Click any monument marker (red/yellow/green) to open side panel
3. **AI Detection** → Select monument → click "Run AI Scan" → view bounding boxes
4. **Before/After** → Drag slider to compare 2023 vs 2025 satellite imagery
5. **Generate Report** → Click "Generate ASI Report" → formatted PDF-ready official report
6. **Analytics** → View state-wise vulnerability, encroachment trends, endangered sites

---

## 🏛️ Demo Monuments

| Monument | State | Status | Risk Score |
|----------|-------|--------|------------|
| Taj Mahal | Uttar Pradesh | 🔴 Critical | 87 |
| Qutub Minar | Delhi | 🟡 Warning | 63 |
| Hampi Ruins | Karnataka | 🔴 Critical | 91 |
| Konark Sun Temple | Odisha | 🟡 Warning | 71 |
| Khajuraho Temples | Madhya Pradesh | 🟢 Safe | 32 |
| Red Fort | Delhi | 🟡 Warning | 58 |
| Ajanta Caves | Maharashtra | 🟢 Safe | 28 |
| Ellora Caves | Maharashtra | 🟢 Safe | 41 |
| Fatehpur Sikri | Uttar Pradesh | 🟡 Warning | 55 |
| Mahabalipuram | Tamil Nadu | 🔴 Critical | 78 |

---

## 🤖 Simulated AI Pipeline

| Model | Task | Version |
|-------|------|---------|
| YOLOv8-Heritage-ASI | Encroachment detection | v2.3.1 |
| Siamese-UNet | Satellite change detection | v1.8.0 |
| Mask-RCNN-ASI | Structural damage mapping | v3.1.0 |
| DeepLabV3+ | Vegetation segmentation | v2.0.4 |

**Data Source:** ISRO Cartosat-3 + ESA Sentinel-2 (simulated)

---

## 📋 Features

- ✅ Heritage Monitoring Dashboard with live stats
- ✅ Interactive India map with color-coded monument markers
- ✅ AI Detection Viewer with YOLO-style bounding boxes
- ✅ Before/After satellite comparison slider
- ✅ Encroachment Zone Analysis (0–100m prohibited, 100–300m regulated)
- ✅ Vegetation segmentation with NDVI scores
- ✅ Auto-generated official ASI Incident Reports
- ✅ Risk Analytics with state-wise breakdown
- ✅ Live incident feed
- ✅ Monument detail panels

---

*HeritageGuard AI — Protecting India's Heritage with Technology*

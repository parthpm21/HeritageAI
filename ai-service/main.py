from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import random
import time
import uuid
from datetime import datetime

app = FastAPI(title="HeritageGuard AI Service", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectionRequest(BaseModel):
    monument_id: str
    detection_type: str  # encroachment | vegetation | structural | change
    image_url: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str
    confidence: float
    severity: Optional[str] = None

class DetectionResult(BaseModel):
    request_id: str
    monument_id: str
    detection_type: str
    model_name: str
    model_version: str
    processing_time_ms: int
    detected: bool
    confidence: float
    bounding_boxes: List[BoundingBox]
    metadata: dict
    timestamp: str

MODELS = {
    "encroachment": ("YOLOv8-Heritage", "2.1.4"),
    "vegetation":   ("DeepLabV3+",       "1.8.2"),
    "structural":   ("Mask-RCNN",         "3.0.1"),
    "change":       ("Siamese U-Net",     "1.5.0"),
}

MONUMENT_DATA = {
    "taj-mahal":     {"enc":True, "veg":True, "str":True, "van":False, "risk":87},
    "qutub-minar":   {"enc":True, "veg":True, "str":False,"van":False, "risk":62},
    "hampi":         {"enc":True, "veg":True, "str":True, "van":True,  "risk":91},
    "konark":        {"enc":False,"veg":True, "str":True, "van":False, "risk":74},
    "ajanta-caves":  {"enc":False,"veg":True, "str":False,"van":False, "risk":28},
    "red-fort":      {"enc":True, "veg":True, "str":False,"van":True,  "risk":55},
    "khajuraho":     {"enc":False,"veg":True, "str":False,"van":False, "risk":32},
    "ellora-caves":  {"enc":False,"veg":False,"str":False,"van":False, "risk":22},
}

def generate_bboxes(detection_type: str, detected: bool) -> List[BoundingBox]:
    if not detected:
        return []
    
    bbox_templates = {
        "encroachment": [
            BoundingBox(x=0.15, y=0.1, width=0.3, height=0.4, label="Illegal Structure", confidence=random.uniform(0.82,0.97), severity="HIGH"),
            BoundingBox(x=0.6, y=0.5, width=0.2, height=0.3, label="Encroachment Zone", confidence=random.uniform(0.75,0.90), severity="MEDIUM"),
        ],
        "vegetation": [
            BoundingBox(x=0.05, y=0.3, width=0.4, height=0.5, label="Vegetation Overgrowth", confidence=random.uniform(0.85,0.95), severity="MEDIUM"),
            BoundingBox(x=0.55, y=0.1, width=0.3, height=0.4, label="Creeper Growth", confidence=random.uniform(0.78,0.92), severity="LOW"),
        ],
        "structural": [
            BoundingBox(x=0.3, y=0.2, width=0.2, height=0.3, label="Structural Crack", confidence=random.uniform(0.80,0.94), severity="HIGH"),
            BoundingBox(x=0.5, y=0.6, width=0.15, height=0.2, label="Spalling Damage", confidence=random.uniform(0.72,0.88), severity="MEDIUM"),
        ],
        "change": [
            BoundingBox(x=0.1, y=0.1, width=0.5, height=0.6, label="Change Detected", confidence=random.uniform(0.88,0.98), severity="HIGH"),
        ],
    }
    return bbox_templates.get(detection_type, [])

@app.get("/")
def root():
    return {"service": "HeritageGuard AI", "version": "2.1.0", "status": "operational", "models_loaded": list(MODELS.keys())}

@app.post("/api/detect", response_model=DetectionResult)
def run_detection(req: DetectionRequest):
    start = time.time()
    
    monument = MONUMENT_DATA.get(req.monument_id)
    if not monument:
        raise HTTPException(status_code=404, detail=f"Monument {req.monument_id} not found")
    
    type_map = {"encroachment":"enc","vegetation":"veg","structural":"str","change":"str"}
    key = type_map.get(req.detection_type, "enc")
    detected = monument.get(key, False)
    
    conf_base = monument["risk"] / 100
    confidence = round(random.uniform(conf_base * 0.85, min(conf_base * 1.1, 0.99)), 3)
    
    model_name, model_version = MODELS.get(req.detection_type, ("YOLOv8", "2.0"))
    proc_time = random.randint(400, 2200)
    
    bboxes = generate_bboxes(req.detection_type, detected)
    
    meta = {
        "satellite_pass": "Sentinel-2A",
        "resolution": "10m/pixel",
        "cloud_cover": f"{random.randint(0,15)}%",
        "ndvi_score": round(random.uniform(0.1, 0.6), 3) if req.detection_type == "vegetation" else None,
        "change_area_sqm": random.randint(50, 500) if detected else 0,
        "risk_score": monument["risk"],
    }
    
    time.sleep(proc_time / 1000)  # simulate processing
    
    return DetectionResult(
        request_id=str(uuid.uuid4()),
        monument_id=req.monument_id,
        detection_type=req.detection_type,
        model_name=model_name,
        model_version=model_version,
        processing_time_ms=proc_time,
        detected=detected,
        confidence=confidence,
        bounding_boxes=bboxes,
        metadata=meta,
        timestamp=datetime.utcnow().isoformat()
    )

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "models": {k: {"name":v[0],"version":v[1],"status":"loaded"} for k,v in MODELS.items()},
        "gpu": "NVIDIA A100 (simulated)",
        "memory_usage": f"{random.randint(40,75)}%",
        "uptime_hours": random.randint(100, 9999),
    }

@app.get("/api/pipeline/status")
def pipeline_status():
    return {
        "satellite_ingestion": "ACTIVE",
        "preprocessing": "ACTIVE",
        "yolov8_encroachment": "ACTIVE",
        "deeplabv3_vegetation": "ACTIVE",
        "maskrcnn_structural": "ACTIVE",
        "siamese_change": "ACTIVE",
        "report_generator": "ACTIVE",
        "alerts_dispatcher": "ACTIVE",
        "queue_depth": random.randint(0, 12),
        "processed_today": random.randint(900, 1400),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

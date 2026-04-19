import requests
import os
from PIL import Image
from io import BytesIO

# Configuration
MONUMENT_ID = "charminar"
LAT = 17.3616
LNG = 78.4747
DELTA = 0.0008  # ~175m radius view

OUT_DIR = os.path.join(os.getcwd(), "backend", "public", "images", "monuments")
os.makedirs(OUT_DIR, exist_ok=True)

# Wayback IDs often used for "before" (2018/2019)
# Latest is standard ESRI World Imagery
SOURCES = {
    "satellite": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export",
    "after":     "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export",
    "before":    "https://wayback.arcgisonline.com/walrus/48/ArcGIS/rest/services/World_Imagery/MapServer/export"
}

def fetch_image(label, url):
    bbox = [LNG - DELTA, LAT - DELTA, LNG + DELTA, LAT + DELTA]
    bbox_str = ",".join(map(str, bbox))
    
    params = {
        "bbox": bbox_str,
        "bboxSR": "4326",
        "imageSR": "4326",
        "size": "1024,1024",
        "format": "jpg",
        "f": "image"
    }
    
    print(f"Fetching {label} for {MONUMENT_ID}...")
    try:
        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            out_path = os.path.join(OUT_DIR, f"{MONUMENT_ID}-{label}.jpg")
            with open(out_path, "wb") as f:
                f.write(response.content)
            print(f"  [OK] Saved to {out_path} ({len(response.content)//1024} KB)")
            return True
        else:
            print(f"  [FAIL] HTTP {response.status_code}")
    except Exception as e:
        print(f"  [ERROR] {e}")
    return False

if __name__ == "__main__":
    for label, url in SOURCES.items():
        fetch_image(label, url)
    print("\nFetch complete!")

"""
download_sentinel2.py
---------------------
Run ONCE to download real Sentinel-2 true-colour imagery for every monument.
Uses the free Copernicus Data Space STAC API (no API key needed for search).
Images are saved to:
  backend/public/images/monuments/{id}-before.jpg   (2019 imagery)
  backend/public/images/monuments/{id}-after.jpg    (2024 imagery)

Run from the project root:
  pip install requests pillow
  python download_sentinel2.py
"""

import requests
import os
import time
from io import BytesIO
from PIL import Image

# Output directory — adjust if your structure differs
OUT_DIR = os.path.join(os.path.dirname(__file__), "backend", "public", "images", "monuments")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Monument coordinates ────────────────────────────────────────────────────
MONUMENTS = [
    {"id": "taj-mahal",            "lat": 27.1751, "lng": 78.0421},
    {"id": "qutub-minar",          "lat": 28.5244, "lng": 77.1855},
    {"id": "hampi",                "lat": 15.3350, "lng": 76.4600},
    {"id": "konark-sun-temple",    "lat": 19.8876, "lng": 86.0945},
    {"id": "ajanta-caves",         "lat": 20.5519, "lng": 75.7033},
    {"id": "ellora-caves",         "lat": 20.0258, "lng": 75.1780},
    {"id": "red-fort",             "lat": 28.6562, "lng": 77.2410},
    {"id": "khajuraho",            "lat": 24.8318, "lng": 79.9199},
    {"id": "fatehpur-sikri",       "lat": 27.0945, "lng": 77.6679},
    {"id": "mahabalipuram",        "lat": 12.6269, "lng": 80.1927},
    {"id": "sanchi-stupa",         "lat": 23.4792, "lng": 77.7397},
    {"id": "charminar",            "lat": 17.3616, "lng": 78.4747},
    {"id": "hawa-mahal",           "lat": 26.9239, "lng": 75.8267},
    {"id": "elephanta-caves",      "lat": 18.9633, "lng": 72.9315},
    {"id": "rani-ki-vav",          "lat": 23.8587, "lng": 72.1012},
    {"id": "brihadisvara-temple",  "lat": 10.7828, "lng": 79.1318},
    {"id": "mysore-palace",        "lat": 12.3052, "lng": 76.6552},
    {"id": "sun-temple-modhera",   "lat": 23.5833, "lng": 72.1333},
    {"id": "gol-gumbaz",           "lat": 16.8290, "lng": 75.7360},
    {"id": "nalanda-university",   "lat": 25.1362, "lng": 85.4452},
]

# ── Year ranges (5-year gap) ────────────────────────────────────────────────
BEFORE_YEAR = "2019"   # "before" imagery
AFTER_YEAR  = "2024"   # "after"  imagery

# ── Bounding box size in degrees (~3km × 3km at these latitudes) ────────────
DELTA = 0.015   # ~1.5 km radius — wide enough to clearly show monument + surroundings

STAC_SEARCH = "https://catalogue.dataspace.copernicus.eu/stac/search"

# ── Microsoft Planetary Computer thumbnail (truly free, no signup) ──────────
# Format: https://planetarycomputer.microsoft.com/api/stac/v1/collections/sentinel-2-l2a/items
# We use their free render API as the image tile source after finding the scene ID via STAC search

MPC_STAC    = "https://planetarycomputer.microsoft.com/api/stac/v1/search"
MPC_RENDER  = "https://planetarycomputer.microsoft.com/api/data/v1/item/preview.png"

def bbox(lat, lng, delta=DELTA):
    return [lng - delta, lat - delta, lng + delta, lat + delta]

def bbox_str(lat, lng, delta=DELTA):
    b = bbox(lat, lng, delta)
    return f"{b[0]},{b[1]},{b[2]},{b[3]}"

def search_mpc(lat, lng, year):
    """Search Microsoft Planetary Computer STAC for best Sentinel-2 scene."""
    b = bbox(lat, lng)
    params = {
        "collections": "sentinel-2-l2a",
        "bbox": f"{b[0]},{b[1]},{b[2]},{b[3]}",
        "datetime": f"{year}-10-01T00:00:00Z/{year}-12-31T23:59:59Z",  # Oct–Dec = dry, less cloud
        "limit": 20,
        "query": '{"eo:cloud_cover": {"lt": 10}}'
    }
    try:
        r = requests.post(MPC_STAC, json={
            "collections": ["sentinel-2-l2a"],
            "bbox": b,
            "datetime": f"{year}-10-01T00:00:00Z/{year}-12-31T23:59:59Z",
            "limit": 20,
            "query": {"eo:cloud_cover": {"lt": 15}}
        }, timeout=20)
        r.raise_for_status()
        features = r.json().get("features", [])
        if not features:
            # Relax cloud cover and expand to full year
            r2 = requests.post(MPC_STAC, json={
                "collections": ["sentinel-2-l2a"],
                "bbox": b,
                "datetime": f"{year}-01-01T00:00:00Z/{year}-12-31T23:59:59Z",
                "limit": 20,
                "query": {"eo:cloud_cover": {"lt": 30}}
            }, timeout=20)
            r2.raise_for_status()
            features = r2.json().get("features", [])
        # Sort by cloud cover ascending
        features.sort(key=lambda f: f.get("properties", {}).get("eo:cloud_cover", 100))
        return features[0] if features else None
    except Exception as e:
        print(f"    MPC search error: {e}")
        return None

def download_mpc_preview(feature, lat, lng):
    """Download the rendered PNG from MPC using the item's assets."""
    try:
        # Use MPC's render API
        collection = "sentinel-2-l2a"
        item_id = feature["id"]
        b = bbox(lat, lng)
        url = (
            f"{MPC_RENDER}"
            f"?collection={collection}"
            f"&item={item_id}"
            f"&assets=B04,B03,B02"           # RGB true colour bands
            f"&asset_bidx=B04|1&asset_bidx=B03|1&asset_bidx=B02|1"
            f"&rescale=0,3000"
            f"&bbox={b[0]},{b[1]},{b[2]},{b[3]}"
            f"&width=1024&height=1024"
            f"&format=png"
        )
        r = requests.get(url, timeout=30)
        if r.status_code == 200 and len(r.content) > 5000:
            return r.content
        
        # Alternative: use the rendered_preview asset if it exists
        assets = feature.get("assets", {})
        if "rendered_preview" in assets:
            preview_url = assets["rendered_preview"]["href"]
            r2 = requests.get(preview_url, timeout=30)
            if r2.status_code == 200 and len(r2.content) > 5000:
                return r2.content
    except Exception as e:
        print(f"    MPC preview download error: {e}")
    return None

def search_copernicus_stac(lat, lng, year):
    """Search Copernicus STAC for best Sentinel-2 L2A scene."""
    b = bbox(lat, lng)
    payload = {
        "collections": ["SENTINEL-2"],
        "bbox": b,
        "datetime": f"{year}-10-01T00:00:00Z/{year}-12-31T23:59:59Z",
        "limit": 20,
        "filter": "eo:cloud_cover < 15 AND s2:processing_level = 'L2A'"
    }
    try:
        r = requests.post(STAC_SEARCH, json=payload, timeout=20)
        r.raise_for_status()
        features = r.json().get("features", [])
        if not features:
            payload2 = dict(payload)
            payload2["datetime"] = f"{year}-01-01T00:00:00Z/{year}-12-31T23:59:59Z"
            payload2["filter"] = "eo:cloud_cover < 30 AND s2:processing_level = 'L2A'"
            r2 = requests.post(STAC_SEARCH, json=payload2, timeout=20)
            r2.raise_for_status()
            features = r2.json().get("features", [])
        features.sort(key=lambda f: f.get("properties", {}).get("eo:cloud_cover", 100))
        return features[0] if features else None
    except Exception as e:
        print(f"    Copernicus STAC error: {e}")
        return None

def download_sentinel_thumbnail(feature):
    """Try to get thumbnail from STAC feature assets."""
    try:
        assets = feature.get("assets", {})
        for key in ["thumbnail", "THUMBNAIL", "overview", "visual"]:
            if key in assets:
                url = assets[key].get("href", "")
                if url:
                    r = requests.get(url, timeout=30)
                    if r.status_code == 200 and len(r.content) > 5000:
                        return r.content
    except Exception as e:
        print(f"    Thumbnail download error: {e}")
    return None

def save_jpg(img_bytes, out_path, size=(1024, 1024)):
    """Convert any image bytes to a JPEG and save."""
    try:
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        img = img.resize(size, Image.LANCZOS)
        img.save(out_path, "JPEG", quality=85)
        return True
    except Exception as e:
        print(f"    Image save error: {e}")
        return False

def get_esri_fallback(lat, lng):
    """ESRI World Imagery as reliable fallback (different dates not possible but shows real location)."""
    delta = 0.012
    b = [lng-delta, lat-delta, lng+delta, lat+delta]
    url = (
        f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export"
        f"?bbox={b[0]},{b[1]},{b[2]},{b[3]}&bboxSR=4326&imageSR=4326"
        f"&size=1024,1024&format=png&f=image"
    )
    try:
        r = requests.get(url, timeout=20)
        if r.status_code == 200 and len(r.content) > 5000:
            return r.content
    except Exception as e:
        print(f"    ESRI fallback error: {e}")
    return None

# ── Main download loop ──────────────────────────────────────────────────────
print("=" * 60)
print("HeritageGuard AI — Sentinel-2 Image Downloader")
print("=" * 60)
print(f"Output directory: {OUT_DIR}\n")

for monument in MONUMENTS:
    mid   = monument["id"]
    lat   = monument["lat"]
    lng   = monument["lng"]
    print(f"\n▶  {mid}  ({lat}, {lng})")

    for label, year in [("before", BEFORE_YEAR), ("after", AFTER_YEAR)]:
        out_path = os.path.join(OUT_DIR, f"{mid}-{label}.jpg")
        if os.path.exists(out_path):
            print(f"   ✓ {label} already exists, skipping")
            continue

        img_bytes = None
        print(f"   Searching MPC for {label} ({year})...")

        # Step 1: Try Microsoft Planetary Computer
        feature = search_mpc(lat, lng, year)
        if feature:
            cloud = feature.get("properties", {}).get("eo:cloud_cover", "?")
            date  = feature.get("properties", {}).get("datetime", "")[:10]
            print(f"   Found MPC scene: {date}  cloud={cloud}%")
            img_bytes = download_mpc_preview(feature, lat, lng)
            if img_bytes:
                print(f"   ✓ Downloaded from MPC")

        # Step 2: Try Copernicus STAC thumbnail
        if not img_bytes:
            print(f"   Trying Copernicus STAC...")
            feature2 = search_copernicus_stac(lat, lng, year)
            if feature2:
                cloud = feature2.get("properties", {}).get("eo:cloud_cover", "?")
                date  = feature2.get("properties", {}).get("datetime", "")[:10]
                print(f"   Found Copernicus scene: {date}  cloud={cloud}%")
                img_bytes = download_sentinel_thumbnail(feature2)
                if img_bytes:
                    print(f"   ✓ Downloaded from Copernicus STAC")

        # Step 3: ESRI fallback (same image for both, but at least it's real satellite)
        if not img_bytes:
            print(f"   Using ESRI World Imagery fallback...")
            img_bytes = get_esri_fallback(lat, lng)
            if img_bytes:
                print(f"   ✓ Got ESRI fallback")

        if img_bytes:
            if save_jpg(img_bytes, out_path):
                size_kb = os.path.getsize(out_path) // 1024
                print(f"   ✓ Saved {label}: {out_path} ({size_kb} KB)")
            else:
                print(f"   ✗ Failed to save {label}")
        else:
            print(f"   ✗ Could not get any image for {label}")

        time.sleep(1)  # be polite to the APIs

print("\n" + "=" * 60)
print("Download complete!")
print(f"Images saved to: {OUT_DIR}")
print("=" * 60)
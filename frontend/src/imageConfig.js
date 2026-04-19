// frontend/src/imageConfig.js
// ALL images are real satellite imagery — no Wikipedia, no stock photos.
//
// Priority chain (handled by onError in App.js):
//   1. Pre-downloaded Sentinel-2 file served by backend  (best — real S2 imagery)
//   2. ESRI World Imagery via backend proxy               (good — live aerial)
//   3. ESRI World Imagery direct URL                      (fallback if backend down)
//
// Run download_sentinel2.py once to populate before/after Sentinel-2 files.

const BASE = 'http://localhost:5000';

// ESRI World Imagery direct URLs — used as final fallback if backend is down.
// These are real satellite/aerial images centered on each monument.
function esriDirectUrl(lat, lng, delta = 0.012) {
  const b = [lng - delta, lat - delta, lng + delta, lat + delta];
  return (
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export` +
    `?bbox=${b[0]},${b[1]},${b[2]},${b[3]}&bboxSR=4326&imageSR=4326` +
    `&size=1024,1024&format=png&f=image`
  );
}

// Monument coordinates for direct ESRI fallback
const COORDS = {
  'taj-mahal':            { lat: 27.1751, lng: 78.0421 },
  'qutub-minar':          { lat: 28.5244, lng: 77.1855 },
  'hampi':                { lat: 15.3350, lng: 76.4600 },
  'konark-sun-temple':    { lat: 19.8876, lng: 86.0945 },
  'ajanta-caves':         { lat: 20.5519, lng: 75.7033 },
  'ellora-caves':         { lat: 20.0258, lng: 75.1780 },
  'red-fort':             { lat: 28.6562, lng: 77.2410 },
  'khajuraho':            { lat: 24.8318, lng: 79.9199 },
  'fatehpur-sikri':       { lat: 27.0945, lng: 77.6679 },
  'mahabalipuram':        { lat: 12.6269, lng: 80.1927 },
  'sanchi-stupa':         { lat: 23.4792, lng: 77.7397 },
  'charminar':            { lat: 17.3616, lng: 78.4747 },
  'hawa-mahal':           { lat: 26.9239, lng: 75.8267 },
  'elephanta-caves':      { lat: 18.9633, lng: 72.9315 },
  'rani-ki-vav':          { lat: 23.8587, lng: 72.1012 },
  'brihadisvara-temple':  { lat: 10.7828, lng: 79.1318 },
  'mysore-palace':        { lat: 12.3052, lng: 76.6552 },
  'sun-temple-modhera':   { lat: 23.5833, lng: 72.1333 },
  'gol-gumbaz':           { lat: 16.8290, lng: 75.7360 },
  'nalanda-university':   { lat: 25.1362, lng: 85.4452 },
};

/**
 * getMonumentImage
 *
 * All types return satellite imagery:
 *
 * 'main'      → latest ESRI/Sentinel-2 via backend proxy (current aerial view)
 * 'satellite' → same as main (current view, used in AI detection viewer)
 * 'after'     → pre-downloaded Sentinel-2 2024 file via backend
 * 'before'    → pre-downloaded Sentinel-2 2019 file via backend (?year=2019)
 *
 * onError handlers in App.js must call getMonumentFallback(id) which returns
 * a direct ESRI URL that works without the backend.
 */
export function getMonumentImage(monumentId, type = 'main') {
  switch (type) {
    case 'main':
    case 'satellite':
      // Current satellite view via backend (ESRI or Planet if key set)
      return `${BASE}/api/satellite/planet/${monumentId}`;

    case 'after':
      // Pre-downloaded Sentinel-2 2024 (after), falls through to ESRI if not found
      return `${BASE}/api/satellite/planet/${monumentId}`;

    case 'before':
      // Pre-downloaded Sentinel-2 2019 (before, ~5 year gap)
      return `${BASE}/api/satellite/planet/${monumentId}?year=2019`;

    default:
      return `${BASE}/api/satellite/planet/${monumentId}`;
  }
}

/**
 * getMonumentFallback
 *
 * Used in every onError handler in App.js.
 * Returns a direct ESRI World Imagery URL — real satellite imagery,
 * works without any backend, no API key needed.
 */
export function getMonumentFallback(monumentId) {
  const coords = COORDS[monumentId];
  if (coords) {
    return esriDirectUrl(coords.lat, coords.lng);
  }
  // Generic India satellite view as last resort
  return esriDirectUrl(20.5937, 78.9629, 5);
}
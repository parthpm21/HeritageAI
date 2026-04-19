// frontend/src/imageConfig.js
//
// Priority chain for each image (handled by onError in App.js):
//   1. Pre-downloaded Sentinel-2 file served by backend  (best — real S2 imagery)
//   2. ESRI World Imagery (after) / ESRI Wayback ~2018 (before)  ← KEY FIX
//   3. Direct ESRI World Imagery URL                     (last resort, no backend)
//
// THE FIX: "before" requests include ?year=2019 so the backend routes them
// to the ESRI Wayback archive (~2018 snapshot), giving a genuine 5-6 year
// temporal gap versus the current ESRI imagery served for "after".
//
// Run download_sentinel2.py once to populate real Sentinel-2 before/after files.

const BASE = 'http://localhost:5000';

// ESRI World Imagery direct URLs — used as final fallback if backend is down.
// "before" fallback uses a slightly wider bounding box so it at least looks
// different from the "after" image when Sentinel-2 files are missing.
function esriDirectUrl(lat, lng, delta = 0.012) {
  const b = [lng - delta, lat - delta, lng + delta, lat + delta];
  return (
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export` +
    `?bbox=${b[0]},${b[1]},${b[2]},${b[3]}&bboxSR=4326&imageSR=4326` +
    `&size=1024,1024&format=png&f=image`
  );
}

// ESRI Wayback ~2018 direct URL — used as "before" fallback if backend is down.
// This is the same archive the backend hits, so the fallback matches backend behaviour.
function esriWaybackUrl(lat, lng, delta = 0.012) {
  const b = [lng - delta, lat - delta, lng + delta, lat + delta];
  return (
    `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/1538611200000/export` +
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
 * Returns a URL that the backend will resolve to the correct image source:
 *
 * 'main'      → /api/satellite/planet/{id}            (current ESRI or Sentinel-2 after)
 * 'satellite' → /api/satellite/planet/{id}            (same as main)
 * 'after'     → /api/satellite/planet/{id}            (ESRI current / Sentinel-2 2024)
 * 'before'    → /api/satellite/planet/{id}?year=2019  (ESRI Wayback ~2018 / Sentinel-2 2019)
 *
 * The ?year=2019 parameter is what makes the backend serve a genuinely older
 * image source for "before" — this is the core of the fix.
 */
export function getMonumentImage(monumentId, type = 'main') {
  // Use a session-level cache buster so images reload when the app loads, but dragging doesn't flicker
  const _cb = window.__IMG_CACHE || (window.__IMG_CACHE = Date.now().toString().slice(-5));
  switch (type) {
    case 'before':
      // year=2019 routes backend to: local Sentinel-2 2019 → Planet 2019 → ESRI Wayback ~2018
      return `${BASE}/api/satellite/planet/${monumentId}?year=2019&cb=${_cb}`;

    case 'after':
    case 'main':
    case 'satellite':
    default:
      // No year param routes backend to: local Sentinel-2 2024 → ESRI current (2022–2024)
      return `${BASE}/api/satellite/planet/${monumentId}?cb=${_cb}`;
  }
}

/**
 * getMonumentFallback
 *
 * Called by onError handlers in App.js when the backend request fails.
 * Returns a direct URL to the appropriate source — no backend needed.
 *
 * Pass type='before' to get the ESRI Wayback ~2018 URL directly.
 * Default (after/satellite) returns current ESRI World Imagery.
 */
export function getMonumentFallback(monumentId, type = 'after') {
  const coords = COORDS[monumentId];
  if (!coords) {
    // Generic India satellite view as last resort
    return esriDirectUrl(20.5937, 78.9629, 5);
  }

  if (type === 'before') {
    // Use ESRI Wayback ~2018 so "before" fallback is also historically different
    return esriWaybackUrl(coords.lat, coords.lng);
  }

  // "after" / "main" / "satellite" — current ESRI World Imagery
  return esriDirectUrl(coords.lat, coords.lng);
}
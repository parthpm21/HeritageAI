// frontend/src/imageConfig.js
// Central image configuration for all monuments

const BASE = 'http://localhost:5000';

export const MONUMENT_IMAGES = {
  'taj-mahal': {
    main:      `${BASE}/images/monuments/taj-mahal.jpg`,
    satellite: `${BASE}/api/satellite/planet/taj-mahal`,
    before:    `${BASE}/images/monuments/taj-mahal-before.jpg`,
    after:     `${BASE}/images/monuments/taj-mahal-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/1280px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg',
  },
  'qutub-minar': {
    main:      `${BASE}/images/monuments/qutub-minar.jpg`,
    satellite: `${BASE}/api/satellite/planet/qutub-minar`,
    before:    `${BASE}/images/monuments/qutub-minar-before.jpg`,
    after:     `${BASE}/images/monuments/qutub-minar-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Qutb_Minar_at_sunset.jpg/1280px-Qutb_Minar_at_sunset.jpg',
  },
  'hampi': {
    main:      `${BASE}/images/monuments/hampi.jpg`,
    satellite: `${BASE}/api/satellite/planet/hampi`,
    before:    `${BASE}/images/monuments/hampi-before.jpg`,
    after:     `${BASE}/images/monuments/hampi-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Hampi_virupaksha_temple.jpg/1280px-Hampi_virupaksha_temple.jpg',
  },
  'konark': {
    main:      `${BASE}/images/monuments/konark.jpg`,
    satellite: `${BASE}/api/satellite/planet/konark`,
    before:    `${BASE}/images/monuments/konark-before.jpg`,
    after:     `${BASE}/images/monuments/konark-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg',
  },
  'konark-sun-temple': {
    main:      `${BASE}/images/monuments/konark.jpg`,
    satellite: `${BASE}/api/satellite/planet/konark-sun-temple`,
    before:    `${BASE}/images/monuments/konark-before.jpg`,
    after:     `${BASE}/images/monuments/konark-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Konarka_Temple.jpg/1280px-Konarka_Temple.jpg',
  },
  'ajanta-caves': {
    main:      `${BASE}/images/monuments/ajanta-caves.jpg`,
    satellite: `${BASE}/images/monuments/ajanta-caves-satellite.jpg`,
    before:    `${BASE}/images/monuments/ajanta-caves-before.jpg`,
    after:     `${BASE}/images/monuments/ajanta-caves-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Ajanta_Caves%2C_India.jpg/1280px-Ajanta_Caves%2C_India.jpg',
  },
  'ellora-caves': {
    main:      `${BASE}/images/monuments/ellora-caves.jpg`,
    satellite: `${BASE}/images/monuments/ellora-caves-satellite.jpg`,
    before:    `${BASE}/images/monuments/ellora-caves-before.jpg`,
    after:     `${BASE}/images/monuments/ellora-caves-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Kailasha_temple_ellora.jpg/1280px-Kailasha_temple_ellora.jpg',
  },
  'red-fort': {
    main:      `${BASE}/images/monuments/red-fort.jpg`,
    satellite: `${BASE}/images/monuments/red-fort-satellite.jpg`,
    before:    `${BASE}/images/monuments/red-fort-before.jpg`,
    after:     `${BASE}/images/monuments/red-fort-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Red_Fort_in_New_Delhi_03-2016_img3.jpg/1280px-Red_Fort_in_New_Delhi_03-2016_img3.jpg',
  },
  'khajuraho': {
    main:      `${BASE}/images/monuments/khajuraho.jpg`,
    satellite: `${BASE}/images/monuments/khajuraho-satellite.jpg`,
    before:    `${BASE}/images/monuments/khajuraho-before.jpg`,
    after:     `${BASE}/images/monuments/khajuraho-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Kandariya_Mahadeva_Temple%2C_Khajuraho.jpg/1280px-Kandariya_Mahadeva_Temple%2C_Khajuraho.jpg',
  },
  'fatehpur-sikri': {
    main:      `${BASE}/images/monuments/fatehpur-sikri.jpg`,
    satellite: `${BASE}/images/monuments/fatehpur-sikri-satellite.jpg`,
    before:    `${BASE}/images/monuments/fatehpur-sikri-before.jpg`,
    after:     `${BASE}/images/monuments/fatehpur-sikri-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Buland_Darwaza_Fatehpur_Sikri.jpg/1280px-Buland_Darwaza_Fatehpur_Sikri.jpg',
  },
  'mahabalipuram': {
    main:      `${BASE}/images/monuments/mahabalipuram.jpg`,
    satellite: `${BASE}/images/monuments/mahabalipuram-satellite.jpg`,
    before:    `${BASE}/images/monuments/mahabalipuram-before.jpg`,
    after:     `${BASE}/images/monuments/mahabalipuram-after.jpg`,
    fallback:  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Shore_Temple_Mahabalipuram.jpg/1280px-Shore_Temple_Mahabalipuram.jpg',
  },
};

export function getMonumentImage(monumentId, type = 'main') {
  const config = MONUMENT_IMAGES[monumentId];
  
  if (type === 'satellite') {
    return `http://localhost:5000/api/satellite/planet/${monumentId}`;
  }

  if (!config) {
    return `http://localhost:5000/images/monuments/${monumentId}.jpg`;
  }
  
  const url = config[type] || config.fallback || config.main;
  return url;
}

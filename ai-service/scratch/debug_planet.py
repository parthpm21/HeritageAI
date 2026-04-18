import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('PLANET_API_KEY')

def check_monument(name, lat, lng):
    print(f"\n--- Checking {name} ({lat}, {lng}) ---")
    search_req = {
        'item_types': ['PSScene'],
        'filter': {
            'type': 'AndFilter',
            'config': [
                {
                    'type': 'GeometryFilter',
                    'field_name': 'geometry',
                    'config': {
                        'type': 'Point',
                        'coordinates': [lng, lat]
                    }
                },
                {
                    'type': 'DateRangeFilter',
                    'field_name': 'acquired',
                    'config': { 'gte': '2025-01-01T00:00:00Z' }
                }
            ]
        }
    }
    
    r = requests.post('https://api.planet.com/data/v1/quick-search', auth=(key, ''), json=search_req)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        features = data.get('features', [])
        print(f"Found {len(features)} images total since Jan 2025")
        for f in features[:3]:
            props = f['properties']
            print(f" - Date: {props['acquired']} Clouds: {props['cloud_cover']}")
    else:
        print(r.text)

check_monument("Taj Mahal", 27.1751, 78.0421)
check_monument("Qutub Minar", 28.5244, 77.1855)

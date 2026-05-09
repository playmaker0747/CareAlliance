export type FacilityType = 'hospital' | 'clinic' | 'pharmacy';

export interface NearbyFacility {
  id: string;
  name: string;
  type: FacilityType;
  distance: number;
  address: string;
  latitude: number;
  longitude: number;
  navigationUrl: string;
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function searchNearbyFacilities(
  lat: number,
  lon: number,
  radius: number = 5000 // 5km default
): Promise<NearbyFacility[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
      node["amenity"="pharmacy"](around:${radius},${lat},${lon});
      way["amenity"="pharmacy"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch nearby facilities");
    }

    const data = await response.json();
    const facilities: NearbyFacility[] = [];

    for (const element of data.elements) {
      const eLat = element.lat || element.center?.lat;
      const eLon = element.lon || element.center?.lon;
      
      if (!eLat || !eLon) continue;

      const amenity = element.tags?.amenity;
      let type: FacilityType = 'clinic';
      if (amenity === 'hospital') type = 'hospital';
      if (amenity === 'pharmacy') type = 'pharmacy';

      const name = element.tags?.name || `Unnamed ${type}`;
      const address = [
        element.tags?.["addr:street"] ? `${element.tags?.["addr:housenumber"] || ''} ${element.tags?.["addr:street"]}`.trim() : null,
        element.tags?.["addr:city"]
      ].filter(Boolean).join(", ") || "Address not available";

      const distance = calculateDistanceMeters(lat, lon, eLat, eLon);
      const navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${eLat},${eLon}`;

      facilities.push({
        id: element.id.toString(),
        name,
        type,
        distance,
        address,
        latitude: eLat,
        longitude: eLon,
        navigationUrl,
      });
    }

    return facilities.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error("Error fetching from Overpass API:", error);
    return [];
  }
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

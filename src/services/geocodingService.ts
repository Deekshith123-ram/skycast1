import { LocationData, DistrictRainData } from '../types/weather';

// Whole Karnataka default view
export const KARNATAKA_DEFAULT_LOCATION: LocationData = {
  id: 'karnataka-all',
  name: 'Karnataka (Whole State)',
  district: 'All 31 Districts',
  state: 'Karnataka',
  country: 'India',
  latitude: 14.6500,
  longitude: 75.8500,
  elevation: 650,
  isDefault: true,
};

export const DEFAULT_LOCATION = KARNATAKA_DEFAULT_LOCATION;

// All 31 official districts of Karnataka with precise meteorological coordinates and climate classification
export const ALL_KARNATAKA_DISTRICTS: Array<LocationData & { region: DistrictRainData['region'] }> = [
  {
    id: 'tumakuru-ka',
    name: 'Tumakuru',
    district: 'Tumakuru',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.3409,
    longitude: 77.1006,
    elevation: 822,
    region: 'South Interior',
  },
  {
    id: 'bengaluru-urban-ka',
    name: 'Bengaluru Urban',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    elevation: 920,
    region: 'South Interior',
  },
  {
    id: 'bengaluru-rural-ka',
    name: 'Bengaluru Rural',
    district: 'Bengaluru Rural',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.2847,
    longitude: 77.5542,
    elevation: 890,
    region: 'South Interior',
  },
  {
    id: 'mysuru-ka',
    name: 'Mysuru',
    district: 'Mysuru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.2958,
    longitude: 76.6394,
    elevation: 763,
    region: 'South Interior',
  },
  {
    id: 'mangaluru-ka',
    name: 'Dakshina Kannada (Mangaluru)',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9141,
    longitude: 74.8560,
    elevation: 22,
    region: 'Coastal',
  },
  {
    id: 'udupi-ka',
    name: 'Udupi',
    district: 'Udupi',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.3409,
    longitude: 74.7421,
    elevation: 39,
    region: 'Coastal',
  },
  {
    id: 'uttara-kannada-ka',
    name: 'Uttara Kannada (Karwar)',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    country: 'India',
    latitude: 14.8185,
    longitude: 74.1303,
    elevation: 12,
    region: 'Coastal',
  },
  {
    id: 'shivamogga-ka',
    name: 'Shivamogga',
    district: 'Shivamogga',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.9299,
    longitude: 75.5681,
    elevation: 569,
    region: 'Malnad (Ghats)',
  },
  {
    id: 'chikkamagaluru-ka',
    name: 'Chikkamagaluru',
    district: 'Chikkamagaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.3161,
    longitude: 75.7720,
    elevation: 1090,
    region: 'Malnad (Ghats)',
  },
  {
    id: 'hassan-ka',
    name: 'Hassan',
    district: 'Hassan',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.0033,
    longitude: 76.1004,
    elevation: 972,
    region: 'South Interior',
  },
  {
    id: 'kodagu-ka',
    name: 'Kodagu (Madikeri)',
    district: 'Kodagu',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.4244,
    longitude: 75.7382,
    elevation: 1150,
    region: 'Malnad (Ghats)',
  },
  {
    id: 'mandya-ka',
    name: 'Mandya',
    district: 'Mandya',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.5218,
    longitude: 76.8951,
    elevation: 678,
    region: 'South Interior',
  },
  {
    id: 'chamarajanagar-ka',
    name: 'Chamarajanagar',
    district: 'Chamarajanagar',
    state: 'Karnataka',
    country: 'India',
    latitude: 11.9261,
    longitude: 76.9437,
    elevation: 662,
    region: 'South Interior',
  },
  {
    id: 'ramanagara-ka',
    name: 'Ramanagara',
    district: 'Ramanagara',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.7159,
    longitude: 77.2814,
    elevation: 747,
    region: 'South Interior',
  },
  {
    id: 'kolar-ka',
    name: 'Kolar',
    district: 'Kolar',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.1367,
    longitude: 78.1291,
    elevation: 822,
    region: 'South Interior',
  },
  {
    id: 'chikkaballapura-ka',
    name: 'Chikkaballapura',
    district: 'Chikkaballapura',
    state: 'Karnataka',
    country: 'India',
    latitude: 13.4355,
    longitude: 77.7275,
    elevation: 915,
    region: 'South Interior',
  },
  {
    id: 'chitradurga-ka',
    name: 'Chitradurga',
    district: 'Chitradurga',
    state: 'Karnataka',
    country: 'India',
    latitude: 14.2251,
    longitude: 76.3980,
    elevation: 732,
    region: 'South Interior',
  },
  {
    id: 'davanagere-ka',
    name: 'Davanagere',
    district: 'Davanagere',
    state: 'Karnataka',
    country: 'India',
    latitude: 14.4644,
    longitude: 75.9218,
    elevation: 602,
    region: 'South Interior',
  },
  {
    id: 'ballari-ka',
    name: 'Ballari',
    district: 'Ballari',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.1394,
    longitude: 76.9214,
    elevation: 495,
    region: 'North Interior',
  },
  {
    id: 'vijayanagara-ka',
    name: 'Vijayanagara (Hosapete)',
    district: 'Vijayanagara',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.2689,
    longitude: 76.3909,
    elevation: 479,
    region: 'North Interior',
  },
  {
    id: 'haveri-ka',
    name: 'Haveri',
    district: 'Haveri',
    state: 'Karnataka',
    country: 'India',
    latitude: 14.7966,
    longitude: 75.3999,
    elevation: 572,
    region: 'North Interior',
  },
  {
    id: 'gadag-ka',
    name: 'Gadag',
    district: 'Gadag',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.4167,
    longitude: 75.6333,
    elevation: 654,
    region: 'North Interior',
  },
  {
    id: 'dharwad-ka',
    name: 'Dharwad (Hubballi)',
    district: 'Dharwad',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.3647,
    longitude: 75.1240,
    elevation: 671,
    region: 'North Interior',
  },
  {
    id: 'belagavi-ka',
    name: 'Belagavi',
    district: 'Belagavi',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.8497,
    longitude: 74.4977,
    elevation: 751,
    region: 'North Interior',
  },
  {
    id: 'bagalkote-ka',
    name: 'Bagalkote',
    district: 'Bagalkote',
    state: 'Karnataka',
    country: 'India',
    latitude: 16.1691,
    longitude: 75.6615,
    elevation: 533,
    region: 'North Interior',
  },
  {
    id: 'vijayapura-ka',
    name: 'Vijayapura',
    district: 'Vijayapura',
    state: 'Karnataka',
    country: 'India',
    latitude: 16.8302,
    longitude: 75.7100,
    elevation: 593,
    region: 'North Interior',
  },
  {
    id: 'koppal-ka',
    name: 'Koppal',
    district: 'Koppal',
    state: 'Karnataka',
    country: 'India',
    latitude: 15.3477,
    longitude: 76.1554,
    elevation: 530,
    region: 'North Interior',
  },
  {
    id: 'raichur-ka',
    name: 'Raichur',
    district: 'Raichur',
    state: 'Karnataka',
    country: 'India',
    latitude: 16.2120,
    longitude: 77.3439,
    elevation: 407,
    region: 'North Interior',
  },
  {
    id: 'kalaburagi-ka',
    name: 'Kalaburagi',
    district: 'Kalaburagi',
    state: 'Karnataka',
    country: 'India',
    latitude: 17.3297,
    longitude: 76.8343,
    elevation: 454,
    region: 'North Interior',
  },
  {
    id: 'yadgir-ka',
    name: 'Yadgir',
    district: 'Yadgir',
    state: 'Karnataka',
    country: 'India',
    latitude: 16.7628,
    longitude: 77.1442,
    elevation: 389,
    region: 'North Interior',
  },
  {
    id: 'bidar-ka',
    name: 'Bidar',
    district: 'Bidar',
    state: 'Karnataka',
    country: 'India',
    latitude: 17.9104,
    longitude: 77.5199,
    elevation: 615,
    region: 'North Interior',
  },
];

// Combine Karnataka default + all 31 districts + major Indian cities
export const POPULAR_INDIAN_LOCATIONS: LocationData[] = [
  KARNATAKA_DEFAULT_LOCATION,
  ...ALL_KARNATAKA_DISTRICTS,
  {
    id: 'mumbai-mh',
    name: 'Mumbai',
    district: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    elevation: 14,
  },
  {
    id: 'delhi-dl',
    name: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    elevation: 216,
  },
  {
    id: 'chennai-tn',
    name: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    elevation: 6,
  },
  {
    id: 'hyderabad-ts',
    name: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    elevation: 542,
  },
  {
    id: 'kolkata-wb',
    name: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
    elevation: 9,
  },
  {
    id: 'kochi-kl',
    name: 'Kochi',
    district: 'Ernakulam',
    state: 'Kerala',
    country: 'India',
    latitude: 9.9312,
    longitude: 76.2673,
    elevation: 4,
  },
  {
    id: 'panaji-ga',
    name: 'Panaji',
    district: 'North Goa',
    state: 'Goa',
    country: 'India',
    latitude: 15.4909,
    longitude: 73.8278,
    elevation: 7,
  },
];

import { KARNATAKA_LOCALITIES } from './karnatakaLocalities';

export { KARNATAKA_LOCALITIES };

// Helper to determine the closest Karnataka district to any given coordinate
export function findClosestKarnatakaDistrict(lat: number, lon: number): (LocationData & { region: DistrictRainData['region'] }) {
  let closest = ALL_KARNATAKA_DISTRICTS[0];
  let minDistance = Infinity;

  for (const d of ALL_KARNATAKA_DISTRICTS) {
    const dist = Math.hypot(d.latitude - lat, d.longitude - lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = d;
    }
  }

  return closest;
}

// Search Karnataka localities, towns, villages, and all 31 districts
export async function searchLocations(query: string): Promise<LocationData[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return [KARNATAKA_DEFAULT_LOCATION, ...ALL_KARNATAKA_DISTRICTS.slice(0, 10)];
  }

  // 1. Fast local match against Karnataka districts & popular Indian cities
  const localDistrictMatches = POPULAR_INDIAN_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(cleanQuery) ||
      loc.district.toLowerCase().includes(cleanQuery)
  );

  // 2. Fast local match against curated Karnataka localities and neighborhoods
  const localLocalityMatches = KARNATAKA_LOCALITIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(cleanQuery) ||
      (loc.locality && loc.locality.toLowerCase().includes(cleanQuery)) ||
      loc.district.toLowerCase().includes(cleanQuery)
  );

  const localCombined: LocationData[] = [...localDistrictMatches];
  for (const item of localLocalityMatches) {
    const exists = localCombined.some((c) => c.name.toLowerCase() === item.name.toLowerCase());
    if (!exists) {
      localCombined.push(item);
    }
  }

  // 3. Remote search: Query server endpoint /api/search-localities (falls back to Nominatim and Open-Meteo)
  const remoteResults: LocationData[] = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3800);

    // A. Query proxy or Nominatim for Karnataka localities, towns, and villages
    let osmItems: any[] = [];
    try {
      const serverProxyUrl = `/api/search-localities?q=${encodeURIComponent(cleanQuery)}`;
      const proxyRes = await fetch(serverProxyUrl, { signal: controller.signal });
      if (proxyRes.ok) {
        osmItems = await proxyRes.json();
      } else {
        throw new Error('Proxy status ' + proxyRes.status);
      }
    } catch {
      // Direct client fallback to Nominatim
      try {
        const queryTerm = cleanQuery.includes('karnataka') ? cleanQuery : `${cleanQuery}, Karnataka`;
        const directUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          queryTerm
        )}&format=json&addressdetails=1&limit=8&countrycodes=in`;
        const directRes = await fetch(directUrl, {
          headers: { 'User-Agent': 'SkyCastWeatherApp/2.5' },
          signal: controller.signal,
        });
        if (directRes.ok) {
          osmItems = await directRes.json();
        }
      } catch {}
    }

    if (Array.isArray(osmItems)) {
      for (const item of osmItems) {
        const addr = item.address || {};
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (isNaN(lat) || isNaN(lon)) continue;

        // Extract most specific locality name
        const localityName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.city_district ||
          addr.village ||
          addr.hamlet ||
          addr.town ||
          item.name;

        const closestDist = findClosestKarnatakaDistrict(lat, lon);
        const districtName = addr.state_district || addr.county || addr.city || closestDist.district;
        const stateName = addr.state || 'Karnataka';

        remoteResults.push({
          id: `osm-loc-${item.place_id || lat.toFixed(3) + '-' + lon.toFixed(3)}`,
          name: localityName || item.name || 'Karnataka Locality',
          locality: localityName || item.name,
          district: districtName,
          state: stateName,
          country: 'India',
          latitude: Number(lat.toFixed(4)),
          longitude: Number(lon.toFixed(4)),
          elevation: closestDist.elevation ?? 750,
          isLocality: true,
        });
      }
    }

    // B. Also query Open-Meteo geocoding to cover standard town and city names
    try {
      const omUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleanQuery
      )}&count=8&language=en&format=json`;
      const proxyOmUrl = omUrl.replace('https://geocoding-api.open-meteo.com', '/api/geocoding-open-meteo');

      let omRes: Response;
      try {
        const res = await fetch(proxyOmUrl, { signal: controller.signal });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          omRes = res;
        } else {
          omRes = await fetch(omUrl, { signal: controller.signal });
        }
      } catch {
        omRes = await fetch(omUrl, { signal: controller.signal });
      }
      if (omRes.ok) {
        const omData = await omRes.json();
        if (omData.results && Array.isArray(omData.results)) {
          for (const item of omData.results) {
            if (item.country_code !== 'IN' && item.country !== 'India') continue;
            const lat = Number(item.latitude);
            const lon = Number(item.longitude);
            const closestDist = findClosestKarnatakaDistrict(lat, lon);
            const isKa = item.admin1 === 'Karnataka' || Math.hypot(closestDist.latitude - lat, closestDist.longitude - lon) < 1.8;

            remoteResults.push({
              id: `om-${item.id || item.name.toLowerCase()}-${lat.toFixed(3)}`,
              name: item.name,
              locality: item.name,
              district: item.admin2 || item.admin3 || closestDist.district,
              state: item.admin1 || (isKa ? 'Karnataka' : 'India'),
              country: 'India',
              latitude: Number(lat.toFixed(4)),
              longitude: Number(lon.toFixed(4)),
              elevation: item.elevation ? Number(item.elevation) : closestDist.elevation,
              isLocality: isKa && item.name.toLowerCase() !== closestDist.district.toLowerCase(),
            });
          }
        }
      }
    } catch {}

    clearTimeout(timeout);
  } catch (err) {
    console.warn('Remote geocoding notice:', err);
  }

  // Merge and deduplicate (by coordinates distance < 2km or identical name in same district)
  const merged: LocationData[] = [...localCombined];

  for (const item of remoteResults) {
    const isDuplicate = merged.some(
      (m) =>
        (Math.abs(m.latitude - item.latitude) < 0.02 && Math.abs(m.longitude - item.longitude) < 0.02) ||
        (m.name.toLowerCase() === item.name.toLowerCase() && m.district.toLowerCase() === item.district.toLowerCase())
    );
    if (!isDuplicate) {
      merged.push(item);
    }
  }

  // Sort: Exact name matches first, then Karnataka localities, then districts
  merged.sort((a, b) => {
    const aNameMatch = a.name.toLowerCase() === cleanQuery;
    const bNameMatch = b.name.toLowerCase() === cleanQuery;
    if (aNameMatch && !bNameMatch) return -1;
    if (!aNameMatch && bNameMatch) return 1;

    const aStarts = a.name.toLowerCase().startsWith(cleanQuery);
    const bStarts = b.name.toLowerCase().startsWith(cleanQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return 0;
  });

  return merged.slice(0, 15);
}

// Reverse geocode latitude and longitude to detect the user's PRECISE locality
export async function reverseGeocodeLocation(lat: number, lon: number): Promise<LocationData> {
  const closestDistrict = findClosestKarnatakaDistrict(lat, lon);

  // 1. Try high-accuracy reverse geocoding via server endpoint or OpenStreetMap Nominatim
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    let data: any = null;

    // A. Query server proxy
    try {
      const proxyUrl = `/api/reverse-geocode?lat=${lat}&lon=${lon}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      if (res.ok) {
        data = await res.json();
      }
    } catch {}

    // B. Direct client fallback if proxy failed
    if (!data || !data.address) {
      try {
        const directUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`;
        const directRes = await fetch(directUrl, {
          headers: { 'User-Agent': 'SkyCastWeatherApp/2.5' },
          signal: controller.signal,
        });
        if (directRes.ok) {
          data = await directRes.json();
        }
      } catch {}
    }

    clearTimeout(timeout);

    if (data && data.address) {
      const addr = data.address;

      // Extract the most specific locality name (e.g. Vasanth Nagar, Maragondanahalli, Indiranagar)
      const localityName =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.quarter ||
        addr.city_district ||
        addr.village ||
        addr.hamlet ||
        addr.isolated_dwelling ||
        addr.town ||
        addr.municipality ||
        addr.city ||
        data.name;

      // Determine parent district and city
      const districtName =
        addr.state_district ||
        addr.county ||
        closestDistrict.district ||
        addr.city ||
        'Karnataka';

      const stateName = addr.state || 'Karnataka';
      const countryName = addr.country || 'India';
      const isLocality = Boolean(localityName && localityName !== districtName);

      return {
        id: `detected-locality-${lat.toFixed(4)}-${lon.toFixed(4)}`,
        name: localityName || closestDistrict.name,
        locality: localityName || undefined,
        district: districtName,
        state: stateName,
        country: countryName,
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lon.toFixed(4)),
        elevation: closestDistrict.elevation ?? 750,
        isLocality,
        isEstimate: false,
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding network lookup notice:', err);
  }

  // 2. Offline fallback: Check if user is within ~6km of any curated Karnataka locality
  let nearestLocality: LocationData | null = null;
  let minLocDist = Infinity;

  for (const loc of KARNATAKA_LOCALITIES) {
    const dist = Math.hypot(loc.latitude - lat, loc.longitude - lon);
    if (dist < minLocDist) {
      minLocDist = dist;
      nearestLocality = loc;
    }
  }

  // If within ~6km (~0.055 deg) of a curated locality, use that locality
  if (nearestLocality && minLocDist < 0.055) {
    return {
      ...nearestLocality,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      isEstimate: minLocDist > 0.02, // Mark as estimate if slightly away
    };
  }

  // 3. Fallback to closest district with user's exact coordinates and estimate indicator
  return {
    id: `gps-loc-${lat.toFixed(4)}-${lon.toFixed(4)}`,
    name: closestDistrict.name,
    locality: closestDistrict.name,
    district: closestDistrict.district,
    state: closestDistrict.state,
    country: closestDistrict.country,
    latitude: Number(lat.toFixed(4)),
    longitude: Number(lon.toFixed(4)),
    elevation: closestDistrict.elevation,
    isLocality: false,
    isEstimate: true,
  };
}


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

// Search Indian locations with local fuzzy match and Open-Meteo Geocoding
export async function searchLocations(query: string): Promise<LocationData[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return [KARNATAKA_DEFAULT_LOCATION, ...ALL_KARNATAKA_DISTRICTS.slice(0, 7)];
  }

  // 1. Fast match against Karnataka districts & popular Indian places
  const localMatches = POPULAR_INDIAN_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(cleanQuery) ||
      loc.district.toLowerCase().includes(cleanQuery) ||
      loc.state.toLowerCase().includes(cleanQuery)
  );

  // 2. Fetch from Open-Meteo Geocoding API prioritizing India
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const targetUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cleanQuery
    )}&count=10&language=en&format=json`;
    const proxyUrl = targetUrl.replace('https://geocoding-api.open-meteo.com', '/api/geocoding-open-meteo');

    let res: Response;
    try {
      res = await fetch(proxyUrl, { signal: controller.signal });
      if (!res.ok) res = await fetch(targetUrl, { signal: controller.signal });
    } catch {
      res = await fetch(targetUrl, { signal: controller.signal });
    }
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        const remoteResults: LocationData[] = data.results
          .filter((item: any) => item.country_code === 'IN' || item.country === 'India')
          .map((item: any) => ({
            id: `${item.id || item.name.toLowerCase()}-${item.latitude}`,
            name: item.name,
            district: item.admin2 || item.admin3 || item.admin1 || item.name,
            state: item.admin1 || 'India',
            country: 'India',
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            elevation: item.elevation ? Number(item.elevation) : undefined,
          }));

        // Merge without duplicates
        const combined = [...localMatches];
        for (const item of remoteResults) {
          const exists = combined.some(
            (c) =>
              Math.abs(c.latitude - item.latitude) < 0.05 &&
              Math.abs(c.longitude - item.longitude) < 0.05
          );
          if (!exists) {
            combined.push(item);
          }
        }
        return combined.slice(0, 12);
      }
    }
  } catch (err) {
    console.warn('Geocoding search network error, falling back to local database:', err);
  }

  return localMatches.length > 0 ? localMatches : ALL_KARNATAKA_DISTRICTS.slice(0, 8);
}

// Reverse geocode latitude and longitude to a user-friendly LocationData
export async function reverseGeocodeLocation(lat: number, lon: number): Promise<LocationData> {
  // 1. Check if the user is within ~35km of a predefined Karnataka district or city
  let closest: LocationData | null = null;
  let minDistance = Infinity;

  for (const loc of POPULAR_INDIAN_LOCATIONS) {
    if (loc.id === 'karnataka-all') continue;
    const dLat = loc.latitude - lat;
    const dLon = loc.longitude - lon;
    const dist = Math.hypot(dLat, dLon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  // If within ~35km (~0.35 deg) of a known Karnataka district/city, snap to that location
  if (closest && minDistance < 0.35) {
    return {
      ...closest,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
    };
  }

  // 2. Fetch from OpenStreetMap Nominatim reverse geocoder
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: { 'User-Agent': 'SkyCastWeatherApp/1.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.municipality ||
        addr.county ||
        data.name ||
        'Current Location';
      const districtName = addr.county || addr.state_district || cityName;
      const stateName = addr.state || 'Local Region';
      const countryName = addr.country || 'India';

      return {
        id: `current-loc-${lat.toFixed(3)}-${lon.toFixed(3)}`,
        name: cityName,
        district: districtName,
        state: stateName,
        country: countryName,
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lon.toFixed(4)),
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding network lookup failed:', err);
  }

  // 3. Fallback
  return {
    id: `current-loc-${lat.toFixed(3)}-${lon.toFixed(3)}`,
    name: closest ? closest.name : 'Current Location',
    district: closest ? closest.district : 'Local Area',
    state: closest ? closest.state : 'Karnataka',
    country: closest ? closest.country : 'India',
    latitude: Number(lat.toFixed(4)),
    longitude: Number(lon.toFixed(4)),
  };
}


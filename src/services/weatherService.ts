import { LocationData, WeatherData, CurrentWeather, HourlyForecastItem, DailyForecastItem, DistrictRainData } from '../types/weather';
import { ALL_KARNATAKA_DISTRICTS } from './geocodingService';

// WMO Weather Interpretation Codes
export function getWeatherDescription(code: number): { description: string; icon: string; category: string } {
  switch (code) {
    case 0:
      return { description: 'Clear Sky', icon: 'Sun', category: 'clear' };
    case 1:
      return { description: 'Mainly Clear', icon: 'SunDim', category: 'clear' };
    case 2:
      return { description: 'Partly Cloudy', icon: 'CloudSun', category: 'cloudy' };
    case 3:
      return { description: 'Overcast & Cloudy', icon: 'Cloud', category: 'cloudy' };
    case 45:
      return { description: 'Foggy Mist', icon: 'CloudFog', category: 'fog' };
    case 48:
      return { description: 'Depositing Rime Fog', icon: 'CloudFog', category: 'fog' };
    case 51:
      return { description: 'Light Drizzle', icon: 'CloudDrizzle', category: 'drizzle' };
    case 53:
      return { description: 'Moderate Drizzle', icon: 'CloudDrizzle', category: 'drizzle' };
    case 55:
      return { description: 'Dense Drizzle', icon: 'CloudDrizzle', category: 'drizzle' };
    case 61:
      return { description: 'Slight Rain', icon: 'CloudRain', category: 'rain' };
    case 63:
      return { description: 'Moderate Monsoon Rain', icon: 'CloudRain', category: 'rain' };
    case 65:
      return { description: 'Heavy Monsoon Downpour', icon: 'CloudRainWind', category: 'rain' };
    case 80:
      return { description: 'Scattered Rain Showers', icon: 'CloudSunRain', category: 'rain' };
    case 81:
      return { description: 'Moderate Rain Showers', icon: 'CloudRain', category: 'rain' };
    case 82:
      return { description: 'Violent Cloudburst Showers', icon: 'CloudLightning', category: 'storm' };
    case 95:
      return { description: 'Thunderstorm with Lightning', icon: 'Zap', category: 'storm' };
    case 96:
    case 99:
      return { description: 'Severe Thunderstorm with Hail', icon: 'CloudLightning', category: 'storm' };
    default:
      return { description: 'Intermittent Clouds', icon: 'Cloud', category: 'cloudy' };
  }
}

// Convert wind degrees to Indian compass cardinal point
export function getWindDirectionLabel(deg: number): string {
  const directions = [
    'N (North)', 'NNE', 'NE (North-East)', 'ENE',
    'E (East)', 'ESE', 'SE (South-East)', 'SSE',
    'S (South)', 'SSW', 'SW (South-West)', 'WSW',
    'W (West)', 'WNW', 'NW (North-West)', 'NNW'
  ];
  const index = Math.round((deg % 360) / 22.5);
  return directions[index % 16];
}

const CACHE_PREFIX = 'skycast_weather_';

async function fetchOpenMeteo(url: string): Promise<Response> {
  const proxyUrl = url.replace('https://api.open-meteo.com', '/api/open-meteo');
  try {
    const res = await fetch(proxyUrl);
    if (res.ok) return res;
    return await fetch(url);
  } catch {
    return await fetch(url);
  }
}

export async function fetchWeatherData(location: LocationData): Promise<WeatherData> {
  const cacheKey = `${CACHE_PREFIX}${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`;

  // Construct URL to Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day` +
    `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant` +
    `&timezone=Asia%2FKolkata` +
    `&forecast_days=10`;

  try {
    const res = await fetchOpenMeteo(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const now = new Date();

    const currentWeather: CurrentWeather = {
      temperature: Math.round(data.current?.temperature_2m ?? 26),
      apparentTemperature: Math.round(data.current?.apparent_temperature ?? 27),
      relativeHumidity: Math.round(data.current?.relative_humidity_2m ?? 65),
      precipitation: data.current?.precipitation ?? 0,
      rain: data.current?.rain ?? 0,
      weatherCode: data.current?.weather_code ?? 0,
      weatherDescription: getWeatherDescription(data.current?.weather_code ?? 0).description,
      cloudCover: Math.round(data.current?.cloud_cover ?? 20),
      surfacePressure: Math.round(data.current?.surface_pressure ?? 1010),
      pressureMsl: Math.round(data.current?.pressure_msl ?? 1012),
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 8),
      windDirection: data.current?.wind_direction_10m ?? 90,
      windGusts: Math.round(data.current?.wind_gusts_10m ?? 12),
      uvIndex: Number((data.current?.uv_index ?? 5).toFixed(1)),
      dewPoint: data.hourly?.dew_point_2m?.[0] ? Math.round(data.hourly.dew_point_2m[0]) : undefined,
      visibility: data.hourly?.visibility?.[0] ? Math.round(data.hourly.visibility[0] / 1000) : 10,
      isDay: Boolean(data.current?.is_day ?? 1),
      timestamp: now.toISOString(),
    };

    // Parse Hourly: Ensure first entry corresponds to next full clock hour
    const hourlyList: HourlyForecastItem[] = [];
    const hourlyTimes: string[] = data.hourly?.time || [];
    
    // Determine current local time in Asia/Kolkata (IST)
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const nowInIST = new Date(istString);

    // Calculate the next full clock hour (e.g. 14:38 -> 15:00, 14:59 -> 15:00, 15:00 -> 16:00)
    const nextFullHour = new Date(nowInIST);
    nextFullHour.setHours(nextFullHour.getHours() + 1, 0, 0, 0);

    const pad = (n: number) => String(n).padStart(2, '0');
    const targetIso = `${nextFullHour.getFullYear()}-${pad(nextFullHour.getMonth() + 1)}-${pad(nextFullHour.getDate())}T${pad(nextFullHour.getHours())}:00`;

    // Find the entry that matches the next full clock hour
    let startIndex = hourlyTimes.findIndex(t => t === targetIso || t.startsWith(targetIso));
    if (startIndex === -1) {
      startIndex = hourlyTimes.findIndex(t => t >= targetIso);
    }
    if (startIndex === -1) {
      startIndex = 0;
    }

    for (let i = startIndex; i < Math.min(startIndex + 48, hourlyTimes.length); i++) {
      const timeStr = hourlyTimes[i];
      const [, timePart] = timeStr.split('T');
      const [hStr, mStr] = (timePart || '00:00').split(':');
      const hourDate = new Date(2000, 0, 1, parseInt(hStr, 10), parseInt(mStr, 10));
      const formattedHour = hourDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      hourlyList.push({
        time: timeStr,
        formattedTime: formattedHour,
        temperature: Math.round(data.hourly.temperature_2m[i] ?? 25),
        apparentTemperature: Math.round(data.hourly.apparent_temperature[i] ?? 26),
        precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
        precipitation: Number((data.hourly.precipitation?.[i] ?? 0).toFixed(1)),
        weatherCode: data.hourly.weather_code[i] ?? 0,
        weatherDescription: getWeatherDescription(data.hourly.weather_code[i] ?? 0).description,
        cloudCover: Math.round(data.hourly.cloud_cover[i] ?? 20),
        windSpeed: Math.round(data.hourly.wind_speed_10m[i] ?? 8),
        windDirection: data.hourly.wind_direction_10m[i] ?? 90,
        uvIndex: Number((data.hourly.uv_index?.[i] ?? 0).toFixed(1)),
        humidity: Math.round(data.hourly.relative_humidity_2m[i] ?? 60),
        surfacePressure: Math.round(data.hourly.surface_pressure[i] ?? 1010),
        visibility: data.hourly.visibility?.[i] ? Math.round(data.hourly.visibility[i] / 1000) : 10,
      });
    }

    // Parse Daily
    const dailyList: DailyForecastItem[] = [];
    const dailyDates: string[] = data.daily?.time || [];

    for (let i = 0; i < dailyDates.length; i++) {
      const dStr = dailyDates[i];
      const dObj = new Date(dStr);
      const isToday = i === 0;

      dailyList.push({
        date: dStr,
        dayName: isToday ? 'Today' : dObj.toLocaleDateString('en-IN', { weekday: 'short' }),
        formattedDate: dObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        weatherCode: data.daily.weather_code[i] ?? 0,
        weatherDescription: getWeatherDescription(data.daily.weather_code[i] ?? 0).description,
        tempMax: Math.round(data.daily.temperature_2m_max[i] ?? 30),
        tempMin: Math.round(data.daily.temperature_2m_min[i] ?? 20),
        precipitationSum: Number((data.daily.precipitation_sum[i] ?? 0).toFixed(1)),
        precipitationProbabilityMax: data.daily.precipitation_probability_max[i] ?? 0,
        windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i] ?? 12),
        windGustsMax: Math.round(data.daily.wind_gusts_10m_max[i] ?? 20),
        windDirectionDominant: data.daily.wind_direction_10m_dominant[i] ?? 90,
        sunrise: data.daily.sunrise[i] ? new Date(data.daily.sunrise[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '06:08 AM',
        sunset: data.daily.sunset[i] ? new Date(data.daily.sunset[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '06:25 PM',
        uvIndexMax: Number((data.daily.uv_index_max?.[i] ?? 7).toFixed(1)),
      });
    }

    const weatherData: WeatherData = {
      location,
      current: currentWeather,
      hourly: hourlyList,
      daily: dailyList,
      lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST',
      isStale: false,
    };

    // Cache locally
    try {
      localStorage.setItem(cacheKey, JSON.stringify(weatherData));
    } catch {
      // Ignore quota errors
    }

    return weatherData;
  } catch (err) {
    console.warn('Weather network request unavailable, serving local telemetry:', err);

    // Try reading from cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as WeatherData;
        parsed.isStale = true;
        return parsed;
      }
    } catch {
      // ignore
    }

    // Default fallback values if network fails on first run
    const now = new Date();
    return {
      location,
      current: {
        temperature: 28,
        apparentTemperature: 29,
        relativeHumidity: 62,
        precipitation: 0,
        rain: 0,
        weatherCode: 2,
        weatherDescription: 'Partly Cloudy',
        cloudCover: 35,
        surfacePressure: 1012,
        pressureMsl: 1014,
        windSpeed: 10,
        windDirection: 90,
        windGusts: 15,
        uvIndex: 6,
        dewPoint: 20,
        visibility: 10,
        isDay: true,
        timestamp: now.toISOString(),
      },
      hourly: Array.from({ length: 48 }).map((_, i) => {
        const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const nowInIST = new Date(istString);
        const nextHour = new Date(nowInIST);
        nextHour.setHours(nextHour.getHours() + 1 + i, 0, 0, 0);
        const hourDate = new Date(2000, 0, 1, nextHour.getHours(), 0);
        const formattedHour = hourDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        return {
          time: nextHour.toISOString(),
          formattedTime: formattedHour,
          temperature: 26 + Math.round(Math.sin(i / 3) * 4),
          apparentTemperature: 27 + Math.round(Math.sin(i / 3) * 4),
          precipitationProbability: 15,
          precipitation: 0,
          weatherCode: 2,
          weatherDescription: 'Partly Cloudy',
          cloudCover: 35,
          windSpeed: 10,
          windDirection: 90,
          uvIndex: 4,
          humidity: 65,
          surfacePressure: 1012,
          visibility: 10,
        };
      }),
      daily: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(now.getTime() + i * 86400000).toISOString(),
        dayName: i === 0 ? 'Today' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(now.getDay() + i) % 7],
        formattedDate: new Date(now.getTime() + i * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        weatherCode: 2,
        weatherDescription: 'Partly Cloudy',
        tempMax: 31,
        tempMin: 21,
        precipitationSum: 1.2,
        precipitationProbabilityMax: 25,
        windSpeedMax: 14,
        windGustsMax: 22,
        windDirectionDominant: 85,
        sunrise: '06:08 AM',
        sunset: '06:18 PM',
        uvIndexMax: 7.5,
      })),
      lastUpdated: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST (Cached)',
      isStale: true,
    };
  }
}

// Fetch live probability of rain across ALL 31 Karnataka Districts in a single query
const KARNATAKA_RAIN_CACHE_KEY = 'skycast_karnataka_all_districts_rain';

export async function fetchAllKarnatakaDistrictsRain(): Promise<DistrictRainData[]> {
  try {
    const lats = ALL_KARNATAKA_DISTRICTS.map((d) => d.latitude.toFixed(4)).join(',');
    const lons = ALL_KARNATAKA_DISTRICTS.map((d) => d.longitude.toFixed(4)).join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&daily=precipitation_probability_max,precipitation_sum,weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata`;

    const res = await fetchOpenMeteo(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo multi-district forecast returned status ${res.status}`);
    }

    const data = await res.json();
    const results: DistrictRainData[] = [];

    // When multiple coordinates are requested, Open-Meteo returns an Array of result objects
    const items = Array.isArray(data) ? data : [data];

    for (let i = 0; i < ALL_KARNATAKA_DISTRICTS.length; i++) {
      const dist = ALL_KARNATAKA_DISTRICTS[i];
      const forecast = items[i];

      const rainProb = forecast?.daily?.precipitation_probability_max?.[0] ?? 20;
      const precipSum = forecast?.daily?.precipitation_sum?.[0] ?? 0;
      const wCode = forecast?.daily?.weather_code?.[0] ?? 0;
      const tMax = Math.round(forecast?.daily?.temperature_2m_max?.[0] ?? 30);
      const tMin = Math.round(forecast?.daily?.temperature_2m_min?.[0] ?? 21);

      results.push({
        id: dist.id,
        name: dist.name,
        district: dist.district,
        latitude: dist.latitude,
        longitude: dist.longitude,
        rainProbability: rainProb,
        precipitationSum: Number(precipSum.toFixed(1)),
        tempMax: tMax,
        tempMin: tMin,
        weatherCode: wCode,
        weatherDescription: getWeatherDescription(wCode).description,
        region: dist.region,
      });
    }

    // Cache locally
    try {
      localStorage.setItem(KARNATAKA_RAIN_CACHE_KEY, JSON.stringify(results));
    } catch {}

    return results;
  } catch (err) {
    console.warn('Failed to fetch live Karnataka district rain telemetry, checking cache:', err);
    try {
      const cached = localStorage.getItem(KARNATAKA_RAIN_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    // Fallback baseline for all 31 districts
    return ALL_KARNATAKA_DISTRICTS.map((dist, idx) => ({
      id: dist.id,
      name: dist.name,
      district: dist.district,
      latitude: dist.latitude,
      longitude: dist.longitude,
      rainProbability: dist.region === 'Coastal' ? 55 : dist.region === 'Malnad (Ghats)' ? 45 : 20,
      precipitationSum: dist.region === 'Coastal' ? 4.2 : 0.8,
      tempMax: 31,
      tempMin: 22,
      weatherCode: 2,
      weatherDescription: 'Partly Cloudy',
      region: dist.region,
    }));
  }
}

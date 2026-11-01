import { WeatherData } from '../types/weather';

export type WeatherBackgroundType = 'rainy' | 'cloudy' | 'sunny' | 'night';

export interface WeatherBackgroundConfig {
  type: WeatherBackgroundType;
  image: string;
  label: string;
  description: string;
  accentColor: string;
}

export const WEATHER_BACKGROUNDS: Record<WeatherBackgroundType, WeatherBackgroundConfig> = {
  rainy: {
    type: 'rainy',
    image: '/backgrounds/rainy.png',
    label: 'Image 1 – Rainy',
    description: 'Rain, Drizzle, Showers, Thunderstorms',
    accentColor: '#38bdf8',
  },
  cloudy: {
    type: 'cloudy',
    image: '/backgrounds/cloudy.png',
    label: 'Image 2 – Cloudy',
    description: 'Cloudy, Mostly Cloudy, Overcast',
    accentColor: '#94a3b8',
  },
  sunny: {
    type: 'sunny',
    image: '/backgrounds/sunny.png',
    label: 'Image 3 – Sunny',
    description: 'Clear, Sunny, Mainly Clear during daytime',
    accentColor: '#00afcb',
  },
  night: {
    type: 'night',
    image: '/backgrounds/night.png',
    label: 'Image 4 – Night',
    description: 'Clear Night, Mainly Clear at night',
    accentColor: '#818cf8',
  },
};

/**
 * Helper to check whether it is currently daytime in Karnataka (Asia/Kolkata timezone)
 */
export function getKarnatakaIsDay(): boolean {
  try {
    const istDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h = istDate.getHours() + istDate.getMinutes() / 60;
    return h >= 6.0 && h < 18.25;
  } catch {
    const now = new Date();
    const istHour = (now.getUTCHours() + 5.5 + now.getUTCMinutes() / 60) % 24;
    return istHour >= 6.0 && istHour < 18.25;
  }
}

/**
 * Determines which background to display according to the live weather conditions
 * and day/night status of the currently selected locality.
 *
 * Exact Mappings:
 * 1. Image 1 – Rainy: Rain, Drizzle, Showers, Thunderstorms.
 * 2. Image 2 – Cloudy: Cloudy, Mostly Cloudy, Overcast.
 * 3. Image 3 – Sunny: Clear, Sunny, Mainly Clear during daytime.
 * 4. Image 4 – Night: Clear Night, Mainly Clear at night.
 */
export function determineWeatherBackground(weather: WeatherData | null): WeatherBackgroundType {
  // 0. Fallback based on Karnataka local time (IST) if telemetry hasn't arrived yet
  if (!weather || !weather.current) {
    return getKarnatakaIsDay() ? 'sunny' : 'night';
  }

  const { current } = weather;
  const code = current.weatherCode;
  const isDay = typeof current.isDay === 'boolean' ? current.isDay : Boolean(current.isDay);
  const cloudCover = current.cloudCover ?? 0;
  const precipitation = current.precipitation ?? 0;
  const rain = current.rain ?? 0;
  const desc = (current.weatherDescription || '').toLowerCase();

  // 1. Image 1 – Rainy: Rain, Drizzle, Showers, Thunderstorms (Day or Night)
  const isRainCode =
    (code >= 51 && code <= 67) || // Drizzle, freezing drizzle, rain
    (code >= 80 && code <= 82) || // Rain showers, cloudburst
    code >= 95; // Thunderstorm, severe storm
  const isRainTelemetry = precipitation > 0.1 || rain > 0;
  const isRainText =
    desc.includes('rain') ||
    desc.includes('drizzle') ||
    desc.includes('shower') ||
    desc.includes('thunder') ||
    desc.includes('storm') ||
    desc.includes('downpour') ||
    desc.includes('cloudburst');

  if (isRainCode || isRainTelemetry || isRainText) {
    return 'rainy';
  }

  // Cloudiness checks for: Cloudy, Mostly Cloudy, Overcast
  const isCloudyCode = code === 3 || code === 45 || code === 48; // WMO 3 = Overcast, 45/48 = Fog
  const isHighCloudCover = cloudCover >= 50;
  const isCloudyText =
    desc.includes('overcast') ||
    desc.includes('cloudy') ||
    desc.includes('mostly cloudy') ||
    desc.includes('fog');
  const isCloudyWeather = isCloudyCode || isHighCloudCover || isCloudyText;

  // 4. At Night:
  if (!isDay) {
    // If heavily overcast or dense cloudy at night -> Image 2 (Cloudy)
    if (code === 3 || desc.includes('overcast') || (cloudCover >= 70 && isCloudyText)) {
      return 'cloudy';
    }
    // Clear Night, Mainly Clear at night -> Image 4 (Night)
    return 'night';
  }

  // Daytime:
  // 2. Image 2 – Cloudy: Cloudy, Mostly Cloudy, Overcast
  if (isCloudyWeather) {
    return 'cloudy';
  }

  // 3. Image 3 – Sunny: Clear, Sunny, Mainly Clear during daytime
  return 'sunny';
}

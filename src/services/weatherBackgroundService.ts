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
    label: 'Rainy Weather',
    description: 'Falling rain streaks & dark blue storm clouds',
    accentColor: '#38bdf8',
  },
  cloudy: {
    type: 'cloudy',
    image: '/backgrounds/cloudy.png',
    label: 'Cloudy Sky',
    description: 'Layered grey-blue textured overcast clouds without rain',
    accentColor: '#94a3b8',
  },
  sunny: {
    type: 'sunny',
    image: '/backgrounds/sunny.png',
    label: 'Day Clear Sky',
    description: 'Bright daylight with natural sunlight & soft white clouds',
    accentColor: '#00afcb',
  },
  night: {
    type: 'night',
    image: '/backgrounds/night.png',
    label: 'Clear Night Sky',
    description: 'Deep navy night sky with stars & moonlight',
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
 * of the user's detected locality or searched location.
 *
 * Rules:
 * 1. Rainy weather: Rain, drizzle, showers, or thunderstorm -> Rainy background
 * 2. Nighttime: Night hours / !isDay without rain -> Night background (moon & stars)
 * 3. Daytime Cloudy: Daytime with overcast, heavy cloud deck, or fog -> Cloudy background
 * 4. Daytime Clear: Daytime clear sky, sunny, or fair-weather clouds -> Day clear sky background
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

  // 1. Rainy Weather (Rain / Drizzle / Showers / Thunderstorm) - applied day or night
  const isRainCode =
    (code >= 51 && code <= 67) || // Drizzle, freezing drizzle, rain
    (code >= 80 && code <= 82) || // Rain showers
    code >= 95; // Thunderstorm, severe storm
  const isRainTelemetry = precipitation > 0.1 || rain > 0;
  const isRainText =
    desc.includes('rain') ||
    desc.includes('drizzle') ||
    desc.includes('shower') ||
    desc.includes('thunder') ||
    desc.includes('storm');

  if (isRainCode || isRainTelemetry || isRainText) {
    return 'rainy';
  }

  // 2. Night Sky
  // When it is nighttime and not raining:
  // Display the realistic deep navy night sky with stars, moonlight, and nocturnal clouds
  if (!isDay) {
    return 'night';
  }

  // 3. Daytime Cloudy Sky (Overcast, dense cloud deck, fog)
  // WMO code 3 = Overcast, 45/48 = Fog, code 2 = Partly cloudy with >= 50% clouds
  const isCloudyCode = code === 3 || code === 45 || code === 48;
  const isHighCloudCover = cloudCover >= 50;
  const isCloudyText = desc.includes('overcast') || desc.includes('cloudy') || desc.includes('fog');

  if (isCloudyCode || isHighCloudCover || isCloudyText) {
    return 'cloudy';
  }

  // 4. Daytime Clear Sky (Sunny / Clear sky / light fair-weather clouds)
  return 'sunny';
}

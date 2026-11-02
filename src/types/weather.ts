export interface LocationData {
  id: string;
  name: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  isDefault?: boolean;
  locality?: string;
  isLocality?: boolean;
  isEstimate?: boolean;
}

export type WeatherDataSource = 'live' | 'cached' | 'estimated' | 'unavailable';

export interface DistrictRainData {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  rainProbability: number;
  precipitationSum: number;
  temp?: number;
  tempMax: number;
  tempMin: number;
  humidity?: number;
  windSpeed?: number;
  weatherCode: number;
  weatherDescription: string;
  region: 'Coastal' | 'Malnad (Ghats)' | 'North Interior' | 'South Interior';
  dataSource?: WeatherDataSource;
  cachedAt?: number;
  isEstimate?: boolean;
  isStale?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  weatherDescription: string;
  cloudCover: number;
  surfacePressure: number;
  pressureMsl: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  dewPoint?: number;
  visibility?: number;
  isDay: boolean;
  timestamp: string;
}

export interface HourlyForecastItem {
  time: string;
  formattedTime: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  humidity: number;
  surfacePressure: number;
  visibility?: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherCode: number;
  weatherDescription: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
}

export interface WeatherData {
  location: LocationData;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  lastUpdated: string;
  isStale?: boolean;
  isEstimate?: boolean;
  dataSource?: WeatherDataSource;
  cachedAt?: number;
}

export type MapLayerType =
  | 'satellite_clouds'     // RainViewer / GIBS Infrared cloud layer
  | 'satellite_truecolor'  // NASA GIBS MODIS True Color visible
  | 'satellite_viirs'      // NASA GIBS VIIRS High-Res
  | 'radar_precipitation'  // RainViewer Doppler Radar
  | 'insat_thermal'        // IMD INSAT-3D Thermal IR
  | 'insat_water_vapour'   // IMD INSAT Water Vapour
  | 'insat_visible'        // IMD INSAT Visible
  | 'insat_rgb'            // IMD INSAT RGB Composite
  | 'wind_vectors'         // Animated wind particle simulation
  | 'temperature_overlay'  // Modeled thermal heatmap
  | 'clouds_openmeteo'     // Open-Meteo cloud cover
  | 'precipitation_forecast'; // Rain forecast

export interface SatelliteFrame {
  time: number;
  path: string;
  formattedTime: string;
  relativeTime: string;
  type: 'radar' | 'satellite';
}

export interface WeatherAlert {
  id: string;
  title: string;
  affectedRegion: string;
  severity: 'Warning' | 'Alert' | 'Watch' | 'Advisory';
  severityColor: 'red' | 'amber' | 'yellow' | 'blue';
  issueTime: string;
  validUntil: string;
  explanation: string;
  instructions: string;
  source: string;
  category: 'Rainfall' | 'Thunderstorm' | 'Heat' | 'Wind' | 'General';
}

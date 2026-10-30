/**
 * SkyCast Settings Service
 * Manages user preferences: Weather Alerts, Measurement Units, Location Management,
 * Satellite Map Controls, Appearance Options, and Auto-Refresh Rates.
 */

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'ms' | 'mph';
export type PrecipitationUnit = 'mm' | 'inch';
export type PressureUnit = 'hpa' | 'mmhg' | 'inhg';
export type SatelliteDefaultLayer = 'clouds_satellite' | 'radar_rain' | 'satellite_pure';
export type RefreshInterval = 60000 | 180000 | 300000 | 0; // 1m, 3m, 5m, manual

export type StartupLocationMode = 'current_location' | 'default_district';

export interface UserSettings {
  // 1. Measurement Units
  tempUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  precipUnit: PrecipitationUnit;
  pressureUnit: PressureUnit;

  // 2. Weather Alerts
  severeAlerts: boolean;
  rainThresholdAlerts: boolean;
  alertSound: boolean;

  // 3. Location Management
  autoDetectLocation: boolean;
  startupLocationMode: StartupLocationMode;
  defaultDistrictId: string;
  defaultDistrictName: string;

  // 4. Satellite Map Controls
  defaultMapLayer: SatelliteDefaultLayer;
  defaultCloudOpacity: number;
  showDistrictPinsOnLaunch: boolean;
  overlayRainRadarOverClouds: boolean;

  // 5. Appearance
  showAtmosphereAnimation: boolean;

  // 6. Automatic Refresh
  refreshInterval: RefreshInterval;
  syncOnAppResume: boolean;
  lowDataMode: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  tempUnit: 'celsius',
  windSpeedUnit: 'kmh',
  precipUnit: 'mm',
  pressureUnit: 'hpa',
  severeAlerts: true,
  rainThresholdAlerts: true,
  alertSound: false,
  autoDetectLocation: true,
  startupLocationMode: 'current_location',
  defaultDistrictId: 'karnataka-all',
  defaultDistrictName: 'Karnataka (Whole State)',
  defaultMapLayer: 'clouds_satellite',
  defaultCloudOpacity: 0.9,
  showDistrictPinsOnLaunch: true,
  overlayRainRadarOverClouds: true,
  showAtmosphereAnimation: true,
  refreshInterval: 180000, // 3 minutes
  syncOnAppResume: true,
  lowDataMode: false,
};

const STORAGE_KEY = 'skycast_app_settings_v2';

export function loadUserSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Error loading settings from localStorage:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Error saving settings to localStorage:', err);
  }
}

// Unit conversion helpers
export function formatTemperature(celsius: number, unit: TemperatureUnit): { value: number; unitLabel: string } {
  if (unit === 'fahrenheit') {
    const f = Math.round((celsius * 9) / 5 + 32);
    return { value: f, unitLabel: '°F' };
  }
  return { value: Math.round(celsius), unitLabel: '°C' };
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit): { value: number; unitLabel: string } {
  if (unit === 'ms') {
    return { value: Math.round((kmh / 3.6) * 10) / 10, unitLabel: 'm/s' };
  }
  if (unit === 'mph') {
    return { value: Math.round(kmh * 0.621371), unitLabel: 'mph' };
  }
  return { value: Math.round(kmh), unitLabel: 'km/h' };
}

export function formatPrecipitation(mm: number, unit: PrecipitationUnit): { value: number; unitLabel: string } {
  if (unit === 'inch') {
    return { value: Math.round((mm / 25.4) * 100) / 100, unitLabel: 'in' };
  }
  return { value: Math.round(mm * 10) / 10, unitLabel: 'mm' };
}

export function formatPressure(hpa: number, unit: PressureUnit): { value: number; unitLabel: string } {
  if (unit === 'mmhg') {
    return { value: Math.round(hpa * 0.75006), unitLabel: 'mmHg' };
  }
  if (unit === 'inhg') {
    return { value: Math.round(hpa * 0.02953 * 100) / 100, unitLabel: 'inHg' };
  }
  return { value: Math.round(hpa), unitLabel: 'hPa' };
}

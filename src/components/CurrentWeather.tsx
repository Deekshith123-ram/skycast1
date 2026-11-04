import React from 'react';
import { WeatherData } from '../types/weather';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  ArrowUp,
  ArrowDown,
  Clock,
  Compass,
  MapPin,
  Star,
  Moon,
  CloudMoon,
  Navigation,
} from 'lucide-react';
import { WeatherAtmosphereAnimation } from './WeatherAtmosphereAnimation';
import { Language, TRANSLATIONS, translateWeatherDesc } from '../services/languageService';
import {
  TemperatureUnit,
  PressureUnit,
  formatTemperature,
  formatPressure,
} from '../services/settingsService';

function formatCacheAge(timestamp?: number): string {
  if (!timestamp) return '';
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

interface CurrentWeatherProps {
  data: WeatherData;
  onRefresh?: () => void;
  isLoading?: boolean;
  lang?: Language;
  tempUnit?: TemperatureUnit;
  pressureUnit?: PressureUnit;
  showAtmosphereAnimation?: boolean;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  data,
  onRefresh,
  isLoading = false,
  lang = 'en',
  tempUnit = 'celsius',
  pressureUnit = 'hpa',
  showAtmosphereAnimation = true,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const { current, daily, location, lastUpdated } = data;
  const today = daily[0];

  const getWeatherIcon = (code: number, isDay: boolean) => {
    // Night icons (Google Weather parity)
    if (!isDay) {
      if (code === 0) return <Moon className="w-16 h-16 text-indigo-300 drop-shadow-[0_0_20px_rgba(165,180,252,0.45)]" />;
      if (code <= 2) return <CloudMoon className="w-16 h-16 text-indigo-300 dark:text-cyan-200 drop-shadow-[0_0_18px_rgba(165,180,252,0.35)]" />;
      if (code === 3) return <Cloud className="w-16 h-16 text-slate-500 dark:text-slate-300 drop-shadow-[0_0_18px_rgba(100,116,139,0.3)]" />;
      if (code >= 51 && code <= 82) return <CloudRain className="w-16 h-16 text-blue-500 dark:text-blue-400 drop-shadow-[0_0_18px_rgba(59,130,246,0.35)]" />;
      if (code >= 95) return <CloudLightning className="w-16 h-16 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_22px_rgba(245,158,11,0.4)]" />;
      return <CloudFog className="w-16 h-16 text-slate-500 dark:text-slate-400" />;
    }
    // Daytime icons
    if (code === 0) return <Sun className="w-16 h-16 text-amber-500 drop-shadow-[0_0_18px_rgba(251,191,36,0.3)]" />;
    if (code <= 2) return <CloudSun className="w-16 h-16 text-[#00AFCB] dark:text-cyan-300 drop-shadow-[0_0_18px_rgba(0,175,203,0.3)]" />;
    if (code === 3) return <Cloud className="w-16 h-16 text-slate-600 dark:text-slate-300 drop-shadow-[0_0_18px_rgba(100,116,139,0.3)]" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-16 h-16 text-[#2563EB] dark:text-blue-400 drop-shadow-[0_0_18px_rgba(37,99,235,0.3)]" />;
    if (code >= 95) return <CloudLightning className="w-16 h-16 text-amber-600 dark:text-amber-400 drop-shadow-[0_0_22px_rgba(217,119,6,0.4)]" />;
    return <CloudFog className="w-16 h-16 text-slate-600 dark:text-slate-400" />;
  };

  const translatedDescription = translateWeatherDesc(current.weatherDescription, lang);

  const mainTemp = formatTemperature(current.temperature, tempUnit);
  const feelsLikeTemp = formatTemperature(current.apparentTemperature, tempUnit);
  const maxTemp = today ? formatTemperature(today.tempMax, tempUnit) : null;
  const minTemp = today ? formatTemperature(today.tempMin, tempUnit) : null;
  const formattedPressure = formatPressure(current.surfacePressure, pressureUnit);

  return (
    <div className="w-full glass-panel rounded-2xl p-5 md:p-7 relative overflow-hidden transition-all">
      {/* Living realistic atmospheric animation behind the window text (toggleable in settings) */}
      {showAtmosphereAnimation && (
        <WeatherAtmosphereAnimation
          weatherCode={current.weatherCode}
          isDay={current.isDay}
          windSpeed={current.windSpeed}
          windDirection={current.windDirection}
        />
      )}

      {/* Subtle ambient radial depth glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Foreground Content with High-Contrast Legibility */}
      <div className="relative z-10 flex flex-col">
        {/* Top Banner: Location Name and clean state tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[#172B3A] dark:text-white tracking-tight">
                {location.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold border border-[#D8E4ED] dark:border-slate-700 shadow-sm">
                {location.district && location.district.toLowerCase() !== location.name.toLowerCase() ? `${location.district}, ` : ''}{location.state}, {location.country}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium flex-wrap">
              {location.taluk && location.taluk.toLowerCase() !== location.name.toLowerCase() && (
                <>
                  <span className="font-semibold text-[#007A8E] dark:text-cyan-300">
                    {location.taluk}
                  </span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1 font-mono font-semibold">
                <Compass className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
              </span>
              <span>•</span>
              <span className="font-semibold">{t.elevation}: ~{location.elevation ?? 650} m</span>
              {(location.isEstimate || data.isEstimate || data.dataSource === 'estimated') && (
                <>
                  <span>•</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">
                    ({lang === 'kn' ? 'ಅಂದಾಜು ಹವಾಮಾನ' : 'Estimated Weather'})
                  </span>
                </>
              )}
              {data.dataSource === 'cached' && !data.isEstimate && (
                <>
                  <span>•</span>
                  <span className="text-blue-700 dark:text-blue-400 font-bold">
                    ({lang === 'kn' ? 'ಸಂಗ್ರಹಿಸಿದ ಹವಾಮಾನ' : 'Cached Data'}{data.cachedAt ? ` • ${formatCacheAge(data.cachedAt)}` : ''})
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {data.dataSource === 'cached' || (data.isStale && !data.isEstimate && data.dataSource !== 'estimated') ? (
              <span className="water-droplet-pill flex items-center gap-1.5 px-3 py-1 rounded-full text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm" title={data.cachedAt ? `Cached telemetry from ${formatCacheAge(data.cachedAt)}` : 'Cached weather telemetry'}>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{lang === 'kn' ? 'ಸಂಗ್ರಹಿಸಿದ ಮಾಹಿತಿ' : 'Cached'}{data.cachedAt ? ` (${formatCacheAge(data.cachedAt)})` : ''}</span>
              </span>
            ) : (location.isEstimate || data.isEstimate || data.dataSource === 'estimated') ? (
              <span className="water-droplet-pill flex items-center gap-1.5 px-3 py-1 rounded-full text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm" title="Weather data estimated from climatological models">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>{lang === 'kn' ? 'ಅಂದಾಜು' : 'Estimate'}</span>
              </span>
            ) : (
              <span className="water-droplet-pill flex items-center gap-1.5 px-3 py-1 rounded-full text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t.live}</span>
              </span>
            )}

            {/* Expanded Updated Time Option with balanced alignment */}
            <div className="water-droplet-pill flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 px-3.5 py-1 rounded-full shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400 flex-shrink-0" />
              <span>{t.updated}: <strong className="text-slate-900 dark:text-slate-100 font-bold font-mono">{lastUpdated}</strong></span>
            </div>
          </div>
        </div>

        {/* Main Weather Information Display */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Temperature & Conditions */}
          <div className="md:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-shrink-0 animate-bounce-subtle">
              {getWeatherIcon(current.weatherCode, current.isDay)}
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl md:text-6xl font-extrabold text-[#172B3A] dark:text-white tracking-tighter">
                  {(data.isEstimate || data.dataSource === 'estimated') ? `~${mainTemp.value}` : mainTemp.value}°
                </span>
                <span className="font-display text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {tempUnit === 'fahrenheit' ? 'F' : 'C'}
                </span>
                <span className="text-sm text-slate-800 dark:text-slate-200 ml-2 font-medium">
                  {t.feelsLike} <strong className="text-[#007A8E] dark:text-cyan-300 font-bold">{feelsLikeTemp.value}{feelsLikeTemp.unitLabel}</strong>
                </span>
              </div>

              <p className="font-body text-base md:text-lg font-bold text-[#007A8E] dark:text-cyan-200 mt-1 capitalize">
                {translatedDescription}
              </p>

              {today && maxTemp && minTemp && (
                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                    <ArrowUp className="w-3.5 h-3.5" />
                    {t.high}: <strong className="font-mono text-slate-900 dark:text-white font-bold">{maxTemp.value}{maxTemp.unitLabel}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-[#1E40AF] dark:text-cyan-400 font-semibold">
                    <ArrowDown className="w-3.5 h-3.5" />
                    {t.low}: <strong className="font-mono text-slate-900 dark:text-white font-bold">{minTemp.value}{minTemp.unitLabel}</strong>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {t.rainProb}: <strong className="text-[#007A8E] dark:text-cyan-300 font-bold">{today.precipitationProbabilityMax}%</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sun Cycle & Atmospheric Summary */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3 pt-3 md:pt-0 md:border-l md:border-[#D8E4ED]/60 dark:md:border-cyan-500/15 md:pl-6">
            {/* Sunrise */}
            <div className="p-3 rounded-xl watery-sub-card flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Sunrise className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-bold">{t.sunrise}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{today?.sunrise ?? '06:08 AM'}</span>
              </div>
            </div>

            {/* Sunset */}
            <div className="p-3 rounded-xl watery-sub-card flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/15 text-orange-700 dark:text-orange-400">
                <Sunset className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-bold">{t.sunset}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{today?.sunset ?? '06:18 PM'}</span>
              </div>
            </div>

            {/* Cloud Cover */}
            <div className="p-3 rounded-xl watery-sub-card flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/15 text-[#007A8E] dark:text-cyan-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-bold">{t.cloudCover}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{current.cloudCover}%</span>
              </div>
            </div>

            {/* Surface Pressure / Barometer */}
            <div className="p-3 rounded-xl watery-sub-card flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/15 text-[#1E40AF] dark:text-blue-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-bold">{t.barometer}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{formattedPressure.value} {formattedPressure.unitLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

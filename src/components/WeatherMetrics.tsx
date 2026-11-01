import React from 'react';
import { CurrentWeather, DailyForecastItem } from '../types/weather';
import { getWindDirectionLabel } from '../services/weatherService';
import {
  Droplets,
  Wind,
  Compass,
  CloudRain,
  Cloud,
  Sun,
  Gauge,
  Eye,
  ThermometerSnowflake,
} from 'lucide-react';

interface WeatherMetricsProps {
  current: CurrentWeather;
  today?: DailyForecastItem;
}

export const WeatherMetrics: React.FC<WeatherMetricsProps> = ({ current, today }) => {
  const getUvLevel = (uv: number): { label: string; color: string } => {
    if (uv <= 2) return { label: 'Low', color: 'text-emerald-700 dark:text-emerald-400 font-semibold' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-amber-700 dark:text-yellow-400 font-semibold' };
    if (uv <= 7) return { label: 'High', color: 'text-amber-800 dark:text-amber-300 font-bold' };
    if (uv <= 10) return { label: 'Very High', color: 'text-orange-800 dark:text-orange-300 font-bold' };
    return { label: 'Extreme', color: 'text-rose-700 dark:text-rose-400 font-bold' };
  };

  const uvInfo = getUvLevel(current.uvIndex);
  const windDirLabel = getWindDirectionLabel(current.windDirection);

  const metrics = [
    {
      id: 'humidity',
      label: 'Relative Humidity',
      value: `${current.relativeHumidity}%`,
      subtitle: current.relativeHumidity > 70 ? 'High Moisture' : 'Comfortable',
      icon: <Droplets className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />,
      bg: 'bg-cyan-50 dark:bg-cyan-500/10 text-[#007A8E] dark:text-cyan-300',
      border: 'border-[#D8E4ED] dark:border-cyan-500/20',
    },
    {
      id: 'wind',
      label: 'Wind Speed & Gusts',
      value: `${current.windSpeed} km/h`,
      subtitle: `Gusts up to ${current.windGusts} km/h`,
      icon: <Wind className="w-4 h-4 text-teal-700 dark:text-teal-400" />,
      bg: 'bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300',
      border: 'border-[#D8E4ED] dark:border-teal-500/20',
    },
    {
      id: 'wind_dir',
      label: 'Wind Direction',
      value: `${current.windDirection}°`,
      subtitle: windDirLabel,
      icon: <Compass className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-500/10 text-[#1E40AF] dark:text-blue-300',
      border: 'border-[#D8E4ED] dark:border-blue-500/20',
    },
    {
      id: 'rain_prob',
      label: 'Rain Probability',
      value: `${today?.precipitationProbabilityMax ?? 0}%`,
      subtitle: today?.precipitationSum ? `${today.precipitationSum} mm expected` : 'Negligible rain',
      icon: <CloudRain className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300',
      border: 'border-[#D8E4ED] dark:border-indigo-500/20',
    },
    {
      id: 'cloud_cover',
      label: 'Cloud Coverage',
      value: `${current.cloudCover}%`,
      subtitle: current.cloudCover > 60 ? 'Overcast Sky' : current.cloudCover > 25 ? 'Scattered Clouds' : 'Clear Sky',
      icon: <Cloud className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
      bg: 'bg-slate-100 dark:bg-slate-500/10 text-slate-800 dark:text-slate-300',
      border: 'border-[#D8E4ED] dark:border-slate-500/20',
    },
    {
      id: 'uv_index',
      label: 'UV Radiation Index',
      value: `${current.uvIndex}`,
      subtitle: `${uvInfo.label} Risk`,
      subtitleColor: uvInfo.color,
      icon: <Sun className="w-4 h-4 text-amber-700 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300',
      border: 'border-[#D8E4ED] dark:border-amber-500/20',
    },
    {
      id: 'pressure',
      label: 'Atmospheric Pressure',
      value: `${current.surfacePressure} hPa`,
      subtitle: 'Barometric Surface',
      icon: <Gauge className="w-4 h-4 text-purple-700 dark:text-purple-400" />,
      bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300',
      border: 'border-[#D8E4ED] dark:border-purple-500/20',
    },
    {
      id: 'visibility',
      label: 'Surface Visibility',
      value: `${current.visibility ?? 10} km`,
      subtitle: (current.visibility ?? 10) >= 10 ? 'Optimal Clearness' : 'Atmospheric Haze',
      icon: <Eye className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300',
      border: 'border-[#D8E4ED] dark:border-emerald-500/20',
    },
    {
      id: 'dew_point',
      label: 'Dew Point',
      value: `${current.dewPoint ?? Math.round(current.temperature - (100 - current.relativeHumidity) / 5)}°C`,
      subtitle: 'Condensation Point',
      icon: <ThermometerSnowflake className="w-4 h-4 text-sky-700 dark:text-sky-400" />,
      bg: 'bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300',
      border: 'border-[#D8E4ED] dark:border-sky-500/20',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display text-sm font-bold text-[#172B3A] dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00AFCB] dark:bg-cyan-400"></span>
          Key Meteorological Metrics
        </h2>
        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-medium">Real-Time Sensor Suite</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {metrics.map((m) => (
          <div
            key={m.id}
            className={`p-3.5 rounded-xl glass-panel glass-panel-hover border ${m.border} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{m.label}</span>
              <div className={`p-1.5 rounded-lg ${m.bg}`}>{m.icon}</div>
            </div>

            <div>
              <div className="text-xl font-extrabold text-[#172B3A] dark:text-white font-mono tracking-tight">{m.value}</div>
              <div className={`text-[10px] mt-0.5 truncate font-medium ${m.subtitleColor || 'text-slate-700 dark:text-slate-300'}`}>
                {m.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { DailyForecastItem } from '../types/weather';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Droplets,
  Wind,
  Sunrise,
  Sunset,
} from 'lucide-react';

interface DailyForecastProps {
  daily: DailyForecastItem[];
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily }) => {
  // Find global min and max across all days to render proportional temperature range bars
  const allMins = daily.map((d) => d.tempMin);
  const allMaxs = daily.map((d) => d.tempMax);
  const minTemp = Math.min(...allMins, 15);
  const maxTemp = Math.max(...allMaxs, 35);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const getDailyIcon = (code: number) => {
    if (code === 0) return <Sun className="w-5 h-5 text-amber-400" />;
    if (code <= 2) return <CloudSun className="w-5 h-5 text-cyan-300" />;
    if (code === 3) return <Cloud className="w-5 h-5 text-slate-300" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 95) return <CloudLightning className="w-5 h-5 text-amber-400" />;
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-[#D8E4ED] dark:border-cyan-500/20 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <h2 className="font-display text-base font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00AFCB] dark:bg-cyan-400"></span>
            7-Day Synoptic Outlook
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            Medium-range numerical weather model predictions & monsoon progression
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[#007A8E] dark:text-cyan-400 bg-[#E6F8FA] dark:bg-cyan-950/60 border border-[#00AFCB]/40 dark:border-cyan-500/30 px-2.5 py-1 rounded-lg">
          Open-Meteo Ensemble
        </span>
      </div>

      <div className="space-y-3">
        {daily.slice(0, 7).map((item, idx) => {
          // Temperature bar offsets
          const leftPercent = ((item.tempMin - minTemp) / tempRange) * 100;
          const widthPercent = Math.max(8, ((item.tempMax - item.tempMin) / tempRange) * 100);

          return (
            <div
              key={item.date}
              className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm watery-sub-card ${
                idx === 0
                  ? 'border-[#00AFCB] dark:border-cyan-400 shadow-sm ring-1 ring-[#00AFCB] bg-[#00AFCB]/10'
                  : 'hover:border-[#00AFCB] dark:hover:border-cyan-500/40'
              }`}
            >
              {/* Day & Date */}
              <div className="w-full md:w-36 flex items-center justify-between md:justify-start gap-3">
                <span className="text-xs font-bold text-[#172B3A] dark:text-white">
                  {item.dayName}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-medium">
                  {item.formattedDate}
                </span>
                {idx === 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-[#00AFCB]/15 dark:bg-cyan-500/20 text-[#007A8E] dark:text-cyan-300 text-[10px] font-bold border border-[#00AFCB]/40">
                    Today
                  </span>
                )}
              </div>

              {/* Weather description & Icon */}
              <div className="flex items-center gap-2.5 w-full md:w-56">
                <div className="p-1 rounded-lg bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#D8E4ED] dark:border-slate-700/60">{getDailyIcon(item.weatherCode)}</div>
                <span className="text-xs text-slate-800 dark:text-slate-200 truncate capitalize font-semibold">
                  {item.weatherDescription}
                </span>
              </div>

              {/* Rain Probability & Sum */}
              <div className="w-full md:w-36 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 text-[#007A8E] dark:text-cyan-400 font-mono font-bold">
                  <Droplets className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                  <span>{item.precipitationProbabilityMax}%</span>
                </div>
                {item.precipitationSum > 0 ? (
                  <span className="text-[11px] text-[#1E40AF] dark:text-blue-300 font-mono font-bold">
                    ({item.precipitationSum} mm)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-700 dark:text-slate-400 font-medium">Dry</span>
                )}
              </div>

              {/* Temperature Bar */}
              <div className="w-full md:w-64 flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-300 w-8 text-right">
                  {item.tempMin}°
                </span>
                <div className="relative flex-1 h-2 rounded-full bg-slate-300 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#00AFCB] via-amber-500 to-rose-500"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[#172B3A] dark:text-white w-8">
                  {item.tempMax}°
                </span>
              </div>

              {/* Wind Conditions */}
              <div className="w-full md:w-32 flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono justify-end">
                <Wind className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span className="font-semibold text-slate-900 dark:text-slate-200">{item.windSpeedMax} km/h</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

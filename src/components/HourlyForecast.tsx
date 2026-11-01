import React, { useRef } from 'react';
import { HourlyForecastItem } from '../types/weather';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Wind,
} from 'lucide-react';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const getHourlyIcon = (code: number) => {
    if (code === 0) return <Sun className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
    if (code <= 2) return <CloudSun className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />;
    if (code === 3) return <Cloud className="w-6 h-6 text-slate-500 dark:text-slate-300" />;
    if (code >= 51 && code <= 82) return <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    if (code >= 95) return <CloudLightning className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
    return <Cloud className="w-6 h-6 text-slate-500 dark:text-slate-400" />;
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-[#D8E4ED] dark:border-cyan-500/20 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <h2 className="font-display text-base font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00AFCB] dark:bg-cyan-400"></span>
            Hourly Telemetry Forecast (Next 48 Hours)
          </h2>
          <p className="text-xs text-[#526779] dark:text-slate-400 mt-0.5 font-normal">
            Diurnal temperature variance, cloud cover & precipitation probability
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900/60 hover:bg-[#F4F8FC] dark:hover:bg-cyan-500/20 border border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-300 hover:text-[#172B3A] dark:hover:text-white transition cursor-pointer shadow-sm"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900/60 hover:bg-[#F4F8FC] dark:hover:bg-cyan-500/20 border border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-300 hover:text-[#172B3A] dark:hover:text-white transition cursor-pointer shadow-sm"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto pb-2.5 pt-1 no-scrollbar scroll-smooth overscroll-contain"
      >
        {hourly.map((item, idx) => (
          <div
            key={item.time}
            className={`flex-shrink-0 w-32 p-3.5 rounded-xl border flex flex-col items-center justify-between transition-all shadow-sm watery-sub-card ${
              idx === 0
                ? 'border-[#00AFCB] dark:border-cyan-400 shadow-md ring-1 ring-[#00AFCB] bg-[#00AFCB]/10'
                : 'hover:border-[#00AFCB] dark:hover:border-cyan-500/50'
            }`}
          >
            {/* Hour time */}
            <span className="text-xs font-bold text-[#172B3A] dark:text-slate-300 font-mono">
              {item.formattedTime}
            </span>

            {/* Icon */}
            <div className="my-2.5">{getHourlyIcon(item.weatherCode)}</div>

            {/* Temperature */}
            <span className="font-display text-xl font-extrabold text-[#172B3A] dark:text-white">{item.temperature}°</span>

            {/* Rain Probability & Amount */}
            <div className="w-full mt-2 pt-2 border-t border-[#D8E4ED] dark:border-slate-800/80 flex flex-col gap-1 text-[10px]">
              <div className="flex items-center justify-between text-[#007A8E] dark:text-cyan-300">
                <span className="flex items-center gap-1 font-medium">
                  <Droplets className="w-3 h-3 text-[#00AFCB] dark:text-cyan-400" />
                  Rain
                </span>
                <span className="font-mono font-bold text-[#172B3A] dark:text-cyan-300">{item.precipitationProbability}%</span>
              </div>

              {item.precipitation > 0 && (
                <div className="flex items-center justify-between text-[#2563EB] dark:text-blue-400 font-mono text-[9px] font-bold">
                  <span>Precip</span>
                  <span>{item.precipitation} mm</span>
                </div>
              )}

              {/* Wind & Clouds */}
              <div className="flex items-center justify-between text-[#526779] dark:text-slate-400 mt-0.5 font-medium">
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                  <span className="text-[#172B3A] dark:text-slate-400">{item.windSpeed} km/h</span>
                </span>
                <span className="text-[9px] font-mono text-[#526779] dark:text-slate-400 font-semibold">{item.cloudCover}% cld</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

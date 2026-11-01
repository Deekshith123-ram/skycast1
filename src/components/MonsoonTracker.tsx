import React from 'react';
import { WeatherData } from '../types/weather';
import {
  CloudRain,
  Droplets,
  Layers,
  TrendingUp,
  Map,
  Compass,
  AlertTriangle,
  Umbrella,
} from 'lucide-react';

interface MonsoonTrackerProps {
  weatherData: WeatherData;
}

export const MonsoonTracker: React.FC<MonsoonTrackerProps> = ({ weatherData }) => {
  const { current, daily, location } = weatherData;

  // IMD Rainfall classification standard (24-hour accumulation):
  // Very Light: 0.1 to 2.4 mm
  // Light: 2.5 to 15.5 mm
  // Moderate: 15.6 to 64.4 mm
  // Heavy: 64.5 to 115.5 mm
  // Very Heavy: 115.6 to 204.4 mm
  // Extremely Heavy: >= 204.5 mm
  const getImdRainClassification = (mm: number) => {
    if (mm === 0) return { label: 'Dry / No Rain', color: 'text-slate-800 dark:text-slate-300 font-bold', bg: 'bg-slate-100 dark:bg-slate-800' };
    if (mm < 2.5) return { label: 'Very Light Rain', color: 'text-sky-800 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-950/60' };
    if (mm <= 15.5) return { label: 'Light Rainfall', color: 'text-[#007A8E] dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60' };
    if (mm <= 64.4) return { label: 'Moderate Monsoon Rain', color: 'text-[#1E40AF] dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60' };
    if (mm <= 115.5) return { label: 'Heavy Downpour', color: 'text-amber-800 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' };
    if (mm <= 204.4) return { label: 'Very Heavy Rain', color: 'text-orange-800 dark:text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/60' };
    return { label: 'Extremely Heavy Rain / Cloudburst', color: 'text-rose-800 dark:text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/60' };
  };

  const todaySum = daily[0]?.precipitationSum ?? 0;
  const threeDaySum = daily.slice(0, 3).reduce((acc, d) => acc + d.precipitationSum, 0);
  const sevenDaySum = daily.slice(0, 7).reduce((acc, d) => acc + d.precipitationSum, 0);
  const todayClassification = getImdRainClassification(todaySum);

  // Synoptic monsoon context for Karnataka
  const isKarnataka = location.state.toLowerCase().includes('karnataka');

  return (
    <div className="w-full glass-panel rounded-2xl p-5 md:p-6 border border-[#D8E4ED] dark:border-cyan-500/20 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <h2 className="font-display text-base sm:text-lg font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
            Rainfall & Monsoon Hydro-Meteorological Monitor
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            Precipitation accumulation, IMD rain intensity scales, and regional convective analysis
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-[#007A8E] dark:text-cyan-300 bg-[#E6F8FA] dark:bg-cyan-950/80 border border-[#00AFCB]/40 dark:border-cyan-500/30 px-3 py-1 rounded-xl">
          Station: {location.name} ({location.district})
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Today's Rain Accumulation */}
        <div className="p-4 rounded-xl bg-white/45 dark:bg-slate-900/35 border border-[#D8E4ED]/70 dark:border-slate-800/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">Today's Expected Rain</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#172B3A] dark:text-white font-mono">{todaySum}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">mm</span>
            </div>
            <span className={`inline-block mt-1 text-[11px] font-bold ${todayClassification.color}`}>
              {todayClassification.label}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 border border-blue-200/80 dark:border-transparent">
            <Umbrella className="w-6 h-6" />
          </div>
        </div>

        {/* 3-Day Forecast Total */}
        <div className="p-4 rounded-xl bg-white/45 dark:bg-slate-900/35 border border-[#D8E4ED]/70 dark:border-slate-800/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">3-Day Cumulative Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#172B3A] dark:text-white font-mono">{threeDaySum.toFixed(1)}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">mm</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-bold text-[#007A8E] dark:text-cyan-300">
              Short-term Soil Moisture Fill
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#E6F8FA]/80 dark:bg-cyan-500/15 text-[#00AFCB] dark:text-cyan-400 border border-[#00AFCB]/30 dark:border-transparent">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* 7-Day Total */}
        <div className="p-4 rounded-xl bg-white/45 dark:bg-slate-900/35 border border-[#D8E4ED]/70 dark:border-slate-800/60 backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">7-Day Synoptic Total</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-[#172B3A] dark:text-white font-mono">{sevenDaySum.toFixed(1)}</span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">mm</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
              Agricultural Basin Accumulation
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-transparent">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* IMD Intensity Scale Bar */}
      <div className="p-4 rounded-xl bg-white/45 dark:bg-slate-900/35 border border-[#D8E4ED]/70 dark:border-slate-800/60 backdrop-blur-md mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#172B3A] dark:text-slate-200 uppercase tracking-wider">
            IMD Official 24-Hour Rainfall Intensity Thresholds
          </span>
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono font-semibold">Standard IS 4987 Criteria</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/20">
            <span className="text-sky-800 dark:text-sky-300 font-bold block">Very Light</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">0.1 – 2.4 mm</span>
          </div>
          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20">
            <span className="text-[#007A8E] dark:text-cyan-300 font-bold block">Light</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">2.5 – 15.5 mm</span>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/20">
            <span className="text-[#1E40AF] dark:text-blue-300 font-bold block">Moderate</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">15.6 – 64.4 mm</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/20">
            <span className="text-amber-800 dark:text-amber-300 font-bold block">Heavy</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">64.5 – 115.5 mm</span>
          </div>
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-500/20">
            <span className="text-orange-800 dark:text-orange-400 font-bold block">Very Heavy</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">115.6 – 204.4 mm</span>
          </div>
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20">
            <span className="text-rose-800 dark:text-rose-400 font-bold block">Extremely Heavy</span>
            <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">&gt; 204.5 mm</span>
          </div>
        </div>
      </div>

      {/* Regional Monsoon & Orographic Dynamics Explanatory Box */}
      <div className="p-4 rounded-xl bg-[#E6F8FA]/60 dark:bg-cyan-950/20 border border-[#00AFCB]/30 dark:border-cyan-500/25 flex flex-col sm:flex-row items-start gap-3.5 shadow-sm">
        <div className="p-2 rounded-lg bg-white dark:bg-cyan-500/20 text-[#007A8E] dark:text-cyan-400 flex-shrink-0 mt-0.5 border border-[#00AFCB]/40 dark:border-cyan-500/30">
          <Map className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 leading-relaxed">
          <h4 className="font-bold text-[#172B3A] dark:text-white text-sm">
            {isKarnataka
              ? 'Karnataka Precipitation Dynamics & Deccan Plateau Rain Shadow'
              : `Subcontinental Weather Systems for ${location.state}`}
          </h4>
          <p>
            {isKarnataka
              ? `Tumakuru sits on the south-eastern Karnataka plateau (~822m above sea level) in the lee of the Western Ghats (Malnad belt). Coastal Karnataka and the Ghats crest experience heavy orographic condensation during the Southwest Monsoon, while Tumakuru and the southern maidan receive intermittent thunderstorm downpours and cyclonic easterly rain pulses from the Bay of Bengal during transition periods.`
              : `Monsoon and pre-monsoon convective cloud systems over ${location.name} are driven by seasonal moisture surges, low-pressure cyclonic vortices over the northern Indian Ocean, and land-sea thermal gradients.`}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#007A8E] dark:text-cyan-300 font-semibold">
            <span>• Western Ghats Barrier: High Moisture Interception</span>
            <span>• Plateau Dew Point: {current.dewPoint ?? 20}°C</span>
            <span>• Cloud Base Height: ~1,200m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

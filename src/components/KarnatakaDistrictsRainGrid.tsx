import React, { useState } from 'react';
import { DistrictRainData, LocationData } from '../types/weather';
import {
  Droplets,
  CloudRain,
  ArrowUpDown,
  MapPin,
} from 'lucide-react';

import { DistrictCardAtmosphereAnimation } from './DistrictCardAtmosphereAnimation';

interface KarnatakaDistrictsRainGridProps {
  districts: DistrictRainData[];
  selectedLocation: LocationData;
  onSelectDistrict: (loc: LocationData) => void;
  theme?: 'dark' | 'light';
}

export const KarnatakaDistrictsRainGrid: React.FC<KarnatakaDistrictsRainGridProps> = ({
  districts,
  selectedLocation,
  onSelectDistrict,
  theme = 'dark',
}) => {
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterRainCategory, setFilterRainCategory] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'prob_desc' | 'rain_desc' | 'name_asc'>('prob_desc');

  // Filter logic
  const filteredDistricts = districts.filter((d) => {
    const matchesRegion = filterRegion === 'all' || d.region === filterRegion;

    const matchesCategory =
      filterRainCategory === 'all' ||
      (filterRainCategory === 'high' && d.rainProbability >= 60) ||
      (filterRainCategory === 'moderate' && d.rainProbability >= 30 && d.rainProbability < 60) ||
      (filterRainCategory === 'low' && d.rainProbability < 30);

    return matchesRegion && matchesCategory;
  });

  // Sort logic
  filteredDistricts.sort((a, b) => {
    if (sortBy === 'prob_desc') return b.rainProbability - a.rainProbability;
    if (sortBy === 'rain_desc') return b.precipitationSum - a.precipitationSum;
    return a.district.localeCompare(b.district);
  });

  // Summary counts
  const highRiskCount = districts.filter((d) => d.rainProbability >= 60).length;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 md:p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-[#2563EB] dark:text-cyan-400 border border-blue-200 dark:border-transparent">
              <CloudRain className="w-4 h-4" />
            </span>
            <h2 className="font-display text-base sm:text-lg font-bold text-[#172B3A] dark:text-white tracking-tight">
              Karnataka Rain Probability Monitor (All 31 Districts)
            </h2>
          </div>
          <p className="text-xs text-[#526779] dark:text-slate-400 mt-0.5 font-normal">
            Real-time numerical probability of precipitation and expected accumulations across Karnataka
          </p>
        </div>

        {/* Quick status pill */}
        <div className="flex items-center gap-2">
          {highRiskCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[#1E40AF] dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-blue-400 animate-pulse"></span>
              {highRiskCount} Districts High Rain Risk (&ge;60%)
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-[#526779] dark:text-slate-300 border border-[#D8E4ED] dark:border-slate-700 text-xs font-mono">
            31 Districts Active
          </span>
        </div>
      </div>

      {/* Filter and Sort Controls (Search completely removed as requested) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setFilterRainCategory('all')}
            className={`water-droplet-pill px-3 py-1 rounded-full font-medium transition cursor-pointer ${
              filterRainCategory === 'all'
                ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-bold'
                : 'text-[#526779] dark:text-slate-400'
            }`}
          >
            All Probabilities
          </button>
          <button
            onClick={() => setFilterRainCategory('high')}
            className={`water-droplet-pill px-3 py-1 rounded-full font-medium transition cursor-pointer ${
              filterRainCategory === 'high'
                ? 'water-droplet-pill-active text-[#1E40AF] dark:text-blue-300 font-bold ring-1 ring-blue-500/40'
                : 'text-[#526779] dark:text-slate-400'
            }`}
          >
            🌧️ High (&ge;60%)
          </button>
          <button
            onClick={() => setFilterRainCategory('moderate')}
            className={`water-droplet-pill px-3 py-1 rounded-full font-medium transition cursor-pointer ${
              filterRainCategory === 'moderate'
                ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-300 font-bold ring-1 ring-[#00AFCB]/40'
                : 'text-[#526779] dark:text-slate-400'
            }`}
          >
            🌦️ Moderate (30–59%)
          </button>
          <button
            onClick={() => setFilterRainCategory('low')}
            className={`water-droplet-pill px-3 py-1 rounded-full font-medium transition cursor-pointer ${
              filterRainCategory === 'low'
                ? 'water-droplet-pill-active text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500/40'
                : 'text-[#526779] dark:text-slate-400'
            }`}
          >
            🌤️ Low (&lt;30%)
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs text-[#526779] dark:text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-700 text-[#172B3A] dark:text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00AFCB]"
          >
            <option value="prob_desc">Rain Probability (High to Low)</option>
            <option value="rain_desc">Expected Rainfall (mm)</option>
            <option value="name_asc">District Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Region Selector Pills */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs text-[#526779] dark:text-slate-400">
        <span className="text-[10px] uppercase font-bold text-[#687D8F] dark:text-slate-500 flex-shrink-0">Region:</span>
        {['all', 'Coastal', 'Malnad (Ghats)', 'South Interior', 'North Interior'].map((reg) => (
          <button
            key={reg}
            onClick={() => setFilterRegion(reg)}
            className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
              filterRegion === reg
                ? 'bg-[#E6F8FA] text-[#007A8E] border border-[#00AFCB] dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/40 font-bold'
                : 'hover:text-[#172B3A] dark:hover:text-slate-200 text-[#526779] dark:text-slate-400'
            }`}
          >
            {reg === 'all' ? 'All Karnataka' : reg}
          </button>
        ))}
      </div>

      {/* District Cards Grid with Ultra-Smooth Scrolling & High Transparency Glass */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto pr-1.5 smooth-scroll overscroll-contain">
        {filteredDistricts.map((d) => {
          const isSelected =
            Math.abs(d.latitude - selectedLocation.latitude) < 0.05 &&
            Math.abs(d.longitude - selectedLocation.longitude) < 0.05;

          const isHigh = d.rainProbability >= 60;
          const isMod = d.rainProbability >= 30 && d.rainProbability < 60;

          return (
            <div
              key={d.id}
              onClick={() =>
                onSelectDistrict({
                  id: d.id,
                  name: d.name,
                  district: d.district,
                  state: 'Karnataka',
                  country: 'India',
                  latitude: d.latitude,
                  longitude: d.longitude,
                })
              }
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#F0FAFC]/65 dark:bg-cyan-950/45 border-[#00AFCB] dark:border-cyan-400 shadow-md ring-1 ring-[#00AFCB] backdrop-blur-md'
                  : 'bg-white/45 dark:bg-slate-900/35 border-[#D8E4ED]/75 dark:border-slate-800/60 hover:bg-white/60 dark:hover:bg-slate-900/50 hover:border-[#00AFCB] dark:hover:border-cyan-500/50 shadow-sm backdrop-blur-md'
              }`}
            >
              {/* Individual Independent Living Atmospheric Weather Animation */}
              <DistrictCardAtmosphereAnimation
                weatherCode={d.weatherCode}
                rainProbability={d.rainProbability}
                theme={theme}
              />

              {/* Foreground Card Content with High-Contrast Legibility */}
              <div className="relative z-10 flex flex-col justify-between h-full pointer-events-auto">
                {/* Top row: Name & Region */}
                <div className="flex items-start justify-between gap-1 mb-2">
                  <div>
                    <h4 className="font-display text-xs font-bold text-[#172B3A] dark:text-white flex items-center gap-1">
                      <MapPin className={`w-3 h-3 ${isSelected ? 'text-[#00AFCB] dark:text-cyan-400' : 'text-[#00AFCB]'}`} />
                      <span>{d.district}</span>
                    </h4>
                    <span className="text-[10px] text-[#526779] dark:text-slate-400 block mt-0.5 font-medium">{d.region}</span>
                  </div>

                  {/* Rain Probability Pill */}
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 shadow-sm ${
                      isHigh
                        ? 'bg-blue-50 text-[#1E40AF] border border-blue-300 dark:bg-blue-600/30 dark:text-blue-300 dark:border-blue-500/40'
                        : isMod
                        ? 'bg-cyan-50 text-[#007A8E] border border-cyan-300 dark:bg-cyan-600/30 dark:text-cyan-300 dark:border-cyan-500/40'
                        : 'bg-slate-100 text-[#172B3A] border border-[#D8E4ED] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Droplets className="w-3 h-3 text-[#00AFCB] dark:text-cyan-400" />
                    <span>{d.rainProbability}%</span>
                  </div>
                </div>

                {/* Progress bar visual for rain probability */}
                <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-slate-800 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : isMod
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                        : 'bg-slate-500 dark:bg-slate-600'
                    }`}
                    style={{ width: `${Math.max(4, d.rainProbability)}%` }}
                  />
                </div>

                {/* Bottom details: Expected Rain & Temp */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#D8E4ED]/80 dark:border-slate-800/80 text-[#526779] dark:text-slate-300">
                  <span className="text-[#526779] dark:text-slate-400 font-medium">
                    Rain: <strong className="text-[#172B3A] dark:text-white font-mono font-bold">{d.precipitationSum} mm</strong>
                  </span>
                  <span className="text-[#526779] dark:text-slate-400 font-mono font-medium">
                    {d.tempMin}° / <strong className="text-[#172B3A] dark:text-white font-bold">{d.tempMax}°C</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

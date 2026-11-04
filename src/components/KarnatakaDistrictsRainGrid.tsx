import React, { useState } from 'react';
import { DistrictRainData, LocationData } from '../types/weather';
import {
  Droplets,
  CloudRain,
  ArrowUpDown,
  MapPin,
} from 'lucide-react';

import { DistrictCardAtmosphereAnimation } from './DistrictCardAtmosphereAnimation';

function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return '';
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

type RainFilterCategory = 'all' | 'high' | 'moderate' | 'low';

interface RainFilterOption {
  id: RainFilterCategory;
  fullLabel: string;
  shortLabel: string;
  activeTextColor: string;
  activeBorder: string;
  activeRing: string;
  bubbleBackground: string;
  bubbleShadow: string;
}

const RAIN_FILTER_OPTIONS: RainFilterOption[] = [
  {
    id: 'all',
    fullLabel: 'All Probability',
    shortLabel: 'All Prob',
    activeTextColor: 'text-[#007A8E] dark:text-cyan-200',
    activeBorder: 'border-[#00AFCB]/50 dark:border-cyan-400/50',
    activeRing: 'ring-1 ring-[#00AFCB]/30',
    bubbleBackground: 'radial-gradient(130% 120% at 50% 0%, rgba(0, 175, 203, 0.16) 0%, rgba(0, 175, 203, 0.08) 60%, rgba(0, 175, 203, 0.02) 100%)',
    bubbleShadow: '0 4px 14px -1px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 175, 203, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
  },
  {
    id: 'high',
    fullLabel: '🌧️ High (≥60%)',
    shortLabel: '🌧️ High (≥60%)',
    activeTextColor: 'text-[#1E40AF] dark:text-blue-300',
    activeBorder: 'border-blue-500/50 dark:border-blue-400/50',
    activeRing: 'ring-1 ring-blue-500/40',
    bubbleBackground: 'radial-gradient(130% 120% at 50% 0%, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.08) 60%, rgba(37, 99, 235, 0.02) 100%)',
    bubbleShadow: '0 4px 14px -1px rgba(0, 0, 0, 0.3), 0 0 10px rgba(37, 99, 235, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
  },
  {
    id: 'moderate',
    fullLabel: '🌦️ Moderate (30–59%)',
    shortLabel: '🌦️ Mod (30–59%)',
    activeTextColor: 'text-[#007A8E] dark:text-cyan-300',
    activeBorder: 'border-[#00AFCB]/50 dark:border-cyan-400/50',
    activeRing: 'ring-1 ring-[#00AFCB]/40',
    bubbleBackground: 'radial-gradient(130% 120% at 50% 0%, rgba(0, 175, 203, 0.18) 0%, rgba(0, 175, 203, 0.09) 60%, rgba(0, 175, 203, 0.02) 100%)',
    bubbleShadow: '0 4px 14px -1px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 175, 203, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
  },
  {
    id: 'low',
    fullLabel: '🌤️ Low (<30%)',
    shortLabel: '🌤️ Low (<30%)',
    activeTextColor: 'text-emerald-800 dark:text-emerald-300',
    activeBorder: 'border-emerald-500/50 dark:border-emerald-400/50',
    activeRing: 'ring-1 ring-emerald-500/40',
    bubbleBackground: 'radial-gradient(130% 120% at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.08) 60%, rgba(16, 185, 129, 0.02) 100%)',
    bubbleShadow: '0 4px 14px -1px rgba(0, 0, 0, 0.3), 0 0 10px rgba(16, 185, 129, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
  },
];

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
  const [filterRainCategory, setFilterRainCategory] = useState<RainFilterCategory>('all');
  const [sortBy, setSortBy] = useState<'prob_desc' | 'rain_desc' | 'name_asc'>('prob_desc');

  const activeIndex = Math.max(
    0,
    RAIN_FILTER_OPTIONS.findIndex((opt) => opt.id === filterRainCategory)
  );
  const activeOption = RAIN_FILTER_OPTIONS[activeIndex];

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
  const isEstimated = districts.some((d) => d.dataSource === 'estimated' || d.isEstimate);
  const isCached = !isEstimated && districts.some((d) => d.dataSource === 'cached' || d.isStale);

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
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
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
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-[#D8E4ED] dark:border-slate-700 text-xs font-mono font-semibold flex items-center gap-1.5">
            {isEstimated ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>31 Districts (Offline Est.)</span>
              </>
            ) : isCached ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>31 Districts (Cached)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>31 Districts Live</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Filter and Sort Controls (Search completely removed as requested) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {/* Connected Interactive Water-Bubble Selector - All 4 visible without horizontal scrolling */}
        <div className="w-full sm:w-auto sm:min-w-[460px] sm:max-w-xl">
          <div className="relative grid grid-cols-4 p-1 rounded-full bg-white/[0.04] dark:bg-black/20 backdrop-blur-md border border-white/15 dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.12)] select-none">
            {/* Sliding Active Water-Bubble - Perfectly fills the exact 1/4 bubble border with seamless liquid float */}
            <div
              className="absolute top-0 bottom-0 left-0 w-1/4 p-1 pointer-events-none transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform z-0"
              style={{
                transform: `translate3d(${activeIndex * 100}%, 0, 0)`,
              }}
            >
              <div
                className={`w-full h-full rounded-full transition-all duration-300 border ${activeOption.activeBorder} ${activeOption.activeRing} relative overflow-hidden backdrop-blur-[6px]`}
                style={{
                  background: activeOption.bubbleBackground,
                  boxShadow: activeOption.bubbleShadow,
                }}
              >
                {/* Curved Liquid Meniscus Dome Highlight */}
                <div className="absolute top-0 inset-x-[12%] h-[35%] rounded-full bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none" />
                {/* Refractive Liquid Radial Sheen */}
                <div className="absolute inset-0 bg-radial-[at_50%_0%] from-white/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* All Four Filter Bubbles in a Single Horizontal Row (No Horizontal Scroll) */}
            {RAIN_FILTER_OPTIONS.map((option) => {
              const isActive = filterRainCategory === option.id;
              return (
                <div key={option.id} className="relative z-10 p-0.5 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setFilterRainCategory(option.id)}
                    className={`w-full py-1.5 px-1 rounded-full text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center text-center select-none ${
                      isActive
                        ? option.activeTextColor
                        : 'text-slate-800 dark:text-slate-200 hover:text-[#007A8E] dark:hover:text-cyan-200 border border-white/10 dark:border-white/[0.06] bg-white/[0.03] dark:bg-white/[0.015] hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="hidden sm:inline whitespace-nowrap">{option.fullLabel}</span>
                    <span className="sm:hidden whitespace-nowrap">{option.shortLabel}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-700 text-[#172B3A] dark:text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#00AFCB] font-semibold"
          >
            <option value="prob_desc">Rain Probability (High to Low)</option>
            <option value="rain_desc">Expected Rainfall (mm)</option>
            <option value="name_asc">District Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Region Selector Pills */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs text-slate-800 dark:text-slate-200">
        <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">Region:</span>
        {['all', 'Coastal', 'Malnad (Ghats)', 'South Interior', 'North Interior'].map((reg) => (
          <button
            key={reg}
            onClick={() => setFilterRegion(reg)}
            className={`flex-shrink-0 px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
              filterRegion === reg
                ? 'bg-[#E6F8FA] text-[#007A8E] border border-[#00AFCB] dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-500/40 font-bold'
                : 'hover:text-[#172B3A] dark:hover:text-white text-slate-700 dark:text-slate-300'
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
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between watery-sub-card ${
                isSelected
                  ? 'border-[#00AFCB] dark:border-cyan-400 shadow-md ring-1 ring-[#00AFCB] bg-[#00AFCB]/10'
                  : 'hover:border-[#00AFCB] dark:hover:border-cyan-500/50'
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
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold">{d.region}</span>
                      {d.dataSource === 'estimated' || d.isEstimate ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300/40">
                          Est.
                        </span>
                      ) : d.dataSource === 'cached' || d.isStale ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold border border-blue-300/40" title={d.cachedAt ? `Cached ${formatTimeAgo(d.cachedAt)}` : 'Cached'}>
                          Cached{d.cachedAt ? ` (${formatTimeAgo(d.cachedAt)})` : ''}
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40">
                          Live
                        </span>
                      )}
                    </div>
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
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#D8E4ED]/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Rain: <strong className="text-slate-900 dark:text-white font-mono font-bold">{d.precipitationSum} mm</strong>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono font-medium">
                    {typeof d.temp === 'number' ? (
                      (d.dataSource === 'estimated' || d.isEstimate) ? (
                        <>
                          <strong className="text-amber-800 dark:text-amber-300 font-bold" title="Climatological estimate">~{d.temp}°C</strong>{' '}
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">(Est.)</span>
                        </>
                      ) : (
                        <>
                          <strong className="text-slate-900 dark:text-white font-bold">{d.temp}°C</strong>{' '}
                          <span className="text-[10px] text-slate-600 dark:text-slate-400">({d.tempMin}°/{d.tempMax}°)</span>
                        </>
                      )
                    ) : (
                      <>{d.tempMin}° / <strong className="text-slate-900 dark:text-white font-bold">{d.tempMax}°C</strong></>
                    )}
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

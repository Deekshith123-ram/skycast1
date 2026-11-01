import React, { useState } from 'react';
import { HourlyForecastItem } from '../types/weather';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Cloud,
  Sun,
  Activity,
} from 'lucide-react';

interface WeatherChartsProps {
  hourly: HourlyForecastItem[];
}

type ChartTab = 'temperature' | 'rainfall' | 'wind' | 'clouds' | 'humidity' | 'uv';

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ hourly }) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('temperature');

  // Format data for first 24-36 hours
  const chartData = hourly.slice(0, 24).map((h) => ({
    time: h.formattedTime,
    temp: h.temperature,
    feelsLike: h.apparentTemperature,
    precip: h.precipitation,
    precipProb: h.precipitationProbability,
    wind: h.windSpeed,
    cloud: h.cloudCover,
    humidity: h.humidity,
    uv: h.uvIndex,
  }));

  const tabs: { id: ChartTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'temperature', label: 'Temperature (°C)', icon: <Thermometer className="w-3.5 h-3.5" />, color: 'cyan' },
    { id: 'rainfall', label: 'Precipitation & Rain (mm)', icon: <CloudRain className="w-3.5 h-3.5" />, color: 'blue' },
    { id: 'wind', label: 'Wind Speed (km/h)', icon: <Wind className="w-3.5 h-3.5" />, color: 'teal' },
    { id: 'clouds', label: 'Cloud Cover (%)', icon: <Cloud className="w-3.5 h-3.5" />, color: 'slate' },
    { id: 'humidity', label: 'Humidity (%)', icon: <Droplets className="w-3.5 h-3.5" />, color: 'indigo' },
    { id: 'uv', label: 'UV Index', icon: <Sun className="w-3.5 h-3.5" />, color: 'amber' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#09152b] border border-[#D8E4ED] dark:border-cyan-500/30 p-2.5 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-[#0F1D2E] dark:text-white mb-1 font-mono">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-mono flex items-center gap-1.5 text-xs font-semibold">
              <span>{entry.name}:</span>
              <strong className="text-[#0F1D2E] dark:text-white font-bold">{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisTickStyle = { fontSize: 11, fill: 'var(--text-primary, #0F1D2E)', fontWeight: 600 };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-[#D8E4ED] dark:border-cyan-500/20 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <h2 className="font-display text-base font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
            Detailed Meteorological Analysis Charts
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            Granular 24-hour sensor trends and atmospheric profiles
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`water-droplet-pill flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-sm ${
                activeTab === tab.id
                  ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200'
                  : 'text-slate-800 dark:text-slate-200 hover:text-[#172B3A] dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temperature' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00AFCB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00AFCB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="feelsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8E4ED" opacity={0.9} />
              <XAxis dataKey="time" stroke="#526779" tick={axisTickStyle} />
              <YAxis stroke="#526779" domain={['dataMin - 2', 'dataMax + 2']} tick={axisTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#00AFCB" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGrad)" />
              <Area type="monotone" dataKey="feelsLike" name="Feels Like (°C)" stroke="#d97706" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#feelsGrad)" />
            </AreaChart>
          ) : activeTab === 'rainfall' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8E4ED" opacity={0.9} />
              <XAxis dataKey="time" stroke="#526779" tick={axisTickStyle} />
              <YAxis stroke="#526779" tick={axisTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="precip" name="Rainfall (mm)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="precipProb" name="Rain Probability (%)" stroke="#6366f1" strokeWidth={2} />
            </BarChart>
          ) : activeTab === 'wind' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8E4ED" opacity={0.9} />
              <XAxis dataKey="time" stroke="#526779" tick={axisTickStyle} />
              <YAxis stroke="#526779" tick={axisTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="wind" name="Wind Speed (km/h)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#windGrad)" />
            </AreaChart>
          ) : activeTab === 'clouds' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#475569" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8E4ED" opacity={0.9} />
              <XAxis dataKey="time" stroke="#526779" tick={axisTickStyle} />
              <YAxis stroke="#526779" domain={[0, 100]} tick={axisTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cloud" name="Cloud Cover (%)" stroke="#475569" strokeWidth={2} fillOpacity={1} fill="url(#cloudGrad)" />
            </AreaChart>
          ) : activeTab === 'humidity' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="humidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338ca" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8E4ED" opacity={0.9} />
              <XAxis dataKey="time" stroke="#526779" tick={axisTickStyle} />
              <YAxis stroke="#526779" domain={[0, 100]} tick={axisTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="#4338ca" strokeWidth={2.5} fillOpacity={1} fill="url(#humidGrad)" />
            </AreaChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8E4ED" opacity={0.9} />
              <XAxis dataKey="time" stroke="#526779" tick={axisTickStyle} />
              <YAxis stroke="#526779" domain={[0, 12]} tick={axisTickStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="uv" name="UV Radiation Index" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#uvGrad)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

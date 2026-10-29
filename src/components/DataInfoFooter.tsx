import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Database,
  Radio,
  Satellite,
  Wifi,
  WifiOff,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface DataInfoFooterProps {
  lastUpdated: string;
  isStale?: boolean;
}

export const DataInfoFooter: React.FC<DataInfoFooterProps> = ({
  lastUpdated,
  isStale = false,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <footer className="w-full glass-panel rounded-2xl p-6 border border-[#D8E4ED] dark:border-cyan-500/15 shadow-xl text-xs text-[#526779] dark:text-slate-400">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-[#D8E4ED] dark:border-slate-800">
        {/* Source 1: Satellite Core */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#172B3A] dark:text-white font-bold">
            <Satellite className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
            <span>Spaceborne Satellite Feeds</span>
          </div>
          <p className="text-[11px] text-[#526779] dark:text-slate-400 leading-relaxed">
            Direct telemetry from ISRO & IMD INSAT-3D/3DR geostationary satellites (74.0°E), NASA GIBS Earth Observing System (MODIS Terra/Aqua, VIIRS SNPP), and EUMETSAT.
          </p>
          <div className="text-[10px] text-[#00AFCB] dark:text-cyan-400 font-mono font-bold">
            Optical Reflectance & Infrared
          </div>
        </div>

        {/* Source 2: Radar Core */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#172B3A] dark:text-white font-bold">
            <Radio className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>Doppler Radar Network</span>
          </div>
          <p className="text-[11px] text-[#526779] dark:text-slate-400 leading-relaxed">
            Composite Doppler Weather Radar (DWR) precipitation reflectivity provided by RainViewer Global Precipitation Cache and IMD radar ground stations.
          </p>
          <div className="text-[10px] text-[#2563EB] dark:text-blue-400 font-mono font-bold">
            512px High-Precision Tiles
          </div>
        </div>

        {/* Source 3: Numerical Weather Models */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#172B3A] dark:text-white font-bold">
            <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Numerical Prediction Models</span>
          </div>
          <p className="text-[11px] text-[#526779] dark:text-slate-400 leading-relaxed">
            High-resolution ECMWF IFS, GFS, and ICON mesoscale models integrated via Open-Meteo weather API. Calibrated for Indian Standard Time (IST).
          </p>
          <div className="text-[10px] text-teal-700 dark:text-teal-400 font-mono font-bold">
            Hourly & 10-Day Synoptic Output
          </div>
        </div>

        {/* Source 4: Connection & Sync Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#172B3A] dark:text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>System Telemetry Status</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span>Network Link:</span>
              <span className="flex items-center gap-1 font-semibold text-[#172B3A] dark:text-white">
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400">Online Active</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-800 dark:text-amber-400">Offline (Cache)</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Last Sync:</span>
              <span className="font-mono text-[#172B3A] dark:text-slate-200 font-medium">{lastUpdated}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Cache Retention:</span>
              <span className="font-mono text-[#526779] dark:text-slate-300">Indexed Local PWA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclosures & Privacy Notice */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
        <p className="text-[#526779] dark:text-slate-400 leading-normal max-w-3xl">
          <strong className="text-[#172B3A] dark:text-slate-200">Transparency Notice:</strong> Satellite cloud maps represent genuine satellite-observed optical and thermal radiance from orbital sensors. Weather forecasts and wind stream flow represent computational numerical models. No user tracking, registration, or private location telemetry is recorded or transmitted.
        </p>

        <div className="flex items-center gap-2 flex-shrink-0 text-[#172B3A] dark:text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
          <span className="font-semibold">SkyCast Meteorological Platform</span>
        </div>
      </div>
    </footer>
  );
};

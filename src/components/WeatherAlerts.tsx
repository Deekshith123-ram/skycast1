import React from 'react';
import { WeatherAlert } from '../types/weather';
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) return null;

  const getAlertBadge = (severityColor: string, severity: string) => {
    switch (severityColor) {
      case 'red':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 text-xs font-bold border border-rose-300 dark:border-rose-500/40 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            {severity} (Take Action)
          </span>
        );
      case 'amber':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {severity} (Be Prepared)
          </span>
        );
      case 'yellow':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300 text-xs font-bold border border-yellow-300 dark:border-yellow-500/40">
            <Info className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            {severity} (Be Updated)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {severity} (Routine Conditions)
          </span>
        );
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-[#D8E4ED] dark:border-cyan-500/20 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <h2 className="font-display text-base font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
            Meteorological Advisories & Weather Warnings
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
            Standard IMD 4-stage color code alerts evaluated against verified surface & radar observations
          </p>
        </div>

        <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 hidden sm:inline font-semibold">
          Official Criteria (IS 4987)
        </span>
      </div>

      <div className="space-y-3.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all shadow-sm ${
              alert.severityColor === 'red'
                ? 'bg-rose-50/80 dark:bg-rose-950/25 border-rose-300 dark:border-rose-500/40 text-slate-900 dark:text-white'
                : alert.severityColor === 'amber'
                ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/35 text-slate-900 dark:text-white'
                : alert.severityColor === 'yellow'
                ? 'bg-yellow-50/80 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-500/35 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900/40 border-[#D8E4ED] dark:border-slate-800 text-slate-900 dark:text-white'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{alert.title}</h3>
              <div>{getAlertBadge(alert.severityColor, alert.severity)}</div>
            </div>

            {/* Region & Time info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-slate-300 mb-2.5 font-mono font-medium">
              <span>Target: <strong className="text-slate-900 dark:text-slate-100">{alert.affectedRegion}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00AFCB] dark:text-cyan-400" />
                Validity: <strong className="text-slate-900 dark:text-slate-100">{alert.validUntil}</strong>
              </span>
            </div>

            {/* Explanation */}
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
              {alert.explanation}
            </p>

            {/* Precautionary Instructions */}
            <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-black/30 border border-[#D8E4ED] dark:border-slate-800/80 text-xs space-y-1 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 block">
                Precautionary Safety Guidance:
              </span>
              <p className="text-slate-900 dark:text-slate-200 font-medium">{alert.instructions}</p>
            </div>

            {/* Source info */}
            <div className="mt-2.5 pt-2 border-t border-[#D8E4ED] dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-400 font-medium">
              <span>Source: {alert.source}</span>
              <span>Classification: {alert.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Settings,
  Globe,
  Check,
  Copy,
  Share2,
  Compass,
  Shield,
  Bell,
  Gauge,
  MapPin,
  Satellite,
  Layers,
  Palette,
  RefreshCw,
  Sparkles,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Volume2,
  CloudRain,
  Radio,
  Star,
  Navigation,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../services/languageService';
import { UserSettings, RefreshInterval, SatelliteDefaultLayer, StartupLocationMode, saveDefaultLocality } from '../services/settingsService';
import { LocationData } from '../types/weather';
import { ALL_KARNATAKA_DISTRICTS, KARNATAKA_DEFAULT_LOCATION, KARNATAKA_LOCALITIES } from '../services/geocodingService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  lang: Language;
  setLang: (l: Language) => void;
  settings: UserSettings;
  updateSettings: (updater: Partial<UserSettings>) => void;
  currentLocation: LocationData;
  onResetLocationToKarnataka: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  lang,
  setLang,
  settings,
  updateSettings,
  currentLocation,
  onResetLocationToKarnataka,
}) => {
  const [copied, setCopied] = useState(false);
  const [resetLocationDone, setResetLocationDone] = useState(false);
  const [defaultDistrictDone, setDefaultDistrictDone] = useState(false);
  const [defaultLocalityDone, setDefaultLocalityDone] = useState(false);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const publicWebUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicWebUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetKarnataka = () => {
    onResetLocationToKarnataka();
    setResetLocationDone(true);
    setTimeout(() => setResetLocationDone(false), 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90dvh] my-auto flex flex-col rounded-2xl bg-white dark:bg-[#071328] border border-[#00AFCB]/40 dark:border-cyan-500/40 shadow-[0_24px_70px_rgba(0,0,0,0.65)] text-[#172B3A] dark:text-slate-100 overflow-hidden animate-in zoom-in-95"
      >
        {/* Header (Sticky Top) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8E4ED] dark:border-cyan-500/20 bg-slate-50/90 dark:bg-[#050e1f]/95 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E6F8FA] dark:bg-cyan-500/20 text-[#00AFCB] dark:text-cyan-400 border border-[#00AFCB]/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-[#172B3A] dark:text-white">
                {t.platformSettings}
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="water-droplet-btn p-2 rounded-full text-slate-700 dark:text-slate-300 hover:text-[#0F1D2E] dark:hover:text-white transition cursor-pointer"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Standard Clean Weather App Settings Sections */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5 text-xs">
          {/* SECTION 1: WEATHER ALERTS & NOTIFICATIONS */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <Bell className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionWeatherAlerts}</span>
            </div>

            {/* Severe Weather Advisories */}
            <div className="flex items-center justify-between py-1">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.severeAlertsDesc}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn' ? 'ಚಂಡಮಾರುತ, ಭಾರೀ ಗಾಳಿ ಮತ್ತು ಪ್ರವಾಹ ಮುನ್ನೆಚ್ಚರಿಕೆ' : 'Heavy rain, gale gusts, lightning and cyclone alerts'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.severeAlerts}
                onChange={(e) => updateSettings({ severeAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>

            {/* District Rain Probability Alert */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.rainAlertsDesc}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn' ? 'ಜಿಲ್ಲೆಯಲ್ಲಿ ಭಾರೀ ಮಳೆ ಸಂಭವನೀಯತೆ ಹೆಚ್ಚಿದಾಗ ಸೂಚನೆ' : 'Notify when rain probability reaches high confidence'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.rainThresholdAlerts}
                onChange={(e) => updateSettings({ rainThresholdAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>

            {/* Alert Audio / Vibration */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.alertSoundDesc}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn' ? 'ಹವಾಮಾನ ತುರ್ತು ಎಚ್ಚರಿಕೆಗೆ ಆಡಿಯೋ ಟೋನ್' : 'Audible chime for meteorological priority alerts'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.alertSound}
                onChange={(e) => updateSettings({ alertSound: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 2: MEASUREMENT UNITS */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <Gauge className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionUnits}</span>
            </div>

            {/* Temperature Unit */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.temperatureUnit}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ tempUnit: 'celsius' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    settings.tempUnit === 'celsius'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                  }`}
                >
                  <span>Celsius (°C)</span>
                  {settings.tempUnit === 'celsius' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
                <button
                  onClick={() => updateSettings({ tempUnit: 'fahrenheit' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    settings.tempUnit === 'fahrenheit'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                  }`}
                >
                  <span>Fahrenheit (°F)</span>
                  {settings.tempUnit === 'fahrenheit' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Wind Speed Unit */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.windSpeedUnit}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['kmh', 'ms', 'mph'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => updateSettings({ windSpeedUnit: unit })}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                      settings.windSpeedUnit === unit
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                    }`}
                  >
                    {unit === 'kmh' ? 'km/h' : unit === 'ms' ? 'm/s' : 'mph'}
                  </button>
                ))}
              </div>
            </div>

            {/* Precipitation Unit */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.precipitationUnit}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ precipUnit: 'mm' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    settings.precipUnit === 'mm'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <span>Millimeters (mm)</span>
                  {settings.precipUnit === 'mm' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
                <button
                  onClick={() => updateSettings({ precipUnit: 'inch' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    settings.precipUnit === 'inch'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <span>Inches (in)</span>
                  {settings.precipUnit === 'inch' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Pressure Unit */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.pressureUnit}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['hpa', 'mmhg', 'inhg'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => updateSettings({ pressureUnit: unit })}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                      settings.pressureUnit === unit
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                    }`}
                  >
                    {unit === 'hpa' ? 'hPa' : unit === 'mmhg' ? 'mmHg' : 'inHg'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION MANAGEMENT */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <MapPin className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionLocation}</span>
            </div>

            {/* Active Location Info Card */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-bold">
                  {t.currentLocationLabel}
                </span>
                <span className="font-display font-bold text-sm text-[#0F1D2E] dark:text-white block">
                  {currentLocation.name}
                </span>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                  {currentLocation.state}, {currentLocation.country} • {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F8FA] dark:bg-cyan-950 text-[#007A8E] dark:text-cyan-300 border border-[#00AFCB]/30">
                  ACTIVE
                </span>
                {(settings.defaultLocalityId === currentLocation.id || settings.defaultLocation?.id === currentLocation.id) && (
                  <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{t.defaultLocalityBadge}</span>
                  </span>
                )}
                {settings.defaultDistrictId === currentLocation.id && (
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    ★ {lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ' : 'Default District'}
                  </span>
                )}
              </div>
            </div>

            {/* A. Startup Location Mode: Current GPS vs Default Locality vs Default District */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
                {t.startupMode}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings({ startupLocationMode: 'current_location', autoDetectLocation: true })}
                  className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                    settings.startupLocationMode === 'current_location'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ಲೈವ್ ಜಿಪಿಎಸ್' : 'Live GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettings({ startupLocationMode: 'default_locality' })}
                  className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                    settings.startupLocationMode === 'default_locality'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-200 ring-1 ring-amber-400/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ಸ್ಥಳ' : 'Default Locality'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettings({ startupLocationMode: 'default_district' })}
                  className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer flex flex-col items-center justify-center gap-1 text-center ${
                    settings.startupLocationMode === 'default_district'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{lang === 'kn' ? 'ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ' : 'Default District'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                {settings.startupLocationMode === 'current_location'
                  ? (lang === 'kn'
                      ? 'ಆ್ಯಪ್ ತೆರೆದಾಗ ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಪತ್ತೆಮಾಡುತ್ತದೆ (ಅನುಮತಿ ನೀಡಿದ ನಂತರ).'
                      : 'App starts at your live GPS location on startup (asks only if needed).')
                  : settings.startupLocationMode === 'default_locality'
                  ? (lang === 'kn'
                      ? `ಆ್ಯಪ್ ಯಾವಾಗಲೂ ${settings.defaultLocalityName || 'ನಿಮ್ಮ ಡೀಫಾಲ್ಟ್ ಸ್ಥಳೀಯ ಪ್ರದೇಶ'}ದಲ್ಲಿ ನೇರವಾಗಿ ತೆರೆಯುತ್ತದೆ.`
                      : `App will always open directly to ${settings.defaultLocalityName || 'your default locality'}.`)
                  : (lang === 'kn'
                      ? `ಆ್ಯಪ್ ಯಾವಾಗಲೂ ${settings.defaultDistrictName} ನಲ್ಲಿ ನೇರವಾಗಿ ತೆರೆಯುತ್ತದೆ.`
                      : `App will always open directly to ${settings.defaultDistrictName}.`)}
              </p>
            </div>

            {/* B. Choose Default Locality Dropdown */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white flex items-center justify-between">
                <span>{t.defaultLocalityLabel}</span>
                {settings.defaultLocalityName && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {settings.defaultLocalityName}
                  </span>
                )}
              </label>
              <select
                value={settings.defaultLocalityId || (currentLocation.isLocality ? currentLocation.id : 'locality-vasanth-nagar')}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (currentLocation.isLocality && selectedId === currentLocation.id) {
                    saveDefaultLocality(currentLocation);
                    updateSettings({
                      defaultLocalityId: currentLocation.id,
                      defaultLocalityName: currentLocation.name,
                      defaultLocation: currentLocation,
                      startupLocationMode: 'default_locality',
                    });
                    return;
                  }
                  const match = KARNATAKA_LOCALITIES.find((l) => l.id === selectedId);
                  if (match) {
                    saveDefaultLocality(match);
                    updateSettings({
                      defaultLocalityId: match.id,
                      defaultLocalityName: match.name,
                      defaultLocation: match,
                      startupLocationMode: 'default_locality',
                    });
                  }
                }}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-700 text-xs text-[#172B3A] dark:text-white font-medium focus:outline-none focus:border-[#00AFCB]"
              >
                {currentLocation.isLocality && (
                  <option value={currentLocation.id}>
                    📍 {currentLocation.name} ({currentLocation.district}) — Current Locality
                  </option>
                )}
                <optgroup label={lang === 'kn' ? 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಸ್ಥಳೀಯ ಪ್ರದೇಶಗಳು' : 'Prominent Karnataka Localities & Towns'}>
                  {KARNATAKA_LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.district})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* C. Choose Default District Dropdown */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
                {t.defaultDistrictLabel}
              </label>
              <select
                value={settings.defaultDistrictId || 'karnataka-all'}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  let selectedName = 'Karnataka (Whole State)';
                  if (selectedId !== 'karnataka-all') {
                    const match = ALL_KARNATAKA_DISTRICTS.find((d) => d.id === selectedId);
                    if (match) selectedName = match.name;
                  }
                  updateSettings({
                    defaultDistrictId: selectedId,
                    defaultDistrictName: selectedName,
                  });
                }}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-700 text-xs text-[#172B3A] dark:text-white font-medium focus:outline-none focus:border-[#00AFCB]"
              >
                <option value="karnataka-all">Karnataka (Whole State — All 31 Districts)</option>
                <optgroup label={lang === 'kn' ? 'ಕರ್ನಾಟಕದ ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳು' : 'All 31 Karnataka Districts'}>
                  {ALL_KARNATAKA_DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.region})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* D. Quick Actions: Set Active Location as Default Locality or District */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  saveDefaultLocality(currentLocation);
                  updateSettings({
                    defaultLocalityId: currentLocation.id,
                    defaultLocalityName: currentLocation.name,
                    defaultLocation: currentLocation,
                    startupLocationMode: 'default_locality',
                  });
                  setDefaultLocalityDone(true);
                  setTimeout(() => setDefaultLocalityDone(false), 2500);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              >
                {defaultLocalityDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-300">{t.defaultLocalitySaved}</span>
                  </>
                ) : (
                  <>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{t.setAsDefaultLocality} ({currentLocation.name})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  updateSettings({
                    defaultDistrictId: currentLocation.id,
                    defaultDistrictName: currentLocation.name,
                    startupLocationMode: 'default_district',
                  });
                  try {
                    localStorage.setItem('skycast_default_district', JSON.stringify(currentLocation));
                  } catch {}
                  setDefaultDistrictDone(true);
                  setTimeout(() => setDefaultDistrictDone(false), 2500);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#E6F8FA] dark:bg-cyan-950/70 hover:bg-[#D5F5F9] dark:hover:bg-cyan-900 border border-[#00AFCB]/40 dark:border-cyan-500/40 text-[#007A8E] dark:text-cyan-200 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
              >
                {defaultDistrictDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-300">{t.defaultDistrictSaved}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.setAsDefaultDistrict} ({currentLocation.district && currentLocation.district !== currentLocation.name ? currentLocation.district : currentLocation.name})</span>
                  </>
                )}
              </button>
            </div>

            {/* E. Reset to Whole Karnataka Default Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleResetKarnataka}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              >
                {resetLocationDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{lang === 'kn' ? 'ಕರ್ನಾಟಕ ಡೀಫಾಲ್ಟ್‌ಗೆ ಹೊಂದಿಸಲಾಗಿದೆ' : 'Reset to Karnataka Applied!'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.resetToKarnataka}</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-700 dark:text-slate-300 font-medium mt-1.5 text-center">
                {t.defaultKarnatakaDesc}
              </p>
            </div>

            {/* Auto Detect on Startup toggle */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.autoDetectGPS}
                </span>
                <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn'
                    ? 'ಅನುಮೋದಿಸಿದ ನಂತರ ಮಾತ್ರ ಜಿಪಿಎಸ್ ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚುತ್ತದೆ'
                    : 'Automatically requests GPS if permitted; falls back gracefully to default district'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoDetectLocation}
                onChange={(e) => updateSettings({ autoDetectLocation: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 4: SATELLITE MAP CONTROLS */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <Satellite className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionMapControls}</span>
            </div>

            {/* Default Map Layer */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.defaultMapLayer}
              </label>
              <div className="space-y-1.5">
                {[
                  { id: 'clouds_satellite', label: t.cloudsLayerTitle },
                  { id: 'radar_rain', label: t.radarLayerTitle },
                  { id: 'satellite_pure', label: t.opticalLayerTitle },
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => updateSettings({ defaultMapLayer: layer.id as SatelliteDefaultLayer })}
                    className={`w-full text-left py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                      settings.defaultMapLayer === layer.id
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200'
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                    }`}
                  >
                    <span>{layer.label}</span>
                    {settings.defaultMapLayer === layer.id && <Check className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Cloud Opacity Slider */}
            <div className="space-y-1 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#172B3A] dark:text-white">{t.cloudOpacityLabel}</span>
                <span className="font-mono text-[#00AFCB] dark:text-cyan-300">
                  {Math.round(settings.defaultCloudOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={settings.defaultCloudOpacity}
                onChange={(e) => updateSettings({ defaultCloudOpacity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00AFCB]"
              />
            </div>

            {/* Display All 31 District Pins on Launch */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <span className="font-bold text-xs text-[#172B3A] dark:text-white">
                {t.pins31OnLaunch}
              </span>
              <input
                type="checkbox"
                checked={settings.showDistrictPinsOnLaunch}
                onChange={(e) => updateSettings({ showDistrictPinsOnLaunch: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>

            {/* Overlay Rain Radar over Clouds */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <span className="font-bold text-xs text-[#172B3A] dark:text-white">
                {t.radarOverlayDefault}
              </span>
              <input
                type="checkbox"
                checked={settings.overlayRainRadarOverClouds}
                onChange={(e) => updateSettings({ overlayRainRadarOverClouds: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 5: APPEARANCE & ATMOSPHERE */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <Palette className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionAppearance}</span>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
                {t.selectLanguage}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLang('en')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    lang === 'en'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <span className="font-bold">English</span>
                  </div>
                  {lang === 'en' && <Check className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />}
                </button>

                <button
                  onClick={() => setLang('kn')}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    lang === 'kn'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:text-[#0F1D2E] dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-amber-500">ಕ</span>
                    <span className="font-bold">ಕನ್ನಡ</span>
                  </div>
                  {lang === 'kn' && <Check className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Display Theme */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.theme}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-500/50 text-[#0F1D2E] dark:text-cyan-200 shadow-sm ring-1 ring-cyan-400/20'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <Moon className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
                  <span>{t.darkTheme}</span>
                  {theme === 'dark' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>

                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#E6F8FA] border-[#00AFCB] text-[#0F1D2E] dark:bg-cyan-500/20 dark:border-cyan-500/50 dark:text-cyan-200 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{t.lightTheme}</span>
                  {theme === 'light' && <Check className="w-3.5 h-3.5 text-[#00AFCB]" />}
                </button>
              </div>
            </div>

            {/* Atmosphere Animations Toggle */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.atmosphereAnimationDesc}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn' ? 'ತಾಪಮಾನ ವಿಭಾಗದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ನೈಜ ಮಳೆ ಮತ್ತು ಮೋಡದ ಚಲನೆ' : 'Simulates rainfall, sunlight motes, and clouds in current weather card'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showAtmosphereAnimation}
                onChange={(e) => updateSettings({ showAtmosphereAnimation: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 6: AUTOMATIC REFRESH & TELEMETRY */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <RefreshCw className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionAutoRefresh}</span>
            </div>

            {/* Refresh Interval Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                {t.refreshIntervalLabel}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: 60000, label: '1 min' },
                  { value: 180000, label: '3 min' },
                  { value: 300000, label: '5 min' },
                  { value: 0, label: 'Manual' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => updateSettings({ refreshInterval: item.value as RefreshInterval })}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                      settings.refreshInterval === item.value
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-Sync on App Resume */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.syncOnResumeDesc}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn' ? 'ಬಳಕೆದಾರರು ಮರಳಿದಾಗ ನೇರ ಡೇಟಾವನ್ನು ತಕ್ಷಣ ಸಿಂಕ್ ಮಾಡುತ್ತದೆ' : 'Immediately fetches live weather if away for more than 2 minutes'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.syncOnAppResume}
                onChange={(e) => updateSettings({ syncOnAppResume: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>

            {/* Low Data Mode */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#0F1D2E] dark:text-white block">
                  {t.lowDataModeDesc}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  {lang === 'kn' ? 'ಮೊಬೈಲ್ ಡೇಟಾ ಉಳಿಸಲು ಉಪಗ್ರಹ ನಕ್ಷೆಯ ಬ್ಯಾಂಡ್‌ವಿಡ್ತ್ ಉಳಿಸುತ್ತದೆ' : 'Optimizes map satellite tile fetches when on limited mobile connection'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.lowDataMode}
                onChange={(e) => updateSettings({ lowDataMode: e.target.checked })}
                className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
              />
            </div>
          </div>

          {/* SECTION 7: SHARE & OFFICIAL DATA DISCLOSURES */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#0F1D2E] dark:text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                <span>{t.shareTitle}</span>
              </span>
              <button
                onClick={handleCopyLink}
                className="water-droplet-pill flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#007A8E] dark:text-cyan-300 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyLink}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              {t.shareDesc}
            </p>

            <div className="pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <span className="font-bold text-[11px] text-[#0F1D2E] dark:text-white flex items-center gap-1.5 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                <span>{t.officialDataProviders}</span>
              </span>
              <ul className="text-[10px] text-slate-700 dark:text-slate-300 font-medium space-y-1 list-disc list-inside">
                <li>{lang === 'kn' ? 'ಭಾರತೀಯ ಹವಾಮಾನ ಇಲಾಖೆ (IMD INSAT-3D/3DR ಉಪಗ್ರಹ)' : 'India Meteorological Department (IMD) INSAT-3D/3DR'}</li>
                <li>{lang === 'kn' ? 'ಓಪನ್-ಮೆಟಿಯೋ ನೈಜ-ಸಮಯದ ಹವಾಮಾನ ಡೇಟಾ' : 'Open-Meteo High-Resolution Numerical Forecasts'}</li>
                <li>{lang === 'kn' ? 'ನಾಸಾ ಅರ್ಥ್‌ಡೇಟಾ ಮತ್ತು ಡಾಪ್ಲರ್ ರೇಡಾರ್' : 'NASA Earthdata GIBS & RainViewer Doppler Radar'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#D8E4ED] dark:border-cyan-500/20 bg-slate-50/90 dark:bg-[#050e1f]/95 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="water-droplet-btn px-6 py-2 rounded-full text-xs font-bold text-[#172B3A] dark:text-white shadow-md cursor-pointer transition"
          >
            {lang === 'kn' ? 'ಮುಗಿದಿದೆ (Done)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

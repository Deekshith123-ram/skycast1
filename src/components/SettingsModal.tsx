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
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../services/languageService';
import { UserSettings, RefreshInterval, SatelliteDefaultLayer } from '../services/settingsService';
import { LocationData } from '../types/weather';

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
              <p className="text-xs text-[#526779] dark:text-slate-400 font-normal">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white transition cursor-pointer"
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
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.severeAlertsDesc}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
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
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.rainAlertsDesc}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
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
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.alertSoundDesc}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
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
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
                {t.temperatureUnit}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ tempUnit: 'celsius' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    settings.tempUnit === 'celsius'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
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
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
                  }`}
                >
                  <span>Fahrenheit (°F)</span>
                  {settings.tempUnit === 'fahrenheit' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Wind Speed Unit */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
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
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
                    }`}
                  >
                    {unit === 'kmh' ? 'km/h' : unit === 'ms' ? 'm/s' : 'mph'}
                  </button>
                ))}
              </div>
            </div>

            {/* Precipitation Unit */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
                {t.precipitationUnit}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ precipUnit: 'mm' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    settings.precipUnit === 'mm'
                      ? 'bg-cyan-50 dark:bg-cyan-500/20 border-[#00AFCB] dark:border-cyan-400 text-[#007A8E] dark:text-cyan-200 ring-1 ring-[#00AFCB]/30'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
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
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
                  }`}
                >
                  <span>Inches (in)</span>
                  {settings.precipUnit === 'inch' && <Check className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />}
                </button>
              </div>
            </div>

            {/* Pressure Unit */}
            <div className="space-y-1.5 pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
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
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
                    }`}
                  >
                    {unit === 'hpa' ? 'hPa' : unit === 'mmhg' ? 'mmHg' : 'inHg'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION MANAGEMENT */}
          <div className="rounded-2xl p-4 bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#D8E4ED] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
              <MapPin className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
              <span>{t.sectionLocation}</span>
            </div>

            {/* Active Location Info Card */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#D8E4ED] dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#687D8F] dark:text-slate-400 uppercase tracking-wider block font-bold">
                  {t.currentLocationLabel}
                </span>
                <span className="font-display font-bold text-sm text-[#172B3A] dark:text-white block">
                  {currentLocation.name}
                </span>
                <span className="text-[10px] text-[#526779] dark:text-slate-400">
                  {currentLocation.state}, {currentLocation.country} • {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F8FA] dark:bg-cyan-950 text-[#007A8E] dark:text-cyan-300 border border-[#00AFCB]/30">
                ACTIVE
              </span>
            </div>

            {/* Reset to Whole Karnataka Default Button */}
            <div className="pt-1">
              <button
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
              <p className="text-[11px] text-[#687D8F] dark:text-slate-400 mt-1.5 text-center">
                {t.defaultKarnatakaDesc}
              </p>
            </div>

            {/* Auto Detect on Startup toggle */}
            <div className="flex items-center justify-between py-1 border-t border-[#D8E4ED]/60 dark:border-slate-800/60 pt-2.5">
              <div className="pr-3">
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.autoDetectGPS}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
                  {lang === 'kn' ? 'ಅನುಮತಿ ನೀಡಿದ ನಂತರ ಮಾತ್ರ ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಗುರುತಿಸುತ್ತದೆ' : 'Only asks if previously approved; Karnataka default remains preserved'}
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
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
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
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
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
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
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
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-white'
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
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
                {t.theme}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-cyan-100 dark:bg-cyan-500/20 border-cyan-500/50 text-[#172B3A] dark:text-cyan-200 shadow-sm ring-1 ring-cyan-400/20'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
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
                      ? 'bg-[#E6F8FA] border-[#00AFCB] text-[#172B3A] dark:bg-cyan-500/20 dark:border-cyan-500/50 dark:text-cyan-200 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
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
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.atmosphereAnimationDesc}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
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
              <label className="font-bold text-xs text-[#172B3A] dark:text-white block">
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
                        : 'bg-white dark:bg-slate-900 border-[#D8E4ED] dark:border-slate-800 text-[#526779] dark:text-slate-400'
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
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.syncOnResumeDesc}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
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
                <span className="font-bold text-xs text-[#172B3A] dark:text-white block">
                  {t.lowDataModeDesc}
                </span>
                <span className="text-[11px] text-[#526779] dark:text-slate-400">
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
              <span className="font-bold text-xs text-[#172B3A] dark:text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                <span>{t.shareTitle}</span>
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-[11px] font-bold text-[#007A8E] dark:text-cyan-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyLink}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#526779] dark:text-slate-400">
              {t.shareDesc}
            </p>

            <div className="pt-2 border-t border-[#D8E4ED]/60 dark:border-slate-800/60">
              <span className="font-bold text-[11px] text-[#172B3A] dark:text-white flex items-center gap-1.5 mb-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                <span>{t.officialDataProviders}</span>
              </span>
              <ul className="text-[10px] text-[#526779] dark:text-slate-400 space-y-1 list-disc list-inside">
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
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00AFCB] to-[#2563EB] hover:from-[#0096AD] hover:to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
          >
            {lang === 'kn' ? 'ಮುಗಿದಿದೆ (Done)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

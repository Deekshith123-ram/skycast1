/**
 * SkyCast — Live Weather & Satellite Cloud Tracker
 * Default Showing: Whole State of Karnataka (All 31 Districts) & Satellite Telemetry
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LocationData, WeatherData, WeatherAlert, DistrictRainData } from './types/weather';
import { DEFAULT_LOCATION, ALL_KARNATAKA_DISTRICTS, KARNATAKA_LOCALITIES, reverseGeocodeLocation } from './services/geocodingService';
import { fetchWeatherData, fetchAllKarnatakaDistrictsRain } from './services/weatherService';
import { evaluateWeatherAlerts } from './services/alertService';
import { Language, TRANSLATIONS } from './services/languageService';
import { UserSettings, loadUserSettings, saveUserSettings, saveDefaultLocality } from './services/settingsService';
import { Navbar } from './components/Navbar';
import { CurrentWeather } from './components/CurrentWeather';
import { SatelliteMap } from './components/SatelliteMap';
import { KarnatakaDistrictsRainGrid } from './components/KarnatakaDistrictsRainGrid';
import { INSATSatelliteViewer } from './components/INSATSatelliteViewer';
import { WeatherMetrics } from './components/WeatherMetrics';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherCharts } from './components/WeatherCharts';
import { MonsoonTracker } from './components/MonsoonTracker';
import { WeatherAlerts } from './components/WeatherAlerts';
import { DataInfoFooter } from './components/DataInfoFooter';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SettingsModal } from './components/SettingsModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { MobileActionBar } from './components/MobileActionBar';
import { AndroidDownloadBanner } from './components/AndroidDownloadBanner';
import { LoadingScreen } from './components/LoadingScreen';
import { useAutoScrollControls } from './hooks/useAutoScrollControls';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  // Comprehensive User Settings state
  const [settings, setSettings] = useState<UserSettings>(() => loadUserSettings());

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveUserSettings(updated);
      return updated;
    });
  };

  // Language state: English default, Kannada option
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('skycast_language');
      if (saved === 'kn' || saved === 'en') return saved;
    } catch {}
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('skycast_language', newLang);
    } catch {}
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [currentLocation, setCurrentLocation] = useState<LocationData>(() => {
    try {
      const userSettings = loadUserSettings();
      // If user configured fixed default locality, start directly at that default locality!
      if (userSettings.startupLocationMode === 'default_locality') {
        if (userSettings.defaultLocation) {
          return userSettings.defaultLocation;
        }
        const savedDefaultLocality = localStorage.getItem('skycast_default_locality');
        if (savedDefaultLocality) {
          return JSON.parse(savedDefaultLocality);
        }
        const foundLoc = KARNATAKA_LOCALITIES.find((l) => l.id === userSettings.defaultLocalityId);
        if (foundLoc) return foundLoc;
      }

      // If user configured fixed default district, start directly at that default district!
      if (userSettings.startupLocationMode === 'default_district') {
        if (userSettings.defaultDistrictId === 'karnataka-all') {
          return DEFAULT_LOCATION;
        }
        const found = ALL_KARNATAKA_DISTRICTS.find((d) => d.id === userSettings.defaultDistrictId);
        if (found) return found;
      }

      // If user prefers current live location, load cached position first so initial render is instant
      const cached = localStorage.getItem('skycast_user_location');
      if (cached) {
        return JSON.parse(cached);
      }

      // Fallback to saved default locality
      const savedLoc = localStorage.getItem('skycast_default_locality');
      if (savedLoc) {
        return JSON.parse(savedLoc);
      }

      // Fallback to saved default district
      const savedDefault = localStorage.getItem('skycast_default_district');
      if (savedDefault) {
        return JSON.parse(savedDefault);
      }
    } catch {}
    return DEFAULT_LOCATION;
  });

  // Handler to set the user's default locality
  const handleSetDefaultLocality = (loc: LocationData) => {
    saveDefaultLocality(loc);
    updateSettings({
      defaultLocalityId: loc.id,
      defaultLocalityName: loc.name,
      defaultLocation: loc,
      startupLocationMode: 'default_locality',
    });
  };

  // Startup Location Detection:
  // Starts at user's default locality if mode is 'default_locality'.
  // Starts at user's default district if mode is 'default_district'.
  // Starts at user's live GPS if mode is 'current_location'.
  useEffect(() => {
    // 1. If startup mode is set to fixed default locality
    if (settings.startupLocationMode === 'default_locality') {
      if (settings.defaultLocation) {
        setCurrentLocation(settings.defaultLocation);
        return;
      }
      const savedLoc = localStorage.getItem('skycast_default_locality');
      if (savedLoc) {
        setCurrentLocation(JSON.parse(savedLoc));
        return;
      }
      const foundLoc = KARNATAKA_LOCALITIES.find((l) => l.id === settings.defaultLocalityId);
      if (foundLoc) {
        setCurrentLocation(foundLoc);
        return;
      }
    }

    // 2. If startup mode is set to fixed default district, do not query GPS
    if (settings.startupLocationMode === 'default_district' || !settings.autoDetectLocation) {
      if (settings.defaultDistrictId === 'karnataka-all') {
        setCurrentLocation(DEFAULT_LOCATION);
      } else {
        const found = ALL_KARNATAKA_DISTRICTS.find((d) => d.id === settings.defaultDistrictId);
        if (found) setCurrentLocation(found);
      }
      return;
    }

    // 3. Startup mode is 'current_location' (Live GPS)
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const detectedLocation = await reverseGeocodeLocation(
              pos.coords.latitude,
              pos.coords.longitude
            );
            setCurrentLocation(detectedLocation);
            localStorage.setItem('skycast_user_location', JSON.stringify(detectedLocation));
            localStorage.setItem('skycast_location_approved', 'true');
          } catch (err) {
            console.warn('Auto-location detection error:', err);
          }
        },
        (err) => {
          console.log('Location permission was not granted; will fallback to default locality or district.', err);
          try {
            const savedLoc = localStorage.getItem('skycast_default_locality');
            if (savedLoc) {
              setCurrentLocation(JSON.parse(savedLoc));
              return;
            }
            const savedDefault = localStorage.getItem('skycast_default_district');
            if (savedDefault) {
              setCurrentLocation(JSON.parse(savedDefault));
            } else if (settings.defaultLocation) {
              setCurrentLocation(settings.defaultLocation);
            } else if (settings.defaultDistrictId && settings.defaultDistrictId !== 'karnataka-all') {
              const found = ALL_KARNATAKA_DISTRICTS.find((d) => d.id === settings.defaultDistrictId);
              if (found) setCurrentLocation(found);
            }
          } catch {}
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, [settings.startupLocationMode, settings.defaultDistrictId, settings.defaultLocalityId, settings.defaultLocation, settings.autoDetectLocation]);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [districtsRainData, setDistrictsRainData] = useState<DistrictRainData[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);
  const lastSyncTimestampRef = useRef<number>(Date.now());

  // Auto-hiding header hook: at the top section, it always appears without hiding.
  // After the top section until the bottom, it auto-hides after 1.8s (1-2s) or on downward scroll.
  const {
    isHeaderVisible,
    showHeader,
    startAutoHideTimer,
    clearTimer,
  } = useAutoScrollControls({
    isBusy: isLoading || isSettingsOpen || isAIOpen || isSearchFocused || isHeaderHovered,
    autoHideDelayMs: 1800,
  });

  useEffect(() => {
    if (weatherData || error) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [weatherData, error]);

  // Theme state: dark default, syncs with html class & localStorage
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('skycast_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const applyTheme = useCallback((tMode: 'dark' | 'light') => {
    if (tMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    }
  }, []);

  const setTheme = (tMode: 'dark' | 'light') => {
    setThemeState(tMode);
    localStorage.setItem('skycast_theme', tMode);
    applyTheme(tMode);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Load weather data for the selected location (Default: Whole Karnataka)
  const loadWeather = useCallback(async (loc: LocationData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
      let generatedAlerts = evaluateWeatherAlerts(data);
      if (!settings.severeAlerts) {
        generatedAlerts = generatedAlerts.filter((a) => a.severity !== 'Warning' && a.severity !== 'Alert');
      }
      setAlerts(generatedAlerts);
      lastSyncTimestampRef.current = Date.now();
    } catch (err: any) {
      console.error('Failed to load weather data:', err);
      setError(err?.message || 'Unable to retrieve weather data.');
    } finally {
      setIsLoading(false);
    }
  }, [settings.severeAlerts]);

  // Load all 31 Karnataka districts rain probability telemetry
  const loadDistrictsRain = useCallback(async () => {
    try {
      const data = await fetchAllKarnatakaDistrictsRain();
      setDistrictsRainData(data);
    } catch (err) {
      console.error('Error fetching district rain data:', err);
    }
  }, []);

  // Fetch initial Karnataka data on startup
  useEffect(() => {
    loadWeather(currentLocation);
    loadDistrictsRain();
  }, [currentLocation, loadWeather, loadDistrictsRain]);

  // Continuous LIVE telemetry sync: based on settings.refreshInterval & settings.syncOnAppResume
  useEffect(() => {
    if (settings.refreshInterval <= 0) return;

    const liveInterval = setInterval(() => {
      if (!document.hidden) {
        console.log(`Auto-refreshing live telemetry (${settings.refreshInterval / 60000}m interval)...`);
        loadWeather(currentLocation);
        loadDistrictsRain();
      }
    }, settings.refreshInterval);

    const handleVisibilityChange = () => {
      if (!document.hidden && settings.syncOnAppResume) {
        // If user was away for more than 2 minutes, immediately sync live values
        if (Date.now() - lastSyncTimestampRef.current > 120000) {
          loadWeather(currentLocation);
          loadDistrictsRain();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(liveInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentLocation, loadWeather, loadDistrictsRain, settings.refreshInterval, settings.syncOnAppResume]);

  // Handle location selection (only scrolls to top for search/grid, never for map pin clicks)
  const handleSelectLocation = (loc: LocationData, shouldScrollToTop: boolean = false) => {
    setCurrentLocation(loc);
    if (shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showHeader();
    }
  };

  return (
    <div className="min-h-screen app-ambient-background text-[#0F1D2E] dark:text-slate-100 flex flex-col font-body font-normal transition-colors duration-200 relative overflow-x-hidden">
      {/* Abstract subtle stipple texture overlay (neutral, physical feel, non-cloud) */}
      <div className="fixed inset-0 pointer-events-none z-0 app-texture-overlay" aria-hidden="true" />

      {/* Full-screen immersive Loading / Splash Screen with Satellite & Earth Background */}
      <LoadingScreen isLoading={isInitialLoading} />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* A. Navigation Header with Smooth Auto-Hiding & Glass Effect */}
      <Navbar
        currentLocation={currentLocation}
        onSelectLocation={(loc) => handleSelectLocation(loc, true)}
        onRefresh={() => {
          loadWeather(currentLocation);
          loadDistrictsRain();
        }}
        isLoading={isLoading}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        lang={lang}
        isVisible={isHeaderVisible}
        onReveal={showHeader}
        onSearchFocusChange={setIsSearchFocused}
        onHeaderHover={(hovering) => {
          setIsHeaderHovered(hovering);
          if (hovering) {
            clearTimer();
          } else {
            startAutoHideTimer();
          }
        }}
      />

      {/* Header height placeholder spacer to prevent layout shift */}
      <div className="h-28 sm:h-32 pt-[env(safe-area-inset-top)] pointer-events-none" aria-hidden="true" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-36 sm:pb-32 space-y-6 md:space-y-8">
        {/* Android App Download Banner - Automatically hidden once downloaded/installed */}
        <AndroidDownloadBanner />

        {/* Error notification banner if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => {
                loadWeather(currentLocation);
                loadDistrictsRain();
              }}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* B. Current Weather Section */}
        {weatherData ? (
          <CurrentWeather
            data={weatherData}
            onRefresh={() => loadWeather(currentLocation)}
            isLoading={isLoading}
            lang={lang}
            tempUnit={settings.tempUnit}
            pressureUnit={settings.pressureUnit}
            showAtmosphereAnimation={settings.showAtmosphereAnimation}
            isDefaultLocality={
              settings.defaultLocalityId === currentLocation.id ||
              settings.defaultLocation?.id === currentLocation.id ||
              Boolean(settings.startupLocationMode === 'default_locality' && settings.defaultLocalityName === currentLocation.name)
            }
            onSetDefaultLocality={() => handleSetDefaultLocality(currentLocation)}
          />
        ) : (
          <div className="h-44 rounded-2xl glass-panel animate-pulse flex items-center justify-center text-[#00AFCB] dark:text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* C. Karnataka Rain Monitor System (All 31 Districts Rain Probability Grid & Explorer) */}
        {districtsRainData.length > 0 && (
          <KarnatakaDistrictsRainGrid
            districts={districtsRainData}
            selectedLocation={currentLocation}
            onSelectDistrict={(loc) => handleSelectLocation(loc, true)}
            theme={theme}
          />
        )}

        {/* D. Karnataka Satellite Cloud and Doppler Precipitation Tracker */}
        <section className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00AFCB] animate-ping"></span>
              {t.satelliteMapTitle}
            </h2>
            <span className="text-xs text-[#526779] dark:text-slate-400">
              {t.satelliteMapSubtitle}
            </span>
          </div>

          <SatelliteMap
            currentLocation={currentLocation}
            weatherData={weatherData}
            onSelectLocation={(loc) => handleSelectLocation(loc, false)}
            theme={theme}
            lang={lang}
            defaultLayer={settings.defaultMapLayer}
            defaultOpacity={settings.defaultCloudOpacity}
            defaultShowPins={settings.showDistrictPinsOnLaunch}
            defaultOverlayRadar={settings.overlayRainRadarOverClouds}
          />
        </section>

        {/* E. Quick Weather Metrics */}
        {weatherData && (
          <WeatherMetrics
            current={weatherData.current}
            today={weatherData.daily[0]}
          />
        )}

        {/* F. Hourly Forecast (Scrollable) */}
        {weatherData && (
          <HourlyForecast hourly={weatherData.hourly} />
        )}

        {/* G. Seven-Day Synoptic Forecast */}
        {weatherData && (
          <DailyForecast daily={weatherData.daily} />
        )}

        {/* H. Detailed Weather Analysis Charts */}
        {weatherData && (
          <WeatherCharts hourly={weatherData.hourly} />
        )}

        {/* I. Dedicated Rainfall & Monsoon Monitoring */}
        {weatherData && (
          <MonsoonTracker weatherData={weatherData} />
        )}

        {/* J. IMD INSAT-3D/3DR Multi-Channel Imagery Observatory */}
        <INSATSatelliteViewer />

        {/* K. Weather Alerts & Meteorological Advisories */}
        <WeatherAlerts alerts={alerts} />

        {/* L. Data Information & Disclosures Footer */}
        <DataInfoFooter
          lastUpdated={weatherData?.lastUpdated ?? 'Syncing...'}
          isStale={weatherData?.isStale}
        />
      </main>

      {/* Fixed Glass Control Button (Tapping opens options: Theme, Refresh, Settings) */}
      <MobileActionBar
        theme={theme}
        setTheme={setTheme}
        onRefresh={() => {
          loadWeather(currentLocation);
          loadDistrictsRain();
        }}
        isLoading={isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        lang={lang}
        isSearchFocused={isSearchFocused}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        lang={lang}
        setLang={setLang}
        settings={settings}
        updateSettings={updateSettings}
        currentLocation={currentLocation}
        onResetLocationToKarnataka={() => {
          handleSelectLocation(DEFAULT_LOCATION);
          localStorage.setItem('skycast_user_location', JSON.stringify(DEFAULT_LOCATION));
        }}
      />

      {/* Bilingual AI Weather Assistant Modal (Gemini 3.8 Flash) */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        lang={lang}
        currentLocation={currentLocation}
        weatherData={weatherData}
        districtsRainData={districtsRainData}
        alerts={alerts}
      />
    </div>
  );
}

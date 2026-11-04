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
import { UserSettings, loadUserSettings, saveUserSettings } from './services/settingsService';
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
import { DynamicWeatherBackground } from './components/DynamicWeatherBackground';
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
        if (userSettings.defaultLocalityId) {
          const foundLoc = KARNATAKA_LOCALITIES.find((l) => l.id === userSettings.defaultLocalityId);
          if (foundLoc) return foundLoc;
        }
      }

      // If user configured fixed default district, start directly at that default district!
      if (userSettings.startupLocationMode === 'default_district') {
        if (userSettings.defaultDistrictId === 'karnataka-all') {
          return DEFAULT_LOCATION;
        }
        const found = ALL_KARNATAKA_DISTRICTS.find((d) => d.id === userSettings.defaultDistrictId);
        if (found) return found;
      }

      // If user prefers current live location, load cached position for this device if previously saved
      const cached = localStorage.getItem('skycast_user_location');
      if (cached) {
        return JSON.parse(cached);
      }

      // Fallback to user-saved default locality if previously explicitly chosen
      const savedLoc = localStorage.getItem('skycast_default_locality');
      if (savedLoc) {
        return JSON.parse(savedLoc);
      }

      // Fallback to user-saved default district if previously explicitly chosen
      const savedDefault = localStorage.getItem('skycast_default_district');
      if (savedDefault) {
        return JSON.parse(savedDefault);
      }
    } catch {}
    // Natural fallback: Whole Karnataka State Overview (id: 'karnataka-all')
    // No hardcoded single city/locality for all users!
    return DEFAULT_LOCATION;
  });

  // High-accuracy live GPS detection with two-tier fallback and distance change verification
  const detectLiveLocation = useCallback(
    (force = false) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;

      const handleSuccess = async (pos: GeolocationPosition) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          setCurrentLocation((prevLoc) => {
            const dist = Math.hypot(lat - prevLoc.latitude, lon - prevLoc.longitude);
            // If movement is negligible (< ~300m / 0.003 deg) and already has a specific location, avoid unnecessary refetch
            if (!force && dist < 0.003 && prevLoc.id !== 'karnataka-all' && !prevLoc.isEstimate) {
              return prevLoc;
            }

            // Reverse geocode the new coordinates
            reverseGeocodeLocation(lat, lon)
              .then((newLoc) => {
                setCurrentLocation(newLoc);
                try {
                  localStorage.setItem('skycast_user_location', JSON.stringify(newLoc));
                  localStorage.setItem('skycast_location_approved', 'true');
                } catch {}
              })
              .catch((err) => {
                console.warn('Reverse geocode error during live location detection:', err);
              });

            return prevLoc;
          });
        } catch (err) {
          console.warn('Live location processing error:', err);
        }
      };

      const handleError = (err: GeolocationPositionError) => {
        // If high accuracy times out (code 3), retry once with standard accuracy (cellular/Wi-Fi assisted)
        if (err.code === 3) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            (fallbackErr) => {
              console.log('Location unavailable after fallback:', fallbackErr.message);
            },
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 30000 }
          );
          return;
        }
        console.log('Location access not granted or unavailable:', err.message);
      };

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: force ? 0 : 15000,
      });
    },
    []
  );

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
      if (settings.defaultLocalityId) {
        const foundLoc = KARNATAKA_LOCALITIES.find((l) => l.id === settings.defaultLocalityId);
        if (foundLoc) {
          setCurrentLocation(foundLoc);
          return;
        }
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
    detectLiveLocation(true);
  }, [
    settings.startupLocationMode,
    settings.defaultDistrictId,
    settings.defaultLocalityId,
    settings.defaultLocation,
    settings.autoDetectLocation,
    detectLiveLocation,
  ]);

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

  // Theme state: dark mode as default when opening the web
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const sessionSaved = sessionStorage.getItem('skycast_theme');
      if (sessionSaved === 'light' || sessionSaved === 'dark') {
        return sessionSaved;
      }
    } catch {}
    // Whenever user opens the web, default to dark mode
    try {
      localStorage.setItem('skycast_theme', 'dark');
      sessionStorage.setItem('skycast_theme', 'dark');
    } catch {}
    return 'dark';
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
    try {
      localStorage.setItem('skycast_theme', tMode);
      sessionStorage.setItem('skycast_theme', tMode);
    } catch {}
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
    const liveInterval = settings.refreshInterval > 0
      ? setInterval(() => {
          if (!document.hidden) {
            console.log(`Auto-refreshing live telemetry (${settings.refreshInterval / 60000}m interval)...`);
            loadWeather(currentLocation);
            loadDistrictsRain();
          }
        }, settings.refreshInterval)
      : null;

    const handleAppWake = () => {
      if (!document.hidden) {
        // If user is in current location mode, check GPS to verify if user moved to a new village or town
        if (settings.startupLocationMode === 'current_location' && settings.autoDetectLocation) {
          detectLiveLocation(false);
        }

        if (settings.syncOnAppResume) {
          // If user was away for more than 2 minutes, immediately sync live values
          if (Date.now() - lastSyncTimestampRef.current > 120000) {
            loadWeather(currentLocation);
            loadDistrictsRain();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleAppWake);
    window.addEventListener('focus', handleAppWake);

    return () => {
      if (liveInterval) clearInterval(liveInterval);
      document.removeEventListener('visibilitychange', handleAppWake);
      window.removeEventListener('focus', handleAppWake);
    };
  }, [
    currentLocation,
    loadWeather,
    loadDistrictsRain,
    settings.refreshInterval,
    settings.syncOnAppResume,
    settings.startupLocationMode,
    settings.autoDetectLocation,
    detectLiveLocation,
  ]);

  // Handle location selection (only scrolls to top for search/grid, never for map pin clicks)
  const handleSelectLocation = (loc: LocationData, shouldScrollToTop: boolean = false) => {
    setCurrentLocation(loc);
    try {
      localStorage.setItem('skycast_user_location', JSON.stringify(loc));
    } catch {}
    if (shouldScrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showHeader();
    }
  };

  return (
    <div className="min-h-screen app-ambient-background text-[#0F1D2E] dark:text-slate-100 flex flex-col font-body font-normal transition-colors duration-200 relative overflow-x-hidden">
      {/* Dynamic Live Weather-Based Fixed Background (Rainy, Cloudy, Sunny, Night) */}
      <DynamicWeatherBackground
        weather={weatherData}
        theme={theme}
      />

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
            onRefresh={() => {
              loadWeather(currentLocation);
            }}
            isLoading={isLoading}
            lang={lang}
            tempUnit={settings.tempUnit}
            pressureUnit={settings.pressureUnit}
            showAtmosphereAnimation={settings.showAtmosphereAnimation}
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
        <section className="!mt-0.5 sm:!mt-1 space-y-0.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 px-1 pb-0.5">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#172B3A] dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00AFCB] animate-ping"></span>
              {t.satelliteMapTitle}
            </h2>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
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
          <div className="!mt-0.5 sm:!mt-1">
            <WeatherMetrics
              current={weatherData.current}
              today={weatherData.daily[0]}
            />
          </div>
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

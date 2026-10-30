export type Language = 'en' | 'kn';

export interface Translations {
  appName: string;
  appSubtitle: string;
  searchPlaceholder: string;
  quickPillsLabel: string;
  live: string;
  updated: string;
  controls: string;
  controlCenter: string;
  theme: string;
  darkTheme: string;
  lightTheme: string;
  refresh: string;
  syncing: string;
  settings: string;
  platformSettings: string;
  settingsSubtitle: string;
  language: string;
  selectLanguage: string;
  english: string;
  kannada: string;
  feelsLike: string;
  high: string;
  low: string;
  rainProb: string;
  sunrise: string;
  sunset: string;
  humidity: string;
  wind: string;
  barometer: string;
  cloudCover: string;
  elevation: string;
  rainMonitorTitle: string;
  rainMonitorSubtitle: string;
  satelliteMapTitle: string;
  satelliteMapSubtitle: string;
  fitKarnataka: string;
  pins31: string;
  layers: string;
  hourlyTitle: string;
  dailyTitle: string;
  chartsTitle: string;
  monsoonTitle: string;
  close: string;
  allDistricts: string;
  karnatakaState: string;
  expectedRain: string;
  temperatureSpan: string;
  condition: string;
  districtSelected: string;
  highRain: string;
  moderateRain: string;
  scatteredRain: string;
  // Map specific
  cloudsLayerTitle: string;
  cloudsLayerDesc: string;
  radarLayerTitle: string;
  radarLayerDesc: string;
  opticalLayerTitle: string;
  opticalLayerDesc: string;
  cloudOpacityLabel: string;
  overlayRainRadar: string;
  visibleCloudsTag: string;
  dopplerRadarTag: string;
  terrainTag: string;
  shareTitle: string;
  shareDesc: string;
  copyLink: string;
  copied: string;
  officialDataProviders: string;

  // New settings categories
  sectionWeatherAlerts: string;
  severeAlertsDesc: string;
  rainAlertsDesc: string;
  alertSoundDesc: string;

  sectionUnits: string;
  temperatureUnit: string;
  windSpeedUnit: string;
  precipitationUnit: string;
  pressureUnit: string;

  sectionLocation: string;
  currentLocationLabel: string;
  defaultKarnatakaDesc: string;
  resetToKarnataka: string;
  autoDetectGPS: string;

  sectionMapControls: string;
  defaultMapLayer: string;
  pins31OnLaunch: string;
  radarOverlayDefault: string;

  sectionAppearance: string;
  atmosphereAnimationDesc: string;

  sectionAutoRefresh: string;
  refreshIntervalLabel: string;
  syncOnResumeDesc: string;
  lowDataModeDesc: string;

  // Startup location & fullscreen translations
  startupMode: string;
  startupCurrentGPS: string;
  startupDefaultDistrict: string;
  defaultDistrictLabel: string;
  setAsDefaultDistrict: string;
  defaultDistrictSaved: string;
  fullscreenMap: string;
  exitFullscreen: string;

  // AI Assistant translations
  aiAssistant: string;
  askAI: string;
  aiAssistantDesc: string;
  liveVoiceMode: string;
  speakReplies: string;
  typePromptPlaceholder: string;
  listening: string;
  speaking: string;
  tapToSpeak: string;
  aiDisclaimer: string;
  samplePrompt1: string;
  samplePrompt2: string;
  samplePrompt3: string;
  samplePrompt4: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'SkyCast',
    appSubtitle: 'All 31 Districts Rain & Satellite Radar',
    searchPlaceholder: 'Search any Karnataka district or Indian city...',
    quickPillsLabel: 'Karnataka:',
    live: 'LIVE',
    updated: 'Updated',
    controls: 'Controls',
    controlCenter: 'SkyCast Control Center',
    theme: 'Display Theme',
    darkTheme: 'Midnight Dark',
    lightTheme: 'Clean Daylight',
    refresh: 'Refresh',
    syncing: 'Syncing...',
    settings: 'Settings',
    platformSettings: 'Platform Settings & Preferences',
    settingsSubtitle: 'Configure Alerts, Units, Location, Map & Telemetry',
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English (Default)',
    kannada: 'ಕನ್ನಡ (Kannada)',
    feelsLike: 'Feels like',
    high: 'High',
    low: 'Low',
    rainProb: 'Rain Prob',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    humidity: 'Humidity',
    wind: 'Wind',
    barometer: 'Barometer',
    cloudCover: 'Cloud Cover',
    elevation: 'Elevation',
    rainMonitorTitle: 'Karnataka Rain Monitor System',
    rainMonitorSubtitle: 'All 31 District Rain Probability Grid & Live Synoptic Radar',
    satelliteMapTitle: 'Karnataka Satellite Cloud & Doppler Precipitation Tracker',
    satelliteMapSubtitle: 'Whole State Default View • All 31 District Rain Probability Overlays',
    fitKarnataka: 'Fit Karnataka',
    pins31: '31 Pins',
    layers: 'Layers',
    hourlyTitle: 'Hourly Weather Forecast (Next 48 Hours)',
    dailyTitle: 'Seven-Day Synoptic Weather Forecast',
    chartsTitle: 'Detailed Weather Analysis & Atmospheric Trends',
    monsoonTitle: 'Dedicated Karnataka Rainfall & Monsoon Observatory',
    close: 'Close',
    allDistricts: 'All 31 Districts',
    karnatakaState: 'Karnataka',
    expectedRain: 'Expected 24h Rain',
    temperatureSpan: 'Temperature Span',
    condition: 'Condition',
    districtSelected: '✓ District Selected in Dashboard',
    highRain: 'High Rain (≥ 60%)',
    moderateRain: 'Moderate Chance (30%–59%)',
    scatteredRain: 'Scattered (< 30%)',
    // Map specific
    cloudsLayerTitle: 'Live Satellite Cloud Formations',
    cloudsLayerDesc: 'Clearly visible real-time scattered cloud formations, cloud banks & Doppler precipitation radar',
    radarLayerTitle: 'Live Doppler Rain Radar',
    radarLayerDesc: 'Real-time Doppler precipitation echoes & monsoon rain tracker over Karnataka satellite map',
    opticalLayerTitle: 'High-Res Optical Satellite',
    opticalLayerDesc: 'Natural optical true-color satellite imagery showing Karnataka terrain & Western Ghats',
    cloudOpacityLabel: 'Satellite Cloud Opacity',
    overlayRainRadar: 'Overlay Rain Radar Echoes',
    visibleCloudsTag: 'VISIBLE CLOUDS',
    dopplerRadarTag: 'DOPPLER RADAR',
    terrainTag: 'TERRAIN',
    shareTitle: 'Share SkyCast Web App',
    shareDesc: 'Share SkyCast with fellow Karnataka residents, farmers, travelers, and meteorology enthusiasts.',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    officialDataProviders: 'Official Data Providers',

    // New Settings
    sectionWeatherAlerts: 'Weather Alerts & Notifications',
    severeAlertsDesc: 'Severe Meteorological Advisories (IMD Warnings)',
    rainAlertsDesc: 'District High Rain Alert (Probability ≥ 60%)',
    alertSoundDesc: 'Alert Audio Tone & Vibration',

    sectionUnits: 'Measurement Units',
    temperatureUnit: 'Temperature',
    windSpeedUnit: 'Wind Speed',
    precipitationUnit: 'Precipitation',
    pressureUnit: 'Atmospheric Pressure',

    sectionLocation: 'Location Management',
    currentLocationLabel: 'Currently Active Location',
    defaultKarnatakaDesc: 'Default: Whole State of Karnataka (All 31 Districts)',
    resetToKarnataka: 'Reset to Whole Karnataka Default',
    autoDetectGPS: 'Detect Location Automatically on Startup',

    sectionMapControls: 'Satellite Map Controls',
    defaultMapLayer: 'Default Map Layer',
    pins31OnLaunch: 'Display All 31 District Pins on Launch',
    radarOverlayDefault: 'Auto-Overlay Live Rain Radar on Clouds',

    sectionAppearance: 'Appearance & Display Options',
    atmosphereAnimationDesc: 'Living Realistic Atmosphere Animations (Rain, Sunshine, Clouds)',

    sectionAutoRefresh: 'Automatic Refresh & Data Telemetry',
    refreshIntervalLabel: 'Live Sync Telemetry Interval',
    syncOnResumeDesc: 'Auto-Sync when App Opens or Browser Tab Becomes Active',
    lowDataModeDesc: 'Low Data Mode (Optimizes bandwidth for mobile data)',

    // Startup location & fullscreen
    startupMode: 'App Startup Location',
    startupCurrentGPS: 'Live Current Location (GPS)',
    startupDefaultDistrict: 'Fixed Default District',
    defaultDistrictLabel: 'Choose Default District',
    setAsDefaultDistrict: 'Set Current Location as My Default District',
    defaultDistrictSaved: 'Default District Saved!',
    fullscreenMap: 'Full Screen Map',
    exitFullscreen: 'Exit Fullscreen',

    // AI Assistant
    aiAssistant: 'SkyCast AI Assistant',
    askAI: 'Ask AI',
    aiAssistantDesc: 'Bilingual weather intelligence grounded in live Karnataka satellite & radar telemetry',
    liveVoiceMode: 'Live Voice Conversation',
    speakReplies: 'Speak Replies Aloud',
    typePromptPlaceholder: 'Ask in English or ಕನ್ನಡ (e.g. Will it rain in Udupi?)...',
    listening: 'Listening to your voice...',
    speaking: 'Speaking response...',
    tapToSpeak: 'Tap to speak',
    aiDisclaimer: 'Powered by Gemini 3.8 Flash • Real-time SkyCast Grounded',
    samplePrompt1: 'Which Karnataka districts have high rain today?',
    samplePrompt2: 'Current weather condition & rain chance here?',
    samplePrompt3: 'How are the monsoon clouds moving across Karnataka?',
    samplePrompt4: 'Will it rain in Bengaluru or Tumakuru this evening?',
  },
  kn: {
    appName: 'ಸ್ಕೈಕಾಸ್ಟ್ (SkyCast)',
    appSubtitle: 'ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ ಮತ್ತು ಉಪಗ್ರಹ ರೇಡಾರ್',
    searchPlaceholder: 'ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆ ಅಥವಾ ನಗರ ಹುಡುಕಿ...',
    quickPillsLabel: 'ಕರ್ನಾಟಕ:',
    live: 'ನೇರ ಪ್ರಸಾರ (LIVE)',
    updated: 'ನವೀಕರಿಸಲಾಗಿದೆ',
    controls: 'ನಿಯಂತ್ರಣಗಳು',
    controlCenter: 'ಸ್ಕೈಕಾಸ್ಟ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ',
    theme: 'ಪ್ರದರ್ಶನ ಥೀಮ್',
    darkTheme: 'ಕತ್ತಲೆ (Dark)',
    lightTheme: 'ಬೆಳಕು (Light)',
    refresh: 'ನವೀಕರಿಸಿ',
    syncing: 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    platformSettings: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಆದ್ಯತೆಗಳು',
    settingsSubtitle: 'ಎಚ್ಚರಿಕೆಗಳು, ಘಟಕಗಳು, ಸ್ಥಳ ಮತ್ತು ಉಪಗ್ರಹ ನಕ್ಷೆ ಕಾನ್ಫಿಗರ್ ಮಾಡಿ',
    language: 'ಭಾಷೆ (Language)',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ (Select Language)',
    english: 'English (ಇಂಗ್ಲಿಷ್)',
    kannada: 'ಕನ್ನಡ (Kannada)',
    feelsLike: 'ಅನುಭವವಾಗುವ ತಾಪಮಾನ',
    high: 'ಗರಿಷ್ಠ',
    low: 'ಕನಿಷ್ಠ',
    rainProb: 'ಮಳೆಯ ಸಾಧ್ಯತೆ',
    sunrise: 'ಸೂರ್ಯೋದಯ',
    sunset: 'ಸೂರ್ಯಾಸ್ತ',
    humidity: 'ಆರ್ದ್ರತೆ',
    wind: 'ಗಾಳಿಯ ವೇಗ',
    barometer: 'ವಾಯುಭಾರ',
    cloudCover: 'ಮೋಡದ ಪ್ರಮಾಣ',
    elevation: 'ಎತ್ತರ',
    rainMonitorTitle: 'ಕರ್ನಾಟಕ ಮಳೆ ಮುನ್ಸೂಚನೆ ಮಾನಿಟರ್',
    rainMonitorSubtitle: 'ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ ಸಂಭವನೀಯತೆ ಗ್ರಿಡ್ ಮತ್ತು ರೇಡಾರ್',
    satelliteMapTitle: 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ಮೋಡ ಮತ್ತು ಡಾಪ್ಲರ್ ಮಳೆ ಟ್ರ್ಯಾಕರ್',
    satelliteMapSubtitle: 'ಸಂಪೂರ್ಣ ರಾಜ್ಯ ವೀಕ್ಷಣೆ • ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ ವಿವರ',
    fitKarnataka: 'ಕರ್ನಾಟಕ ವೀಕ್ಷಣೆ',
    pins31: '31 ಜಿಲ್ಲಾ ಪಿನ್‌ಗಳು',
    layers: 'ಲೇಯರ್‌ಗಳು',
    hourlyTitle: 'ಮುಂದಿನ 48 ಗಂಟೆಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    dailyTitle: '7 ದಿನಗಳ ಸಮಗ್ರ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
    chartsTitle: 'ವಿವರವಾದ ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ನಕ್ಷೆಗಳು',
    monsoonTitle: 'ಕರ್ನಾಟಕ ಮುಂಗಾರು ಮತ್ತು ಮಳೆ ಮಾನಿಟರಿಂಗ್ ವ್ಯವಸ್ಥೆ',
    close: 'ಮುಚ್ಚಿ',
    allDistricts: 'ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳು',
    karnatakaState: 'ಕರ್ನಾಟಕ',
    expectedRain: 'ನಿರೀಕ್ಷಿತ 24 ಗಂಟೆ ಮಳೆ',
    temperatureSpan: 'ತಾಪಮಾನ ವ್ಯಾಪ್ತಿ',
    condition: 'ಹವಾಮಾನ ಸ್ಥಿತಿ',
    districtSelected: '✓ ಜಿಲ್ಲೆ ಆಯ್ಕೆಯಾಗಿದೆ',
    highRain: 'ಭಾರೀ ಮಳೆ (≥ 60%)',
    moderateRain: 'ಸಾಧಾರಣ ಮಳೆ (30%–59%)',
    scatteredRain: 'ಚದುರಿದ ಮಳೆ (< 30%)',
    // Map specific
    cloudsLayerTitle: 'ನೇರ ಉಪಗ್ರಹ ಮೋಡ ರಚನೆಗಳು',
    cloudsLayerDesc: 'ನೈಜ-ಸಮಯದ ಚದುರಿದ ಮೋಡಗಳು, ಮೋಡಗಳ ರಾಶಿ ಮತ್ತು ಡಾಪ್ಲರ್ ಮಳೆ ರೇಡಾರ್',
    radarLayerTitle: 'ನೇರ ಡಾಪ್ಲರ್ ಮಳೆ ರೇಡಾರ್',
    radarLayerDesc: 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ ನೈಜ-ಸಮಯದ ಮಳೆ ಮತ್ತು ಮಾನ್ಸೂನ್ ಟ್ರ್ಯಾಕರ್',
    opticalLayerTitle: 'ಹೈ-ರೆಸ್ ಆಪ್ಟಿಕಲ್ ಉಪಗ್ರಹ',
    opticalLayerDesc: 'ಕರ್ನಾಟಕದ ಭೂಪ್ರದೇಶ ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟಗಳನ್ನು ತೋರಿಸುವ ನೈಸರ್ಗಿಕ ಉಪಗ್ರಹ ಚಿತ್ರಣ',
    cloudOpacityLabel: 'ಉಪಗ್ರಹ ಮೋಡದ ಅಪಾರದರ್ಶಕತೆ',
    overlayRainRadar: 'ಮಳೆ ರೇಡಾರ್ ಎಕೋಗಳನ್ನು ತೋರಿಸಿ',
    visibleCloudsTag: 'ಗೋಚರಿಸುವ ಮೋಡಗಳು',
    dopplerRadarTag: 'ಡಾಪ್ಲರ್ ರೇಡಾರ್',
    terrainTag: 'ಭೂಪ್ರದೇಶ',
    shareTitle: 'ಸ್ಕೈಕಾಸ್ಟ್ ವೆಬ್ ಆ್ಯಪ್ ಹಂಚಿಕೊಳ್ಳಿ',
    shareDesc: 'ಕರ್ನಾಟಕದ ರೈತರು, ಪ್ರವಾಸಿಗರು ಮತ್ತು ನಾಗರಿಕರೊಂದಿಗೆ ಸ್ಕೈಕಾಸ್ಟ್ ಹಂಚಿಕೊಳ್ಳಿ.',
    copyLink: 'ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ',
    copied: 'ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!',
    officialDataProviders: 'ಅಧಿಕೃತ ಹವಾಮಾನ ಮೂಲಗಳು',

    // New Settings in Kannada
    sectionWeatherAlerts: 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಪ್ರಕಟಣೆಗಳು',
    severeAlertsDesc: 'ತೀವ್ರ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು (IMD ಮುನ್ಸೂಚನೆಗಳು)',
    rainAlertsDesc: 'ಜಿಲ್ಲಾ ಭಾರೀ ಮಳೆ ಎಚ್ಚರಿಕೆ (ಸಂಭವನೀಯತೆ ≥ 60%)',
    alertSoundDesc: 'ಎಚ್ಚರಿಕೆ ಧ್ವನಿ ಮತ್ತು ಕಂಪನ',

    sectionUnits: 'ಮಾಪನ ಘಟಕಗಳು',
    temperatureUnit: 'ತಾಪಮಾನ',
    windSpeedUnit: 'ಗಾಳಿಯ ವೇಗ',
    precipitationUnit: 'ಮಳೆಯ ಪ್ರಮಾಣ',
    pressureUnit: 'ವಾತಾವರಣದ ಒತ್ತಡ',

    sectionLocation: 'ಸ್ಥಳ ನಿರ್ವಹಣೆ',
    currentLocationLabel: 'ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಸ್ಥಳ',
    defaultKarnatakaDesc: 'ಡೀಫಾಲ್ಟ್: ಇಡೀ ಕರ್ನಾಟಕ ರಾಜ್ಯ (31 ಜಿಲ್ಲೆಗಳು)',
    resetToKarnataka: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಡೀಫಾಲ್ಟ್‌ಗೆ ಮರುಹೊಂದಿಸಿ',
    autoDetectGPS: 'ಆರಂಭದಲ್ಲಿ ಸ್ಥಳ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಮಾಡಿ',

    sectionMapControls: 'ಉಪಗ್ರಹ ನಕ್ಷೆ ನಿಯಂತ್ರಣಗಳು',
    defaultMapLayer: 'ಡೀಫಾಲ್ಟ್ ನಕ್ಷೆ ಲೇಯರ್',
    pins31OnLaunch: 'ಆರಂಭದಲ್ಲಿ ಎಲ್ಲಾ 31 ಜಿಲ್ಲಾ ಪಿನ್‌ಗಳನ್ನು ತೋರಿಸಿ',
    radarOverlayDefault: 'ಮೋಡಗಳ ಮೇಲೆ ಲೈವ್ ರೇಡಾರ್ ಓವರ್‌ಲೇ ಮಾಡಿ',

    sectionAppearance: 'ಗೋಚರತೆ ಮತ್ತು ವಾತಾವರಣ',
    atmosphereAnimationDesc: 'ನೈಜ ವಾತಾವರಣ ಅನಿಮೇಷನ್‌ಗಳು (ಮಳೆ, ಬಿಸಿಲು, ಮೋಡಗಳು)',

    sectionAutoRefresh: 'ಸ್ವಯಂಚಾಲಿತ ರಿಫ್ರೆಶ್ ಮತ್ತು ಡೇಟಾ',
    refreshIntervalLabel: 'ಲೈವ್ ಡೇಟಾ ರಿಫ್ರೆಶ್ ಮಧ್ಯಂತರ',
    syncOnResumeDesc: 'ಆ್ಯಪ್ ತೆರೆದಾಗ ಅಥವಾ ಸಕ್ರಿಯಗೊಂಡಾಗ ಆಟೋ-ಸಿಂಕ್',
    lowDataModeDesc: 'ಕಡಿಮೆ ಡೇಟಾ ಬಳಕೆ ಮೋಡ್',

    // Startup location & fullscreen in Kannada
    startupMode: 'ಆ್ಯಪ್ ಪ್ರಾರಂಭ ಸ್ಥಳ (Startup Location)',
    startupCurrentGPS: 'ಲೈವ್ ಪ್ರಸ್ತುತ ಸ್ಥಳ (GPS)',
    startupDefaultDistrict: 'ನಿಗದಿತ ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ',
    defaultDistrictLabel: 'ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ ಆಯ್ಕೆಮಾಡಿ',
    setAsDefaultDistrict: 'ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆಯಾಗಿ ಹೊಂದಿಸಿ',
    defaultDistrictSaved: 'ಡೀಫಾಲ್ಟ್ ಜಿಲ್ಲೆ ಉಳಿಸಲಾಗಿದೆ!',
    fullscreenMap: 'ಪೂರ್ಣ ಪರದೆ ನಕ್ಷೆ (Full Screen)',
    exitFullscreen: 'ಪೂರ್ಣ ಪರದೆಯಿಂದ ನಿರ್ಗಮಿಸಿ (Exit Fullscreen)',

    // AI Assistant in Kannada
    aiAssistant: 'ಸ್ಕೈಕಾಸ್ಟ್ ಎಐ ಸಹಾಯಕ (AI Assistant)',
    askAI: 'ಎಐ ಕೇಳಿ (Ask AI)',
    aiAssistantDesc: 'ಕರ್ನಾಟಕದ ಉಪಗ್ರಹ ಮತ್ತು ಡಾಪ್ಲರ್ ರೇಡಾರ್ ಡೇಟಾ ಆಧಾರಿತ ದ್ವಿಭಾಷಾ ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ',
    liveVoiceMode: 'ನೈಜ ಧ್ವನಿ ಸಂವಾದ (Live Voice)',
    speakReplies: 'ಧ್ವನಿ ಓದುವಿಕೆ (Speak Replies)',
    typePromptPlaceholder: 'ಕನ್ನಡ ಅಥವಾ English ನಲ್ಲಿ ಕೇಳಿ (ಉದಾ: ಇಂದು ಉಡುಪಿಯಲ್ಲಿ ಮಳೆಯಾಗಲಿದೆಯೇ?)...',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...',
    speaking: 'ಧ್ವನಿಯಲ್ಲಿ ಉತ್ತರಿಸುತ್ತಿದೆ...',
    tapToSpeak: 'ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    aiDisclaimer: 'ಜೆಮಿನಿ 3.8 ಫ್ಲ್ಯಾಶ್ ಚಾಲಿತ • ನೈಜ-ಸಮಯದ ಸ್ಕೈಕಾಸ್ಟ್ ಡೇಟಾ ಆಧಾರಿತ',
    samplePrompt1: 'ಇಂದು ಕರ್ನಾಟಕದ ಯಾವ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆಯಾಗಲಿದೆ?',
    samplePrompt2: 'ಪ್ರಸ್ತುತ ಸ್ಥಳದ ಹವಾಮಾನ ಸ್ಥಿತಿ ಮತ್ತು ಮಳೆಯ ಸಂಭವನೀಯತೆ ಏನು?',
    samplePrompt3: 'ಕರ್ನಾಟಕದಾದ್ಯಂತ ಮಾನ್ಸೂನ್ ಮೋಡಗಳ ಚಲನೆ ಹೇಗಿದೆ?',
    samplePrompt4: 'ಇಂದು ಸಂಜೆ ಬೆಂಗಳೂರು ಅಥವಾ ತುಮಕೂರಿನಲ್ಲಿ ಮಳೆಯಾಗುತ್ತದೆಯೇ?',
  },
};

// Weather description translations into Kannada
export const WEATHER_DESC_KANNADA: Record<string, string> = {
  'Clear Sky': 'ಶುಭ್ರ ಆಕಾಶ',
  'Clear sky': 'ಶುಭ್ರ ಆಕಾಶ',
  'Mainly Clear': 'ಹೆಚ್ಚಾಗಿ ಶುಭ್ರ ಆಕಾಶ',
  'Mainly clear': 'ಹೆಚ್ಚಾಗಿ ಶುಭ್ರ ಆಕಾಶ',
  'Partly Cloudy': 'ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ',
  'Partly cloudy': 'ಭಾಗಶಃ ಮೋಡ ಕವಿದಿದೆ',
  'Overcast': 'ದಟ್ಟ ಮೋಡ ಕವಿದ ವಾತಾವರಣ',
  'Fog': 'ಮಂಜು ಕವಿದಿದೆ',
  'Foggy': 'ಮಂಜು ಕವಿದಿದೆ',
  'Depositing Rime Fog': 'ದಟ್ಟ ಮಂಜು',
  'Light Drizzle': 'ತುಂತುರು ಮಳೆ',
  'Moderate Drizzle': 'ಸಾಧಾರಣ ತುಂತುರು ಮಳೆ',
  'Dense Drizzle': 'ಭಾರೀ ತುಂತುರು ಮಳೆ',
  'Slight Rain': 'ಹಗುರ ಮಳೆ',
  'Moderate Rain': 'ಸಾಧಾರಣ ಮಳೆ',
  'Heavy Rain': 'ಭಾರೀ ಮಳೆ',
  'Light Freezing Rain': 'ಶೀತಲ ಹಗುರ ಮಳೆ',
  'Heavy Freezing Rain': 'ಶೀತಲ ಭಾರೀ ಮಳೆ',
  'Slight Snow': 'ಹಗುರ ಹಿಮಪಾತ',
  'Moderate Snow': 'ಸಾಧಾರಣ ಹಿಮಪಾತ',
  'Heavy Snow': 'ಭಾರೀ ಹಿಮಪಾತ',
  'Slight Rain Showers': 'ಹಗುರ ಮಳೆ ಸಿಂಚನ',
  'Moderate Rain Showers': 'ಸಾಧಾರಣ ಮಳೆ ಸಿಂಚನ',
  'Violent Rain Showers': 'ಭಾರೀ ಮಳೆ ಸುರಿಮಳೆ',
  'Thunderstorm': 'ಗುಡುಗು ಸಹಿತ ಮಳೆ',
  'Thunderstorm with Slight Hail': 'ಆಲಿಕಲ್ಲು ಸಹಿತ ಗುಡುಗು ಮಳೆ',
  'Thunderstorm with Heavy Hail': 'ಭಾರೀ ಆಲಿಕಲ್ಲು ಸಹಿತ ಗುಡುಗು ಮಳೆ',
};

// Translate weather description if in Kannada
export function translateWeatherDesc(desc: string, lang: Language): string {
  if (lang === 'en') return desc;
  const cleaned = desc.replace(/\s*\(\s*Offline Mode\s*\)/gi, '').trim();
  return WEATHER_DESC_KANNADA[cleaned] || cleaned;
}

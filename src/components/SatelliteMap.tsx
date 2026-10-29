import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import {
  LocationData,
  WeatherData,
  DistrictRainData,
} from '../types/weather';
import {
  fetchSatelliteRadarFrames,
  getNasaGibsTileUrl,
  getGibsDateString,
} from '../services/satelliteService';
import { fetchAllKarnatakaDistrictsRain } from '../services/weatherService';
import { KARNATAKA_BOUNDARY_COORDS, KARNATAKA_BOUNDS } from '../services/karnatakaBoundary';
import { Language, TRANSLATIONS } from '../services/languageService';
import {
  Maximize2,
  Minimize2,
  Layers,
  MapPin,
  Clock,
  CloudRain,
  Droplets,
  RotateCcw,
  Check,
  X,
  Satellite,
  Eye,
  Sliders,
} from 'lucide-react';

interface SatelliteMapProps {
  currentLocation: LocationData;
  weatherData?: WeatherData | null;
  onSelectLocation?: (loc: LocationData) => void;
  theme?: 'dark' | 'light';
  lang?: Language;
  defaultLayer?: CleanMapLayer;
  defaultOpacity?: number;
  defaultShowPins?: boolean;
  defaultOverlayRadar?: boolean;
  className?: string;
}

// 3 Stable, Error-Free Map Layers (Night Infrared removed as requested)
export type CleanMapLayer = 'clouds_satellite' | 'radar_rain' | 'satellite_pure';

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  currentLocation,
  onSelectLocation,
  theme = 'dark',
  lang = 'en',
  defaultLayer = 'clouds_satellite',
  defaultOpacity = 0.9,
  defaultShowPins = true,
  defaultOverlayRadar = true,
  className = '',
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const cloudTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryPolygonRef = useRef<L.Polygon | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const districtMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<CleanMapLayer>(defaultLayer);
  const [layerOpacity, setLayerOpacity] = useState<number>(defaultOpacity);
  const [showRadarOverClouds, setShowRadarOverClouds] = useState<boolean>(defaultOverlayRadar);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showDistrictRainPins, setShowDistrictRainPins] = useState<boolean>(defaultShowPins);
  const [districtsRainData, setDistrictsRainData] = useState<DistrictRainData[]>([]);
  const [latestRadarPath, setLatestRadarPath] = useState<string>('');
  const [tileHost, setTileHost] = useState<string>('https://tilecache.rainviewer.com');
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Live');

  // Fit Karnataka completely and correctly inside the container
  const fitKarnataka = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize();
    map.fitBounds(KARNATAKA_BOUNDS, {
      padding: [16, 16],
      maxZoom: 7.2,
      animate: false,
    });
  }, []);

  // Fetch real-time live radar metadata
  const loadRadarMetadata = useCallback(async () => {
    try {
      const data = await fetchSatelliteRadarFrames();
      setTileHost(data.host || 'https://tilecache.rainviewer.com');
      const radarFrames = data.frames.filter((f) => f.path && f.path.startsWith('/v2/radar/'));
      if (radarFrames.length > 0) {
        const latest = radarFrames[radarFrames.length - 1];
        setLatestRadarPath(latest.path);
        setLastRefreshedTime(latest.formattedTime);
      } else if (data.frames.length > 0) {
        const latest = data.frames[data.frames.length - 1];
        setLatestRadarPath(latest.path);
        setLastRefreshedTime(latest.formattedTime);
      }
    } catch (err) {
      console.warn('Radar metadata error:', err);
    }
  }, []);

  // Fetch rain probability telemetry for all 31 Karnataka districts
  const loadKarnatakaDistricts = useCallback(async () => {
    try {
      const data = await fetchAllKarnatakaDistrictsRain();
      setDistrictsRainData(data);
    } catch (err) {
      console.error('Error fetching Karnataka district rain telemetry:', err);
    }
  }, []);

  useEffect(() => {
    loadRadarMetadata();
    loadKarnatakaDistricts();
    const interval = setInterval(() => {
      loadRadarMetadata();
      loadKarnatakaDistricts();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRadarMetadata, loadKarnatakaDistricts]);

  // Initialize Leaflet Map:
  // - No zoom controls, no manual zooming, no wheel-zoom so users scroll correctly on the page
  // - Container has touch-action: pan-y for smooth native page scrolling
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    container.style.touchAction = 'pan-y';

    const map = L.map(container, {
      center: [14.85, 75.85],
      zoom: 6.8,
      minZoom: 5.5,
      maxZoom: 9,
      zoomControl: false, // Removed zooming functions
      scrollWheelZoom: false, // Disabled manual zooming; wheel scrolls page naturally
      doubleClickZoom: false, // Disabled double-click zoom
      touchZoom: false, // Disabled touch pinch-zoom; gestures scroll page
      boxZoom: false,
      keyboard: false,
      dragging: !L.Browser.mobile, // On mobile, disable map dragging so single-finger swipes scroll the page smoothly
      attributionControl: false,
    });

    // 1. High-Res Optical Satellite Base Tile Layer (ArcGIS World Imagery)
    const baseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        subdomains: ['server', 'services'],
      }
    ).addTo(map);
    baseTileLayerRef.current = baseLayer;

    // 2. Karnataka State Light Border Outline
    const boundaryPolygon = L.polygon(KARNATAKA_BOUNDARY_COORDS, {
      color: '#00AFCB',
      weight: 2.2,
      opacity: 0.95,
      fill: true,
      fillColor: '#00AFCB',
      fillOpacity: 0.04,
      dashArray: '5, 5',
    }).addTo(map);
    boundaryPolygonRef.current = boundaryPolygon;

    // 3. District markers layer group
    const districtGroup = L.layerGroup().addTo(map);
    districtMarkersLayerRef.current = districtGroup;

    mapInstanceRef.current = map;

    // Fit Karnataka completely inside the window
    setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(KARNATAKA_BOUNDS, {
        padding: [16, 16],
        maxZoom: 7.2,
        animate: false,
      });
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
      map.fitBounds(KARNATAKA_BOUNDS, {
        padding: [16, 16],
        maxZoom: 7.2,
        animate: false,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Cloud Formations & Radar Overlays (Vivid, Clearly Visible Clouds)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up previous overlay layers
    if (cloudTileLayerRef.current) {
      map.removeLayer(cloudTileLayerRef.current);
      cloudTileLayerRef.current = null;
    }
    if (radarTileLayerRef.current) {
      map.removeLayer(radarTileLayerRef.current);
      radarTileLayerRef.current = null;
    }

    const todayDate = getGibsDateString(0);
    const yesterdayDate = getGibsDateString(1);

    // 1. LIVE CLOUD FORMATIONS (TrueColor Optical Satellite Clouds)
    if (activeLayer === 'clouds_satellite') {
      const cloudUrl = getNasaGibsTileUrl('VIIRS_SNPP', todayDate);

      const cloudLayer = L.tileLayer(cloudUrl, {
        maxNativeZoom: 9,
        maxZoom: 18,
        minZoom: 4,
        opacity: layerOpacity,
        tileSize: 256,
      });

      // Gracefully fallback to yesterday's cloud pass if today's orbit is still processing
      cloudLayer.on('tileerror', (e) => {
        const img = (e as any).tile as HTMLImageElement;
        if (img && !img.dataset.retried) {
          img.dataset.retried = 'true';
          img.src = img.src.replace(todayDate, yesterdayDate);
        }
      });

      cloudLayer.addTo(map);
      cloudTileLayerRef.current = cloudLayer;

      // Also overlay live RainViewer radar precipitation over the clouds if toggled
      if (showRadarOverClouds && latestRadarPath) {
        const radarUrl = `${tileHost}${latestRadarPath}/256/{z}/{x}/{y}/2/1_1.png`;
        const radarLayer = L.tileLayer(radarUrl, {
          maxNativeZoom: 12,
          maxZoom: 18,
          minZoom: 4,
          opacity: 0.9,
          tileSize: 256,
        }).addTo(map);
        radarTileLayerRef.current = radarLayer;
      }
    }

    // 2. PURE LIVE DOPPLER RAIN RADAR
    else if (activeLayer === 'radar_rain') {
      const radarPath = latestRadarPath || '/v2/radar/bc219f2d9518';
      const radarUrl = `${tileHost}${radarPath}/256/{z}/{x}/{y}/2/1_1.png`;

      const radarLayer = L.tileLayer(radarUrl, {
        maxNativeZoom: 12,
        maxZoom: 18,
        minZoom: 4,
        opacity: layerOpacity,
        tileSize: 256,
      }).addTo(map);

      radarTileLayerRef.current = radarLayer;
    }

    // 3. PURE SATELLITE (No cloud overlay on top, only pure high-res terrain)
  }, [activeLayer, layerOpacity, showRadarOverClouds, latestRadarPath, tileHost]);

  // Render All 31 Karnataka District Pins with Instant Touch Selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = districtMarkersLayerRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (!showDistrictRainPins || districtsRainData.length === 0) return;

    districtsRainData.forEach((district) => {
      const isSelected =
        Math.abs(district.latitude - currentLocation.latitude) < 0.05 &&
        Math.abs(district.longitude - currentLocation.longitude) < 0.05;

      const prob = district.rainProbability;
      const badgeClass =
        prob >= 60
          ? 'bg-blue-600 text-white shadow-blue-500/50'
          : prob >= 30
          ? 'bg-[#00AFCB] text-white shadow-cyan-500/50'
          : 'bg-slate-700/90 text-slate-100 shadow-slate-900/50';

      const customIcon = L.divIcon({
        className: 'karnataka-district-rain-pin',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer select-none -translate-x-1/2 -translate-y-1/2 group" style="touch-action: manipulation;">
            <div class="flex items-center gap-1 px-1.5 py-0.5 rounded-full ${badgeClass} text-[10px] font-mono font-bold shadow-md border ${
              isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/80 scale-110' : 'border-white/40'
            } transition-transform">
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>${prob}%</span>
            </div>
            <span class="mt-0.5 px-1 py-0.2 rounded bg-black/75 text-white font-sans text-[9px] font-bold tracking-tight shadow-md whitespace-nowrap pointer-events-none">
              ${district.name}
            </span>
          </div>
        `,
        iconSize: [40, 32],
        iconAnchor: [20, 16],
      });

      const marker = L.marker([district.latitude, district.longitude], {
        icon: customIcon,
        riseOnHover: true,
        zIndexOffset: isSelected ? 1000 : 500,
      });

      marker.on('click', () => {
        if (onSelectLocation) {
          onSelectLocation({
            id: district.id,
            name: district.name,
            district: district.district,
            state: 'Karnataka',
            country: 'India',
            latitude: district.latitude,
            longitude: district.longitude,
          });
        }
      });

      marker.addTo(group);
    });
  }, [districtsRainData, currentLocation, showDistrictRainPins, onSelectLocation]);

  // Selected Location Focal Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current);
      locationMarkerRef.current = null;
    }

    if (currentLocation.id === 'karnataka-all') return;

    const customIcon = L.divIcon({
      className: 'custom-location-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span class="absolute w-10 h-10 rounded-full bg-cyan-400/40 animate-ping-slow"></span>
          <span class="absolute w-6 h-6 rounded-full bg-cyan-500/60"></span>
          <span class="relative w-3.5 h-3.5 rounded-full bg-cyan-200 border-2 border-white shadow-xl"></span>
          <div class="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xl bg-[#050e1f] border border-cyan-400 text-cyan-200">
            📍 ${currentLocation.name}
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
      icon: customIcon,
      zIndexOffset: 1200,
    }).addTo(map);

    locationMarkerRef.current = marker;
  }, [currentLocation]);

  const layerOptions: Array<{
    id: CleanMapLayer;
    name: string;
    description: string;
    tag: string;
  }> = [
    {
      id: 'clouds_satellite',
      name: t.cloudsLayerTitle,
      description: t.cloudsLayerDesc,
      tag: t.visibleCloudsTag,
    },
    {
      id: 'radar_rain',
      name: t.radarLayerTitle,
      description: t.radarLayerDesc,
      tag: t.dopplerRadarTag,
    },
    {
      id: 'satellite_pure',
      name: t.opticalLayerTitle,
      description: t.opticalLayerDesc,
      tag: t.terrainTag,
    },
  ];

  return (
    <div
      className={`w-full ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-black'
          : 'h-[460px] sm:h-[540px] rounded-2xl'
      } relative overflow-hidden border border-[#D8E4ED] dark:border-cyan-500/35 shadow-xl glass-panel ${className}`}
    >
      {/* Leaflet Map Canvas with native touch scrolling */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ touchAction: 'pan-y' }}
      />

      {/* Top Floating Bar: Status, Layer Switcher, and Fit Button */}
      <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Live Status Chip */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/90 dark:bg-[#061022]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D8E4ED] dark:border-cyan-500/35 text-xs shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-[#172B3A] dark:text-white flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
            {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ಮೋಡಗಳು' : 'Karnataka Satellite Clouds'}
          </span>
          <span className="text-[10px] text-[#526779] dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2 font-mono hidden sm:inline">
            {lastRefreshedTime}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Fit Karnataka Button */}
          <button
            onClick={fitKarnataka}
            className="flex items-center gap-1 bg-white/90 dark:bg-[#061022]/90 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#D8E4ED] dark:border-cyan-500/35 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#172B3A] dark:text-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
            title={lang === 'kn' ? 'ಸಂಪೂರ್ಣ ಕರ್ನಾಟಕ ವೀಕ್ಷಣೆಗೆ ಹೊಂದಿಸಿ' : 'Reset view to fit whole Karnataka'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
            <span className="hidden sm:inline">{t.fitKarnataka}</span>
          </button>

          {/* Toggle 31 District Pins */}
          <button
            onClick={() => setShowDistrictRainPins(!showDistrictRainPins)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border shadow-sm transition active:scale-95 cursor-pointer ${
              showDistrictRainPins
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-900/30'
                : 'bg-white/90 dark:bg-[#061022]/90 border-[#D8E4ED] dark:border-slate-700 text-[#526779] dark:text-slate-300'
            }`}
            title={lang === 'kn' ? 'ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ % ಪಿನ್‌ಗಳನ್ನು ಟಾಗಲ್ ಮಾಡಿ' : 'Toggle All 31 Karnataka District Rain % Pins'}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.pins31}</span>
          </button>

          {/* Map Layers Button */}
          <button
            onClick={() => setShowLayerMenu(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#00AFCB] to-[#2563EB] hover:from-[#0096AD] hover:to-blue-600 border border-cyan-400/70 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition active:scale-95"
            title={t.layers}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.layers}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(fitKarnataka, 100);
            }}
            className="bg-white/90 dark:bg-[#061022]/90 backdrop-blur-md p-2 rounded-xl border border-[#D8E4ED] dark:border-cyan-400/40 text-[#526779] dark:text-cyan-300 hover:bg-slate-100 dark:hover:bg-cyan-950 transition shadow-md cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating Bottom Legend */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:block">
          <div className="pointer-events-auto bg-white/90 dark:bg-[#061022]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#D8E4ED] dark:border-cyan-500/35 text-[11px] text-[#526779] dark:text-slate-200 shadow-xl max-w-[220px]">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#D8E4ED] dark:border-cyan-500/20">
              <span className="font-bold text-[#007A8E] dark:text-cyan-300 uppercase tracking-wider text-[10px]">
                {t.rainProb}
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white cursor-pointer px-1 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  {lang === 'kn' ? 'ಭಾರೀ ಮಳೆ' : 'High Rain'}
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-300 font-bold">&ge; 60%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00AFCB]"></span>
                  {lang === 'kn' ? 'ಸಾಧಾರಣ ಮಳೆ' : 'Moderate'}
                </span>
                <span className="font-mono text-[#007A8E] dark:text-cyan-300 font-bold">30%–59%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                  {lang === 'kn' ? 'ಚದುರಿದ ಮಳೆ' : 'Scattered'}
                </span>
                <span className="font-mono text-[#687D8F] dark:text-slate-400 font-medium">&lt; 30%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean, Fully Scrollable Map Layers Modal (Rendered via Portal to avoid backdrop-filter trapping) */}
      {showLayerMenu &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLayerMenu(false);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[88vh] my-auto flex flex-col rounded-2xl bg-white dark:bg-[#071328] border-2 border-[#00AFCB] dark:border-cyan-500/60 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-[#172B3A] dark:text-slate-100 overflow-hidden animate-in zoom-in-95"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D8E4ED] dark:border-cyan-500/20 bg-slate-50/80 dark:bg-[#050e1e]/90 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E6F8FA] dark:bg-cyan-500/20 text-[#007A8E] dark:text-cyan-400 border border-[#00AFCB]/30">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#172B3A] dark:text-white">
                      {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ಲೇಯರ್‌ಗಳು' : 'Karnataka Satellite Layers'}
                    </h3>
                    <p className="text-[11px] text-[#526779] dark:text-slate-300">
                      {lang === 'kn' ? 'ಲೈವ್ ಮೋಡಗಳು ಮತ್ತು ಡಾಪ್ಲರ್ ರೇಡಾರ್' : 'Live satellite clouds & Doppler rain radar'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="p-1.5 rounded-lg text-[#687D8F] hover:text-[#172B3A] dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Content (Fully Touch Scrollable) */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 touch-pan-y"
                style={{ touchAction: 'pan-y' }}
              >
                {/* Section title */}
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400">
                  {lang === 'kn' ? 'ಲಭ್ಯವಿರುವ ಲೇಯರ್‌ಗಳು' : 'Select Active Layer'}
                </div>

                {/* Layer options list */}
                <div className="space-y-2.5">
                  {layerOptions.map((opt) => {
                    const isCurrent = activeLayer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setActiveLayer(opt.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isCurrent
                            ? 'bg-[#E6F8FA] dark:bg-cyan-950/70 border-[#00AFCB] dark:border-cyan-400 ring-2 ring-[#00AFCB]/40 shadow-sm'
                            : 'bg-[#F8FAFC] dark:bg-slate-900/60 border-[#D8E4ED] dark:border-slate-800 hover:border-[#00AFCB] dark:hover:border-cyan-500/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-[#172B3A] dark:text-white">
                              {opt.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00AFCB]/15 text-[#007A8E] dark:text-cyan-300 border border-[#00AFCB]/30">
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#526779] dark:text-slate-300 mt-1 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <div className="p-1 rounded-full bg-[#00AFCB] text-white flex-shrink-0 mt-0.5 shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Controls for Active Layer */}
                <div className="pt-3 border-t border-[#D8E4ED] dark:border-slate-800 space-y-3.5">
                  {/* Opacity Slider */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-[#D8E4ED] dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="text-[#172B3A] dark:text-slate-200 flex items-center gap-1.5 font-bold">
                        <Sliders className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                        {t.cloudOpacityLabel}
                      </span>
                      <span className="font-mono text-[#00AFCB] dark:text-cyan-300 font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#D8E4ED] dark:border-slate-700">
                        {Math.round(layerOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.0"
                      step="0.05"
                      value={layerOpacity}
                      onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00AFCB]"
                    />
                  </div>

                  {/* Toggle Live Radar Precipitation Over Clouds */}
                  {activeLayer === 'clouds_satellite' && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-[#D8E4ED] dark:border-slate-800 text-xs">
                      <span className="text-[#172B3A] dark:text-slate-200 flex items-center gap-2 font-semibold">
                        <CloudRain className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400" />
                        {t.overlayRainRadar}
                      </span>
                      <input
                        type="checkbox"
                        checked={showRadarOverClouds}
                        onChange={(e) => setShowRadarOverClouds(e.target.checked)}
                        className="w-4 h-4 rounded text-[#00AFCB] focus:ring-[#00AFCB] cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 border-t border-[#D8E4ED] dark:border-cyan-500/20 bg-slate-50/90 dark:bg-[#050e1e]/90 flex items-center justify-end flex-shrink-0">
                <button
                  onClick={() => setShowLayerMenu(false)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00AFCB] to-[#2563EB] hover:from-[#0096AD] hover:to-blue-600 text-white text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
                >
                  {lang === 'kn' ? 'ಮುಗಿದಿದೆ (Done)' : 'Done'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

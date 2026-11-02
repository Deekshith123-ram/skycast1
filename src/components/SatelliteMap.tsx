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

// 3 Stable, Error-Free Map Layers
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

  // Inline Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const cloudTileLayerRef = useRef<L.TileLayer | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const boundaryPolygonRef = useRef<L.Polygon | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const districtMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  // Fullscreen Portal Map Refs
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenMapRef = useRef<L.Map | null>(null);
  const fullscreenCloudLayerRef = useRef<L.TileLayer | null>(null);
  const fullscreenRadarLayerRef = useRef<L.TileLayer | null>(null);
  const fullscreenDistrictMarkersRef = useRef<L.LayerGroup | null>(null);
  const fullscreenLocationMarkerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<CleanMapLayer>(defaultLayer);
  const [layerOpacity, setLayerOpacity] = useState<number>(defaultOpacity);
  const [showRadarOverClouds, setShowRadarOverClouds] = useState<boolean>(defaultOverlayRadar);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showDistrictRainPins, setShowDistrictRainPins] = useState<boolean>(defaultShowPins);
  const [districtsRainData, setDistrictsRainData] = useState<DistrictRainData[]>([]);
  const [latestRadarPath, setLatestRadarPath] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('skycast_rainviewer_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const radarFrames = (parsed.frames || []).filter((f: any) => f.path && f.path.startsWith('/v2/radar/'));
        if (radarFrames.length > 0) {
          return radarFrames[radarFrames.length - 1].path;
        }
      }
    } catch {}
    return '';
  });
  const [tileHost, setTileHost] = useState<string>('https://tilecache.rainviewer.com');
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Live');

  // Fit Karnataka completely and correctly inside the inline map container
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

  // Fit Karnataka completely inside the Fullscreen map
  const fitKarnatakaFs = useCallback(() => {
    const fsMap = fullscreenMapRef.current;
    if (!fsMap) return;
    fsMap.invalidateSize();
    fsMap.fitBounds(KARNATAKA_BOUNDS, {
      padding: [24, 24],
      maxZoom: 8,
      animate: true,
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

  // Synchronize dynamic tile overlays on any given Leaflet instance
  const applyOverlays = useCallback(
    (
      map: L.Map,
      cloudRef: React.MutableRefObject<L.TileLayer | null>,
      radarRef: React.MutableRefObject<L.TileLayer | null>
    ) => {
      if (cloudRef.current) {
        map.removeLayer(cloudRef.current);
        cloudRef.current = null;
      }
      if (radarRef.current) {
        map.removeLayer(radarRef.current);
        radarRef.current = null;
      }

      const yesterdayDate = getGibsDateString(1);
      const twoDaysAgoDate = getGibsDateString(2);

      if (activeLayer === 'clouds_satellite') {
        // High-fidelity NASA MODIS Terra satellite imagery with guaranteed 100% swath coverage over Karnataka
        const cloudUrl = getNasaGibsTileUrl('MODIS_Terra', yesterdayDate);
        const cloudLayer = L.tileLayer(cloudUrl, {
          maxNativeZoom: 9,
          maxZoom: 18,
          minZoom: 4,
          opacity: layerOpacity,
          tileSize: 256,
        });

        cloudLayer.on('tileerror', (e) => {
          const img = (e as any).tile as HTMLImageElement;
          if (img && !img.dataset.retried) {
            img.dataset.retried = 'true';
            img.src = img.src.replace(yesterdayDate, twoDaysAgoDate);
          }
        });

        cloudLayer.addTo(map);
        cloudRef.current = cloudLayer;

        if (showRadarOverClouds && latestRadarPath) {
          const radarUrl = `${tileHost}${latestRadarPath}/256/{z}/{x}/{y}/2/1_1.png`;
          const radarLayer = L.tileLayer(radarUrl, {
            maxNativeZoom: 12,
            maxZoom: 18,
            minZoom: 4,
            opacity: 0.9,
            tileSize: 256,
          }).addTo(map);
          radarRef.current = radarLayer;
        }
      } else if (activeLayer === 'radar_rain') {
        if (latestRadarPath) {
          const radarUrl = `${tileHost}${latestRadarPath}/256/{z}/{x}/{y}/2/1_1.png`;
          const radarLayer = L.tileLayer(radarUrl, {
            maxNativeZoom: 12,
            maxZoom: 18,
            minZoom: 4,
            opacity: layerOpacity,
            tileSize: 256,
          }).addTo(map);
          radarRef.current = radarLayer;
        }
      }
    },
    [activeLayer, layerOpacity, showRadarOverClouds, latestRadarPath, tileHost]
  );

  // Helper to populate district pins on a LayerGroup
  const populateDistrictPins = useCallback(
    (group: L.LayerGroup) => {
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

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
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
    },
    [districtsRainData, currentLocation, showDistrictRainPins, onSelectLocation]
  );

  // Selected Location Focal Pin on a given map
  const applySelectedLocationMarker = useCallback(
    (map: L.Map | null, markerRef: React.MutableRefObject<L.Marker | null>) => {
      if (!map) return;
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
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

      markerRef.current = marker;
    },
    [currentLocation]
  );

  // 1. Initialize Inline Leaflet Map:
  // - Clean touch-action: pan-y for natural page scrolling
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    container.style.touchAction = 'pan-y';

    const map = L.map(container, {
      center: [14.85, 75.85],
      zoom: 6.8,
      minZoom: 5.5,
      maxZoom: 9,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: !L.Browser.mobile,
      attributionControl: false,
    });

    // Optical Satellite Base Layer
    const baseLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        subdomains: ['server', 'services'],
      }
    ).addTo(map);
    baseTileLayerRef.current = baseLayer;

    // Karnataka State Light Border Outline
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

    // District markers layer group
    const districtGroup = L.layerGroup().addTo(map);
    districtMarkersLayerRef.current = districtGroup;

    mapInstanceRef.current = map;

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

  // Update Cloud Formations & Radar Overlays on Inline Map
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyOverlays(mapInstanceRef.current, cloudTileLayerRef, radarTileLayerRef);
    }
  }, [applyOverlays]);

  // Update District Pins on Inline Map
  useEffect(() => {
    if (districtMarkersLayerRef.current) {
      populateDistrictPins(districtMarkersLayerRef.current);
    }
  }, [populateDistrictPins]);

  // Update Location Marker on Inline Map
  useEffect(() => {
    applySelectedLocationMarker(mapInstanceRef.current, locationMarkerRef);
  }, [applySelectedLocationMarker]);

  // 2. Fullscreen Leaflet Map Lifecycle (Rendered via React Portal directly into document.body)
  useEffect(() => {
    if (!isFullscreen) {
      if (fullscreenMapRef.current) {
        fullscreenMapRef.current.remove();
        fullscreenMapRef.current = null;
      }
      return;
    }

    // Lock page background scrolling
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Press Escape to exit fullscreen
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Give DOM a frame to mount portal element
    const initTimer = setTimeout(() => {
      const container = fullscreenContainerRef.current;
      if (!container || fullscreenMapRef.current) return;

      const fsMap = L.map(container, {
        center: [14.85, 75.85],
        zoom: 7,
        minZoom: 5.5,
        maxZoom: 14,
        zoomControl: true, // Standard + / - zoom buttons enabled in fullscreen
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true,
        attributionControl: false,
      });

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, subdomains: ['server', 'services'] }
      ).addTo(fsMap);

      L.polygon(KARNATAKA_BOUNDARY_COORDS, {
        color: '#00AFCB',
        weight: 2.5,
        opacity: 0.95,
        fill: true,
        fillColor: '#00AFCB',
        fillOpacity: 0.04,
        dashArray: '5, 5',
      }).addTo(fsMap);

      const fsGroup = L.layerGroup().addTo(fsMap);
      fullscreenDistrictMarkersRef.current = fsGroup;

      fullscreenMapRef.current = fsMap;

      fsMap.invalidateSize();
      fsMap.fitBounds(KARNATAKA_BOUNDS, {
        padding: [24, 24],
        maxZoom: 8,
        animate: false,
      });

      applyOverlays(fsMap, fullscreenCloudLayerRef, fullscreenRadarLayerRef);
      populateDistrictPins(fsGroup);
      applySelectedLocationMarker(fsMap, fullscreenLocationMarkerRef);
    }, 60);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = origOverflow;
      if (fullscreenMapRef.current) {
        fullscreenMapRef.current.remove();
        fullscreenMapRef.current = null;
      }
    };
  }, [isFullscreen, applyOverlays, populateDistrictPins, applySelectedLocationMarker]);

  // Sync overlays and district markers when in fullscreen mode
  useEffect(() => {
    if (fullscreenMapRef.current) {
      applyOverlays(fullscreenMapRef.current, fullscreenCloudLayerRef, fullscreenRadarLayerRef);
    }
  }, [isFullscreen, applyOverlays]);

  useEffect(() => {
    if (fullscreenDistrictMarkersRef.current) {
      populateDistrictPins(fullscreenDistrictMarkersRef.current);
    }
  }, [isFullscreen, populateDistrictPins]);

  useEffect(() => {
    if (fullscreenMapRef.current) {
      applySelectedLocationMarker(fullscreenMapRef.current, fullscreenLocationMarkerRef);
    }
  }, [isFullscreen, applySelectedLocationMarker]);

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
    <>
      {/* 1. INLINE MAP CONTAINER: Stays permanently stable in normal page flow; clear background without obscuring glassy filters */}
      <div
        data-map-component="satellite-map"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={`w-full h-[460px] sm:h-[540px] rounded-2xl relative overflow-hidden border border-[#D8E4ED] dark:border-cyan-500/35 shadow-xl satellite-map-container map-interaction-zone bg-[#060e1d] dark:bg-[#060e1d] ${className}`}
      >
        {/* Leaflet Map Canvas with native touch scrolling */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ touchAction: 'pan-y' }}
        />

        {/* Top Floating Bar: Status, Layer Switcher, and Fit Button */}
        <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left: Live Status Chip - Bold Line & Crystal-Clear Visibility */}
          <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-[#009BB2] dark:border-cyan-400 bg-white/95 dark:bg-[#071328]/95 backdrop-blur-md ring-1 ring-[#00AFCB]/40 dark:ring-cyan-400/40 text-[#07101C] dark:text-white transition">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-[#07101C] dark:text-white flex items-center gap-1.5 tracking-tight">
              <Satellite className="w-4 h-4 text-[#008DA5] dark:text-cyan-300 stroke-[2.5]" />
              {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ಮೋಡಗಳು' : 'Karnataka Satellite Clouds'}
            </span>
            <span className="text-[10px] text-slate-800 dark:text-slate-200 border-l-2 border-[#009BB2]/50 dark:border-cyan-400/50 pl-2 font-mono font-bold hidden sm:inline">
              {lastRefreshedTime}
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
            {/* Fit Karnataka Button */}
            <button
              type="button"
              onClick={fitKarnataka}
              className="water-droplet-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#172B3A] dark:text-slate-200 shadow-sm transition cursor-pointer"
              title={lang === 'kn' ? 'ಸಂಪೂರ್ಣ ಕರ್ನಾಟಕ ವೀಕ್ಷಣೆಗೆ ಹೊಂದಿಸಿ' : 'Reset view to fit whole Karnataka'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
              <span className="hidden sm:inline">{t.fitKarnataka}</span>
            </button>

            {/* Toggle 31 District Pins */}
            <button
              type="button"
              onClick={() => setShowDistrictRainPins(!showDistrictRainPins)}
              className={`water-droplet-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition cursor-pointer ${
                showDistrictRainPins
                  ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-extrabold'
                  : 'text-slate-800 dark:text-slate-300 font-semibold'
              }`}
              title={lang === 'kn' ? 'ಎಲ್ಲಾ 31 ಜಿಲ್ಲೆಗಳ ಮಳೆ % ಪಿನ್‌ಗಳನ್ನು ಟಾಗಲ್ ಮಾಡಿ' : 'Toggle All 31 Karnataka District Rain % Pins'}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.pins31}</span>
            </button>

            {/* Map Layers Button - Bold Line & High Visibility */}
            <button
              type="button"
              onClick={() => setShowLayerMenu(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#07101C] dark:text-white border-2 border-[#009BB2] dark:border-cyan-400 bg-white/95 dark:bg-[#071328]/95 hover:bg-[#E6F8FA] dark:hover:bg-cyan-950/70 shadow-lg ring-1 ring-[#00AFCB]/40 dark:ring-cyan-400/40 cursor-pointer transition active:scale-95"
              title={t.layers}
            >
              <Layers className="w-4 h-4 text-[#008DA5] dark:text-cyan-300 stroke-[2.5]" />
              <span className="font-extrabold">{t.layers}</span>
            </button>

            {/* Fullscreen Map Button (Arrow Symbol) */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="water-droplet-btn px-3 py-1.5 rounded-full text-[#172B3A] dark:text-cyan-300 transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={t.fullscreenMap}
              aria-label={t.fullscreenMap}
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
              <span className="hidden sm:inline">{t.fullscreenMap}</span>
            </button>
          </div>
        </div>

        {/* Floating Bottom Legend */}
        {showLegend && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:block">
            <div className="pointer-events-auto bg-white/95 dark:bg-[#061022]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#D8E4ED] dark:border-cyan-500/35 text-[11px] text-slate-800 dark:text-slate-200 font-medium shadow-xl max-w-[220px]">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#D8E4ED] dark:border-cyan-500/20">
                <span className="font-bold text-[#007A8E] dark:text-cyan-300 uppercase tracking-wider text-[10px]">
                  {t.rainProb}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLegend(false)}
                  className="text-slate-700 hover:text-[#0F1D2E] dark:text-slate-300 dark:hover:text-white cursor-pointer px-1 text-xs"
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
                  <span className="font-mono text-slate-700 dark:text-slate-400 font-bold">&lt; 30%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. FULLSCREEN MAP PORTAL: Directly attached to document.body (Zero scroll jump, full viewport) */}
      {isFullscreen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] w-screen h-[100dvh] bg-[#020617] flex flex-col overflow-hidden text-[#172B3A] dark:text-slate-100 select-none animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Karnataka Satellite Map Fullscreen"
          >
            {/* Fullscreen Top Navigation Bar */}
            <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-[#D8E4ED] dark:border-cyan-500/30 bg-white/95 dark:bg-[#050e1f]/95 backdrop-blur-xl z-20 flex-shrink-0 shadow-md">
              {/* Left Title */}
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full border-2 border-[#009BB2] dark:border-cyan-400 bg-white/95 dark:bg-[#071328]/95 shadow-sm">
                    <Satellite className="w-4 h-4 text-[#008DA5] dark:text-cyan-300 stroke-[2.5]" />
                    <h3 className="font-display text-xs sm:text-sm font-extrabold text-[#07101C] dark:text-white tracking-tight">
                      {lang === 'kn' ? 'ಕರ್ನಾಟಕ ಉಪಗ್ರಹ ಮೋಡಗಳು — ಪೂರ್ಣ ಪರದೆ' : 'Karnataka Satellite Clouds & Radar — Fullscreen'}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-800 dark:text-slate-300 font-semibold hidden sm:block mt-0.5 ml-1">
                    {lastRefreshedTime} • {t.satelliteMapSubtitle}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Fit Karnataka */}
                <button
                  type="button"
                  onClick={fitKarnatakaFs}
                  className="water-droplet-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#172B3A] dark:text-slate-200 shadow-sm transition cursor-pointer"
                  title={t.fitKarnataka}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
                  <span className="hidden sm:inline">{t.fitKarnataka}</span>
                </button>

                {/* Toggle 31 District Pins */}
                <button
                  type="button"
                  onClick={() => setShowDistrictRainPins(!showDistrictRainPins)}
                  className={`water-droplet-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition cursor-pointer ${
                    showDistrictRainPins
                      ? 'water-droplet-pill-active text-[#007A8E] dark:text-cyan-200 font-extrabold'
                      : 'text-[#526779] dark:text-slate-300'
                  }`}
                  title={t.pins31}
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.pins31}</span>
                </button>

                {/* Layers Switcher - Bold Line & High Visibility */}
                <button
                  type="button"
                  onClick={() => setShowLayerMenu(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-[#07101C] dark:text-white border-2 border-[#009BB2] dark:border-cyan-400 bg-white/95 dark:bg-[#071328]/95 hover:bg-[#E6F8FA] dark:hover:bg-cyan-950/70 shadow-lg ring-1 ring-[#00AFCB]/40 dark:ring-cyan-400/40 cursor-pointer transition active:scale-95"
                  title={t.layers}
                >
                  <Layers className="w-4 h-4 text-[#008DA5] dark:text-cyan-300 stroke-[2.5]" />
                  <span className="font-extrabold">{t.layers}</span>
                </button>

                {/* Exit Fullscreen Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsFullscreen(false);
                  }}
                  className="water-droplet-btn flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 shadow-md cursor-pointer transition"
                  title={t.exitFullscreen}
                  aria-label={t.exitFullscreen}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>{t.exitFullscreen}</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Map Canvas */}
            <div className="flex-1 w-full h-full relative">
              <div
                ref={fullscreenContainerRef}
                className="w-full h-full"
              />

              {/* Floating Bottom Legend */}
              {showLegend && (
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:block">
                  <div className="pointer-events-auto bg-white/90 dark:bg-[#061022]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#D8E4ED] dark:border-cyan-500/35 text-[11px] text-[#526779] dark:text-slate-200 shadow-xl max-w-[220px]">
                    <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#D8E4ED] dark:border-cyan-500/20">
                      <span className="font-bold text-[#007A8E] dark:text-cyan-300 uppercase tracking-wider text-[10px]">
                        {t.rainProb}
                      </span>
                      <button
                        type="button"
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
            </div>
          </div>,
          document.body
        )}

      {/* 3. CLEAN, FULLY SCROLLABLE MAP LAYERS MODAL (Rendered via Portal to avoid backdrop-filter trapping) */}
      {showLayerMenu &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLayerMenu(false);
            }}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in"
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
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                      {lang === 'kn' ? 'ಲೈವ್ ಮೋಡಗಳು ಮತ್ತು ಡಾಪ್ಲರ್ ರೇಡಾರ್' : 'Live satellite clouds & Doppler rain radar'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLayerMenu(false)}
                  className="water-droplet-btn p-1.5 rounded-full text-slate-700 dark:text-slate-300 hover:text-[#0F1D2E] dark:hover:text-white transition cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
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
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setActiveLayer(opt.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl cursor-pointer flex items-start justify-between gap-3 transition ${
                          isCurrent
                            ? 'border-2 border-[#009BB2] dark:border-cyan-400 bg-[#E6F8FA] dark:bg-cyan-950/40 shadow-md ring-2 ring-[#00AFCB]/40'
                            : 'border-2 border-[#D8E4ED] dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 hover:border-[#009BB2]/60 dark:hover:border-cyan-500/60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-[#07101C] dark:text-white">
                              {opt.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00AFCB]/20 text-[#007A8E] dark:text-cyan-300 border border-[#00AFCB]/40">
                              {opt.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium mt-1 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <div className="p-1 rounded-full bg-[#009BB2] dark:bg-cyan-400 text-white dark:text-slate-950 flex-shrink-0 mt-0.5 shadow-sm">
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
                  type="button"
                  onClick={() => setShowLayerMenu(false)}
                  className="water-droplet-btn px-5 py-2 rounded-full text-xs font-bold text-[#172B3A] dark:text-white shadow-md cursor-pointer transition"
                >
                  {lang === 'kn' ? 'ಮುಗಿದಿದೆ (Done)' : 'Done'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

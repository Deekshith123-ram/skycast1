import React, { useState } from 'react';
import { INSAT_PRODUCTS, INSATSectorProduct } from '../services/satelliteService';
import { Radio, RefreshCw, ZoomIn, ZoomOut, Info, ShieldCheck, ExternalLink, Calendar, Satellite } from 'lucide-react';

export const INSATSatelliteViewer: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<INSATSectorProduct>(INSAT_PRODUCTS[0]);
  const [currentImgUrl, setCurrentImgUrl] = useState<string>(INSAT_PRODUCTS[0]?.imageUrl || '');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [imgKey, setImgKey] = useState<number>(Date.now());
  const [isImgLoading, setIsImgLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleSelectProduct = (prod: INSATSectorProduct) => {
    setSelectedProduct(prod);
    setCurrentImgUrl(prod.imageUrl);
    setHasError(false);
    setZoomLevel(1);
    setImgKey(Date.now());
  };

  const handleRefresh = () => {
    setIsImgLoading(true);
    setHasError(false);
    setCurrentImgUrl(selectedProduct.imageUrl);
    setImgKey(Date.now());
  };

  return (
    <div
      data-map-component="insat-viewer"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="w-full glass-panel rounded-2xl border border-[#D8E4ED] dark:border-cyan-500/20 p-4 md:p-6 shadow-2xl insat-satellite-viewer map-interaction-zone"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D8E4ED] dark:border-cyan-500/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#E6F8FA] dark:bg-cyan-500/15 text-[#00AFCB] dark:text-cyan-400 border border-[#00AFCB]/40 dark:border-transparent">
              <Satellite className="w-4 h-4" />
            </span>
            <h2 className="font-display text-base sm:text-lg font-bold text-[#172B3A] dark:text-white tracking-tight">
              INSAT-3D & 3DR Geostationary Satellite Observatory
            </h2>
          </div>
          <p className="text-xs text-[#526779] dark:text-slate-400 mt-1 font-normal">
            Official Indian Meteorological Department (IMD) space-borne meteorological imaging for Karnataka, Arabian Sea & Indian Subcontinent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F8FA] hover:bg-[#D5F5F9] dark:bg-cyan-950/50 dark:hover:bg-cyan-900/60 border border-[#00AFCB]/40 dark:border-cyan-500/30 text-[#007A8E] dark:text-cyan-300 text-xs font-bold transition active:scale-95 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isImgLoading ? 'animate-spin' : ''}`} />
            <span>Sync Latest Pass</span>
          </button>
        </div>
      </div>

      {/* Satellite Product Channel Selector */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar border-b border-[#D8E4ED] dark:border-slate-800/80">
        {INSAT_PRODUCTS.map((prod) => (
          <button
            key={prod.id}
            onClick={() => handleSelectProduct(prod)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm ${
              selectedProduct.id === prod.id
                ? 'bg-gradient-to-r from-[#00AFCB] to-[#2563EB] text-white shadow-md shadow-cyan-900/30 border border-[#00AFCB] ring-1 ring-[#00AFCB]'
                : 'bg-white dark:bg-slate-900/50 hover:bg-[#F4F8FC] dark:hover:bg-slate-800 text-[#526779] dark:text-slate-400 hover:text-[#172B3A] dark:hover:text-slate-200 border border-[#D8E4ED] dark:border-slate-800'
            }`}
          >
            <span>{prod.channel}</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 dark:bg-black/30 font-mono text-cyan-100 dark:text-cyan-200">
              {prod.satellite}
            </span>
          </button>
        ))}
      </div>

      {/* Main View Area */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left: Interactive Satellite Frame Display without obscuring glassy filters inside map border */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="lg:col-span-3 relative rounded-xl overflow-hidden bg-[#030712] border border-cyan-500/20 min-h-[360px] md:min-h-[460px] flex items-center justify-center insat-image-viewport map-interaction-zone backdrop-blur-none"
        >
          {/* Zoom controls overlay */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-cyan-500/20">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-cyan-400 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timestamp and Channel Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#061022]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/25 text-[11px] text-cyan-300 font-mono">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>{selectedProduct.name}</span>
          </div>

          {/* Satellite Image */}
          <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
            {!hasError ? (
              <img
                key={`${currentImgUrl}-${imgKey}`}
                src={`${currentImgUrl}?t=${imgKey}`}
                alt={selectedProduct.name}
                onLoad={() => setIsImgLoading(false)}
                onError={() => {
                  if (currentImgUrl !== selectedProduct.fallbackUrl) {
                    setCurrentImgUrl(selectedProduct.fallbackUrl);
                  } else {
                    setIsImgLoading(false);
                    setHasError(true);
                  }
                }}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: 'transform 0.2s ease-out',
                  maxWidth: '100%',
                  maxHeight: '520px',
                  objectFit: 'contain',
                }}
                className="rounded-lg shadow-2xl filter contrast-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 max-w-md">
                <Info className="w-10 h-10 text-cyan-400 mb-3" />
                <h4 className="text-sm font-semibold text-slate-200">Live IMD Telemetry Feed Updating</h4>
                <p className="text-xs text-slate-400 mt-1.5">
                  The direct IMD INSAT server is cycling through satellite passes or enforcing rate limits. The map above continues to stream NASA GIBS and RainViewer observations seamlessly.
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Retry IMD Server
                </button>
              </div>
            )}
          </div>

          {/* Bottom legend inside frame */}
          <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/20 text-[10px] text-slate-300 font-mono">
              Geostationary: 74.0°E Orbital Slot
            </div>
            <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/20 text-[10px] text-slate-300">
              Karnataka & Indian Sector
            </div>
          </div>
        </div>

        {/* Right: Technical Product Breakdown */}
        <div className="space-y-3">
          <div className="rounded-xl bg-white dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800 p-3.5 space-y-2 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#007A8E] dark:text-cyan-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00AFCB] dark:text-cyan-400" />
              <span>Channel Science Specification</span>
            </div>
            <p className="text-xs text-[#526779] dark:text-slate-300 leading-relaxed font-normal">
              {selectedProduct.description}
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900/60 border border-[#D8E4ED] dark:border-slate-800 p-3.5 space-y-2.5 text-xs text-[#526779] dark:text-slate-300 shadow-sm">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8E4ED] dark:border-slate-800">
              <span className="text-[#687D8F] dark:text-slate-400 font-medium">Sensor & Satellite:</span>
              <span className="font-bold text-[#172B3A] dark:text-white">{selectedProduct.satellite} Imager</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8E4ED] dark:border-slate-800">
              <span className="text-[#687D8F] dark:text-slate-400 font-medium">Channel Type:</span>
              <span className="font-bold text-[#007A8E] dark:text-cyan-300">{selectedProduct.channel}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8E4ED] dark:border-slate-800">
              <span className="text-[#687D8F] dark:text-slate-400 font-medium">Spatial Nadir Res:</span>
              <span className="font-mono font-semibold text-[#172B3A] dark:text-slate-200">{selectedProduct.resolution}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8E4ED] dark:border-slate-800">
              <span className="text-[#687D8F] dark:text-slate-400 font-medium">Cadence / Refresh:</span>
              <span className="text-[#172B3A] dark:text-slate-200 font-semibold">{selectedProduct.updateFrequency}</span>
            </div>
            <div>
              <span className="text-[#687D8F] dark:text-slate-400 block mb-1 font-medium">Key Meteorological Utility:</span>
              <span className="text-[11px] text-[#007A8E] dark:text-cyan-200 bg-[#E6F8FA] dark:bg-cyan-950/60 p-2.5 rounded-lg border border-[#00AFCB]/30 dark:border-cyan-500/20 block font-medium">
                {selectedProduct.recommendedUse}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#E6F8FA]/70 dark:bg-cyan-950/30 border border-[#00AFCB]/30 dark:border-cyan-500/20 text-[11px] text-[#526779] dark:text-cyan-300/90 leading-normal flex items-start gap-2 shadow-sm">
            <Info className="w-4 h-4 text-[#00AFCB] dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              Real-time images are streamed directly from IMD's National Satellite Meteorological Centre (NSMC), New Delhi, and ISRO MOSDAC telemetry archives.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

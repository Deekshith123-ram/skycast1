import React from 'react';
import { Satellite, Loader2 } from 'lucide-react';
import loadingBgWebp from '../assets/loading-satellite.webp';
import loadingBgJpg from '../assets/loading-satellite.jpg';

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
  return (
    <div
      aria-hidden={!isLoading}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden transition-all duration-700 ease-out ${
        isLoading
          ? 'opacity-100 pointer-events-auto visible'
          : 'opacity-0 pointer-events-none invisible'
      }`}
    >
      {/* Immersive Full-Screen Satellite & Earth Background */}
      <picture className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
        <source srcSet={loadingBgWebp} type="image/webp" />
        <source srcSet={loadingBgJpg} type="image/jpeg" />
        <img
          src={loadingBgWebp}
          alt=""
          fetchPriority="high"
          loading="eager"
          className="w-full h-full object-cover object-[50%_35%] scale-100 transform-gpu animate-fade-in"
        />
      </picture>

      {/* Subtle vignette gradient to preserve satellite brightness and keep logo readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none -z-10" />

      {/* Top Spacer */}
      <div className="w-full flex justify-end" />

      {/* Center: Existing SkyCast Logo & Branding */}
      <div className="flex flex-col items-center gap-3.5 text-center z-10">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-2xl shadow-cyan-950/80">
          <div className="w-full h-full bg-[#071022]/90 backdrop-blur-md rounded-[14px] flex items-center justify-center relative overflow-hidden">
            <Satellite className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
            SkyCast<span className="text-cyan-400">.</span>IN
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-400/40 font-medium backdrop-blur-sm">
            KARNATAKA LIVE
          </span>
        </div>
      </div>

      {/* Bottom: Loading Indicator */}
      <div className="flex flex-col items-center justify-center pb-8 sm:pb-12 z-10">
        <div className="p-3 rounded-full bg-[#071022]/80 backdrop-blur-md border border-cyan-500/30 shadow-xl shadow-cyan-950/50">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      </div>
    </div>
  );
};

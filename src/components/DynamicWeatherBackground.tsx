import React, { useMemo } from 'react';
import { WeatherData } from '../types/weather';
import {
  determineWeatherBackground,
  WEATHER_BACKGROUNDS,
  WeatherBackgroundType,
} from '../services/weatherBackgroundService';

interface DynamicWeatherBackgroundProps {
  weather: WeatherData | null;
  theme: 'dark' | 'light';
}

const BACKGROUND_TYPES: WeatherBackgroundType[] = ['rainy', 'cloudy', 'sunny', 'night'];

export const DynamicWeatherBackground: React.FC<DynamicWeatherBackgroundProps> = ({
  weather,
  theme,
}) => {
  // Determine current active background based strictly on current location's live weather telemetry
  const activeType = useMemo(() => {
    return determineWeatherBackground(weather);
  }, [weather]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 4 Stacked Background Layers for instant preloading and silky-smooth crossfading */}
      {BACKGROUND_TYPES.map((type) => {
        const bg = WEATHER_BACKGROUNDS[type];
        const isActive = activeType === type;

        return (
          <div
            key={type}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out transform-gpu scale-100 ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${bg.image})`,
              willChange: 'opacity',
            }}
          />
        );
      })}

      {/* Minimal Theme-Adaptive Vignette to ensure readability without washing out background */}
      {theme === 'dark' ? (
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#030712]/20 via-transparent to-[#020617]/35 transition-colors duration-700 pointer-events-none"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/15 transition-colors duration-700 pointer-events-none"
        />
      )}
    </div>
  );
};

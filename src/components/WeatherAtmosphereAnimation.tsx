import React, { useEffect, useRef } from 'react';

interface WeatherAtmosphereAnimationProps {
  weatherCode: number;
  isDay: boolean;
  windSpeed?: number;
  windDirection?: number;
}

/**
 * Standard weather app realistic atmospheric animation canvas.
 * Renders dynamic living weather states behind the temperature text:
 * - Rain: falling angled rain streaks with depth, splash ripples at the bottom, and thunderstorm lightning.
 * - Cloudy/Overcast: multi-layered volumetric drifting cloud puffs and atmospheric haze.
 * - Clear/Sunny: pulsing solar corona rays and floating warm light motes.
 * - Clear Night: deep starry night with twinkling stars and moonlit haze.
 * - Drizzle/Fog: soft drifting mist and fine precipitation particles.
 */
export const WeatherAtmosphereAnimation: React.FC<WeatherAtmosphereAnimationProps> = ({
  weatherCode,
  isDay,
  windSpeed = 10,
  windDirection = 90,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Categorize weather condition
  const isThunderstorm = weatherCode >= 95;
  const isRain =
    (weatherCode >= 51 && weatherCode <= 82) || isThunderstorm;
  const isDrizzleOnly = weatherCode >= 51 && weatherCode <= 55;
  const isHeavyRain = weatherCode === 65 || weatherCode === 82 || isThunderstorm;
  const isCloudy =
    !isRain &&
    (weatherCode === 1 ||
      weatherCode === 2 ||
      weatherCode === 3 ||
      weatherCode === 45 ||
      weatherCode === 48);
  const isClear = weatherCode === 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      if (!canvas || !canvas.parentElement) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Rain particles definition
    const dropCount = isHeavyRain ? 90 : isDrizzleOnly ? 35 : 60;
    const rainSlant = Math.max(-0.4, Math.min(0.4, (windDirection - 180) / 180)) * (windSpeed / 12);

    const raindrops = Array.from({ length: dropCount }).map(() => ({
      x: Math.random() * (width + 100) - 50,
      y: Math.random() * height,
      length: 14 + Math.random() * (isHeavyRain ? 24 : 14),
      speed: (isHeavyRain ? 18 : isDrizzleOnly ? 7 : 13) + Math.random() * 6,
      opacity: 0.2 + Math.random() * 0.5,
      width: isHeavyRain ? 1.4 : isDrizzleOnly ? 0.9 : 1.1,
    }));

    // Splash ripples when rain hits the bottom
    const splashes: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }> = [];

    // Cloud puffs definition for cloudy / overcast
    const cloudCount = weatherCode === 3 ? 7 : 5;
    const clouds = Array.from({ length: cloudCount }).map((_, i) => ({
      x: (i / cloudCount) * width + (Math.random() - 0.5) * 100,
      y: 20 + Math.random() * (height * 0.55),
      radius: 60 + Math.random() * 80,
      speed: 0.15 + Math.random() * 0.25,
      opacity: (weatherCode === 3 ? 0.35 : 0.2) + Math.random() * 0.15,
    }));

    // Sun motes or Night stars
    const moteCount = isDay ? 22 : 35;
    const motes = Array.from({ length: moteCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (isDay ? 2.5 : 1.6) + 0.5,
      alpha: 0.15 + Math.random() * 0.7,
      pulseSpeed: 0.01 + Math.random() * 0.025,
      vy: isDay ? -(0.2 + Math.random() * 0.4) : (Math.random() - 0.5) * 0.1,
      vx: (Math.random() - 0.5) * 0.2,
    }));

    // Thunderstorm lightning state
    let lightningIntensity = 0;
    let nextLightningTime = Date.now() + 3000 + Math.random() * 6000;

    // Animation Loop
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- 1. RAIN ANIMATION ---
      if (isRain) {
        // Handle lightning in thunderstorms
        if (isThunderstorm) {
          const now = Date.now();
          if (now > nextLightningTime) {
            lightningIntensity = 0.5 + Math.random() * 0.45;
            nextLightningTime = now + 4000 + Math.random() * 7000;
          }
          if (lightningIntensity > 0) {
            ctx.fillStyle = `rgba(224, 242, 254, ${lightningIntensity * 0.35})`;
            ctx.fillRect(0, 0, width, height);
            lightningIntensity = Math.max(0, lightningIntensity - dt * 4.5);
          }
        }

        // Draw and update falling raindrops
        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + rainSlant * drop.length, drop.y + drop.length);
          ctx.strokeStyle = `rgba(186, 230, 253, ${drop.opacity})`;
          ctx.lineWidth = drop.width;
          ctx.lineCap = 'round';
          ctx.stroke();

          drop.x += rainSlant * drop.speed;
          drop.y += drop.speed;

          // Check if drop hit the bottom zone
          if (drop.y > height - 12) {
            // Trigger splash ripple occasionally
            if (Math.random() > 0.4 && splashes.length < 25) {
              splashes.push({
                x: drop.x,
                y: height - 6 - Math.random() * 8,
                radius: 1,
                maxRadius: 4 + Math.random() * 6,
                opacity: drop.opacity * 0.8,
              });
            }
            // Reset drop to top
            drop.y = -drop.length - Math.random() * 20;
            drop.x = Math.random() * (width + 120) - 60;
          }
        });

        // Draw splash ripples
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 1.8, s.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(186, 230, 253, ${s.opacity})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          s.radius += 0.4;
          s.opacity -= 0.035;

          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      // --- 2. CLOUDY / OVERCAST ANIMATION ---
      if (isCloudy || isRain) {
        clouds.forEach((cloud) => {
          const grad = ctx.createRadialGradient(
            cloud.x,
            cloud.y,
            cloud.radius * 0.1,
            cloud.x,
            cloud.y,
            cloud.radius
          );
          const colorStop = isDay ? '210, 230, 250' : '30, 50, 85';
          grad.addColorStop(0, `rgba(${colorStop}, ${cloud.opacity})`);
          grad.addColorStop(0.65, `rgba(${colorStop}, ${cloud.opacity * 0.4})`);
          grad.addColorStop(1, `rgba(${colorStop}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
          ctx.fill();

          cloud.x += cloud.speed;
          if (cloud.x - cloud.radius > width) {
            cloud.x = -cloud.radius;
            cloud.y = 20 + Math.random() * (height * 0.55);
          }
        });
      }

      // --- 3. SUNNY (DAY) / STARRY NIGHT (NIGHT) ---
      if (isClear) {
        if (isDay) {
          // Warm solar corona glow
          const sunX = width * 0.82;
          const sunY = height * 0.18;
          const sunPulse = 1 + Math.sin(time * 0.0015) * 0.06;
          const sunGlow = ctx.createRadialGradient(
            sunX,
            sunY,
            10,
            sunX,
            sunY,
            160 * sunPulse
          );
          sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.32)');
          sunGlow.addColorStop(0.35, 'rgba(251, 191, 36, 0.18)');
          sunGlow.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
          sunGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');

          ctx.fillStyle = sunGlow;
          ctx.beginPath();
          ctx.arc(sunX, sunY, 160 * sunPulse, 0, Math.PI * 2);
          ctx.fill();

          // Warm floating sunbeams/motes
          motes.forEach((m) => {
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(254, 240, 138, ${m.alpha * 0.6})`;
            ctx.fill();

            m.y += m.vy;
            m.x += m.vx;
            m.alpha += Math.sin(time * m.pulseSpeed) * 0.015;

            if (m.y < -10) m.y = height + 10;
            if (m.x < -10) m.x = width + 10;
            if (m.x > width + 10) m.x = -10;
          });
        } else {
          // Night celestial sky with twinkling stars
          motes.forEach((m) => {
            const currentAlpha = 0.2 + (Math.sin(time * m.pulseSpeed + m.x) + 1) * 0.35;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(224, 242, 254, ${currentAlpha})`;
            ctx.fill();
          });
        }
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [weatherCode, isDay, windSpeed, windDirection, isRain, isHeavyRain, isDrizzleOnly, isCloudy, isClear, isThunderstorm]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none rounded-2xl z-0 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
};

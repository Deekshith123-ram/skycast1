import React, { useEffect, useRef } from 'react';

interface DistrictCardAtmosphereAnimationProps {
  weatherCode: number;
  rainProbability: number;
  theme?: 'dark' | 'light';
}

/**
 * DistrictCardAtmosphereAnimation
 * Renders an independent, high-performance living weather animation canvas
 * for individual Karnataka District Cards, matching the main temperature window's
 * realistic atmospheric aesthetics:
 * - Rain (0-29% none, 30-59% light, 60-79% moderate, 80-100% strong)
 * - Cloudy / Overcast (multi-layered soft drifting volumetric clouds)
 * - Partly Cloudy (gentle cloud drift + warm solar illumination)
 * - Clear / Sunny (pulsing solar corona glow + floating light motes)
 * - Thunderstorm (storm clouds, heavy angled rain streaks + subtle lightning flashes)
 * 
 * Performance & Mobile:
 * - IntersectionObserver automatically pauses animation loop when scrolled out of view.
 * - Dynamic color palette ensures clear visibility in both Dark and Light themes.
 */
export const DistrictCardAtmosphereAnimation: React.FC<DistrictCardAtmosphereAnimationProps> = ({
  weatherCode,
  rainProbability,
  theme = 'dark',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Determine weather category strictly based on actual weatherCode and rainProbability
  const isThunderstorm = weatherCode >= 95;
  const isRainForecast = rainProbability >= 30;
  const isRain = isRainForecast || isThunderstorm;

  // Rain intensity levels based on actual rain probability
  const isLightRain = isRain && rainProbability >= 30 && rainProbability < 60 && !isThunderstorm;
  const isModerateRain = isRain && rainProbability >= 60 && rainProbability < 80 && !isThunderstorm;
  const isStrongRain = isRain && (rainProbability >= 80 || isThunderstorm);

  // Cloud & Clear conditions (applied when rainProbability < 30 or combined with rain)
  const isPartlyCloudy = !isRain && (weatherCode === 1 || weatherCode === 2);
  const isCloudy = !isRain && (weatherCode === 3 || weatherCode === 45 || weatherCode === 48 || (weatherCode > 2 && rainProbability < 30));
  const isClear = !isRain && !isPartlyCloudy && !isCloudy;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Detect if dark mode is active
    const isDark = theme === 'dark' || document.documentElement.classList.contains('dark');

    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();

    // 1. Rain particles definition (tailored to card size & rain probability tier)
    const dropCount = isStrongRain ? 48 : isModerateRain ? 28 : isLightRain ? 14 : 0;
    const rainSlant = 0.12; // Gentle, realistic diagonal slant

    const raindrops = Array.from({ length: dropCount }).map(() => ({
      x: Math.random() * (width + 60) - 20,
      y: Math.random() * height,
      length: isStrongRain ? 12 + Math.random() * 10 : isModerateRain ? 8 + Math.random() * 8 : 6 + Math.random() * 5,
      speed: (isStrongRain ? 11 : isModerateRain ? 8 : 5.5) + Math.random() * 3,
      opacity: isDark
        ? 0.35 + Math.random() * 0.45
        : 0.45 + Math.random() * 0.4, // Slightly deeper opacity for light mode
      width: isStrongRain ? 1.2 : isModerateRain ? 1.0 : 0.8,
    }));

    // Splash ripples
    const splashes: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }> = [];

    // 2. Clouds definition (for Cloudy, Partly Cloudy, and Rain backgrounds)
    const showClouds = isCloudy || isPartlyCloudy || isRain;
    const cloudCount = isCloudy ? 4 : isPartlyCloudy ? 3 : isRain ? 3 : 0;
    const clouds = Array.from({ length: cloudCount }).map((_, i) => ({
      x: (i / Math.max(1, cloudCount)) * width + (Math.random() - 0.5) * 60,
      y: 10 + Math.random() * (height * 0.4),
      radius: 35 + Math.random() * 45,
      speed: 0.12 + Math.random() * 0.16,
      opacity: isDark
        ? (isCloudy ? 0.35 : 0.2) + Math.random() * 0.12
        : (isCloudy ? 0.4 : 0.25) + Math.random() * 0.12,
    }));

    // 3. Sun motes / Corona definition (for Clear or Partly Cloudy)
    const showSun = isClear || isPartlyCloudy;
    const moteCount = isClear ? 10 : isPartlyCloudy ? 6 : 0;
    const motes = Array.from({ length: moteCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      alpha: 0.2 + Math.random() * 0.6,
      pulseSpeed: 0.015 + Math.random() * 0.02,
      vy: -(0.15 + Math.random() * 0.25),
      vx: (Math.random() - 0.5) * 0.15,
    }));

    // 4. Thunderstorm lightning state
    let lightningIntensity = 0;
    let nextLightningTime = Date.now() + 2500 + Math.random() * 5000;

    let lastTime = performance.now();

    const renderFrame = (time: number) => {
      if (!isVisibleRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // --- A. SUNSHINE / CORONA GLOW (Clear or Partly Cloudy) ---
      if (showSun) {
        const sunX = width * 0.88;
        const sunY = height * 0.18;
        const sunPulse = 1 + Math.sin(time * 0.0018) * 0.06;
        const radius = (isClear ? 90 : 70) * sunPulse;

        const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, radius);
        if (isDark) {
          sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
          sunGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.14)');
          sunGlow.addColorStop(0.8, 'rgba(56, 189, 248, 0.05)');
          sunGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        } else {
          // Vivid amber-gold visible on light backgrounds
          sunGlow.addColorStop(0, 'rgba(245, 158, 11, 0.32)');
          sunGlow.addColorStop(0.45, 'rgba(251, 191, 36, 0.18)');
          sunGlow.addColorStop(0.8, 'rgba(14, 165, 233, 0.06)');
          sunGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
        }

        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Warm floating sunlight motes
        motes.forEach((m) => {
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(254, 240, 138, ${m.alpha * 0.6})`
            : `rgba(217, 119, 6, ${m.alpha * 0.55})`;
          ctx.fill();

          m.y += m.vy;
          m.x += m.vx;
          m.alpha += Math.sin(time * m.pulseSpeed) * 0.02;

          if (m.y < -5) m.y = height + 5;
          if (m.x < -5) m.x = width + 5;
          if (m.x > width + 5) m.x = -5;
        });
      }

      // --- B. CLOUD DRIFT (Cloudy, Partly Cloudy, Rain) ---
      if (showClouds) {
        clouds.forEach((cloud) => {
          const grad = ctx.createRadialGradient(
            cloud.x,
            cloud.y,
            cloud.radius * 0.1,
            cloud.x,
            cloud.y,
            cloud.radius
          );

          let colorRgb: string;
          if (isDark) {
            colorRgb = isThunderstorm ? '35, 45, 70' : isRain ? '50, 75, 110' : '110, 145, 185';
          } else {
            // Light theme clouds with crisp soft contrast
            colorRgb = isThunderstorm ? '71, 85, 105' : isRain ? '100, 135, 175' : '148, 163, 184';
          }

          grad.addColorStop(0, `rgba(${colorRgb}, ${cloud.opacity})`);
          grad.addColorStop(0.65, `rgba(${colorRgb}, ${cloud.opacity * 0.4})`);
          grad.addColorStop(1, `rgba(${colorRgb}, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
          ctx.fill();

          cloud.x += cloud.speed;
          if (cloud.x - cloud.radius > width) {
            cloud.x = -cloud.radius;
            cloud.y = 8 + Math.random() * (height * 0.45);
          }
        });
      }

      // --- C. THUNDERSTORM LIGHTNING FLASH ---
      if (isThunderstorm) {
        const now = Date.now();
        if (now > nextLightningTime) {
          lightningIntensity = 0.5 + Math.random() * 0.4;
          nextLightningTime = now + 3500 + Math.random() * 6000;
        }
        if (lightningIntensity > 0) {
          const flashColor = isDark
            ? `rgba(224, 242, 254, ${lightningIntensity * 0.3})`
            : `rgba(96, 165, 250, ${lightningIntensity * 0.28})`;
          ctx.fillStyle = flashColor;
          ctx.fillRect(0, 0, width, height);
          lightningIntensity = Math.max(0, lightningIntensity - dt * 4.8);
        }
      }

      // --- D. FALLING RAIN & SPLASH RIPPLES ---
      if (isRain && dropCount > 0) {
        raindrops.forEach((drop) => {
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + rainSlant * drop.length, drop.y + drop.length);

          // Rain color: luminous cyan-sky in dark mode, vibrant cobalt-blue in light mode
          const rainStroke = isDark
            ? `rgba(186, 230, 253, ${drop.opacity})`
            : `rgba(37, 99, 235, ${drop.opacity})`;

          ctx.strokeStyle = rainStroke;
          ctx.lineWidth = drop.width;
          ctx.lineCap = 'round';
          ctx.stroke();

          drop.x += rainSlant * drop.speed;
          drop.y += drop.speed;

          // When drop reaches bottom of the district card
          if (drop.y > height - 6) {
            if (isModerateRain || isStrongRain) {
              if (Math.random() > 0.6 && splashes.length < 8) {
                splashes.push({
                  x: drop.x,
                  y: height - 4 - Math.random() * 4,
                  radius: 0.8,
                  maxRadius: 2.5 + Math.random() * 3,
                  opacity: drop.opacity * 0.7,
                });
              }
            }
            drop.y = -drop.length - Math.random() * 12;
            drop.x = Math.random() * (width + 50) - 25;
          }
        });

        // Draw and update small splash ripples at card base
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 1.6, s.radius * 0.6, 0, 0, Math.PI * 2);

          const splashColor = isDark
            ? `rgba(186, 230, 253, ${s.opacity})`
            : `rgba(37, 99, 235, ${s.opacity})`;

          ctx.strokeStyle = splashColor;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          s.radius += 0.35;
          s.opacity -= 0.05;

          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderFrame);
    };

    // Mobile / Scroll Optimization: IntersectionObserver to pause loop when card is outside viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          isVisibleRef.current = true;
          if (!animFrameIdRef.current) {
            lastTime = performance.now();
            animFrameIdRef.current = requestAnimationFrame(renderFrame);
          }
        } else {
          isVisibleRef.current = false;
          if (animFrameIdRef.current) {
            cancelAnimationFrame(animFrameIdRef.current);
            animFrameIdRef.current = null;
          }
        }
      },
      {
        threshold: 0.05,
      }
    );

    observer.observe(canvas);

    // Initial start
    isVisibleRef.current = true;
    animFrameIdRef.current = requestAnimationFrame(renderFrame);

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    weatherCode,
    rainProbability,
    theme,
    isRain,
    isLightRain,
    isModerateRain,
    isStrongRain,
    isCloudy,
    isPartlyCloudy,
    isClear,
    isThunderstorm,
  ]);

  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block rounded-xl"
      />
      {/* Subtle protective backdrop scrim ensuring high contrast legibility of text & badges */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors ${
          theme === 'dark'
            ? 'bg-slate-950/20'
            : 'bg-white/15'
        }`}
      />
    </div>
  );
};

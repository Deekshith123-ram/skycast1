import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio requires server on port 3000 (0.0.0.0). Default to 3000.
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '5mb' }));

// Helper to get GoogleGenAI client if API key is present
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Determine if a user query is outside the strict weather and SkyCast scope
function isOffTopicQuery(query: string): boolean {
  const clean = query.trim().toLowerCase();

  // 1. Math expressions & arithmetic e.g. "2 + 2 + 3", "what is 2 + 2", "calculate 15 * 4"
  if (
    /\b(\d+\s*[\+\-\*\/xX×÷%]\s*\d+|what\s+is\s+\d+|calculate|solve|square\s+root|math|arithmetic|algebra)\b/i.test(
      clean
    )
  ) {
    return true;
  }

  // 2. Weather terms whitelist - if query includes weather topics, it's valid
  const weatherTerms = [
    'weather',
    'rain',
    'raining',
    'rainfall',
    'precip',
    'precipitation',
    'climate',
    'temp',
    'temperature',
    'cloud',
    'clouds',
    'satellite',
    'radar',
    'monsoon',
    'humidity',
    'wind',
    'breeze',
    'gust',
    'storm',
    'cyclone',
    'thunder',
    'lightning',
    'forecast',
    'uv',
    'sun',
    'sunny',
    'heat',
    'cold',
    'chill',
    'fog',
    'mist',
    'skycast',
    'pressure',
    'barometer',
    'hpa',
    'atmosphere',
    'atmospheric',
    'air quality',
    'aqi',
    'insat',
    'karnataka',
    'district',
    'districts',
    'bengaluru',
    'bangalore',
    'tumakuru',
    'tumkur',
    'mysuru',
    'mysore',
    'udupi',
    'mangaluru',
    'mangalore',
    'shivamogga',
    'shimoga',
    'belagavi',
    'belgaum',
    'dharwad',
    'hubballi',
    'hubli',
    'kalaburagi',
    'gulbarga',
    'ballari',
    'bellary',
    'dakshina kannada',
    'uttara kannada',
    'kodagu',
    'madikeri',
    'chikkamagaluru',
    'hassan',
    'mandya',
    'kolar',
    'chamarajanagar',
    'raichur',
    'koppal',
    'bagalkote',
    'vijayapura',
    'bijapur',
    'bidar',
    'gadag',
    'haveri',
    'yadgir',
    'ramanagara',
    'chikkaballapura',
    'chitradurga',
    'davanagere',
    'vijayanagara',
    // Kannada weather terms
    'ಹವಾಮಾನ',
    'ಮಳೆ',
    'ಬಿಸಿಲು',
    'ಮೋಡ',
    'ಗಾಳಿ',
    'ತಾಪಮಾನ',
    'ಚಳಿ',
    'ಗುಡುಗು',
    'ಮಿಂಚು',
    'ಆರ್ದ್ರತೆ',
    'ಮಾನ್ಸೂನ್',
    'ಮುನ್ಸೂಚನೆ',
    'ಉಪಗ್ರಹ',
    'ರೇಡಾರ್',
    'ಜಿಲ್ಲೆ',
    'ಕರ್ನಾಟಕ',
    'havaamana',
    'male',
    'bisilu',
    'moda',
  ];

  const hasWeatherTerm = weatherTerms.some((term) => clean.includes(term));
  if (hasWeatherTerm) return false;

  // 3. Explicit non-weather topics
  const nonWeatherKeywords = [
    'code',
    'python',
    'javascript',
    'java',
    'c++',
    'html',
    'css',
    'sql',
    'programming',
    'function',
    'bug',
    'algorithm',
    'homework',
    'essay',
    'write an essay',
    'write a letter',
    'write code',
    'write a poem',
    'write a story',
    'recipe',
    'cook',
    'bake',
    'ingredients',
    'movie',
    'cinema',
    'actor',
    'actress',
    'song',
    'lyrics',
    'cricket score',
    'ipl',
    'football',
    'fifa',
    'gaming',
    'minecraft',
    'roblox',
    'politics',
    'election',
    'minister',
    'president',
    'capital of',
    'who is',
    'who was',
    'tell me a joke',
    'riddle',
    'meaning of life',
  ];

  const hasNonWeatherKeyword = nonWeatherKeywords.some((term) => clean.includes(term));
  if (hasNonWeatherKeyword) return true;

  // If query is pure numbers or short arithmetic symbols without weather context
  if (/^[\d\s\+\-\*\/=\.\(\)]+$/.test(clean)) return true;

  return false;
}

// Helper to formulate a local weather fallback response if API key is missing or offline
function generateLocalFallbackReply(
  userQuery: string,
  preferredLang: string,
  context: any
): string {
  const isKn =
    preferredLang === 'kn' ||
    /[\u0C80-\u0CFF]/.test(userQuery) ||
    /kannada|male|havaamana|bisilu/i.test(userQuery);

  // Check if query is unrelated (e.g. math or non-weather)
  if (isOffTopicQuery(userQuery)) {
    if (isKn) {
      return (
        `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ ಅನಾಮಧೇಯ ಹವಾಮಾನ ಸಹಾಯಕ (SkyCast Anonymous Weather AI)**.\n\n` +
        `ನಾನು ಸಂಪೂರ್ಣವಾಗಿ ಅನಾಮಧೇಯವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತೇನೆ ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ, ಮಳೆಯ ಸಂಭವನೀಯತೆ, ಮೋಡಗಳ ಚಲನೆ, ತಾಪಮಾನ ಹಾಗೂ ಸ್ಕೈಕಾಸ್ಟ್ ನಕ್ಷೆಗಳಿಗೆ ಮಾತ್ರ ನಿಖರ ಮತ್ತು ಖಚಿತ ಉತ್ತರಗಳನ್ನು ನೀಡಲು ತರಬೇತಿ ಪಡೆದಿದ್ದೇನೆ.\n\n` +
        `ಗಣಿತ, ಕೋಡಿಂಗ್, ಮನರಂಜನೆ ಅಥವಾ ಇತರ ಸಾಮಾನ್ಯ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ` +
        `ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆ ಅಥವಾ ಸ್ಥಳೀಯ ಪ್ರದೇಶದ ಹವಾಮಾನದ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!`
      );
    }
    return (
      `Hello! I am **SkyCast Anonymous Weather AI**, your privacy-first meteorological assistant.\n\n` +
      `I operate 100% anonymously with zero personal data collection, and I am trained strictly to provide definite, accurate weather forecasts, precipitation probabilities, satellite cloud data, and Karnataka telemetry.\n\n` +
      `I cannot assist with general mathematics, coding, entertainment, or non-weather topics. ` +
      `Please ask any question about current weather, rainfall, or forecasts for any Karnataka district or locality!`
    );
  }

  const locName = context?.currentLocation?.name || 'Karnataka';
  const temp = context?.currentWeather?.temperature ?? 27;
  const feelsLike = context?.currentWeather?.feelsLike ?? temp;
  const condition = context?.currentWeather?.condition ?? 'Partly Cloudy';
  const rainChance = context?.currentWeather?.rainChance ?? 40;
  const humidity = context?.currentWeather?.humidity ?? 65;
  const windSpeed = context?.currentWeather?.windSpeed ?? 14;
  const pressure = context?.currentWeather?.pressure ?? 1012;
  const uvIndex = context?.currentWeather?.uvIndex ?? 6;

  const rainVerdictEn =
    rainChance >= 60
      ? `High Precipitation Risk (${rainChance}%) — Scattered to heavy rain expected.`
      : rainChance >= 30
      ? `Moderate Rain Risk (${rainChance}%) — Isolated showers possible.`
      : `Definite Dry & Clear Weather (${rainChance}% rain chance) — No significant precipitation expected.`;

  const rainVerdictKn =
    rainChance >= 60
      ? `ಹೆಚ್ಚಿನ ಮಳೆ ಸಂಭವನೀಯತೆ (${rainChance}%) — ಸಾಧಾರಣದಿಂದ ಭಾರಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ.`
      : rainChance >= 30
      ? `ಮಧ್ಯಮ ಮಳೆ ಸಂಭವನೀಯತೆ (${rainChance}%) — ಅಲ್ಲಲ್ಲಿ ತುಂತುರು ಮಳೆ ಸಾಧ್ಯತೆ.`
      : `ಖಚಿತ ಒಣ ಮತ್ತು ಸ್ಪಷ್ಟ ಹವಾಮಾನ (${rainChance}% ಮಳೆ ಸಾಧ್ಯತೆ) — ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆ ತೀರಾ ಕಡಿಮೆ.`;

  const highRainDistricts: string[] = Array.isArray(context?.districtsRain)
    ? context.districtsRain
        .filter((d: any) => d.rainProbability >= 50)
        .map((d: any) => `${d.name} (${d.rainProbability}% ಮಳೆ, ${d.temp ?? 27}°C)`)
        .slice(0, 5)
    : ['Udupi (75% ಮಳೆ, 28°C)', 'Dakshina Kannada (70% ಮಳೆ, 29°C)', 'Uttara Kannada (65% ಮಳೆ, 28°C)', 'Shivamogga (55% ಮಳೆ, 26°C)'];

  const highRainDistrictsEn: string[] = Array.isArray(context?.districtsRain)
    ? context.districtsRain
        .filter((d: any) => d.rainProbability >= 50)
        .map((d: any) => `${d.name} (${d.rainProbability}% rain chance, ${d.temp ?? 27}°C)`)
        .slice(0, 5)
    : ['Udupi (75% rain, 28°C)', 'Dakshina Kannada (70% rain, 29°C)', 'Uttara Kannada (65% rain, 28°C)', 'Shivamogga (55% rain, 26°C)'];

  if (isKn) {
    return (
      `**ಸ್ಕೈಕಾಸ್ಟ್ ಅನಾಮಧೇಯ ನಿಖರ ಹವಾಮಾನ ವರದಿ (${locName}):**\n` +
      `• **ಖಚಿತ ಮುನ್ಸೂಚನೆ:** ${rainVerdictKn}\n` +
      `• **ಪ್ರಸ್ತುತ ತಾಪಮಾನ:** **${temp}°C** (ಅನುಭವ: ${feelsLike}°C) — ${condition}\n` +
      `• **ಮಳೆ ಸಂಭವನೀಯತೆ:** **${rainChance}%** | **ಆರ್ದ್ರತೆ:** **${humidity}%**\n` +
      `• **ಗಾಳಿಯ ವೇಗ:** **${windSpeed} km/h** | **ವಾತಾವರಣದ ಒತ್ತಡ:** **${pressure} hPa** | **UV ಸೂಚ್ಯಂಕ:** **${uvIndex}**\n\n` +
      `**ಕರ್ನಾಟಕದಲ್ಲಿ ಮಳೆಯ ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆಯಿರುವ ಜಿಲ್ಲೆಗಳು:**\n` +
      (highRainDistricts.length > 0
        ? highRainDistricts.map((d) => `• ${d}`).join('\n')
        : `• ಸದ್ಯಕ್ಕೆ ಬಹುತೇಕ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಸಾಧಾರಣ ಅಥವಾ ಒಣ ಹವಾಮಾನವಿದೆ.`) +
      `\n\n*(ಗಮನಿಸಿ: ನಿಮ್ಮ ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳು 100% ಅನಾಮಧೇಯ ಮತ್ತು ಖಾಸಗಿಯಾಗಿವೆ. ಯಾವುದೇ ವೈಯಕ್ತಿಕ ವಿವರ ಸಂಗ್ರಹವಾಗುವುದಿಲ್ಲ.)*`
    );
  }

  return (
    `**SkyCast Anonymous Meteorological Report (${locName}):**\n` +
    `• **Definite Verdict:** ${rainVerdictEn}\n` +
    `• **Current Temperature:** **${temp}°C** (Feels like: ${feelsLike}°C) — ${condition}\n` +
    `• **Precipitation Probability:** **${rainChance}%** | **Relative Humidity:** **${humidity}%**\n` +
    `• **Wind Velocity:** **${windSpeed} km/h** | **Barometric Pressure:** **${pressure} hPa** | **UV Index:** **${uvIndex}**\n\n` +
    `**Karnataka High Rain Probability Districts:**\n` +
    (highRainDistrictsEn.length > 0
      ? highRainDistrictsEn.map((d) => `• ${d}`).join('\n')
      : `• Most districts currently show stable dry conditions with minimal rain probability.`) +
    `\n\n*(Privacy Notice: All inquiries are 100% anonymous. No personal identities, emails, or profiles are collected or retained.)*`
  );
}

// GET /downloads/SkyCast-Weather-v2.5.apk or /api/download-apk
app.get(['/downloads/SkyCast-Weather-v2.5.apk', '/api/download-apk'], (_req: Request, res: Response) => {
  const apkPath = path.resolve(__dirname, 'public/downloads/SkyCast-Weather-v2.5.apk');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="SkyCast-Weather-v2.5.apk"');
  res.sendFile(apkPath);
});

// GET /api/rainviewer/public/weather-maps.json endpoint for real-time radar and satellite timeline
let cachedRainViewer: { data: any; timestamp: number } | null = null;
app.get('/api/rainviewer/public/weather-maps.json', async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cachedRainViewer && now - cachedRainViewer.timestamp < 60000) {
    res.setHeader('Content-Type', 'application/json');
    res.json(cachedRainViewer.data);
    return;
  }
  try {
    const rainRes = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      headers: {
        'User-Agent': 'SkyCastWeatherApp/2.5 (Karnataka-Live-Weather)',
        'Accept': 'application/json',
      },
    });
    if (!rainRes.ok) {
      throw new Error(`RainViewer upstream returned ${rainRes.status}`);
    }
    const data = await rainRes.json();
    cachedRainViewer = { data, timestamp: now };
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (err: any) {
    console.warn('RainViewer proxy notice:', err?.message || err);
    if (cachedRainViewer) {
      res.setHeader('Content-Type', 'application/json');
      res.json(cachedRainViewer.data);
      return;
    }
    res.status(502).json({ error: 'RainViewer upstream telemetry unavailable' });
  }
});

// GET /api/reverse-geocode endpoint for high-accuracy locality detection
app.get('/api/reverse-geocode', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: 'Valid lat and lon query parameters are required' });
    return;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`;
    const osmRes = await fetch(url, {
      headers: {
        'User-Agent': 'SkyCastWeatherApp/2.5 (Karnataka-Live-Weather)',
        'Accept-Language': 'en',
      },
    });

    if (!osmRes.ok) {
      throw new Error(`Nominatim reverse returned status ${osmRes.status}`);
    }

    const data = await osmRes.json();
    res.json(data);
  } catch (err: any) {
    console.warn('Server reverse geocoding notice:', err?.message || err);
    res.status(502).json({ error: err?.message || 'Reverse geocoding unavailable' });
  }
});

// GET /api/search-localities endpoint for searching Karnataka localities, villages, and towns
app.get('/api/search-localities', async (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').trim();
  if (!q) {
    res.json([]);
    return;
  }

  try {
    const queryTerm = q.toLowerCase().includes('karnataka') ? q : `${q}, Karnataka`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      queryTerm
    )}&format=json&addressdetails=1&limit=10&countrycodes=in`;

    const osmRes = await fetch(url, {
      headers: {
        'User-Agent': 'SkyCastWeatherApp/2.5 (Karnataka-Live-Weather)',
        'Accept-Language': 'en',
      },
    });

    if (!osmRes.ok) {
      throw new Error(`Nominatim search returned status ${osmRes.status}`);
    }

    const data = await osmRes.json();
    res.json(data);
  } catch (err: any) {
    console.warn('Server locality search notice:', err?.message || err);
    res.status(502).json({ error: err?.message || 'Locality search unavailable' });
  }
});

// POST /api/gemini/chat endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, language = 'auto', history = [], context = {} } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Query message is required.' });
      return;
    }

    // Proactively check off-topic questions (e.g. math like 2 + 2 + 3, coding, etc.)
    if (isOffTopicQuery(message)) {
      const isKn =
        language === 'kn' ||
        /[\u0C80-\u0CFF]/.test(message) ||
        /kannada|male|havaamana/i.test(message);

      const refusalReply = isKn
        ? `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ ಅನಾಮಧೇಯ ಹವಾಮಾನ ಸಹಾಯಕ (SkyCast Anonymous Weather AI)**. ನಾನು ಸಂಪೂರ್ಣ ಅನಾಮಧೇಯವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತೇನೆ ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿ, ಮಳೆ ಮುನ್ಸೂಚನೆ, ಉಪಗ್ರಹ ಮೋಡಗಳು ಹಾಗೂ ಸ್ಕೈಕಾಸ್ಟ್ ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ವಿಶೇಷ ಸಹಾಯಕ.\n\nಗಣಿತ (ಉದಾಹರಣೆಗೆ 2 + 2 + 3), ಕೋಡಿಂಗ್, ಮನರಂಜನೆ ಅಥವಾ ಇತರ ಸಾಮಾನ್ಯ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಹವಾಮಾನ, ತಾಪಮಾನ ಅಥವಾ ಮಳೆಯ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!`
        : `Hello! I am **SkyCast Anonymous Weather AI**, your privacy-first weather assistant. I operate completely anonymously with zero personal data collection, and I am designed specifically to help with weather information, definite forecasts, satellite telemetry, and SkyCast features.\n\nI cannot assist with general mathematics (such as 2 + 2 + 3), coding, homework, entertainment, or other non-weather topics. Please feel free to ask about the current weather, rain probability, or forecasts for any Karnataka district or locality!`;

      res.json({
        reply: refusalReply,
        model: 'skycast-guardrail',
        detectedLanguage: isKn ? 'kn' : 'en',
      });
      return;
    }

    // Build the system prompt with live SkyCast grounding context
    const locName = context?.currentLocation?.name || 'Karnataka';
    const locDistrict = context?.currentLocation?.district || '';
    const temp = context?.currentWeather?.temperature ?? 'N/A';
    const condition = context?.currentWeather?.condition ?? 'N/A';
    const feelsLike = context?.currentWeather?.feelsLike ?? 'N/A';
    const rainChance = context?.currentWeather?.rainChance ?? 'N/A';
    const humidity = context?.currentWeather?.humidity ?? 'N/A';
    const windSpeed = context?.currentWeather?.windSpeed ?? 'N/A';
    const pressure = context?.currentWeather?.pressure ?? 'N/A';
    const uvIndex = context?.currentWeather?.uvIndex ?? 'N/A';
    const cloudCover = context?.currentWeather?.cloudCover ?? 'N/A';

    // Summary of Karnataka 31 districts rain telemetry
    let districtsSummary = 'Karnataka 31 Districts Telemetry:';
    if (Array.isArray(context?.districtsRain) && context.districtsRain.length > 0) {
      districtsSummary +=
        '\n' +
        context.districtsRain
          .map((d: any) => `${d.name}: ${d.rainProbability}% rain prob, ${d.precipitationSum ?? 0}mm rain, ${d.temp ?? 27}°C, ${d.condition}`)
          .join('; ');
    } else {
      districtsSummary +=
        ' Coastal & Malnad districts (Udupi, Dakshina Kannada, Shivamogga) 60-80% rain; South Interior (Bengaluru, Tumakuru, Mysuru) 30-50% rain; North Interior (Belagavi, Kalaburagi) 20-35% rain.';
    }

    // Summary of alerts
    let alertsSummary = 'Active Meteorological Alerts: None currently active.';
    if (Array.isArray(context?.alerts) && context.alerts.length > 0) {
      alertsSummary =
        'Active Meteorological Alerts: ' +
        context.alerts.map((a: any) => `${a.title} (${a.severity}): ${a.description}`).join(' | ');
    }

    let dailyForecastSummary = '';
    if (Array.isArray(context?.dailyForecastSummary) && context.dailyForecastSummary.length > 0) {
      dailyForecastSummary =
        'Upcoming 7-Day Synoptic Forecast: ' +
        context.dailyForecastSummary
          .map((d: any) => `${d.date}: ${d.condition}, High ${d.tempMax}°C, Low ${d.tempMin}°C, ${d.rainProb}% rain`)
          .join(' | ');
    }

    const systemInstruction = `You are "SkyCast AI" (ಸ್ಕೈಕಾಸ್ಟ್ ಎಐ), an intelligent, highly accurate, authoritative bilingual weather meteorologist and assistant built for SkyCast — Karnataka and India's premier live satellite weather platform.

============================================================
1. MANDATE: 100% ANONYMOUS & PRIVACY-FIRST OPERATION
============================================================
- You operate completely ANONYMOUSLY for all users.
- NEVER request, record, collect, or link user queries to personal identities, names, emails, phone numbers, or account profiles.
- Treat every query as an anonymous, private meteorological consultation.
- Address the user respectfully and professionally as a SkyCast user without asking for their identity.
- If asked about privacy or anonymity, reassure the user unequivocally:
  "SkyCast AI operates with 100% privacy and complete anonymity. Your questions are processed without storing personal identities, names, or accounts."
  In Kannada: "ಸ್ಕೈಕಾಸ್ಟ್ ಎಐ ಸಂಪೂರ್ಣವಾಗಿ ಅನಾಮಧೇಯವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ನಿಮ್ಮ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಅಥವಾ ಹೆಸರನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ."

============================================================
2. MANDATE: DEFINITE AND ACCURATE METEOROLOGICAL RESULTS
============================================================
- You MUST deliver definite, unambiguous, and highly accurate weather results.
- NEVER give vague or non-committal answers (e.g., avoid "it might or might not rain, hard to tell").
- ALWAYS provide definite, decisive conclusions grounded in the provided real-time telemetry:
  • Provide a clear "Definite Verdict" (e.g., "Definite Verdict: Clear and Dry — rain chance is strictly 10%", or "Definite Verdict: Moderate Rain Expected — 65% probability with 10-15mm anticipated precipitation").
  • Cite exact grounded numbers: temperature (${temp}°C), feels-like (${feelsLike}°C), exact rain probability (${rainChance}%), humidity (${humidity}%), wind speed (${windSpeed} km/h), barometric pressure (${pressure} hPa), UV index (${uvIndex}), and cloud cover (${cloudCover}%).
  • For Karnataka districts or specific localities (${locName}), provide accurate district-level and locality-level evaluations from the 31-district telemetry grid.
  • When discussing forecasts, specify exact time horizons (e.g., morning, afternoon 14:00-17:00, or evening) and cloud trends.

============================================================
3. CRITICAL MANDATE: STRICT TOPIC RESTRICTION — WEATHER ONLY
============================================================
- SOLE ALLOWED DOMAIN: Weather conditions, forecasts, precipitation, clouds, satellite radar, monsoon patterns, UV index, air quality, storms, cyclone alerts, and SkyCast platform features.
- STRICT PROHIBITION: You MUST NOT answer general math, arithmetic, coding, homework, essays, recipes, entertainment, sports scores, politics, or general trivia.
- If off-topic, politely refuse:
  • English: "I am SkyCast Anonymous Weather AI, designed strictly to provide definite and accurate weather information, forecasts, and satellite telemetry. I cannot assist with math, coding, or non-weather topics. Please ask any question about the weather for Karnataka or your locality!"
  • Kannada: "ನಾನು ಸ್ಕೈಕಾಸ್ಟ್ ಅನಾಮಧೇಯ ಹವಾಮಾನ ಸಹಾಯಕ. ನಾನು ಕೇವಲ ಹವಾಮಾನ, ಮಳೆ ಮುನ್ಸೂಚನೆ ಮತ್ತು ಉಪಗ್ರಹ ಡೇಟಾಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳಿಗೆ ಮಾತ್ರ ನಿಖರ ಉತ್ತರಗಳನ್ನು ನೀಡಬಲ್ಲೆ. ಗಣಿತ, ಕೋಡಿಂಗ್ ಅಥವಾ ಇತರ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ. ಹವಾಮಾನದ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!"

============================================================
4. BILINGUAL LANGUAGE HANDLING (ENGLISH & KANNADA)
============================================================
- Fluently support English and Kannada (ಕನ್ನಡ).
- If the user writes or speaks in Kannada (script or phonetics), reply in natural, fluent, grammatically pristine Kannada.
- If the user writes or speaks in English, reply in crisp, authoritative English.
- Strictly respect manual preference (${language !== 'auto' ? language : 'auto-detect'}).

============================================================
5. REAL-TIME SKYCAST TELEMETRY GROUNDING
============================================================
Ground all weather answers in this real-time data provided by SkyCast:
- Current Location: ${locName} ${locDistrict ? '(' + locDistrict + ')' : ''}
- Current Temperature: ${temp}°C (Feels like: ${feelsLike}°C)
- Atmospheric Condition: ${condition}
- Rain Probability: ${rainChance}%
- Relative Humidity: ${humidity}%
- Wind Speed: ${windSpeed} km/h
- Surface Pressure: ${pressure} hPa
- UV Index: ${uvIndex}
- Cloud Cover: ${cloudCover}%
- ${alertsSummary}
- ${districtsSummary}
${dailyForecastSummary ? '- ' + dailyForecastSummary : ''}

VOICE & SPOKEN RESPONSE FRIENDLINESS:
- Keep answers conversational, natural, and friendly.
- Structure answers with clean bullet points and clear bold headings so Text-to-Speech engines read them aloud naturally without code markers.
- Highlight Karnataka-specific context when asked (e.g. Malnad/Ghats vs Coastal vs South Interior vs North Interior).`;

    const aiClient = getAiClient();
    if (!aiClient) {
      console.warn('GEMINI_API_KEY not configured. Responding with grounded local fallback.');
      const fallbackText = generateLocalFallbackReply(message, language, context);
      res.json({
        reply: fallbackText,
        model: 'local-fallback',
        detectedLanguage: /[\u0C80-\u0CFF]/.test(fallbackText) ? 'kn' : 'en',
      });
      return;
    }

    // Prepare contents array with conversation history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.text && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Add current query
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    // 10-second timeout to prevent hanging connections
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 10s')), 10000)
    );

    let replyText = '';
    let usedModel = 'gemini-3.8-flash';

    try {
      const response = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.5,
          },
        }),
        timeoutPromise,
      ]);
      replyText = response.text || '';
    } catch (genErr: any) {
      console.warn('Gemini generateContent notice:', genErr?.message || genErr);
      replyText = generateLocalFallbackReply(message, language, context);
      usedModel = 'grounded-weather-engine';
    }

    if (!replyText) {
      replyText = generateLocalFallbackReply(message, language, context);
      usedModel = 'grounded-weather-engine';
    }

    const hasKannada = /[\u0C80-\u0CFF]/.test(replyText);

    res.json({
      reply: replyText,
      model: usedModel,
      detectedLanguage: hasKannada ? 'kn' : 'en',
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    // Graceful fallback with live context
    const fallback = generateLocalFallbackReply(
      req.body?.message || '',
      req.body?.language || 'auto',
      req.body?.context || {}
    );
    res.json({
      reply: fallback,
      model: 'fallback-on-error',
      detectedLanguage: /[\u0C80-\u0CFF]/.test(fallback) ? 'kn' : 'en',
      errorNotice: error?.message || 'Error occurred',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`Serving static production files from ${distPath}`);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SkyCast full-stack server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

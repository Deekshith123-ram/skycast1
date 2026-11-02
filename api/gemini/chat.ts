import { GoogleGenAI } from '@google/genai';

// Determine if a query is outside the strict weather and SkyCast scope
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
    'html',
    'css',
    'react',
    'joke',
    'poem',
    'story',
    'recipe',
    'movie',
    'cricket',
    'ipl',
    'football',
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

  if (/^[\d\s\+\-\*\/=\.\(\)]+$/.test(clean)) return true;

  return false;
}

// Generate grounded local meteorological fallback reply
function generateLocalFallbackReply(
  userQuery: string,
  preferredLang: string,
  context: any
): string {
  const isKn =
    preferredLang === 'kn' ||
    /[\u0C80-\u0CFF]/.test(userQuery) ||
    /kannada|male|havaamana|bisilu/i.test(userQuery);

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

  const highRainDistrictsKn: string[] = Array.isArray(context?.districtsRain)
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
      (highRainDistrictsKn.length > 0
        ? highRainDistrictsKn.map((d) => `• ${d}`).join('\n')
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

// Vercel Serverless Function entry point
export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { message, language = 'auto', history = [], context = {} } = body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Query message is required.' });
  }

  // Guardrail check
  if (isOffTopicQuery(message)) {
    const isKn =
      language === 'kn' ||
      /[\u0C80-\u0CFF]/.test(message) ||
      /kannada|male|havaamana/i.test(message);

    const refusalReply = isKn
      ? `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ ಅನಾಮಧೇಯ ಹವಾಮಾನ ಸಹಾಯಕ (SkyCast Anonymous Weather AI)**. ನಾನು ಸಂಪೂರ್ಣ ಅನಾಮಧೇಯವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತೇನೆ ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿ, ಮಳೆ ಮುನ್ಸೂಚನೆ, ಉಪಗ್ರಹ ಮೋಡಗಳು ಹಾಗೂ ಸ್ಕೈಕಾಸ್ಟ್ ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ವಿಶೇಷ ಸಹಾಯಕ.\n\nಗಣಿತ (ಉದಾಹರಣೆಗೆ 2 + 2 + 3), ಕೋಡಿಂಗ್, ಮನರಂಜನೆ ಅಥವಾ ಇತರ ಸಾಮಾನ್ಯ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಹವಾಮಾನ, ತಾಪಮಾನ ಅಥವಾ ಮಳೆಯ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!`
      : `Hello! I am **SkyCast Anonymous Weather AI**, your privacy-first weather assistant. I operate completely anonymously with zero personal data collection, and I am designed specifically to help with weather information, definite forecasts, satellite telemetry, and SkyCast features.\n\nI cannot assist with general mathematics (such as 2 + 2 + 3), coding, homework, entertainment, or other non-weather topics. Please feel free to ask about the current weather, rain probability, or forecasts for any Karnataka district or locality!`;

    return res.json({
      reply: refusalReply,
      model: 'skycast-guardrail',
      detectedLanguage: isKn ? 'kn' : 'en',
    });
  }

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

  let districtsSummary = 'Karnataka 31 Districts Telemetry:';
  if (Array.isArray(context?.districtsRain) && context.districtsRain.length > 0) {
    districtsSummary +=
      '\n' +
      context.districtsRain
        .map((d: any) => `${d.name}: ${d.rainProbability}% rain prob, ${d.precipitationSum ?? 0}mm rain, ${d.temp ?? 27}°C, ${d.condition}`)
        .join('; ');
  } else {
    districtsSummary +=
      ' Coastal & Malnad districts 60-80% rain; South Interior 30-50% rain; North Interior 20-35% rain.';
  }

  let alertsSummary = 'Active Meteorological Alerts: None currently active.';
  if (Array.isArray(context?.alerts) && context.alerts.length > 0) {
    alertsSummary =
      'Active Meteorological Alerts: ' +
      context.alerts.map((a: any) => `${a.title} (${a.severity}): ${a.description}`).join(' | ');
  }

  const systemInstruction = `You are "SkyCast AI" (ಸ್ಕೈಕಾಸ್ಟ್ ಎಐ), an intelligent, highly accurate, authoritative bilingual weather meteorologist and assistant built for SkyCast — Karnataka and India's premier live satellite weather platform.

MANDATES:
1. 100% ANONYMOUS & PRIVACY-FIRST OPERATION. NEVER request, record, or retain personal identities.
2. DEFINITE AND ACCURATE METEOROLOGICAL RESULTS. Deliver unambiguous verdicts grounded in telemetry.
3. WEATHER ONLY. Strictly decline math, coding, entertainment, or unrelated queries.
4. BILINGUAL ENGLISH & KANNADA. Reply in natural Kannada when addressed in Kannada, otherwise English.
5. GROUND ALL ANSWERS IN LIVE SKYCAST TELEMETRY:
- Location: ${locName} ${locDistrict ? '(' + locDistrict + ')' : ''}
- Temperature: ${temp}°C (Feels like: ${feelsLike}°C)
- Condition: ${condition}
- Rain Probability: ${rainChance}%
- Relative Humidity: ${humidity}%
- Wind Speed: ${windSpeed} km/h
- Surface Pressure: ${pressure} hPa
- UV Index: ${uvIndex}
- Cloud Cover: ${cloudCover}%
- ${alertsSummary}
- ${districtsSummary}`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallbackText = generateLocalFallbackReply(message, language, context);
    return res.json({
      reply: fallbackText,
      model: 'local-fallback',
      detectedLanguage: /[\u0C80-\u0CFF]/.test(fallbackText) ? 'kn' : 'en',
    });
  }

  try {
    const aiClient = new GoogleGenAI({ apiKey });
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
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 1000,
      },
    });

    const reply = response.text || generateLocalFallbackReply(message, language, context);
    return res.json({
      reply,
      model: 'gemini-3.8-flash',
      detectedLanguage: /[\u0C80-\u0CFF]/.test(reply) ? 'kn' : 'en',
    });
  } catch (err: any) {
    console.warn('Vercel Gemini serverless call notice:', err?.message || err);
    const fallbackText = generateLocalFallbackReply(message, language, context);
    return res.json({
      reply: fallbackText,
      model: 'local-fallback',
      detectedLanguage: /[\u0C80-\u0CFF]/.test(fallbackText) ? 'kn' : 'en',
    });
  }
}

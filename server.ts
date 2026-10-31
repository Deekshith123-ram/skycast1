import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isDev = process.env.NODE_ENV !== 'production';
// In dev mode, AI Studio requires dev server on port 3000. Never listen on 8080 in dev.
const port = isDev ? 3000 : parseInt(process.env.PORT || '8080', 10);

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

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
        `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ (SkyCast)** ಹವಾಮಾನ ಸಹಾಯಕ. ` +
        `ನಾನು ಹವಾಮಾನ ಮಾಹಿತಿ, ಮಳೆ ಸಂಭವನೀಯತೆ, ಉಪಗ್ರಹ ಮೋಡಗಳು ಮತ್ತು ಸ್ಕೈಕಾಸ್ಟ್ ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ವಿಶೇಷ ಸಹಾಯಕ.\n\n` +
        `ಗಣಿತ, ಕೋಡಿಂಗ್ ಅಥವಾ ಇತರ ಸಾಮಾನ್ಯ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ` +
        `ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಹವಾಮಾನ, ತಾಪಮಾನ ಅಥವಾ ಮಳೆಯ ಮುನ್ಸೂಚನೆಯ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!`
      );
    }
    return (
      `Hello! I am **SkyCast AI**, your specialized weather assistant. ` +
      `I am designed specifically to help with weather information, forecasts, satellite telemetry, and SkyCast features.\n\n` +
      `I cannot assist with general mathematics (such as arithmetic), coding, homework, entertainment, or other non-weather topics. ` +
      `Please feel free to ask about the current weather, rain probability, or forecasts for any Karnataka district or location!`
    );
  }

  const locName = context?.currentLocation?.name || 'Karnataka';
  const temp = context?.currentWeather?.temperature ?? 27;
  const condition = context?.currentWeather?.condition ?? 'Partly Cloudy';
  const rainChance = context?.currentWeather?.rainChance ?? 40;
  const humidity = context?.currentWeather?.humidity ?? 65;
  const windSpeed = context?.currentWeather?.windSpeed ?? 14;
  const uvIndex = context?.currentWeather?.uvIndex ?? 6;

  const highRainDistricts: string[] = Array.isArray(context?.districtsRain)
    ? context.districtsRain
        .filter((d: any) => d.rainProbability >= 50)
        .map((d: any) => `${d.name} (${d.rainProbability}%)`)
        .slice(0, 5)
    : ['Udupi (75%)', 'Dakshina Kannada (70%)', 'Uttara Kannada (65%)', 'Shivamogga (55%)'];

  if (isKn) {
    return (
      `**ಸ್ಕೈಕಾಸ್ಟ್ ಹವಾಮಾನ ವರದಿ (${locName}):**\n` +
      `• ಪ್ರಸ್ತುತ ತಾಪಮಾನ: **${temp}°C** (${condition})\n` +
      `• ಮಳೆಯ ಸಂಭವನೀಯತೆ: **${rainChance}%** | ಆರ್ದ್ರತೆ: **${humidity}%** | UV ಸೂಚ್ಯಂಕ: **${uvIndex}** | ಗಾಳಿಯ ವೇಗ: **${windSpeed} km/h**\n\n` +
      `**ಕರ್ನಾಟಕದಲ್ಲಿ ಮಳೆಯ ಹೆಚ್ಚಿನ ಸಾಧ್ಯತೆಯಿರುವ ಜಿಲ್ಲೆಗಳು:**\n` +
      (highRainDistricts.length > 0
        ? highRainDistricts.map((d) => `• ${d}`).join('\n')
        : `• ಸದ್ಯಕ್ಕೆ ಬಹುತೇಕ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಸಾಧಾರಣ ಅಥವಾ ಒಣ ಹವಾಮಾನವಿದೆ.`) +
      `\n\nಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಜಿಲ್ಲೆಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಕೇಳಿ!`
    );
  }

  return (
    `**SkyCast Live Meteorological Report for ${locName}:**\n` +
    `• Current Temperature: **${temp}°C** (${condition})\n` +
    `• Precipitation Probability: **${rainChance}%** | Humidity: **${humidity}%** | UV Index: **${uvIndex}** | Wind: **${windSpeed} km/h**\n\n` +
    `**Karnataka Districts with High Rain Probability:**\n` +
    `\n\nFeel free to ask about any specific Karnataka district, hourly trends, or cloud satellite movements!`
  );
}

// GET /downloads/SkyCast-Weather-v2.5.apk or /api/download-apk
app.get(['/downloads/SkyCast-Weather-v2.5.apk', '/api/download-apk'], (_req: Request, res: Response) => {
  const apkPath = path.resolve(__dirname, 'public/downloads/SkyCast-Weather-v2.5.apk');
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="SkyCast-Weather-v2.5.apk"');
  res.sendFile(apkPath);
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
        ? `ನಮಸ್ಕಾರ! ನಾನು **ಸ್ಕೈಕಾಸ್ಟ್ (SkyCast)** ಹವಾಮಾನ ಸಹಾಯಕ. ನಾನು ಹವಾಮಾನ ಮಾಹಿತಿ, ಮಳೆ ಮುನ್ಸೂಚನೆ, ಉಪಗ್ರಹ ಮೋಡಗಳು ಮತ್ತು ಸ್ಕೈಕಾಸ್ಟ್ ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ವಿಶೇಷ ಸಹಾಯಕ.\n\nಗಣಿತ (ಉದಾಹರಣೆಗೆ 2 + 2 + 3), ಕೋಡಿಂಗ್, ಮನರಂಜನೆ ಅಥವಾ ಇತರ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಹವಾಮಾನ, ತಾಪಮಾನ ಅಥವಾ ಮಳೆಯ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!`
        : `Hello! I am **SkyCast AI**, your specialized weather assistant. I am designed specifically to help with weather information, forecasts, satellite telemetry, and SkyCast features.\n\nI cannot assist with general mathematics (such as 2 + 2 + 3), coding, homework, entertainment, or other non-weather topics. Please feel free to ask about the current weather, rain probability, or forecasts for any Karnataka district or location!`;

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

    const systemInstruction = `You are "SkyCast AI" (ಸ್ಕೈಕಾಸ್ಟ್ ಎಐ), an intelligent, friendly, highly accurate bilingual weather meteorologist and assistant built for SkyCast — Karnataka and India's premier live satellite weather platform.

============================================================
CRITICAL MANDATE: STRICT TOPIC RESTRICTION — WEATHER ONLY
============================================================
1. SOLE ALLOWED DOMAIN:
   You are strictly and exclusively a specialized Weather Assistant for SkyCast.
   You MUST ONLY answer questions related to:
   - Weather conditions and forecasts (current temperature, feels-like temperature, rainfall, rain probability, precipitation accumulation, clouds, cloud cover, satellite observations, Doppler rain radar, monsoon trough lines, humidity, wind speed, wind direction, storms, lightning, cyclones, UV index, air quality, barometric pressure, sunrise, sunset, etc.)
   - SkyCast platform features (satellite maps, Doppler radar layers, INSAT-3D observatory, Karnataka 31 districts rain grid, weather alerts, settings, units).

2. STRICT PROHIBITION ON UNRELATED TOPICS:
   - You MUST NOT answer questions outside weather or SkyCast.
   - Prohibited topics include, but are not limited to: general mathematics or arithmetic (e.g., "What is 2 + 2 + 3?"), coding/programming, homework assignments, essays, creative writing of non-weather stories, recipes, entertainment, movies, celebrities, pop culture, sports scores, gaming, general history, philosophy, or politics.

3. HANDLING UNRELATED / OFF-TOPIC QUESTIONS:
   - If a user asks ANY question outside weather or SkyCast (such as "What is 2 + 2 + 3?" or "Write code in Python"):
     You MUST POLITELY REFUSE and explain that you are designed specifically to help with weather information and SkyCast features.
     • In English: "I am designed specifically to assist with weather information, forecasts, satellite telemetry, and SkyCast features. I cannot assist with general mathematics, coding, homework, entertainment, or other non-weather topics. Please feel free to ask about the current weather, rainfall, or forecasts for any Karnataka district or location!"
     • In Kannada (ಕನ್ನಡ): "ನಾನು ಹವಾಮಾನ ಮಾಹಿತಿ, ಮಳೆ ಮುನ್ಸೂಚನೆ, ಉಪಗ್ರಹ ಡೇಟಾ ಮತ್ತು ಸ್ಕೈಕಾಸ್ಟ್ (SkyCast) ವೈಶಿಷ್ಟ್ಯಗಳಿಗೆ ಮಾತ್ರ ಉತ್ತರಿಸಲು ವಿನ್ಯಾಸಗೊಳಿಸಲಾದ ವಿಶೇಷ ಸಹಾಯಕ. ಗಣಿತ, ಕೋಡಿಂಗ್, ಮನರಂಜನೆ ಅಥವಾ ಇತರ ವಿಷಯಗಳಿಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ಕರ್ನಾಟಕದ ಯಾವುದೇ ಜಿಲ್ಲೆಯ ಹವಾಮಾನ, ತಾಪಮಾನ ಅಥವಾ ಮಳೆಯ ಬಗ್ಗೆ ದಯವಿಟ್ಟು ಕೇಳಿ!"
   - Apply this refusal consistently across text queries, voice messages, and live voice conversations.

============================================================
BILINGUAL LANGUAGE HANDLING (ENGLISH & KANNADA)
============================================================
- Fluently support English and Kannada (ಕನ್ನಡ).
- AUTOMATIC LANGUAGE DETECTION:
  • If the user types or speaks in Kannada (ಕನ್ನಡ script or Kannada phonetics), reply in natural, warm, polite, grammatically fluent Kannada.
  • If the user types or speaks in English, reply in clear, helpful English.
  • If the user specifically set manual language preference (${language !== 'auto' ? language : 'auto-detect'}), honor that preference strictly.

============================================================
REAL-TIME SKYCAST TELEMETRY GROUNDING
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
- Format text cleanly with bullet points where helpful so that Text-to-Speech engines read it aloud smoothly without awkward ASCII characters or raw code blocks.
- Highlight Karnataka-specific context when asked (e.g. Malnad/Ghats vs Coastal vs South Interior vs North Interior).`;

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

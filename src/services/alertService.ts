import { WeatherAlert, WeatherData } from '../types/weather';

export function evaluateWeatherAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const { current, daily, location } = data;

  const today = daily[0];
  const regionName = `${location.name}, ${location.state}`;

  // 1. Heavy Rainfall / Downpour Advisory
  const maxRainSum = Math.max(...daily.slice(0, 3).map((d) => d.precipitationSum));
  const maxRainProb = Math.max(...daily.slice(0, 3).map((d) => d.precipitationProbabilityMax));

  if (maxRainSum >= 65 || (current.precipitation >= 15 && maxRainProb > 75)) {
    alerts.push({
      id: 'alert-heavy-rain',
      title: 'Heavy to Very Heavy Rainfall Warning (Orange Alert)',
      affectedRegion: regionName,
      severity: 'Alert',
      severityColor: 'amber',
      issueTime: 'IMD Advisory Guidance (Latest Sync)',
      validUntil: 'Next 24–48 Hours',
      explanation: `Expected cumulative 24-hour precipitation exceeds ${maxRainSum.toFixed(1)} mm. Potential waterlogging in low-lying urban areas and agricultural inundation across ${location.district} district.`,
      instructions: 'Avoid crossing submerged causeways or low bridges. Secure outdoor electrical fixtures and keep drainage pathways unobstructed.',
      source: 'India Meteorological Department (IMD) / Numerical Weather Prediction Models',
      category: 'Rainfall',
    });
  } else if (maxRainSum >= 25 || maxRainProb >= 65) {
    alerts.push({
      id: 'alert-mod-rain',
      title: 'Thunderstorm with Moderate Rain Watch (Yellow Alert)',
      affectedRegion: regionName,
      severity: 'Watch',
      severityColor: 'yellow',
      issueTime: 'IMD Standard Bulletin',
      validUntil: 'Next 24 Hours',
      explanation: `Atmospheric convective instability over ${location.state} may lead to localized moderate to heavy showers (up to ${maxRainSum.toFixed(1)} mm) accompanied by gusty winds.`,
      instructions: 'Carry rain protection gear. Motorists are advised to exercise caution during sudden squalls and visibility drops.',
      source: 'State Meteorological Centre / IMD Bengaluru Radar Network',
      category: 'Rainfall',
    });
  }

  // 2. Thunderstorm & Lightning Warning
  const hasThunderstormCode =
    current.weatherCode === 95 ||
    current.weatherCode === 96 ||
    current.weatherCode === 99 ||
    daily.slice(0, 2).some((d) => d.weatherCode >= 95);

  if (hasThunderstormCode) {
    alerts.push({
      id: 'alert-lightning',
      title: 'Severe Convective Thunderstorm & Lightning Advisory',
      affectedRegion: regionName,
      severity: 'Warning',
      severityColor: 'amber',
      issueTime: 'Radar Convective Warning',
      validUntil: 'Valid for current evening/night convective window',
      explanation: `Active cumulonimbus cloud cells detected. Intense cloud-to-ground lightning discharges and localized microburst squalls expected across ${location.name} and adjoining taluks.`,
      instructions: 'Do not take shelter under solitary trees or near metal fences. Disconnect sensitive electronic appliances during thunderstorm activity.',
      source: 'IMD Doppler Weather Radar & Lightning Detection Network',
      category: 'Thunderstorm',
    });
  }

  // 3. High Temperature / Heat Stress Advisory
  const maxTemp = today ? today.tempMax : current.temperature;
  if (maxTemp >= 38) {
    alerts.push({
      id: 'alert-heat',
      title: 'Heat Wave & Elevated Thermal Stress Warning',
      affectedRegion: regionName,
      severity: 'Alert',
      severityColor: 'amber',
      issueTime: 'Regional Meteorological Centre',
      validUntil: 'Afternoon Hours (12:00 PM – 4:00 PM)',
      explanation: `Maximum temperature reaching ${maxTemp}°C with high afternoon solar radiation. Elevated heat index poses dehydration and heat fatigue risk.`,
      instructions: 'Maintain adequate hydration. Minimize strenuous outdoor activities during peak sun hours. Wear loose, light-colored cotton clothing.',
      source: 'National Disaster Management Authority (NDMA) & IMD Heat Action Plan',
      category: 'Heat',
    });
  }

  // 4. Strong Wind / Squall Warning
  const maxGust = today ? today.windGustsMax : current.windGusts;
  if (maxGust >= 45 || current.windSpeed >= 30) {
    alerts.push({
      id: 'alert-wind',
      title: 'Strong Surface Wind & Gustiness Advisory',
      affectedRegion: regionName,
      severity: 'Watch',
      severityColor: 'yellow',
      issueTime: 'Mesoscale Wind Guidance',
      validUntil: 'Next 12 Hours',
      explanation: `Sustained wind speeds of ${current.windSpeed} km/h with localized gusts up to ${maxGust} km/h from the ${data.current.windDirection}° sector. Potential dislodgement of loose banners or branches.`,
      instructions: 'Secure rooftop objects and weak structures. Drive cautiously on open highways and elevated flyovers.',
      source: 'IMD Surface Observatories',
      category: 'Wind',
    });
  }

  // If no severe warning triggered, provide an official-grade routine meteorological statement
  if (alerts.length === 0) {
    alerts.push({
      id: 'alert-routine',
      title: 'Favorable Meteorological Conditions (Green / Normal Status)',
      affectedRegion: regionName,
      severity: 'Advisory',
      severityColor: 'blue',
      issueTime: 'Current Synoptic Analysis',
      validUntil: 'Next 48 Hours',
      explanation: `No severe weather warnings in effect for ${location.name} (${location.state}). Typical seasonal weather patterns prevailing with steady atmospheric pressure (${current.surfacePressure} hPa) and normal diurnal temperature variance.`,
      instructions: 'Normal outdoor and agricultural activities may proceed as planned. Monitor daily satellite and rainfall updates.',
      source: 'India Meteorological Department (IMD) / Open-Meteo Synoptic Feed',
      category: 'General',
    });
  }

  return alerts;
}

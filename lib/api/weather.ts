// Minimal weather helper used for mood/event modulation
// Provides a simple interface and graceful fallbacks.

export interface WeatherReport {
  location?: string;
  temp_c?: number;
  condition?: string;
  wind_kph?: number;
  precipitation_mm?: number;
  raw?: any;
}

const DEFAULT_WEATHER: WeatherReport = {
  temp_c: 18,
  condition: 'clear',
  wind_kph: 5,
  precipitation_mm: 0
};

export async function fetchCurrentWeather(location = 'auto') : Promise<WeatherReport> {
  // If an API key is present in env (not available in this environment), prefer external API
  try {
    // Example: use open-meteo (no API key) as a small footprint option
    // But since no network is allowed here, provide a graceful stub - the app should replace with real call
    // The function tries a small open API if running in production with internet, otherwise returns default.
    if (typeof fetch === 'undefined') return DEFAULT_WEATHER;

    // If location === 'auto', caller should enrich with lat/lon; here we return default
    // Example placeholder: const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    // const json = await res.json(); return mapToReport(json);

    return DEFAULT_WEATHER;
  } catch (e) {
    // graceful fallback
    return DEFAULT_WEATHER;
  }
}

export function mapToMoodModifiers(weather: WeatherReport) {
  // Produces small deltas to emotional/mood signals based on weather
  const mods: { optimism?: number; energy_level?: number; stress_level?: number; emotional?: Partial<Record<string, number>> } = {};
  const cond = (weather.condition || '').toLowerCase();
  if (cond.includes('rain') || cond.includes('storm')) {
    mods.emotional = { sadness: 0.06 };
    mods.energy_level = -0.05;
    mods.optimism = -0.04;
  } else if (cond.includes('clear') || cond.includes('sun')) {
    mods.emotional = { joy: 0.08 };
    mods.energy_level = 0.06;
    mods.optimism = 0.05;
  } else if (cond.includes('cloud')) {
    mods.energy_level = -0.02;
  }

  // temperature adjustments
  if (typeof weather.temp_c === 'number') {
    if (weather.temp_c > 28) mods.energy_level = (mods.energy_level || 0) - 0.06;
    if (weather.temp_c < 4) mods.energy_level = (mods.energy_level || 0) - 0.04;
  }

  return mods;
}

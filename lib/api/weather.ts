// Minimal weather helper used for mood/event modulation
// Provides a simple interface and graceful fallbacks.

export interface WeatherReport {
  location: string;
  temp_c: number | null;
  condition: string | null;
  wind_kph?: number | null;
  precipitation_mm?: number | null;
  raw?: any;
}

const INDORE_DEFAULT: WeatherReport = {
  location: 'Indore',
  temp_c: 28,
  condition: 'Partly cloudy',
  wind_kph: 8,
  precipitation_mm: 0,
  raw: null
};

export async function fetchCurrentWeather(location = 'auto') : Promise<WeatherReport> {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    const endpoint = process.env.WEATHER_API_ENDPOINT || 'https://api.weatherapi.com/v1';
    const loc = location === 'auto' ? (process.env.TARA_LOCATION || 'Indore,India') : location;
    if (!apiKey) {
      console.warn('Weather API key missing; returning Indore default');
      return INDORE_DEFAULT;
    }
    if (typeof fetch === 'undefined') return INDORE_DEFAULT;

    const url = `${endpoint}/current.json?key=${apiKey}&q=${encodeURIComponent(loc)}&aqi=no`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Weather API responded with non-ok status', res.status);
      return INDORE_DEFAULT;
    }
    const json = await res.json();
    return {
      location: json.location?.name || loc,
      temp_c: typeof json.current?.temp_c === 'number' ? json.current.temp_c : null,
      condition: json.current?.condition?.text || null,
      wind_kph: json.current?.wind_kph ?? null,
      precipitation_mm: json.current?.precip_mm ?? null,
      raw: json
    };
  } catch (e) {
    console.warn('Failed to fetch weather', e);
    return INDORE_DEFAULT;
  }
}

export function mapToMoodModifiers(weather: WeatherReport) {
  const mods: { optimism?: number; energy_level?: number; stress_level?: number; emotional?: Partial<Record<string, number>> } = {};
  const cond = (weather.condition || '').toLowerCase();
  if (cond.includes('rain') || cond.includes('storm')) {
    mods.emotional = { sadness: 0.06 };
    mods.energy_level = -0.05;
    mods.optimism = -0.04;
  } else if (cond.includes('clear') || cond.includes('sun') || cond.includes('partly')) {
    mods.emotional = { joy: 0.08 };
    mods.energy_level = 0.06;
    mods.optimism = 0.05;
  } else if (cond.includes('cloud')) {
    mods.energy_level = -0.02;
  }

  if (typeof weather.temp_c === 'number') {
    if (weather.temp_c > 28) mods.energy_level = (mods.energy_level || 0) - 0.06;
    if (weather.temp_c < 4) mods.energy_level = (mods.energy_level || 0) - 0.04;
  }

  return mods;
}

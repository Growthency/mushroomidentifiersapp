/**
 * OpenWeather — fetches current + 5-day forecast to power foraging recommendations.
 * Mushrooms generally fruit 5–14 days after warm rain. We use this to score
 * foraging conditions for the user's location.
 */
import { config } from "./config";

export type ForagingForecast = {
  conditionScore: number; // 0–100
  recommendation: "poor" | "fair" | "good" | "excellent";
  reason: string;
  recentRainMm: number;
  tempCAvg: number;
  humidityAvg: number;
};

export async function getForagingForecast(lat: number, lon: number): Promise<ForagingForecast> {
  if (!config.openWeather.apiKey) {
    return {
      conditionScore: 0,
      recommendation: "poor",
      reason: "Weather API key not configured.",
      recentRainMm: 0,
      tempCAvg: 0,
      humidityAvg: 0,
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${config.openWeather.apiKey}&units=metric`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Weather API failed: ${r.status}`);
  const data = (await r.json()) as {
    list: { rain?: { "3h"?: number }; main: { temp: number; humidity: number } }[];
  };

  const recentRainMm = data.list
    .slice(0, 16) // ~2 days back-window
    .reduce((s, d) => s + (d.rain?.["3h"] ?? 0), 0);
  const tempCAvg =
    data.list.slice(0, 8).reduce((s, d) => s + d.main.temp, 0) / Math.max(1, Math.min(8, data.list.length));
  const humidityAvg =
    data.list.slice(0, 8).reduce((s, d) => s + d.main.humidity, 0) /
    Math.max(1, Math.min(8, data.list.length));

  // Heuristic: rain 10–40 mm + 12–22°C + humidity ≥ 70% = excellent.
  let score = 0;
  if (recentRainMm >= 10) score += 40;
  else if (recentRainMm >= 5) score += 25;
  else if (recentRainMm >= 1) score += 10;

  if (tempCAvg >= 12 && tempCAvg <= 22) score += 30;
  else if (tempCAvg >= 8 && tempCAvg <= 26) score += 15;

  if (humidityAvg >= 75) score += 30;
  else if (humidityAvg >= 60) score += 15;

  const recommendation: ForagingForecast["recommendation"] =
    score >= 75 ? "excellent" : score >= 50 ? "good" : score >= 25 ? "fair" : "poor";

  const reason =
    recommendation === "excellent"
      ? "Recent rain, mild temps, high humidity — prime fruiting conditions."
      : recommendation === "good"
        ? "Decent moisture and temperature. Worth a foray."
        : recommendation === "fair"
          ? "Conditions are marginal. Look in shaded, damp microhabitats."
          : "Too dry / too cold / too hot for most fungi to fruit.";

  return { conditionScore: score, recommendation, reason, recentRainMm, tempCAvg, humidityAvg };
}

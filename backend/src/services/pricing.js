// Recommended price-per-seat, modeled on how BlaBlaCar suggests a fair
// cost-sharing price from trip distance: a per-km rate with a ±margin band
// so drivers see a "recommended price: X - Y" range instead of guessing.
const RATE_PER_KM = Number(process.env.PRICE_PER_KM) || 15; // currency units per seat per km
const RANGE_MARGIN = 0.18;
const ROUND_TO = 5;

function roundTo(value, step) {
  return Math.max(step, Math.round(value / step) * step);
}

export function suggestPricePerSeat(distanceKm) {
  const recommended = roundTo(distanceKm * RATE_PER_KM, ROUND_TO);
  const min = roundTo(recommended * (1 - RANGE_MARGIN), ROUND_TO);
  const max = roundTo(recommended * (1 + RANGE_MARGIN), ROUND_TO);
  return { distanceKm: Math.round(distanceKm * 10) / 10, recommended, min, max };
}

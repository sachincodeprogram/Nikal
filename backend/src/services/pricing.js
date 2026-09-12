// Recommended price-per-seat, modeled on how BlaBlaCar suggests a fair
// cost-sharing price from trip distance: a per-km rate with a ±margin band
// so drivers see a "recommended price: X - Y" range instead of guessing.
//
// This is meant to just cover the driver's fuel cost, not turn a profit —
// roughly the average of petrol (~Rs 100/L at ~15 km/L, ~Rs 6.7/km) and CNG
// (~Rs 75/kg at ~25 km/kg, ~Rs 3/km) whole-car running cost, split across a
// typical ~3 paying seats on a shared trip.
const RATE_PER_KM = Number(process.env.PRICE_PER_KM) || 4; // currency units per seat per km
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

import { decodePolyline } from "../utils/polyline.js";

const DIRECTIONS_URL = "https://maps.googleapis.com/maps/api/directions/json";

// Fetches the driving route between two points from the Google Directions
// API and returns its encoded polyline plus the decoded [lat, lng] points.
export async function fetchRoute(origin, destination) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("Google Directions API is not configured (missing GOOGLE_MAPS_API_KEY)");
  }

  const url = new URL(DIRECTIONS_URL);
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destination", `${destination.lat},${destination.lng}`);
  url.searchParams.set("key", key);

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK" || !data.routes?.length) {
    const detail = data.error_message ? ` - ${data.error_message}` : "";
    throw new Error(`Google Directions API error: ${data.status}${detail}`);
  }

  const polyline = data.routes[0].overview_polyline.points;
  const distanceMeters = data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
  return { polyline, points: decodePolyline(polyline), distanceMeters };
}

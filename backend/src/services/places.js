const AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

function requireKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error("Google Places API is not configured (missing GOOGLE_MAPS_API_KEY)");
  }
  return key;
}

// Wraps Google's Places Autocomplete so the mobile app can type an address
// instead of entering lat/lng by hand.
export async function autocompletePlaces(input) {
  const key = requireKey();
  const url = new URL(AUTOCOMPLETE_URL);
  url.searchParams.set("input", input);
  url.searchParams.set("key", key);

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    const detail = data.error_message ? ` - ${data.error_message}` : "";
    throw new Error(`Google Places API error: ${data.status}${detail}`);
  }

  return (data.predictions || []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
  }));
}

// Resolves a place_id (from autocompletePlaces) to a lat/lng point.
export async function getPlaceDetails(placeId) {
  const key = requireKey();
  const url = new URL(DETAILS_URL);
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "geometry,name,formatted_address");
  url.searchParams.set("key", key);

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK") {
    const detail = data.error_message ? ` - ${data.error_message}` : "";
    throw new Error(`Google Places API error: ${data.status}${detail}`);
  }

  const { result } = data;
  return {
    name: result.name || result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };
}

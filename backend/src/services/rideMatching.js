import { distance, length, lineString, nearestPointOnLine, point, pointToLineDistance } from "@turf/turf";

const MIN_FARE = 50;

// Walks a decoded polyline ([lat, lng] pairs) and keeps a point roughly every
// `stepKm`, always including the first and last point. Used to shrink a
// dense Directions API polyline down to a manageable set of route waypoints.
export function sampleWaypoints(latLngPoints, stepKm = 2) {
  if (!latLngPoints || latLngPoints.length === 0) return [];
  if (latLngPoints.length === 1) return [latLngPoints[0]];

  const sampled = [latLngPoints[0]];
  let distSinceLast = 0;

  for (let i = 1; i < latLngPoints.length; i++) {
    const [lat1, lng1] = latLngPoints[i - 1];
    const [lat2, lng2] = latLngPoints[i];
    distSinceLast += distance(point([lng1, lat1]), point([lng2, lat2]), { units: "kilometers" });

    if (distSinceLast >= stepKm) {
      sampled.push(latLngPoints[i]);
      distSinceLast = 0;
    }
  }

  const last = latLngPoints[latLngPoints.length - 1];
  if (sampled[sampled.length - 1] !== last) sampled.push(last);
  return sampled;
}

// Builds a turf LineString ([lng, lat] order) representing a ride's route:
// its sampled waypoints when available, falling back to a straight
// from→to line for rides created before route fetching existed.
export function buildRouteLine(ride) {
  const coords =
    ride.waypoints && ride.waypoints.length >= 2
      ? ride.waypoints.map((w) => w.loc.coordinates)
      : [ride.from.loc.coordinates, ride.to.loc.coordinates];
  return lineString(coords);
}

// Decides whether a ride matches a passenger's requested pickup/drop, and if
// so, what segment of the route they'd ride and what it should cost.
//
// pickup/drop: { lat, lng }
// Returns null when the ride doesn't match, otherwise
// { pickupDistanceKm, dropDistanceKm, segmentKm, totalKm, passengerFare }.
export function matchRide(ride, pickup, drop, { pickupRadiusKm = 10, corridorKm = 3 } = {}) {
  const line = buildRouteLine(ride);
  const pickupPoint = point([pickup.lng, pickup.lat]);
  const dropPoint = point([drop.lng, drop.lat]);
  const originPoint = point(ride.from.loc.coordinates);

  const pickupDistanceKm = distance(pickupPoint, originPoint, { units: "kilometers" });
  const pickupOnCorridor = pointToLineDistance(pickupPoint, line, { units: "kilometers" }) <= corridorKm;
  if (pickupDistanceKm > pickupRadiusKm && !pickupOnCorridor) return null;

  const dropDistanceKm = pointToLineDistance(dropPoint, line, { units: "kilometers" });
  if (dropDistanceKm > corridorKm) return null;

  const pickupSnap = nearestPointOnLine(line, pickupPoint, { units: "kilometers" });
  const dropSnap = nearestPointOnLine(line, dropPoint, { units: "kilometers" });
  if (dropSnap.properties.location <= pickupSnap.properties.location) return null;

  const totalKm = length(line, { units: "kilometers" });
  const segmentKm = dropSnap.properties.location - pickupSnap.properties.location;
  const fareRatio = totalKm > 0 ? segmentKm / totalKm : 1;
  const passengerFare = Math.max(MIN_FARE, Math.round(ride.pricePerSeat * fareRatio));

  return { pickupDistanceKm, dropDistanceKm, segmentKm, totalKm, passengerFare };
}

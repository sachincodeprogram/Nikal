import { describe, expect, it } from "@jest/globals";
import { destination, point } from "@turf/turf";
import { matchRide, sampleWaypoints } from "./rideMatching.js";

// A straight, due-east route out of Bangalore. Using turf's `destination`
// to place every fixture point means distances/fares below can be asserted
// against known km values instead of guessed coordinates.
const ORIGIN = point([77.5946, 12.9716]);
const BEARING_EAST = 90;

function along(km, bearingDeg = BEARING_EAST) {
  const [lng, lat] = destination(ORIGIN, km, bearingDeg, { units: "kilometers" }).geometry.coordinates;
  return { lat, lng };
}

function toCoords({ lat, lng }) {
  return [lng, lat];
}

function buildRide({ totalKm = 40, pricePerSeat = 400, segments = 5 } = {}) {
  const waypoints = [];
  for (let i = 0; i <= segments; i++) {
    waypoints.push({ loc: { type: "Point", coordinates: toCoords(along((totalKm / segments) * i)) } });
  }
  return {
    pricePerSeat,
    from: { name: "Origin", loc: { type: "Point", coordinates: toCoords(along(0)) } },
    to: { name: "Destination", loc: { type: "Point", coordinates: toCoords(along(totalKm)) } },
    waypoints,
  };
}

describe("matchRide", () => {
  it("matches a pickup/drop that sit on the route corridor and prices the segment", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 400 });

    const match = matchRide(ride, along(10), along(30));

    expect(match).not.toBeNull();
    expect(match.segmentKm).toBeCloseTo(20, 0);
    expect(match.totalKm).toBeCloseTo(40, 0);
    expect(match.passengerFare).toBeCloseTo(200, 0); // 400 * 20/40
  });

  it("matches a pickup within 10km of the ride origin even when off the corridor", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 300 });
    const pickup = along(5, 0); // 5km due north of the origin, not on the route

    const match = matchRide(ride, pickup, along(35));

    expect(match).not.toBeNull();
  });

  it("rejects a pickup that is neither near the origin nor on the corridor", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 300 });
    const farPickup = along(25, 0); // 25km due north of the origin

    const match = matchRide(ride, farPickup, along(35));

    expect(match).toBeNull();
  });

  it("rejects a drop that is too far from the route corridor", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 300 });
    const nearRoutePoint = along(30);
    const farDrop = destination(point(toCoords(nearRoutePoint)), 10, 0, { units: "kilometers" });
    const [lng, lat] = farDrop.geometry.coordinates;

    const match = matchRide(ride, along(5), { lat, lng });

    expect(match).toBeNull();
  });

  it("rejects when the drop comes before the pickup along the route", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 300 });

    const match = matchRide(ride, along(30), along(10));

    expect(match).toBeNull();
  });

  it("enforces the minimum fare of 50", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 100 });

    // 100 * (2/40) = 5, which is below the floor
    const match = matchRide(ride, along(0), along(2));

    expect(match).not.toBeNull();
    expect(match.passengerFare).toBe(50);
  });

  it("falls back to a straight from→to line when a ride has no waypoints", () => {
    const ride = buildRide({ totalKm: 40, pricePerSeat: 400 });
    ride.waypoints = [];

    const match = matchRide(ride, along(10), along(30));

    expect(match).not.toBeNull();
    expect(match.totalKm).toBeCloseTo(40, 0);
  });
});

describe("sampleWaypoints", () => {
  it("keeps the first and last point and thins the rest to roughly every stepKm", () => {
    const points = [];
    for (let km = 0; km <= 10; km += 1) {
      const { lat, lng } = along(km);
      points.push([lat, lng]);
    }

    const sampled = sampleWaypoints(points, 2);

    expect(sampled[0]).toEqual(points[0]);
    expect(sampled[sampled.length - 1]).toEqual(points[points.length - 1]);
    expect(sampled.length).toBeLessThan(points.length);
    expect(sampled.length).toBeGreaterThanOrEqual(5);
  });

  it("returns an empty array for no input", () => {
    expect(sampleWaypoints([])).toEqual([]);
  });

  it("returns the single point unchanged when given only one", () => {
    const [p] = [along(0)].map(({ lat, lng }) => [lat, lng]);
    expect(sampleWaypoints([p])).toEqual([p]);
  });
});

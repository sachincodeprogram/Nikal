export type VehicleType = "CAR" | "BIKE";

export interface User {
  _id: string;
  phone: string;
  name: string;
  photo?: string | null;
  bio?: string | null;
  gender?: "male" | "female" | "other";
  isVerified: boolean;
  banned?: boolean;
  isAdmin?: boolean;
  avgRating: number;
  ratingCount: number;
  role: "passenger" | "driver";
  blocked?: string[];
}

export interface Vehicle {
  _id: string;
  userId: string;
  type: VehicleType;
  make: string;
  model: string;
  color?: string;
  plateNo: string;
  seats: number;
  photo?: string | null;
  verified: boolean;
}

// Mongo GeoJSON point: coordinates are [lng, lat], not [lat, lng].
export interface GeoPlace {
  name: string;
  loc: { type: "Point"; coordinates: [number, number] };
}

export type RideStatus = "active" | "full" | "started" | "completed" | "cancelled";
export type ApprovalMode = "auto" | "manual";

export interface Ride {
  _id: string;
  driverId: string | User;
  vehicleId: string | Vehicle;
  from: GeoPlace;
  to: GeoPlace;
  departureAt: string;
  seatsTotal: number;
  seatsLeft: number;
  pricePerSeat: number;
  approval: ApprovalMode;
  status: RideStatus;
  // present only on /rides/search results
  passengerFare?: number;
  segmentKm?: number;
  totalKm?: number;
  bookings?: Booking[]; // present only on /rides/mine
}

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled" | "completed";

export interface Booking {
  _id: string;
  rideId: string | Ride;
  passengerId: string | User;
  driverId: string | User;
  seats: number;
  amount: number;
  status: BookingStatus;
}

export interface Message {
  _id: string;
  bookingId: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
}

export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export interface Report {
  _id: string;
  reporterId: string | User;
  reportedId: string | User;
  bookingId?: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Payout {
  _id: string;
  driverId: string | User;
  amount: number;
  period: string;
  status: "pending" | "paid";
  upiId: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function placeLat(place: GeoPlace): number {
  return place.loc.coordinates[1];
}

export function placeLng(place: GeoPlace): number {
  return place.loc.coordinates[0];
}

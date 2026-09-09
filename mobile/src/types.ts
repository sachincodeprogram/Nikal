export type VehicleType = "CAR" | "BIKE";

export interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  name: string;
  email?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  ratingAvg: number;
  ratingCount: number;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  type: VehicleType;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
  seatCount: number;
  photoUrl?: string | null;
  verified: boolean;
}

export type RideStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Ride {
  id: string;
  driverId: string;
  driver?: User;
  vehicleId: string;
  vehicle?: Vehicle;
  vehicleType: VehicleType;
  fromLabel: string;
  fromLat: number;
  fromLng: number;
  toLabel: string;
  toLat: number;
  toLng: number;
  departureAt: string;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: string;
  autoApprove: boolean;
  status: RideStatus;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export interface Booking {
  id: string;
  rideId: string;
  ride?: Ride;
  passengerId: string;
  seatsBooked: number;
  status: BookingStatus;
}

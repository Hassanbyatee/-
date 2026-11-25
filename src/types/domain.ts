export type LanguageCode = 'ar' | 'ku' | 'en';

export type UserRole = 'passenger' | 'driver' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'blocked';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'disputed' | 'refunded';
export type PaymentMethod = 'cash' | 'points';
export type CabinSeatId =
  | 'front_passenger'
  | 'rear_right'
  | 'rear_middle'
  | 'rear_left'
  | 'extra_right'
  | 'extra_left';
export const CABIN_SEAT_IDS_4: CabinSeatId[] = [
  'front_passenger',
  'rear_right',
  'rear_middle',
  'rear_left',
];
export const CABIN_SEAT_IDS_6: CabinSeatId[] = [
  'front_passenger',
  'rear_right',
  'rear_middle',
  'rear_left',
  'extra_right',
  'extra_left',
];
export const CABIN_SEAT_IDS: CabinSeatId[] = CABIN_SEAT_IDS_4;

export function getSeatIdsForCapacity(totalSeats?: number): CabinSeatId[] {
  return Number(totalSeats) >= 6 ? CABIN_SEAT_IDS_6 : CABIN_SEAT_IDS_4;
}

export type SeatPricesMap = {
  front_passenger: number;
  rear_right: number;
  rear_middle: number;
  rear_left: number;
  extra_right?: number;
  extra_left?: number;
};

export function resolveTripSeatPrices(trip?: {
  pricePerSeatIqd?: number;
  seatPrices?: Partial<Record<CabinSeatId, number>>;
} | null): Required<SeatPricesMap> {
  const base = Number(trip?.pricePerSeatIqd) > 0 ? Number(trip?.pricePerSeatIqd) : 25000;
  return {
    front_passenger:
      Number(trip?.seatPrices?.front_passenger) > 0
        ? Number(trip?.seatPrices?.front_passenger)
        : base,
    rear_right:
      Number(trip?.seatPrices?.rear_right) > 0
        ? Number(trip?.seatPrices?.rear_right)
        : base,
    rear_middle:
      Number(trip?.seatPrices?.rear_middle) > 0
        ? Number(trip?.seatPrices?.rear_middle)
        : base,
    rear_left:
      Number(trip?.seatPrices?.rear_left) > 0
        ? Number(trip?.seatPrices?.rear_left)
        : base,
    extra_right:
      Number(trip?.seatPrices?.extra_right) > 0
        ? Number(trip?.seatPrices?.extra_right)
        : base,
    extra_left:
      Number(trip?.seatPrices?.extra_left) > 0
        ? Number(trip?.seatPrices?.extra_left)
        : base,
  };
}

export function getTripSeatPrice(
  trip: { pricePerSeatIqd?: number; seatPrices?: Partial<Record<CabinSeatId, number>> } | null | undefined,
  seatId: CabinSeatId
): number {
  return resolveTripSeatPrices(trip)[seatId];
}

export function getTripMinSeatPrice(trip?: {
  totalSeats?: number;
  pricePerSeatIqd?: number;
  seatPrices?: Partial<Record<CabinSeatId, number>>;
} | null): number {
  const map = resolveTripSeatPrices(trip);
  const activeIds = getSeatIdsForCapacity(trip?.totalSeats);
  return Math.min(...activeIds.map((id) => map[id]));
}

export function getTripMaxSeatPrice(trip?: {
  totalSeats?: number;
  pricePerSeatIqd?: number;
  seatPrices?: Partial<Record<CabinSeatId, number>>;
} | null): number {
  const map = resolveTripSeatPrices(trip);
  const activeIds = getSeatIdsForCapacity(trip?.totalSeats);
  return Math.max(...activeIds.map((id) => map[id]));
}

export function isTripCompletelyEmpty(trip?: {
  status?: TripStatus;
  bookedSeats?: CabinSeatId[];
  confirmedSeatsCount?: number;
  availableSeats?: number;
  totalSeats?: number;
} | null): boolean {
  if (!trip) return false;
  return (
    trip.status === 'scheduled' &&
    (trip.bookedSeats?.length || 0) === 0 &&
    (trip.confirmedSeatsCount || 0) === 0 &&
    Number(trip.availableSeats) === Number(trip.totalSeats) &&
    Number(trip.totalSeats) > 0
  );
}

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string;
  preferredLanguage: LanguageCode;
  referralCode: string;
  referredBy?: string;
  governorateId?: string;
  photoUrl?: string;
  idDocumentUrl?: string;
  portraitUrl?: string;
  licenseDocumentUrl?: string;
  vehicleModel?: string;
  plateNumber?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UserPrivateInfo {
  uid: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  updatedAt?: unknown;
}

export interface DriverProfile {
  uid: string;
  fullName: string;
  phone: string;
  governorateId: string;
  homeGarageId?: string;
  licenseNumber: string;
  nationalIdNumber: string;
  idDocumentUrl?: string;
  licenseDocumentUrl?: string;
  operatingGovIds?: string[];
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  completedTripsCount: number;
  bio?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PublicDriverProfile {
  uid: string;
  fullName: string;
  governorateId: string;
  homeGarageId?: string;
  operatingGovIds?: string[];
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  completedTripsCount: number;
  vehicleModel?: string;
  vehiclePhotoUrl?: string;
  bio?: string;
  updatedAt?: unknown;
}

export interface Vehicle {
  id: string;
  driverId: string;
  makeModel: string;
  year: number;
  plateNumber: string;
  color?: string;
  passengerCapacity: number;
  hasAc?: boolean;
  hasWifi?: boolean;
  photoUrl?: string;
  verified: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Governorate {
  id: string;
  code: string;
  nameAr: string;
  nameKu: string;
  nameEn: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

export interface City {
  id: string;
  governorateId: string;
  nameAr: string;
  nameKu: string;
  nameEn: string;
  isActive: boolean;
}

export interface Garage {
  id: string;
  governorateId: string;
  cityId?: string;
  nameAr: string;
  nameKu: string;
  nameEn: string;
  addressAr?: string;
  addressKu?: string;
  addressEn?: string;
  lat: number;
  lng: number;
  operatingHours?: string;
  isActive: boolean;
}

export interface Trip {
  id: string;
  driverId: string;
  driverName: string;
  driverRating?: number;
  driverCompletedTrips?: number;
  driverVerified?: boolean;
  vehicleId: string;
  vehicleModel: string;
  vehiclePlate?: string;
  vehiclePhotoUrl?: string;
  departureGovId: string;
  destinationGovId: string;
  departureGarageId: string;
  destinationGarageId: string;
  departureDate: string;
  departureTime: string;
  estimatedDurationMin?: number;
  pricePerSeatIqd: number;
  seatPrices?: SeatPricesMap;
  fullCarPriceIqd?: number;
  cargoEnabled?: boolean;
  cargoPriceIqd?: number;
  originalPriceIqd?: number;
  isSpecialOffer?: boolean;
  totalSeats: number;
  availableSeats: number;
  confirmedSeatsCount: number;
  bookedSeats?: CabinSeatId[];
  status: TripStatus;
  notes?: string;
  liveTrackingEnabled?: boolean;
  liveLat?: number;
  liveLng?: number;
  lastBookingId?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone?: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
  departureGovId?: string;
  destinationGovId?: string;
  departureDate?: string;
  departureTime?: string;
  seatsCount: number;
  selectedSeats?: CabinSeatId[];
  seatPriceIqd: number;
  seatsSubtotalIqd?: number;
  includeCargo?: boolean;
  cargoFeeIqd?: number;
  cargoNotes?: string;
  totalPriceIqd: number;
  pointsRedeemed: number;
  isFreeTrip: boolean;
  isFullCar?: boolean;
  isRoundTrip?: boolean;
  returnTripId?: string;
  passengerNotes?: string;
  useCustomDropOff?: boolean;
  customDropOffFeeIqd?: number;
  customDropOffLat?: number;
  customDropOffLng?: number;
  customDropOffAddress?: string;
  status: BookingStatus;
  cancellationReason?: string;
  rescheduleRequestedDate?: string;
  pointsAwarded: boolean;
  referralRewarded?: boolean;
  reviewSubmitted: boolean;
  shareToken?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Payment {
  id: string;
  bookingId: string;
  tripId: string;
  passengerId: string;
  driverId: string;
  amountIqd: number;
  commissionIqd: number;
  netDriverIqd: number;
  method: PaymentMethod;
  status: PaymentStatus;
  disputeReason?: string;
  confirmedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PointsWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  lastBookingId?: string;
  updatedAt?: unknown;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn_trip' | 'redeem_trip' | 'referral_bonus' | 'admin_adjust' | 'refund_points';
  amount: number;
  bookingId?: string;
  description: string;
  createdBy: string;
  createdAt?: unknown;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  referralCode: string;
  status: 'pending' | 'completed';
  bonusPointsReferrer: number;
  bonusPointsReferee: number;
  completedBookingId?: string;
  createdAt?: unknown;
  completedAt?: unknown;
}

export interface Review {
  id: string;
  bookingId: string;
  tripId: string;
  driverId: string;
  passengerId: string;
  passengerName: string;
  driverRating: number;
  vehicleRating: number;
  experienceRating: number;
  comment: string;
  status: 'published' | 'hidden';
  createdAt?: unknown;
}

export interface AppNotification {
  id: string;
  userId: string;
  titleAr: string;
  titleKu: string;
  titleEn: string;
  bodyAr: string;
  bodyKu: string;
  bodyEn: string;
  type: 'booking' | 'payment' | 'loyalty' | 'driver_status' | 'seat_alert' | 'system';
  relatedId?: string;
  isRead: boolean;
  createdAt?: unknown;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userRole: 'passenger' | 'driver';
  bookingId?: string;
  category: 'payment' | 'driver_behavior' | 'passenger_behavior' | 'vehicle' | 'app_issue' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SeatAlert {
  id: string;
  tripId: string;
  driverId: string;
  userId: string;
  requestedSeats: number;
  notified: boolean;
  createdAt?: unknown;
}

export interface PlatformSettings {
  pointsPerTrip: number;
  freeTripCostPoints: number;
  maxFreeTripValueIqd: number;
  referralBonusReferrer: number;
  referralBonusReferee: number;
  commissionRatePercent: number;
  cancellationHoursLimit: number;
  supportPhone?: string;
  supportEmail?: string;
  updatedAt?: unknown;
}

export type WeeklyFeeStatus = 'pending' | 'approved' | 'rejected';

export interface DriverWeeklyFee {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  senderNameOnTransfer: string;
  weekKey: string;
  amountIqd: number;
  rafidainNumber: string;
  status: WeeklyFeeStatus;
  adminNotes?: string;
  reviewedBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const BAGHDAD_OFFSET_MS = 3 * 3600 * 1000;

export function getWeekKey(input?: string | Date | { seconds?: number }): string {
  let date: Date;
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}/.test(input)) {
    const [y, m, d] = input.slice(0, 10).split('-').map(Number);
    date = new Date(Date.UTC(y, m - 1, d));
  } else if (input instanceof Date) {
    const baghdad = new Date(input.getTime() + BAGHDAD_OFFSET_MS);
    date = new Date(Date.UTC(baghdad.getUTCFullYear(), baghdad.getUTCMonth(), baghdad.getUTCDate()));
  } else if (input && typeof input === 'object' && typeof input.seconds === 'number') {
    const baghdad = new Date(input.seconds * 1000 + BAGHDAD_OFFSET_MS);
    date = new Date(Date.UTC(baghdad.getUTCFullYear(), baghdad.getUTCMonth(), baghdad.getUTCDate()));
  } else {
    const baghdadNow = new Date(Date.now() + BAGHDAD_OFFSET_MS);
    date = new Date(Date.UTC(baghdadNow.getUTCFullYear(), baghdadNow.getUTCMonth(), baghdadNow.getUTCDate()));
  }

  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getTripWeekKey(trip: {
  departureDate?: string;
  createdAt?: unknown;
}): string {
  const ts = trip.createdAt as { seconds?: number; toDate?: () => Date } | undefined;
  if (ts && typeof ts.toDate === 'function') {
    return getWeekKey(ts.toDate());
  }
  if (ts && typeof ts.seconds === 'number') {
    return getWeekKey({ seconds: ts.seconds });
  }
  if (trip.departureDate) {
    return getWeekKey(trip.departureDate);
  }
  return getWeekKey();
}

export type LanguageCode = 'ar' | 'ku' | 'en';

export type UserRole = 'passenger' | 'driver' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'blocked';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid' | 'disputed' | 'refunded';
export type PaymentMethod = 'cash' | 'points';
export type CabinSeatId = 'front_passenger' | 'rear_right' | 'rear_middle' | 'rear_left';

export interface UserProfile {
  uid: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  verificationStatus?: VerificationStatus;
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
  isSampleDemo?: boolean;
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
  totalPriceIqd: number;
  pointsRedeemed: number;
  isFreeTrip: boolean;
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

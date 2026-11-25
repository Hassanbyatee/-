import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ADMIN_ACCESS_CODE, db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DEFAULT_PLATFORM_SETTINGS,
  IRAQ_CITIES,
  IRAQ_GARAGES,
  IRAQ_GOVERNORATES,
  RAFIDAIN_TRANSFER_NUMBER,
  WEEKLY_DRIVER_COMMISSION_IQD,
} from '../data/iraqReferenceData';
import {
  getSeatIdsForCapacity,
  getTripSeatPrice,
  getTripWeekKey,
  getWeekKey,
  isTripCompletelyEmpty,
  resolveTripSeatPrices,
  type AccountStatus,
  type Booking,
  type CabinSeatId,
  type City,
  type Complaint,
  type DriverProfile,
  type DriverWeeklyFee,
  type Garage,
  type Governorate,
  type LanguageCode,
  type Payment,
  type PaymentStatus,
  type PlatformSettings,
  type PointsWallet,
  type PublicDriverProfile,
  type Referral,
  type SeatPricesMap,
  type Trip,
  type TripStatus,
  type UserProfile,
  type UserRole,
  type Vehicle,
  type VerificationStatus,
} from '../types/domain';

function generateReferralCode(uid: string): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'USER';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MASAR-${clean}${rand}`;
}

function generateShareToken(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function seedIraqReferenceData(force = false): Promise<void> {
  try {
    const govSnap = await getDocs(collection(db, 'governorates'));
    if (govSnap.empty || force) {
      const batch = writeBatch(db);
      for (const gov of IRAQ_GOVERNORATES) {
        batch.set(doc(db, 'governorates', gov.id), {
          code: gov.code,
          nameAr: gov.nameAr,
          nameKu: gov.nameKu,
          nameEn: gov.nameEn,
          lat: gov.lat,
          lng: gov.lng,
          isActive: gov.isActive,
        });
      }
      for (const city of IRAQ_CITIES) {
        batch.set(doc(db, 'cities', city.id), {
          governorateId: city.governorateId,
          nameAr: city.nameAr,
          nameKu: city.nameKu,
          nameEn: city.nameEn,
          isActive: city.isActive,
        });
      }
      for (const garage of IRAQ_GARAGES) {
        batch.set(doc(db, 'garages', garage.id), {
          governorateId: garage.governorateId,
          cityId: garage.cityId || '',
          nameAr: garage.nameAr,
          nameKu: garage.nameKu,
          nameEn: garage.nameEn,
          addressAr: garage.addressAr || '',
          addressKu: garage.addressKu || '',
          addressEn: garage.addressEn || '',
          lat: garage.lat,
          lng: garage.lng,
          operatingHours: garage.operatingHours || '05:00 - 22:00',
          isActive: garage.isActive,
        });
      }
      const settingsSnap = await getDoc(doc(db, 'platform_settings', 'global'));
      if (!settingsSnap.exists()) {
        batch.set(doc(db, 'platform_settings', 'global'), {
          ...DEFAULT_PLATFORM_SETTINGS,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'governorates');
  }
}

export async function ensureAdminDocument(
  uid: string,
  email: string,
  accessCode = ADMIN_ACCESS_CODE
): Promise<void> {
  if (accessCode.trim() !== ADMIN_ACCESS_CODE) return;
  try {
    const adminRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminRef);
    if (!snap.exists() || snap.data()?.accessCode !== ADMIN_ACCESS_CODE) {
      await setDoc(adminRef, {
        uid,
        email: (email || '').trim().slice(0, 160),
        accessCode: ADMIN_ACCESS_CODE,
        grantedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `admins/${uid}`);
  }
}

export interface RegisterProfilePayload {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: UserRole;
  preferredLanguage: LanguageCode;
  governorateId: string;
  photoUrl?: string;
  portraitUrl?: string;
  verificationStatus?: VerificationStatus;
  referralCodeInput?: string;
  // Driver / verification fields
  homeGarageId?: string;
  nationalIdNumber?: string;
  licenseNumber?: string;
  idDocumentUrl?: string;
  licenseDocumentUrl?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  plateNumber?: string;
  vehicleColor?: string;
  passengerCapacity?: number;
  vehiclePhotoUrl?: string;
}

export async function registerUserProfile(payload: RegisterProfilePayload): Promise<void> {
  const {
    uid,
    email,
    displayName,
    phone,
    role,
    preferredLanguage,
    governorateId,
    photoUrl,
    referralCodeInput,
  } = payload;

  let referrerId: string | undefined;
  const cleanRefCode = (referralCodeInput || '').trim().toUpperCase();

  if (cleanRefCode) {
    const refSnap = await getDoc(doc(db, 'referral_codes', cleanRefCode));
    if (!refSnap.exists()) {
      throw new Error('INVALID_REFERRAL_CODE');
    }
    const ownerId = refSnap.data().ownerId as string;
    if (ownerId === uid) {
      throw new Error('SELF_REFERRAL_BLOCKED');
    }
    referrerId = ownerId;
  }

  const finalRole: UserRole = role === 'driver' ? 'driver' : 'passenger';
  const myReferralCode = generateReferralCode(uid);

  try {
    const settingsSnap = await getDoc(doc(db, 'platform_settings', 'global'));
    const settings = settingsSnap.exists()
      ? (settingsSnap.data() as PlatformSettings)
      : DEFAULT_PLATFORM_SETTINGS;

    const batch = writeBatch(db);

    const userDoc: Record<string, unknown> = {
      uid,
      displayName: displayName.trim(),
      role: finalRole,
      accountStatus: 'active',
      verificationStatus: payload.verificationStatus || 'pending',
      preferredLanguage,
      referralCode: myReferralCode,
      governorateId,
      photoUrl: payload.portraitUrl || photoUrl || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (payload.idDocumentUrl) {
      userDoc.idDocumentUrl = payload.idDocumentUrl;
    }
    if (payload.portraitUrl) {
      userDoc.portraitUrl = payload.portraitUrl;
    }
    if (payload.licenseDocumentUrl) {
      userDoc.licenseDocumentUrl = payload.licenseDocumentUrl;
    }
    if (payload.vehicleModel && payload.vehicleModel.trim()) {
      userDoc.vehicleModel = payload.vehicleModel.trim();
    }
    if (payload.plateNumber && payload.plateNumber.trim()) {
      userDoc.plateNumber = payload.plateNumber.trim();
    }
    if (referrerId) {
      userDoc.referredBy = referrerId;
    }

    batch.set(doc(db, 'users', uid), userDoc);
    batch.set(doc(db, 'users', uid, 'private', 'info'), {
      uid,
      email,
      phone: phone.trim(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'points_wallets', uid), {
      userId: uid,
      balance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'referral_codes', myReferralCode), {
      code: myReferralCode,
      ownerId: uid,
      createdAt: serverTimestamp(),
    });

    if (referrerId) {
      batch.set(doc(db, 'referrals', uid), {
        referrerId,
        refereeId: uid,
        refereeName: displayName.trim(),
        referralCode: cleanRefCode,
        status: 'pending',
        bonusPointsReferrer: settings.referralBonusReferrer,
        bonusPointsReferee: settings.referralBonusReferee,
        createdAt: serverTimestamp(),
      });
    }

    if (finalRole === 'driver') {
      batch.set(doc(db, 'drivers', uid), {
        uid,
        fullName: displayName.trim(),
        phone: phone.trim(),
        governorateId,
        homeGarageId: payload.homeGarageId || '',
        licenseNumber: (payload.licenseNumber || 'PENDING').trim(),
        nationalIdNumber: (payload.nationalIdNumber || 'PENDING').trim(),
        idDocumentUrl: payload.idDocumentUrl || '',
        licenseDocumentUrl: payload.licenseDocumentUrl || '',
        operatingGovIds: [governorateId],
        verificationStatus: 'pending',
        isAvailable: true,
        ratingAvg: 0,
        ratingCount: 0,
        completedTripsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'public_drivers', uid), {
        uid,
        fullName: displayName.trim(),
        governorateId,
        homeGarageId: payload.homeGarageId || '',
        operatingGovIds: [governorateId],
        verificationStatus: 'pending',
        isAvailable: true,
        ratingAvg: 0,
        ratingCount: 0,
        completedTripsCount: 0,
        vehicleModel: (payload.vehicleModel || '').trim(),
        vehiclePhotoUrl: payload.vehiclePhotoUrl || '',
        updatedAt: serverTimestamp(),
      });
      if (payload.vehicleModel && payload.plateNumber) {
        const vehicleRef = doc(collection(db, 'vehicles'));
        batch.set(vehicleRef, {
          driverId: uid,
          makeModel: payload.vehicleModel.trim(),
          year: Number(payload.vehicleYear) || 2022,
          plateNumber: payload.plateNumber.trim(),
          color: (payload.vehicleColor || '').trim(),
          passengerCapacity: Number(payload.passengerCapacity) || 4,
          hasAc: true,
          hasWifi: false,
          photoUrl: payload.vehiclePhotoUrl || '',
          verified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
  }
}

export async function updatePassengerProfile(
  uid: string,
  updates: { displayName: string; phone: string; governorateId: string; preferredLanguage: LanguageCode; email: string }
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      displayName: updates.displayName.trim(),
      governorateId: updates.governorateId,
      preferredLanguage: updates.preferredLanguage,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'users', uid, 'private', 'info'), {
      email: updates.email,
      phone: updates.phone.trim(),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function resubmitPassengerVerificationDocs(
  uid: string,
  payload: { idDocumentUrl: string; portraitUrl: string }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      idDocumentUrl: payload.idDocumentUrl,
      portraitUrl: payload.portraitUrl,
      photoUrl: payload.portraitUrl,
      verificationStatus: 'pending',
      rejectionReason: '',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function updateDriverDocumentsAndVehicle(
  uid: string,
  driverData: {
    fullName: string;
    phone: string;
    governorateId: string;
    homeGarageId: string;
    licenseNumber: string;
    nationalIdNumber: string;
    idDocumentUrl?: string;
    licenseDocumentUrl?: string;
    bio?: string;
  },
  vehicleData: {
    vehicleId?: string;
    makeModel: string;
    year: number;
    plateNumber: string;
    color: string;
    passengerCapacity: number;
    hasAc: boolean;
    photoUrl?: string;
  }
): Promise<void> {
  try {
    const [drvSnap, usrSnap] = await Promise.all([
      getDoc(doc(db, 'drivers', uid)),
      getDoc(doc(db, 'users', uid)),
    ]);
    const wasRejected =
      (drvSnap.exists() && drvSnap.data().verificationStatus === 'rejected') ||
      (usrSnap.exists() && usrSnap.data().verificationStatus === 'rejected');

    const batch = writeBatch(db);
    const driverPatch: Record<string, unknown> = {
      fullName: driverData.fullName.trim(),
      phone: driverData.phone.trim(),
      governorateId: driverData.governorateId,
      homeGarageId: driverData.homeGarageId,
      licenseNumber: driverData.licenseNumber.trim(),
      nationalIdNumber: driverData.nationalIdNumber.trim(),
      bio: (driverData.bio || '').trim(),
      updatedAt: serverTimestamp(),
    };
    if (driverData.idDocumentUrl !== undefined) driverPatch.idDocumentUrl = driverData.idDocumentUrl;
    if (driverData.licenseDocumentUrl !== undefined) driverPatch.licenseDocumentUrl = driverData.licenseDocumentUrl;
    if (wasRejected) {
      driverPatch.verificationStatus = 'pending';
      driverPatch.rejectionReason = '';
    }

    batch.update(doc(db, 'drivers', uid), driverPatch);
    const publicPatch: Record<string, unknown> = {
      fullName: driverData.fullName.trim(),
      governorateId: driverData.governorateId,
      homeGarageId: driverData.homeGarageId,
      vehicleModel: vehicleData.makeModel.trim(),
      vehiclePhotoUrl: vehicleData.photoUrl || '',
      bio: (driverData.bio || '').trim(),
      updatedAt: serverTimestamp(),
    };
    if (wasRejected) {
      publicPatch.verificationStatus = 'pending';
    }
    batch.update(doc(db, 'public_drivers', uid), publicPatch);

    if (wasRejected && usrSnap.exists()) {
      const userPatch: Record<string, unknown> = {
        verificationStatus: 'pending',
        rejectionReason: '',
        updatedAt: serverTimestamp(),
      };
      if (driverData.idDocumentUrl && driverData.idDocumentUrl.length <= 2000) {
        userPatch.idDocumentUrl = driverData.idDocumentUrl;
      }
      if (driverData.licenseDocumentUrl && driverData.licenseDocumentUrl.length <= 2000) {
        userPatch.licenseDocumentUrl = driverData.licenseDocumentUrl;
      }
      batch.update(doc(db, 'users', uid), userPatch);
    }

    if (vehicleData.vehicleId) {
      batch.update(doc(db, 'vehicles', vehicleData.vehicleId), {
        makeModel: vehicleData.makeModel.trim(),
        year: Number(vehicleData.year),
        plateNumber: vehicleData.plateNumber.trim(),
        color: vehicleData.color.trim(),
        passengerCapacity: Number(vehicleData.passengerCapacity),
        hasAc: vehicleData.hasAc,
        photoUrl: vehicleData.photoUrl || '',
        updatedAt: serverTimestamp(),
      });
    } else {
      const vRef = doc(collection(db, 'vehicles'));
      batch.set(vRef, {
        driverId: uid,
        makeModel: vehicleData.makeModel.trim(),
        year: Number(vehicleData.year),
        plateNumber: vehicleData.plateNumber.trim(),
        color: vehicleData.color.trim(),
        passengerCapacity: Number(vehicleData.passengerCapacity),
        hasAc: vehicleData.hasAc,
        hasWifi: false,
        photoUrl: vehicleData.photoUrl || '',
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `drivers/${uid}`);
  }
}

export async function toggleDriverAvailability(uid: string, isAvailable: boolean): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'drivers', uid), { isAvailable, updatedAt: serverTimestamp() });
    batch.update(doc(db, 'public_drivers', uid), { isAvailable, updatedAt: serverTimestamp() });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `drivers/${uid}`);
  }
}

export async function publishTrip(input: {
  driver: DriverProfile;
  vehicle?: Vehicle | null;
  vehicleModel?: string;
  vehiclePlate?: string;
  vehiclePhotoUrl?: string;
  departureGovId: string;
  destinationGovId: string;
  departureGarageId: string;
  destinationGarageId: string;
  departureDate: string;
  departureTime: string;
  estimatedDurationMin: number;
  pricePerSeatIqd: number;
  seatPrices?: SeatPricesMap;
  fullCarPriceIqd?: number;
  cargoEnabled?: boolean;
  cargoPriceIqd?: number;
  originalPriceIqd?: number;
  totalSeats?: number;
  notes?: string;
}): Promise<string> {
  if (input.driver.verificationStatus !== 'approved') {
    throw new Error('UNAPPROVED_DRIVER');
  }
  if (input.departureGovId === input.destinationGovId) {
    throw new Error('SAME_GOVERNORATE');
  }

  // Enforce weekly 20,000 IQD commission gate starting after the driver's first trip of the week
  const currentWeekKey = getWeekKey();
  const driverTripsSnap = await getDocs(
    query(collection(db, 'trips'), where('driverId', '==', input.driver.uid))
  );
  const tripsThisWeek = driverTripsSnap.docs
    .map((d) => d.data() as Trip)
    .filter((tr) => tr.status !== 'cancelled' && getTripWeekKey(tr) === currentWeekKey);

  if (tripsThisWeek.length >= 1) {
    const feeSnap = await getDoc(
      doc(db, 'driver_weekly_fees', `${input.driver.uid}_${currentWeekKey}`)
    );
    const feeData = feeSnap.exists() ? (feeSnap.data() as DriverWeeklyFee) : null;
    if (!feeData || feeData.status !== 'approved') {
      throw new Error(
        feeData?.status === 'pending' ? 'WEEKLY_COMMISSION_PENDING' : 'WEEKLY_COMMISSION_REQUIRED'
      );
    }
  }

  const tripRef = doc(collection(db, 'trips'));
  const rawSeats = Number(input.totalSeats) || 4;
  const seats = rawSeats >= 6 ? 6 : Math.max(1, Math.min(4, rawSeats));
  const seatKeys = getSeatIdsForCapacity(seats);
  const resolvedAllSeats = resolveTripSeatPrices({
    pricePerSeatIqd: input.pricePerSeatIqd,
    seatPrices: input.seatPrices,
  });
  const storedSeatPrices: SeatPricesMap = {
    front_passenger: resolvedAllSeats.front_passenger,
    rear_right: resolvedAllSeats.rear_right,
    rear_middle: resolvedAllSeats.rear_middle,
    rear_left: resolvedAllSeats.rear_left,
    ...(seats >= 6
      ? {
          extra_right: resolvedAllSeats.extra_right ?? resolvedAllSeats.rear_right,
          extra_left: resolvedAllSeats.extra_left ?? resolvedAllSeats.rear_left,
        }
      : {}),
  };
  const effectiveMinPrice = Math.min(...seatKeys.map((s) => storedSeatPrices[s] ?? input.pricePerSeatIqd));
  const fullCarPriceIqd = Math.max(0, Number(input.fullCarPriceIqd) || 0);
  const cargoEnabled = Boolean(input.cargoEnabled);
  const cargoPriceIqd = cargoEnabled ? Math.max(0, Number(input.cargoPriceIqd) || 0) : 0;
  const hasDiscount = Boolean(input.originalPriceIqd && input.originalPriceIqd > effectiveMinPrice);
  const resolvedVehicleId = input.vehicle?.id || `veh_${input.driver.uid}`;
  const resolvedVehicleModel = input.vehicle
    ? `${input.vehicle.makeModel} (${input.vehicle.year})`
    : (input.vehicleModel || 'تكسي بين المحافظات').trim();
  const resolvedVehiclePlate = (input.vehicle?.plateNumber || input.vehiclePlate || '').trim();
  const resolvedVehiclePhoto = input.vehicle?.photoUrl || input.vehiclePhotoUrl || '';

  try {
    await setDoc(tripRef, {
      driverId: input.driver.uid,
      driverName: input.driver.fullName,
      driverRating: input.driver.ratingAvg || 0,
      driverCompletedTrips: input.driver.completedTripsCount || 0,
      driverVerified: true,
      vehicleId: resolvedVehicleId,
      vehicleModel: resolvedVehicleModel.slice(0, 100),
      vehiclePlate: resolvedVehiclePlate.slice(0, 40),
      vehiclePhotoUrl: resolvedVehiclePhoto,
      departureGovId: input.departureGovId,
      destinationGovId: input.destinationGovId,
      departureGarageId: input.departureGarageId,
      destinationGarageId: input.destinationGarageId,
      departureDate: input.departureDate,
      departureTime: input.departureTime,
      estimatedDurationMin: Number(input.estimatedDurationMin) || 180,
      pricePerSeatIqd: effectiveMinPrice,
      fullCarPriceIqd,
      seatPrices: storedSeatPrices,
      cargoEnabled,
      cargoPriceIqd,
      originalPriceIqd: hasDiscount ? Number(input.originalPriceIqd) : 0,
      isSpecialOffer: hasDiscount,
      totalSeats: seats,
      availableSeats: seats,
      confirmedSeatsCount: 0,
      bookedSeats: [],
      status: 'scheduled',
      notes: (input.notes || '').trim().slice(0, 400),
      liveTrackingEnabled: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return tripRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `trips/${tripRef.id}`);
  }
}

export async function updateTripDetails(
  tripId: string,
  input: {
    departureGovId: string;
    destinationGovId: string;
    departureGarageId: string;
    destinationGarageId: string;
    departureDate: string;
    departureTime: string;
    estimatedDurationMin: number;
    pricePerSeatIqd: number;
    seatPrices: SeatPricesMap;
    fullCarPriceIqd?: number;
    totalSeats?: number;
    cargoEnabled: boolean;
    cargoPriceIqd: number;
    notes?: string;
  }
): Promise<void> {
  if (input.departureGovId === input.destinationGovId) {
    throw new Error('SAME_GOVERNORATE');
  }
  const rawSeats = Number(input.totalSeats) || 4;
  const seats = rawSeats >= 6 ? 6 : Math.max(1, Math.min(4, rawSeats));
  const seatKeys = getSeatIdsForCapacity(seats);
  const resolvedAllSeats = resolveTripSeatPrices({
    pricePerSeatIqd: input.pricePerSeatIqd,
    seatPrices: input.seatPrices,
  });
  const storedSeatPrices: SeatPricesMap = {
    front_passenger: resolvedAllSeats.front_passenger,
    rear_right: resolvedAllSeats.rear_right,
    rear_middle: resolvedAllSeats.rear_middle,
    rear_left: resolvedAllSeats.rear_left,
    ...(seats >= 6
      ? {
          extra_right: resolvedAllSeats.extra_right ?? resolvedAllSeats.rear_right,
          extra_left: resolvedAllSeats.extra_left ?? resolvedAllSeats.rear_left,
        }
      : {}),
  };
  const effectiveMinPrice = Math.min(...seatKeys.map((s) => storedSeatPrices[s] ?? input.pricePerSeatIqd));
  const fullCarPriceIqd = Math.max(0, Number(input.fullCarPriceIqd) || 0);
  const cargoEnabled = Boolean(input.cargoEnabled);
  const cargoPriceIqd = cargoEnabled ? Math.max(0, Number(input.cargoPriceIqd) || 0) : 0;

  try {
    await updateDoc(doc(db, 'trips', tripId), {
      departureGovId: input.departureGovId,
      destinationGovId: input.destinationGovId,
      departureGarageId: input.departureGarageId,
      destinationGarageId: input.destinationGarageId,
      departureDate: input.departureDate,
      departureTime: input.departureTime,
      estimatedDurationMin: Number(input.estimatedDurationMin) || 180,
      pricePerSeatIqd: effectiveMinPrice,
      fullCarPriceIqd,
      seatPrices: storedSeatPrices,
      totalSeats: seats,
      availableSeats: seats,
      cargoEnabled,
      cargoPriceIqd,
      notes: (input.notes || '').trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}`);
  }
}

export async function updateTripStatus(tripId: string, status: TripStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'trips', tripId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}`);
  }
}

export async function deleteTrip(
  tripId: string,
  actorUid: string,
  isAdminActor: boolean,
  settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS
): Promise<void> {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const tripSnap = await getDoc(tripRef);
    if (!tripSnap.exists()) return;
    const trip = tripSnap.data() as Trip;

    if (!isAdminActor) {
      if (trip.driverId !== actorUid || (trip.confirmedSeatsCount || 0) > 0) {
        throw new Error('CANNOT_DELETE_TRIP_WITH_BOOKINGS');
      }
    }

    const bookingsSnap = await getDocs(
      query(
        collection(db, 'bookings'),
        where('tripId', '==', tripId),
        ...(isAdminActor ? [] : [where('driverId', '==', actorUid)])
      )
    );

    const activeBookings = bookingsSnap.docs.filter((d) =>
      ['pending', 'accepted'].includes((d.data() as Booking).status)
    );

    if (!isAdminActor && activeBookings.some((d) => (d.data() as Booking).status === 'accepted')) {
      throw new Error('CANNOT_DELETE_TRIP_WITH_BOOKINGS');
    }

    for (const bDoc of activeBookings) {
      const bData = bDoc.data() as Booking;
      if (bData.status === 'pending') {
        await rejectBookingTransaction(bDoc.id, 'Trip removed');
      } else if (isAdminActor && bData.status === 'accepted') {
        await cancelBookingTransaction(bDoc.id, actorUid, 'Trip removed by admin', settings);
      }
    }

    await deleteDoc(tripRef);
  } catch (err) {
    if (err instanceof Error && err.message === 'CANNOT_DELETE_TRIP_WITH_BOOKINGS') {
      throw err;
    }
    handleFirestoreError(err, OperationType.DELETE, `trips/${tripId}`);
  }
}

export async function updateTripLiveLocation(
  tripId: string,
  enabled: boolean,
  lat?: number,
  lng?: number
): Promise<void> {
  try {
    const patch: Record<string, unknown> = {
      liveTrackingEnabled: enabled,
      updatedAt: serverTimestamp(),
    };
    if (typeof lat === 'number' && typeof lng === 'number') {
      patch.liveLat = lat;
      patch.liveLng = lng;
    }
    await updateDoc(doc(db, 'trips', tripId), patch);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `trips/${tripId}`);
  }
}

export const CUSTOM_DROPOFF_FEE_IQD = 10000;

export async function createBookingTransaction(input: {
  trip: Trip;
  passenger: UserProfile;
  passengerPhone: string;
  seatsCount: number;
  selectedSeats?: CabinSeatId[];
  notes?: string;
  includeCargo?: boolean;
  cargoNotes?: string;
  useCustomDropOff?: boolean;
  customDropOffLat?: number;
  customDropOffLng?: number;
  customDropOffAddress?: string;
  redeemFreeTrip: boolean;
  isFullCar?: boolean;
  settings: PlatformSettings;
  returnTrip?: Trip | null;
}): Promise<string> {
  const {
    trip,
    passenger,
    passengerPhone,
    seatsCount,
    selectedSeats,
    notes,
    includeCargo,
    cargoNotes,
    useCustomDropOff,
    customDropOffLat,
    customDropOffLng,
    customDropOffAddress,
    redeemFreeTrip,
    isFullCar,
    settings,
    returnTrip,
  } = input;
  const fullCarBooking = Boolean(isFullCar);
  const chosenSeats = fullCarBooking
    ? getSeatIdsForCapacity(trip.totalSeats)
    : Array.from(new Set(selectedSeats || []));
  const effectiveSeatsCount = fullCarBooking
    ? trip.totalSeats
    : chosenSeats.length > 0
      ? chosenSeats.length
      : seatsCount;
  const effectiveRedeemFreeTrip = fullCarBooking ? false : redeemFreeTrip;
  const hasCustomDropOff =
    Boolean(useCustomDropOff) &&
    typeof customDropOffLat === 'number' &&
    typeof customDropOffLng === 'number';
  const customDropOffFeeIqd = hasCustomDropOff ? CUSTOM_DROPOFF_FEE_IQD : 0;

  if (passenger.verificationStatus !== 'approved' || passenger.accountStatus !== 'active') {
    throw new Error('UNAPPROVED_USER');
  }
  if (trip.driverId === passenger.uid) {
    throw new Error('CANNOT_BOOK_OWN_TRIP');
  }
  if (fullCarBooking) {
    if (!isTripCompletelyEmpty(trip) || Number(trip.fullCarPriceIqd || 0) <= 0) {
      throw new Error('CAR_NOT_EMPTY');
    }
  }
  const initialSeatsSubtotal = fullCarBooking
    ? Number(trip.fullCarPriceIqd || 0)
    : chosenSeats.length > 0
      ? chosenSeats.reduce((sum, seat) => sum + getTripSeatPrice(trip, seat), 0)
      : trip.pricePerSeatIqd * effectiveSeatsCount;
  if (effectiveRedeemFreeTrip && effectiveSeatsCount !== 1) {
    throw new Error('FREE_TRIP_SINGLE_SEAT_ONLY');
  }
  if (effectiveRedeemFreeTrip && initialSeatsSubtotal > settings.maxFreeTripValueIqd) {
    throw new Error('EXCEEDS_MAX_FREE_VALUE');
  }

  // Prevent duplicate active booking on same trip
  const dupQ = query(
    collection(db, 'bookings'),
    where('tripId', '==', trip.id),
    where('passengerId', '==', passenger.uid)
  );
  const dupSnap = await getDocs(dupQ);
  const hasActive = dupSnap.docs.some((d) => ['pending', 'accepted'].includes(d.data().status));
  if (hasActive) {
    throw new Error('DUPLICATE_BOOKING');
  }

  const bookingRef = doc(collection(db, 'bookings'));
  const returnBookingRef = !fullCarBooking && returnTrip ? doc(collection(db, 'bookings')) : null;
  const notifRef = doc(collection(db, 'notifications'));
  const txRef = doc(collection(db, 'points_transactions'));

  try {
    await runTransaction(db, async (tx) => {
      const tripSnap = await tx.get(doc(db, 'trips', trip.id));
      if (!tripSnap.exists()) throw new Error('TRIP_NOT_FOUND');
      const liveTrip = tripSnap.data() as Trip;
      const currentBookedSeats = (liveTrip.bookedSeats || []) as CabinSeatId[];

      if (fullCarBooking) {
        if (!isTripCompletelyEmpty(liveTrip) || Number(liveTrip.fullCarPriceIqd || 0) <= 0) {
          throw new Error('CAR_NOT_EMPTY');
        }
      } else {
        if (liveTrip.status !== 'scheduled' || liveTrip.availableSeats < effectiveSeatsCount) {
          throw new Error('INSUFFICIENT_SEATS');
        }
        if (chosenSeats.some((seat) => currentBookedSeats.includes(seat))) {
          throw new Error('SEAT_ALREADY_BOOKED');
        }
      }

      const liveChosenSeats = fullCarBooking
        ? getSeatIdsForCapacity(liveTrip.totalSeats)
        : chosenSeats;
      const liveSeatsCount = fullCarBooking ? liveTrip.totalSeats : effectiveSeatsCount;

      let returnLiveTrip: Trip | null = null;
      let returnAssignedSeats: CabinSeatId[] = [];
      if (!fullCarBooking && returnTrip && returnBookingRef) {
        const retSnap = await tx.get(doc(db, 'trips', returnTrip.id));
        if (!retSnap.exists()) throw new Error('TRIP_NOT_FOUND');
        returnLiveTrip = retSnap.data() as Trip;
        if (returnLiveTrip.status !== 'scheduled' || returnLiveTrip.availableSeats < liveSeatsCount) {
          throw new Error('INSUFFICIENT_SEATS');
        }
        const retBooked = (returnLiveTrip.bookedSeats || []) as CabinSeatId[];
        const retFree = getSeatIdsForCapacity(returnLiveTrip.totalSeats).filter((s) => !retBooked.includes(s));
        returnAssignedSeats = retFree.slice(0, liveSeatsCount);
      }

      let walletData: PointsWallet | null = null;
      if (effectiveRedeemFreeTrip) {
        const wSnap = await tx.get(doc(db, 'points_wallets', passenger.uid));
        if (!wSnap.exists()) throw new Error('INSUFFICIENT_POINTS');
        walletData = wSnap.data() as PointsWallet;
        if (walletData.balance < settings.freeTripCostPoints) {
          throw new Error('INSUFFICIENT_POINTS');
        }
      }

      // All reads complete — execute writes
      const seatsSubtotalIqd = fullCarBooking
        ? Number(liveTrip.fullCarPriceIqd || 0)
        : liveChosenSeats.length > 0
          ? liveChosenSeats.reduce((sum, seat) => sum + getTripSeatPrice(liveTrip, seat), 0)
          : liveTrip.pricePerSeatIqd * liveSeatsCount;
      const canIncludeCargo = Boolean(
        includeCargo && liveTrip.cargoEnabled && Number(liveTrip.cargoPriceIqd || 0) >= 0
      );
      const cargoFeeIqd = canIncludeCargo ? Number(liveTrip.cargoPriceIqd || 0) : 0;
      const totalPriceIqd =
        (effectiveRedeemFreeTrip ? 0 : seatsSubtotalIqd) + cargoFeeIqd + customDropOffFeeIqd;
      const pointsRedeemed = effectiveRedeemFreeTrip ? settings.freeTripCostPoints : 0;
      const singleSeatPrice =
        !fullCarBooking && liveChosenSeats.length === 1
          ? getTripSeatPrice(liveTrip, liveChosenSeats[0])
          : liveTrip.pricePerSeatIqd;

      tx.set(bookingRef, {
        tripId: trip.id,
        passengerId: passenger.uid,
        passengerName: passenger.displayName,
        passengerPhone: passengerPhone || '',
        driverId: liveTrip.driverId,
        driverName: liveTrip.driverName,
        departureGovId: liveTrip.departureGovId,
        destinationGovId: liveTrip.destinationGovId,
        departureDate: liveTrip.departureDate,
        departureTime: liveTrip.departureTime,
        seatsCount: liveSeatsCount,
        ...(liveChosenSeats.length > 0 ? { selectedSeats: liveChosenSeats } : {}),
        isFullCar: fullCarBooking,
        seatPriceIqd: singleSeatPrice,
        seatsSubtotalIqd,
        includeCargo: canIncludeCargo,
        cargoFeeIqd,
        ...(canIncludeCargo && cargoNotes?.trim()
          ? { cargoNotes: cargoNotes.trim().slice(0, 240) }
          : {}),
        totalPriceIqd,
        pointsRedeemed,
        isFreeTrip: effectiveRedeemFreeTrip,
        isRoundTrip: Boolean(!fullCarBooking && returnTrip),
        returnTripId: !fullCarBooking && returnTrip ? returnTrip.id : '',
        passengerNotes: (notes || '').trim().slice(0, 300),
        useCustomDropOff: hasCustomDropOff,
        customDropOffFeeIqd,
        ...(hasCustomDropOff
          ? {
              customDropOffLat,
              customDropOffLng,
              customDropOffAddress: (customDropOffAddress || '').trim().slice(0, 240),
            }
          : {}),
        status: 'pending',
        pointsAwarded: false,
        referralRewarded: false,
        reviewSubmitted: false,
        shareToken: generateShareToken(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (liveChosenSeats.length > 0) {
        tx.update(doc(db, 'trips', trip.id), {
          bookedSeats: Array.from(new Set([...currentBookedSeats, ...liveChosenSeats])),
          lastBookingId: bookingRef.id,
          updatedAt: serverTimestamp(),
        });
      }

      if (effectiveRedeemFreeTrip && walletData) {
        tx.update(doc(db, 'points_wallets', passenger.uid), {
          balance: walletData.balance - pointsRedeemed,
          totalRedeemed: walletData.totalRedeemed + pointsRedeemed,
          lastBookingId: bookingRef.id,
          updatedAt: serverTimestamp(),
        });
        tx.set(txRef, {
          userId: passenger.uid,
          type: 'redeem_trip',
          amount: -pointsRedeemed,
          bookingId: bookingRef.id,
          description: `Free trip redemption (${liveTrip.departureGovId.toUpperCase()} -> ${liveTrip.destinationGovId.toUpperCase()})`,
          createdBy: passenger.uid,
          createdAt: serverTimestamp(),
        });
      }

      if (!fullCarBooking && returnTrip && returnBookingRef && returnLiveTrip) {
        tx.set(returnBookingRef, {
          tripId: returnTrip.id,
          passengerId: passenger.uid,
          passengerName: passenger.displayName,
          passengerPhone: passengerPhone || '',
          driverId: returnLiveTrip.driverId,
          driverName: returnLiveTrip.driverName,
          departureGovId: returnLiveTrip.departureGovId,
          destinationGovId: returnLiveTrip.destinationGovId,
          departureDate: returnLiveTrip.departureDate,
          departureTime: returnLiveTrip.departureTime,
          seatsCount: liveSeatsCount,
          ...(returnAssignedSeats.length > 0 ? { selectedSeats: returnAssignedSeats } : {}),
          isFullCar: false,
          seatPriceIqd: returnLiveTrip.pricePerSeatIqd,
          totalPriceIqd: returnLiveTrip.pricePerSeatIqd * liveSeatsCount,
          pointsRedeemed: 0,
          isFreeTrip: false,
          isRoundTrip: true,
          returnTripId: trip.id,
          passengerNotes: (notes || '').trim().slice(0, 300),
          status: 'pending',
          pointsAwarded: false,
          referralRewarded: false,
          reviewSubmitted: false,
          shareToken: generateShareToken(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (returnAssignedSeats.length > 0) {
          tx.update(doc(db, 'trips', returnTrip.id), {
            bookedSeats: Array.from(new Set([...(returnLiveTrip.bookedSeats || []), ...returnAssignedSeats])),
            lastBookingId: returnBookingRef.id,
            updatedAt: serverTimestamp(),
          });
        }
      }

      tx.set(notifRef, {
        userId: liveTrip.driverId,
        titleAr: fullCarBooking ? 'طلب حجز سيارة كاملة جديد' : 'طلب حجز جديد',
        titleKu: fullCarBooking ? 'داواکاری حجزی تەواوی ئۆتۆمبێل' : 'داواکاری حجزێکی نوێ',
        titleEn: fullCarBooking ? 'New Full-Car Booking Request' : 'New Booking Request',
        bodyAr: fullCarBooking
          ? `طلب ${passenger.displayName} حجز السيارة كاملة (${liveSeatsCount} مقاعد) لرحلة ${liveTrip.departureDate}.`
          : `طلب ${passenger.displayName} حجز ${liveSeatsCount} مقعد لرحلة ${liveTrip.departureDate}.`,
        bodyKu: fullCarBooking
          ? `${passenger.displayName} داوای حجزی تەواوی ئۆتۆمبێلی کرد (${liveSeatsCount} کورسی) بۆ گەشتی ${liveTrip.departureDate}.`
          : `${passenger.displayName} داوای ${liveSeatsCount} کورسی کرد بۆ گەشتی ${liveTrip.departureDate}.`,
        bodyEn: fullCarBooking
          ? `${passenger.displayName} requested a full-car booking (${liveSeatsCount} seats) for ${liveTrip.departureDate}.`
          : `${passenger.displayName} requested ${liveSeatsCount} seat(s) for ${liveTrip.departureDate}.`,
        type: 'booking',
        relatedId: bookingRef.id,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });

    return bookingRef.id;
  } catch (err) {
    if (
      err instanceof Error &&
      [
        'UNAPPROVED_USER',
        'CANNOT_BOOK_OWN_TRIP',
        'INSUFFICIENT_SEATS',
        'INSUFFICIENT_POINTS',
        'TRIP_NOT_FOUND',
        'SEAT_ALREADY_BOOKED',
        'CAR_NOT_EMPTY',
      ].includes(err.message)
    ) {
      throw err;
    }
    handleFirestoreError(err, OperationType.WRITE, `bookings/${bookingRef.id}`);
  }
}

export async function acceptBookingTransaction(
  bookingId: string,
  driverPhone: string,
  settings: PlatformSettings
): Promise<void> {
  const notifRef = doc(collection(db, 'notifications'));
  try {
    await runTransaction(db, async (tx) => {
      const bSnap = await tx.get(doc(db, 'bookings', bookingId));
      if (!bSnap.exists()) throw new Error('BOOKING_NOT_FOUND');
      const booking = bSnap.data() as Booking;
      if (booking.status !== 'pending') throw new Error('INVALID_BOOKING_STATE');

      const tSnap = await tx.get(doc(db, 'trips', booking.tripId));
      if (!tSnap.exists()) throw new Error('TRIP_NOT_FOUND');
      const trip = tSnap.data() as Trip;

      if (trip.availableSeats < booking.seatsCount) {
        throw new Error('INSUFFICIENT_SEATS');
      }

      const commissionIqd = booking.isFreeTrip
        ? 0
        : Math.round((booking.totalPriceIqd * settings.commissionRatePercent) / 100);
      const netDriverIqd = Math.max(0, booking.totalPriceIqd - commissionIqd);

      tx.update(doc(db, 'bookings', bookingId), {
        status: 'accepted',
        driverPhone: driverPhone || '',
        updatedAt: serverTimestamp(),
      });

      tx.update(doc(db, 'trips', booking.tripId), {
        availableSeats: trip.availableSeats - booking.seatsCount,
        confirmedSeatsCount: (trip.confirmedSeatsCount || 0) + booking.seatsCount,
        lastBookingId: bookingId,
        updatedAt: serverTimestamp(),
      });

      tx.set(doc(db, 'payments', bookingId), {
        bookingId,
        tripId: booking.tripId,
        passengerId: booking.passengerId,
        driverId: booking.driverId,
        amountIqd: booking.totalPriceIqd,
        commissionIqd,
        netDriverIqd,
        method: booking.isFreeTrip ? 'points' : 'cash',
        status: booking.isFreeTrip ? 'paid' : 'unpaid',
        confirmedBy: booking.isFreeTrip ? booking.passengerId : '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.set(notifRef, {
        userId: booking.passengerId,
        titleAr: 'تم تأكيد حجزك',
        titleKu: 'حجزەکەت پەسەندکرا',
        titleEn: 'Booking Confirmed',
        bodyAr: `وافق السائق ${booking.driverName || ''} على حجزك (${booking.seatsCount} مقعد) بتاريخ ${booking.departureDate || ''}.`,
        bodyKu: `شۆفێر ${booking.driverName || ''} داواکاری حجزەکەتی پەسەند کرد (${booking.seatsCount} کورسی).`,
        bodyEn: `Driver ${booking.driverName || ''} confirmed your ${booking.seatsCount} seat(s) for ${booking.departureDate || ''}.`,
        type: 'booking',
        relatedId: bookingId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    if (err instanceof Error && ['INSUFFICIENT_SEATS', 'INVALID_BOOKING_STATE'].includes(err.message)) {
      throw err;
    }
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function rejectBookingTransaction(bookingId: string, reason: string): Promise<void> {
  const notifRef = doc(collection(db, 'notifications'));
  const refundTxRef = doc(collection(db, 'points_transactions'));
  try {
    await runTransaction(db, async (tx) => {
      const bSnap = await tx.get(doc(db, 'bookings', bookingId));
      if (!bSnap.exists()) throw new Error('BOOKING_NOT_FOUND');
      const booking = bSnap.data() as Booking;
      if (booking.status !== 'pending') throw new Error('INVALID_BOOKING_STATE');

      const tSnap = await tx.get(doc(db, 'trips', booking.tripId));
      const trip = tSnap.exists() ? (tSnap.data() as Trip) : null;

      let walletData: PointsWallet | null = null;
      if (booking.isFreeTrip && booking.pointsRedeemed > 0) {
        const wSnap = await tx.get(doc(db, 'points_wallets', booking.passengerId));
        if (wSnap.exists()) walletData = wSnap.data() as PointsWallet;
      }

      tx.update(doc(db, 'bookings', bookingId), {
        status: 'rejected',
        cancellationReason: reason.trim().slice(0, 300),
        updatedAt: serverTimestamp(),
      });

      if (trip && booking.selectedSeats && booking.selectedSeats.length > 0) {
        const nextBooked = (trip.bookedSeats || []).filter((s) => !booking.selectedSeats?.includes(s));
        tx.update(doc(db, 'trips', booking.tripId), {
          bookedSeats: nextBooked,
          lastBookingId: bookingId,
          updatedAt: serverTimestamp(),
        });
      }

      if (booking.isFreeTrip && booking.pointsRedeemed > 0 && walletData) {
        tx.update(doc(db, 'points_wallets', booking.passengerId), {
          balance: walletData.balance + booking.pointsRedeemed,
          totalRedeemed: Math.max(0, walletData.totalRedeemed - booking.pointsRedeemed),
          lastBookingId: bookingId,
          updatedAt: serverTimestamp(),
        });
        tx.set(refundTxRef, {
          userId: booking.passengerId,
          type: 'refund_points',
          amount: booking.pointsRedeemed,
          bookingId,
          description: 'Refunded points after booking rejection',
          createdBy: booking.driverId,
          createdAt: serverTimestamp(),
        });
      }

      tx.set(notifRef, {
        userId: booking.passengerId,
        titleAr: 'تم رفض طلب الحجز',
        titleKu: 'داواکاری حجز ڕەتکرایەوە',
        titleEn: 'Booking Request Declined',
        bodyAr: reason ? `تم رفض الحجز: ${reason}` : 'اعتذر السائق عن قبول طلب الحجز لعدم توفر الإمكانية.',
        bodyKu: reason ? `داواکارییەکە ڕەتکرایەوە: ${reason}` : 'شۆفێر داواکاری حجزەکەی ڕەتکردەوە.',
        bodyEn: reason ? `Booking declined: ${reason}` : 'The driver declined the booking request.',
        type: 'booking',
        relatedId: bookingId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function cancelBookingTransaction(
  bookingId: string,
  actorUid: string,
  reason: string,
  settings: PlatformSettings
): Promise<void> {
  const notifRef = doc(collection(db, 'notifications'));
  const refundTxRef = doc(collection(db, 'points_transactions'));
  let freedTripId: string | null = null;
  let freedDriverId: string | null = null;

  try {
    await runTransaction(db, async (tx) => {
      const bSnap = await tx.get(doc(db, 'bookings', bookingId));
      if (!bSnap.exists()) throw new Error('BOOKING_NOT_FOUND');
      const booking = bSnap.data() as Booking;
      if (!['pending', 'accepted'].includes(booking.status)) {
        throw new Error('INVALID_BOOKING_STATE');
      }

      const isPassenger = actorUid === booking.passengerId;
      if (isPassenger && booking.status === 'accepted' && booking.departureDate && booking.departureTime) {
        const depIso = `${booking.departureDate}T${booking.departureTime.slice(0, 5)}:00`;
        const depMs = Date.parse(depIso);
        if (!Number.isNaN(depMs)) {
          const hoursUntil = (depMs - Date.now()) / (1000 * 60 * 60);
          if (hoursUntil < settings.cancellationHoursLimit) {
            throw new Error('CANCELLATION_TOO_LATE');
          }
        }
      }

      const tSnap = await tx.get(doc(db, 'trips', booking.tripId));
      const trip = tSnap.exists() ? (tSnap.data() as Trip) : null;

      let walletData: PointsWallet | null = null;
      if (booking.isFreeTrip && booking.pointsRedeemed > 0) {
        const wSnap = await tx.get(doc(db, 'points_wallets', booking.passengerId));
        if (wSnap.exists()) walletData = wSnap.data() as PointsWallet;
      }

      tx.update(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancellationReason: reason.trim().slice(0, 300),
        updatedAt: serverTimestamp(),
      });

      if (trip) {
        const nextBooked = (trip.bookedSeats || []).filter((s) => !booking.selectedSeats?.includes(s));
        if (booking.status === 'accepted') {
          freedTripId = booking.tripId;
          freedDriverId = booking.driverId;
          tx.update(doc(db, 'trips', booking.tripId), {
            availableSeats: Math.min(trip.totalSeats, trip.availableSeats + booking.seatsCount),
            confirmedSeatsCount: Math.max(0, (trip.confirmedSeatsCount || 0) - booking.seatsCount),
            bookedSeats: nextBooked,
            lastBookingId: bookingId,
            updatedAt: serverTimestamp(),
          });
        } else if (booking.status === 'pending' && booking.selectedSeats && booking.selectedSeats.length > 0) {
          tx.update(doc(db, 'trips', booking.tripId), {
            bookedSeats: nextBooked,
            lastBookingId: bookingId,
            updatedAt: serverTimestamp(),
          });
        }
      }

      if (booking.isFreeTrip && booking.pointsRedeemed > 0 && walletData) {
        tx.update(doc(db, 'points_wallets', booking.passengerId), {
          balance: walletData.balance + booking.pointsRedeemed,
          totalRedeemed: Math.max(0, walletData.totalRedeemed - booking.pointsRedeemed),
          lastBookingId: bookingId,
          updatedAt: serverTimestamp(),
        });
        tx.set(refundTxRef, {
          userId: booking.passengerId,
          type: 'refund_points',
          amount: booking.pointsRedeemed,
          bookingId,
          description: 'Points refunded upon booking cancellation',
          createdBy: actorUid,
          createdAt: serverTimestamp(),
        });
      }

      const targetUserId = isPassenger ? booking.driverId : booking.passengerId;
      tx.set(notifRef, {
        userId: targetUserId,
        titleAr: 'تم إلغاء الحجز',
        titleKu: 'حجزەکە هەڵوەشێنرایەوە',
        titleEn: 'Booking Cancelled',
        bodyAr: `تم إلغاء حجز (${booking.seatsCount} مقعد) بتاريخ ${booking.departureDate || ''}.`,
        bodyKu: `حجزی (${booking.seatsCount} کورسی) بۆ ${booking.departureDate || ''} هەڵوەشێنرایەوە.`,
        bodyEn: `Booking for ${booking.seatsCount} seat(s) on ${booking.departureDate || ''} was cancelled.`,
        type: 'booking',
        relatedId: bookingId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });

    // Notify seat alert subscribers if seats reopened
    if (freedTripId && freedDriverId && actorUid === freedDriverId) {
      await triggerSeatAlertsForTrip(freedTripId, freedDriverId);
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'CANCELLATION_TOO_LATE') {
      throw err;
    }
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function triggerSeatAlertsForTrip(tripId: string, driverId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'seat_alerts'),
      where('tripId', '==', tripId),
      where('driverId', '==', driverId),
      where('notified', '==', false)
    );
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((alertDoc) => {
      const alertData = alertDoc.data();
      batch.update(alertDoc.ref, { notified: true });
      batch.set(doc(collection(db, 'notifications')), {
        userId: alertData.userId,
        titleAr: 'توفر مقعد في رحلة تتابعها',
        titleKu: 'کورسی بەتاڵ بوو لە گەشتێکدا',
        titleEn: 'Seat Available on Watched Trip',
        bodyAr: 'أصبح هناك مقعد متاح الآن في الرحلة التي طلبت التنبيه عنها. بادر بالحجز!',
        bodyKu: 'ئێستا کورسی بەردەستە لەو گەشتەی ئاگادارکردنەوەت بۆ دانابوو!',
        bodyEn: 'A seat just opened up on a trip you are watching. Book now!',
        type: 'seat_alert',
        relatedId: tripId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
  } catch {
    // Non-blocking alert dispatch
  }
}

export async function confirmCashPayment(paymentId: string, driverUid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'paid',
      confirmedBy: driverUid,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
  }
}

export async function completeBookingTransaction(
  bookingId: string,
  driverUid: string,
  settings: PlatformSettings
): Promise<void> {
  const earnTxRef = doc(db, 'points_transactions', `earn_${bookingId}`);
  const passengerNotifRef = doc(collection(db, 'notifications'));
  const refBonusPassengerTxRef = doc(db, 'points_transactions', `ref_referee_${bookingId}`);
  const refBonusReferrerTxRef = doc(db, 'points_transactions', `ref_referrer_${bookingId}`);
  const referrerNotifRef = doc(collection(db, 'notifications'));

  try {
    await runTransaction(db, async (tx) => {
      const bSnap = await tx.get(doc(db, 'bookings', bookingId));
      if (!bSnap.exists()) throw new Error('BOOKING_NOT_FOUND');
      const booking = bSnap.data() as Booking;
      if (booking.status !== 'accepted') throw new Error('INVALID_BOOKING_STATE');
      if (booking.pointsAwarded) throw new Error('ALREADY_REWARDED');

      const pSnap = await tx.get(doc(db, 'payments', bookingId));
      const dSnap = await tx.get(doc(db, 'drivers', driverUid));
      const pdSnap = await tx.get(doc(db, 'public_drivers', driverUid));
      const walletSnap = await tx.get(doc(db, 'points_wallets', booking.passengerId));
      const refSnap = await tx.get(doc(db, 'referrals', booking.passengerId));

      const referral = refSnap.exists() ? (refSnap.data() as Referral) : null;
      const shouldRewardReferral = Boolean(referral && referral.status === 'pending');

      let referrerWalletSnap = null;
      if (shouldRewardReferral && referral) {
        referrerWalletSnap = await tx.get(doc(db, 'points_wallets', referral.referrerId));
      }

      // All reads done — perform atomic writes
      tx.update(doc(db, 'bookings', bookingId), {
        status: 'completed',
        pointsAwarded: true,
        referralRewarded: shouldRewardReferral,
        updatedAt: serverTimestamp(),
      });

      if (pSnap.exists() && pSnap.data().status === 'unpaid') {
        tx.update(doc(db, 'payments', bookingId), {
          status: 'paid',
          confirmedBy: driverUid,
          updatedAt: serverTimestamp(),
        });
      }

      if (dSnap.exists()) {
        tx.update(doc(db, 'drivers', driverUid), {
          completedTripsCount: (dSnap.data().completedTripsCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }
      if (pdSnap.exists()) {
        tx.update(doc(db, 'public_drivers', driverUid), {
          completedTripsCount: (pdSnap.data().completedTripsCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }

      const tripPoints = booking.isFreeTrip ? 0 : settings.pointsPerTrip;
      const refereeBonus = shouldRewardReferral ? (referral?.bonusPointsReferee ?? settings.referralBonusReferee) : 0;
      const totalPassengerGain = tripPoints + refereeBonus;

      if (walletSnap.exists() && totalPassengerGain > 0) {
        const w = walletSnap.data() as PointsWallet;
        tx.update(doc(db, 'points_wallets', booking.passengerId), {
          balance: w.balance + totalPassengerGain,
          totalEarned: w.totalEarned + totalPassengerGain,
          lastBookingId: bookingId,
          updatedAt: serverTimestamp(),
        });
      }

      if (tripPoints > 0) {
        tx.set(earnTxRef, {
          userId: booking.passengerId,
          type: 'earn_trip',
          amount: tripPoints,
          bookingId,
          description: `Completed intercity trip (${booking.departureGovId || ''} -> ${booking.destinationGovId || ''})`,
          createdBy: driverUid,
          createdAt: serverTimestamp(),
        });
      }

      if (shouldRewardReferral && referral) {
        tx.update(doc(db, 'referrals', booking.passengerId), {
          status: 'completed',
          completedBookingId: bookingId,
          completedAt: serverTimestamp(),
        });

        if (refereeBonus > 0) {
          tx.set(refBonusPassengerTxRef, {
            userId: booking.passengerId,
            type: 'referral_bonus',
            amount: refereeBonus,
            bookingId,
            description: 'Welcome referral bonus on first completed trip',
            createdBy: driverUid,
            createdAt: serverTimestamp(),
          });
        }

        const referrerBonus = referral.bonusPointsReferrer ?? settings.referralBonusReferrer;
        if (referrerWalletSnap && referrerWalletSnap.exists() && referrerBonus > 0) {
          const rw = referrerWalletSnap.data() as PointsWallet;
          tx.update(doc(db, 'points_wallets', referral.referrerId), {
            balance: rw.balance + referrerBonus,
            totalEarned: rw.totalEarned + referrerBonus,
            lastBookingId: bookingId,
            updatedAt: serverTimestamp(),
          });
          tx.set(refBonusReferrerTxRef, {
            userId: referral.referrerId,
            type: 'referral_bonus',
            amount: referrerBonus,
            bookingId,
            description: `Referral reward from ${booking.passengerName}`,
            createdBy: driverUid,
            createdAt: serverTimestamp(),
          });
          tx.set(referrerNotifRef, {
            userId: referral.referrerId,
            titleAr: 'مكافأة دعوة صديق',
            titleKu: 'پاداشتی بانگهێشتی هاوڕێ',
            titleEn: 'Referral Bonus Credited',
            bodyAr: `أتمّ ${booking.passengerName} أول رحلة وأُضيفت ${referrerBonus} نقطة لرصيدك.`,
            bodyKu: `${booking.passengerName} یەکەم گەشتی تەواوکرد و ${referrerBonus} خاڵ خرایە سەر هەژمارەکەت.`,
            bodyEn: `${booking.passengerName} completed their first trip! You earned ${referrerBonus} points.`,
            type: 'loyalty',
            relatedId: bookingId,
            isRead: false,
            createdAt: serverTimestamp(),
          });
        }
      }

      tx.set(passengerNotifRef, {
        userId: booking.passengerId,
        titleAr: 'اكتملت رحلتك بنجاح',
        titleKu: 'گەشتەکەت بە سەرکەوتوویی تەواوبوو',
        titleEn: 'Trip Completed',
        bodyAr:
          totalPassengerGain > 0
            ? `تمت إضافة ${totalPassengerGain} نقطة ولاء إلى محفظتك. يمكنك تقييم السائق الآن.`
            : 'اكتملت رحلتك المجانية بنجاح. يمكنك تقييم السائق الآن.',
        bodyKu:
          totalPassengerGain > 0
            ? `${totalPassengerGain} خاڵی دڵسۆزی خرایە سەر هەژمارەکەت. ئێستا دەتوانیت هەڵسەنگاندن بنووسیت.`
            : 'گەشتە بێبەرامبەرەکەت تەواوبوو. ئێستا دەتوانیت شۆفێر هەڵبسەنگێنیت.',
        bodyEn:
          totalPassengerGain > 0
            ? `${totalPassengerGain} loyalty points credited to your wallet. You can now rate your trip.`
            : 'Your reward trip is complete. You can now rate your driver.',
        type: 'loyalty',
        relatedId: bookingId,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function requestBookingReschedule(
  bookingId: string,
  newDate: string,
  notes?: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      rescheduleRequestedDate: newDate.trim(),
      ...(notes ? { passengerNotes: notes.trim().slice(0, 300) } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

export async function disputePayment(paymentId: string, reason: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'disputed',
      disputeReason: reason.trim().slice(0, 400),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
  }
}

export async function submitReviewTransaction(input: {
  booking: Booking;
  driverRating: number;
  vehicleRating: number;
  experienceRating: number;
  comment: string;
}): Promise<void> {
  const { booking, driverRating, vehicleRating, experienceRating, comment } = input;
  try {
    await runTransaction(db, async (tx) => {
      const bSnap = await tx.get(doc(db, 'bookings', booking.id));
      if (!bSnap.exists()) throw new Error('BOOKING_NOT_FOUND');
      const liveBooking = bSnap.data() as Booking;
      if (liveBooking.status !== 'completed' || liveBooking.reviewSubmitted) {
        throw new Error('CANNOT_REVIEW_BOOKING');
      }
      const pdSnap = await tx.get(doc(db, 'public_drivers', booking.driverId));
      const pd = pdSnap.exists() ? (pdSnap.data() as PublicDriverProfile) : null;

      tx.set(doc(db, 'reviews', booking.id), {
        bookingId: booking.id,
        tripId: booking.tripId,
        driverId: booking.driverId,
        passengerId: booking.passengerId,
        passengerName: booking.passengerName,
        driverRating,
        vehicleRating,
        experienceRating,
        comment: comment.trim().slice(0, 600),
        status: 'published',
        createdAt: serverTimestamp(),
      });

      tx.update(doc(db, 'bookings', booking.id), {
        reviewSubmitted: true,
        updatedAt: serverTimestamp(),
      });

      if (pd) {
        const oldCount = pd.ratingCount || 0;
        const oldAvg = pd.ratingAvg || 0;
        const nextCount = oldCount + 1;
        const nextAvg = Number((((oldAvg * oldCount) + driverRating) / nextCount).toFixed(2));
        tx.update(doc(db, 'public_drivers', booking.driverId), {
          ratingAvg: nextAvg,
          ratingCount: nextCount,
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `reviews/${booking.id}`);
  }
}

export async function subscribeSeatAlert(tripId: string, driverId: string, userId: string, seats = 1): Promise<void> {
  const alertId = `${tripId}_${userId}`;
  try {
    await setDoc(doc(db, 'seat_alerts', alertId), {
      tripId,
      driverId,
      userId,
      requestedSeats: seats,
      notified: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `seat_alerts/${alertId}`);
  }
}

export async function submitComplaint(input: {
  userId: string;
  userName: string;
  userRole: 'passenger' | 'driver';
  bookingId?: string;
  category: Complaint['category'];
  subject: string;
  description: string;
}): Promise<void> {
  const cRef = doc(collection(db, 'complaints'));
  try {
    await setDoc(cRef, {
      userId: input.userId,
      userName: input.userName,
      userRole: input.userRole,
      bookingId: input.bookingId || '',
      category: input.category,
      subject: input.subject.trim().slice(0, 140),
      description: input.description.trim().slice(0, 1000),
      status: 'open',
      adminNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `complaints/${cRef.id}`);
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

export async function markAllNotificationsRead(notificationIds: string[]): Promise<void> {
  if (notificationIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    notificationIds.forEach((id) => {
      batch.update(doc(db, 'notifications', id), { isRead: true });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'notifications');
  }
}

// --- ADMIN OPERATIONS ---

export async function adminSetDriverVerification(
  driverId: string,
  status: VerificationStatus,
  reason = ''
): Promise<void> {
  const cleanReason = status === 'approved' ? '' : reason.trim().slice(0, 400);
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'drivers', driverId), {
      verificationStatus: status,
      rejectionReason: cleanReason,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'public_drivers', driverId), {
      verificationStatus: status,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'users', driverId), {
      verificationStatus: status,
      rejectionReason: cleanReason,
      updatedAt: serverTimestamp(),
    });
    if (status === 'approved') {
      const vSnap = await getDocs(query(collection(db, 'vehicles'), where('driverId', '==', driverId)));
      vSnap.docs.forEach((vDoc) => {
        batch.update(vDoc.ref, { verified: true, updatedAt: serverTimestamp() });
      });
    }
    batch.set(doc(collection(db, 'notifications')), {
      userId: driverId,
      titleAr: status === 'approved' ? 'تمت الموافقة على حساب السائق' : 'تحديث حالة توثيق السائق',
      titleKu: status === 'approved' ? 'هەژماری شۆفێر پەسەندکرا' : 'نوێکردنەوەی باری شۆفێر',
      titleEn: status === 'approved' ? 'Driver Account Approved' : 'Driver Verification Update',
      bodyAr:
        status === 'approved'
          ? 'يمكنك الآن نشر رحلاتك بين المحافظات واستقبال طلبات الحجز.'
          : `حالة الحساب الحالية: ${status}. ${cleanReason}`,
      bodyKu:
        status === 'approved'
          ? 'ئێستا دەتوانیت گەشت بڵاوبکەیتەوە و داواکاری وەربگریت.'
          : `بارودۆخی هەژمار: ${status}. ${cleanReason}`,
      bodyEn:
        status === 'approved'
          ? 'You can now publish intercity trips and accept seat bookings.'
          : `Verification status updated to ${status}. ${cleanReason}`,
      type: 'driver_status',
      relatedId: driverId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `drivers/${driverId}`);
  }
}

export async function adminSetUserVerification(
  uid: string,
  status: VerificationStatus,
  reason = ''
): Promise<void> {
  const cleanReason = status === 'approved' ? '' : reason.trim().slice(0, 400);
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), {
      verificationStatus: status,
      rejectionReason: cleanReason,
      updatedAt: serverTimestamp(),
    });
    const drvSnap = await getDoc(doc(db, 'drivers', uid));
    if (drvSnap.exists()) {
      batch.update(doc(db, 'drivers', uid), {
        verificationStatus: status,
        rejectionReason: cleanReason,
        updatedAt: serverTimestamp(),
      });
    }
    const pubDrvSnap = await getDoc(doc(db, 'public_drivers', uid));
    if (pubDrvSnap.exists()) {
      batch.update(doc(db, 'public_drivers', uid), {
        verificationStatus: status,
        updatedAt: serverTimestamp(),
      });
    }
    batch.set(doc(collection(db, 'notifications')), {
      userId: uid,
      titleAr: status === 'approved' ? 'تمت الموافقة على توثيق حسابك' : 'تحديث حالة توثيق الحساب',
      titleKu: status === 'approved' ? 'هەژمارەکەت پەسەندکرا' : 'نوێکردنەوەی پەسەندکردنی هەژمار',
      titleEn: status === 'approved' ? 'Account Verification Approved' : 'Account Verification Update',
      bodyAr:
        status === 'approved'
          ? 'حسابك مفعّل وموثّق الآن. يمكنك استخدام جميع خدمات مسار العراق.'
          : `تم تحديث حالة التوثيق إلى ${status}. ${cleanReason}`,
      bodyKu:
        status === 'approved'
          ? 'هەژمارەکەت ئێستا چالاک و باوەڕپێکراوە. دەتوانیت هەموو خزمەتگوزارییەکان بەکاربهێنیت.'
          : `بارودۆخی پەسەندکردن گۆڕدرا بۆ ${status}. ${cleanReason}`,
      bodyEn:
        status === 'approved'
          ? 'Your account is now verified and active on Masar Iraq.'
          : `Verification status updated to ${status}. ${cleanReason}`,
      type: 'system',
      relatedId: uid,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function adminUpdateUserStatus(uid: string, accountStatus: AccountStatus): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      accountStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

export async function adminSaveGarage(garage: Omit<Garage, 'id'> & { id?: string }): Promise<void> {
  const ref = garage.id ? doc(db, 'garages', garage.id) : doc(collection(db, 'garages'));
  try {
    await setDoc(ref, {
      governorateId: garage.governorateId,
      cityId: garage.cityId || '',
      nameAr: garage.nameAr.trim(),
      nameKu: garage.nameKu.trim(),
      nameEn: garage.nameEn.trim(),
      addressAr: (garage.addressAr || '').trim(),
      addressKu: (garage.addressKu || '').trim(),
      addressEn: (garage.addressEn || '').trim(),
      lat: Number(garage.lat),
      lng: Number(garage.lng),
      operatingHours: (garage.operatingHours || '05:00 - 22:00').trim(),
      isActive: garage.isActive,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `garages/${ref.id}`);
  }
}

export async function adminDeleteGarage(garageId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'garages', garageId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `garages/${garageId}`);
  }
}

export async function adminSaveGovernorate(gov: Governorate): Promise<void> {
  try {
    await setDoc(doc(db, 'governorates', gov.id), {
      code: gov.code,
      nameAr: gov.nameAr,
      nameKu: gov.nameKu,
      nameEn: gov.nameEn,
      lat: Number(gov.lat),
      lng: Number(gov.lng),
      isActive: gov.isActive,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `governorates/${gov.id}`);
  }
}

export async function adminSaveCity(city: City): Promise<void> {
  try {
    await setDoc(doc(db, 'cities', city.id), {
      governorateId: city.governorateId,
      nameAr: city.nameAr,
      nameKu: city.nameKu,
      nameEn: city.nameEn,
      isActive: city.isActive,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `cities/${city.id}`);
  }
}

export async function adminSavePlatformSettings(settings: PlatformSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'platform_settings', 'global'), {
      pointsPerTrip: Number(settings.pointsPerTrip),
      freeTripCostPoints: Number(settings.freeTripCostPoints),
      maxFreeTripValueIqd: Number(settings.maxFreeTripValueIqd),
      referralBonusReferrer: Number(settings.referralBonusReferrer),
      referralBonusReferee: Number(settings.referralBonusReferee),
      commissionRatePercent: Number(settings.commissionRatePercent),
      cancellationHoursLimit: Number(settings.cancellationHoursLimit),
      supportPhone: (settings.supportPhone || '').trim(),
      supportEmail: (settings.supportEmail || '').trim(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'platform_settings/global');
  }
}

export async function adminAdjustWalletPoints(
  userId: string,
  delta: number,
  description: string,
  adminUid: string
): Promise<void> {
  const txRef = doc(collection(db, 'points_transactions'));
  try {
    await runTransaction(db, async (tx) => {
      const wRef = doc(db, 'points_wallets', userId);
      const wSnap = await tx.get(wRef);
      if (!wSnap.exists()) throw new Error('WALLET_NOT_FOUND');
      const w = wSnap.data() as PointsWallet;
      const nextBalance = Math.max(0, w.balance + delta);
      tx.update(wRef, {
        balance: nextBalance,
        totalEarned: delta > 0 ? w.totalEarned + delta : w.totalEarned,
        totalRedeemed: delta < 0 ? w.totalRedeemed + Math.abs(delta) : w.totalRedeemed,
        updatedAt: serverTimestamp(),
      });
      tx.set(txRef, {
        userId,
        type: 'admin_adjust',
        amount: delta,
        description: description.trim().slice(0, 240),
        createdBy: adminUid,
        createdAt: serverTimestamp(),
      });
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `points_wallets/${userId}`);
  }
}

export async function adminResolvePayment(paymentId: string, status: PaymentStatus, adminUid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status,
      confirmedBy: adminUid,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `payments/${paymentId}`);
  }
}

export async function adminUpdateComplaint(
  complaintId: string,
  status: Complaint['status'],
  adminNotes: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'complaints', complaintId), {
      status,
      adminNotes: adminNotes.trim().slice(0, 500),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `complaints/${complaintId}`);
  }
}

export async function adminSetReviewStatus(reviewId: string, status: 'published' | 'hidden'): Promise<void> {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
  }
}

export async function adminSendNotification(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  const ref = doc(collection(db, 'notifications'));
  try {
    await setDoc(ref, {
      userId: userId.trim(),
      titleAr: title.trim().slice(0, 140),
      titleKu: title.trim().slice(0, 140),
      titleEn: title.trim().slice(0, 140),
      bodyAr: body.trim().slice(0, 360),
      bodyKu: body.trim().slice(0, 360),
      bodyEn: body.trim().slice(0, 360),
      type: 'system',
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `notifications/${ref.id}`);
  }
}

export async function submitWeeklyCommissionPayment(input: {
  driver: DriverProfile;
  senderNameOnTransfer: string;
  weekKey?: string;
}): Promise<string> {
  const cleanSender = input.senderNameOnTransfer.trim().slice(0, 120);
  if (cleanSender.length < 2) {
    throw new Error('INVALID_TRANSFER_NAME');
  }
  const weekKey = input.weekKey || getWeekKey();
  const feeId = `${input.driver.uid}_${weekKey}`;
  const feeRef = doc(db, 'driver_weekly_fees', feeId);

  try {
    const existing = await getDoc(feeRef);
    if (existing.exists()) {
      const data = existing.data() as DriverWeeklyFee;
      if (data.status === 'approved') {
        return feeId;
      }
      if (data.status === 'pending') {
        throw new Error('WEEKLY_COMMISSION_PENDING');
      }
      await updateDoc(feeRef, {
        driverName: input.driver.fullName.trim().slice(0, 100),
        driverPhone: (input.driver.phone || '').trim().slice(0, 24),
        senderNameOnTransfer: cleanSender,
        status: 'pending',
        adminNotes: '',
        reviewedBy: '',
        updatedAt: serverTimestamp(),
      });
      return feeId;
    }

    await setDoc(feeRef, {
      driverId: input.driver.uid,
      driverName: input.driver.fullName.trim().slice(0, 100),
      driverPhone: (input.driver.phone || '').trim().slice(0, 24),
      senderNameOnTransfer: cleanSender,
      weekKey,
      amountIqd: WEEKLY_DRIVER_COMMISSION_IQD,
      rafidainNumber: RAFIDAIN_TRANSFER_NUMBER,
      status: 'pending',
      adminNotes: '',
      reviewedBy: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return feeId;
  } catch (err) {
    if (
      err instanceof Error &&
      ['WEEKLY_COMMISSION_PENDING', 'INVALID_TRANSFER_NAME'].includes(err.message)
    ) {
      throw err;
    }
    handleFirestoreError(err, OperationType.WRITE, `driver_weekly_fees/${feeId}`);
  }
}

export async function adminReviewWeeklyCommission(
  feeId: string,
  driverId: string,
  status: 'approved' | 'rejected',
  adminUid: string,
  adminNotes = ''
): Promise<void> {
  const cleanNotes = status === 'approved' ? '' : adminNotes.trim().slice(0, 400);
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'driver_weekly_fees', feeId), {
      status,
      adminNotes: cleanNotes,
      reviewedBy: adminUid.slice(0, 128),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(collection(db, 'notifications')), {
      userId: driverId,
      titleAr:
        status === 'approved'
          ? 'تم اعتماد اشتراك الأسبوع (20,000 د.ع)'
          : 'تم رفض إثبات عمولة الأسبوع',
      titleKu:
        status === 'approved'
          ? 'کۆمیسیۆنی هەفتانە پەسەندکرا (20,000 د.ع)'
          : 'پارەدانی هەفتانە ڕەتکرایەوە',
      titleEn:
        status === 'approved'
          ? 'Weekly Commission Approved (20,000 IQD)'
          : 'Weekly Commission Rejected',
      bodyAr:
        status === 'approved'
          ? 'تمت مطابقة حوالة الرافدين وتفعيل حسابك لنشر الرحلات هذا الأسبوع.'
          : `يرجى إعادة التحويل على رقم الرافدين (${RAFIDAIN_TRANSFER_NUMBER}) مع كتابة اسمك في ملاحظات التحويل. ${cleanNotes}`,
      bodyKu:
        status === 'approved'
          ? 'حەواڵەی ڕافیدەین پشتڕاستکرایەوە و دەتوانیت گەشت بڵاوبکەیتەوە.'
          : `تکایە حەواڵە بنێرەوە بۆ (${RAFIDAIN_TRANSFER_NUMBER}) و ناوت لە تێبینی بنووسە. ${cleanNotes}`,
      bodyEn:
        status === 'approved'
          ? 'Your 20,000 IQD Rafidain transfer was verified. You can now publish trips this week.'
          : `Please re-submit your 20,000 IQD Rafidain transfer (${RAFIDAIN_TRANSFER_NUMBER}) with your name in the transfer notes. ${cleanNotes}`,
      type: 'payment',
      relatedId: feeId,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `driver_weekly_fees/${feeId}`);
  }
}

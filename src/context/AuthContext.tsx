import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, BOOTSTRAP_ADMIN_EMAIL, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { DEFAULT_PLATFORM_SETTINGS, IRAQ_CITIES, IRAQ_GARAGES, IRAQ_GOVERNORATES } from '../data/iraqReferenceData';
import { ensureAdminDocument } from '../services/platformService';
import type {
  AppNotification,
  CabinSeatId,
  City,
  DriverProfile,
  Garage,
  Governorate,
  PlatformSettings,
  PointsWallet,
  PublicDriverProfile,
  Review,
  Trip,
  UserPrivateInfo,
  UserProfile,
} from '../types/domain';

const DEMO_STORAGE_KEY = 'masar_demo_trip_booked_seats_v1';
const DEFAULT_DEMO_BOOKED_SEATS: CabinSeatId[] = ['rear_left'];

function getTomorrowIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function loadDemoBookedSeats(): CabinSeatId[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_BOOKED_SEATS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((s): s is CabinSeatId =>
        ['front_passenger', 'rear_right', 'rear_middle', 'rear_left'].includes(String(s))
      );
      return valid;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_DEMO_BOOKED_SEATS;
}

interface AuthContextValue {
  firebaseUser: User | null;
  authReady: boolean;
  userProfile: UserProfile | null;
  privateInfo: UserPrivateInfo | null;
  driverProfile: DriverProfile | null;
  wallet: PointsWallet | null;
  isAdmin: boolean;
  needsOnboarding: boolean;
  governorates: Governorate[];
  cities: City[];
  garages: Garage[];
  settings: PlatformSettings;
  trips: Trip[];
  publicDrivers: PublicDriverProfile[];
  publishedReviews: Review[];
  notifications: AppNotification[];
  bookDemoTrip: (seats: CabinSeatId[]) => void;
  resetDemoTrip: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [privateInfo, setPrivateInfo] = useState<UserPrivateInfo | null>(null);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [wallet, setWallet] = useState<PointsWallet | null>(null);
  const [hasAdminDoc, setHasAdminDoc] = useState(false);

  const [governorates, setGovernorates] = useState<Governorate[]>(IRAQ_GOVERNORATES);
  const [cities, setCities] = useState<City[]>(IRAQ_CITIES);
  const [garages, setGarages] = useState<Garage[]>(IRAQ_GARAGES);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [firestoreTrips, setFirestoreTrips] = useState<Trip[]>([]);
  const [demoBookedSeats, setDemoBookedSeats] = useState<CabinSeatId[]>(loadDemoBookedSeats);
  const [publicDrivers, setPublicDrivers] = useState<PublicDriverProfile[]>([]);
  const [publishedReviews, setPublishedReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) {
        setUserProfile(null);
        setPrivateInfo(null);
        setDriverProfile(null);
        setWallet(null);
        setHasAdminDoc(false);
        setNotifications([]);
        setProfileLoaded(true);
        return;
      }
      setProfileLoaded(false);
      if (user.email === BOOTSTRAP_ADMIN_EMAIL && user.emailVerified) {
        try {
          await ensureAdminDocument(user.uid, user.email);
        } catch {
          // Handled inside ensureAdminDocument
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // Public reference & catalog listeners
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, 'governorates'), where('isActive', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setGovernorates(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Governorate, 'id'>) })));
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'governorates')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'cities'), where('isActive', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setCities(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<City, 'id'>) })));
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'cities')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'garages'), where('isActive', '==', true)),
        (snap) => {
          if (!snap.empty) {
            setGarages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Garage, 'id'>) })));
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'garages')
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'platform_settings', 'global'),
        (snap) => {
          if (snap.exists()) {
            setSettings(snap.data() as PlatformSettings);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'platform_settings/global')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'trips'), where('status', 'in', ['scheduled', 'in_progress'])),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }));
          list.sort((a, b) => `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`));
          setFirestoreTrips(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'trips')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'public_drivers'), where('verificationStatus', '==', 'approved')),
        (snap) => {
          const list = snap.docs.map((d) => d.data() as PublicDriverProfile);
          list.sort((a, b) => b.ratingAvg - a.ratingAvg || b.completedTripsCount - a.completedTripsCount);
          setPublicDrivers(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'public_drivers')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'reviews'), where('status', '==', 'published')),
        (snap) => {
          setPublishedReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) })));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'reviews')
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  // Authenticated user profile & private listeners
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;
    const unsubs: Array<() => void> = [];

    unsubs.push(
      onSnapshot(
        doc(db, 'users', uid),
        (snap) => {
          setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
          setProfileLoaded(true);
        },
        (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'users', uid, 'private', 'info'),
        (snap) => {
          setPrivateInfo(snap.exists() ? (snap.data() as UserPrivateInfo) : null);
        },
        (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}/private/info`)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'points_wallets', uid),
        (snap) => {
          setWallet(snap.exists() ? (snap.data() as PointsWallet) : null);
        },
        (err) => handleFirestoreError(err, OperationType.GET, `points_wallets/${uid}`)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'admins', uid),
        (snap) => setHasAdminDoc(snap.exists()),
        () => setHasAdminDoc(false)
      )
    );

    unsubs.push(
      onSnapshot(
        doc(db, 'drivers', uid),
        (snap) => {
          setDriverProfile(snap.exists() ? (snap.data() as DriverProfile) : null);
        },
        () => setDriverProfile(null)
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'notifications'), where('userId', '==', uid)),
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) }));
          items.sort((a, b) => {
            const ta = (a.createdAt as { seconds?: number })?.seconds || 0;
            const tb = (b.createdAt as { seconds?: number })?.seconds || 0;
            return tb - ta;
          });
          setNotifications(items);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
      )
    );

    return () => unsubs.forEach((u) => u());
  }, [authReady, firebaseUser]);

  const isAdmin = Boolean(
    firebaseUser &&
      firebaseUser.emailVerified &&
      (firebaseUser.email === BOOTSTRAP_ADMIN_EMAIL || hasAdminDoc || userProfile?.role === 'admin')
  );

  const needsOnboarding = Boolean(firebaseUser && profileLoaded && !userProfile);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const registerWithEmail = async (email: string, password: string, displayName: string): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const trimmedName = displayName.trim();
    if (trimmedName) {
      await updateProfile(cred.user, { displayName: trimmedName });
    }
    return cred.user;
  };

  const demoTrip = useMemo<Trip>(() => {
    const booked = Array.from(new Set(demoBookedSeats));
    const available = Math.max(0, 4 - booked.length);
    return {
      id: 'demo-trip-bgw-ebl',
      driverId: 'demo-driver-ali-bgw',
      driverName: 'علي حسين الجبوري',
      driverRating: 4.9,
      driverCompletedTrips: 142,
      driverVerified: true,
      vehicleId: 'demo-veh-camry-2023',
      vehicleModel: 'تويوتا كامري 2023',
      vehiclePlate: 'بغداد 48291 أ',
      departureGovId: 'bgw',
      destinationGovId: 'ebl',
      departureGarageId: 'gar_bgw_nahda',
      destinationGarageId: 'gar_ebl_baghdad',
      departureDate: getTomorrowIsoDate(),
      departureTime: '08:30',
      estimatedDurationMin: 270,
      pricePerSeatIqd: 25000,
      totalSeats: 4,
      availableSeats: available,
      confirmedSeatsCount: booked.length,
      bookedSeats: booked,
      status: 'scheduled',
      notes: 'استلام من المنزل أو نقطة الالتقاء المتفق عليها (المنصور / الكرادة) والتوصيل إلى أربيل',
      isSampleDemo: true,
    };
  }, [demoBookedSeats]);

  const trips = useMemo(() => [demoTrip, ...firestoreTrips], [demoTrip, firestoreTrips]);

  const bookDemoTrip = (seats: CabinSeatId[]) => {
    setDemoBookedSeats((prev) => {
      const next = Array.from(new Set([...prev, ...seats]));
      try {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const resetDemoTrip = () => {
    setDemoBookedSeats(DEFAULT_DEMO_BOOKED_SEATS);
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_BOOKED_SEATS));
    } catch {
      // ignore storage errors
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        authReady,
        userProfile,
        privateInfo,
        driverProfile,
        wallet,
        isAdmin,
        needsOnboarding,
        governorates,
        cities,
        garages,
        settings,
        trips,
        publicDrivers,
        publishedReviews,
        notifications,
        bookDemoTrip,
        resetDemoTrip,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

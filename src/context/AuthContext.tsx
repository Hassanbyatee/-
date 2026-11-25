import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { ADMIN_ACCESS_CODE, auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { DEFAULT_PLATFORM_SETTINGS, IRAQ_CITIES, IRAQ_GARAGES, IRAQ_GOVERNORATES } from '../data/iraqReferenceData';
import { ensureAdminDocument } from '../services/platformService';
import type {
  AppNotification,
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

const ADMIN_SESSION_STORAGE_KEY = 'masar_admin_code_unlocked_v1';

function loadAdminCodeSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === ADMIN_ACCESS_CODE;
  } catch {
    return false;
  }
}

interface AuthContextValue {
  firebaseUser: User | null;
  authReady: boolean;
  profileLoaded: boolean;
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
  signInWithGoogle: () => Promise<void>;
  unlockAdminWithCode: (code: string) => Promise<boolean>;
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
  const [adminCodeUnlocked, setAdminCodeUnlocked] = useState<boolean>(loadAdminCodeSession);

  const [governorates, setGovernorates] = useState<Governorate[]>(IRAQ_GOVERNORATES);
  const [cities, setCities] = useState<City[]>(IRAQ_CITIES);
  const [garages, setGarages] = useState<Garage[]>(IRAQ_GARAGES);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [firestoreTrips, setFirestoreTrips] = useState<Trip[]>([]);
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
      if (loadAdminCodeSession()) {
        try {
          await ensureAdminDocument(user.uid, user.email || '', ADMIN_ACCESS_CODE);
        } catch {
          // Handled silently if unavailable
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

  const isAdmin = Boolean(adminCodeUnlocked || hasAdminDoc || userProfile?.role === 'admin');

  const needsOnboarding = Boolean(firebaseUser && profileLoaded && !userProfile);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const unlockAdminWithCode = async (code: string): Promise<boolean> => {
    const trimmed = code.trim();
    if (trimmed !== ADMIN_ACCESS_CODE) {
      return false;
    }
    setAdminCodeUnlocked(true);
    try {
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, ADMIN_ACCESS_CODE);
    } catch {
      // ignore storage errors
    }
    if (auth.currentUser) {
      try {
        await ensureAdminDocument(auth.currentUser.uid, auth.currentUser.email || '', ADMIN_ACCESS_CODE);
        setHasAdminDoc(true);
      } catch {
        // Non-blocking: admin view still opens cleanly
      }
    }
    return true;
  };

  const trips = firestoreTrips;

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        authReady,
        profileLoaded,
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
        signInWithGoogle,
        unlockAdminWithCode,
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

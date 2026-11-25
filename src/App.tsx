import React, { useCallback, useEffect, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar, type AppView } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { EmptyCarsSection } from './components/EmptyCarsSection';
import { PassengerDashboard } from './components/PassengerDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StaticPages } from './components/StaticPages';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';
import { BookingModal } from './components/BookingModal';
import { AnimatedModalShell, PageTransition } from './components/motion/KineticPrimitives';
import { parseRoute, pathForView, pushRoute } from './lib/router';
import type { Trip, UserRole } from './types/domain';

const AppShell: React.FC = () => {
  const { t } = useI18n();
  const { firebaseUser, userProfile, isAdmin, unlockAdminWithCode, logout, trips, governorates } =
    useAuth();

  const initialRoute = parseRoute(typeof window !== 'undefined' ? window.location.pathname : '/');

  const [view, setView] = useState<AppView>(initialRoute.view);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('passenger');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [adminCodeModalOpen, setAdminCodeModalOpen] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [adminCodeError, setAdminCodeError] = useState('');
  const [adminCodeBusy, setAdminCodeBusy] = useState(false);
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingMode, setBookingMode] = useState<'seats' | 'full_car'>('seats');
  const [pendingRouteTrip, setPendingRouteTrip] = useState<{
    tripId: string;
    mode: 'seats' | 'full_car';
  } | null>(
    initialRoute.tripId
      ? { tripId: initialRoute.tripId, mode: initialRoute.modalMode || 'seats' }
      : null
  );
  const [bookingToast, setBookingToast] = useState('');
  const [bookingToastDropOff, setBookingToastDropOff] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const showToastMessage = useCallback((msg: string) => {
    setBookingToastDropOff(null);
    setBookingToast(msg);
    setTimeout(() => setBookingToast(''), 5500);
  }, []);

  const handleNavigate = useCallback(
    (nextView: AppView, sectionId?: string) => {
      if (nextView === 'admin' && !isAdmin) {
        pushRoute('/admin');
        setAdminCodeError('');
        setAdminCodeInput('');
        setAdminCodeModalOpen(true);
        return;
      }
      setView(nextView);
      pushRoute(pathForView(nextView, sectionId));
      if (nextView === 'home' && sectionId) {
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }, 90);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [isAdmin]
  );

  // Initial deep-link section scroll or admin prompt on first mount
  useEffect(() => {
    if (initialRoute.view === 'home' && initialRoute.sectionId) {
      const targetId = initialRoute.sectionId;
      setTimeout(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else if (initialRoute.view === 'admin' && !isAdmin) {
      setAdminCodeError('');
      setAdminCodeInput('');
      setAdminCodeModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync browser Back/Forward history navigation
  useEffect(() => {
    const onPopState = () => {
      const parsed = parseRoute(window.location.pathname);
      if (parsed.view === 'admin' && !isAdmin) {
        setView('home');
        setAdminCodeError('');
        setAdminCodeInput('');
        setAdminCodeModalOpen(true);
      } else {
        setView(parsed.view);
      }
      if (parsed.tripId) {
        setPendingRouteTrip({ tripId: parsed.tripId, mode: parsed.modalMode || 'seats' });
      } else {
        setPendingRouteTrip(null);
        setBookingTrip(null);
      }
      if (parsed.view === 'home' && parsed.sectionId) {
        setTimeout(() => {
          document.getElementById(parsed.sectionId!)?.scrollIntoView({ behavior: 'smooth' });
        }, 90);
      } else if (!parsed.tripId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [isAdmin]);

  // Resolve deep-linked trip routes (/trips/:id and /book-full-car/:id)
  useEffect(() => {
    if (!pendingRouteTrip || trips.length === 0) return;
    const match = trips.find((tr) => tr.id === pendingRouteTrip.tripId);
    if (!match) {
      setPendingRouteTrip(null);
      return;
    }
    if (!firebaseUser) {
      setAuthInitialRole('passenger');
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (userProfile) {
      if (userProfile.verificationStatus === 'approved' && userProfile.accountStatus === 'active') {
        setBookingMode(pendingRouteTrip.mode);
        setBookingTrip(match);
        setPendingRouteTrip(null);
      } else {
        showToastMessage(
          `${t.errors.unapprovedUser}${userProfile.rejectionReason ? ` (${userProfile.rejectionReason})` : ''}`
        );
        setPendingRouteTrip(null);
      }
    }
  }, [pendingRouteTrip, trips, firebaseUser, userProfile, showToastMessage, t.errors.unapprovedUser]);

  const handleOpenAuthWithRole = (role: 'passenger' | 'driver', mode?: 'login' | 'register') => {
    setAuthInitialRole(role);
    setAuthInitialMode(mode ?? (role === 'driver' ? 'register' : 'login'));
    setAuthModalOpen(true);
  };

  const openBookingFlow = (trip: Trip, mode: 'seats' | 'full_car') => {
    if (!firebaseUser) {
      setPendingRouteTrip({ tripId: trip.id, mode });
      handleOpenAuthWithRole('passenger', 'login');
      return;
    }
    if (
      userProfile &&
      (userProfile.verificationStatus !== 'approved' || userProfile.accountStatus !== 'active')
    ) {
      showToastMessage(
        `${t.errors.unapprovedUser}${userProfile.rejectionReason ? ` (${userProfile.rejectionReason})` : ''}`
      );
      return;
    }
    setBookingMode(mode);
    setBookingTrip(trip);
    pushRoute(mode === 'full_car' ? `/book-full-car/${trip.id}` : `/trips/${trip.id}`);
  };

  const closeBookingFlow = () => {
    setBookingTrip(null);
    setPendingRouteTrip(null);
    pushRoute(pathForView(view));
  };

  // Enforce suspended/blocked account gate
  if (userProfile && ['suspended', 'blocked'].includes(userProfile.accountStatus)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full surface-card rounded-2xl p-6 text-center space-y-4">
          <h1 className="text-xl font-bold text-slate-900">{t.auth.accountSuspendedTitle}</h1>
          <p className="text-sm text-slate-600">{t.auth.accountSuspendedDesc}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl cursor-pointer"
          >
            {t.nav.signOut}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col">
      <Navbar
        currentView={view}
        onNavigate={handleNavigate}
        onOpenAuth={(role) => handleOpenAuthWithRole(role ?? 'passenger', 'login')}
      />

      {bookingToast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
          <div className="bg-[#0770E3] text-white text-sm font-medium rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <span>{bookingToast}</span>
            <div className="flex items-center gap-3 shrink-0">
              {bookingToastDropOff && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${bookingToastDropOff.lat},${bookingToastDropOff.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-xs font-bold text-white"
                >
                  {t.booking.openDriverNavLink}
                </a>
              )}
              {userProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingToast('');
                    handleNavigate('passenger');
                  }}
                  className="underline text-xs font-semibold cursor-pointer shrink-0"
                >
                  {t.passenger.tabBookings}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        <PageTransition viewKey={view}>
          {view === 'home' && (
            <HomePage
              onSelectTripForBooking={(trip) => openBookingFlow(trip, 'seats')}
              onBookFullCar={(trip) => openBookingFlow(trip, 'full_car')}
              onOpenAuthWithRole={(r) => handleOpenAuthWithRole(r)}
              onNavigate={handleNavigate}
              onOpenAdminCode={() => {
                setAdminCodeError('');
                setAdminCodeInput('');
                setAdminCodeModalOpen(true);
              }}
            />
          )}

          {view === 'empty-cars' && (
            <EmptyCarsSection
              mode="page"
              trips={trips}
              governorates={governorates}
              onBookFullCar={(trip) => openBookingFlow(trip, 'full_car')}
              onBookSeats={(trip) => openBookingFlow(trip, 'seats')}
              onNavigate={handleNavigate}
            />
          )}

          {view === 'passenger' && (
            <PassengerDashboard
              onSelectTripForBooking={(trip) => openBookingFlow(trip, 'seats')}
              onBookFullCar={(trip) => openBookingFlow(trip, 'full_car')}
            />
          )}

          {view === 'driver' && <DriverDashboard />}

          {view === 'admin' && isAdmin && <AdminDashboard />}

          {(view === 'privacy' || view === 'terms' || view === 'cancellation' || view === 'contact') && (
            <StaticPages
              page={view}
              onBack={(v) => handleNavigate(v)}
              onOpenAuth={() => handleOpenAuthWithRole('passenger', 'login')}
            />
          )}
        </PageTransition>
      </main>

      <AuthOnboardingModal
        isOpen={authModalOpen}
        initialRole={authInitialRole}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onCompleted={(role) => {
          if (pendingRouteTrip && role === 'passenger') return;
          if (role === 'driver') handleNavigate('driver');
          else if (role === 'admin') handleNavigate('admin');
          else handleNavigate('passenger');
        }}
      />

      <BookingModal
        trip={bookingTrip}
        mode={bookingMode}
        onClose={closeBookingFlow}
        onSuccess={(coords) => {
          setBookingToastDropOff(coords || null);
          setBookingToast(t.booking.requestSent);
          setTimeout(() => {
            setBookingToast('');
            setBookingToastDropOff(null);
          }, 8000);
        }}
      />

      {/* ADMIN CODE ACCESS MODAL (CODE: 2006) */}
      <AnimatedModalShell
        isOpen={adminCodeModalOpen}
        onClose={() => {
          setAdminCodeModalOpen(false);
          if (window.location.pathname === '/admin' && !isAdmin) {
            pushRoute(pathForView(view));
          }
        }}
        maxWidthClass="max-w-md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setAdminCodeError('');
            const code = adminCodeInput.trim();
            if (code !== '2006') {
              setAdminCodeError(t.admin.adminCodeInvalid);
              return;
            }
            try {
              setAdminCodeBusy(true);
              const unlocked = await unlockAdminWithCode(code);
              if (!unlocked) {
                setAdminCodeError(t.admin.adminCodeInvalid);
                return;
              }
              setAdminCodeModalOpen(false);
              setAdminCodeInput('');
              setView('admin');
              pushRoute('/admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch {
              setAdminCodeError(t.errors.generic);
            } finally {
              setAdminCodeBusy(false);
            }
          }}
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 relative shadow-[var(--shadow-elevated)]"
        >
          <button
            type="button"
            onClick={() => {
              setAdminCodeModalOpen(false);
              if (window.location.pathname === '/admin' && !isAdmin) {
                pushRoute(pathForView(view));
              }
            }}
            aria-label={t.common.close}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 absolute top-4 end-4 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#0770E3] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-[#05203C]">{t.admin.adminCodeModalTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t.admin.adminCodeModalDesc}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.admin.adminCodeLabel}
            </label>
            <input
              type="password"
              inputMode="numeric"
              required
              autoFocus
              placeholder={t.admin.adminCodePlaceholder}
              value={adminCodeInput}
              onChange={(e) => setAdminCodeInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:border-[#0770E3]"
            />
          </div>

          {adminCodeError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl px-3.5 py-2.5">
              <p>{adminCodeError}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setAdminCodeModalOpen(false);
                if (window.location.pathname === '/admin' && !isAdmin) {
                  pushRoute(pathForView(view));
                }
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl cursor-pointer"
            >
              {t.booking.cancel}
            </button>
            <button
              type="submit"
              disabled={adminCodeBusy}
              className="btn-tactile px-5 py-2 bg-[#0770E3] text-white text-xs font-semibold rounded-xl hover:bg-[#0559B8] disabled:opacity-50 cursor-pointer"
            >
              {t.admin.adminCodeSubmit}
            </button>
          </div>
        </form>
      </AnimatedModalShell>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar, type AppView } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { PassengerDashboard } from './components/PassengerDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StaticPages } from './components/StaticPages';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';
import { BookingModal } from './components/BookingModal';
import { PageTransition } from './components/motion/KineticPrimitives';
import type { Trip, UserRole } from './types/domain';

const AppShell: React.FC = () => {
  const { t } = useI18n();
  const { userProfile, isAdmin, logout } = useAuth();

  const [view, setView] = useState<AppView>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<UserRole>('passenger');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [bookingTrip, setBookingTrip] = useState<Trip | null>(null);
  const [bookingToast, setBookingToast] = useState('');
  const [bookingToastIsDemo, setBookingToastIsDemo] = useState(false);
  const [bookingToastDropOff, setBookingToastDropOff] = useState<{ lat: number; lng: number } | null>(null);

  const handleNavigate = (nextView: AppView, sectionId?: string) => {
    setView(nextView);
    if (nextView === 'home' && sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 90);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenAuthWithRole = (role: 'passenger' | 'driver', mode?: 'login' | 'register') => {
    setAuthInitialRole(role);
    setAuthInitialMode(mode ?? (role === 'driver' ? 'register' : 'login'));
    setAuthModalOpen(true);
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
        onOpenAuth={() => handleOpenAuthWithRole('passenger', 'login')}
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
              {userProfile && !bookingToastIsDemo && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingToast('');
                    setView('passenger');
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
              onSelectTripForBooking={(trip) => setBookingTrip(trip)}
              onOpenAuthWithRole={(r) => handleOpenAuthWithRole(r)}
              onNavigate={(v) => handleNavigate(v)}
            />
          )}

          {view === 'passenger' && (
            <PassengerDashboard onSelectTripForBooking={(trip) => setBookingTrip(trip)} />
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
          if (role === 'driver') setView('driver');
          else if (role === 'admin') setView('admin');
          else setView('passenger');
        }}
      />

      <BookingModal
        trip={bookingTrip}
        onClose={() => setBookingTrip(null)}
        onSuccess={(isDemo, coords) => {
          setBookingToastIsDemo(Boolean(isDemo));
          setBookingToastDropOff(coords || null);
          setBookingToast(isDemo ? t.booking.demoRequestSent : t.booking.requestSent);
          setTimeout(() => {
            setBookingToast('');
            setBookingToastDropOff(null);
          }, 8000);
        }}
      />
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

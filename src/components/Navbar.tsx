import React, { useState } from 'react';
import { Globe, LogOut, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import type { LanguageCode, VerificationStatus } from '../types/domain';

export type AppView =
  | 'home'
  | 'passenger'
  | 'driver'
  | 'admin'
  | 'privacy'
  | 'terms'
  | 'cancellation'
  | 'contact';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView, sectionId?: string) => void;
  onOpenAuth: (role?: 'passenger' | 'driver') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { lang, setLang, t } = useI18n();
  const { firebaseUser, userProfile, driverProfile, isAdmin, notifications, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const dashboardTarget: AppView =
    userProfile?.role === 'driver'
      ? 'driver'
      : isAdmin
      ? 'admin'
      : 'passenger';

  const displayName =
    userProfile?.displayName ||
    firebaseUser?.displayName ||
    firebaseUser?.email?.split('@')[0] ||
    '';

  const roleLabel =
    userProfile?.role === 'driver'
      ? t.roles.driver
      : isAdmin
      ? t.roles.admin
      : t.roles.passenger;

  const verificationStatus: VerificationStatus = isAdmin
    ? 'approved'
    : userProfile?.role === 'driver'
    ? driverProfile?.verificationStatus || userProfile?.verificationStatus || 'pending'
    : userProfile?.verificationStatus || 'pending';

  const verificationLabel =
    verificationStatus === 'approved'
      ? t.auth.verifiedStatus
      : verificationStatus === 'rejected'
      ? t.auth.rejectedStatus
      : verificationStatus === 'suspended'
      ? t.statuses.suspended
      : t.auth.pendingReview;

  const verificationToneClass =
    verificationStatus === 'approved'
      ? 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30'
      : verificationStatus === 'rejected' || verificationStatus === 'suspended'
      ? 'text-rose-300 bg-rose-500/15 border-rose-400/30'
      : 'text-amber-300 bg-amber-500/15 border-amber-400/30';

  const handleNavClick = (view: AppView, sectionId?: string) => {
    setMobileMenuOpen(false);
    onNavigate(view, sectionId);
  };

  const cycleLanguages: Array<{ code: LanguageCode; label: string }> = [
    { code: 'ar', label: 'عربي' },
    { code: 'ku', label: 'کوردی' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#05203C] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-[#60A5FA] transition-colors cursor-pointer"
        >
          {t.brand}
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium text-white/85">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'available-trips')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
          >
            {t.nav.searchTrips}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'destinations')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
          >
            {t.nav.destinations}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'loyalty-section')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
          >
            {t.nav.loyalty}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('home', 'become-driver')}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
          >
            {t.nav.becomeDriver}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
              currentView === 'contact' ? 'text-[#60A5FA] font-semibold' : 'hover:text-white'
            }`}
          >
            {t.nav.support}
          </button>
        </nav>

        {/* Zone 3: Language Switcher + Logged-in User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="flex items-center border border-white/15 rounded-lg bg-white/10 p-0.5">
            <Globe className="w-3.5 h-3.5 text-white/75 mx-1.5 hidden sm:block shrink-0" />
            {cycleLanguages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => setLang(item.code)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  lang === item.code
                    ? 'bg-white text-[#05203C]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {firebaseUser ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15">
                <span className="text-xs font-bold text-white max-w-[110px] truncate">
                  {displayName}
                </span>
                <span className="text-[11px] font-semibold text-[#93C5FD] whitespace-nowrap">
                  {roleLabel}
                </span>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border whitespace-nowrap ${verificationToneClass}`}
                >
                  {verificationLabel}
                </span>
              </div>

              {currentView !== dashboardTarget && (
                <button
                  type="button"
                  onClick={() => handleNavClick(dashboardTarget)}
                  className="btn-tactile px-3.5 py-2 text-xs font-semibold text-white bg-[#0770E3] rounded-lg hover:bg-[#0559B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.nav.dashboard}
                  {unreadCount > 0 ? ` (${unreadCount})` : ''}
                </button>
              )}

              <button
                type="button"
                onClick={() => logout()}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white border border-white/25 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.nav.signOut}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth()}
              className="btn-tactile hidden md:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0770E3] rounded-lg hover:bg-[#0559B8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.signIn}
            </button>
          )}

          <button
            type="button"
            aria-label={t.common.menu}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg border border-white/20 text-white hover:bg-white/10 cursor-pointer transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Smooth Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-white/15 bg-[#05203C] px-5 py-5 shadow-lg"
          >
            <nav className="flex flex-col space-y-1" aria-label={t.common.menu}>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'available-trips')}
                className={`w-full text-start px-3.5 py-2.5 text-[15px] font-medium rounded-xl transition-colors cursor-pointer ${
                  currentView === 'home'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white active:bg-white/15'
                }`}
              >
                {t.nav.searchTrips}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'destinations')}
                className="w-full text-start px-3.5 py-2.5 text-[15px] font-medium text-white/90 rounded-xl hover:bg-white/10 hover:text-white active:bg-white/15 transition-colors cursor-pointer"
              >
                {t.nav.destinations}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('home', 'loyalty-section')}
                className="w-full text-start px-3.5 py-2.5 text-[15px] font-medium text-white/90 rounded-xl hover:bg-white/10 hover:text-white active:bg-white/15 transition-colors cursor-pointer"
              >
                {t.nav.loyalty}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('contact')}
                className={`w-full text-start px-3.5 py-2.5 text-[15px] font-medium rounded-xl transition-colors cursor-pointer ${
                  currentView === 'contact'
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/90 hover:bg-white/10 hover:text-white active:bg-white/15'
                }`}
              >
                {t.nav.support}
              </button>
            </nav>

            <div className="mt-4 pt-4 border-t border-white/15 flex flex-col gap-3">
              {firebaseUser ? (
                <>
                  <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {userProfile?.photoUrl ? (
                        <img
                          src={userProfile.photoUrl}
                          alt={displayName}
                          className="w-9 h-9 rounded-full object-cover border border-white/25 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#0770E3] text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{displayName}</div>
                        <div className="text-xs text-[#93C5FD] font-semibold mt-0.5">{roleLabel}</div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap shrink-0 ${verificationToneClass}`}
                    >
                      {verificationLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick(dashboardTarget)}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0770E3] hover:bg-[#0559B8] rounded-xl transition-colors cursor-pointer text-center"
                  >
                    {t.nav.dashboard} {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-3 px-4 text-sm font-medium text-white border border-white/25 hover:bg-white/10 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.nav.signOut}</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth('passenger');
                      }}
                      className="btn-tactile py-2 px-3 text-xs font-semibold text-white/95 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      {t.nav.joinAsPassenger}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth('driver');
                      }}
                      className="btn-tactile py-2 px-3 text-xs font-semibold text-white/95 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      {t.nav.joinAsDriver}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="btn-tactile w-full py-3 px-4 text-sm font-semibold text-white bg-[#0770E3] hover:bg-[#0559B8] rounded-xl transition-colors cursor-pointer text-center"
                  >
                    {t.nav.signIn}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Award,
  Banknote,
  Calendar,
  Car,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock,
  HeadphonesIcon,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { subscribeSeatAlert } from '../services/platformService';
import { SUPPORT_PHONE_NUMBER, SUPPORT_WHATSAPP_URL } from '../data/iraqReferenceData';
import { EmptyCarsSection } from './EmptyCarsSection';
import { TripCard } from './TripCard';
import {
  AnimatedCounter,
  HeroReveal,
  SectionReveal,
  useGsapStaggerReveal,
} from './motion/KineticPrimitives';
import type { AppView } from './Navbar';
import { getTripMinSeatPrice, type Trip } from '../types/domain';

interface HomePageProps {
  onSelectTripForBooking: (trip: Trip) => void;
  onBookFullCar: (trip: Trip) => void;
  onOpenAuthWithRole: (role: 'passenger' | 'driver') => void;
  onNavigate: (view: AppView, sectionId?: string) => void;
  onOpenAdminCode?: () => void;
}

type HeroCategory = 'trips' | 'empty-cars' | 'routes' | 'rewards' | 'drivers';
type TimeWindow = 'all' | 'morning' | 'afternoon' | 'evening';
type TripFilterPill = 'all' | 'cheapest' | 'offers' | 'morning' | 'multiSeat';
type SubNavSection =
  | 'destinations'
  | 'empty-cars-section'
  | 'available-trips'
  | 'providers'
  | 'ratings'
  | 'facts-faq';

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTripForBooking,
  onBookFullCar,
  onOpenAuthWithRole,
  onNavigate,
  onOpenAdminCode,
}) => {
  const { dir, getLocalizedName, formatIqd, t } = useI18n();
  const {
    firebaseUser,
    userProfile,
    governorates,
    garages,
    trips,
    publicDrivers,
    publishedReviews,
    settings,
  } = useAuth();
  const prefersReduced = useReducedMotion();

  const [heroCategory, setHeroCategory] = useState<HeroCategory>('trips');
  const [departureGovId, setDepartureGovId] = useState('');
  const [destinationGovId, setDestinationGovId] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('all');
  const [minSeats, setMinSeats] = useState(1);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [specialOffersOnly, setSpecialOffersOnly] = useState(false);

  const [activeSubNav, setActiveSubNav] = useState<SubNavSection>('destinations');
  const [tripPill, setTripPill] = useState<TripFilterPill>('all');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [toastMsg, setToastMsg] = useState('');

  const destinationsRef = useRef<HTMLElement>(null);
  const tripsSectionRef = useRef<HTMLElement>(null);
  const providersRef = useRef<HTMLElement>(null);

  useGsapStaggerReveal(destinationsRef, '.gsap-dest-card', []);
  useGsapStaggerReveal(tripsSectionRef, '.gsap-trip-item', []);
  useGsapStaggerReveal(providersRef, '.gsap-provider-card', [governorates.length]);

  const RouteArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Track active sub-nav underline while scrolling
  useEffect(() => {
    const ids: SubNavSection[] = [
      'destinations',
      'empty-cars-section',
      'available-trips',
      'providers',
      'ratings',
      'facts-faq',
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible && ids.includes(visible.target.id as SubNavSection)) {
          setActiveSubNav(visible.target.id as SubNavSection);
        }
      },
      { rootMargin: '-120px 0px -60% 0px', threshold: 0.05 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const matchesTimeWindow = (timeStr: string, win: TimeWindow) => {
    if (win === 'all') return true;
    const hour = Number(timeStr.split(':')[0] || 12);
    if (win === 'morning') return hour >= 4 && hour < 12;
    if (win === 'afternoon') return hour >= 12 && hour < 17;
    if (win === 'evening') return hour >= 17 || hour < 4;
    return true;
  };

  const filteredTrips = useMemo(() => {
    const base = trips.filter((tr) => {
      if (departureGovId && tr.departureGovId !== departureGovId) return false;
      if (destinationGovId && tr.destinationGovId !== destinationGovId) return false;
      if (travelDate && tr.departureDate !== travelDate) return false;
      if (minSeats > 1 && tr.availableSeats < minSeats) return false;
      if (verifiedOnly && !tr.driverVerified) return false;
      if (specialOffersOnly && !tr.isSpecialOffer) return false;
      if (!matchesTimeWindow(tr.departureTime || '08:00', timeWindow)) return false;

      if (tripPill === 'offers' && !tr.isSpecialOffer) return false;
      if (tripPill === 'morning' && !matchesTimeWindow(tr.departureTime || '08:00', 'morning')) return false;
      if (tripPill === 'multiSeat' && tr.availableSeats < 2) return false;
      return true;
    });

    if (tripPill === 'cheapest') {
      return [...base].sort((a, b) => getTripMinSeatPrice(a) - getTripMinSeatPrice(b));
    }
    return base;
  }, [
    trips,
    departureGovId,
    destinationGovId,
    travelDate,
    minSeats,
    verifiedOnly,
    specialOffersOnly,
    timeWindow,
    tripPill,
  ]);

  const fareComparisonBars = useMemo(() => {
    if (trips.length === 0) return [];
    const grouped = new Map<string, { from: string; to: string; totalFare: number; count: number }>();
    for (const tr of trips) {
      const key = `${tr.departureGovId}--${tr.destinationGovId}`;
      const existing = grouped.get(key) || {
        from: tr.departureGovId,
        to: tr.destinationGovId,
        totalFare: 0,
        count: 0,
      };
      existing.totalFare += getTripMinSeatPrice(tr);
      existing.count += 1;
      grouped.set(key, existing);
    }
    const rows = Array.from(grouped.values())
      .map((item) => ({
        from: item.from,
        to: item.to,
        avgFare: Math.round(item.totalFare / item.count),
        count: item.count,
      }))
      .sort((a, b) => b.count - a.count || a.avgFare - b.avgFare)
      .slice(0, 5);
    const maxFare = Math.max(...rows.map((r) => r.avgFare), 1);
    return rows.map((r) => ({
      ...r,
      pct: Math.max(22, Math.round((r.avgFare / maxFare) * 100)),
    }));
  }, [trips]);

  const popularDestinations = useMemo(() => {
    const destSpecs = [
      { govId: 'bgw', code: 'BGW' },
      { govId: 'ebl', code: 'EBL' },
      { govId: 'bsr', code: 'BSR' },
      { govId: 'njf', code: 'NJF' },
    ];
    return destSpecs.map((spec) => {
      const matching = trips.filter(
        (tr) => tr.destinationGovId === spec.govId || tr.departureGovId === spec.govId
      );
      return {
        ...spec,
        routeCount: matching.length,
        minFare:
          matching.length > 0 ? Math.min(...matching.map((tr) => getTripMinSeatPrice(tr))) : null,
      };
    });
  }, [trips]);

  const { avgRatingScore, ratingBars } = useMemo(() => {
    if (publishedReviews.length === 0) {
      return {
        avgRatingScore: 0,
        ratingBars: [
          { label: t.home.ratingPunctuality, score: 0, pct: 0 },
          { label: t.home.ratingComfort, score: 0, pct: 0 },
          { label: t.home.ratingStations, score: 0, pct: 0 },
          { label: t.home.ratingValue, score: 0, pct: 0 },
        ],
      };
    }
    const len = publishedReviews.length;
    const meanDriver = publishedReviews.reduce((s, r) => s + Number(r.driverRating || 0), 0) / len;
    const meanVehicle = publishedReviews.reduce((s, r) => s + Number(r.vehicleRating || 0), 0) / len;
    const meanExp = publishedReviews.reduce((s, r) => s + Number(r.experienceRating || 0), 0) / len;
    const overall = (meanDriver + meanVehicle + meanExp) / 3;
    const toPct = (v: number) => Math.max(0, Math.min(100, Math.round((v / 5) * 100)));
    return {
      avgRatingScore: Number(overall.toFixed(1)),
      ratingBars: [
        { label: t.home.ratingPunctuality, score: Number(meanDriver.toFixed(1)), pct: toPct(meanDriver) },
        { label: t.home.ratingComfort, score: Number(meanVehicle.toFixed(1)), pct: toPct(meanVehicle) },
        { label: t.home.ratingStations, score: Number(meanExp.toFixed(1)), pct: toPct(meanExp) },
        { label: t.home.ratingValue, score: Number(overall.toFixed(1)), pct: toPct(overall) },
      ],
    };
  }, [publishedReviews, t]);

  const handleSwapCities = () => {
    const prevDep = departureGovId;
    setDepartureGovId(destinationGovId);
    setDestinationGovId(prevDep);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHeroCategorySelect = (cat: HeroCategory) => {
    setHeroCategory(cat);
    if (cat === 'trips') onNavigate('home', 'available-trips');
    if (cat === 'empty-cars') onNavigate('empty-cars');
    if (cat === 'routes') onNavigate('home', 'destinations');
    if (cat === 'rewards') onNavigate('home', 'loyalty-section');
    if (cat === 'drivers') onNavigate('home', 'become-driver');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const handleBookClick = (trip: Trip) => {
    if (!firebaseUser) {
      onOpenAuthWithRole('passenger');
      return;
    }
    if (userProfile && (userProfile.verificationStatus !== 'approved' || userProfile.accountStatus !== 'active')) {
      showToast(
        `${t.errors.unapprovedUser}${userProfile.rejectionReason ? ` (${userProfile.rejectionReason})` : ''}`
      );
      return;
    }
    onSelectTripForBooking(trip);
  };

  const handleBookFullCarClick = (trip: Trip) => {
    if (!firebaseUser) {
      onOpenAuthWithRole('passenger');
      return;
    }
    if (userProfile && (userProfile.verificationStatus !== 'approved' || userProfile.accountStatus !== 'active')) {
      showToast(
        `${t.errors.unapprovedUser}${userProfile.rejectionReason ? ` (${userProfile.rejectionReason})` : ''}`
      );
      return;
    }
    onBookFullCar(trip);
  };

  const handleSeatAlert = async (trip: Trip) => {
    if (!firebaseUser) {
      onOpenAuthWithRole('passenger');
      return;
    }
    if (userProfile && (userProfile.verificationStatus !== 'approved' || userProfile.accountStatus !== 'active')) {
      showToast(t.errors.unapprovedUser);
      return;
    }
    await subscribeSeatAlert(trip.id, trip.driverId, firebaseUser.uid, minSeats);
    showToast(t.tripCard.alertSubscribed);
  };

  const hasActiveFilters = Boolean(
    departureGovId ||
      destinationGovId ||
      travelDate ||
      minSeats > 1 ||
      verifiedOnly ||
      specialOffersOnly ||
      timeWindow !== 'all' ||
      tripPill !== 'all'
  );

  const resetAllFilters = () => {
    setDepartureGovId('');
    setDestinationGovId('');
    setTravelDate('');
    setTimeWindow('all');
    setMinSeats(1);
    setVerifiedOnly(false);
    setSpecialOffersOnly(false);
    setTripPill('all');
  };

  const subNavItems: Array<{ id: SubNavSection; label: string }> = [
    { id: 'destinations', label: t.subnav.popular },
    { id: 'empty-cars-section', label: t.subnav.emptyCars },
    { id: 'available-trips', label: t.subnav.trips },
    { id: 'providers', label: t.subnav.providers },
    { id: 'ratings', label: t.subnav.ratings },
    { id: 'facts-faq', label: t.subnav.factsFaq },
  ];

  const filterPills: Array<{ id: TripFilterPill; label: string }> = [
    { id: 'all', label: t.filters.all },
    { id: 'cheapest', label: t.filters.cheapest },
    { id: 'offers', label: t.filters.offers },
    { id: 'morning', label: t.filters.morning },
    { id: 'multiSeat', label: t.filters.multiSeat },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#05203C]">
      {/* 1. DEEP NAVY SKYSCANNER HERO + CATEGORY PILLS + CRISP WHITE SEARCH CARD */}
      <section className="bg-[#05203C] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-10 sm:pt-7 sm:pb-12 space-y-6">
          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                { id: 'trips', label: t.hero.catTrips, icon: Car },
                { id: 'empty-cars', label: t.hero.catEmptyCars, icon: CarFront },
                { id: 'routes', label: t.hero.catRoutes, icon: MapPin },
                { id: 'rewards', label: t.hero.catRewards, icon: Award },
                { id: 'drivers', label: t.hero.catDrivers, icon: ShieldCheck },
              ] as const
            ).map((cat) => {
              const Icon = cat.icon;
              const active = heroCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleHeroCategorySelect(cat.id)}
                  className={`btn-tactile inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0770E3] text-white'
                      : 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Breadcrumb + Bold Clean Headline */}
          <HeroReveal delay={0.04} className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>{t.hero.breadcrumbHome}</span>
              <span aria-hidden="true">/</span>
              <span className="text-white font-medium">{t.hero.breadcrumbSection}</span>
            </div>

            <h1
              className="font-bold leading-[1.2] tracking-tight text-white"
              style={{ fontSize: 'clamp(1.85rem, 3.4vw, 2.85rem)', textWrap: 'balance' }}
            >
              {t.hero.headline}
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>
          </HeroReveal>

          {/* Crisp White Search Card */}
          <HeroReveal delay={0.1} className="bg-white text-[#05203C] rounded-[12px] border border-[#E0E4E8] p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_44px_minmax(0,1.2fr)_minmax(175px,1fr)_minmax(155px,0.9fr)_minmax(145px,0.85fr)] gap-3 items-end">
              <div className="min-w-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#05203C] mb-1.5 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-[#0770E3] shrink-0" />
                  <span>{t.hero.fromLabel}</span>
                </label>
                <select
                  value={departureGovId}
                  onChange={(e) => setDepartureGovId(e.target.value)}
                  className="w-full min-w-0 h-[44px] px-3 text-sm text-[#05203C] border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:border-[#0770E3] focus:ring-2 focus:ring-[#0770E3]/15"
                >
                  <option value="">{t.hero.selectDeparture}</option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {getLocalizedName(g)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapCities}
                  title={t.hero.swapCities}
                  aria-label={t.hero.swapCities}
                  className="w-full sm:w-[44px] h-[44px] flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#F7F9FB] text-[#05203C] hover:border-[#0770E3] hover:text-[#0770E3] transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="min-w-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#05203C] mb-1.5 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t.hero.toLabel}</span>
                </label>
                <select
                  value={destinationGovId}
                  onChange={(e) => setDestinationGovId(e.target.value)}
                  className="w-full min-w-0 h-[44px] px-3 text-sm text-[#05203C] border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:border-[#0770E3] focus:ring-2 focus:ring-[#0770E3]/15"
                >
                  <option value="">{t.hero.selectDestination}</option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {getLocalizedName(g)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#05203C] whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-[#0770E3] shrink-0" />
                    <span>{t.hero.dateLabel}</span>
                  </label>
                  {travelDate && (
                    <button
                      type="button"
                      onClick={() => setTravelDate('')}
                      className="text-[11px] font-semibold text-[#0770E3] hover:underline cursor-pointer shrink-0"
                    >
                      {t.hero.clearDate}
                    </button>
                  )}
                </div>
                <div className="relative w-full h-[44px] px-3 border border-[#CBD5E1] rounded-lg bg-white flex items-center justify-between gap-2 focus-within:border-[#0770E3] focus-within:ring-2 focus-within:ring-[#0770E3]/15 overflow-hidden">
                  <span
                    className={`text-sm truncate ${
                      travelDate
                        ? 'font-mono font-medium text-[#05203C] tabular-nums'
                        : 'text-slate-500'
                    }`}
                  >
                    {travelDate || t.hero.selectDate}
                  </span>
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
                      } catch {
                        // Browser fallback handles native click
                      }
                    }}
                    aria-label={t.hero.dateLabel}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#05203C] mb-1.5 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 text-[#0770E3] shrink-0" />
                  <span>{t.hero.timeWindowLabel}</span>
                </label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
                  className="w-full min-w-0 h-[44px] px-3 text-sm text-[#05203C] border border-[#CBD5E1] rounded-lg bg-white focus:outline-none focus:border-[#0770E3] focus:ring-2 focus:ring-[#0770E3]/15"
                >
                  <option value="all">{t.hero.timeAll}</option>
                  <option value="morning">{t.hero.timeMorning}</option>
                  <option value="afternoon">{t.hero.timeAfternoon}</option>
                  <option value="evening">{t.hero.timeEvening}</option>
                </select>
              </div>

              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => scrollToSection('available-trips')}
                  className="btn-tactile w-full h-[44px] px-4 bg-[#0770E3] text-white font-semibold text-sm rounded-lg hover:bg-[#0559B8] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{t.hero.searchButton}</span>
                </button>
              </div>
            </div>

            {/* Optional Checkboxes & Seats Selector Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E0E4E8] text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-5">
                <label className="inline-flex items-center gap-2 text-[#05203C] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#0770E3] focus:ring-[#0770E3]"
                  />
                  <span>{t.hero.verifiedOnlyCheck}</span>
                </label>

                <label className="inline-flex items-center gap-2 text-[#05203C] font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={specialOffersOnly}
                    onChange={(e) => setSpecialOffersOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#0770E3] focus:ring-[#0770E3]"
                  />
                  <span>{t.hero.specialOffersOnlyCheck}</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0770E3]" />
                <span className="text-xs font-semibold text-slate-600">{t.hero.seatsLabel}:</span>
                <select
                  value={minSeats}
                  onChange={(e) => setMinSeats(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs font-mono font-semibold text-[#05203C] border border-[#CBD5E1] rounded-md bg-white tabular-nums"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </HeroReveal>
        </div>
      </section>

      {/* 2. STICKY HORIZONTAL SUB-NAVIGATION WITH ACTIVE BLUE UNDERLINE */}
      <div className="sticky top-16 z-30 bg-white border-b border-[#E0E4E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between sm:justify-start gap-4 sm:gap-7 overflow-x-auto h-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {subNavItems.map((item) => {
            const active = activeSubNav === item.id;
            const hideOnMobile = item.id === 'providers' || item.id === 'ratings';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSubNav(item.id);
                  if (item.id === 'destinations' || item.id === 'available-trips') {
                    onNavigate('home', item.id);
                  } else {
                    scrollToSection(item.id);
                  }
                }}
                className={`h-full items-center text-xs sm:text-sm whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer px-1 ${
                  hideOnMobile ? 'hidden sm:inline-flex' : 'inline-flex'
                } ${
                  active
                    ? 'border-[#0770E3] text-[#0770E3] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#05203C] font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,34rem)] shadow-[var(--shadow-elevated)]">
          <div className="bg-[#05203C] border border-[#0770E3]/40 text-white text-sm font-medium rounded-xl px-4 py-3 text-center">
            {toastMsg}
          </div>
        </div>
      )}

      {/* 3. POPULAR ROUTES & FARE COMPARISON BARS */}
      <section ref={destinationsRef} id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full space-y-10">
        <div>
          <SectionReveal>
            <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
              {t.home.popularDestinationsTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.home.popularDestinationsSub}</p>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {popularDestinations.map((dest) => {
              const gov = governorates.find((g) => g.id === dest.govId);
              const name = getLocalizedName(gov);
              return (
                <button
                  key={dest.govId}
                  type="button"
                  onClick={() => {
                    setDestinationGovId(dest.govId);
                    setDepartureGovId('');
                    scrollToSection('available-trips');
                  }}
                  className="gsap-dest-card surface-card-interactive group text-start bg-white border border-[#E0E4E8] rounded-[12px] p-5 hover:border-[#0770E3] transition-colors cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#0770E3] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#05203C] bg-[#F7F9FB] border border-[#E0E4E8] px-2 py-0.5 rounded-md">
                      {dest.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#05203C] group-hover:text-[#0770E3] transition-colors">
                      {name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 tabular-nums">
                      {dest.routeCount} {t.home.showingCount}
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-[#E0E4E8] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-slate-500">
                        {dest.minFare !== null ? t.home.startingFrom : t.home.noRoutesYetShort}
                      </div>
                      <div className="text-base font-bold font-mono text-[#0770E3] tabular-nums">
                        {dest.minFare !== null ? formatIqd(dest.minFare) : '—'}
                      </div>
                    </div>
                    <RouteArrow className="w-4 h-4 text-slate-400 group-hover:text-[#0770E3] transition-colors shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clean Skyscanner-Style Route Fare Comparison Bars */}
        <div className="bg-white border border-[#E0E4E8] rounded-[12px] p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#05203C]">{t.home.fareCompareTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{t.home.fareCompareSub}</p>
            </div>
            <span className="text-xs font-medium text-slate-500">{t.home.avgFareLabel}</span>
          </div>

          {fareComparisonBars.length === 0 ? (
            <div className="rounded-xl bg-[#F7F9FB] border border-[#E0E4E8] p-4 text-xs sm:text-sm text-slate-600">
              {t.home.noFareDataYet}
            </div>
          ) : (
            <div className="space-y-3.5">
              {fareComparisonBars.map((bar) => {
                const fromName = getLocalizedName(governorates.find((g) => g.id === bar.from));
                const toName = getLocalizedName(governorates.find((g) => g.id === bar.to));
                return (
                  <button
                    key={`${bar.from}-${bar.to}`}
                    type="button"
                    onClick={() => {
                      setDepartureGovId(bar.from);
                      setDestinationGovId(bar.to);
                      scrollToSection('available-trips');
                    }}
                    className="w-full text-start group space-y-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-[#05203C] group-hover:text-[#0770E3] transition-colors inline-flex items-center gap-1.5">
                        <span>{fromName}</span>
                        <RouteArrow className="w-3.5 h-3.5 text-slate-400" />
                        <span>{toName}</span>
                      </span>
                      <span className="font-mono font-bold text-[#05203C] tabular-nums">
                        {formatIqd(bar.avgFare)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EFF6FF] rounded-full overflow-hidden border border-[#E0E4E8]">
                      <div
                        className="h-full bg-[#0770E3] rounded-full transition-all duration-500 group-hover:bg-[#0559B8]"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3B. EMPTY CARS SECTION (FULL-CAR PRIVATE CHARTER PRICED BY CAPTAIN) */}
      <EmptyCarsSection
        mode="section"
        trips={trips}
        governorates={governorates}
        onBookFullCar={handleBookFullCarClick}
        onBookSeats={handleBookClick}
        onNavigate={onNavigate}
      />

      {/* 4. AVAILABLE TRIPS WITH CATEGORY FILTER PILLS */}
      <section ref={tripsSectionRef} id="available-trips" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <SectionReveal>
            <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
              {t.home.availableTripsTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.home.availableTripsSub}</p>
          </SectionReveal>

          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono font-semibold text-[#05203C] tabular-nums">
              {filteredTrips.length} {t.home.showingCount}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-semibold text-[#0770E3] hover:underline cursor-pointer"
              >
                {t.home.resetFilters}
              </button>
            )}
          </div>
        </div>

        {/* Skyscanner Pill-Shaped Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
          {filterPills.map((pill) => {
            const active = tripPill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setTripPill(pill.id)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold border whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#05203C] text-white border-[#05203C]'
                    : 'bg-white text-[#05203C] border-[#CBD5E1] hover:border-[#05203C]'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {filteredTrips.length === 0 ? (
          <div className="bg-white border border-[#E0E4E8] rounded-[12px] p-10 text-center space-y-3">
            <Car className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-[#05203C]">{t.home.noTripsTitle}</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">{t.home.noTripsDesc}</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-lg hover:bg-[#0559B8] cursor-pointer"
              >
                {t.home.resetFilters}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTrips.map((tr) => (
              <div key={tr.id} className="gsap-trip-item">
                <TripCard
                  trip={tr}
                  governorates={governorates}
                  garages={garages}
                  currentUserId={firebaseUser?.uid}
                  onBook={handleBookClick}
                  onBookFullCar={handleBookFullCarClick}
                  onSeatAlert={handleSeatAlert}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. GOVERNORATE HOME-PICKUP COVERAGE GRID */}
      <section ref={providersRef} id="providers" className="bg-[#F7F9FB] border-y border-[#E0E4E8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <SectionReveal>
            <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
              {t.home.partnersTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.home.partnersSub}</p>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {governorates.slice(0, 8).map((gov) => {
              const count = trips.filter((tr) => tr.departureGovId === gov.id).length;
              return (
                <button
                  key={gov.id}
                  type="button"
                  onClick={() => {
                    setDepartureGovId(gov.id);
                    setDestinationGovId('');
                    scrollToSection('available-trips');
                  }}
                  className="gsap-provider-card surface-card-interactive bg-white border border-[#E0E4E8] rounded-[12px] p-4 text-start hover:border-[#0770E3] transition-colors cursor-pointer flex items-center gap-3.5"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#05203C] flex flex-col items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#0770E3]" />
                    <span className="text-[10px] font-mono font-bold leading-none mt-0.5">
                      {gov.code}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#05203C] truncate">
                      {getLocalizedName(gov)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate">{t.home.partnerStationTag}</span>
                      <span className="font-mono font-semibold text-[#0770E3] tabular-nums shrink-0">
                        {count}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. HORIZONTAL RATING BARS, VERIFIED DRIVERS & RIDER REVIEWS */}
      <section id="ratings" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full space-y-10">
        <div>
          <SectionReveal>
            <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
              {t.home.ratingBreakdownTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.home.reviewsSub}</p>
          </SectionReveal>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Score Summary + Horizontal Rating Bars */}
            <div className="lg:col-span-5 bg-white border border-[#E0E4E8] rounded-[12px] p-6 flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#E0E4E8] pb-5">
                <div>
                  <div className="text-xs font-semibold text-[#0770E3]">
                    {t.home.ratingOverallLabel}
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold font-mono text-[#05203C] tabular-nums">
                      {avgRatingScore.toFixed(1)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">/ 5</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{t.home.ratingBasedOn}</div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-5 h-5 ${
                        n <= Math.round(avgRatingScore)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {ratingBars.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-medium text-[#05203C]">{item.label}</span>
                      <span className="font-mono font-bold text-[#05203C] tabular-nums">
                        {item.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E0E4E8] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0770E3] rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Drivers & Reviews Cards */}
            <div className="lg:col-span-7 space-y-4">
              {publicDrivers.length === 0 ? (
                <div className="bg-white border border-[#E0E4E8] rounded-[12px] p-5 text-sm text-slate-600">
                  {t.home.noDriversYet}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {publicDrivers.slice(0, 2).map((drv) => {
                    const gov = governorates.find((g) => g.id === drv.governorateId);
                    return (
                      <div
                        key={drv.uid}
                        className="bg-white border border-[#E0E4E8] rounded-[12px] p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm text-[#05203C] flex items-center gap-1.5">
                              <span>{drv.fullName}</span>
                              <CheckCircle2 className="w-4 h-4 text-[#0770E3] shrink-0" />
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {getLocalizedName(gov)} · {drv.vehicleModel || t.tripCard.verifiedDriver}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#05203C] tabular-nums">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {(drv.ratingCount > 0 ? drv.ratingAvg : 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {drv.completedTripsCount} {t.tripCard.completedTrips}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {publishedReviews.length === 0 ? (
                <div className="bg-white border border-[#E0E4E8] rounded-[12px] p-6 text-sm text-slate-600">
                  {t.home.noReviewsYet}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {publishedReviews.slice(0, 4).map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white border border-[#E0E4E8] rounded-[12px] p-4 flex flex-col justify-between gap-3"
                    >
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{rev.comment}</p>
                      <div className="flex items-center justify-between pt-2.5 border-t border-[#E0E4E8]">
                        <span className="text-xs font-bold text-[#05203C]">{rev.passengerName}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#05203C] tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {rev.driverRating}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 8. 2x2 FAST FACTS SUMMARY BLOCK + EXPANDABLE FAQ ACCORDION */}
      <section id="facts-faq" className="bg-[#F7F9FB] border-y border-[#E0E4E8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* 2x2 Fast Facts Grid */}
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
              {t.home.fastFactsTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: t.home.fact1Title,
                  value: t.home.fact1Value,
                  icon: MapPin,
                },
                {
                  title: t.home.fact2Title,
                  value: t.home.fact2Value,
                  icon: Banknote,
                },
                {
                  title: t.home.fact3Title,
                  value: t.home.fact3Value,
                  icon: Award,
                },
                {
                  title: t.home.fact4Title,
                  value: t.home.fact4Value,
                  icon: ShieldCheck,
                },
              ].map((fact) => {
                const Icon = fact.icon;
                return (
                  <div
                    key={fact.title}
                    className="bg-white border border-[#E0E4E8] rounded-[12px] p-5 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#0770E3] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">{fact.title}</div>
                      <div className="text-base font-bold text-[#05203C] mt-0.5 tabular-nums">
                        {fact.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expandable FAQ Accordion */}
          <div className="bg-white border border-[#E0E4E8] rounded-[12px] p-5 sm:p-7 space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
                {t.home.faqTitle}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{t.home.faqSub}</p>
            </div>

            <div className="divide-y divide-[#E0E4E8] border-t border-[#E0E4E8]">
              {t.home.faqItems.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={item.q} className="py-1">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full py-3.5 text-start flex items-center justify-between gap-4 cursor-pointer group"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#05203C] group-hover:text-[#0770E3] transition-colors">
                        {item.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#0770E3]' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={prefersReduced ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={prefersReduced ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOYALTY REWARDS & DRIVER REGISTRATION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full space-y-6">
        <div id="loyalty-section" className="bg-white border border-[#E0E4E8] rounded-[12px] p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <SectionReveal className="lg:col-span-5 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0770E3]">
              <Award className="w-4 h-4" />
              <span>{t.nav.loyalty}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#05203C] tracking-tight">
              {t.home.loyaltyTitle}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t.home.loyaltySub}</p>
            <button
              type="button"
              onClick={() => (firebaseUser ? onNavigate('passenger') : onOpenAuthWithRole('passenger'))}
              className="btn-tactile px-4 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-lg hover:bg-[#0559B8] transition-colors cursor-pointer"
            >
              {t.home.loyaltyCta}
            </button>
          </SectionReveal>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#F7F9FB] border border-[#E0E4E8] rounded-[12px] p-4 space-y-1.5">
              <div className="text-xl font-bold font-mono text-[#0770E3] tabular-nums">
                <AnimatedCounter prefix="+" value={settings.pointsPerTrip} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.loyaltyEarnRule}</p>
            </div>
            <div className="bg-[#F7F9FB] border border-[#E0E4E8] rounded-[12px] p-4 space-y-1.5">
              <div className="text-xl font-bold font-mono text-[#05203C] tabular-nums">
                <AnimatedCounter value={settings.freeTripCostPoints} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.loyaltyRedeemRule}</p>
            </div>
            <div className="bg-[#F7F9FB] border border-[#E0E4E8] rounded-[12px] p-4 space-y-1.5">
              <div className="text-xl font-bold font-mono text-[#05203C] tabular-nums">
                <AnimatedCounter prefix="+" value={settings.referralBonusReferrer} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t.home.loyaltyReferralRule}</p>
            </div>
          </div>
        </div>

        <div id="become-driver" className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 bg-[#05203C] text-white rounded-[12px] p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#60A5FA]">
                <Car className="w-4 h-4" />
                <span>{t.nav.becomeDriver}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {t.home.becomeDriverTitle}
              </h2>
              <p className="text-sm text-white/80 leading-relaxed max-w-xl">
                {t.home.becomeDriverSub}
              </p>
              <ul className="space-y-2 text-sm text-white/90 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  <span>{t.home.becomeDriverBenefit1}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  <span>{t.home.becomeDriverBenefit2}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  <span>{t.home.becomeDriverBenefit3}</span>
                </li>
              </ul>
            </div>
            <div>
              <button
                type="button"
                onClick={() => (firebaseUser ? onNavigate('driver') : onOpenAuthWithRole('driver'))}
                className="btn-tactile px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-lg hover:bg-[#0559B8] transition-colors cursor-pointer"
              >
                {t.home.becomeDriverCta}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-[#E0E4E8] rounded-[12px] p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <span className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#0770E3] flex items-center justify-center">
                <HeadphonesIcon className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#05203C] tracking-tight">
                {t.home.supportTitle}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{t.home.supportSub}</p>
              <div className="pt-1" dir="ltr">
                <a
                  href={`tel:${SUPPORT_PHONE_NUMBER}`}
                  className="inline-block text-sm font-mono font-bold text-[#05203C] hover:text-[#0770E3] transition-colors tabular-nums"
                >
                  {SUPPORT_PHONE_NUMBER}
                </a>
              </div>
            </div>
            <div>
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile inline-flex items-center justify-center px-4 py-2.5 bg-white border border-[#CBD5E1] text-[#05203C] text-sm font-semibold rounded-lg hover:border-[#0770E3] hover:text-[#0770E3] transition-colors cursor-pointer"
              >
                {t.home.supportContactBtn}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. DEEP NAVY MULTI-COLUMN FOOTER */}
      <footer className="mt-auto bg-[#05203C] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/15">
            <div className="space-y-3">
              <div className="text-lg font-bold text-white">{t.brand}</div>
              <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{t.home.footerDesc}</p>
              <div className="text-xs text-[#60A5FA] font-medium">{t.home.footerPlatformNote}</div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-white">{t.home.footerRoutes}</div>
              <div className="flex flex-col items-start gap-2 text-xs sm:text-sm text-white/75">
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'available-trips')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.searchTrips}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('empty-cars')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.emptyCars}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'destinations')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.destinations}
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('providers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.subnav.providers}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-white">{t.home.footerDriverTitle}</div>
              <div className="flex flex-col items-start gap-2 text-xs sm:text-sm text-white/75">
                <button
                  type="button"
                  onClick={() => onOpenAuthWithRole('driver')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.becomeDriver}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('home', 'loyalty-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.nav.loyalty}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.home.contactUs}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-white">{t.home.footerLegal}</div>
              <div className="flex flex-col items-start gap-2 text-xs sm:text-sm text-white/75">
                <button
                  type="button"
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.home.privacyPolicy}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.home.termsConditions}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('cancellation')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.home.cancellationPolicy}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/65">
            <span>
              © {new Date().getFullYear()} {t.home.copyright}
            </span>
            <div className="flex items-center gap-4">
              <span>
                {t.hero.governoratesCount} {t.hero.statGovernorates}
              </span>
              {onOpenAdminCode && (
                <button
                  type="button"
                  onClick={onOpenAdminCode}
                  className="text-white/55 hover:text-white transition-colors underline underline-offset-4 cursor-pointer"
                >
                  {t.admin.adminAccessBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

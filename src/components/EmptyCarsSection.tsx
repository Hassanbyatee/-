import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CarFront,
  ChevronRight,
  Clock,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import {
  isTripCompletelyEmpty,
  type Governorate,
  type Trip,
} from '../types/domain';
import type { AppView } from './Navbar';

interface EmptyCarsSectionProps {
  mode: 'section' | 'page';
  trips: Trip[];
  governorates: Governorate[];
  onBookFullCar: (trip: Trip) => void;
  onBookSeats: (trip: Trip) => void;
  onNavigate?: (view: AppView, sectionId?: string) => void;
}

export const EmptyCarsSection: React.FC<EmptyCarsSectionProps> = ({
  mode,
  trips,
  governorates,
  onBookFullCar,
  onBookSeats,
  onNavigate,
}) => {
  const { t, lang, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const { firebaseUser } = useAuth();

  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'only_empty'>('all');
  const [capacityFilter, setCapacityFilter] = useState<'all' | '4' | '6'>('all');
  const [fromGovId, setFromGovId] = useState('');
  const [toGovId, setToGovId] = useState('');

  const getGovName = (id: string) => {
    const gov = governorates.find((g) => g.id === id);
    if (!gov) return id;
    return lang === 'ar' ? gov.nameAr : lang === 'ku' ? gov.nameKu : gov.nameEn;
  };

  const fullCarTrips = useMemo(() => {
    const eligible = trips.filter(
      (trip) =>
        trip.status === 'scheduled' &&
        Number(trip.fullCarPriceIqd || 0) > 0
    );

    const filtered = eligible.filter((trip) => {
      if (availabilityFilter === 'only_empty' && !isTripCompletelyEmpty(trip)) {
        return false;
      }
      if (capacityFilter === '4' && Number(trip.totalSeats) >= 6) {
        return false;
      }
      if (capacityFilter === '6' && Number(trip.totalSeats) < 6) {
        return false;
      }
      if (fromGovId && trip.departureGovId !== fromGovId) {
        return false;
      }
      if (toGovId && trip.destinationGovId !== toGovId) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aEmpty = isTripCompletelyEmpty(a) ? 0 : 1;
      const bEmpty = isTripCompletelyEmpty(b) ? 0 : 1;
      if (aEmpty !== bEmpty) return aEmpty - bEmpty;
      return `${a.departureDate} ${a.departureTime}`.localeCompare(
        `${b.departureDate} ${b.departureTime}`
      );
    });
  }, [trips, availabilityFilter, capacityFilter, fromGovId, toGovId]);

  const displayedTrips = mode === 'section' ? fullCarTrips.slice(0, 6) : fullCarTrips;

  return (
    <div id="empty-cars-section">
      {mode === 'page' && (
        <section className="bg-[#05203C] text-white border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mb-3">
              <button
                type="button"
                onClick={() => onNavigate?.('home')}
                className="hover:text-white transition-colors"
              >
                {t.hero.breadcrumbHome}
              </button>
              <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              <span className="text-white font-medium">{t.hero.breadcrumbEmptyCars}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {t.home.emptyCarsPageTitle}
                </h1>
                <p className="text-sm text-[#CBD5E1] mt-2 max-w-2xl">
                  {t.home.emptyCarsPageSub}
                </p>
              </div>
              <div className="text-sm font-semibold text-white tabular-nums whitespace-nowrap shrink-0">
                {fullCarTrips.length} {t.home.emptyCarsCount}
              </div>
            </div>

            {/* Filters Bar */}
            <div className="mt-6 bg-white/10 border border-white/15 rounded-xl p-3 grid grid-cols-1 md:grid-cols-12 gap-2.5">
              <div className="md:col-span-4 flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('all')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    availabilityFilter === 'all'
                      ? 'bg-white text-[#05203C]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {t.home.emptyCarsFilterAll}
                </button>
                <button
                  type="button"
                  onClick={() => setAvailabilityFilter('only_empty')}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    availabilityFilter === 'only_empty'
                      ? 'bg-white text-[#05203C]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {t.home.emptyCarsFilterOnlyEmpty}
                </button>
              </div>

              <div className="md:col-span-4 flex items-center gap-1 bg-white/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setCapacityFilter('all')}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    capacityFilter === 'all'
                      ? 'bg-white text-[#05203C]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {t.filters.all}
                </button>
                <button
                  type="button"
                  onClick={() => setCapacityFilter('4')}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    capacityFilter === '4'
                      ? 'bg-white text-[#05203C]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {t.home.emptyCarsFilter4Seats}
                </button>
                <button
                  type="button"
                  onClick={() => setCapacityFilter('6')}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    capacityFilter === '6'
                      ? 'bg-white text-[#05203C]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  {t.home.emptyCarsFilter6Seats}
                </button>
              </div>

              <div className="md:col-span-2">
                <select
                  value={fromGovId}
                  onChange={(e) => setFromGovId(e.target.value)}
                  className="w-full h-10 bg-white text-[#161616] text-xs font-semibold rounded-lg px-3 border border-transparent focus:outline-none"
                >
                  <option value="">{t.hero.fromLabel}: {t.hero.allGovernorates}</option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {getGovName(g.id)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={toGovId}
                  onChange={(e) => setToGovId(e.target.value)}
                  className="w-full h-10 bg-white text-[#161616] text-xs font-semibold rounded-lg px-3 border border-transparent focus:outline-none"
                >
                  <option value="">{t.hero.toLabel}: {t.hero.allGovernorates}</option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {getGovName(g.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        className={
          mode === 'section'
            ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 border-b border-slate-200'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'
        }
      >
        {mode === 'section' && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0770E3] mb-1">
                <CarFront className="w-4 h-4" />
                <span>{t.nav.emptyCars}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#05203C] tracking-tight">
                {t.home.emptyCarsTitle}
              </h2>
              <p className="text-sm text-[#626971] mt-1">{t.home.emptyCarsSub}</p>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('empty-cars')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0770E3] hover:text-[#0558B5] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.home.viewAllEmptyCars}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}

        {displayedTrips.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <CarFront className="w-9 h-9 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#161616]">{t.home.emptyCarsEmptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTrips.map((trip) => {
              const isCompletelyEmpty = isTripCompletelyEmpty(trip);
              const isOwnTrip = firebaseUser?.uid === trip.driverId;
              const isDisabledFullCar = !isCompletelyEmpty || isOwnTrip;
              const fullPrice = Number(trip.fullCarPriceIqd || 0);
              const seatCapacity = Number(trip.totalSeats) >= 6 ? 6 : Number(trip.totalSeats) || 4;

              return (
                <article
                  key={trip.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between transition-colors hover:border-[#0770E3]/40"
                >
                  <div>
                    {/* Quiet unboxed metadata line */}
                    <div className="flex items-center justify-between gap-2 text-xs text-[#626971] pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-[#05203C] truncate">
                          {trip.vehicleModel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums whitespace-nowrap">
                          <Users className="w-3.5 h-3.5 text-[#0770E3]" />
                          {seatCapacity} {t.tripCard.seatsUnit}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${
                          isCompletelyEmpty ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {isCompletelyEmpty
                          ? t.tripCard.emptyCarReadyBadge
                          : t.tripCard.carNotEmpty}
                      </span>
                    </div>

                    {/* Route headline */}
                    <div className="mt-3.5 flex items-center gap-2 text-base font-extrabold text-[#05203C]">
                      <span className="truncate">{getGovName(trip.departureGovId)}</span>
                      {isRtl ? (
                        <ArrowLeft className="w-4 h-4 text-[#0770E3] shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-[#0770E3] shrink-0" />
                      )}
                      <span className="truncate">{getGovName(trip.destinationGovId)}</span>
                    </div>

                    {/* Date, time & driver info */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#626971]">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.departureDate}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        {trip.departureTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                        {trip.driverName}
                      </span>
                    </div>

                    {/* Seat inventory & optional cargo */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#626971]">
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <MapPin className="w-3.5 h-3.5" />
                        {trip.availableSeats} / {trip.totalSeats} {t.tripCard.seatsAvailable}
                      </span>
                      {trip.cargoEnabled && Number(trip.cargoPriceIqd || 0) >= 0 && (
                        <span className="inline-flex items-center gap-1 text-[#05203C]">
                          <Package className="w-3.5 h-3.5 text-[#0770E3]" />
                          {t.booking.cargoAvailableBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Full-car price & action block */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-[#626971]">
                        {t.tripCard.fullCarPriceLabel}
                      </span>
                      <div className="text-end">
                        <span className="text-xl font-extrabold text-[#05203C] tabular-nums">
                          {fullPrice.toLocaleString()}
                        </span>{' '}
                        <span className="text-xs font-semibold text-[#626971]">{t.currency}</span>
                      </div>
                    </div>

                    {isDisabledFullCar ? (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          title={
                            isOwnTrip
                              ? t.tripCard.ownTrip
                              : t.tripCard.carNotEmptyTooltip
                          }
                          className="w-full py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 bg-slate-200 text-slate-500 border border-slate-300 opacity-45 cursor-not-allowed pointer-events-none select-none"
                        >
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>
                            {isOwnTrip ? t.tripCard.ownTrip : t.tripCard.carNotEmpty}
                          </span>
                        </button>
                        {!isCompletelyEmpty && (
                          <p className="text-[11px] text-[#626971] text-center">
                            {t.tripCard.carNotEmptyTooltip}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBookFullCar(trip)}
                        className="w-full py-2.5 px-4 rounded-lg text-sm font-bold bg-[#0770E3] hover:bg-[#0558B5] text-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <CarFront className="w-4 h-4 shrink-0" />
                        <span>{t.tripCard.bookFullCar}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onBookSeats(trip)}
                      className="w-full py-1.5 text-xs font-semibold text-[#0770E3] hover:text-[#0558B5] hover:underline transition-colors"
                    >
                      {t.tripCard.bookSeat} ({trip.pricePerSeatIqd.toLocaleString()} {t.currency})
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

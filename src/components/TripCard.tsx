import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  Package,
  Star,
  Users,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { formatIraqiPlateDisplay } from '../data/iraqReferenceData';
import {
  getTripMaxSeatPrice,
  getTripMinSeatPrice,
  isTripCompletelyEmpty,
  type Garage,
  type Governorate,
  type Trip,
} from '../types/domain';

interface TripCardProps {
  trip: Trip;
  governorates: Governorate[];
  garages: Garage[];
  currentUserId?: string;
  onBook: (trip: Trip) => void;
  onBookFullCar?: (trip: Trip) => void;
  onSeatAlert: (trip: Trip) => Promise<void>;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  governorates,
  currentUserId,
  onBook,
  onBookFullCar,
  onSeatAlert,
}) => {
  const { dir, lang, getLocalizedName, formatIqd, t } = useI18n();
  const [alertSaved, setAlertSaved] = useState(false);

  const depGov = governorates.find((g) => g.id === trip.departureGovId);
  const dstGov = governorates.find((g) => g.id === trip.destinationGovId);

  const isOwnTrip = currentUserId === trip.driverId;
  const isFull = trip.availableSeats <= 0;
  const RouteArrow = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const minSeatPrice = getTripMinSeatPrice(trip);
  const maxSeatPrice = getTripMaxSeatPrice(trip);
  const hasVariedSeatPrices = maxSeatPrice > minSeatPrice;
  const hasFullCarPrice = Number(trip.fullCarPriceIqd || 0) > 0;
  const isCompletelyEmpty = isTripCompletelyEmpty(trip);
  const formattedPlate = formatIraqiPlateDisplay(trip, lang);

  const handleAlert = async () => {
    await onSeatAlert(trip);
    setAlertSaved(true);
  };

  return (
    <article className="surface-card surface-card-interactive bg-white rounded-[12px] border-[#E0E4E8] p-5 flex flex-col sm:flex-row justify-between gap-5">
      {/* Start Column: Route Title, Variant/Driver, Specs Row, Benefit Badge */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-3.5">
        <div className="space-y-2.5">
          {/* Date & Time Kicker */}
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-[#05203C] tabular-nums">{trip.departureDate}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-[#0770E3] tabular-nums">
              {trip.departureTime}
            </span>
            {trip.isSpecialOffer && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-amber-700">{t.tripCard.specialOffer}</span>
              </>
            )}
          </div>

          {/* Primary Title & Subtitle Variant */}
          <div>
            <h3 className="text-lg font-bold text-[#05203C] leading-snug flex items-center gap-2 flex-wrap">
              <span>{getLocalizedName(depGov) || trip.departureGovId}</span>
              <RouteArrow className="w-4 h-4 text-[#0770E3] shrink-0" />
              <span>{getLocalizedName(dstGov) || trip.destinationGovId}</span>
            </h3>
            <div className="text-sm text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-[#05203C]">{trip.vehicleModel}</span>
              {formattedPlate && (
                <span
                  dir="ltr"
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F7F9FB] border border-[#CBD5E1] text-[11px] font-mono font-bold text-[#05203C] tabular-nums"
                >
                  {formattedPlate}
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <span>{trip.driverName}</span>
                {trip.driverVerified && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-[#0770E3] shrink-0"
                    aria-label={t.tripCard.verifiedDriver}
                  />
                )}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#05203C] tabular-nums">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {(trip.driverRating || 0) > 0 ? trip.driverRating!.toFixed(1) : t.tripCard.unratedDriver}
              </span>
            </div>
          </div>

          {/* Specs Row with Small Icons */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${
                isFull ? 'text-rose-600' : 'text-[#05203C]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#0770E3] shrink-0" />
              {isFull
                ? t.tripCard.fullTrip
                : `${trip.availableSeats}/${trip.totalSeats} ${t.tripCard.seatsAvailable}`}
            </span>

            {trip.estimatedDurationMin ? (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {trip.estimatedDurationMin} {t.tripCard.durationMins}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1.5 truncate max-w-full">
              <MapPin className="w-3.5 h-3.5 text-[#0770E3] shrink-0" />
              <span className="truncate">{t.tripCard.homePickupLabel}</span>
            </span>
          </div>

          {trip.notes && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {trip.notes}
            </p>
          )}
        </div>

        {/* Optional Benefit Badge Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#EFF6FF] text-[#0770E3] text-xs font-semibold">
            {t.tripCard.cashOnBoard}
          </span>
          {trip.cargoEnabled && Number(trip.cargoPriceIqd || 0) > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Package className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                {t.booking.cargoAvailableBadge} ({formatIqd(Number(trip.cargoPriceIqd || 0))})
              </span>
            </span>
          )}
          {trip.driverVerified && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F7F9FB] border border-[#E0E4E8] text-[#05203C] text-xs font-medium">
              {t.tripCard.verifiedDriver} · {trip.driverCompletedTrips || 0}{' '}
              {t.tripCard.completedTrips}
            </span>
          )}
        </div>
      </div>

      {/* End Column: Right-Aligned Vehicle Thumbnail & Bottom-Right Bold Price + CTA */}
      <div className="sm:w-44 shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-4 border-t sm:border-t-0 sm:border-s border-[#E0E4E8] pt-4 sm:pt-0 sm:ps-5">
        {/* Right-aligned Vehicle Image / Clean Skyscanner Illustration Box */}
        <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-lg border border-[#E0E4E8] bg-[#F7F9FB] overflow-hidden flex items-center justify-center shrink-0">
          {trip.vehiclePhotoUrl ? (
            <img
              src={trip.vehiclePhotoUrl}
              alt={trip.vehicleModel}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#05203C]/70 px-2 text-center">
              <Car className="w-7 h-7 text-[#0770E3]" />
              {formattedPlate ? (
                <span
                  dir="ltr"
                  className="text-[10px] font-mono text-slate-600 font-semibold mt-0.5 truncate max-w-full"
                >
                  {formattedPlate}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Bottom-Right Price & Action */}
        <div className="text-end space-y-2">
          <div>
            {trip.isSpecialOffer &&
            trip.originalPriceIqd &&
            trip.originalPriceIqd > minSeatPrice ? (
              <div className="text-xs text-slate-400 line-through font-mono tabular-nums">
                {formatIqd(trip.originalPriceIqd)}
              </div>
            ) : null}
            <div className="text-xl font-bold text-[#05203C] font-mono tabular-nums leading-tight">
              {hasVariedSeatPrices
                ? `${minSeatPrice.toLocaleString('en-US')}–${maxSeatPrice.toLocaleString('en-US')} ${t.currency}`
                : formatIqd(minSeatPrice)}
            </div>
            <div className="text-[11px] text-slate-500">
              {hasVariedSeatPrices ? t.booking.seatPriceRangeHint : t.tripCard.perSeat}
            </div>
          </div>

          {isOwnTrip ? (
            <span className="inline-block text-xs font-medium text-slate-500 px-3 py-1.5 border border-[#E0E4E8] rounded-lg whitespace-nowrap">
              {t.tripCard.ownTrip}
            </span>
          ) : isFull ? (
            <button
              type="button"
              onClick={handleAlert}
              disabled={alertSaved}
              className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#CBD5E1] text-[#05203C] rounded-lg hover:border-[#05203C] disabled:opacity-60 whitespace-nowrap cursor-pointer transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{alertSaved ? t.tripCard.alertSubscribed : t.tripCard.notifySeat}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onBook(trip)}
              className="btn-tactile w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#0770E3] rounded-lg hover:bg-[#0559B8] transition-colors whitespace-nowrap cursor-pointer"
            >
              {t.tripCard.bookSeat}
            </button>
          )}

          {hasFullCarPrice && onBookFullCar && !isOwnTrip && (
            isCompletelyEmpty ? (
              <button
                type="button"
                onClick={() => onBookFullCar(trip)}
                className="w-full px-3 py-1.5 text-[11px] font-bold text-[#05203C] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors whitespace-nowrap cursor-pointer"
              >
                {t.tripCard.bookFullCar} · {formatIqd(Number(trip.fullCarPriceIqd || 0))}
              </button>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title={t.tripCard.carNotEmptyTooltip}
                className="w-full px-3 py-1.5 text-[11px] font-bold bg-slate-200 text-slate-500 border border-slate-300 rounded-lg opacity-45 cursor-not-allowed pointer-events-none select-none inline-flex items-center justify-center gap-1 whitespace-nowrap"
              >
                <Lock className="w-3 h-3 shrink-0" />
                <span>{t.tripCard.carNotEmpty}</span>
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
};

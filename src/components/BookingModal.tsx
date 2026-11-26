import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Award, Banknote, MapPin, Package, Repeat, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { formatIraqiPlateDisplay } from '../data/iraqReferenceData';
import { createBookingTransaction, CUSTOM_DROPOFF_FEE_IQD } from '../services/platformService';
import { AnimatedModalShell } from './motion/KineticPrimitives';
import { CarCabinSeatSelector } from './CarCabinSeatSelector';
import { DropOffMapPicker } from './DropOffMapPicker';
import {
  getSeatIdsForCapacity,
  getTripMinSeatPrice,
  getTripSeatPrice,
  isTripCompletelyEmpty,
  resolveTripSeatPrices,
  type CabinSeatId,
  type Trip,
} from '../types/domain';

interface BookingModalProps {
  trip: Trip | null;
  mode?: 'seats' | 'full_car';
  onClose: () => void;
  onSuccess: (dropOffCoords?: { lat: number; lng: number } | null) => void;
}

const LEGACY_FILL_ORDER: CabinSeatId[] = [
  'rear_left',
  'rear_right',
  'rear_middle',
  'front_passenger',
  'extra_left',
  'extra_right',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  trip: initialTrip,
  mode = 'seats',
  onClose,
  onSuccess,
}) => {
  const { lang, getLocalizedName, formatIqd, t } = useI18n();
  const { userProfile, privateInfo, wallet, settings, governorates, trips } = useAuth();

  const trip = useMemo(
    () => (initialTrip ? trips.find((tr) => tr.id === initialTrip.id) || initialTrip : null),
    [initialTrip, trips]
  );

  const isFullCarMode = mode === 'full_car';
  const tripCapacity = trip ? (Number(trip.totalSeats) >= 6 ? 6 : Math.max(1, Number(trip.totalSeats) || 4)) : 4;
  const activeCabinSeats = useMemo(() => getSeatIdsForCapacity(tripCapacity), [tripCapacity]);
  const isCompletelyEmpty = isTripCompletelyEmpty(trip);
  const fullCarPriceIqd = Number(trip?.fullCarPriceIqd || 0);
  const hasValidFullCarPrice = fullCarPriceIqd > 0;

  const [selectedSeats, setSelectedSeats] = useState<CabinSeatId[]>([]);
  const [useCustomDropOff, setUseCustomDropOff] = useState(false);
  const [dropOffCoords, setDropOffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropOffAddress, setDropOffAddress] = useState('');
  const [includeCargo, setIncludeCargo] = useState(false);
  const [cargoNotes, setCargoNotes] = useState('');
  const [redeemFreeTrip, setRedeemFreeTrip] = useState(false);
  const [roundTripEnabled, setRoundTripEnabled] = useState(false);
  const [returnTripId, setReturnTripId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveBookedSeats = useMemo<CabinSeatId[]>(() => {
    if (!trip) return [];
    const booked = new Set<CabinSeatId>(trip.bookedSeats || []);
    const occupiedCount = Math.max(0, Math.min(tripCapacity, trip.totalSeats) - trip.availableSeats);
    for (const seat of LEGACY_FILL_ORDER) {
      if (booked.size >= occupiedCount) break;
      if (activeCabinSeats.includes(seat)) {
        booked.add(seat);
      }
    }
    return Array.from(booked);
  }, [trip, tripCapacity, activeCabinSeats]);

  const maxSelectable = trip
    ? isFullCarMode
      ? tripCapacity
      : Math.max(0, Math.min(tripCapacity, trip.availableSeats))
    : 0;

  useEffect(() => {
    if (!trip) {
      setSelectedSeats([]);
      setUseCustomDropOff(false);
      setDropOffCoords(null);
      setDropOffAddress('');
      setIncludeCargo(false);
      setCargoNotes('');
      setRedeemFreeTrip(false);
      setRoundTripEnabled(false);
      setReturnTripId('');
      setNotes('');
      setErrorMsg('');
      return;
    }
    if (isFullCarMode) {
      setSelectedSeats(isCompletelyEmpty ? activeCabinSeats : []);
    } else {
      const bookedSet = new Set<CabinSeatId>(trip.bookedSeats || []);
      const occupiedCount = Math.max(0, Math.min(tripCapacity, trip.totalSeats) - trip.availableSeats);
      for (const seat of LEGACY_FILL_ORDER) {
        if (bookedSet.size >= occupiedCount) break;
        if (activeCabinSeats.includes(seat)) {
          bookedSet.add(seat);
        }
      }
      const firstAvailable = activeCabinSeats.find((s) => !bookedSet.has(s));
      setSelectedSeats(firstAvailable && trip.availableSeats > 0 ? [firstAvailable] : []);
    }
    setUseCustomDropOff(false);
    setDropOffCoords(null);
    setDropOffAddress('');
    setIncludeCargo(false);
    setCargoNotes('');
    setRedeemFreeTrip(false);
    setRoundTripEnabled(false);
    setReturnTripId('');
    setNotes('');
    setErrorMsg('');
  }, [trip?.id, trip?.availableSeats, trip?.totalSeats, trip?.bookedSeats, isFullCarMode, isCompletelyEmpty, tripCapacity, activeCabinSeats]);

  const seatsCount = selectedSeats.length;

  const handleToggleSeat = (seatId: CabinSeatId) => {
    if (isFullCarMode || effectiveBookedSeats.includes(seatId)) return;
    setErrorMsg('');
    setSelectedSeats((prev) => {
      let next: CabinSeatId[];
      if (prev.includes(seatId)) {
        next = prev.filter((id) => id !== seatId);
      } else if (maxSelectable <= 1) {
        next = [seatId];
      } else if (prev.length < maxSelectable) {
        next = [...prev, seatId];
      } else {
        next = prev;
      }
      if (next.length !== 1) {
        setRedeemFreeTrip(false);
      }
      return next;
    });
  };

  const returnOptions = useMemo(() => {
    if (!trip || isFullCarMode) return [];
    const needed = Math.max(1, seatsCount);
    return trips.filter(
      (cand) =>
        cand.id !== trip.id &&
        cand.status === 'scheduled' &&
        cand.departureGovId === trip.destinationGovId &&
        cand.destinationGovId === trip.departureGovId &&
        cand.departureDate >= trip.departureDate &&
        cand.availableSeats >= needed &&
        cand.driverId !== userProfile?.uid
    );
  }, [trip, trips, seatsCount, userProfile?.uid, isFullCarMode]);

  const isOpen = Boolean(trip && userProfile);
  const isPassengerApproved =
    userProfile?.verificationStatus === 'approved' && userProfile?.accountStatus === 'active';

  const depGov = trip ? governorates.find((g) => g.id === trip.departureGovId) : undefined;
  const dstGov = trip ? governorates.find((g) => g.id === trip.destinationGovId) : undefined;
  const selectedReturnTrip =
    !isFullCarMode && roundTripEnabled
      ? returnOptions.find((r) => r.id === returnTripId) || null
      : null;

  const tripSeatPrices = useMemo(() => resolveTripSeatPrices(trip), [trip]);
  const seatsSubtotalIqd = useMemo(() => {
    if (!trip) return 0;
    if (isFullCarMode) return fullCarPriceIqd;
    return selectedSeats.reduce((sum, seat) => sum + getTripSeatPrice(trip, seat), 0);
  }, [trip, selectedSeats, isFullCarMode, fullCarPriceIqd]);
  const cargoSupported = Boolean(trip?.cargoEnabled && Number(trip?.cargoPriceIqd || 0) > 0);
  const cargoFeeIqd = cargoSupported && includeCargo ? Number(trip?.cargoPriceIqd || 0) : 0;

  const hasEnoughPoints = (wallet?.balance || 0) >= settings.freeTripCostPoints;
  const withinFreeCap = trip ? seatsSubtotalIqd <= settings.maxFreeTripValueIqd : false;
  const canRedeemPoints = !isFullCarMode && hasEnoughPoints && withinFreeCap && seatsCount === 1;

  const outboundCash = trip ? (redeemFreeTrip ? 0 : seatsSubtotalIqd) : 0;
  const customDropOffFeeIqd = useCustomDropOff ? CUSTOM_DROPOFF_FEE_IQD : 0;
  const returnCash = selectedReturnTrip ? getTripMinSeatPrice(selectedReturnTrip) * seatsCount : 0;
  const totalCashDue = outboundCash + cargoFeeIqd + customDropOffFeeIqd + returnCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || !userProfile) return;
    if (!isPassengerApproved) {
      setErrorMsg(t.errors.unapprovedUser);
      return;
    }
    if (isFullCarMode && (!isCompletelyEmpty || !hasValidFullCarPrice)) {
      setErrorMsg(t.booking.carNotEmptyError);
      return;
    }
    if (selectedSeats.length === 0) {
      setErrorMsg(t.booking.selectAtLeastOneSeat);
      return;
    }
    if (useCustomDropOff && !dropOffCoords) {
      setErrorMsg(t.booking.customDropOffMissingCoords);
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await createBookingTransaction({
        trip,
        passenger: userProfile,
        passengerPhone: privateInfo?.phone || '',
        seatsCount: selectedSeats.length,
        selectedSeats,
        isFullCar: isFullCarMode,
        notes,
        includeCargo: cargoSupported && includeCargo,
        cargoNotes,
        useCustomDropOff,
        customDropOffLat: dropOffCoords?.lat,
        customDropOffLng: dropOffCoords?.lng,
        customDropOffAddress: dropOffAddress,
        redeemFreeTrip: isFullCarMode ? false : redeemFreeTrip,
        settings,
        returnTrip: selectedReturnTrip,
      });
      onSuccess(useCustomDropOff ? dropOffCoords : null);
      onClose();
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'UNAPPROVED_USER') setErrorMsg(t.errors.unapprovedUser);
      else if (code === 'CANNOT_BOOK_OWN_TRIP') setErrorMsg(t.tripCard.ownTrip);
      else if (code === 'CAR_NOT_EMPTY') setErrorMsg(t.booking.carNotEmptyError);
      else if (code === 'INSUFFICIENT_SEATS') setErrorMsg(t.errors.insufficientSeats);
      else if (code === 'SEAT_ALREADY_BOOKED') setErrorMsg(t.booking.seatAlreadyBooked);
      else if (code === 'DUPLICATE_BOOKING') setErrorMsg(t.errors.duplicateBooking);
      else if (code === 'INSUFFICIENT_POINTS') setErrorMsg(t.booking.insufficientPoints);
      else if (code === 'EXCEEDS_MAX_FREE_VALUE') setErrorMsg(t.booking.exceedsMaxFreeValue);
      else setErrorMsg(t.errors.generic);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedModalShell isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl">
      {trip && userProfile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 relative shadow-[var(--shadow-elevated)] max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 absolute top-4 end-4 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="border-b border-slate-100 pb-4 pe-8">
            <h2 className="text-xl font-bold text-[#05203C]">
              {isFullCarMode ? t.booking.fullCarModalTitle : t.booking.modalTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {getLocalizedName(depGov)} → {getLocalizedName(dstGov)} ·{' '}
              <span className="font-mono tabular-nums">
                {trip.departureDate} · {trip.departureTime}
              </span>
            </p>
            <div className="text-xs text-[#0770E3] font-semibold mt-1 flex flex-wrap items-center gap-1.5">
              <span>
                {trip.vehicleModel} · {tripCapacity} {t.tripCard.seatsUnit}
              </span>
              {formatIraqiPlateDisplay(trip, lang) && (
                <>
                  <span>·</span>
                  <span
                    dir="ltr"
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F7F9FB] border border-[#CBD5E1] font-mono font-bold text-[#05203C] tabular-nums"
                  >
                    {formatIraqiPlateDisplay(trip, lang)}
                  </span>
                </>
              )}
              <span>·</span>
              {isFullCarMode ? (
                <span>
                  {t.tripCard.fullCarPriceLabel}:{' '}
                  <span className="font-mono tabular-nums">{formatIqd(fullCarPriceIqd)}</span>
                </span>
              ) : (
                <span>
                  {trip.availableSeats} {t.tripCard.seatsAvailable} · {t.map.startingFrom}{' '}
                  <span className="font-mono tabular-nums">{formatIqd(getTripMinSeatPrice(trip))}</span>
                </span>
              )}
            </div>
          </div>

          {!isPassengerApproved && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{t.auth.pendingApprovalBannerTitle}</p>
                <p className="text-amber-800">{t.errors.unapprovedUser}</p>
              </div>
            </div>
          )}

          {isFullCarMode && (!isCompletelyEmpty || !hasValidFullCarPrice) && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <p className="font-semibold">{t.booking.carNotEmptyError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Top-Down 3D Car Seat Selector with 4/6-Seat Support & Per-Seat Prices */}
            <CarCabinSeatSelector
              bookedSeats={effectiveBookedSeats}
              selectedSeats={selectedSeats}
              maxSelectable={maxSelectable}
              seatPrices={tripSeatPrices}
              totalSeats={tripCapacity}
              fullCarMode={isFullCarMode}
              fullCarPriceIqd={fullCarPriceIqd}
              onToggleSeat={handleToggleSeat}
            />

            {/* Optional Cargo / Parcels Shipping Option */}
            {cargoSupported && (
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#0770E3]" />
                  <span>{t.booking.cargoOptionTitle}</span>
                </label>
                <div
                  className={`p-3.5 rounded-xl border transition-colors ${
                    includeCargo ? 'border-[#0770E3] bg-[#EFF6FF]/60' : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeCargo}
                        onChange={(e) => setIncludeCargo(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#0770E3]"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                          {t.booking.cargoAddLabel}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {t.booking.cargoOptionDesc}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#05203C] font-mono tabular-nums whitespace-nowrap">
                      +{formatIqd(Number(trip?.cargoPriceIqd || 0))}
                    </span>
                  </label>
                  {includeCargo && (
                    <input
                      type="text"
                      maxLength={240}
                      placeholder={t.booking.cargoNotesPlaceholder}
                      value={cargoNotes}
                      onChange={(e) => setCargoNotes(e.target.value)}
                      className="mt-3 w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0770E3]"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Arrival Drop-Off Option & Interactive Map Picker (+10,000 IQD) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                {t.booking.dropOffTitle}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setUseCustomDropOff(false)}
                  className={`p-3 rounded-xl border text-start flex items-start gap-2.5 cursor-pointer transition-colors ${
                    !useCustomDropOff
                      ? 'border-[#0770E3] bg-[#EFF6FF]/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      {t.booking.standardDropOffLabel}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {t.booking.standardDropOffDesc}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUseCustomDropOff(true)}
                  className={`p-3 rounded-xl border text-start flex items-start gap-2.5 cursor-pointer transition-colors ${
                    useCustomDropOff
                      ? 'border-[#0770E3] bg-[#EFF6FF]/60'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-[#0770E3] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      {t.booking.customDropOffLabel}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {t.booking.customDropOffDesc}
                    </div>
                  </div>
                </button>
              </div>

              {useCustomDropOff && (
                <DropOffMapPicker
                  value={dropOffCoords}
                  fallbackLat={dstGov?.lat ?? 33.3152}
                  fallbackLng={dstGov?.lng ?? 44.3661}
                  address={dropOffAddress}
                  onChange={setDropOffCoords}
                  onAddressChange={setDropOffAddress}
                />
              )}
            </div>

            {/* Payment Method: Cash vs Points Redemption */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {t.booking.paymentMethodTitle}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRedeemFreeTrip(false)}
                  className={`p-3 rounded-xl border text-start flex items-start gap-2.5 cursor-pointer transition-colors ${
                    !redeemFreeTrip ? 'border-[#0770E3] bg-[#EFF6FF]/60' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#0770E3] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">{t.booking.payCashLabel}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{t.booking.payCashDesc}</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!canRedeemPoints}
                  onClick={() => canRedeemPoints && setRedeemFreeTrip(true)}
                  className={`p-3 rounded-xl border text-start flex items-start gap-2.5 disabled:opacity-50 transition-colors ${
                    redeemFreeTrip ? 'border-[#0770E3] bg-[#EFF6FF]/60' : 'border-slate-200'
                  } ${canRedeemPoints ? 'cursor-pointer hover:border-slate-300' : 'cursor-not-allowed'}`}
                >
                  <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      {t.booking.redeemPointsLabel} ({settings.freeTripCostPoints.toLocaleString()}{' '}
                      {t.pointsUnit})
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {isFullCarMode
                        ? t.booking.fullCarCannotRedeemPoints
                        : !hasEnoughPoints
                        ? t.booking.insufficientPoints
                        : !withinFreeCap
                        ? `${t.booking.exceedsMaxFreeValue} (${formatIqd(settings.maxFreeTripValueIqd)})`
                        : seatsCount !== 1
                        ? t.booking.onlyOneSeatForFree
                        : t.booking.redeemPointsDesc}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Round Trip Selector (Per-Seat Bookings Only) */}
            {!isFullCarMode && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roundTripEnabled}
                    onChange={(e) => setRoundTripEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-[#0770E3]"
                  />
                  <Repeat className="w-4 h-4 text-[#0770E3]" />
                  <span>{t.booking.roundTripLabel}</span>
                </label>

                {roundTripEnabled && (
                  <div>
                    {returnOptions.length === 0 ? (
                      <p className="text-xs text-slate-500">{t.booking.noReturnTrips}</p>
                    ) : (
                      <select
                        value={returnTripId}
                        onChange={(e) => setReturnTripId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="">{t.booking.selectReturnTrip}</option>
                        {returnOptions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.departureDate} · {r.departureTime} · {r.driverName} ·{' '}
                            {formatIqd(r.pricePerSeatIqd)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.booking.notesLabel}
              </label>
              <textarea
                rows={2}
                maxLength={300}
                placeholder={t.booking.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#0770E3]"
              />
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>
                  {isFullCarMode
                    ? `${t.booking.fullCarFareLabel} (${tripCapacity} ${t.tripCard.seatsUnit})`
                    : `${t.booking.seatsSubtotalLabel} (${seatsCount})`}
                </span>
                <span className="font-bold font-mono tabular-nums text-slate-900">
                  {redeemFreeTrip ? formatIqd(0) : formatIqd(seatsSubtotalIqd)}
                </span>
              </div>
              {includeCargo && cargoFeeIqd > 0 && (
                <div className="flex items-center justify-between text-xs text-[#0770E3]">
                  <span className="font-semibold">{t.booking.cargoFeeLabel}</span>
                  <span className="font-bold font-mono tabular-nums">
                    +{formatIqd(cargoFeeIqd)}
                  </span>
                </div>
              )}
              {useCustomDropOff && (
                <div className="flex items-center justify-between text-xs text-[#0770E3]">
                  <span className="font-semibold">{t.booking.customDropOffFeeLabel}</span>
                  <span className="font-bold font-mono tabular-nums">
                    +{formatIqd(CUSTOM_DROPOFF_FEE_IQD)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                <span className="text-slate-700 font-semibold">{t.booking.totalDueCash}</span>
                <span className="text-base font-extrabold text-[#05203C] font-mono tabular-nums">
                  {formatIqd(totalCashDue)}
                </span>
              </div>
              {redeemFreeTrip && (
                <div className="flex items-center justify-between text-amber-700">
                  <span>{t.booking.pointsToDeduct}</span>
                  <span className="font-bold font-mono tabular-nums">
                    -{settings.freeTripCostPoints.toLocaleString()} {t.pointsUnit}
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-500 pt-1.5 border-t border-slate-200">
                {t.booking.policyNotice}
              </p>
            </div>

            {errorMsg && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                {t.booking.cancel}
              </button>
              <button
                type="submit"
                disabled={
                  !isPassengerApproved ||
                  submitting ||
                  selectedSeats.length === 0 ||
                  (isFullCarMode && (!isCompletelyEmpty || !hasValidFullCarPrice))
                }
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0770E3] rounded-lg hover:bg-[#0559B8] disabled:opacity-60 cursor-pointer transition-colors"
              >
                {submitting
                  ? t.auth.submitting
                  : isFullCarMode
                  ? t.tripCard.bookFullCar
                  : t.booking.confirmRequest}
              </button>
            </div>
          </form>
        </div>
      )}
    </AnimatedModalShell>
  );
};

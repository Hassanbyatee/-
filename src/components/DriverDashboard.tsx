import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Calendar,
  Car,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Navigation,
  Package,
  Pencil,
  Plus,
  PlusCircle,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { compressImageToDataUrl, uploadVerificationImage } from '../services/imageUtils';
import {
  acceptBookingTransaction,
  completeBookingTransaction,
  confirmCashPayment,
  deleteTrip,
  publishTrip,
  rejectBookingTransaction,
  toggleDriverAvailability,
  updateDriverDocumentsAndVehicle,
  updateTripDetails,
  updateTripLiveLocation,
  updateTripStatus,
} from '../services/platformService';
import { AnimatedModalShell } from './motion/KineticPrimitives';
import {
  getTripMaxSeatPrice,
  getTripMinSeatPrice,
  getTripSeatPrice,
  resolveTripSeatPrices,
  type Booking,
  type CabinSeatId,
  type Payment,
  type Review,
  type SeatPricesMap,
  type Trip,
  type Vehicle,
} from '../types/domain';

type DriverTab = 'overview' | 'requests' | 'trips' | 'publish' | 'docs' | 'earnings' | 'reviews';

const CABIN_SEAT_ORDER: CabinSeatId[] = ['front_passenger', 'rear_right', 'rear_middle', 'rear_left'];

export const DriverDashboard: React.FC = () => {
  const { getLocalizedName, formatIqd, t } = useI18n();
  const { firebaseUser, userProfile, driverProfile, governorates, garages, settings } = useAuth();

  const [tab, setTab] = useState<DriverTab>('trips');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverTrips, setDriverTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [addTripModalOpen, setAddTripModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [confirmDeleteTripId, setConfirmDeleteTripId] = useState<string | null>(null);

  // Publish / Edit Trip Form
  const [depGovId, setDepGovId] = useState('bgw');
  const [dstGovId, setDstGovId] = useState('ebl');
  const [depGarageId, setDepGarageId] = useState('');
  const [dstGarageId, setDstGarageId] = useState('');
  const [depDate, setDepDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [depTime, setDepTime] = useState('08:00');
  const [baseSeatPrice, setBaseSeatPrice] = useState(25000);
  const [seatPrices, setSeatPrices] = useState<SeatPricesMap>({
    front_passenger: 30000,
    rear_right: 25000,
    rear_middle: 20000,
    rear_left: 25000,
  });
  const [cargoEnabled, setCargoEnabled] = useState(false);
  const [cargoPriceIqd, setCargoPriceIqd] = useState(10000);
  const [origPriceIqd, setOrigPriceIqd] = useState(0);
  const [estDuration, setEstDuration] = useState(240);
  const [tripNotes, setTripNotes] = useState('');

  // Vehicle & Docs form
  const primaryVehicle = vehicles[0];
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [govId, setGovId] = useState('bgw');
  const [homeGarageId, setHomeGarageId] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [natIdNo, setNatIdNo] = useState('');
  const [idDocUrl, setIdDocUrl] = useState('');
  const [licDocUrl, setLicDocUrl] = useState('');
  const [bio, setBio] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState(2022);
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [hasAc, setHasAc] = useState(true);
  const [vehPhotoUrl, setVehPhotoUrl] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  React.useEffect(() => {
    if (driverProfile) {
      setFullName(driverProfile.fullName);
      setPhone(driverProfile.phone);
      setGovId(driverProfile.governorateId);
      setHomeGarageId(driverProfile.homeGarageId || '');
      setLicenseNo(driverProfile.licenseNumber);
      setNatIdNo(driverProfile.nationalIdNumber);
      setIdDocUrl(driverProfile.idDocumentUrl || '');
      setLicDocUrl(driverProfile.licenseDocumentUrl || '');
      setBio(driverProfile.bio || '');
    }
  }, [driverProfile]);

  React.useEffect(() => {
    if (primaryVehicle) {
      setMakeModel(primaryVehicle.makeModel);
      setYear(primaryVehicle.year);
      setPlate(primaryVehicle.plateNumber);
      setColor(primaryVehicle.color || '');
      setCapacity(primaryVehicle.passengerCapacity);
      setHasAc(primaryVehicle.hasAc !== false);
      setVehPhotoUrl(primaryVehicle.photoUrl || '');
    } else if (userProfile) {
      if (userProfile.vehicleModel && !makeModel) setMakeModel(userProfile.vehicleModel);
      if (userProfile.plateNumber && !plate) setPlate(userProfile.plateNumber);
    }
  }, [primaryVehicle, userProfile]);

  React.useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const unsubs = [
      onSnapshot(
        query(collection(db, 'vehicles'), where('driverId', '==', uid)),
        (snap) => setVehicles(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'vehicles')
      ),
      onSnapshot(
        query(collection(db, 'trips'), where('driverId', '==', uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }));
          list.sort((a, b) =>
            `${b.departureDate} ${b.departureTime}`.localeCompare(`${a.departureDate} ${a.departureTime}`)
          );
          setDriverTrips(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'trips')
      ),
      onSnapshot(
        query(collection(db, 'bookings'), where('driverId', '==', uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }));
          list.sort(
            (a, b) =>
              ((b.createdAt as { seconds?: number })?.seconds || 0) -
              ((a.createdAt as { seconds?: number })?.seconds || 0)
          );
          setBookings(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')
      ),
      onSnapshot(
        query(collection(db, 'payments'), where('driverId', '==', uid)),
        (snap) => setPayments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'payments')
      ),
      onSnapshot(
        query(collection(db, 'reviews'), where('driverId', '==', uid)),
        (snap) => setReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'reviews')
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [firebaseUser]);

  const paymentMap = useMemo(() => {
    const m = new Map<string, Payment>();
    payments.forEach((p) => m.set(p.bookingId, p));
    return m;
  }, [payments]);

  const totals = useMemo(() => {
    return payments.reduce(
      (acc, p) => {
        if (p.status === 'paid') {
          acc.gross += p.amountIqd;
          acc.commission += p.commissionIqd;
          acc.net += p.netDriverIqd;
        }
        return acc;
      },
      { gross: 0, commission: 0, net: 0 }
    );
  }, [payments]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (!firebaseUser || !driverProfile) return null;

  const isApproved =
    driverProfile.verificationStatus === 'approved' &&
    (!userProfile ||
      (userProfile.verificationStatus === 'approved' && userProfile.accountStatus === 'active'));
  const depGarages = garages.filter((g) => g.governorateId === depGovId);
  const dstGarages = garages.filter((g) => g.governorateId === dstGovId);
  const effectiveVehicleLabel = primaryVehicle
    ? `${primaryVehicle.makeModel} (${primaryVehicle.year})`
    : userProfile?.vehicleModel || makeModel || 'تكسي خاص';
  const effectivePlateLabel = primaryVehicle?.plateNumber || userProfile?.plateNumber || plate || '';

  const seatLabelMap: Record<CabinSeatId, string> = {
    front_passenger: t.booking.seatFrontPassenger,
    rear_right: t.booking.seatRearRight,
    rear_middle: t.booking.seatRearMiddle,
    rear_left: t.booking.seatRearLeft,
  };

  const resetTripForm = () => {
    setEditingTripId(null);
    setDepGovId('bgw');
    setDstGovId('ebl');
    setDepGarageId('');
    setDstGarageId('');
    setDepDate(new Date().toISOString().split('T')[0]);
    setDepTime('08:00');
    setBaseSeatPrice(25000);
    setSeatPrices({
      front_passenger: 30000,
      rear_right: 25000,
      rear_middle: 20000,
      rear_left: 25000,
    });
    setCargoEnabled(false);
    setCargoPriceIqd(10000);
    setOrigPriceIqd(0);
    setEstDuration(240);
    setTripNotes('');
  };

  const openNewTripModal = () => {
    if (!isApproved) {
      notify('err', t.errors.unapprovedDriver);
      return;
    }
    resetTripForm();
    setAddTripModalOpen(true);
  };

  const openEditTripModal = (tr: Trip) => {
    const resolved = resolveTripSeatPrices(tr);
    setEditingTripId(tr.id);
    setDepGovId(tr.departureGovId);
    setDstGovId(tr.destinationGovId);
    setDepGarageId(tr.departureGarageId || '');
    setDstGarageId(tr.destinationGarageId || '');
    setDepDate(tr.departureDate);
    setDepTime(tr.departureTime);
    setBaseSeatPrice(tr.pricePerSeatIqd || 25000);
    setSeatPrices(resolved);
    setCargoEnabled(Boolean(tr.cargoEnabled));
    setCargoPriceIqd(tr.cargoPriceIqd && tr.cargoPriceIqd > 0 ? tr.cargoPriceIqd : 10000);
    setOrigPriceIqd(tr.originalPriceIqd || 0);
    setEstDuration(tr.estimatedDurationMin || 240);
    setTripNotes(tr.notes || '');
    setAddTripModalOpen(true);
  };

  const applyBasePriceToAllSeats = () => {
    const clean = Math.max(1000, Number(baseSeatPrice) || 25000);
    setSeatPrices({
      front_passenger: clean,
      rear_right: clean,
      rear_middle: clean,
      rear_left: clean,
    });
  };

  const handlePublishTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      notify('err', t.errors.unapprovedDriver);
      return;
    }
    if (depGovId === dstGovId) {
      notify('err', t.errors.sameGovernorate);
      return;
    }
    const minSeatPrice = Math.min(
      seatPrices.front_passenger,
      seatPrices.rear_right,
      seatPrices.rear_middle,
      seatPrices.rear_left
    );
    setBusy(true);
    try {
      if (editingTripId) {
        await updateTripDetails(editingTripId, {
          departureGovId: depGovId,
          destinationGovId: dstGovId,
          departureGarageId: depGarageId || depGarages[0]?.id || 'gar_bgw_nahda',
          destinationGarageId: dstGarageId || dstGarages[0]?.id || 'gar_ebl_baghdad',
          departureDate: depDate,
          departureTime: depTime,
          estimatedDurationMin: estDuration,
          pricePerSeatIqd: minSeatPrice,
          seatPrices,
          cargoEnabled,
          cargoPriceIqd: cargoEnabled ? cargoPriceIqd : 0,
          notes: tripNotes,
        });
        resetTripForm();
        setAddTripModalOpen(false);
        notify('ok', t.driver.tripUpdatedSuccess);
        setTab('trips');
      } else {
        await publishTrip({
          driver: driverProfile,
          vehicle: primaryVehicle,
          vehicleModel: effectiveVehicleLabel,
          vehiclePlate: effectivePlateLabel,
          vehiclePhotoUrl: primaryVehicle?.photoUrl || vehPhotoUrl || '',
          departureGovId: depGovId,
          destinationGovId: dstGovId,
          departureGarageId: depGarageId || depGarages[0]?.id || 'gar_bgw_nahda',
          destinationGarageId: dstGarageId || dstGarages[0]?.id || 'gar_ebl_baghdad',
          departureDate: depDate,
          departureTime: depTime,
          estimatedDurationMin: estDuration,
          pricePerSeatIqd: minSeatPrice,
          seatPrices,
          cargoEnabled,
          cargoPriceIqd: cargoEnabled ? cargoPriceIqd : 0,
          originalPriceIqd: origPriceIqd > minSeatPrice ? origPriceIqd : undefined,
          totalSeats: 4,
          notes: tripNotes,
        });
        resetTripForm();
        setAddTripModalOpen(false);
        notify('ok', t.driver.savedSuccess);
        setTab('trips');
      }
    } catch {
      notify('err', t.errors.generic);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    setBusy(true);
    try {
      await deleteTrip(tripId, firebaseUser.uid, false, settings);
      setConfirmDeleteTripId(null);
      notify('ok', t.driver.savedSuccess);
    } catch (err) {
      notify(
        'err',
        err instanceof Error && err.message === 'CANNOT_DELETE_TRIP_WITH_BOOKINGS'
          ? t.errors.cannotDeleteTripWithBookings
          : t.errors.generic
      );
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLiveLocation = (trip: Trip) => {
    if (trip.liveTrackingEnabled) {
      updateTripLiveLocation(trip.id, false);
      return;
    }
    if (!navigator.geolocation) {
      notify('err', t.errors.locationDenied);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateTripLiveLocation(trip.id, true, pos.coords.latitude, pos.coords.longitude);
        notify('ok', t.driver.savedSuccess);
      },
      () => notify('err', t.errors.locationDenied)
    );
  };

  const renderTripPublishForm = (isModal: boolean) => (
    <form
      onSubmit={handlePublishTrip}
      className={isModal ? 'space-y-4' : 'surface-card rounded-2xl p-6 max-w-2xl space-y-4'}
    >
      {!isModal && <h2 className="text-lg font-bold text-[#05203C]">{t.driver.publishTripTitle}</h2>}

      {/* Auto-attached Driver & Vehicle + 4-Seat Cabin Info */}
      <div className="bg-[#F7F9FB] border border-[#E0E4E8] rounded-xl p-3.5 space-y-2">
        <div className="text-xs font-bold text-[#05203C] flex items-center justify-between gap-2">
          <span>{t.driver.autoAttachedInfoTitle}</span>
          {isApproved && (
            <span className="inline-flex items-center gap-1 text-[#0770E3]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.tripCard.verifiedDriver}</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
          <span className="font-semibold">{driverProfile.fullName}</span>
          <span>·</span>
          <span>{effectiveVehicleLabel}</span>
          {effectivePlateLabel && (
            <>
              <span>·</span>
              <span className="font-mono font-semibold">{effectivePlateLabel}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#0559B8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-2.5 py-1.5">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>{t.driver.fourCabinSeatsReady}</span>
        </div>
      </div>

      {!isApproved && (
        <div
          className={`border rounded-xl p-3.5 flex items-start gap-2.5 text-xs ${
            driverProfile.verificationStatus === 'rejected'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold">
              {driverProfile.verificationStatus === 'rejected'
                ? t.driver.verificationRejectedTitle
                : t.driver.verificationPendingTitle}
            </div>
            <p>{driverProfile.rejectionReason || t.driver.verificationPendingDesc}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.departureGov}
          </label>
          <select
            value={depGovId}
            onChange={(e) => {
              setDepGovId(e.target.value);
              setDepGarageId('');
            }}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
          >
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {getLocalizedName(g)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.destinationGov}
          </label>
          <select
            value={dstGovId}
            onChange={(e) => {
              setDstGovId(e.target.value);
              setDstGarageId('');
            }}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
          >
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {getLocalizedName(g)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.departureGarage}
          </label>
          <select
            value={depGarageId || depGarages[0]?.id || ''}
            onChange={(e) => setDepGarageId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
          >
            {(depGarages.length ? depGarages : garages).map((gr) => (
              <option key={gr.id} value={gr.id}>
                {getLocalizedName(gr)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.destinationGarage}
          </label>
          <select
            value={dstGarageId || dstGarages[0]?.id || ''}
            onChange={(e) => setDstGarageId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
          >
            {(dstGarages.length ? dstGarages : garages).map((gr) => (
              <option key={gr.id} value={gr.id}>
                {getLocalizedName(gr)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.departureDateTimeLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              required
              aria-label={t.driver.departureDate}
              value={depDate}
              onChange={(e) => setDepDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="time"
              required
              aria-label={t.driver.departureTime}
              value={depTime}
              onChange={(e) => setDepTime(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.baseSeatPrice}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1000}
              max={500000}
              step={500}
              value={baseSeatPrice}
              onChange={(e) => setBaseSeatPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono tabular-nums"
            />
            <button
              type="button"
              onClick={applyBasePriceToAllSeats}
              className="btn-tactile px-3 py-2.5 text-xs font-semibold border border-[#BFDBFE] bg-[#EFF6FF] text-[#0559B8] rounded-xl hover:bg-[#DBEAFE] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.driver.applyToAllSeats}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {t.driver.estimatedDuration}
          </label>
          <input
            type="number"
            min={15}
            max={1440}
            required
            value={estDuration}
            onChange={(e) => setEstDuration(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono tabular-nums"
          />
        </div>
      </div>

      {/* Per-Seat Pricing Set by the Captain (4 Cabin Seats) */}
      <div className="bg-[#F7F9FB] border border-[#E0E4E8] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#05203C]">{t.driver.perSeatPricingTitle}</span>
          <span className="text-[11px] font-mono font-semibold text-[#0770E3] tabular-nums">
            {formatIqd(
              Math.min(
                seatPrices.front_passenger,
                seatPrices.rear_right,
                seatPrices.rear_middle,
                seatPrices.rear_left
              )
            )}{' '}
            –{' '}
            {formatIqd(
              Math.max(
                seatPrices.front_passenger,
                seatPrices.rear_right,
                seatPrices.rear_middle,
                seatPrices.rear_left
              )
            )}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CABIN_SEAT_ORDER.map((seatId) => (
            <div key={seatId} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="block text-xs font-semibold text-[#05203C]">
                {seatLabelMap[seatId]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1000}
                  max={500000}
                  step={500}
                  required
                  value={seatPrices[seatId]}
                  onChange={(e) =>
                    setSeatPrices((prev) => ({
                      ...prev,
                      [seatId]: Math.max(1000, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono font-semibold tabular-nums focus:outline-none focus:border-[#0770E3]"
                />
                <span className="text-xs font-mono text-slate-500 shrink-0">{t.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cargo / Parcel Transport Option */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#0770E3] shrink-0" />
            <span className="text-xs font-bold text-[#05203C]">{t.driver.cargoShippingTitle}</span>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#05203C] cursor-pointer">
            <input
              type="checkbox"
              checked={cargoEnabled}
              onChange={(e) => setCargoEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0770E3] focus:ring-[#0770E3]"
            />
            <span>{t.driver.enableCargoTransport}</span>
          </label>
        </div>

        {cargoEnabled && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.driver.cargoPriceLabel}
            </label>
            <input
              type="number"
              min={1000}
              max={500000}
              step={500}
              required
              value={cargoPriceIqd}
              onChange={(e) => setCargoPriceIqd(Math.max(1000, Number(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono tabular-nums"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {t.driver.pickupNotesLabel}
        </label>
        <textarea
          rows={2}
          maxLength={400}
          placeholder={t.driver.pickupNotesPlaceholder}
          value={tripNotes}
          onChange={(e) => setTripNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {isModal && (
          <button
            type="button"
            onClick={() => {
              setAddTripModalOpen(false);
              resetTripForm();
            }}
            className="btn-tactile px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            {t.booking.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={!isApproved || busy}
          className="btn-tactile px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{editingTripId ? t.driver.saveTripChangesBtn : t.driver.publishTripBtn}</span>
        </button>
      </div>
    </form>
  );

  const tabs: Array<{ id: DriverTab; label: string; icon: React.ReactNode }> = [
    { id: 'trips', label: `${t.driver.tabMyTrips} (${driverTrips.length})`, icon: <Calendar className="w-4 h-4" /> },
    {
      id: 'requests',
      label: `${t.driver.tabRequests} (${bookings.filter((b) => b.status === 'pending').length})`,
      icon: <ClipboardList className="w-4 h-4" />,
    },
    { id: 'publish', label: t.driver.addNewTripBtn, icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'docs', label: t.driver.tabVehicleDocs, icon: <Car className="w-4 h-4" /> },
    { id: 'earnings', label: t.driver.tabEarnings, icon: <Banknote className="w-4 h-4" /> },
    { id: 'reviews', label: t.driver.tabReviews, icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#05203C]">{t.driver.title}</h1>
          <div className="text-sm text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
            <span>{driverProfile.fullName}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              {(driverProfile.ratingCount > 0 ? driverProfile.ratingAvg : 0).toFixed(1)} ★
            </span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              {driverProfile.completedTripsCount} {t.tripCard.completedTrips}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openNewTripModal}
            className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.driver.addNewTripBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleDriverAvailability(driverProfile.uid, !driverProfile.isAvailable)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
              driverProfile.isAvailable
                ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0559B8]'
                : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {driverProfile.isAvailable ? t.driver.availableNow : t.driver.offlineNow}
          </button>
        </div>
      </div>

      {/* Verification Gate Banner */}
      {!isApproved ? (
        <div
          className={`border rounded-2xl p-4 flex items-start gap-3 ${
            driverProfile.verificationStatus === 'rejected'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <AlertCircle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              driverProfile.verificationStatus === 'rejected' ? 'text-rose-700' : 'text-amber-700'
            }`}
          />
          <div>
            <div
              className={`text-sm font-bold ${
                driverProfile.verificationStatus === 'rejected' ? 'text-rose-900' : 'text-amber-900'
              }`}
            >
              {driverProfile.verificationStatus === 'rejected'
                ? t.driver.verificationRejectedTitle
                : t.driver.verificationPendingTitle}
            </div>
            <p
              className={`text-xs sm:text-sm mt-0.5 ${
                driverProfile.verificationStatus === 'rejected' ? 'text-rose-800' : 'text-amber-800'
              }`}
            >
              {driverProfile.rejectionReason || t.driver.verificationPendingDesc}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-sm font-semibold text-[#05203C]">
          <div className="flex items-center gap-2 text-[#0559B8]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t.driver.verificationApprovedBadge}</span>
          </div>
          <span className="text-xs text-slate-600 hidden sm:inline">{effectiveVehicleLabel}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
              tab === item.id ? 'bg-[#0770E3] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border ${
            feedback.type === 'ok'
              ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0559B8]'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* TAB: BOOKING REQUESTS */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center text-sm text-slate-600">
              {t.driver.noRequests}
            </div>
          ) : (
            bookings.map((bk) => {
              const dep = getLocalizedName(governorates.find((g) => g.id === bk.departureGovId));
              const dst = getLocalizedName(governorates.find((g) => g.id === bk.destinationGovId));
              const pay = paymentMap.get(bk.id);
              return (
                <div key={bk.id} className="surface-card rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-mono tabular-nums">
                          {bk.departureDate} · {bk.departureTime}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-slate-800">{t.statuses[bk.status]}</span>
                        {pay && (
                          <>
                            <span>·</span>
                            <span>{t.statuses[pay.status]}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {bk.passengerName} — {dep} → {dst}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {bk.seatsCount} {t.hero.seatsLabel}
                        {bk.selectedSeats && bk.selectedSeats.length > 0
                          ? ` (${bk.selectedSeats.map((s) => seatLabelMap[s]).join('، ')})`
                          : ''}{' '}
                        · {bk.passengerPhone || ''}
                        {bk.passengerNotes ? ` · ${bk.passengerNotes}` : ''}
                      </p>
                      {bk.includeCargo && (
                        <div className="mt-2 inline-flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-xs">
                          <Package className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="font-bold text-emerald-900">
                            {t.booking.cargoBadge} (+{formatIqd(bk.cargoFeeIqd || 0)})
                          </span>
                          {bk.cargoNotes && <span className="text-emerald-800">{bk.cargoNotes}</span>}
                        </div>
                      )}
                      {bk.useCustomDropOff &&
                        typeof bk.customDropOffLat === 'number' &&
                        typeof bk.customDropOffLng === 'number' && (
                          <div className="mt-2 inline-flex flex-wrap items-center gap-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3 py-1.5 text-xs">
                            <span className="font-bold text-[#05203C]">
                              {t.booking.customDropOffBadge} (+{formatIqd(bk.customDropOffFeeIqd || 10000)})
                            </span>
                            {bk.customDropOffAddress && (
                              <span className="text-slate-700">{bk.customDropOffAddress}</span>
                            )}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${bk.customDropOffLat},${bk.customDropOffLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-[#0770E3] underline"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{t.booking.openDriverNavLink}</span>
                            </a>
                          </div>
                        )}
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                      {bk.isFreeTrip
                        ? `${bk.pointsRedeemed.toLocaleString()} ${t.pointsUnit}`
                        : formatIqd(bk.totalPriceIqd)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                    {bk.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await acceptBookingTransaction(bk.id, driverProfile.phone, settings);
                              notify('ok', t.driver.savedSuccess);
                            } catch (err) {
                              notify(
                                'err',
                                err instanceof Error && err.message === 'INSUFFICIENT_SEATS'
                                  ? t.errors.insufficientSeats
                                  : t.errors.generic
                              );
                            }
                          }}
                          className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                        >
                          {t.driver.acceptBooking}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await rejectBookingTransaction(bk.id, '');
                            notify('ok', t.driver.savedSuccess);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                        >
                          {t.driver.rejectBooking}
                        </button>
                      </>
                    )}

                    {bk.status === 'accepted' && (
                      <>
                        {pay && pay.status === 'unpaid' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await confirmCashPayment(pay.id, firebaseUser.uid);
                              notify('ok', t.driver.savedSuccess);
                            }}
                            className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-900 rounded-xl hover:bg-slate-50 cursor-pointer"
                          >
                            {t.driver.confirmCashPaid}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={async () => {
                            await completeBookingTransaction(bk.id, firebaseUser.uid, settings);
                            notify('ok', t.driver.savedSuccess);
                          }}
                          className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                        >
                          {t.driver.markCompleted}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: MY TRIPS */}
      {tab === 'trips' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#05203C]">{t.driver.tabMyTrips}</h2>
            <button
              type="button"
              onClick={openNewTripModal}
              className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.driver.addNewTripBtn}</span>
            </button>
          </div>

          {driverTrips.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">{t.driver.noTrips}</p>
              <button
                type="button"
                onClick={openNewTripModal}
                className="btn-tactile inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.driver.addNewTripBtn}</span>
              </button>
            </div>
          ) : (
            driverTrips.map((tr) => {
              const dep = getLocalizedName(governorates.find((g) => g.id === tr.departureGovId));
              const dst = getLocalizedName(governorates.find((g) => g.id === tr.destinationGovId));
              const tripBookings = bookings.filter((b) => b.tripId === tr.id);
              const bookedSet = new Set(tr.bookedSeats || []);
              const isConfirmingDelete = confirmDeleteTripId === tr.id;
              const minPrice = getTripMinSeatPrice(tr);
              const maxPrice = getTripMaxSeatPrice(tr);

              return (
                <div key={tr.id} className="surface-card surface-card-interactive rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="font-mono tabular-nums">
                          {tr.departureDate} · {tr.departureTime}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-[#05203C]">{t.statuses[tr.status]}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#05203C] mt-0.5">
                        {dep} → {dst}
                      </h3>
                      <div className="text-xs text-slate-600 mt-0.5 tabular-nums flex flex-wrap items-center gap-2">
                        <span>
                          {tr.availableSeats}/{tr.totalSeats} {t.tripCard.seatsAvailable}
                        </span>
                        <span>·</span>
                        <span className="font-mono font-bold text-[#0770E3]">
                          {minPrice === maxPrice
                            ? formatIqd(minPrice)
                            : `${formatIqd(minPrice)} – ${formatIqd(maxPrice)}`}
                        </span>
                        {tr.cargoEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                            <Package className="w-3 h-3" />
                            <span>
                              {t.booking.cargoBadge}: {formatIqd(tr.cargoPriceIqd || 0)}
                            </span>
                          </span>
                        )}
                        {tr.notes && (
                          <>
                            <span>·</span>
                            <span>{tr.notes}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tr.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => updateTripStatus(tr.id, 'in_progress')}
                          className="px-3.5 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl cursor-pointer"
                        >
                          {t.driver.startTrip}
                        </button>
                      )}
                      {['scheduled', 'in_progress'].includes(tr.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleLiveLocation(tr)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border cursor-pointer ${
                              tr.liveTrackingEnabled
                                ? 'bg-amber-50 border-amber-300 text-amber-900'
                                : 'border-slate-200 text-slate-700'
                            }`}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>
                              {tr.liveTrackingEnabled ? t.driver.stopLiveLocation : t.driver.shareLiveLocation}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTripStatus(tr.id, 'completed')}
                            className="px-3.5 py-2 text-xs font-semibold border border-slate-300 rounded-xl cursor-pointer"
                          >
                            {t.driver.completeTrip}
                          </button>
                        </>
                      )}
                      {tr.status === 'scheduled' && tr.confirmedSeatsCount === 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditTripModal(tr)}
                            className="btn-tactile inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-[#05203C] border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>{t.driver.editTripBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTripStatus(tr.id, 'cancelled')}
                            className="px-3.5 py-2 text-xs font-medium text-amber-800 border border-amber-200 rounded-xl cursor-pointer"
                          >
                            {t.driver.cancelTrip}
                          </button>
                        </>
                      )}
                      {tr.confirmedSeatsCount === 0 && (
                        isConfirmingDelete ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDeleteTrip(tr.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t.driver.confirmDeleteTrip}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTripId(null)}
                              className="px-2.5 py-2 text-xs font-medium border border-slate-200 rounded-xl cursor-pointer"
                            >
                              {t.booking.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTripId(tr.id)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.driver.deleteTrip}</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* 4-Seat Cabin Overview */}
                  <div className="bg-[#F7F9FB] border border-[#E0E4E8] rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-bold text-[#05203C]">{t.driver.cabinSeatsOverview}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CABIN_SEAT_ORDER.map((seatId) => {
                        const isBooked = bookedSet.has(seatId);
                        const seatPrice = getTripSeatPrice(tr, seatId);
                        return (
                          <div
                            key={seatId}
                            className={`px-2.5 py-2 rounded-lg border text-xs flex flex-col gap-0.5 ${
                              isBooked
                                ? 'bg-slate-200/80 border-slate-300 text-slate-700'
                                : 'bg-white border-[#BFDBFE] text-[#0559B8]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium truncate">{seatLabelMap[seatId]}</span>
                              <span className="text-[10px] font-bold shrink-0">
                                {isBooked ? t.booking.seatBooked : t.booking.seatAvailable}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono font-bold tabular-nums text-[#05203C]">
                              {formatIqd(seatPrice)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incoming Bookings & Custom GPS Drop-offs on this trip */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="text-xs font-bold text-[#05203C]">
                      {t.driver.tripBookingsTitle} ({tripBookings.length})
                    </div>
                    {tripBookings.length === 0 ? (
                      <p className="text-xs text-slate-500">{t.driver.noTripBookings}</p>
                    ) : (
                      <div className="space-y-2">
                        {tripBookings.map((bk) => (
                          <div
                            key={bk.id}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="font-bold text-[#05203C] flex flex-wrap items-center gap-2">
                                <span>{bk.passengerName}</span>
                                <span className="text-[11px] font-semibold text-[#0770E3]">
                                  {t.statuses[bk.status]}
                                </span>
                                {bk.passengerPhone && (
                                  <span className="font-mono text-slate-600" dir="ltr">
                                    {bk.passengerPhone}
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-600">
                                {bk.seatsCount} {t.hero.seatsLabel}
                                {bk.selectedSeats && bk.selectedSeats.length > 0
                                  ? ` (${bk.selectedSeats.map((s) => seatLabelMap[s]).join('، ')})`
                                  : ''}
                                {bk.passengerNotes ? ` · ${bk.passengerNotes}` : ''}
                              </div>
                              {bk.includeCargo && (
                                <div className="inline-flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-[11px]">
                                  <Package className="w-3.5 h-3.5 text-emerald-700" />
                                  <span className="font-bold text-emerald-900">
                                    {t.booking.cargoBadge} (+{formatIqd(bk.cargoFeeIqd || 0)})
                                  </span>
                                  {bk.cargoNotes && (
                                    <span className="text-emerald-800">{bk.cargoNotes}</span>
                                  )}
                                </div>
                              )}
                              {bk.useCustomDropOff &&
                                typeof bk.customDropOffLat === 'number' &&
                                typeof bk.customDropOffLng === 'number' && (
                                  <div className="inline-flex flex-wrap items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-2.5 py-1 text-[11px]">
                                    <MapPin className="w-3.5 h-3.5 text-[#0770E3]" />
                                    <span className="font-bold text-[#05203C]">
                                      {t.booking.customDropOffBadge} (+{formatIqd(bk.customDropOffFeeIqd || 10000)})
                                    </span>
                                    {bk.customDropOffAddress && (
                                      <span className="text-slate-700">{bk.customDropOffAddress}</span>
                                    )}
                                    <a
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${bk.customDropOffLat},${bk.customDropOffLng}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-bold text-[#0770E3] underline"
                                    >
                                      <Navigation className="w-3 h-3" />
                                      <span>{t.booking.openDriverNavLink}</span>
                                    </a>
                                  </div>
                                )}
                            </div>
                            <div className="font-mono font-bold text-[#05203C] tabular-nums shrink-0">
                              {bk.isFreeTrip
                                ? `${bk.pointsRedeemed.toLocaleString()} ${t.pointsUnit}`
                                : formatIqd(bk.totalPriceIqd)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {tr.confirmedSeatsCount > 0 && (
                    <p className="text-xs text-slate-500">{t.driver.editTripLockedNotice}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: PUBLISH TRIP */}
      {tab === 'publish' && renderTripPublishForm(false)}

      {/* ADD / EDIT TRIP MODAL */}
      <AnimatedModalShell
        isOpen={addTripModalOpen}
        onClose={() => {
          setAddTripModalOpen(false);
          resetTripForm();
        }}
        maxWidthClass="max-w-2xl"
      >
        <div className="bg-white border border-[#E0E4E8] rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)] max-h-[92vh] flex flex-col">
          <div className="bg-[#05203C] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-5 h-5 text-[#60A5FA]" />
              <h2 className="text-base sm:text-lg font-bold">
                {editingTripId ? t.driver.editTripBtn : t.driver.addNewTripBtn}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddTripModalOpen(false);
                resetTripForm();
              }}
              aria-label={t.common.close}
              className="p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto">{renderTripPublishForm(true)}</div>
        </div>
      </AnimatedModalShell>

      {/* TAB: DOCUMENTS & VEHICLE */}
      {tab === 'docs' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await updateDriverDocumentsAndVehicle(
                firebaseUser.uid,
                {
                  fullName,
                  phone,
                  governorateId: govId,
                  homeGarageId,
                  licenseNumber: licenseNo,
                  nationalIdNumber: natIdNo,
                  idDocumentUrl: idDocUrl,
                  licenseDocumentUrl: licDocUrl,
                  bio,
                },
                {
                  vehicleId: primaryVehicle?.id,
                  makeModel,
                  year,
                  plateNumber: plate,
                  color,
                  passengerCapacity: capacity,
                  hasAc,
                  photoUrl: vehPhotoUrl,
                }
              );
              notify('ok', t.driver.savedSuccess);
            } catch {
              notify('err', t.errors.generic);
            } finally {
              setBusy(false);
            }
          }}
          className="surface-card rounded-2xl p-6 max-w-2xl space-y-4"
        >
          <h2 className="text-lg font-bold text-slate-900">{t.driver.tabVehicleDocs}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder={t.auth.fullName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
            <input
              type="tel"
              required
              placeholder={t.auth.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="text"
              required
              placeholder={t.auth.nationalIdNumber}
              value={natIdNo}
              onChange={(e) => setNatIdNo(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="text"
              required
              placeholder={t.auth.licenseNumber}
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="text"
              required
              placeholder={t.auth.vehicleModel}
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
            <input
              type="text"
              required
              placeholder={t.auth.plateNumber}
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="number"
              required
              min={1995}
              max={2030}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="number"
              required
              min={1}
              max={15}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center justify-between gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-50">
              <span>{idDocUrl ? t.auth.fileAttached : t.auth.idDocumentPhoto}</span>
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setBusy(true);
                    const url = await uploadVerificationImage(
                      file,
                      `verification/${firebaseUser.uid}/id_update_${Date.now()}`
                    );
                    setIdDocUrl(url);
                  } catch {
                    notify('err', t.errors.generic);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-50">
              <span>{licDocUrl ? t.auth.fileAttached : t.auth.licenseDocumentPhoto}</span>
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setBusy(true);
                    const url = await uploadVerificationImage(
                      file,
                      `verification/${firebaseUser.uid}/license_update_${Date.now()}`
                    );
                    setLicDocUrl(url);
                  } catch {
                    notify('err', t.errors.generic);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-50">
              <span>{vehPhotoUrl ? t.auth.fileAttached : t.auth.vehiclePhoto}</span>
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) =>
                  e.target.files?.[0] && setVehPhotoUrl(await compressImageToDataUrl(e.target.files[0]))
                }
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
          >
            {t.driver.saveVehicleDocs}
          </button>
        </form>
      )}

      {/* TAB: EARNINGS */}
      {tab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.driver.totalEarningsGross}</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {formatIqd(totals.gross)}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">
                {t.driver.platformCommission} ({settings.commissionRatePercent}%)
              </div>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {formatIqd(totals.commission)}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.driver.netEarnings}</div>
              <div className="text-xl font-bold font-mono text-[#0770E3] mt-1 tabular-nums">
                {formatIqd(totals.net)}
              </div>
            </div>
          </div>

          <div className="surface-card rounded-2xl overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-start">{t.tables.booking}</th>
                  <th className="px-4 py-3 text-start">{t.tables.method}</th>
                  <th className="px-4 py-3 text-end">{t.tables.amount}</th>
                  <th className="px-4 py-3 text-end">{t.tables.net}</th>
                  <th className="px-4 py-3 text-start">{t.tables.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs">{p.bookingId.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      {p.method === 'cash' ? t.common.cashMethod : t.common.freePointsMethod}
                    </td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">
                      {formatIqd(p.amountIqd)}
                    </td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">
                      {formatIqd(p.netDriverIqd)}
                    </td>
                    <td className="px-4 py-3">{t.statuses[p.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: REVIEWS */}
      {tab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="surface-card rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{rev.passengerName}</span>
                <span className="font-mono text-xs font-bold text-amber-600 tabular-nums">
                  {rev.driverRating}/5 ★
                </span>
              </div>
              <p className="text-sm text-slate-700">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

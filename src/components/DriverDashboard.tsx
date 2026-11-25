import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Banknote,
  Calendar,
  Car,
  CheckCircle2,
  ClipboardList,
  Navigation,
  PlusCircle,
  Star,
  Upload,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { compressImageToDataUrl } from '../services/imageUtils';
import {
  acceptBookingTransaction,
  completeBookingTransaction,
  confirmCashPayment,
  publishTrip,
  rejectBookingTransaction,
  toggleDriverAvailability,
  updateDriverDocumentsAndVehicle,
  updateTripLiveLocation,
  updateTripStatus,
} from '../services/platformService';
import type { Booking, CabinSeatId, Payment, Review, Trip, Vehicle } from '../types/domain';

type DriverTab = 'overview' | 'requests' | 'trips' | 'publish' | 'docs' | 'earnings' | 'reviews';

export const DriverDashboard: React.FC = () => {
  const { getLocalizedName, formatIqd, t } = useI18n();
  const { firebaseUser, driverProfile, governorates, garages, settings } = useAuth();

  const [tab, setTab] = useState<DriverTab>('requests');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [driverTrips, setDriverTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Publish Trip Form
  const [depGovId, setDepGovId] = useState('bgw');
  const [dstGovId, setDstGovId] = useState('ebl');
  const [depGarageId, setDepGarageId] = useState('');
  const [dstGarageId, setDstGarageId] = useState('');
  const [depDate, setDepDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [depTime, setDepTime] = useState('08:00');
  const [priceIqd, setPriceIqd] = useState(25000);
  const [origPriceIqd, setOrigPriceIqd] = useState(0);
  const [seatsToOffer, setSeatsToOffer] = useState(4);
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
      setSeatsToOffer(primaryVehicle.passengerCapacity);
      setHasAc(primaryVehicle.hasAc !== false);
      setVehPhotoUrl(primaryVehicle.photoUrl || '');
    }
  }, [primaryVehicle]);

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

  const isApproved = driverProfile.verificationStatus === 'approved';
  const depGarages = garages.filter((g) => g.governorateId === depGovId);
  const dstGarages = garages.filter((g) => g.governorateId === dstGovId);
  const seatLabelMap: Record<CabinSeatId, string> = {
    front_passenger: t.booking.seatFrontPassenger,
    rear_right: t.booking.seatRearRight,
    rear_middle: t.booking.seatRearMiddle,
    rear_left: t.booking.seatRearLeft,
  };

  const handlePublishTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) {
      notify('err', t.errors.unapprovedDriver);
      return;
    }
    if (!primaryVehicle) {
      notify('err', t.driver.saveVehicleDocs);
      setTab('docs');
      return;
    }
    if (depGovId === dstGovId) {
      notify('err', t.errors.sameGovernorate);
      return;
    }
    setBusy(true);
    try {
      await publishTrip({
        driver: driverProfile,
        vehicle: primaryVehicle,
        departureGovId: depGovId,
        destinationGovId: dstGovId,
        departureGarageId: depGarageId || depGarages[0]?.id || 'gar_bgw_nahda',
        destinationGarageId: dstGarageId || dstGarages[0]?.id || 'gar_ebl_baghdad',
        departureDate: depDate,
        departureTime: depTime,
        estimatedDurationMin: estDuration,
        pricePerSeatIqd: priceIqd,
        originalPriceIqd: origPriceIqd > priceIqd ? origPriceIqd : undefined,
        totalSeats: seatsToOffer,
        notes: tripNotes,
      });
      setTripNotes('');
      setOrigPriceIqd(0);
      notify('ok', t.driver.savedSuccess);
      setTab('trips');
    } catch {
      notify('err', t.errors.generic);
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

  const tabs: Array<{ id: DriverTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'requests',
      label: `${t.driver.tabRequests} (${bookings.filter((b) => b.status === 'pending').length})`,
      icon: <ClipboardList className="w-4 h-4" />,
    },
    { id: 'trips', label: t.driver.tabMyTrips, icon: <Calendar className="w-4 h-4" /> },
    { id: 'publish', label: t.driver.tabPublish, icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'docs', label: t.driver.tabVehicleDocs, icon: <Car className="w-4 h-4" /> },
    { id: 'earnings', label: t.driver.tabEarnings, icon: <Banknote className="w-4 h-4" /> },
    { id: 'reviews', label: t.driver.tabReviews, icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.driver.title}</h1>
          <div className="text-sm text-slate-600 mt-0.5 flex items-center gap-2">
            <span>{driverProfile.fullName}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{(driverProfile.ratingAvg || 5).toFixed(1)} ★</span>
            <span>·</span>
            <span className="font-mono tabular-nums">
              {driverProfile.completedTripsCount} {t.tripCard.completedTrips}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleDriverAvailability(driverProfile.uid, !driverProfile.isAvailable)}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-colors cursor-pointer ${
            driverProfile.isAvailable
              ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#0559B8]'
              : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}
        >
          {driverProfile.isAvailable ? t.driver.availableNow : t.driver.offlineNow}
        </button>
      </div>

      {/* Verification Gate Banner */}
      {!isApproved ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-amber-900">
              {driverProfile.verificationStatus === 'rejected'
                ? t.driver.verificationRejectedTitle
                : t.driver.verificationPendingTitle}
            </div>
            <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
              {driverProfile.rejectionReason || t.driver.verificationPendingDesc}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#ECFDF5] border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#0559B8]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t.driver.verificationApprovedBadge}</span>
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
          {driverTrips.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center text-sm text-slate-600">
              {t.driver.noTrips}
            </div>
          ) : (
            driverTrips.map((tr) => {
              const dep = getLocalizedName(governorates.find((g) => g.id === tr.departureGovId));
              const dst = getLocalizedName(governorates.find((g) => g.id === tr.destinationGovId));
              return (
                <div key={tr.id} className="surface-card rounded-2xl p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500">
                        {tr.departureDate} · {tr.departureTime} · {t.statuses[tr.status]}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {dep} → {dst}
                      </h3>
                      <div className="text-xs text-slate-600 mt-0.5 tabular-nums">
                        {tr.availableSeats}/{tr.totalSeats} {t.tripCard.seatsAvailable} ·{' '}
                        {formatIqd(tr.pricePerSeatIqd)}
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
                        <button
                          type="button"
                          onClick={() => updateTripStatus(tr.id, 'cancelled')}
                          className="px-3.5 py-2 text-xs font-medium text-rose-700 border border-rose-200 rounded-xl cursor-pointer"
                        >
                          {t.driver.cancelTrip}
                        </button>
                      )}
                    </div>
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
      {tab === 'publish' && (
        <form onSubmit={handlePublishTrip} className="surface-card rounded-2xl p-6 max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900">{t.driver.publishTripTitle}</h2>
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.driver.departureDate}
              </label>
              <input
                type="date"
                required
                value={depDate}
                onChange={(e) => setDepDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.driver.departureTime}
              </label>
              <input
                type="time"
                required
                value={depTime}
                onChange={(e) => setDepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.driver.pricePerSeat}
              </label>
              <input
                type="number"
                min={1000}
                max={500000}
                step={500}
                required
                value={priceIqd}
                onChange={(e) => setPriceIqd(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.driver.originalPriceOptional}
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={origPriceIqd}
                onChange={(e) => setOrigPriceIqd(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.driver.seatsToOffer}
              </label>
              <input
                type="number"
                min={1}
                max={15}
                required
                value={seatsToOffer}
                onChange={(e) => setSeatsToOffer(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono tabular-nums"
              />
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.driver.tripNotes}</label>
            <textarea
              rows={2}
              maxLength={400}
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={!isApproved || busy}
            className="px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] disabled:opacity-50 cursor-pointer"
          >
            {t.driver.publishTripBtn}
          </button>
        </form>
      )}

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
                onChange={async (e) =>
                  e.target.files?.[0] && setIdDocUrl(await compressImageToDataUrl(e.target.files[0]))
                }
              />
            </label>
            <label className="flex items-center justify-between gap-2 px-3 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs cursor-pointer hover:bg-slate-50">
              <span>{licDocUrl ? t.auth.fileAttached : t.auth.licenseDocumentPhoto}</span>
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) =>
                  e.target.files?.[0] && setLicDocUrl(await compressImageToDataUrl(e.target.files[0]))
                }
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

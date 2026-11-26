import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Copy,
  Gift,
  HeadphonesIcon,
  Navigation,
  Package,
  Search,
  Share2,
  Star,
  Upload,
  User,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, extractErrorDetails, handleFirestoreError, OperationType } from '../lib/firebase';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { formatIraqiPlateDisplay } from '../data/iraqReferenceData';
import { saveSingleVerificationImage } from '../services/imageUtils';
import {
  cancelBookingTransaction,
  disputePayment,
  markAllNotificationsRead,
  markNotificationRead,
  requestBookingReschedule,
  resubmitPassengerVerificationDocs,
  submitComplaint,
  submitReviewTransaction,
  subscribeSeatAlert,
  updatePassengerProfile,
} from '../services/platformService';
import { TripCard } from './TripCard';
import { AnimatedModalShell } from './motion/KineticPrimitives';
import type {
  Booking,
  CabinSeatId,
  Complaint,
  LanguageCode,
  Payment,
  PointsTransaction,
  Referral,
  Trip,
} from '../types/domain';

type PassengerTab = 'search' | 'bookings' | 'loyalty' | 'referrals' | 'notifications' | 'support' | 'profile';

interface PassengerDashboardProps {
  onSelectTripForBooking: (trip: Trip) => void;
  onBookFullCar?: (trip: Trip) => void;
}

export const PassengerDashboard: React.FC<PassengerDashboardProps> = ({
  onSelectTripForBooking,
  onBookFullCar,
}) => {
  const { lang, setLang, getLocalizedName, formatIqd, t } = useI18n();
  const {
    firebaseUser,
    userProfile,
    privateInfo,
    wallet,
    governorates,
    garages,
    trips,
    settings,
    notifications,
  } = useAuth();

  const [tab, setTab] = useState<PassengerTab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Search tab state
  const [depGov, setDepGov] = useState('');
  const [dstGov, setDstGov] = useState('');

  // Action modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [driverRating, setDriverRating] = useState(5);
  const [vehicleRating, setVehicleRating] = useState(5);
  const [experienceRating, setExperienceRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [disputeTarget, setDisputeTarget] = useState<Payment | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Support form
  const [compCategory, setCompCategory] = useState<Complaint['category']>('app_issue');
  const [compSubject, setCompSubject] = useState('');
  const [compDesc, setCompDesc] = useState('');

  // Profile form
  const [profName, setProfName] = useState(userProfile?.displayName || '');
  const [profPhone, setProfPhone] = useState(privateInfo?.phone || '');
  const [profGov, setProfGov] = useState(userProfile?.governorateId || 'bgw');
  const [profLang, setProfLang] = useState<LanguageCode>(userProfile?.preferredLanguage || lang);

  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [resubmitPortraitFile, setResubmitPortraitFile] = useState<File | null>(null);
  const [resubmittingDocs, setResubmittingDocs] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      setProfName(userProfile.displayName);
      setProfGov(userProfile.governorateId || 'bgw');
      setProfLang(userProfile.preferredLanguage || lang);
    }
    if (privateInfo) setProfPhone(privateInfo.phone);
  }, [userProfile, privateInfo, lang]);

  React.useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const unsubs = [
      onSnapshot(
        query(collection(db, 'bookings'), where('passengerId', '==', uid)),
        (snap) => {
          const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }));
          items.sort(
            (a, b) =>
              ((b.createdAt as { seconds?: number })?.seconds || 0) -
              ((a.createdAt as { seconds?: number })?.seconds || 0)
          );
          setBookings(items);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')
      ),
      onSnapshot(
        query(collection(db, 'payments'), where('passengerId', '==', uid)),
        (snap) => setPayments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'payments')
      ),
      onSnapshot(
        query(collection(db, 'points_transactions'), where('userId', '==', uid)),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PointsTransaction, 'id'>) }));
          list.sort(
            (a, b) =>
              ((b.createdAt as { seconds?: number })?.seconds || 0) -
              ((a.createdAt as { seconds?: number })?.seconds || 0)
          );
          setTransactions(list);
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'points_transactions')
      ),
      onSnapshot(
        query(collection(db, 'referrals'), where('referrerId', '==', uid)),
        (snap) => setReferrals(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Referral, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'referrals')
      ),
      onSnapshot(
        query(collection(db, 'complaints'), where('userId', '==', uid)),
        (snap) => setComplaints(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Complaint, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'complaints')
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [firebaseUser]);

  const paymentMap = useMemo(() => {
    const m = new Map<string, Payment>();
    payments.forEach((p) => m.set(p.bookingId, p));
    return m;
  }, [payments]);

  const tripMap = useMemo(() => {
    const m = new Map<string, Trip>();
    trips.forEach((tr) => m.set(tr.id, tr));
    return m;
  }, [trips]);

  const searchedTrips = useMemo(() => {
    return trips.filter((tr) => {
      if (depGov && tr.departureGovId !== depGov) return false;
      if (dstGov && tr.destinationGovId !== dstGov) return false;
      return true;
    });
  }, [trips, depGov, dstGov]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  if (!firebaseUser || !userProfile) return null;

  const balance = wallet?.balance || 0;
  const freeCost = settings.freeTripCostPoints || 35000;
  const progressPct = Math.min(100, Math.round((balance / freeCost) * 100));
  const pointsLeft = Math.max(0, freeCost - balance);
  const referralUrl = `${window.location.origin}/?ref=${userProfile.referralCode}`;
  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
  const seatLabelMap: Record<CabinSeatId, string> = {
    front_passenger: t.booking.seatFrontPassenger,
    rear_right: t.booking.seatRearRight,
    rear_middle: t.booking.seatRearMiddle,
    rear_left: t.booking.seatRearLeft,
    extra_right: t.booking.seatExtraRight,
    extra_left: t.booking.seatExtraLeft,
  };

  const handleCopyShare = async (booking: Booking) => {
    const dep = getLocalizedName(governorates.find((g) => g.id === booking.departureGovId));
    const dst = getLocalizedName(governorates.find((g) => g.id === booking.destinationGovId));
    const liveTrip = tripMap.get(booking.tripId);
    const formattedPlate = formatIraqiPlateDisplay(
      booking.vehiclePlate || booking.plateDigits ? booking : liveTrip,
      lang
    );
    const platePart = formattedPlate ? ` | ${formattedPlate}` : '';
    const text = `${t.brand}: ${dep} → ${dst} | ${booking.departureDate} ${booking.departureTime} | ${booking.driverName || ''} (${booking.driverPhone || ''})${platePart} | ${booking.shareToken || booking.id}`;
    await navigator.clipboard.writeText(text);
    notify('ok', t.passenger.copiedShareText);
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelBookingTarget) return;
    try {
      await cancelBookingTransaction(cancelBookingTarget.id, firebaseUser.uid, cancelReason, settings);
      setCancelBookingTarget(null);
      setCancelReason('');
      notify('ok', t.driver.savedSuccess);
    } catch (err) {
      if (err instanceof Error && err.message === 'CANCELLATION_TOO_LATE') {
        notify('err', t.errors.cancellationTooLate);
      } else {
        notify('err', t.errors.generic);
      }
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleDate) return;
    try {
      await requestBookingReschedule(rescheduleTarget.id, rescheduleDate);
      setRescheduleTarget(null);
      setRescheduleDate('');
      notify('ok', t.driver.savedSuccess);
    } catch {
      notify('err', t.errors.generic);
    }
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    try {
      await submitReviewTransaction({
        booking: reviewBooking,
        driverRating,
        vehicleRating,
        experienceRating,
        comment: reviewComment,
      });
      setReviewBooking(null);
      setReviewComment('');
      notify('ok', t.driver.savedSuccess);
    } catch {
      notify('err', t.errors.generic);
    }
  };

  const handleConfirmDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeTarget) return;
    try {
      await disputePayment(disputeTarget.id, disputeReason);
      setDisputeTarget(null);
      setDisputeReason('');
      notify('ok', t.driver.savedSuccess);
    } catch {
      notify('err', t.errors.generic);
    }
  };

  const tabs: Array<{ id: PassengerTab; label: string; icon: React.ReactNode }> = [
    { id: 'bookings', label: t.passenger.tabBookings, icon: <Calendar className="w-4 h-4" /> },
    { id: 'search', label: t.passenger.tabSearch, icon: <Search className="w-4 h-4" /> },
    { id: 'loyalty', label: t.passenger.tabLoyalty, icon: <Award className="w-4 h-4" /> },
    { id: 'referrals', label: t.passenger.tabReferrals, icon: <Gift className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: `${t.passenger.tabNotifications}${unreadIds.length ? ` (${unreadIds.length})` : ''}`,
      icon: <Bell className="w-4 h-4" />,
    },
    { id: 'support', label: t.passenger.tabSupport, icon: <HeadphonesIcon className="w-4 h-4" /> },
    { id: 'profile', label: t.passenger.tabProfile, icon: <User className="w-4 h-4" /> },
  ];

  const isApprovedMember =
    userProfile.verificationStatus === 'approved' && userProfile.accountStatus === 'active';

  const handleResubmitDocs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubmitPortraitFile) {
      notify('err', t.auth.missingRequiredFields);
      return;
    }
    setResubmittingDocs(true);
    try {
      try {
        await saveSingleVerificationImage(
          firebaseUser.uid,
          'portrait',
          resubmitPortraitFile,
          privateInfo?.email || firebaseUser.email || ''
        );
      } catch (imgErr) {
        const d = extractErrorDetails(imgErr);
        notify('err', `${t.auth.stepFailedImages} [${d.code}] ${d.message}`);
        return;
      }

      try {
        await resubmitPassengerVerificationDocs(firebaseUser.uid, {
          photoUrl: firebaseUser.photoURL || '',
        });
        setResubmitPortraitFile(null);
        notify('ok', t.auth.docsResubmitted);
      } catch (profileErr) {
        const d = extractErrorDetails(profileErr);
        notify('err', `${t.auth.stepFailedProfile} [${d.code}] ${d.message}`);
      }
    } finally {
      setResubmittingDocs(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.passenger.title}</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {userProfile.displayName} ·{' '}
            <span className="font-mono font-semibold text-[#0770E3] tabular-nums">
              {balance.toLocaleString()} {t.pointsUnit}
            </span>
          </p>
        </div>
      </div>

      {/* Verification Status Gate Banner */}
      {isApprovedMember ? (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-semibold text-[#0559B8]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t.auth.verifiedPassengerBadge}</span>
        </div>
      ) : userProfile.verificationStatus === 'rejected' ? (
        <form
          onSubmit={handleResubmitDocs}
          className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-rose-900">{t.auth.rejectedStatus}</div>
              <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
                {userProfile.rejectionReason || t.auth.pendingApprovalBannerDesc}
              </p>
            </div>
          </div>
          <div className="pt-1">
            <label className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-dashed border-rose-300 rounded-xl text-xs cursor-pointer hover:bg-rose-50/60">
              <span className="truncate font-medium text-slate-800">
                {resubmitPortraitFile ? resubmitPortraitFile.name : t.auth.portraitPhoto}
              </span>
              <Upload className="w-4 h-4 text-rose-700 shrink-0" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setResubmitPortraitFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={resubmittingDocs || !resubmitPortraitFile}
              className="px-4 py-2 text-xs font-semibold bg-rose-700 text-white rounded-xl hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
            >
              {resubmittingDocs ? t.auth.submitting : t.auth.resubmitDocsBtn}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-amber-900">{t.auth.pendingApprovalBannerTitle}</div>
            <p className="text-xs sm:text-sm text-amber-800 mt-0.5">{t.auth.pendingApprovalBannerDesc}</p>
          </div>
        </div>
      )}

      {/* Responsive Tab Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              tab === item.id
                ? 'bg-[#0770E3] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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

      {/* TAB: MY BOOKINGS */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">{t.passenger.noBookings}</p>
              <button
                type="button"
                onClick={() => setTab('search')}
                className="px-4 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
              >
                {t.passenger.tabSearch}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((bk) => {
                const dep = getLocalizedName(governorates.find((g) => g.id === bk.departureGovId));
                const dst = getLocalizedName(governorates.find((g) => g.id === bk.destinationGovId));
                const pay = paymentMap.get(bk.id);
                const liveTrip = tripMap.get(bk.tripId);
                return (
                  <div key={bk.id} className="surface-card surface-card-interactive rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
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
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {dep} → {dst}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {bk.driverName} {bk.driverPhone ? `(${bk.driverPhone})` : ''} · {bk.seatsCount}{' '}
                          {t.hero.seatsLabel}
                          {bk.isFullCar ? ` · ${t.driver.fullCarBadge}` : ''}
                          {bk.selectedSeats && bk.selectedSeats.length > 0
                            ? ` (${bk.selectedSeats.map((s) => seatLabelMap[s]).join('، ')})`
                            : ''}
                        </p>
                        {(() => {
                          const bkPlate = formatIraqiPlateDisplay(
                            bk.vehiclePlate || bk.plateDigits ? bk : liveTrip,
                            lang
                          );
                          return bkPlate ? (
                            <div className="mt-1.5">
                              <span
                                dir="ltr"
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#F7F9FB] border border-[#CBD5E1] text-[11px] font-mono font-bold text-[#05203C] tabular-nums"
                              >
                                {bkPlate}
                              </span>
                            </div>
                          ) : null;
                        })()}
                        {bk.includeCargo && (
                          <div className="mt-2 inline-flex flex-wrap items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-xs">
                            <Package className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="font-semibold text-emerald-900">
                              {t.booking.cargoBadge} (+{formatIqd(bk.cargoFeeIqd || 0)})
                            </span>
                            {bk.cargoNotes && <span className="text-emerald-800">{bk.cargoNotes}</span>}
                          </div>
                        )}
                        {bk.useCustomDropOff &&
                          typeof bk.customDropOffLat === 'number' &&
                          typeof bk.customDropOffLng === 'number' && (
                            <div className="mt-2 inline-flex flex-wrap items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-2.5 py-1 text-xs">
                              <span className="font-semibold text-[#05203C]">
                                {t.booking.customDropOffBadge} (+{formatIqd(bk.customDropOffFeeIqd || 10000)})
                              </span>
                              {bk.customDropOffAddress && (
                                <span className="text-slate-700">{bk.customDropOffAddress}</span>
                              )}
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${bk.customDropOffLat},${bk.customDropOffLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-[#0770E3] underline"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>{t.booking.openDriverNavLink}</span>
                              </a>
                            </div>
                          )}
                      </div>

                      <div className="text-start sm:text-end">
                        <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                          {bk.isFreeTrip
                            ? `${bk.pointsRedeemed.toLocaleString()} ${t.pointsUnit}`
                            : formatIqd(bk.totalPriceIqd)}
                        </div>
                        {bk.rescheduleRequestedDate && (
                          <div className="text-xs text-amber-700 mt-0.5 tabular-nums">
                            {t.passenger.rescheduleBtn}: {bk.rescheduleRequestedDate}
                          </div>
                        )}
                      </div>
                    </div>

                    {liveTrip?.liveTrackingEnabled &&
                      typeof liveTrip.liveLat === 'number' &&
                      typeof liveTrip.liveLng === 'number' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                          <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5" />
                            {t.passenger.liveLocationActive}
                          </span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${liveTrip.liveLat},${liveTrip.liveLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-amber-900 underline"
                          >
                            {t.map.openExternalMap}
                          </a>
                        </div>
                      )}

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleCopyShare(bk)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t.passenger.shareTripBtn}</span>
                      </button>

                      {['pending', 'accepted'].includes(bk.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleTarget(bk);
                              setRescheduleDate(bk.departureDate || '');
                            }}
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                          >
                            {t.passenger.rescheduleBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelBookingTarget(bk)}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                          >
                            {t.passenger.cancelBooking}
                          </button>
                        </>
                      )}

                      {bk.status === 'completed' && !bk.reviewSubmitted && (
                        <button
                          type="button"
                          onClick={() => setReviewBooking(bk)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>{t.passenger.rateDriverBtn}</span>
                        </button>
                      )}

                      {pay && ['unpaid', 'paid'].includes(pay.status) && pay.method === 'cash' && (
                        <button
                          type="button"
                          onClick={() => setDisputeTarget(pay)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{t.passenger.disputePaymentBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: SEARCH TRIPS */}
      {tab === 'search' && (
        <div className="space-y-5">
          <div className="surface-card rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={depGov}
              onChange={(e) => setDepGov(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0770E3]"
            >
              <option value="">
                {t.hero.allGovernorates} ({t.hero.fromLabel})
              </option>
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {getLocalizedName(g)}
                </option>
              ))}
            </select>
            <select
              value={dstGov}
              onChange={(e) => setDstGov(e.target.value)}
              className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0770E3]"
            >
              <option value="">
                {t.hero.allGovernorates} ({t.hero.toLabel})
              </option>
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {getLocalizedName(g)}
                </option>
              ))}
            </select>
          </div>
          {searchedTrips.length === 0 ? (
            <div className="surface-card rounded-2xl p-10 text-center space-y-2">
              <Car className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">{t.home.noTripsTitle}</h3>
              <p className="text-sm text-slate-600">{t.home.noTripsDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {searchedTrips.map((tr) => (
                <TripCard
                  key={tr.id}
                  trip={tr}
                  governorates={governorates}
                  garages={garages}
                  currentUserId={firebaseUser.uid}
                  onBook={(trip) => {
                    if (!isApprovedMember) {
                      notify('err', t.errors.unapprovedUser);
                      return;
                    }
                    onSelectTripForBooking(trip);
                  }}
                  onBookFullCar={
                    onBookFullCar
                      ? (trip) => {
                          if (!isApprovedMember) {
                            notify('err', t.errors.unapprovedUser);
                            return;
                          }
                          onBookFullCar(trip);
                        }
                      : undefined
                  }
                  onSeatAlert={async (trip) => {
                    if (!isApprovedMember) {
                      notify('err', t.errors.unapprovedUser);
                      return;
                    }
                    await subscribeSeatAlert(trip.id, trip.driverId, firebaseUser.uid, 1);
                    notify('ok', t.tripCard.alertSubscribed);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: LOYALTY WALLET */}
      {tab === 'loyalty' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.passenger.walletBalance}</div>
              <div className="text-2xl font-bold font-mono text-[#0770E3] mt-1 tabular-nums">
                {balance.toLocaleString()} {t.pointsUnit}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.passenger.totalEarned}</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {(wallet?.totalEarned || 0).toLocaleString()} {t.pointsUnit}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.passenger.totalRedeemed}</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {(wallet?.totalRedeemed || 0).toLocaleString()} {t.pointsUnit}
              </div>
            </div>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">{t.passenger.progressFreeTrip}</span>
              <span className="font-mono font-semibold text-[#0770E3] tabular-nums">{progressPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0770E3] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 tabular-nums">
              {pointsLeft === 0
                ? t.passenger.freeTripReady
                : `${pointsLeft.toLocaleString()} ${t.passenger.pointsRemaining} (${freeCost.toLocaleString()} ${t.pointsUnit})`}
            </p>
          </div>

          <div className="surface-card rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.passenger.transactionsHistory}</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-slate-500">{t.passenger.noTransactions}</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                    <div>
                      <div className="font-medium text-slate-900">{tx.description}</div>
                      <div className="text-xs text-slate-500">{tx.type}</div>
                    </div>
                    <div
                      className={`font-mono font-bold tabular-nums ${
                        tx.amount >= 0 ? 'text-[#0770E3]' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount >= 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}{' '}
                      {t.pointsUnit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: REFERRALS */}
      {tab === 'referrals' && (
        <div className="space-y-6">
          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{t.passenger.yourReferralLink}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={referralUrl}
                dir="ltr"
                className="flex-1 px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(referralUrl);
                  notify('ok', t.passenger.linkCopied);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer shrink-0"
              >
                <Copy className="w-4 h-4" />
                <span>{t.passenger.copyLink}</span>
              </button>
            </div>
            <div className="text-xs text-slate-600">
              {t.passenger.yourReferralCode}:{' '}
              <span className="font-mono font-bold text-slate-900">{userProfile.referralCode}</span>
            </div>
          </div>

          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.passenger.referredFriends}</h3>
            {referrals.length === 0 ? (
              <p className="text-sm text-slate-500">{t.passenger.noReferrals}</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {referrals.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-semibold text-slate-900">{r.refereeName}</div>
                      <div className="text-xs text-slate-500">{t.statuses[r.status]}</div>
                    </div>
                    <div className="font-mono font-bold text-[#0770E3] tabular-nums">
                      +{r.bonusPointsReferrer.toLocaleString()} {t.pointsUnit}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div className="surface-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{t.passenger.tabNotifications}</h3>
            {unreadIds.length > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead(unreadIds)}
                className="text-xs font-semibold text-[#0770E3] hover:underline cursor-pointer"
              >
                {t.passenger.markAllRead}
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-500">{t.passenger.noNotifications}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => {
                const title = lang === 'ku' ? n.titleKu : lang === 'en' ? n.titleEn : n.titleAr;
                const body = lang === 'ku' ? n.bodyKu : lang === 'en' ? n.bodyEn : n.bodyAr;
                return (
                  <div
                    key={n.id}
                    className={`py-3.5 flex items-start justify-between gap-4 ${n.isRead ? 'opacity-70' : ''}`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{title}</div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{body}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="p-1.5 text-[#0770E3] hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: SUPPORT */}
      {tab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await submitComplaint({
                userId: firebaseUser.uid,
                userName: userProfile.displayName,
                userRole: 'passenger',
                category: compCategory,
                subject: compSubject,
                description: compDesc,
              });
              setCompSubject('');
              setCompDesc('');
              notify('ok', t.driver.savedSuccess);
            }}
            className="lg:col-span-6 surface-card rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">{t.passenger.submitComplaintTitle}</h3>
            <select
              value={compCategory}
              onChange={(e) => setCompCategory(e.target.value as Complaint['category'])}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0770E3]"
            >
              <option value="app_issue">{t.supportCategories.app_issue}</option>
              <option value="payment">{t.supportCategories.payment}</option>
              <option value="driver_behavior">{t.supportCategories.driver_behavior}</option>
              <option value="vehicle">{t.supportCategories.vehicle}</option>
              <option value="other">{t.supportCategories.other}</option>
            </select>
            <input
              type="text"
              required
              minLength={2}
              placeholder={t.passenger.complaintSubject}
              value={compSubject}
              onChange={(e) => setCompSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#0770E3]"
            />
            <textarea
              rows={4}
              required
              minLength={4}
              placeholder={t.passenger.complaintDesc}
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#0770E3]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
            >
              {t.passenger.sendComplaint}
            </button>
          </form>

          <div className="lg:col-span-6 surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.passenger.myComplaints}</h3>
            <div className="divide-y divide-slate-100">
              {complaints.map((c) => (
                <div key={c.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{c.subject}</span>
                    <span className="text-xs font-medium text-[#0770E3]">{t.statuses[c.status]}</span>
                  </div>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  {c.adminNotes && (
                    <p className="text-xs text-slate-800 bg-slate-50 rounded-lg p-2 mt-1">{c.adminNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROFILE */}
      {tab === 'profile' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await updatePassengerProfile(firebaseUser.uid, {
              displayName: profName,
              phone: profPhone,
              governorateId: profGov,
              preferredLanguage: profLang,
              email: privateInfo?.email || firebaseUser.email || '',
            });
            setLang(profLang);
            notify('ok', t.passenger.profileSaved);
          }}
          className="surface-card rounded-2xl p-6 max-w-xl space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900">{t.passenger.tabProfile}</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.auth.fullName}</label>
            <input
              type="text"
              required
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t.auth.phone}</label>
            <input
              type="tel"
              required
              value={profPhone}
              onChange={(e) => setProfPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.auth.governorate}</label>
              <select
                value={profGov}
                onChange={(e) => setProfGov(e.target.value)}
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
                {t.common.languageLabel}
              </label>
              <select
                value={profLang}
                onChange={(e) => setProfLang(e.target.value as LanguageCode)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="ar">{t.langAr}</option>
                <option value="ku">{t.langKu}</option>
                <option value="en">{t.langEn}</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
          >
            {t.passenger.profileSave}
          </button>
        </form>
      )}

      {/* ANIMATED INLINE MODALS */}
      <AnimatedModalShell
        isOpen={Boolean(cancelBookingTarget)}
        onClose={() => setCancelBookingTarget(null)}
        maxWidthClass="max-w-md"
      >
        <form
          onSubmit={handleConfirmCancel}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-[var(--shadow-elevated)]"
        >
          <h3 className="text-lg font-bold text-slate-900">{t.passenger.cancelBooking}</h3>
          <input
            type="text"
            placeholder={t.passenger.cancelReasonPrompt}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCancelBookingTarget(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl cursor-pointer"
            >
              {t.booking.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-rose-600 text-white font-semibold rounded-xl cursor-pointer"
            >
              {t.passenger.cancelBooking}
            </button>
          </div>
        </form>
      </AnimatedModalShell>

      <AnimatedModalShell
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        maxWidthClass="max-w-md"
      >
        <form
          onSubmit={handleConfirmReschedule}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-[var(--shadow-elevated)]"
        >
          <h3 className="text-lg font-bold text-slate-900">{t.passenger.rescheduleBtn}</h3>
          <input
            type="date"
            required
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRescheduleTarget(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl cursor-pointer"
            >
              {t.booking.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#0770E3] text-white font-semibold rounded-xl cursor-pointer"
            >
              {t.passenger.profileSave}
            </button>
          </div>
        </form>
      </AnimatedModalShell>

      <AnimatedModalShell
        isOpen={Boolean(reviewBooking)}
        onClose={() => setReviewBooking(null)}
        maxWidthClass="max-w-md"
      >
        <form
          onSubmit={handleConfirmReview}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-[var(--shadow-elevated)]"
        >
          <h3 className="text-lg font-bold text-slate-900">{t.passenger.rateDriverBtn}</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">{t.passenger.driverRating}</label>
              <select
                value={driverRating}
                onChange={(e) => setDriverRating(Number(e.target.value))}
                className="w-full p-2 border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">{t.passenger.vehicleRating}</label>
              <select
                value={vehicleRating}
                onChange={(e) => setVehicleRating(Number(e.target.value))}
                className="w-full p-2 border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">{t.passenger.experienceRating}</label>
              <select
                value={experienceRating}
                onChange={(e) => setExperienceRating(Number(e.target.value))}
                className="w-full p-2 border rounded-xl"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            rows={3}
            required
            placeholder={t.passenger.reviewComment}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReviewBooking(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl cursor-pointer"
            >
              {t.booking.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#0770E3] text-white font-semibold rounded-xl cursor-pointer"
            >
              {t.passenger.submitReview}
            </button>
          </div>
        </form>
      </AnimatedModalShell>

      <AnimatedModalShell
        isOpen={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        maxWidthClass="max-w-md"
      >
        <form
          onSubmit={handleConfirmDispute}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-[var(--shadow-elevated)]"
        >
          <h3 className="text-lg font-bold text-slate-900">{t.passenger.disputePaymentBtn}</h3>
          <textarea
            rows={3}
            required
            placeholder={t.passenger.disputeReason}
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDisputeTarget(null)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl cursor-pointer"
            >
              {t.booking.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-amber-600 text-white font-semibold rounded-xl cursor-pointer"
            >
              {t.passenger.disputePaymentBtn}
            </button>
          </div>
        </form>
      </AnimatedModalShell>
    </div>
  );
};

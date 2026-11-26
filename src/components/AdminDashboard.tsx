import React, { useMemo, useState } from 'react';
import {
  Award,
  Banknote,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  CreditCard,
  Database,
  ExternalLink,
  LogIn,
  MapPin,
  MessageSquare,
  Navigation,
  Package,
  ShieldAlert,
  Trash2,
  Users,
  X,
  ZoomIn,
} from 'lucide-react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, extractErrorDetails } from '../lib/firebase';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { formatIraqiPlateDisplay } from '../data/iraqReferenceData';
import {
  getUserVerificationImages,
  isIndexedDbImageRef,
  resolveVerificationImageSrc,
  type VerificationDocImages,
} from '../services/imageUtils';
import {
  adminAdjustWalletPoints,
  adminDeleteGarage,
  adminResolvePayment,
  adminReviewWeeklyCommission,
  adminSaveGarage,
  adminSavePlatformSettings,
  adminSendNotification,
  adminSetDriverVerification,
  adminSetReviewStatus,
  adminSetUserVerification,
  adminUpdateComplaint,
  adminUpdateUserStatus,
  deleteTrip,
  seedIraqReferenceData,
  updateTripStatus,
} from '../services/platformService';
import { AnimatedModalShell } from './motion/KineticPrimitives';
import type {
  Booking,
  CabinSeatId,
  Complaint,
  DriverProfile,
  DriverWeeklyFee,
  Payment,
  PlatformSettings,
  Review,
  Trip,
  UserPrivateInfo,
  UserProfile,
  Vehicle,
} from '../types/domain';

type AdminTab =
  | 'overview'
  | 'drivers'
  | 'weekly_fees'
  | 'users'
  | 'geography'
  | 'trips'
  | 'payments'
  | 'loyalty'
  | 'moderation';

export const AdminDashboard: React.FC = () => {
  const { lang, getLocalizedName, formatIqd, t } = useI18n();
  const { firebaseUser, isAdmin, governorates, garages, settings, signInWithGoogle } = useAuth();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [weeklyFees, setWeeklyFees] = useState<DriverWeeklyFee[]>([]);
  const [weeklyRejectNotes, setWeeklyRejectNotes] = useState<Record<string, string>>({});
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [inspectDriver, setInspectDriver] = useState<DriverProfile | null>(null);
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null);
  const [inspectPrivateInfo, setInspectPrivateInfo] = useState<UserPrivateInfo | null>(null);
  const [inspectDocs, setInspectDocs] = useState<VerificationDocImages>({});
  const [zoomedPhoto, setZoomedPhoto] = useState<{ url: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Settings form
  const [cfg, setCfg] = useState<PlatformSettings>(settings);

  // Manual points adjustment
  const [adjUserId, setAdjUserId] = useState('');
  const [adjDelta, setAdjDelta] = useState(5000);
  const [adjReason, setAdjReason] = useState('');

  // Notification broadcast
  const [notifUserId, setNotifUserId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // New garage form
  const [garGovId, setGarGovId] = useState('bgw');
  const [garNameAr, setGarNameAr] = useState('');
  const [garNameKu, setGarNameKu] = useState('');
  const [garNameEn, setGarNameEn] = useState('');
  const [garHours, setGarHours] = useState('05:00 - 22:00');
  const [garLat, setGarLat] = useState(33.3152);
  const [garLng, setGarLng] = useState(44.3661);

  const [complaintNotes, setComplaintNotes] = useState<Record<string, string>>({});
  const [confirmDeleteTripId, setConfirmDeleteTripId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const seatLabelMap: Record<CabinSeatId, string> = {
    front_passenger: t.booking.seatFrontPassenger,
    rear_right: t.booking.seatRearRight,
    rear_middle: t.booking.seatRearMiddle,
    rear_left: t.booking.seatRearLeft,
    extra_right: t.booking.seatExtraRight,
    extra_left: t.booking.seatExtraLeft,
  };

  React.useEffect(() => {
    setCfg(settings);
  }, [settings]);

  React.useEffect(() => {
    if (!isAdmin) return;
    const unsubs: Array<() => void> = [
      onSnapshot(
        collection(db, 'trips'),
        (s) => setAllTrips(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }))),
        (err) => console.warn('Admin trips listener notice:', err)
      ),
    ];

    if (firebaseUser) {
      unsubs.push(
        onSnapshot(
          collection(db, 'users'),
          (s) => setUsers(s.docs.map((d) => d.data() as UserProfile)),
          (err) => console.warn('Admin users listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'drivers'),
          (s) => setDrivers(s.docs.map((d) => d.data() as DriverProfile)),
          (err) => console.warn('Admin drivers listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'vehicles'),
          (s) => setVehicles(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, 'id'>) }))),
          (err) => console.warn('Admin vehicles listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'bookings'),
          (s) => setAllBookings(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }))),
          (err) => console.warn('Admin bookings listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'payments'),
          (s) => setAllPayments(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }))),
          (err) => console.warn('Admin payments listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'complaints'),
          (s) => setComplaints(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Complaint, 'id'>) }))),
          (err) => console.warn('Admin complaints listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'reviews'),
          (s) => setReviews(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))),
          (err) => console.warn('Admin reviews listener notice:', err)
        ),
        onSnapshot(
          collection(db, 'driver_weekly_fees'),
          (s) =>
            setWeeklyFees(
              s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<DriverWeeklyFee, 'id'>) }))
            ),
          (err) => console.warn('Admin weekly fees listener notice:', err)
        )
      );
    }

    return () => unsubs.forEach((u) => u());
  }, [isAdmin, firebaseUser]);

  React.useEffect(() => {
    const targetUid = inspectDriver?.uid || inspectUser?.uid;
    if (!targetUid) {
      setInspectPrivateInfo(null);
      setInspectDocs({});
      return;
    }
    let cancelled = false;

    const hydrateDocs = async () => {
      let privateData: UserPrivateInfo | null = null;
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', targetUid, 'private', 'info'));
          privateData = snap.exists() ? (snap.data() as UserPrivateInfo) : null;
        } catch {
          privateData = null;
        }
      }
      if (!cancelled) {
        setInspectPrivateInfo(privateData);
      }

      try {
        const stored = await getUserVerificationImages(targetUid, privateData?.email);
        const linkedUsr = inspectUser || users.find((u) => u.uid === targetUid);
        const linkedDrv = inspectDriver || drivers.find((d) => d.uid === targetUid);

        const resolveSlot = async (
          storedVal: string | undefined,
          ...candidates: Array<string | undefined>
        ): Promise<string> => {
          if (storedVal) return storedVal;
          for (const c of candidates) {
            if (!c) continue;
            if (isIndexedDbImageRef(c)) {
              const resolved = await resolveVerificationImageSrc(c);
              if (resolved) return resolved;
            } else {
              return c;
            }
          }
          return '';
        };

        const [portraitUrl, idFrontUrl, idBackUrl, licenseFrontUrl, licenseBackUrl] =
          await Promise.all([
            resolveSlot(stored.portraitUrl, linkedUsr?.portraitUrl, linkedUsr?.photoUrl),
            resolveSlot(
              stored.idFrontUrl,
              linkedDrv?.idFrontUrl,
              linkedDrv?.idDocumentUrl,
              linkedUsr?.idFrontUrl,
              linkedUsr?.idDocumentUrl
            ),
            resolveSlot(stored.idBackUrl, linkedDrv?.idBackUrl, linkedUsr?.idBackUrl),
            resolveSlot(
              stored.licenseFrontUrl,
              linkedDrv?.licenseFrontUrl,
              linkedDrv?.licenseDocumentUrl,
              linkedUsr?.licenseFrontUrl,
              linkedUsr?.licenseDocumentUrl
            ),
            resolveSlot(stored.licenseBackUrl, linkedDrv?.licenseBackUrl, linkedUsr?.licenseBackUrl),
          ]);

        if (!cancelled) {
          setInspectDocs({
            portraitUrl,
            idFrontUrl,
            idBackUrl,
            licenseFrontUrl,
            licenseBackUrl,
          });
        }
      } catch {
        if (!cancelled) setInspectDocs({});
      }
    };

    hydrateDocs();

    return () => {
      cancelled = true;
    };
  }, [inspectDriver, inspectUser, users, drivers, firebaseUser]);

  const stats = useMemo(() => {
    const gmv = allPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amountIqd, 0);
    const commission = allPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.commissionIqd, 0);
    const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'pending').length;
    const pendingUsers = users.filter((u) => u.verificationStatus === 'pending').length;
    const pendingWeeklyFees = weeklyFees.filter((f) => f.status === 'pending').length;
    const activeTrips = allTrips.filter((tr) => ['scheduled', 'in_progress'].includes(tr.status)).length;
    return { gmv, commission, pendingDrivers, pendingUsers, pendingWeeklyFees, activeTrips };
  }, [allPayments, drivers, users, weeklyFees, allTrips]);

  const sortedDrivers = useMemo(
    () =>
      [...drivers].sort(
        (a, b) =>
          (a.verificationStatus === 'pending' ? 0 : 1) -
          (b.verificationStatus === 'pending' ? 0 : 1)
      ),
    [drivers]
  );

  const sortedUsers = useMemo(
    () =>
      [...users].sort(
        (a, b) =>
          (a.verificationStatus === 'pending' ? 0 : 1) -
          (b.verificationStatus === 'pending' ? 0 : 1)
      ),
    [users]
  );

  const sortedWeeklyFees = useMemo(
    () =>
      [...weeklyFees].sort((a, b) => {
        const rank = (s: DriverWeeklyFee['status']) => (s === 'pending' ? 0 : s === 'rejected' ? 1 : 2);
        const diff = rank(a.status) - rank(b.status);
        if (diff !== 0) return diff;
        return (
          ((b.updatedAt as { seconds?: number })?.seconds || 0) -
          ((a.updatedAt as { seconds?: number })?.seconds || 0)
        );
      }),
    [weeklyFees]
  );

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">{t.errors.generic}</p>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: t.admin.tabOverview, icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'drivers', label: `${t.admin.tabDrivers} (${stats.pendingDrivers})`, icon: <Car className="w-4 h-4" /> },
    {
      id: 'weekly_fees',
      label: `${t.admin.tabWeeklyFees} (${stats.pendingWeeklyFees})`,
      icon: <CreditCard className="w-4 h-4" />,
    },
    { id: 'users', label: `${t.admin.tabUsers} (${stats.pendingUsers})`, icon: <Users className="w-4 h-4" /> },
    { id: 'geography', label: t.admin.tabGeography, icon: <MapPin className="w-4 h-4" /> },
    { id: 'trips', label: t.admin.tabTripsBookings, icon: <Calendar className="w-4 h-4" /> },
    { id: 'payments', label: t.admin.tabPayments, icon: <Banknote className="w-4 h-4" /> },
    { id: 'loyalty', label: t.admin.tabLoyaltyConfig, icon: <Award className="w-4 h-4" /> },
    { id: 'moderation', label: t.admin.tabComplaintsReviews, icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">{t.admin.title}</h1>
        <button
          type="button"
          onClick={async () => {
            if (!firebaseUser) {
              showToast(t.admin.adminOptionalSignInHint);
              return;
            }
            await seedIraqReferenceData(true);
            showToast(t.admin.seedDone);
          }}
          className="btn-tactile inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>{t.admin.seedIraqDataBtn}</span>
        </button>
      </div>

      {!firebaseUser && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-sm font-bold text-[#05203C]">{t.admin.adminCodeUnlockedNotice}</div>
            <p className="text-xs text-slate-700">{t.admin.adminOptionalSignInHint}</p>
          </div>
          <button
            type="button"
            onClick={() => signInWithGoogle().catch(() => showToast(t.errors.generic))}
            className="btn-tactile inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] shrink-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.admin.signInAsAdminGoogle}</span>
          </button>
        </div>
      )}

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
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#0559B8] rounded-xl px-4 py-3 text-sm font-medium">
          {feedback}
        </div>
      )}

      {/* TAB: OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.admin.totalRevenueGmv}</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {formatIqd(stats.gmv)}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.admin.platformCommissionEarned}</div>
              <div className="text-lg font-bold font-mono text-[#0770E3] mt-1 tabular-nums">
                {formatIqd(stats.commission)}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.admin.totalBookings}</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {allBookings.length}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.admin.activeTrips}</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {stats.activeTrips}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.admin.pendingDriversCount}</div>
              <div className="text-lg font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {stats.pendingDrivers}
              </div>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <div className="text-xs text-slate-500">{t.admin.pendingUsersCount}</div>
              <div className="text-lg font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {stats.pendingUsers}
              </div>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await adminSendNotification(notifUserId, notifTitle, notifBody);
              setNotifTitle('');
              setNotifBody('');
              showToast(t.driver.savedSuccess);
            }}
            className="surface-card rounded-2xl p-6 max-w-xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">{t.admin.broadcastTitle}</h3>
            <select
              required
              value={notifUserId}
              onChange={(e) => setNotifUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
            >
              <option value="">{t.admin.selectUserId}</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName} ({t.roles[u.role]})
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder={t.passenger.complaintSubject}
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
            <textarea
              rows={2}
              required
              placeholder={t.passenger.complaintDesc}
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
            >
              {t.admin.sendBroadcastBtn}
            </button>
          </form>
        </div>
      )}

      {/* TAB: DRIVER APPROVALS */}
      {tab === 'drivers' && (
        <div className="space-y-4">
          {sortedDrivers.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center text-sm text-slate-500">
              {t.admin.emptyList}
            </div>
          ) : (
            sortedDrivers.map((drv) => {
              const gov = governorates.find((g) => g.id === drv.governorateId);
              const drvVehicles = vehicles.filter((v) => v.driverId === drv.uid);
              const linkedUser = users.find((u) => u.uid === drv.uid);
              const drvPlate = formatIraqiPlateDisplay(drvVehicles[0] || linkedUser, lang);
              return (
                <div
                  key={drv.uid}
                  className="surface-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{t.statuses[drv.verificationStatus]}</span>
                      <span>·</span>
                      <span>{getLocalizedName(gov)}</span>
                      <span>·</span>
                      <span className="font-mono">{drv.phone}</span>
                    </div>
                    <div className="text-base font-bold text-slate-900">{drv.fullName}</div>
                    <div className="text-xs text-slate-600 font-mono flex flex-wrap items-center gap-2">
                      <span>
                        {t.common.idLabel}: {drv.nationalIdNumber} · {t.common.licenseLabel}: {drv.licenseNumber}
                        {drvVehicles[0]?.makeModel || linkedUser?.vehicleModel
                          ? ` · ${drvVehicles[0]?.makeModel || linkedUser?.vehicleModel}`
                          : ''}
                      </span>
                      {drvPlate && (
                        <span
                          dir="ltr"
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] font-bold text-[#05203C] tabular-nums"
                        >
                          {drvPlate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectReason('');
                        setInspectDriver(drv);
                      }}
                      className="px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                    >
                      {t.admin.viewDocuments}
                    </button>
                    {drv.verificationStatus !== 'approved' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminSetDriverVerification(drv.uid, 'approved');
                            showToast(t.driver.savedSuccess);
                          } catch {
                            showToast(t.errors.generic);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.admin.approveDriver}</span>
                      </button>
                    )}
                    {drv.verificationStatus === 'approved' && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await adminSetDriverVerification(drv.uid, 'suspended', t.statuses.suspended);
                            showToast(t.driver.savedSuccess);
                          } catch {
                            showToast(t.errors.generic);
                          }
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer"
                      >
                        {t.admin.suspendDriver}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: WEEKLY DRIVER COMMISSIONS (20,000 IQD RAFIDAIN) */}
      {tab === 'weekly_fees' && (
        <div className="space-y-4">
          <div className="surface-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.admin.weeklyFeesTitle}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{t.admin.weeklyFeesSubtitle}</p>
            </div>
            <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#0559B8]" dir="ltr">
              07738235028
            </div>
          </div>

          {sortedWeeklyFees.length === 0 ? (
            <div className="surface-card rounded-2xl p-8 text-center text-sm text-slate-500">
              {t.admin.emptyList}
            </div>
          ) : (
            sortedWeeklyFees.map((fee) => (
              <div
                key={fee.id}
                className="surface-card rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold ${
                        fee.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : fee.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {t.statuses[fee.status]}
                    </span>
                    <span className="font-mono font-semibold text-slate-700" dir="ltr">
                      {fee.weekKey}
                    </span>
                    <span>·</span>
                    <span className="font-mono font-bold text-[#0770E3] tabular-nums">
                      {formatIqd(fee.amountIqd)}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-500" dir="ltr">
                      {fee.rafidainNumber}
                    </span>
                  </div>

                  <div className="text-base font-bold text-slate-900 flex flex-wrap items-center gap-2">
                    <span>{fee.driverName}</span>
                    {fee.driverPhone && (
                      <span className="text-xs font-mono font-normal text-slate-500" dir="ltr">
                        {fee.driverPhone}
                      </span>
                    )}
                  </div>

                  <div className="inline-flex flex-wrap items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-3 py-1.5 text-xs">
                    <span className="text-slate-600 font-semibold">
                      {t.admin.transferSenderNameCol}:
                    </span>
                    <span className="font-bold text-[#05203C]">{fee.senderNameOnTransfer}</span>
                  </div>

                  {fee.adminNotes && (
                    <div className="text-xs text-rose-700">{fee.adminNotes}</div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                  {fee.status !== 'approved' && (
                    <>
                      <input
                        type="text"
                        placeholder={t.admin.adminNotesPlaceholder}
                        value={weeklyRejectNotes[fee.id] ?? ''}
                        onChange={(e) =>
                          setWeeklyRejectNotes((prev) => ({ ...prev, [fee.id]: e.target.value }))
                        }
                        className="px-3 py-2 text-xs border border-slate-300 rounded-xl w-full sm:w-48"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await adminReviewWeeklyCommission(
                            fee.id,
                            fee.driverId,
                            'rejected',
                            firebaseUser?.uid || 'admin_2006',
                            weeklyRejectNotes[fee.id] || ''
                          );
                          showToast(t.driver.savedSuccess);
                        }}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                      >
                        {t.admin.rejectWeeklyFeeBtn}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await adminReviewWeeklyCommission(
                            fee.id,
                            fee.driverId,
                            'approved',
                            firebaseUser?.uid || 'admin_2006'
                          );
                          showToast(t.driver.savedSuccess);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.admin.approveWeeklyFeeBtn}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: USERS */}
      {tab === 'users' && (
        <div className="surface-card rounded-2xl overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3 text-start">{t.tables.user}</th>
                <th className="px-4 py-3 text-start">{t.tables.role}</th>
                <th className="px-4 py-3 text-start">{t.tables.status}</th>
                <th className="px-4 py-3 text-start">{t.tables.referralCode}</th>
                <th className="px-4 py-3 text-end">{t.tables.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    {t.admin.emptyList}
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{u.displayName}</div>
                      <div className="font-mono text-xs text-slate-500">{u.uid.slice(0, 10)}</div>
                    </td>
                    <td className="px-4 py-3">{t.roles[u.role]}</td>
                    <td className="px-4 py-3">
                      <div>{t.statuses[u.accountStatus]}</div>
                      <div
                        className={`text-[11px] font-semibold ${
                          u.verificationStatus === 'approved'
                            ? 'text-[#0770E3]'
                            : u.verificationStatus === 'rejected'
                            ? 'text-rose-600'
                            : 'text-amber-700'
                        }`}
                      >
                        {u.verificationStatus === 'approved'
                          ? t.auth.verifiedStatus
                          : u.verificationStatus === 'rejected'
                          ? t.auth.rejectedStatus
                          : t.auth.pendingReview}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{u.referralCode}</td>
                    <td className="px-4 py-3 text-end">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectReason('');
                            setInspectUser(u);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                        >
                          {t.admin.viewDocuments}
                        </button>
                        {u.verificationStatus !== 'approved' && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await adminSetUserVerification(u.uid, 'approved');
                                showToast(t.driver.savedSuccess);
                              } catch {
                                showToast(t.errors.generic);
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#0770E3] text-white rounded-lg cursor-pointer hover:bg-[#0559B8]"
                          >
                            {t.admin.approveDriver}
                          </button>
                        )}
                        {u.verificationStatus !== 'rejected' && u.uid !== firebaseUser?.uid && (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectReason('');
                              setInspectUser(u);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 rounded-lg cursor-pointer hover:bg-rose-50"
                          >
                            {t.admin.rejectDriver}
                          </button>
                        )}
                      {u.accountStatus !== 'active' && (
                        <button
                          type="button"
                          onClick={() => adminUpdateUserStatus(u.uid, 'active')}
                          className="px-2.5 py-1 text-xs font-semibold text-[#0770E3] border border-[#BFDBFE] rounded-lg cursor-pointer"
                        >
                          {t.admin.activateUser}
                        </button>
                      )}
                      {u.accountStatus === 'active' && u.uid !== firebaseUser?.uid && (
                        <>
                          <button
                            type="button"
                            onClick={() => adminUpdateUserStatus(u.uid, 'suspended')}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 rounded-lg cursor-pointer"
                          >
                            {t.admin.suspendUser}
                          </button>
                          <button
                            type="button"
                            onClick={() => adminUpdateUserStatus(u.uid, 'blocked')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 rounded-lg cursor-pointer"
                          >
                            {t.admin.blockUser}
                          </button>
                        </>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: GEOGRAPHY & GARAGES */}
      {tab === 'geography' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await adminSaveGarage({
                governorateId: garGovId,
                nameAr: garNameAr,
                nameKu: garNameKu,
                nameEn: garNameEn,
                lat: garLat,
                lng: garLng,
                operatingHours: garHours,
                isActive: true,
              });
              setGarNameAr('');
              setGarNameKu('');
              setGarNameEn('');
              showToast(t.driver.savedSuccess);
            }}
            className="lg:col-span-5 surface-card rounded-2xl p-6 space-y-3"
          >
            <h3 className="text-base font-bold text-slate-900">{t.admin.addGarageTitle}</h3>
            <select
              value={garGovId}
              onChange={(e) => setGarGovId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-white"
            >
              {governorates.map((g) => (
                <option key={g.id} value={g.id}>
                  {getLocalizedName(g)}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder={t.admin.garageNameAr}
              value={garNameAr}
              onChange={(e) => setGarNameAr(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
            />
            <input
              type="text"
              required
              placeholder={t.admin.garageNameKu}
              value={garNameKu}
              onChange={(e) => setGarNameKu(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
            />
            <input
              type="text"
              required
              placeholder={t.admin.garageNameEn}
              value={garNameEn}
              onChange={(e) => setGarNameEn(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
            />
            <input
              type="text"
              required
              placeholder={t.admin.operatingHours}
              value={garHours}
              onChange={(e) => setGarHours(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.0001"
                required
                placeholder={t.admin.latitude}
                value={garLat}
                onChange={(e) => setGarLat(Number(e.target.value))}
                className="px-3.5 py-2 text-sm border border-slate-300 rounded-xl font-mono"
              />
              <input
                type="number"
                step="0.0001"
                required
                placeholder={t.admin.longitude}
                value={garLng}
                onChange={(e) => setGarLng(Number(e.target.value))}
                className="px-3.5 py-2 text-sm border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
            >
              {t.admin.saveGarage}
            </button>
          </form>

          <div className="lg:col-span-7 surface-card rounded-2xl p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              {t.map.allGarages} ({garages.length})
            </h3>
            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {garages.map((g) => (
                <div key={g.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">{getLocalizedName(g)}</div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">
                      {getLocalizedName(governorates.find((gv) => gv.id === g.governorateId))} ·{' '}
                      {g.lat.toFixed(3)}, {g.lng.toFixed(3)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminDeleteGarage(g.id)}
                    className="px-3 py-1 text-xs font-medium text-rose-700 border border-rose-200 rounded-lg cursor-pointer"
                  >
                    {t.admin.deleteGarage}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TRIPS & BOOKINGS (MONITORING, GPS DROP-OFFS & MODERATION) */}
      {tab === 'trips' && (
        <div className="space-y-8">
          {/* Bookings & Custom GPS Drop-Off Locations */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">{t.admin.bookingsWithGpsTitle}</h2>
            <div className="surface-card rounded-2xl overflow-x-auto">
              <table className="w-full text-sm text-start">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-start">{t.tables.passenger}</th>
                    <th className="px-4 py-3 text-start">{t.tables.driver}</th>
                    <th className="px-4 py-3 text-start">{t.tables.date}</th>
                    <th className="px-4 py-3 text-start">{t.admin.selectedSeatsCol}</th>
                    <th className="px-4 py-3 text-start">{t.admin.cargoCol}</th>
                    <th className="px-4 py-3 text-start">{t.admin.gpsDropOffCol}</th>
                    <th className="px-4 py-3 text-end">{t.tables.total}</th>
                    <th className="px-4 py-3 text-start">{t.tables.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                        {t.admin.emptyList}
                      </td>
                    </tr>
                  ) : (
                  allBookings.map((b) => {
                    const seatLabels =
                      b.selectedSeats && b.selectedSeats.length > 0
                        ? b.selectedSeats.map((s) => seatLabelMap[s] || s).join(' · ')
                        : `${b.seatsCount}`;
                    const depName = getLocalizedName(governorates.find((g) => g.id === b.departureGovId));
                    const dstName = getLocalizedName(governorates.find((g) => g.id === b.destinationGovId));
                    const hasGps =
                      Boolean(b.useCustomDropOff) &&
                      typeof b.customDropOffLat === 'number' &&
                      typeof b.customDropOffLng === 'number';
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 align-top">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{b.passengerName}</div>
                          {b.passengerPhone && (
                            <div className="text-xs font-mono text-slate-500">{b.passengerPhone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>{b.driverName || '-'}</div>
                          {(() => {
                            const bPlate = formatIraqiPlateDisplay(
                              b.vehiclePlate || b.plateDigits
                                ? b
                                : allTrips.find((tr) => tr.id === b.tripId),
                              lang
                            );
                            return bPlate ? (
                              <div
                                dir="ltr"
                                className="mt-1 inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-[#05203C] tabular-nums"
                              >
                                {bPlate}
                              </div>
                            ) : null;
                          })()}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {(depName || dstName) && (
                            <div className="font-semibold text-slate-800 mb-0.5">
                              {depName} → {dstName}
                            </div>
                          )}
                          <div className="font-mono text-slate-500 tabular-nums">
                            {b.departureDate} {b.departureTime}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-700">
                          {b.isFullCar && (
                            <div className="font-bold text-[#0770E3] mb-0.5">
                              {t.driver.fullCarBadge}
                            </div>
                          )}
                          <div>{seatLabels}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {b.includeCargo ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold">
                                <Package className="w-3 h-3" />
                                +{formatIqd(b.cargoFeeIqd || 0)}
                              </span>
                              {b.cargoNotes && <div className="text-slate-600">{b.cargoNotes}</div>}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {hasGps ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#0559B8] font-semibold">
                                <Navigation className="w-3 h-3" />
                                {t.booking.customDropOffBadge} (+{formatIqd(b.customDropOffFeeIqd || 10000)})
                              </span>
                              {b.customDropOffAddress && (
                                <div className="text-slate-600">{b.customDropOffAddress}</div>
                              )}
                              <div>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${b.customDropOffLat},${b.customDropOffLng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[#0770E3] font-semibold hover:underline"
                                >
                                  <span>{t.booking.openDriverNavLink}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">{t.admin.standardGarageDropOff}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-end font-mono tabular-nums">
                          {formatIqd(b.totalPriceIqd)}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                          {t.statuses[b.status]}
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver-Published Trips Moderation */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              {t.admin.driverTripsModerationTitle} ({allTrips.length})
            </h2>
            <div className="space-y-3">
              {allTrips.length === 0 ? (
                <div className="surface-card rounded-2xl p-8 text-center text-sm text-slate-500">
                  {t.admin.emptyList}
                </div>
              ) : (
              allTrips.map((tr) => {
                const depName = getLocalizedName(governorates.find((g) => g.id === tr.departureGovId));
                const dstName = getLocalizedName(governorates.find((g) => g.id === tr.destinationGovId));
                return (
                  <div
                    key={tr.id}
                    className="surface-card rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-[#0770E3]">{t.statuses[tr.status]}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          {tr.departureDate} {tr.departureTime}
                        </span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          {tr.availableSeats}/{tr.totalSeats} {t.tables.seats}
                        </span>
                        <span>·</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatIqd(tr.pricePerSeatIqd)}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {depName} → {dstName}
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                        <span>
                          {t.tables.driver}: <span className="font-semibold text-slate-800">{tr.driverName}</span>
                          {tr.vehicleModel ? ` · ${tr.vehicleModel}` : ''}
                        </span>
                        {formatIraqiPlateDisplay(tr, lang) && (
                          <span
                            dir="ltr"
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F7F9FB] border border-[#CBD5E1] font-mono font-bold text-[#05203C] tabular-nums"
                          >
                            {formatIraqiPlateDisplay(tr, lang)}
                          </span>
                        )}
                      </div>
                      {tr.notes && <p className="text-xs text-slate-500">{tr.notes}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {['scheduled', 'in_progress'].includes(tr.status) && (
                        <button
                          type="button"
                          onClick={async () => {
                            await updateTripStatus(tr.id, 'cancelled');
                            showToast(t.driver.savedSuccess);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer"
                        >
                          {t.driver.cancelTrip}
                        </button>
                      )}
                      {confirmDeleteTripId === tr.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteTrip(tr.id, firebaseUser?.uid || 'admin_2006', true, settings);
                              setConfirmDeleteTripId(null);
                              showToast(t.driver.savedSuccess);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 cursor-pointer"
                          >
                            {t.admin.deleteTripConfirm}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTripId(null)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl cursor-pointer"
                          >
                            {t.booking.cancel}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteTripId(tr.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t.driver.deleteTrip}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: CASH PAYMENTS */}
      {tab === 'payments' && (
        <div className="surface-card rounded-2xl overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3 text-start">{t.tables.booking}</th>
                <th className="px-4 py-3 text-end">{t.tables.amount}</th>
                <th className="px-4 py-3 text-end">{t.tables.commission}</th>
                <th className="px-4 py-3 text-start">{t.tables.status}</th>
                <th className="px-4 py-3 text-start">{t.tables.dispute}</th>
                <th className="px-4 py-3 text-end">{t.tables.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    {t.admin.emptyList}
                  </td>
                </tr>
              ) : (
                allPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs">{p.bookingId.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">
                      {formatIqd(p.amountIqd)}
                    </td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">
                      {formatIqd(p.commissionIqd)}
                    </td>
                    <td className="px-4 py-3">{t.statuses[p.status]}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.disputeReason || '-'}</td>
                    <td className="px-4 py-3 text-end space-x-2">
                      <button
                        type="button"
                        onClick={() => adminResolvePayment(p.id, 'paid', firebaseUser?.uid || 'admin_2006')}
                        className="px-2.5 py-1 text-xs font-semibold text-[#0770E3] border border-[#BFDBFE] rounded-lg cursor-pointer"
                      >
                        {t.admin.resolvePaymentPaid}
                      </button>
                      <button
                        type="button"
                        onClick={() => adminResolvePayment(p.id, 'refunded', firebaseUser?.uid || 'admin_2006')}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 rounded-lg cursor-pointer"
                      >
                        {t.admin.resolvePaymentRefunded}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: LOYALTY & COMMISSION SETTINGS */}
      {tab === 'loyalty' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await adminSavePlatformSettings(cfg);
              showToast(t.driver.savedSuccess);
            }}
            className="lg:col-span-7 surface-card rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">{t.admin.loyaltySettingsTitle}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.pointsPerTripLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  value={cfg.pointsPerTrip}
                  onChange={(e) => setCfg({ ...cfg, pointsPerTrip: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.freeTripCostLabel}
                </label>
                <input
                  type="number"
                  min={100}
                  value={cfg.freeTripCostPoints}
                  onChange={(e) => setCfg({ ...cfg, freeTripCostPoints: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.maxFreeValueLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={cfg.maxFreeTripValueIqd}
                  onChange={(e) => setCfg({ ...cfg, maxFreeTripValueIqd: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.commissionRateLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={cfg.commissionRatePercent}
                  onChange={(e) => setCfg({ ...cfg, commissionRatePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.refBonusReferrerLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  value={cfg.referralBonusReferrer}
                  onChange={(e) => setCfg({ ...cfg, referralBonusReferrer: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.refBonusRefereeLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  value={cfg.referralBonusReferee}
                  onChange={(e) => setCfg({ ...cfg, referralBonusReferee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.cancellationHoursLabel}
                </label>
                <input
                  type="number"
                  min={0}
                  value={cfg.cancellationHoursLimit}
                  onChange={(e) => setCfg({ ...cfg, cancellationHoursLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.supportPhoneLabel}
                </label>
                <input
                  type="text"
                  value={cfg.supportPhone || ''}
                  onChange={(e) => setCfg({ ...cfg, supportPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.admin.supportEmailLabel}
                </label>
                <input
                  type="email"
                  value={cfg.supportEmail || ''}
                  onChange={(e) => setCfg({ ...cfg, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0770E3] text-white text-sm font-semibold rounded-xl hover:bg-[#0559B8] cursor-pointer"
            >
              {t.admin.saveSettingsBtn}
            </button>
          </form>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await adminAdjustWalletPoints(adjUserId, adjDelta, adjReason, firebaseUser?.uid || 'admin_2006');
              setAdjReason('');
              showToast(t.driver.savedSuccess);
            }}
            className="lg:col-span-5 surface-card rounded-2xl p-6 space-y-4 h-fit"
          >
            <h3 className="text-base font-bold text-slate-900">{t.admin.manualPointsTitle}</h3>
            <select
              required
              value={adjUserId}
              onChange={(e) => setAdjUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
            >
              <option value="">{t.admin.selectUserId}</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName} ({t.roles[u.role]})
                </option>
              ))}
            </select>
            <input
              type="number"
              required
              placeholder={t.admin.pointsDelta}
              value={adjDelta}
              onChange={(e) => setAdjDelta(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl font-mono"
            />
            <input
              type="text"
              required
              placeholder={t.admin.pointsReason}
              value={adjReason}
              onChange={(e) => setAdjReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl cursor-pointer"
            >
              {t.admin.applyPointsBtn}
            </button>
          </form>
        </div>
      )}

      {/* TAB: COMPLAINTS & REVIEWS */}
      {tab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.passenger.myComplaints}</h3>
            {complaints.length === 0 ? (
              <p className="text-sm text-slate-500">{t.admin.emptyList}</p>
            ) : (
              complaints.map((c) => (
                <div key={c.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {c.userName} ({t.roles[c.userRole]})
                    </span>
                    <span className="font-semibold text-[#0770E3]">{t.statuses[c.status]}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{c.subject}</div>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  <input
                    type="text"
                    placeholder={t.admin.adminNotesPlaceholder}
                    value={complaintNotes[c.id] ?? c.adminNotes ?? ''}
                    onChange={(e) => setComplaintNotes({ ...complaintNotes, [c.id]: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        adminUpdateComplaint(c.id, 'resolved', complaintNotes[c.id] ?? c.adminNotes ?? '')
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-[#0770E3] text-white rounded-lg cursor-pointer"
                    >
                      {t.statuses.resolved}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        adminUpdateComplaint(c.id, 'dismissed', complaintNotes[c.id] ?? c.adminNotes ?? '')
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg cursor-pointer"
                    >
                      {t.statuses.dismissed}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.home.reviewsTitle}</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">{t.admin.emptyList}</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900">{r.passengerName}</span>
                    <span className="text-xs font-mono tabular-nums">
                      {r.driverRating}/5 ★ · {t.statuses[r.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{r.comment}</p>
                  <button
                    type="button"
                    onClick={() =>
                      adminSetReviewStatus(r.id, r.status === 'published' ? 'hidden' : 'published')
                    }
                    className="px-3 py-1 text-xs font-medium border border-slate-200 rounded-lg cursor-pointer"
                  >
                    {r.status === 'published' ? t.admin.hideReview : t.admin.publishReview}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ANIMATED DRIVER DOCUMENT INSPECTION MODAL */}
      <AnimatedModalShell
        isOpen={Boolean(inspectDriver)}
        onClose={() => setInspectDriver(null)}
        maxWidthClass="max-w-3xl"
      >
        {inspectDriver && (() => {
          const linkedUser = users.find((u) => u.uid === inspectDriver.uid);
          const drvGov = governorates.find((g) => g.id === inspectDriver.governorateId);
          const drvVehicles = vehicles.filter((v) => v.driverId === inspectDriver.uid);
          const pickSrc = (resolvedVal: string | undefined, ...fallbacks: Array<string | undefined>) => {
            if (resolvedVal) return resolvedVal;
            for (const f of fallbacks) {
              if (f && !isIndexedDbImageRef(f)) return f;
            }
            return '';
          };
          const portraitSrc = pickSrc(
            inspectDocs.portraitUrl,
            linkedUser?.portraitUrl,
            linkedUser?.photoUrl
          );
          const idFrontSrc = pickSrc(
            inspectDocs.idFrontUrl,
            inspectDriver.idFrontUrl,
            inspectDriver.idDocumentUrl,
            linkedUser?.idFrontUrl,
            linkedUser?.idDocumentUrl
          );
          const idBackSrc = pickSrc(
            inspectDocs.idBackUrl,
            inspectDriver.idBackUrl,
            linkedUser?.idBackUrl
          );
          const licFrontSrc = pickSrc(
            inspectDocs.licenseFrontUrl,
            inspectDriver.licenseFrontUrl,
            inspectDriver.licenseDocumentUrl,
            linkedUser?.licenseFrontUrl,
            linkedUser?.licenseDocumentUrl
          );
          const licBackSrc = pickSrc(
            inspectDocs.licenseBackUrl,
            inspectDriver.licenseBackUrl,
            linkedUser?.licenseBackUrl
          );

          const renderDocThumb = (src: string, label: string) => (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#05203C]">{label}</div>
              {src ? (
                <button
                  type="button"
                  onClick={() => setZoomedPhoto({ url: src, title: label })}
                  className="group relative block w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer"
                >
                  <img
                    src={src}
                    alt={label}
                    className="w-full h-44 object-contain bg-white"
                  />
                  <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#05203C]/80 text-white text-[11px] font-medium opacity-90 group-hover:opacity-100">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </button>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  {t.common.noImageUploaded}
                </div>
              )}
            </div>
          );

          return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto shadow-[var(--shadow-elevated)]">
              <button
                type="button"
                onClick={() => setInspectDriver(null)}
                aria-label={t.common.close}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 absolute top-4 end-4 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 pe-10">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-[#05203C]">{inspectDriver.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#0559B8] border border-[#BFDBFE]">
                    {t.roles.driver}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                    {t.statuses[inspectDriver.verificationStatus]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {drvGov && <span>{getLocalizedName(drvGov)}</span>}
                  <span className="font-mono" dir="ltr">
                    {inspectDriver.phone || inspectPrivateInfo?.phone}
                  </span>
                  {inspectPrivateInfo?.email && (
                    <span className="font-mono" dir="ltr">
                      {inspectPrivateInfo.email}
                    </span>
                  )}
                  {(drvVehicles[0]?.makeModel || linkedUser?.vehicleModel) && (
                    <span>{drvVehicles[0]?.makeModel || linkedUser?.vehicleModel}</span>
                  )}
                  {formatIraqiPlateDisplay(drvVehicles[0] || linkedUser, lang) && (
                    <span
                      dir="ltr"
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] font-mono font-bold text-[#05203C] tabular-nums"
                    >
                      {formatIraqiPlateDisplay(drvVehicles[0] || linkedUser, lang)}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Portrait */}
              {renderDocThumb(portraitSrc, t.auth.portraitPhoto)}

              {/* Grouped National ID: Front & Back */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#05203C]">{t.auth.idGroupLabel}</span>
                  <span className="text-[11px] font-semibold text-[#0770E3]">
                    {t.auth.frontSideLabel} + {t.auth.backSideLabel}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderDocThumb(idFrontSrc, t.auth.idFrontPhoto)}
                  {renderDocThumb(idBackSrc, t.auth.idBackPhoto)}
                </div>
              </div>

              {/* Grouped Driving License: Front & Back */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#05203C]">{t.auth.licenseGroupLabel}</span>
                  <span className="text-[11px] font-semibold text-[#0770E3]">
                    {t.auth.frontSideLabel} + {t.auth.backSideLabel}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {renderDocThumb(licFrontSrc, t.auth.licenseFrontPhoto)}
                  {renderDocThumb(licBackSrc, t.auth.licenseBackPhoto)}
                </div>
              </div>

              <input
                type="text"
                placeholder={t.driver.rejectReason}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await adminSetDriverVerification(inspectDriver.uid, 'rejected', rejectReason);
                      setInspectDriver(null);
                      setRejectReason('');
                      showToast(t.driver.savedSuccess);
                    } catch (err) {
                      const d = extractErrorDetails(err);
                      showToast(`${t.errors.generic} [${d.code}] ${d.message}`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                >
                  {t.admin.rejectDriver}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await adminSetDriverVerification(inspectDriver.uid, 'approved');
                      setInspectDriver(null);
                      setRejectReason('');
                      showToast(t.driver.savedSuccess);
                    } catch (err) {
                      const d = extractErrorDetails(err);
                      showToast(`${t.errors.generic} [${d.code}] ${d.message}`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                >
                  {t.admin.approveDriver}
                </button>
              </div>
            </div>
          );
        })()}
      </AnimatedModalShell>

      {/* ANIMATED PASSENGER/USER VERIFICATION MODAL */}
      <AnimatedModalShell
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        maxWidthClass="max-w-3xl"
      >
        {inspectUser && (() => {
          const linkedDriver = drivers.find((d) => d.uid === inspectUser.uid);
          const usrGov = governorates.find((g) => g.id === inspectUser.governorateId);
          const isDriverAccount = inspectUser.role === 'driver' || Boolean(linkedDriver);
          const pickSrc = (resolvedVal: string | undefined, ...fallbacks: Array<string | undefined>) => {
            if (resolvedVal) return resolvedVal;
            for (const f of fallbacks) {
              if (f && !isIndexedDbImageRef(f)) return f;
            }
            return '';
          };
          const portraitSrc = pickSrc(
            inspectDocs.portraitUrl,
            inspectUser.portraitUrl,
            inspectUser.photoUrl
          );
          const idFrontSrc = pickSrc(
            inspectDocs.idFrontUrl,
            inspectUser.idFrontUrl,
            inspectUser.idDocumentUrl,
            linkedDriver?.idFrontUrl,
            linkedDriver?.idDocumentUrl
          );
          const idBackSrc = pickSrc(
            inspectDocs.idBackUrl,
            inspectUser.idBackUrl,
            linkedDriver?.idBackUrl
          );
          const licFrontSrc = pickSrc(
            inspectDocs.licenseFrontUrl,
            inspectUser.licenseFrontUrl,
            inspectUser.licenseDocumentUrl,
            linkedDriver?.licenseFrontUrl,
            linkedDriver?.licenseDocumentUrl
          );
          const licBackSrc = pickSrc(
            inspectDocs.licenseBackUrl,
            inspectUser.licenseBackUrl,
            linkedDriver?.licenseBackUrl
          );

          const renderUserDocThumb = (src: string, label: string) => (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#05203C]">{label}</div>
              {src ? (
                <button
                  type="button"
                  onClick={() => setZoomedPhoto({ url: src, title: label })}
                  className="group relative block w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden cursor-pointer"
                >
                  <img
                    src={src}
                    alt={label}
                    className="w-full h-44 object-contain bg-white"
                  />
                  <span className="absolute bottom-2 end-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#05203C]/80 text-white text-[11px] font-medium opacity-90 group-hover:opacity-100">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </span>
                </button>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  {t.common.noImageUploaded}
                </div>
              )}
            </div>
          );

          return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto shadow-[var(--shadow-elevated)]">
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                aria-label={t.common.close}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 absolute top-4 end-4 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 pe-10">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-[#05203C]">{inspectUser.displayName}</h3>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FF] text-[#0559B8] border border-[#BFDBFE]">
                    {t.roles[inspectUser.role]}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                    {inspectUser.verificationStatus === 'approved'
                      ? t.auth.verifiedStatus
                      : inspectUser.verificationStatus === 'rejected'
                      ? t.auth.rejectedStatus
                      : t.auth.pendingReview}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {usrGov && <span>{getLocalizedName(usrGov)}</span>}
                  {(inspectPrivateInfo?.phone || linkedDriver?.phone) && (
                    <span className="font-mono" dir="ltr">
                      {inspectPrivateInfo?.phone || linkedDriver?.phone}
                    </span>
                  )}
                  {inspectPrivateInfo?.email && (
                    <span className="font-mono" dir="ltr">
                      {inspectPrivateInfo.email}
                    </span>
                  )}
                  <span className="font-mono">{inspectUser.referralCode}</span>
                  {(inspectUser.vehicleModel ||
                    formatIraqiPlateDisplay(
                      inspectUser.plateNumber || inspectUser.plateDigits
                        ? inspectUser
                        : vehicles.find((v) => v.driverId === inspectUser.uid),
                      lang
                    )) && (
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      {inspectUser.vehicleModel && <span>{inspectUser.vehicleModel}</span>}
                      {formatIraqiPlateDisplay(
                        inspectUser.plateNumber || inspectUser.plateDigits
                          ? inspectUser
                          : vehicles.find((v) => v.driverId === inspectUser.uid),
                        lang
                      ) && (
                        <span
                          dir="ltr"
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] font-mono font-bold text-[#05203C] tabular-nums"
                        >
                          {formatIraqiPlateDisplay(
                            inspectUser.plateNumber || inspectUser.plateDigits
                              ? inspectUser
                              : vehicles.find((v) => v.driverId === inspectUser.uid),
                            lang
                          )}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Personal Portrait */}
              {renderUserDocThumb(portraitSrc, t.auth.portraitPhoto)}

              {/* Driver Front & Back ID + License Sections */}
              {isDriverAccount ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#05203C]">{t.auth.idGroupLabel}</span>
                      <span className="text-[11px] font-semibold text-[#0770E3]">
                        {t.auth.frontSideLabel} + {t.auth.backSideLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderUserDocThumb(idFrontSrc, t.auth.idFrontPhoto)}
                      {renderUserDocThumb(idBackSrc, t.auth.idBackPhoto)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#05203C]">{t.auth.licenseGroupLabel}</span>
                      <span className="text-[11px] font-semibold text-[#0770E3]">
                        {t.auth.frontSideLabel} + {t.auth.backSideLabel}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {renderUserDocThumb(licFrontSrc, t.auth.licenseFrontPhoto)}
                      {renderUserDocThumb(licBackSrc, t.auth.licenseBackPhoto)}
                    </div>
                  </div>
                </div>
              ) : (
                idFrontSrc && renderUserDocThumb(idFrontSrc, t.auth.idCardPhoto)
              )}

              <input
                type="text"
                placeholder={t.driver.rejectReason}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await adminSetUserVerification(inspectUser.uid, 'rejected', rejectReason);
                      setInspectUser(null);
                      setRejectReason('');
                      showToast(t.driver.savedSuccess);
                    } catch (err) {
                      const d = extractErrorDetails(err);
                      showToast(`${t.errors.generic} [${d.code}] ${d.message}`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"
                >
                  {t.admin.rejectDriver}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await adminSetUserVerification(inspectUser.uid, 'approved');
                      setInspectUser(null);
                      setRejectReason('');
                      showToast(t.driver.savedSuccess);
                    } catch (err) {
                      const d = extractErrorDetails(err);
                      showToast(`${t.errors.generic} [${d.code}] ${d.message}`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl hover:bg-[#0559B8] cursor-pointer"
                >
                  {t.admin.approveDriver}
                </button>
              </div>
            </div>
          );
        })()}
      </AnimatedModalShell>

      {/* FULL-SCREEN DOCUMENT ZOOM LIGHTBOX */}
      {zoomedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#05203C] text-white">
              <span className="text-sm font-bold">{zoomedPhoto.title}</span>
              <button
                type="button"
                onClick={() => setZoomedPhoto(null)}
                aria-label={t.common.close}
                className="p-1.5 rounded-lg hover:bg-white/15 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[80vh]">
              <img
                src={zoomedPhoto.url}
                alt={zoomedPhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

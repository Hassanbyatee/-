import React, { useMemo, useState } from 'react';
import {
  Award,
  Banknote,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  Database,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import {
  adminAdjustWalletPoints,
  adminDeleteGarage,
  adminResolvePayment,
  adminSaveGarage,
  adminSavePlatformSettings,
  adminSendNotification,
  adminSetDriverVerification,
  adminSetReviewStatus,
  adminSetUserVerification,
  adminUpdateComplaint,
  adminUpdateUserStatus,
  seedIraqReferenceData,
} from '../services/platformService';
import { AnimatedModalShell } from './motion/KineticPrimitives';
import type {
  Booking,
  Complaint,
  DriverProfile,
  Payment,
  PlatformSettings,
  Review,
  Trip,
  UserProfile,
  Vehicle,
} from '../types/domain';

type AdminTab =
  | 'overview'
  | 'drivers'
  | 'users'
  | 'geography'
  | 'trips'
  | 'payments'
  | 'loyalty'
  | 'moderation';

export const AdminDashboard: React.FC = () => {
  const { getLocalizedName, formatIqd, t } = useI18n();
  const { firebaseUser, isAdmin, governorates, garages, settings } = useAuth();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [inspectDriver, setInspectDriver] = useState<DriverProfile | null>(null);
  const [inspectUser, setInspectUser] = useState<UserProfile | null>(null);
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
  const [feedback, setFeedback] = useState<string>('');

  React.useEffect(() => {
    setCfg(settings);
  }, [settings]);

  React.useEffect(() => {
    if (!isAdmin) return;
    const unsubs = [
      onSnapshot(
        collection(db, 'users'),
        (s) => setUsers(s.docs.map((d) => d.data() as UserProfile)),
        (err) => handleFirestoreError(err, OperationType.LIST, 'users')
      ),
      onSnapshot(
        collection(db, 'drivers'),
        (s) => setDrivers(s.docs.map((d) => d.data() as DriverProfile)),
        (err) => handleFirestoreError(err, OperationType.LIST, 'drivers')
      ),
      onSnapshot(
        collection(db, 'vehicles'),
        (s) => setVehicles(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Vehicle, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'vehicles')
      ),
      onSnapshot(
        collection(db, 'trips'),
        (s) => setAllTrips(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'trips')
      ),
      onSnapshot(
        collection(db, 'bookings'),
        (s) => setAllBookings(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')
      ),
      onSnapshot(
        collection(db, 'payments'),
        (s) => setAllPayments(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'payments')
      ),
      onSnapshot(
        collection(db, 'complaints'),
        (s) => setComplaints(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Complaint, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'complaints')
      ),
      onSnapshot(
        collection(db, 'reviews'),
        (s) => setReviews(s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }))),
        (err) => handleFirestoreError(err, OperationType.LIST, 'reviews')
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [isAdmin]);

  const stats = useMemo(() => {
    const gmv = allPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amountIqd, 0);
    const commission = allPayments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.commissionIqd, 0);
    const pendingDrivers = drivers.filter((d) => d.verificationStatus === 'pending').length;
    const activeTrips = allTrips.filter((tr) => ['scheduled', 'in_progress'].includes(tr.status)).length;
    return { gmv, commission, pendingDrivers, activeTrips };
  }, [allPayments, drivers, allTrips]);

  if (!isAdmin || !firebaseUser) {
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
    { id: 'users', label: t.admin.tabUsers, icon: <Users className="w-4 h-4" /> },
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
            await seedIraqReferenceData(true);
            showToast(t.admin.seedDone);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>{t.admin.seedIraqDataBtn}</span>
        </button>
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          {drivers.map((drv) => {
            const gov = governorates.find((g) => g.id === drv.governorateId);
            const drvVehicles = vehicles.filter((v) => v.driverId === drv.uid);
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
                  <div className="text-xs text-slate-600 font-mono">
                    {t.common.idLabel}: {drv.nationalIdNumber} · {t.common.licenseLabel}: {drv.licenseNumber}
                    {drvVehicles[0] ? ` · ${drvVehicles[0].makeModel} (${drvVehicles[0].plateNumber})` : ''}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectDriver(drv)}
                    className="px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    {t.admin.viewDocuments}
                  </button>
                  {drv.verificationStatus !== 'approved' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await adminSetDriverVerification(drv.uid, 'approved');
                        showToast(t.driver.savedSuccess);
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
                        await adminSetDriverVerification(drv.uid, 'suspended', t.statuses.suspended);
                        showToast(t.driver.savedSuccess);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer"
                    >
                      {t.admin.suspendDriver}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{u.displayName}</div>
                    <div className="font-mono text-xs text-slate-500">{u.uid.slice(0, 10)}</div>
                  </td>
                  <td className="px-4 py-3">{t.roles[u.role]}</td>
                  <td className="px-4 py-3">
                    <div>{t.statuses[u.accountStatus]}</div>
                    <div className="text-[11px] font-semibold text-[#0770E3]">
                      {u.verificationStatus === 'approved'
                        ? t.auth.verifiedStatus
                        : u.verificationStatus === 'rejected'
                        ? t.auth.rejectedStatus
                        : t.auth.pendingReview}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.referralCode}</td>
                  <td className="px-4 py-3 text-end space-x-2">
                    {(u.idDocumentUrl || u.portraitUrl) && (
                      <button
                        type="button"
                        onClick={() => setInspectUser(u)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                      >
                        {t.admin.viewDocuments}
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
                    {u.accountStatus === 'active' && u.uid !== firebaseUser.uid && (
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
                  </td>
                </tr>
              ))}
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

      {/* TAB: TRIPS & BOOKINGS */}
      {tab === 'trips' && (
        <div className="space-y-6">
          <div className="surface-card rounded-2xl overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-start">{t.tables.passenger}</th>
                  <th className="px-4 py-3 text-start">{t.tables.driver}</th>
                  <th className="px-4 py-3 text-start">{t.tables.date}</th>
                  <th className="px-4 py-3 text-end">{t.tables.seats}</th>
                  <th className="px-4 py-3 text-end">{t.tables.total}</th>
                  <th className="px-4 py-3 text-start">{t.tables.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">{b.passengerName}</td>
                    <td className="px-4 py-3">{b.driverName}</td>
                    <td className="px-4 py-3 font-mono text-xs tabular-nums">
                      {b.departureDate} {b.departureTime}
                    </td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">{b.seatsCount}</td>
                    <td className="px-4 py-3 text-end font-mono tabular-nums">
                      {formatIqd(b.totalPriceIqd)}
                    </td>
                    <td className="px-4 py-3">{t.statuses[b.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {allPayments.map((p) => (
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
                      onClick={() => adminResolvePayment(p.id, 'paid', firebaseUser.uid)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0770E3] border border-[#BFDBFE] rounded-lg cursor-pointer"
                    >
                      {t.admin.resolvePaymentPaid}
                    </button>
                    <button
                      type="button"
                      onClick={() => adminResolvePayment(p.id, 'refunded', firebaseUser.uid)}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 rounded-lg cursor-pointer"
                    >
                      {t.admin.resolvePaymentRefunded}
                    </button>
                  </td>
                </tr>
              ))}
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
              await adminAdjustWalletPoints(adjUserId, adjDelta, adjReason, firebaseUser.uid);
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
            {complaints.map((c) => (
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
            ))}
          </div>

          <div className="surface-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.home.reviewsTitle}</h3>
            {reviews.map((r) => (
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
            ))}
          </div>
        </div>
      )}

      {/* ANIMATED DRIVER DOCUMENT INSPECTION MODAL */}
      <AnimatedModalShell
        isOpen={Boolean(inspectDriver)}
        onClose={() => setInspectDriver(null)}
        maxWidthClass="max-w-2xl"
      >
        {inspectDriver && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 relative shadow-[var(--shadow-elevated)]">
            <button
              type="button"
              onClick={() => setInspectDriver(null)}
              aria-label={t.common.close}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 absolute top-4 end-4 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">{inspectDriver.fullName}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-semibold mb-1">{t.auth.idCardPhoto}</div>
                {inspectDriver.idDocumentUrl ? (
                  <img
                    src={inspectDriver.idDocumentUrl}
                    alt={t.auth.idCardPhoto}
                    className="rounded-xl border max-h-48 object-contain"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-slate-500">
                    {t.common.noImageUploaded}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-1">{t.auth.portraitPhoto}</div>
                {users.find((u) => u.uid === inspectDriver.uid)?.portraitUrl ? (
                  <img
                    src={users.find((u) => u.uid === inspectDriver.uid)?.portraitUrl}
                    alt={t.auth.portraitPhoto}
                    className="rounded-xl border max-h-48 object-contain"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-slate-500">
                    {t.common.noImageUploaded}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-1">{t.auth.drivingLicensePhoto}</div>
                {inspectDriver.licenseDocumentUrl ? (
                  <img
                    src={inspectDriver.licenseDocumentUrl}
                    alt={t.auth.drivingLicensePhoto}
                    className="rounded-xl border max-h-48 object-contain"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-slate-500">
                    {t.common.noImageUploaded}
                  </div>
                )}
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
                  await adminSetDriverVerification(inspectDriver.uid, 'rejected', rejectReason);
                  setInspectDriver(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl cursor-pointer"
              >
                {t.admin.rejectDriver}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminSetDriverVerification(inspectDriver.uid, 'approved');
                  setInspectDriver(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl cursor-pointer"
              >
                {t.admin.approveDriver}
              </button>
            </div>
          </div>
        )}
      </AnimatedModalShell>

      {/* ANIMATED PASSENGER/USER VERIFICATION MODAL */}
      <AnimatedModalShell
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        maxWidthClass="max-w-xl"
      >
        {inspectUser && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 relative shadow-[var(--shadow-elevated)]">
            <button
              type="button"
              onClick={() => setInspectUser(null)}
              aria-label={t.common.close}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 absolute top-4 end-4 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900">{inspectUser.displayName}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-semibold mb-1">{t.auth.idCardPhoto}</div>
                {inspectUser.idDocumentUrl ? (
                  <img
                    src={inspectUser.idDocumentUrl}
                    alt={t.auth.idCardPhoto}
                    className="rounded-xl border max-h-48 object-contain"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-slate-500">
                    {t.common.noImageUploaded}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-1">{t.auth.portraitPhoto}</div>
                {inspectUser.portraitUrl ? (
                  <img
                    src={inspectUser.portraitUrl}
                    alt={t.auth.portraitPhoto}
                    className="rounded-xl border max-h-48 object-contain"
                  />
                ) : (
                  <div className="p-6 bg-slate-50 rounded-xl text-slate-500">
                    {t.common.noImageUploaded}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  await adminSetUserVerification(inspectUser.uid, 'rejected');
                  setInspectUser(null);
                  showToast(t.driver.savedSuccess);
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-700 border border-rose-200 rounded-xl cursor-pointer"
              >
                {t.admin.rejectDriver}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await adminSetUserVerification(inspectUser.uid, 'approved');
                  setInspectUser(null);
                  showToast(t.driver.savedSuccess);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#0770E3] text-white rounded-xl cursor-pointer"
              >
                {t.admin.approveDriver}
              </button>
            </div>
          </div>
        )}
      </AnimatedModalShell>
    </div>
  );
};

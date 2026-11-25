import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Car,
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { uploadVerificationImage } from '../services/imageUtils';
import { registerUserProfile } from '../services/platformService';
import { AnimatedModalShell } from './motion/KineticPrimitives';
import type { UserRole } from '../types/domain';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onCompleted?: (role: UserRole) => void;
}

interface SelectedPhoto {
  file: File;
  previewUrl: string;
}

interface PhotoUploadCardProps {
  label: string;
  requiredLabel: string;
  tapToUploadLabel: string;
  replaceLabel: string;
  removeLabel: string;
  photo: SelectedPhoto | null;
  disabled?: boolean;
  onSelect: (file: File | undefined) => void;
  onRemove: () => void;
}

const PhotoUploadCard: React.FC<PhotoUploadCardProps> = ({
  label,
  requiredLabel,
  tapToUploadLabel,
  replaceLabel,
  removeLabel,
  photo,
  disabled,
  onSelect,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={`rounded-xl border transition-colors overflow-hidden ${
        photo
          ? 'border-[#0770E3] bg-[#EFF6FF]/40'
          : 'border-dashed border-[#CBD5E1] bg-slate-50/70 hover:border-[#0770E3]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          onSelect(picked);
          e.target.value = '';
        }}
      />

      {photo ? (
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#05203C] truncate">
              <CheckCircle2 className="w-4 h-4 text-[#0770E3] shrink-0" />
              <span className="truncate">{label}</span>
            </div>
            <span className="text-[11px] font-semibold text-[#0770E3] shrink-0">
              {requiredLabel}
            </span>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white h-28">
            <img
              src={photo.previewUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 truncate font-mono">
              {photo.file.name}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#05203C] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{replaceLabel}</span>
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={onRemove}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>{removeLabel}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="w-full p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0770E3]">
            <Camera className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#05203C] flex items-center justify-center gap-1.5">
              <span>{label}</span>
              <span className="text-[11px] font-semibold text-rose-600">*</span>
            </div>
            <div className="text-[11px] text-slate-500">{tapToUploadLabel}</div>
          </div>
        </button>
      )}
    </div>
  );
};

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  initialRole = 'passenger',
  onClose,
  onCompleted,
}) => {
  const { lang, t, getLocalizedName } = useI18n();
  const {
    firebaseUser,
    userProfile,
    profileLoaded,
    needsOnboarding,
    governorates,
    garages,
    signInWithGoogle,
    logout,
  } = useAuth();

  const [role, setRole] = useState<UserRole>(initialRole);

  // Onboarding inputs
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorateId, setGovernorateId] = useState('bgw');
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Driver vehicle inputs
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  // Verification photo files (2 for passenger, 3 for driver)
  const [idPhoto, setIdPhoto] = useState<SelectedPhoto | null>(null);
  const [portraitPhoto, setPortraitPhoto] = useState<SelectedPhoto | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<SelectedPhoto | null>(null);

  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<'' | 'signingIn' | 'uploading' | 'saving'>('');
  const [errorMsg, setErrorMsg] = useState('');

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isOpen && !isSubmittingRef.current) {
      setRole(initialRole === 'driver' ? 'driver' : 'passenger');
      setErrorMsg('');
    }
  }, [isOpen, initialRole]);

  // Pre-fill full name from Google profile
  useEffect(() => {
    if (firebaseUser?.displayName && !displayName) {
      setDisplayName(firebaseUser.displayName);
    }
  }, [firebaseUser, displayName]);

  // If existing user signs in via Google and already has Firestore profile, log them straight in
  useEffect(() => {
    if (
      isOpen &&
      firebaseUser &&
      profileLoaded &&
      userProfile &&
      !needsOnboarding &&
      !isSubmittingRef.current
    ) {
      onClose();
    }
  }, [isOpen, firebaseUser, profileLoaded, userProfile, needsOnboarding, onClose]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) setReferralCodeInput(refParam.toUpperCase());
  }, []);

  // Revoke object URLs on unmount/change
  useEffect(() => {
    return () => {
      if (idPhoto?.previewUrl) URL.revokeObjectURL(idPhoto.previewUrl);
      if (portraitPhoto?.previewUrl) URL.revokeObjectURL(portraitPhoto.previewUrl);
      if (licensePhoto?.previewUrl) URL.revokeObjectURL(licensePhoto.previewUrl);
    };
  }, [idPhoto, portraitPhoto, licensePhoto]);

  const setPhotoState = (
    file: File | undefined,
    prev: SelectedPhoto | null,
    setter: React.Dispatch<React.SetStateAction<SelectedPhoto | null>>
  ) => {
    setErrorMsg('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg(t.errors.invalidImageFile);
      return;
    }
    if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
    setter({ file, previewUrl: URL.createObjectURL(file) });
  };

  const clearPhotoState = (
    prev: SelectedPhoto | null,
    setter: React.Dispatch<React.SetStateAction<SelectedPhoto | null>>
  ) => {
    if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
    setter(null);
  };

  const visible = isOpen || needsOnboarding;
  const govGarages = useMemo(
    () => garages.filter((g) => g.governorateId === governorateId),
    [garages, governorateId]
  );

  const mapFirebaseError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : '';

    if (msg === 'INVALID_REFERRAL_CODE') return t.auth.invalidReferralCode;
    if (msg === 'SELF_REFERRAL_BLOCKED') return t.auth.selfReferralBlocked;
    if (msg === 'INVALID_IMAGE_FILE') return t.errors.invalidImageFile;

    switch (code) {
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return t.errors.authPopupClosed;
      case 'storage/unauthorized':
      case 'storage/unauthenticated':
        return t.errors.storageUnauthorized;
      default:
        return t.errors.generic;
    }
  };

  const hasCommonFields =
    displayName.trim().length >= 2 &&
    phone.trim().length >= 7 &&
    governorateId.trim().length > 0;

  const canSubmitOnboarding = useMemo(() => {
    if (!firebaseUser || !hasCommonFields) return false;
    if (role === 'passenger') {
      return Boolean(idPhoto && portraitPhoto);
    }
    return (
      vehicleModel.trim().length >= 2 &&
      plateNumber.trim().length >= 2 &&
      Boolean(idPhoto && portraitPhoto && licensePhoto)
    );
  }, [
    firebaseUser,
    hasCommonFields,
    role,
    idPhoto,
    portraitPhoto,
    licensePhoto,
    vehicleModel,
    plateNumber,
  ]);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    setProgressStep('signingIn');
    try {
      await signInWithGoogle();
      // AuthContext listener inspects users/{uid}:
      // - If profile exists, useEffect above logs user straight into app & closes modal.
      // - If new user, needsOnboarding becomes true and shows Complete Profile step.
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      setLoading(false);
      setProgressStep('');
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!canSubmitOnboarding) {
      setErrorMsg(t.auth.missingRequiredFields);
      return;
    }

    setErrorMsg('');
    setLoading(true);
    isSubmittingRef.current = true;

    try {
      const uid = firebaseUser.uid;
      const timestamp = Date.now();
      let uploadedIdUrl = '';
      let uploadedPortraitUrl = '';
      let uploadedLicenseUrl = '';

      setProgressStep('uploading');
      const folder = role === 'driver' ? 'drivers' : 'passengers';
      const uploadTasks: Promise<void>[] = [];

      if (idPhoto) {
        uploadTasks.push(
          uploadVerificationImage(
            idPhoto.file,
            `verifications/${folder}/${uid}/id_card_${timestamp}.jpg`
          ).then((url) => {
            uploadedIdUrl = url;
          })
        );
      }

      if (portraitPhoto) {
        uploadTasks.push(
          uploadVerificationImage(
            portraitPhoto.file,
            `verifications/${folder}/${uid}/portrait_${timestamp}.jpg`
          ).then((url) => {
            uploadedPortraitUrl = url;
          })
        );
      }

      if (role === 'driver' && licensePhoto) {
        uploadTasks.push(
          uploadVerificationImage(
            licensePhoto.file,
            `verifications/drivers/${uid}/driving_license_${timestamp}.jpg`
          ).then((url) => {
            uploadedLicenseUrl = url;
          })
        );
      }

      await Promise.all(uploadTasks);

      setProgressStep('saving');
      await registerUserProfile({
        uid,
        email: firebaseUser.email || '',
        displayName,
        phone,
        role: role === 'driver' ? 'driver' : 'passenger',
        preferredLanguage: lang,
        governorateId,
        verificationStatus: 'pending',
        photoUrl: uploadedPortraitUrl || firebaseUser.photoURL || '',
        portraitUrl: uploadedPortraitUrl,
        idDocumentUrl: uploadedIdUrl,
        licenseDocumentUrl: uploadedLicenseUrl,
        referralCodeInput,
        homeGarageId: govGarages[0]?.id || garages[0]?.id || '',
        vehicleModel: role === 'driver' ? vehicleModel : '',
        plateNumber: role === 'driver' ? plateNumber : '',
      });

      onCompleted?.(role);
      onClose();
    } catch (err) {
      setErrorMsg(mapFirebaseError(err));
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
      setProgressStep('');
    }
  };

  const progressText =
    progressStep === 'uploading'
      ? t.auth.uploadingPhotos
      : progressStep === 'saving'
      ? t.auth.savingProfile
      : progressStep === 'signingIn'
      ? t.auth.signingIn
      : t.auth.submitting;

  return (
    <AnimatedModalShell
      isOpen={visible}
      onClose={needsOnboarding ? undefined : onClose}
      maxWidthClass="max-w-2xl"
    >
      <div className="bg-white border border-[#E0E4E8] rounded-2xl overflow-hidden relative max-h-[92vh] flex flex-col shadow-[var(--shadow-elevated)]">
        {/* Top Navy Accent Header */}
        <div className="bg-[#05203C] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#60A5FA] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-snug">
                {!firebaseUser
                  ? t.auth.welcomeTitle
                  : !profileLoaded
                  ? t.auth.checkingAccount
                  : t.auth.completeProfileTitle}
              </h2>
              <p className="text-xs text-white/75 mt-0.5">
                {!firebaseUser || !profileLoaded ? t.brand : t.auth.completeProfileSub}
              </p>
            </div>
          </div>

          {!needsOnboarding ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="p-2 rounded-xl text-white/75 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs font-semibold text-white/85 hover:text-white underline shrink-0 cursor-pointer"
            >
              {t.nav.signOut}
            </button>
          )}
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto space-y-5">
          {!firebaseUser ? (
            /* STEP 1: GOOGLE SIGN-IN ONLY WITH ROLE INTENT SELECTION */
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#0770E3] flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-[#05203C]">{t.auth.welcomeTitle}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{t.auth.welcomeSub}</p>
              </div>

              <div className="max-w-md mx-auto text-start space-y-2">
                <label className="block text-xs font-bold text-[#05203C]">{t.auth.chooseRole}</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRole('passenger')}
                    className={`btn-tactile p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      role === 'passenger'
                        ? 'border-[#0770E3] bg-[#EFF6FF]/80 ring-1 ring-[#0770E3]'
                        : 'border-[#E0E4E8] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#05203C]">
                      <UserCheck
                        className={`w-4 h-4 ${role === 'passenger' ? 'text-[#0770E3]' : 'text-slate-500'}`}
                      />
                      <span>{t.auth.rolePassenger}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setRole('driver')}
                    className={`btn-tactile p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      role === 'driver'
                        ? 'border-[#0770E3] bg-[#EFF6FF]/80 ring-1 ring-[#0770E3]'
                        : 'border-[#E0E4E8] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#05203C]">
                      <Car
                        className={`w-4 h-4 ${role === 'driver' ? 'text-[#0770E3]' : 'text-slate-500'}`}
                      />
                      <span>{t.auth.roleDriver}</span>
                    </div>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 text-start text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-tactile w-full sm:w-auto min-w-[270px] h-12 inline-flex items-center justify-center gap-3 px-6 bg-[#0770E3] hover:bg-[#0559B8] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                  </span>
                )}
                <span>{loading ? progressText : t.auth.continueGoogle}</span>
              </button>
            </div>
          ) : !profileLoaded || !needsOnboarding ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-600">
              <Loader2 className="w-7 h-7 animate-spin text-[#0770E3]" />
              <p className="text-sm font-medium">{t.auth.checkingAccount}</p>
            </div>
          ) : (
            /* STEP 2: COMPLETE PROFILE (FIRST-TIME GOOGLE USER) */
            <form onSubmit={handleSubmitProfile} className="space-y-5">
              {/* Role Tabs: Passenger vs Driver */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#05203C]">{t.auth.chooseRole}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setRole('passenger');
                      setErrorMsg('');
                    }}
                    className={`btn-tactile p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                      role === 'passenger'
                        ? 'border-[#0770E3] bg-[#EFF6FF]/70 ring-1 ring-[#0770E3]'
                        : 'border-[#E0E4E8] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-[#05203C]">
                      <UserCheck
                        className={`w-4 h-4 ${role === 'passenger' ? 'text-[#0770E3]' : 'text-slate-500'}`}
                      />
                      <span>{t.auth.rolePassenger}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.auth.rolePassengerDesc}</p>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setRole('driver');
                      setErrorMsg('');
                    }}
                    className={`btn-tactile p-3.5 rounded-xl border text-start transition-all cursor-pointer ${
                      role === 'driver'
                        ? 'border-[#0770E3] bg-[#EFF6FF]/70 ring-1 ring-[#0770E3]'
                        : 'border-[#E0E4E8] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-[#05203C]">
                      <Car
                        className={`w-4 h-4 ${role === 'driver' ? 'text-[#0770E3]' : 'text-slate-500'}`}
                      />
                      <span>{t.auth.roleDriver}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.auth.roleDriverDesc}</p>
                  </button>
                </div>
              </div>

              {/* Pre-filled Google Name, Iraqi Phone (No OTP), Governorate & Referral */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#05203C] mb-1.5">
                    {t.auth.fullName} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    disabled={loading}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0770E3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#05203C] mb-1.5">
                    {t.auth.phone} <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      minLength={7}
                      maxLength={24}
                      dir="ltr"
                      disabled={loading}
                      placeholder={t.auth.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 ps-10 pe-3.5 text-sm border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0770E3] font-mono tabular-nums text-start"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{t.auth.noOtpNote}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#05203C] mb-1.5">
                    {t.auth.governorate} <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={governorateId}
                    disabled={loading}
                    onChange={(e) => setGovernorateId(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm border border-[#CBD5E1] rounded-xl bg-white focus:outline-none focus:border-[#0770E3]"
                  >
                    {governorates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {getLocalizedName(g)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#05203C] mb-1.5">
                    {t.auth.referralCodeOptional}
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    dir="ltr"
                    disabled={loading}
                    placeholder={t.auth.referralCodePlaceholder}
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    className="w-full h-11 px-3.5 text-sm border border-[#CBD5E1] rounded-xl font-mono focus:outline-none focus:border-[#0770E3] text-start"
                  />
                </div>
              </div>

              {/* Driver Vehicle Details */}
              {role === 'driver' && (
                <div className="pt-4 border-t border-[#E0E4E8] space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#05203C]">
                    {t.auth.vehicleSection}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#05203C] mb-1.5">
                        {t.auth.vehicleModel} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={100}
                        disabled={loading}
                        placeholder={t.auth.vehicleModelPlaceholder}
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full h-11 px-3.5 text-sm border border-[#CBD5E1] rounded-xl focus:outline-none focus:border-[#0770E3]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#05203C] mb-1.5">
                        {t.auth.plateNumber} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={40}
                        disabled={loading}
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        className="w-full h-11 px-3.5 text-sm border border-[#CBD5E1] rounded-xl font-mono focus:outline-none focus:border-[#0770E3]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory Verification Photos (2 Passenger, 3 Driver) */}
              <div className="pt-4 border-t border-[#E0E4E8] space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-[#05203C]">
                    {t.auth.requiredDocsTitle}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {role === 'driver'
                      ? t.auth.requiredDocsHintDriver
                      : t.auth.requiredDocsHintPassenger}
                  </p>
                </div>

                <div
                  className={`grid grid-cols-1 gap-3 ${
                    role === 'driver' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
                  }`}
                >
                  <PhotoUploadCard
                    label={t.auth.idCardPhoto}
                    requiredLabel={t.auth.requiredTag}
                    tapToUploadLabel={t.auth.tapToUpload}
                    replaceLabel={t.auth.replacePhoto}
                    removeLabel={t.auth.removePhoto}
                    photo={idPhoto}
                    disabled={loading}
                    onSelect={(file) => setPhotoState(file, idPhoto, setIdPhoto)}
                    onRemove={() => clearPhotoState(idPhoto, setIdPhoto)}
                  />

                  <PhotoUploadCard
                    label={t.auth.portraitPhoto}
                    requiredLabel={t.auth.requiredTag}
                    tapToUploadLabel={t.auth.tapToUpload}
                    replaceLabel={t.auth.replacePhoto}
                    removeLabel={t.auth.removePhoto}
                    photo={portraitPhoto}
                    disabled={loading}
                    onSelect={(file) => setPhotoState(file, portraitPhoto, setPortraitPhoto)}
                    onRemove={() => clearPhotoState(portraitPhoto, setPortraitPhoto)}
                  />

                  {role === 'driver' && (
                    <PhotoUploadCard
                      label={t.auth.drivingLicensePhoto}
                      requiredLabel={t.auth.requiredTag}
                      tapToUploadLabel={t.auth.tapToUpload}
                      replaceLabel={t.auth.replacePhoto}
                      removeLabel={t.auth.removePhoto}
                      photo={licensePhoto}
                      disabled={loading}
                      onSelect={(file) => setPhotoState(file, licensePhoto, setLicensePhoto)}
                      onRemove={() => clearPhotoState(licensePhoto, setLicensePhoto)}
                    />
                  )}
                </div>
              </div>

              {/* Loading Progress Feedback Banner */}
              {loading && progressStep && (
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0559B8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{progressText}</span>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !canSubmitOnboarding}
                className="w-full h-12 bg-[#0770E3] hover:bg-[#0559B8] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? progressText : t.auth.submitRegistration}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </AnimatedModalShell>
  );
};

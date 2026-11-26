import type { LanguageCode } from '../types/domain';

export interface TranslationDictionary {
  brand: string;
  brandShort: string;
  currency: string;
  pointsUnit: string;
  langAr: string;
  langKu: string;
  langEn: string;

  nav: {
    searchTrips: string;
    emptyCars: string;
    destinations: string;
    loyalty: string;
    becomeDriver: string;
    support: string;
    dashboard: string;
    signIn: string;
    signOut: string;
    register: string;
    joinAsPassenger: string;
    joinAsDriver: string;
  };

  hero: {
    kicker: string;
    headline: string;
    subtitle: string;
    fromLabel: string;
    toLabel: string;
    dateLabel: string;
    selectDate: string;
    clearDate: string;
    seatsLabel: string;
    allGovernorates: string;
    selectDeparture: string;
    selectDestination: string;
    searchButton: string;
    swapCities: string;
    statVerifiedDrivers: string;
    statGovernorates: string;
    statCashPayment: string;
    statPointsPerTrip: string;
    statPointsLabel: string;
    verifiedBadgeTitle: string;
    verifiedBadgeSub: string;
    governoratesCount: string;
    catTrips: string;
    catEmptyCars: string;
    catRoutes: string;
    catRewards: string;
    catDrivers: string;
    timeWindowLabel: string;
    timeAll: string;
    timeMorning: string;
    timeAfternoon: string;
    timeEvening: string;
    verifiedOnlyCheck: string;
    specialOffersOnlyCheck: string;
    breadcrumbHome: string;
    breadcrumbSection: string;
    breadcrumbEmptyCars: string;
  };

  subnav: {
    popular: string;
    emptyCars: string;
    trips: string;
    providers: string;
    ratings: string;
    factsFaq: string;
  };

  filters: {
    all: string;
    cheapest: string;
    offers: string;
    morning: string;
    multiSeat: string;
  };

  home: {
    popularDestinationsTitle: string;
    popularDestinationsSub: string;
    exploreTripsFrom: string;
    availableTripsTitle: string;
    availableTripsSub: string;
    showingCount: string;
    resetFilters: string;
    noTripsTitle: string;
    noTripsDesc: string;
    cheapestTripsTitle: string;
    cheapestTripsSub: string;
    specialOffersTitle: string;
    specialOffersSub: string;
    mapTitle: string;
    mapSub: string;
    loyaltyTitle: string;
    loyaltySub: string;
    loyaltyEarnRule: string;
    loyaltyRedeemRule: string;
    loyaltyReferralRule: string;
    loyaltyCta: string;
    topDriversTitle: string;
    topDriversSub: string;
    noDriversYet: string;
    reviewsTitle: string;
    reviewsSub: string;
    noReviewsYet: string;
    howItWorksTitle: string;
    howItWorksSub: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    becomeDriverTitle: string;
    becomeDriverSub: string;
    becomeDriverBenefit1: string;
    becomeDriverBenefit2: string;
    becomeDriverBenefit3: string;
    becomeDriverCta: string;
    supportTitle: string;
    supportSub: string;
    supportContactBtn: string;
    footerDesc: string;
    footerLegal: string;
    footerRoutes: string;
    privacyPolicy: string;
    termsConditions: string;
    cancellationPolicy: string;
    contactUs: string;
    copyright: string;
    fareCompareTitle: string;
    fareCompareSub: string;
    avgFareLabel: string;
    partnersTitle: string;
    partnersSub: string;
    partnerStationTag: string;
    ratingBreakdownTitle: string;
    ratingOverallLabel: string;
    ratingBasedOn: string;
    ratingPunctuality: string;
    ratingComfort: string;
    ratingStations: string;
    ratingValue: string;
    fastFactsTitle: string;
    fact1Title: string;
    fact1Value: string;
    fact2Title: string;
    fact2Value: string;
    fact3Title: string;
    fact3Value: string;
    fact4Title: string;
    fact4Value: string;
    faqTitle: string;
    faqSub: string;
    faqItems: Array<{ q: string; a: string }>;
    footerSupportTitle: string;
    footerDriverTitle: string;
    footerPlatformNote: string;
    startingFrom: string;
    noFareDataYet: string;
    noRoutesYetShort: string;
    emptyCarsTitle: string;
    emptyCarsSub: string;
    emptyCarsPageTitle: string;
    emptyCarsPageSub: string;
    emptyCarsEmptyState: string;
    viewAllEmptyCars: string;
    emptyCarsCount: string;
    emptyCarsFilterAll: string;
    emptyCarsFilterOnlyEmpty: string;
    emptyCarsFilter4Seats: string;
    emptyCarsFilter6Seats: string;
  };

  tripCard: {
    seatsAvailable: string;
    fullTrip: string;
    perSeat: string;
    cashOnBoard: string;
    verifiedDriver: string;
    completedTrips: string;
    specialOffer: string;
    bookSeat: string;
    notifySeat: string;
    alertSubscribed: string;
    garageDeparture: string;
    garageArrival: string;
    homePickupLabel: string;
    durationMins: string;
    ownTrip: string;
    unratedDriver: string;
    fullCarPriceLabel: string;
    bookFullCar: string;
    carNotEmpty: string;
    carNotEmptyTooltip: string;
    emptyCarReadyBadge: string;
    seatsCapacityBadge: string;
    seatsUnit: string;
  };

  auth: {
    welcomeTitle: string;
    welcomeSub: string;
    continueGoogle: string;
    completeProfileTitle: string;
    completeProfileSub: string;
    chooseRole: string;
    rolePassenger: string;
    rolePassengerDesc: string;
    roleDriver: string;
    roleDriverDesc: string;
    fullName: string;
    phone: string;
    phonePlaceholder: string;
    governorate: string;
    referralCodeOptional: string;
    referralCodePlaceholder: string;
    driverDetailsSection: string;
    homeGarage: string;
    nationalIdNumber: string;
    licenseNumber: string;
    idDocumentPhoto: string;
    licenseDocumentPhoto: string;
    vehicleSection: string;
    vehicleModel: string;
    vehicleModelPlaceholder: string;
    vehicleYear: string;
    plateNumber: string;
    plateSectionGov: string;
    plateSectionLetter: string;
    plateSectionDigits: string;
    plateFormatHint: string;
    platePreviewLabel: string;
    vehicleColor: string;
    passengerCapacity: string;
    vehiclePhoto: string;
    uploadFile: string;
    fileAttached: string;
    submitRegistration: string;
    submitting: string;
    accountSuspendedTitle: string;
    accountSuspendedDesc: string;
    invalidReferralCode: string;
    selfReferralBlocked: string;
    loginTab: string;
    registerTab: string;
    registerAsPassenger: string;
    registerAsDriver: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    signInButton: string;
    signingIn: string;
    orContinueWith: string;
    requiredDocsTitle: string;
    requiredDocsHintPassenger: string;
    requiredDocsHintDriver: string;
    idCardPhoto: string;
    idGroupLabel: string;
    idFrontPhoto: string;
    idBackPhoto: string;
    portraitPhoto: string;
    drivingLicensePhoto: string;
    licenseGroupLabel: string;
    licenseFrontPhoto: string;
    licenseBackPhoto: string;
    frontSideLabel: string;
    backSideLabel: string;
    requiredTag: string;
    replacePhoto: string;
    removePhoto: string;
    tapToUpload: string;
    missingRequiredFields: string;
    creatingAccount: string;
    uploadingPhotos: string;
    savingProfile: string;
    pendingReview: string;
    verifiedStatus: string;
    rejectedStatus: string;
    noAccountPrompt: string;
    hasAccountPrompt: string;
    createAccountBtn: string;
    noOtpNote: string;
    checkingAccount: string;
    pendingApprovalBannerTitle: string;
    pendingApprovalBannerDesc: string;
    verifiedPassengerBadge: string;
    resubmitDocsTitle: string;
    resubmitDocsBtn: string;
    docsResubmitted: string;
  };

  booking: {
    modalTitle: string;
    routeSummary: string;
    seatsCount: string;
    notesLabel: string;
    notesPlaceholder: string;
    paymentMethodTitle: string;
    payCashLabel: string;
    payCashDesc: string;
    redeemPointsLabel: string;
    redeemPointsDesc: string;
    insufficientPoints: string;
    exceedsMaxFreeValue: string;
    onlyOneSeatForFree: string;
    roundTripLabel: string;
    selectReturnTrip: string;
    noReturnTrips: string;
    totalDueCash: string;
    pointsToDeduct: string;
    policyNotice: string;
    confirmRequest: string;
    requestSent: string;
    cancel: string;
    selectSeatsTitle: string;
    frontOfCar: string;
    driverSeatLabel: string;
    seatFrontPassenger: string;
    seatRearRight: string;
    seatRearMiddle: string;
    seatRearLeft: string;
    seatExtraRight: string;
    seatExtraLeft: string;
    seatAvailable: string;
    seatSelected: string;
    seatBooked: string;
    selectedSeatsLabel: string;
    selectAtLeastOneSeat: string;
    seatAlreadyBooked: string;
    dropOffTitle: string;
    standardDropOffLabel: string;
    standardDropOffDesc: string;
    customDropOffLabel: string;
    customDropOffDesc: string;
    customDropOffFeeLabel: string;
    customDropOffAddressLabel: string;
    customDropOffAddressPlaceholder: string;
    locatingMap: string;
    locatedSuccess: string;
    locateFallbackNotice: string;
    recenterMyLocation: string;
    tapOrDragPinHint: string;
    selectedCoordsLabel: string;
    customDropOffMissingCoords: string;
    openDriverNavLink: string;
    customDropOffBadge: string;
    seatsSubtotalLabel: string;
    cargoOptionTitle: string;
    cargoOptionDesc: string;
    cargoAddLabel: string;
    cargoFeeLabel: string;
    cargoNotesPlaceholder: string;
    cargoBadge: string;
    cargoAvailableBadge: string;
    seatPriceRangeHint: string;
    fullCarModalTitle: string;
    fullCarFareLabel: string;
    fullCarIncludedAllSeats: string;
    fullCarCannotRedeemPoints: string;
    carNotEmptyError: string;
  };

  statuses: {
    pending: string;
    accepted: string;
    rejected: string;
    cancelled: string;
    completed: string;
    scheduled: string;
    in_progress: string;
    approved: string;
    suspended: string;
    blocked: string;
    active: string;
    unpaid: string;
    paid: string;
    disputed: string;
    refunded: string;
    open: string;
    investigating: string;
    resolved: string;
    dismissed: string;
    published: string;
    hidden: string;
  };

  passenger: {
    title: string;
    tabSearch: string;
    tabBookings: string;
    tabLoyalty: string;
    tabReferrals: string;
    tabNotifications: string;
    tabSupport: string;
    tabProfile: string;
    upcomingBookings: string;
    bookingHistory: string;
    noBookings: string;
    cancelBooking: string;
    cancelReasonPrompt: string;
    rescheduleBtn: string;
    newDatePrompt: string;
    shareTripBtn: string;
    copiedShareText: string;
    liveLocationActive: string;
    rateDriverBtn: string;
    driverRating: string;
    vehicleRating: string;
    experienceRating: string;
    reviewComment: string;
    submitReview: string;
    disputePaymentBtn: string;
    disputeReason: string;
    walletBalance: string;
    totalEarned: string;
    totalRedeemed: string;
    progressFreeTrip: string;
    pointsRemaining: string;
    freeTripReady: string;
    transactionsHistory: string;
    noTransactions: string;
    yourReferralLink: string;
    yourReferralCode: string;
    copyLink: string;
    linkCopied: string;
    referredFriends: string;
    noReferrals: string;
    markAllRead: string;
    noNotifications: string;
    submitComplaintTitle: string;
    complaintCategory: string;
    complaintSubject: string;
    complaintDesc: string;
    sendComplaint: string;
    myComplaints: string;
    profileSave: string;
    profileSaved: string;
  };

  driver: {
    title: string;
    tabOverview: string;
    tabRequests: string;
    tabMyTrips: string;
    tabPublish: string;
    tabVehicleDocs: string;
    tabEarnings: string;
    tabReviews: string;
    verificationPendingTitle: string;
    verificationPendingDesc: string;
    verificationRejectedTitle: string;
    verificationApprovedBadge: string;
    availabilityToggle: string;
    availableNow: string;
    offlineNow: string;
    acceptBooking: string;
    rejectBooking: string;
    rejectReason: string;
    confirmCashPaid: string;
    markCompleted: string;
    startTrip: string;
    completeTrip: string;
    cancelTrip: string;
    shareLiveLocation: string;
    stopLiveLocation: string;
    publishTripTitle: string;
    departureGov: string;
    destinationGov: string;
    departureGarage: string;
    destinationGarage: string;
    departureDate: string;
    departureTime: string;
    pricePerSeat: string;
    originalPriceOptional: string;
    seatsToOffer: string;
    estimatedDuration: string;
    tripNotes: string;
    publishTripBtn: string;
    editTripLockedNotice: string;
    totalEarningsGross: string;
    platformCommission: string;
    netEarnings: string;
    completedBookingsCount: string;
    saveVehicleDocs: string;
    savedSuccess: string;
    noRequests: string;
    noTrips: string;
    addNewTripBtn: string;
    departureDateTimeLabel: string;
    pickupNotesLabel: string;
    pickupNotesPlaceholder: string;
    autoAttachedInfoTitle: string;
    fourCabinSeatsReady: string;
    deleteTrip: string;
    confirmDeleteTrip: string;
    tripBookingsTitle: string;
    noTripBookings: string;
    cabinSeatsOverview: string;
    perSeatPricingTitle: string;
    applyToAllSeats: string;
    baseSeatPrice: string;
    seatPriceShort: string;
    cargoShippingTitle: string;
    enableCargoTransport: string;
    cargoPriceLabel: string;
    editTripBtn: string;
    saveTripChangesBtn: string;
    tripUpdatedSuccess: string;
    seatCapacityLabel: string;
    capacity4Seats: string;
    capacity6Seats: string;
    fullCarPriceLabel: string;
    fullCarPricePlaceholder: string;
    fullCarPriceHint: string;
    sixCabinSeatsReady: string;
    fullCarBadge: string;
    cabinSeatsOverview6: string;
    weeklyFeeModalTitle: string;
    weeklyFeeModalSubtitle: string;
    weeklyFeeAmountLabel: string;
    weeklyFeeWeekLabel: string;
    rafidainNumberLabel: string;
    copyNumberBtn: string;
    copiedBadge: string;
    transferNotesNoticeTitle: string;
    transferNotesNoticeBody: string;
    driverTransferNameLabel: string;
    driverTransferNamePlaceholder: string;
    submitWeeklyFeeBtn: string;
    weeklyFeeSubmittedSuccess: string;
    weeklyFeeBannerDueTitle: string;
    weeklyFeeBannerDueDesc: string;
    weeklyFeeBannerPendingTitle: string;
    weeklyFeeBannerPendingDesc: string;
    weeklyFeeBannerApprovedTitle: string;
    weeklyFeeBannerRejectedTitle: string;
    payWeeklyFeeBtn: string;
    viewPaymentDetailsBtn: string;
  };

  admin: {
    title: string;
    tabOverview: string;
    tabDrivers: string;
    tabUsers: string;
    tabGeography: string;
    tabTripsBookings: string;
    tabPayments: string;
    tabLoyaltyConfig: string;
    tabComplaintsReviews: string;
    seedIraqDataBtn: string;
    seedDone: string;
    totalRevenueGmv: string;
    platformCommissionEarned: string;
    totalBookings: string;
    activeTrips: string;
    pendingDriversCount: string;
    approveDriver: string;
    rejectDriver: string;
    suspendDriver: string;
    viewDocuments: string;
    suspendUser: string;
    activateUser: string;
    blockUser: string;
    addGarageTitle: string;
    garageNameAr: string;
    garageNameKu: string;
    garageNameEn: string;
    operatingHours: string;
    latitude: string;
    longitude: string;
    saveGarage: string;
    deleteGarage: string;
    resolvePaymentPaid: string;
    resolvePaymentRefunded: string;
    loyaltySettingsTitle: string;
    pointsPerTripLabel: string;
    freeTripCostLabel: string;
    maxFreeValueLabel: string;
    refBonusReferrerLabel: string;
    refBonusRefereeLabel: string;
    commissionRateLabel: string;
    cancellationHoursLabel: string;
    supportPhoneLabel: string;
    supportEmailLabel: string;
    saveSettingsBtn: string;
    manualPointsTitle: string;
    selectUserId: string;
    pointsDelta: string;
    pointsReason: string;
    applyPointsBtn: string;
    broadcastTitle: string;
    sendBroadcastBtn: string;
    hideReview: string;
    publishReview: string;
    updateComplaint: string;
    adminNotesPlaceholder: string;
    adminAccessBtn: string;
    adminCodeModalTitle: string;
    adminCodeModalDesc: string;
    adminCodeLabel: string;
    adminCodePlaceholder: string;
    adminCodeSubmit: string;
    adminCodeInvalid: string;
    adminAuthRequired: string;
    adminNotAuthorizedEmail: string;
    signInAsAdminGoogle: string;
    bookingsWithGpsTitle: string;
    driverTripsModerationTitle: string;
    selectedSeatsCol: string;
    gpsDropOffCol: string;
    standardGarageDropOff: string;
    deleteTripConfirm: string;
    adminCodeUnlockedNotice: string;
    adminOptionalSignInHint: string;
    cargoCol: string;
    pendingUsersCount: string;
    emptyList: string;
    tabWeeklyFees: string;
    weeklyFeesTitle: string;
    weeklyFeesSubtitle: string;
    transferSenderNameCol: string;
    approveWeeklyFeeBtn: string;
    rejectWeeklyFeeBtn: string;
  };

  map: {
    allGarages: string;
    selectGaragePrompt: string;
    hours: string;
    openExternalMap: string;
    activeRoutesFromHere: string;
    regionLabel: string;
    zoomIn: string;
    zoomOut: string;
    resetZoom: string;
    garagePinLegend: string;
    liveDriversLegend: string;
    selectedGarageLabel: string;
    exploreMapCta: string;
    startingFrom: string;
  };

  supportCategories: {
    app_issue: string;
    payment: string;
    driver_behavior: string;
    vehicle: string;
    other: string;
  };

  common: {
    languageLabel: string;
    noImageUploaded: string;
    idLabel: string;
    licenseLabel: string;
    cashMethod: string;
    freePointsMethod: string;
    close: string;
    menu: string;
    verifiedBadge: string;
  };

  tables: {
    booking: string;
    method: string;
    amount: string;
    net: string;
    commission: string;
    status: string;
    dispute: string;
    user: string;
    role: string;
    referralCode: string;
    actions: string;
    passenger: string;
    driver: string;
    date: string;
    seats: string;
    total: string;
  };

  roles: {
    passenger: string;
    driver: string;
    admin: string;
  };

  legal: {
    backHome: string;
    privacyTitle: string;
    privacyBody: string[];
    termsTitle: string;
    termsBody: string[];
    cancellationTitle: string;
    cancellationBody: string[];
    contactTitle: string;
    contactDesc: string;
    workingHours: string;
  };

  errors: {
    generic: string;
    signInRequired: string;
    insufficientSeats: string;
    sameGovernorate: string;
    unapprovedDriver: string;
    unapprovedUser: string;
    cancellationTooLate: string;
    locationDenied: string;
    duplicateBooking: string;
    authEmailInUse: string;
    authWeakPassword: string;
    authInvalidEmail: string;
    authInvalidCredential: string;
    authOperationNotAllowed: string;
    authPopupClosed: string;
    storageUnauthorized: string;
    invalidImageFile: string;
    cannotDeleteTripWithBookings: string;
    carNotEmpty: string;
    weeklyCommissionRequired: string;
    weeklyCommissionPending: string;
    invalidTransferName: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  ar: {
    brand: 'مسار العراق',
    brandShort: 'مسار',
    currency: 'د.ع',
    pointsUnit: 'نقطة',
    langAr: 'العربية',
    langKu: 'کوردی',
    langEn: 'English',

    nav: {
      searchTrips: 'الرحلات',
      emptyCars: 'سيارات فارغة',
      destinations: 'الوجهات',
      loyalty: 'نقاط المكافآت',
      becomeDriver: 'انضم كسائق',
      support: 'الدعم',
      dashboard: 'لوحة التحكم',
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      register: 'إنشاء حساب',
      joinAsPassenger: 'انضم كمسافر',
      joinAsDriver: 'انضم كسائق',
    },

    hero: {
      kicker: 'شبكة النقل المشترك بين المحافظات العراقية',
      headline: 'احجز مقعدك بين المحافظات من هاتفك واستلم سائقك من البيت',
      subtitle:
        'تواصل مباشرة مع سائقين موثوقين في بغداد وأربيل والبصرة والنجف وكربلاء والموصل وجميع المحافظات. السائق يجيك للبيت أو نقطة الالتقاء المتفق عليها، والدفع نقداً عند الرحلة مع مكافآت ولاء.',
      fromLabel: 'محافظة الانطلاق',
      toLabel: 'الوجهة',
      dateLabel: 'تاريخ السفر',
      selectDate: 'اختر التاريخ',
      clearDate: 'الكل',
      seatsLabel: 'المقاعد المطلوبة',
      allGovernorates: 'جميع المحافظات',
      selectDeparture: 'اختر الانطلاق',
      selectDestination: 'اختر الوجهة',
      searchButton: 'ابحث عن رحلة',
      swapCities: 'تبديل الاتجاه',
      statVerifiedDrivers: 'سائقون مفحوصون ومعتمدون',
      statGovernorates: 'محافظة عراقية متصلة',
      statCashPayment: 'دفع نقدي مباشر للسائق',
      statPointsPerTrip: 'نقطة لكل رحلة مكتملة',
      statPointsLabel: 'نقطة ولاء لكل رحلة مكتملة',
      verifiedBadgeTitle: 'رحلات يومية موثقة',
      verifiedBadgeSub: 'استلام مريح من المنزل أو نقطة الالتقاء في الموعد المحدد',
      governoratesCount: '18',
      catTrips: 'حجز الرحلات',
      catEmptyCars: 'سيارات فارغة',
      catRoutes: 'أبرز المسارات',
      catRewards: 'نقاط المكافآت',
      catDrivers: 'بوابة السائقين',
      timeWindowLabel: 'فترة الانطلاق',
      timeAll: 'أي وقت',
      timeMorning: 'صباحاً (04:00 - 12:00)',
      timeAfternoon: 'ظهراً (12:00 - 17:00)',
      timeEvening: 'مساءً (17:00 - 23:59)',
      verifiedOnlyCheck: 'سائقون موثّقون فقط',
      specialOffersOnlyCheck: 'عروض الأسعار الخاصة فقط',
      breadcrumbHome: 'الرئيسية',
      breadcrumbSection: 'حجز التكسي بين المحافظات',
      breadcrumbEmptyCars: 'سيارات فارغة',
    },

    subnav: {
      popular: 'أبرز المسارات',
      emptyCars: 'سيارات فارغة',
      trips: 'الرحلات المتاحة',
      providers: 'تغطية المحافظات',
      ratings: 'التقييمات',
      factsFaq: 'حقائق والأسئلة الشائعة',
    },

    filters: {
      all: 'الكل',
      cheapest: 'الأقل سعراً',
      offers: 'عروض خاصة',
      morning: 'انطلاق صباحي',
      multiSeat: 'مقعدان فأكثر',
    },

    home: {
      popularDestinationsTitle: 'الوجهات الأكثر طلباً في العراق',
      popularDestinationsSub: 'مسارات يومية منتظمة تربط محافظات العراق مع استلام من المنزل أو نقطة الالتقاء.',
      exploreTripsFrom: 'عرض الرحلات إلى',
      availableTripsTitle: 'الرحلات المتاحة الآن',
      availableTripsSub: 'أسعار شفافة للمقعد الواحد ومقاعد محدّثة لحظياً.',
      showingCount: 'رحلة متاحة',
      resetFilters: 'عرض جميع الرحلات',
      noTripsTitle: 'لا توجد رحلات مطابقة لبحثك حالياً',
      noTripsDesc: 'جرّب تغيير التاريخ أو المحافظة، أو تصفح جميع المسارات المتاحة.',
      cheapestTripsTitle: 'أقل الأسعار المتاحة',
      cheapestTripsSub: 'قارن الأسعار واختر المقعد الأنسب لميزانيتك.',
      specialOffersTitle: 'عروض خاصة على المسارات',
      specialOffersSub: 'تخفيضات يقدّمها السائقون على رحلات مختارة.',
      mapTitle: 'تغطية النقل في المحافظات',
      mapSub: 'استلام وتوصيل مرن بين جميع المحافظات العراقية.',
      loyaltyTitle: 'برنامج نقاط مسار ومكافآت السفر',
      loyaltySub: 'سافر أكثر واكسب نقاطاً تتحول إلى رحلات مجانية بين المحافظات.',
      loyaltyEarnRule: 'نقطة تُضاف لرصيدك فور إتمام كل رحلة حقيقية',
      loyaltyRedeemRule: 'نقطة تمنحك تذكرة سفر مجانية ضمن الحد المعتمد',
      loyaltyReferralRule: 'نقطة مكافأة لك ولصديقك عند إتمام أول رحلة عبر رابط الدعوة',
      loyaltyCta: 'افتح محفظة النقاط',
      topDriversTitle: 'سائقون موثوقون بأعلى التقييمات',
      topDriversSub: 'يخضع كل سائق للتحقق من الهوية وإجازة السوق والمركبة قبل نشر أي رحلة.',
      noDriversYet: 'سيظهر السائقون المعتمدون هنا فور إتمام مراجعة طلباتهم.',
      reviewsTitle: 'آراء المسافرين',
      reviewsSub: 'تقييمات حقيقية من مسافرين أتمّوا رحلاتهم عبر المنصة.',
      noReviewsYet: 'لا توجد تقييمات منشورة بعد. كن أول من يقيّم رحلته المكتملة.',
      howItWorksTitle: 'كيف تعمل منصة مسار العراق؟',
      howItWorksSub: 'أربع خطوات واضحة تغنيك عن الذهاب للكراج أو الانتظار المبكر.',
      step1Title: 'ابحث وقارن',
      step1Desc: 'اختر محافظة الانطلاق والوجهة والتاريخ وقارن الأسعار والمقاعد المتبقية.',
      step2Title: 'أرسل طلب الحجز',
      step2Desc: 'حدد عدد المقاعد واكتب عنوان الاستلام أو نقطة الالتقاء وأرسل الطلب للسائق مباشرة.',
      step3Title: 'تأكيد فوري للمقعد',
      step3Desc: 'يقبل السائق طلبك ويُحجز مقعدك فوراً مع رقم الهاتف وتفاصيل المركبة لتنسيق قدومه للبيت.',
      step4Title: 'استلم من البيت وادفع نقداً',
      step4Desc: 'السائق يجيك للبيت أو نقطة الالتقاء المتفق عليها، ادفع نقداً واكسب نقاط الولاء بعد الوصول.',
      becomeDriverTitle: 'هل تعمل سائقاً بين المحافظات؟',
      becomeDriverSub: 'املأ مقاعد مركبتك مسبقاً ونسّق نقاط استلام المسافرين بمرونة، ونظّم مواعيد انطلاقك وأرباحك.',
      becomeDriverBenefit1: 'حجوزات مؤكدة مسبقاً دون انتظار لساعات في الكراجات',
      becomeDriverBenefit2: 'توثيق رسمي يعزز ثقة المسافرين بمركبتك',
      becomeDriverBenefit3: 'إدارة كاملة للرحلات والمدفوعات النقدية والأرباح',
      becomeDriverCta: 'سجّل كسائق الآن',
      supportTitle: 'دعم المسافرين والسائقين',
      supportSub: 'فريق متابعة جاهز لمعالجة الاستفسارات والنزاعات وتنسيق رحلات المحافظات.',
      supportContactBtn: 'تواصل مع الدعم',
      footerDesc: 'منصة عراقية متخصصة في حجز مقاعد التكسي المشترك بين المحافظات مع خدمة الاستلام من المنزل أو نقطة الالتقاء.',
      footerLegal: 'السياسات والقوانين',
      footerRoutes: 'روابط سريعة',
      privacyPolicy: 'سياسة الخصوصية',
      termsConditions: 'الشروط والأحكام',
      cancellationPolicy: 'سياسة الإلغاء',
      contactUs: 'اتصل بنا',
      copyright: 'جميع الحقوق محفوظة لمنصة مسار العراق',
      fareCompareTitle: 'مقارنة متوسط أسعار المسارات الرئيسية',
      fareCompareSub: 'قارن متوسط تعرفة المقعد الواحد بالدينار العراقي بين المحافظات الأكثر طلباً.',
      avgFareLabel: 'متوسط أجرة المقعد',
      partnersTitle: 'تغطية الاستلام في المحافظات العراقية',
      partnersSub: 'انطلاق مرن واستلام من المنزل أو نقطة الالتقاء في بغداد وأربيل والبصرة وكافة المحافظات.',
      partnerStationTag: 'تغطية نشطة',
      ratingBreakdownTitle: 'تفصيل تقييمات المسافرين وجودة الخدمة',
      ratingOverallLabel: 'تقييم موثوقية المنصة',
      ratingBasedOn: 'بناءً على رحلات مكتملة بين المحافظات',
      ratingPunctuality: 'الالتزام بموعد الانطلاق',
      ratingComfort: 'نظافة وراحة المركبة',
      ratingStations: 'دقة الوصول لموقع الاستلام',
      ratingValue: 'وضوح السعر والقيمة',
      fastFactsTitle: 'حقائق سريعة عن مسار العراق',
      fact1Title: 'التغطية الجغرافية',
      fact1Value: '18 محافظة عراقية متصلة',
      fact2Title: 'الدفع المسبق المطلوب',
      fact2Value: '0 د.ع — ادفع نقداً عند الصعود',
      fact3Title: 'مكافآت الولاء',
      fact3Value: '+5,000 نقطة لكل رحلة مكتملة',
      fact4Title: 'اعتماد السائقين',
      fact4Value: 'تدقيق 100% للهوية وإجازة السوق',
      faqTitle: 'الأسئلة الشائعة حول حجز التكسي المشترك',
      faqSub: 'إجابات واضحة حول الحجز والاستلام من المنزل والدفع وتعديل المواعيد.',
      faqItems: [
        {
          q: 'كيف يتم تأكيد مقعدي واستلامي دون الذهاب إلى الكراج؟',
          a: 'اختر خط السير والتاريخ والمقاعد المطلوبة وأرسل الطلب. فور قبول السائق المعتمد، يُحجز مقعدك فوراً برقم اللوحة ويجيهم السائق للبيت أو نقطة الالتقاء المتفق عليها في الموعد المحدد.',
        },
        {
          q: 'هل يجب الدفع إلكترونياً عند الحجز؟',
          a: 'لا، جميع الرحلات الحالية تُدفع نقداً مباشرة للسائق عند الاستلام، أو يمكنك استبدال نقاط الولاء الخاصة بك لرحلة مجانية.',
        },
        {
          q: 'ما هي سياسة إلغاء الحجز أو تعديل الموعد؟',
          a: 'يمكنك إلغاء الطلب المعلق في أي وقت، كما يُسمح بإلغاء الحجوزات المؤكدة مجاناً قبل موعد الانطلاق بـ 3 ساعات على الأقل.',
        },
        {
          q: 'كيف تتحقق المنصة من موثوقية السائقين؟',
          a: 'يقدّم كل سائق صورة البطاقة الوطنية وإجازة السوق وصور المركبة ومعلوماته الكاملة، وتراجع الإدارة جميع الوثائق قبل السماح له بنشر أي رحلة.',
        },
      ],
      footerSupportTitle: 'خدمة المسافرين',
      footerDriverTitle: 'الشركاء والسائقون',
      footerPlatformNote: 'العراق · العملة المعتمدة: الدينار العراقي (IQD)',
      startingFrom: 'ابتداءً من',
      noFareDataYet: 'لا توجد بيانات أسعار منشورة بعد — ستظهر متوسطات الأسعار تلقائياً فور نشر السائقين لرحلاتهم.',
      noRoutesYetShort: 'بانتظار نشر رحلات',
      emptyCarsTitle: 'سيارات فارغة (حجز السيارة كاملة)',
      emptyCarsSub: 'احجز السيارة كاملة بسعر خاص يحدده الكابتن عندما تكون جميع المقاعد فارغة دون أي حجز مسبق.',
      emptyCarsPageTitle: 'قسم السيارات الفارغة — حجز السيارة كاملة',
      emptyCarsPageSub: 'تصفح السيارات المتاحة للحجز الكامل بين المحافظات (4 أو 6 مقاعد) بالسعر المحدد من الكابتن.',
      emptyCarsEmptyState: 'لا توجد سيارات متاحة بتسعيرة السيارة كاملة مطابقة لخيارات التصفية حالياً.',
      viewAllEmptyCars: 'عرض كل السيارات الفارغة',
      emptyCarsCount: 'سيارة بتسعيرة كاملة',
      emptyCarsFilterAll: 'جميع السيارات',
      emptyCarsFilterOnlyEmpty: 'الفارغة تماماً فقط',
      emptyCarsFilter4Seats: '4 مقاعد',
      emptyCarsFilter6Seats: '6 مقاعد',
    },

    tripCard: {
      seatsAvailable: 'مقاعد متاحة',
      fullTrip: 'مكتملة المقاعد',
      perSeat: 'للمقعد',
      cashOnBoard: 'دفع نقدي',
      verifiedDriver: 'سائق موثّق',
      completedTrips: 'رحلة مكتملة',
      specialOffer: 'عرض خاص',
      bookSeat: 'احجز مقعدك',
      notifySeat: 'نبّهني عند توفر مقعد',
      alertSubscribed: 'تم تفعيل التنبيه',
      garageDeparture: 'نقطة الانطلاق',
      garageArrival: 'نقطة الوصول',
      homePickupLabel: 'استلام من المنزل أو نقطة الاتفاق',
      durationMins: 'دقيقة تقريباً',
      ownTrip: 'رحلتك',
      unratedDriver: 'جديد',
      fullCarPriceLabel: 'سعر السيارة كاملة',
      bookFullCar: 'حجز السيارة كاملة',
      carNotEmpty: 'السيارة غير فارغة',
      carNotEmptyTooltip: 'السيارة غير فارغة — تم حجز مقعد واحد أو أكثر ولا يمكن حجز السيارة كاملة',
      emptyCarReadyBadge: 'فارغة بالكامل',
      seatsCapacityBadge: 'السعة',
      seatsUnit: 'مقاعد',
    },

    auth: {
      welcomeTitle: 'الدخول إلى منصة مسار العراق',
      welcomeSub: 'سجّل الدخول بحساب Google لإدارة حجوزاتك كمسافر أو للعمل كسائق معتمد.',
      continueGoogle: 'المتابعة باستخدام Google',
      completeProfileTitle: 'إكمال ملفك الشخصي',
      completeProfileSub: 'أدخل بياناتك لتفعيل حسابك بشكل كامل في المنصة.',
      chooseRole: 'اختر نوع الحساب',
      rolePassenger: 'حساب مسافر',
      rolePassengerDesc: 'ابحث عن الرحلات، احجز مقاعدك، واجمع نقاط المكافآت.',
      roleDriver: 'حساب سائق',
      roleDriverDesc: 'سجّل مركبتك ووثائقك لتلقي موافقة الإدارة ونشر الرحلات.',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف العراقي',
      phonePlaceholder: '0770 123 4567',
      governorate: 'المحافظة',
      referralCodeOptional: 'رمز الدعوة (اختياري)',
      referralCodePlaceholder: 'مثال: MASAR-A1B2',
      driverDetailsSection: 'بيانات التحقق للسائق',
      homeGarage: 'الكراج الرئيسي',
      nationalIdNumber: 'رقم البطاقة الوطنية الموحدة',
      licenseNumber: 'رقم إجازة السوق',
      idDocumentPhoto: 'صورة البطاقة الوطنية',
      licenseDocumentPhoto: 'صورة إجازة السوق',
      vehicleSection: 'معلومات المركبة',
      vehicleModel: 'نوع وطراز المركبة',
      vehicleModelPlaceholder: 'تويوتا كامري / هيونداي ستاريا',
      vehicleYear: 'سنة الصنع',
      plateNumber: 'رقم اللوحة',
      plateSectionGov: 'المحافظة والرمز',
      plateSectionLetter: 'الحرف',
      plateSectionDigits: 'الرقم',
      plateFormatHint: 'مثال: 22 أربيل | H | 12345',
      platePreviewLabel: 'معاينة اللوحة',
      vehicleColor: 'اللون',
      passengerCapacity: 'سعة الركاب (المقاعد)',
      vehiclePhoto: 'صورة المركبة',
      uploadFile: 'اختيار صورة',
      fileAttached: 'تم إرفاق الصورة',
      submitRegistration: 'حفظ وإرسال البيانات',
      submitting: 'جاري الحفظ...',
      accountSuspendedTitle: 'تم إيقاف هذا الحساب مؤقتاً',
      accountSuspendedDesc: 'يرجى التواصل مع إدارة منصة مسار العراق لمراجعة حالة الحساب.',
      invalidReferralCode: 'رمز الدعوة غير موجود. تأكد من الرمز أو اتركه فارغاً.',
      selfReferralBlocked: 'لا يمكنك استخدام رمز الدعوة الخاص بك.',
      loginTab: 'تسجيل الدخول',
      registerTab: 'إنشاء حساب جديد',
      registerAsPassenger: 'تسجيل كمسافر',
      registerAsDriver: 'تسجيل كسائق',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'name@example.com',
      password: 'كلمة المرور',
      passwordPlaceholder: '6 أحرف على الأقل',
      showPassword: 'إظهار كلمة المرور',
      hidePassword: 'إخفاء كلمة المرور',
      signInButton: 'تسجيل الدخول',
      signingIn: 'جاري تسجيل الدخول...',
      orContinueWith: 'أو المتابعة باستخدام Google',
      requiredDocsTitle: 'الصور والوثائق الإلزامية للتوثيق',
      requiredDocsHintPassenger: 'لإتمام التسجيل كمسافر، لا يلزم رفع الهوية — فقط ارفع صورتك الشخصية.',
      requiredDocsHintDriver: 'لإتمام التسجيل كسائق، يجب رفع 5 صور: صورتك الشخصية، الوجه والظهر للهوية الوطنية / البطاقة الموحدة، والوجه والظهر لإجازة السوق.',
      idCardPhoto: 'صورة الهوية',
      idGroupLabel: 'الهوية الوطنية / البطاقة الموحدة',
      idFrontPhoto: 'الوجه — الهوية الوطنية',
      idBackPhoto: 'الظهر — الهوية الوطنية',
      portraitPhoto: 'صورتك الشخصية',
      drivingLicensePhoto: 'صورة إجازة السوق',
      licenseGroupLabel: 'إجازة السوق',
      licenseFrontPhoto: 'الوجه — إجازة السوق',
      licenseBackPhoto: 'الظهر — إجازة السوق',
      frontSideLabel: 'الوجه',
      backSideLabel: 'الظهر',
      requiredTag: 'إلزامي',
      replacePhoto: 'تغيير',
      removePhoto: 'إزالة',
      tapToUpload: 'اضغط لرفع الصورة',
      missingRequiredFields: 'يرجى إكمال جميع الحقول المطلوبة ورفع كل الصور الإلزامية أولاً.',
      creatingAccount: 'جاري إنشاء الحساب...',
      uploadingPhotos: 'جاري رفع الصور إلى Firebase Storage...',
      savingProfile: 'جاري حفظ البيانات في قاعدة البيانات...',
      pendingReview: 'قيد المراجعة',
      verifiedStatus: 'موثق',
      rejectedStatus: 'مرفوض',
      noAccountPrompt: 'ليس لديك حساب؟',
      hasAccountPrompt: 'لديك حساب بالفعل؟',
      createAccountBtn: 'إنشاء الحساب',
      noOtpNote: 'يُستخدم للتنسيق المباشر مع السائق أو المسافر دون حاجة لرمز تحقق SMS.',
      checkingAccount: 'جاري التحقق من حالة الحساب...',
      pendingApprovalBannerTitle: 'حسابك قيد المراجعة / بانتظار موافقة الإدارة',
      pendingApprovalBannerDesc: 'تم استلام وثائقك بنجاح. سيتم تفعيل كامل صلاحيات الحجز أو النشر فور اعتماد الحساب من الإدارة.',
      verifiedPassengerBadge: 'حساب مسافر موثّق ومعتمد',
      resubmitDocsTitle: 'إعادة رفع وثائق التوثيق للمراجعة',
      resubmitDocsBtn: 'إرسال الوثائق المحدّثة للمراجعة',
      docsResubmitted: 'تم إعادة إرسال الوثائق وحالة الحساب الآن قيد المراجعة الإدارية.',
    },

    booking: {
      modalTitle: 'طلب حجز مقعد',
      routeSummary: 'ملخص المسار',
      seatsCount: 'عدد المقاعد',
      notesLabel: 'عنوان الاستلام أو ملاحظات للسائق',
      notesPlaceholder: 'مثال: أرجو الاستلام من المنزل - حي المنصور أو قرب نقطة الالتقاء المتفق عليها',
      paymentMethodTitle: 'طريقة السداد',
      payCashLabel: 'دفع نقدي عند الصعود',
      payCashDesc: 'ادفع الأجرة نقداً للسائق مباشرة عند التجمع أو الوصول.',
      redeemPointsLabel: 'استبدال نقاط الولاء لرحلة مجانية',
      redeemPointsDesc: 'استخدم رصيد نقاطك للحصول على مقعد مجاني.',
      insufficientPoints: 'رصيد نقاطك غير كافٍ للاستبدال.',
      exceedsMaxFreeValue: 'سعر هذه الرحلة يتجاوز الحد الأقصى المسموح للرحلة المجانية.',
      onlyOneSeatForFree: 'استبدال النقاط متاح لمقعد واحد في الحجز.',
      roundTripLabel: 'إضافة رحلة عودة (ذهاب وإياب)',
      selectReturnTrip: 'اختر رحلة العودة المتاحة',
      noReturnTrips: 'لا توجد رحلات عودة متاحة حالياً على نفس المسار.',
      totalDueCash: 'المبلغ المستحق نقداً',
      pointsToDeduct: 'النقاط المخصومة',
      policyNotice: 'يمكن إلغاء الحجز المؤكد قبل موعد الانطلاق ضمن المهلة المحددة في سياسة الإلغاء.',
      confirmRequest: 'إرسال طلب الحجز',
      requestSent: 'تم إرسال طلب الحجز للسائق بنجاح.',
      cancel: 'إلغاء',
      selectSeatsTitle: 'اختر مقعدك داخل السيارة',
      frontOfCar: 'مقدمة السيارة',
      driverSeatLabel: 'السائق',
      seatFrontPassenger: 'بجانب السائق',
      seatRearRight: 'خلفي يمين',
      seatRearMiddle: 'خلفي وسط',
      seatRearLeft: 'خلفي يسار',
      seatExtraRight: 'إضافي يمين',
      seatExtraLeft: 'إضافي يسار',
      seatAvailable: 'متاح',
      seatSelected: 'مختار',
      seatBooked: 'محجوز',
      selectedSeatsLabel: 'المقاعد المختارة',
      selectAtLeastOneSeat: 'اختر مقعداً واحداً على الأقل من المخطط أعلاه.',
      seatAlreadyBooked: 'أحد المقاعد المختارة تم حجزه للتو، يرجى اختيار مقعد آخر.',
      dropOffTitle: 'موقع النزول عند الوصول',
      standardDropOffLabel: 'توصيل اعتيادي (ضمن المسار)',
      standardDropOffDesc: 'النزول في نقطة الوصول المعتادة أو المتفق عليها دون رسوم إضافية.',
      customDropOffLabel: 'توصيل لموقع مخصص على الخريطة (+10,000 د.ع)',
      customDropOffDesc: 'حدّد نقطة نزولك الدقيقة على الخريطة ليوصلك السائق إليها مباشرة.',
      customDropOffFeeLabel: 'رسوم التوصيل لموقع مخصص',
      customDropOffAddressLabel: 'أقرب معلم أو وصف موقع النزول (اختياري)',
      customDropOffAddressPlaceholder: 'مثال: قرب بوابة الجامعة، شارع 60، مقابل صيدلية...',
      locatingMap: 'جاري تحديد موقعك على الخريطة...',
      locatedSuccess: 'تم تحديد موقعك الحالي على الخريطة',
      locateFallbackNotice: 'تعذر الوصول لموقعك تلقائياً — انقر على الخريطة أو اسحب الدبوس لتحديد الموقع.',
      recenterMyLocation: 'تحديد موقعي الحالي',
      tapOrDragPinHint: 'اضغط على الخريطة أو اسحب الدبوس الأزرق لوضع نقطة النزول بدقة.',
      selectedCoordsLabel: 'الإحداثيات المختارة',
      customDropOffMissingCoords: 'يرجى تحديد موقع النزول على الخريطة أولاً.',
      openDriverNavLink: 'فتح مسار التوصيل (خرائط Google)',
      customDropOffBadge: 'توصيل لموقع مخصص',
      seatsSubtotalLabel: 'مجموع المقاعد المختارة',
      cargoOptionTitle: 'شحن بضائع / طرود مع الكابتن',
      cargoOptionDesc: 'أضف طرداً أو أمانة للشحن مع هذه الرحلة بالتسعيرة المحددة من الكابتن.',
      cargoAddLabel: 'إضافة شحن بضاعة / طرد لهذه الرحلة',
      cargoFeeLabel: 'أجرة نقل البضاعة / الطرد',
      cargoNotesPlaceholder: 'وصف الطرد أو البضاعة (مثال: حقيبة متوسطة، مستندات، علبة هدايا...)',
      cargoBadge: 'مع شحن طرد',
      cargoAvailableBadge: 'شحن طرود متاح',
      seatPriceRangeHint: 'حسب المقعد المختار',
      fullCarModalTitle: 'حجز السيارة كاملة',
      fullCarFareLabel: 'أجرة السيارة كاملة (محددة من الكابتن)',
      fullCarIncludedAllSeats: 'يشمل حجز جميع المقاعد داخل المركبة بالكامل لرحلة خاصة.',
      fullCarCannotRedeemPoints: 'استبدال النقاط متاح للمقعد الفردي فقط ولا يُطبق على حجز السيارة كاملة.',
      carNotEmptyError: 'عذراً، هذه السيارة غير فارغة (تم حجز مقعد واحد أو أكثر للتو).',
    },

    statuses: {
      pending: 'قيد الانتظار',
      accepted: 'مقبول ومؤكد',
      rejected: 'مرفوض',
      cancelled: 'ملغي',
      completed: 'مكتمل',
      scheduled: 'مجدولة',
      in_progress: 'قيد التنفيذ',
      approved: 'معتمد',
      suspended: 'معلّق',
      blocked: 'محظور',
      active: 'نشط',
      unpaid: 'غير مدفوع',
      paid: 'مدفوع نقداً',
      disputed: 'محل نزاع',
      refunded: 'مسترد',
      open: 'مفتوحة',
      investigating: 'قيد المراجعة',
      resolved: 'تم الحل',
      dismissed: 'مغلقة',
      published: 'منشور',
      hidden: 'مخفي',
    },

    passenger: {
      title: 'لوحة المسافر',
      tabSearch: 'البحث والحجز',
      tabBookings: 'حجوزاتي',
      tabLoyalty: 'نقاط المكافآت',
      tabReferrals: 'دعوة الأصدقاء',
      tabNotifications: 'الإشعارات',
      tabSupport: 'الدعم والشكاوى',
      tabProfile: 'الملف الشخصي',
      upcomingBookings: 'الحجوزات الحالية والقادمة',
      bookingHistory: 'سجل الرحلات السابقة',
      noBookings: 'لا توجد لديك حجوزات حتى الآن. ابدأ بالبحث عن رحلة بين المحافظات.',
      cancelBooking: 'إلغاء الحجز',
      cancelReasonPrompt: 'سبب الإلغاء (اختياري):',
      rescheduleBtn: 'طلب تغيير الموعد',
      newDatePrompt: 'أدخل التاريخ المطلوب الجديد (YYYY-MM-DD):',
      shareTripBtn: 'مشاركة تفاصيل الرحلة مع العائلة',
      copiedShareText: 'تم نسخ تفاصيل الرحلة لمشاركتها.',
      liveLocationActive: 'الموقع المباشر للسائق متاح',
      rateDriverBtn: 'تقييم السائق والرحلة',
      driverRating: 'تقييم السائق',
      vehicleRating: 'تقييم المركبة',
      experienceRating: 'تقييم التجربة العامة',
      reviewComment: 'اكتب رأيك حول الرحلة',
      submitReview: 'إرسال التقييم',
      disputePaymentBtn: 'الإبلاغ عن نزاع مالي',
      disputeReason: 'صف المشكلة المتعلقة بالدفع النقدي:',
      walletBalance: 'الرصيد الحالي',
      totalEarned: 'إجمالي النقاط المكتسبة',
      totalRedeemed: 'إجمالي النقاط المستبدلة',
      progressFreeTrip: 'التقدم نحو الرحلة المجانية التالية',
      pointsRemaining: 'نقطة متبقية للرحلة المجانية',
      freeTripReady: 'رصيدك مؤهل لرحلة مجانية الآن عند الحجز!',
      transactionsHistory: 'سجل حركات النقاط',
      noTransactions: 'لا توجد حركات نقاط مسجلة بعد.',
      yourReferralLink: 'رابط الدعوة الخاص بك',
      yourReferralCode: 'رمز الدعوة',
      copyLink: 'نسخ الرابط',
      linkCopied: 'تم نسخ رابط الدعوة.',
      referredFriends: 'الأصدقاء المدعوون',
      noReferrals: 'لم يسجل أي صديق عبر رابطك بعد. شارك الرابط واكسب مكافآت.',
      markAllRead: 'تحديد الكل كمقروء',
      noNotifications: 'لا توجد إشعارات جديدة.',
      submitComplaintTitle: 'تقديم شكوى أو طلب دعم',
      complaintCategory: 'نوع البلاغ',
      complaintSubject: 'الموضوع',
      complaintDesc: 'التفاصيل',
      sendComplaint: 'إرسال البلاغ',
      myComplaints: 'بلاغاتي السابقة',
      profileSave: 'حفظ التغييرات',
      profileSaved: 'تم تحديث بياناتك بنجاح.',
    },

    driver: {
      title: 'لوحة السائق',
      tabOverview: 'ملخص الحساب',
      tabRequests: 'طلبات الحجز',
      tabMyTrips: 'رحلاتي',
      tabPublish: 'نشر رحلة',
      tabVehicleDocs: 'الوثائق والمركبة',
      tabEarnings: 'الأرباح والمدفوعات',
      tabReviews: 'التقييمات',
      verificationPendingTitle: 'حسابك قيد المراجعة من قبل الإدارة',
      verificationPendingDesc: 'لا يمكنك نشر الرحلات أو قبول الحجوزات حتى يتم التحقق من وثائقك والموافقة على حسابك.',
      verificationRejectedTitle: 'تم رفض طلب التوثيق',
      verificationApprovedBadge: 'حساب سائق موثّق ومعتمد',
      availabilityToggle: 'حالة الجاهزية للعمل',
      availableNow: 'متاح لاستقبال الرحلات',
      offlineNow: 'غير متاح حالياً',
      acceptBooking: 'قبول وحجز المقعد',
      rejectBooking: 'رفض الطلب',
      rejectReason: 'سبب الرفض (اختياري):',
      confirmCashPaid: 'تأكيد استلام النقد',
      markCompleted: 'إتمام الرحلة وإضافة النقاط',
      startTrip: 'بدء الانطلاق',
      completeTrip: 'إنهاء الرحلة',
      cancelTrip: 'إلغاء الرحلة',
      shareLiveLocation: 'مشاركة الموقع المباشر',
      stopLiveLocation: 'إيقاف الموقع المباشر',
      publishTripTitle: 'إضافة رحلة جديدة',
      departureGov: 'محافظة الانطلاق',
      destinationGov: 'محافظة الوجهة',
      departureGarage: 'كراج الانطلاق',
      destinationGarage: 'كراج الوصول',
      departureDate: 'تاريخ الانطلاق',
      departureTime: 'وقت الانطلاق',
      pricePerSeat: 'سعر المقعد (د.ع)',
      originalPriceOptional: 'السعر قبل الخصم (اختياري للعرض الخاص)',
      seatsToOffer: 'عدد المقاعد المتاحة',
      estimatedDuration: 'المدة المقدرة (بالدقائق)',
      tripNotes: 'ملاحظات الانطلاق / التوصيل (اختياري)',
      publishTripBtn: 'نشر الرحلة الآن',
      editTripLockedNotice: 'يُمنع تعديل السعر أو المسار بعد تأكيد حجوزات الركاب.',
      totalEarningsGross: 'إجمالي الأجرة المحصلة',
      platformCommission: 'عمولة المنصة',
      netEarnings: 'صافي أرباح السائق',
      completedBookingsCount: 'الحجوزات المكتملة',
      saveVehicleDocs: 'تحديث بيانات المركبة والوثائق',
      savedSuccess: 'تم حفظ البيانات بنجاح.',
      noRequests: 'لا توجد طلبات حجز حالياً.',
      noTrips: 'لم تنشر أي رحلات بعد.',
      addNewTripBtn: 'إضافة رحلة جديدة',
      departureDateTimeLabel: 'موعد الانطلاق',
      pickupNotesLabel: 'ملاحظات الانطلاق / التوصيل (اختياري)',
      pickupNotesPlaceholder: 'مثال: الانطلاق من المنصور والكرادة، استلام من البيت حسب الاتفاق...',
      autoAttachedInfoTitle: 'بيانات السائق والمركبة المرفقة تلقائياً',
      fourCabinSeatsReady: 'سيتم تهيئة جميع المقاعد الأربعة (4/4 متاحة) لاختيار الركاب مباشرة.',
      deleteTrip: 'حذف الرحلة',
      confirmDeleteTrip: 'تأكيد الحذف',
      tripBookingsTitle: 'الحجوزات الواردة ومواقع التوصيل',
      noTripBookings: 'لا توجد حجوزات واردة على هذه الرحلة بعد.',
      cabinSeatsOverview: 'حالة المقاعد الأربعة',
      perSeatPricingTitle: 'تسعير كل مقعد على حدة (د.ع)',
      applyToAllSeats: 'تطبيق على كل المقاعد',
      baseSeatPrice: 'سعر افتراضي سريع',
      seatPriceShort: 'سعر المقعد',
      cargoShippingTitle: 'خيار نقل البضائع والطرود',
      enableCargoTransport: 'إتاحة نقل البضائع / الطرود على هذه الرحلة',
      cargoPriceLabel: 'أجرة شحن البضاعة / الطرد (د.ع)',
      editTripBtn: 'تعديل الرحلة والأسعار',
      saveTripChangesBtn: 'حفظ تعديلات الرحلة',
      tripUpdatedSuccess: 'تم تحديث تفاصيل وأسعار الرحلة بنجاح.',
      seatCapacityLabel: 'سعة المركبة في هذه الرحلة',
      capacity4Seats: '4 مقاعد (صالون قياسي)',
      capacity6Seats: '6 مقاعد (4 أساسية + مقعدان إضافيان)',
      fullCarPriceLabel: 'سعر حجز السيارة كاملة (د.ع)',
      fullCarPricePlaceholder: 'مثال: 120000 (اتركه فارغاً أو 0 لإلغاء الحجز الكامل)',
      fullCarPriceHint: 'يظهر في قسم «سيارات فارغة» ويُفعّل زر الحجز الكامل طالما لم يُحجز أي مقعد.',
      sixCabinSeatsReady: 'سيتم تهيئة جميع المقاعد الستة (6/6 متاحة) بما فيها المقعدان الإضافيان في المخطط ثلاثي الأبعاد.',
      fullCarBadge: 'حجز سيارة كاملة',
      cabinSeatsOverview6: 'حالة المقاعد الستة',
      weeklyFeeModalTitle: 'سداد عمولة المنصة الأسبوعية (20,000 د.ع)',
      weeklyFeeModalSubtitle:
        'لقد أخذت أول رحلة لك هذا الأسبوع. لإتاحة نشر رحلات إضافية، يرجى تحويل 20,000 د.ع عبر مصرف الرافدين.',
      weeklyFeeAmountLabel: 'المبلغ المطلوب لهذا الأسبوع',
      weeklyFeeWeekLabel: 'الأسبوع',
      rafidainNumberLabel: 'رقم الرافدين للتحويل',
      copyNumberBtn: 'نسخ الرقم',
      copiedBadge: 'تم النسخ',
      transferNotesNoticeTitle: 'تنبيه مهم جداً — ملاحظات التحويل',
      transferNotesNoticeBody:
        'يجب كتابة اسمك في «ملاحظات التحويل» عند إرسال مبلغ 20,000 د.ع إلى رقم الرافدين أعلاه، حتى يتمكن المشرف (2006) من مطابقة الحوالة وتفعيل حسابك للأسبوع.',
      driverTransferNameLabel: 'اسم السائق (كما كتبته في ملاحظات التحويل)',
      driverTransferNamePlaceholder: 'اكتب اسمك الكامل المطابق لملاحظات التحويل',
      submitWeeklyFeeBtn: 'إرسال تأكيد التحويل للموافقة',
      weeklyFeeSubmittedSuccess:
        'تم إرسال بيانات التحويل! بانتظار مطابقة وموافقة المشرف (2006) لتفعيل حسابك للأسبوع.',
      weeklyFeeBannerDueTitle: 'مطلوب سداد عمولة الأسبوع (20,000 د.ع) عبر الرافدين',
      weeklyFeeBannerDueDesc:
        'بدأت أول رحلة لك هذا الأسبوع. حوّل 20,000 د.ع إلى رقم الرافدين 07738235028 واكتب اسمك في ملاحظات التحويل لفتح الرحلات الإضافية.',
      weeklyFeeBannerPendingTitle: 'حوالة عمولة الأسبوع (20,000 د.ع) بانتظار موافقة الإدارة',
      weeklyFeeBannerPendingDesc: 'تم إرسال التأكيد باسم:',
      weeklyFeeBannerApprovedTitle: 'حسابك مفعّل لهذا الأسبوع (تم اعتماد 20,000 د.ع)',
      weeklyFeeBannerRejectedTitle: 'تم رفض تأكيد عمولة الأسبوع — يرجى إعادة الإرسال',
      payWeeklyFeeBtn: 'دفع / تأكيد 20,000 د.ع',
      viewPaymentDetailsBtn: 'عرض تفاصيل الرافدين',
    },

    admin: {
      title: 'لوحة إدارة المنصة',
      tabOverview: 'الإحصائيات والإيرادات',
      tabDrivers: 'اعتماد السائقين',
      tabUsers: 'المستخدمون',
      tabGeography: 'المحافظات والكراجات',
      tabTripsBookings: 'الرحلات والحجوزات',
      tabPayments: 'المدفوعات النقدية',
      tabLoyaltyConfig: 'قواعد الولاء والعمولة',
      tabComplaintsReviews: 'الشكاوى والتقييمات',
      seedIraqDataBtn: 'تهيئة بيانات المحافظات والكراجات',
      seedDone: 'تمت تهيئة بيانات العراق الافتراضية بنجاح.',
      totalRevenueGmv: 'إجمالي قيمة الرحلات',
      platformCommissionEarned: 'إيرادات العمولة',
      totalBookings: 'إجمالي الحجوزات',
      activeTrips: 'الرحلات النشطة',
      pendingDriversCount: 'طلبات سائقين بانتظار المراجعة',
      approveDriver: 'موافقة',
      rejectDriver: 'رفض',
      suspendDriver: 'تعليق السائق',
      viewDocuments: 'معاينة الوثائق',
      suspendUser: 'تعليق',
      activateUser: 'تفعيل',
      blockUser: 'حظر',
      addGarageTitle: 'إضافة كراج أو محطة جديدة',
      garageNameAr: 'اسم الكراج (عربي)',
      garageNameKu: 'اسم الكراج (كردي)',
      garageNameEn: 'اسم الكراج (إنجليزي)',
      operatingHours: 'ساعات العمل',
      latitude: 'خط العرض',
      longitude: 'خط الطول',
      saveGarage: 'حفظ الكراج',
      deleteGarage: 'حذف',
      resolvePaymentPaid: 'تأكيد الدفع',
      resolvePaymentRefunded: 'تحويل لمسترد',
      loyaltySettingsTitle: 'إعدادات نظام المكافآت والعمولات',
      pointsPerTripLabel: 'النقاط الممنوحة لكل رحلة مكتملة',
      freeTripCostLabel: 'تكلفة الرحلة المجانية بالنقاط',
      maxFreeValueLabel: 'الحد الأقصى لقيمة الرحلة المجانية (د.ع)',
      refBonusReferrerLabel: 'مكافأة الداعي (نقطة)',
      refBonusRefereeLabel: 'مكافأة الصديق المسجل (نقطة)',
      commissionRateLabel: 'نسبة عمولة المنصة (%)',
      cancellationHoursLabel: 'مهلة الإلغاء المسموحة (ساعة)',
      supportPhoneLabel: 'هاتف الدعم الفني',
      supportEmailLabel: 'بريد الدعم الرسمي',
      saveSettingsBtn: 'حفظ إعدادات المنصة',
      manualPointsTitle: 'تعديل رصيد نقاط مستخدم يدوياً',
      selectUserId: 'معرّف المستخدم (UID)',
      pointsDelta: 'عدد النقاط (+ للإضافة أو - للخصم)',
      pointsReason: 'سبب التعديل',
      applyPointsBtn: 'تنفيذ التعديل',
      broadcastTitle: 'إرسال إشعار إداري لمستخدم',
      sendBroadcastBtn: 'إرسال الإشعار',
      hideReview: 'إخفاء التقييم',
      publishReview: 'إظهار التقييم',
      updateComplaint: 'حفظ حالة البلاغ',
      adminNotesPlaceholder: 'ملاحظات الإدارة...',
      adminAccessBtn: 'كود الأدمن',
      adminCodeModalTitle: 'دخول لوحة الإدارة',
      adminCodeModalDesc: 'أدخل رمز الإدارة السري (2006) للدخول المباشر إلى لوحة التوثيق ومتابعة الحجوزات.',
      adminCodeLabel: 'كود الأدمن السري',
      adminCodePlaceholder: 'أدخل الرمز',
      adminCodeSubmit: 'فتح لوحة الإدارة',
      adminCodeInvalid: 'رمز الإدارة غير صحيح. تأكد من الرمز وحاول مجدداً.',
      adminAuthRequired: 'يرجى تسجيل الدخول عبر Google لمزامنة السجلات الكاملة من قاعدة البيانات.',
      adminNotAuthorizedEmail: 'تعذر التحقق من الجلسة الإدارية.',
      signInAsAdminGoogle: 'تسجيل الدخول عبر Google لمزامنة السجلات',
      bookingsWithGpsTitle: 'سجل الحجوزات والمقاعد وتوصيل GPS (+10,000 د.ع)',
      driverTripsModerationTitle: 'الرحلات المنشورة من السائقين',
      selectedSeatsCol: 'المقاعد المختارة',
      gpsDropOffCol: 'التوصيل المخصص (GPS)',
      standardGarageDropOff: 'توصيل اعتيادي (ضمن المسار)',
      deleteTripConfirm: 'تأكيد حذف الرحلة',
      adminCodeUnlockedNotice: 'تم فتح لوحة الإدارة مباشرة بكود الأدمن (2006).',
      adminOptionalSignInHint: 'يمكنك تصفح اللوحة الآن، أو تسجيل الدخول بأي حساب Google لمزامنة وإدارة كل سجلات Firestore الحية.',
      cargoCol: 'البضائع / الطرود',
      pendingUsersCount: 'مسافرون ومستخدمون بانتظار الاعتماد',
      emptyList: 'لا توجد سجلات حية حالياً.',
      tabWeeklyFees: 'عمولات الأسبوع (20,000)',
      weeklyFeesTitle: 'مراجعة حوالات الرافدين الأسبوعية (20,000 د.ع)',
      weeklyFeesSubtitle:
        'طابق اسم السائق المكتوب في ملاحظات التحويل لحوالات رقم الرافدين 07738235028 وفعّل حسابه للأسبوع.',
      transferSenderNameCol: 'الاسم في ملاحظات التحويل',
      approveWeeklyFeeBtn: 'مطابقة وتفعيل الأسبوع',
      rejectWeeklyFeeBtn: 'رفض الحوالة',
    },

    map: {
      allGarages: 'جميع الكراجات المعتمدة',
      selectGaragePrompt: 'اضغط على أي نقطة كراج لعرض التفاصيل والرحلات',
      hours: 'ساعات العمل',
      openExternalMap: 'فتح في خرائط جوجل',
      activeRoutesFromHere: 'الرحلات المنطلقة من هذا الكراج',
      regionLabel: 'شبكة العراق · 18 محافظة',
      zoomIn: 'تكبير الخريطة',
      zoomOut: 'تصغير الخريطة',
      resetZoom: 'إعادة الضبط',
      garagePinLegend: 'كراج معتمد',
      liveDriversLegend: 'مركبة نشطة الآن',
      selectedGarageLabel: 'الكراج المحدد',
      exploreMapCta: 'استكشف الخريطة',
      startingFrom: 'ابتداءً من',
    },

    supportCategories: {
      app_issue: 'التطبيق أو الحجز',
      payment: 'الدفع النقدي',
      driver_behavior: 'السائق',
      vehicle: 'المركبة',
      other: 'أخرى',
    },

    common: {
      languageLabel: 'اللغة المفضلة',
      noImageUploaded: 'لم يتم رفع صورة',
      idLabel: 'البطاقة الوطنية',
      licenseLabel: 'إجازة السوق',
      cashMethod: 'نقداً',
      freePointsMethod: 'نقاط ولاء',
      close: 'إغلاق',
      menu: 'القائمة',
      verifiedBadge: 'موثّق',
    },

    tables: {
      booking: 'الحجز',
      method: 'الطريقة',
      amount: 'المبلغ',
      net: 'الصافي',
      commission: 'العمولة',
      status: 'الحالة',
      dispute: 'النزاع',
      user: 'المستخدم',
      role: 'الدور',
      referralCode: 'رمز الدعوة',
      actions: 'الإجراءات',
      passenger: 'المسافر',
      driver: 'السائق',
      date: 'التاريخ',
      seats: 'المقاعد',
      total: 'الإجمالي',
    },

    roles: {
      passenger: 'مسافر',
      driver: 'سائق',
      admin: 'مدير',
    },

    legal: {
      backHome: 'العودة للرئيسية',
      privacyTitle: 'سياسة الخصوصية وحماية البيانات',
      privacyBody: [
        'تلتزم منصة مسار العراق بحماية البيانات الشخصية للمسافرين والسائقين وفق أعلى معايير الأمان وعزل البيانات الحساسة.',
        'يُستخدم رقم الهاتف وبيانات الاتصال فقط لتنسيق الحجوزات المؤكدة بين المسافر والسائق المعني ولا تُباع أو تُشارك لأغراض تسويقية خارجية.',
        'تُحفظ وثائق السائقين (البطاقة الوطنية وإجازة السوق) بشكل مقصور على فريق الإدارة لغرض التوثيق القانوني والأمني فقط.',
      ],
      termsTitle: 'الشروط والأحكام',
      termsBody: [
        'تعمل منصة مسار العراق كوسيط تقني يربط المسافرين بسائقي التكسي المشترك المعتمدين بين المحافظات العراقية مع خدمة الاستلام من المنزل أو نقطة الالتقاء.',
        'يُمنع على أي سائق نشر رحلات أو استقبال ركاب قبل استكمال التحقق والموافقة الإدارية.',
        'يتم الدفع حالياً نقداً مباشرة للسائق عند الصعود أو وفق الاتفاق الموضح في تفاصيل الحجز، وتُحتسب عمولة المنصة على الحجوزات المكتملة.',
        'يُحظر إنشاء حسابات وهمية لاستغلال نقاط الولاء أو نظام الإحالات، وتحتفظ الإدارة بحق حظر الحسابات المخالفة وإلغاء النقاط غير المشروعة.',
      ],
      cancellationTitle: 'سياسة الإلغاء وتعديل المواعيد',
      cancellationBody: [
        'يمكن للمسافر إلغاء طلب الحجز المعلق في أي وقت دون قيود واسترجاع النقاط المستبدلة فوراً إن وُجدت.',
        'في حال تم تأكيد الحجز من السائق، يُسمح بالإلغاء المجاني قبل موعد الانطلاق بالمدة المحددة في إعدادات المنصة (الافتراضي: 3 ساعات) لإتاحة الفرصة لركاب آخرين.',
        'عند إلغاء السائق للرحلة أو رفض الطلب، تعود المقاعد أو النقاط المستبدلة فوراً مع إشعار المسافر.',
      ],
      contactTitle: 'تواصل معنا والدعم الفني',
      contactDesc: 'نرحب باستفسارات المسافرين وطلبات انضمام السائقين في جميع المحافظات العراقية.',
      workingHours: 'يومياً من 07:00 صباحاً حتى 11:00 مساءً بتوقيت بغداد',
    },

    errors: {
      generic: 'حدث خطأ أثناء تنفيذ العملية. يرجى المحاولة مجدداً.',
      signInRequired: 'يرجى تسجيل الدخول أولاً لإتمام هذه العملية.',
      insufficientSeats: 'عذراً، عدد المقاعد المتبقية غير كافٍ.',
      sameGovernorate: 'يجب أن تختلف محافظة الوصول عن محافظة الانطلاق.',
      unapprovedDriver: 'يجب موافقة الإدارة على حساب السائق أولاً.',
      unapprovedUser: 'حسابك قيد المراجعة / بانتظار موافقة الإدارة. لا يمكن إتمام الحجز قبل اعتماد الإدارة.',
      cancellationTooLate: 'انتهت المهلة المسموحة لإلغاء الحجز قبل موعد الانطلاق.',
      locationDenied: 'تعذر الوصول للموقع الجغرافي. تحقق من أذونات المتصفح.',
      duplicateBooking: 'لديك حجز نشط مسبقاً على هذه الرحلة.',
      authEmailInUse: 'هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول بدلاً من ذلك.',
      authWeakPassword: 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.',
      authInvalidEmail: 'صيغة البريد الإلكتروني غير صحيحة.',
      authInvalidCredential: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      authOperationNotAllowed: 'تسجيل الدخول بالبريد الإلكتروني غير مفعّل في إعدادات Firebase Authentication.',
      authPopupClosed: 'تم إغلاق نافذة Google قبل إتمام تسجيل الدخول.',
      storageUnauthorized: 'تعذر رفع الصور إلى Firebase Storage. تحقق من أذونات قواعد التخزين.',
      invalidImageFile: 'يرجى اختيار ملف صورة صالح (JPG أو PNG).',
      cannotDeleteTripWithBookings: 'لا يمكن حذف رحلة تحتوي على حجوزات مؤكدة. يمكنك إلغاء الحجوزات أولاً.',
      carNotEmpty: 'عذراً، هذه السيارة غير فارغة — تم حجز مقعد واحد أو أكثر.',
      weeklyCommissionRequired:
        'يجب تحويل عمولة الأسبوع (20,000 د.ع) عبر الرافدين (07738235028) واعتمادها من الإدارة قبل إضافة رحلة ثانية هذا الأسبوع.',
      weeklyCommissionPending:
        'طلب تأكيد عمولة الأسبوع قيد المراجعة الإدارية حالياً. ستتمكن من نشر رحلات جديدة فور الموافقة.',
      invalidTransferName: 'يرجى كتابة اسمك الكامل كما ورد في ملاحظات التحويل.',
    },
  },

  ku: {
    brand: 'مەساری عێراق',
    brandShort: 'مەسار',
    currency: 'د.ع',
    pointsUnit: 'خاڵ',
    langAr: 'العربية',
    langKu: 'کوردی',
    langEn: 'English',

    nav: {
      searchTrips: 'گەشتەکان',
      emptyCars: 'ئۆتۆمبێلی بەتاڵ',
      destinations: 'ئاراستەکان',
      loyalty: 'خاڵەکانی دڵسۆزی',
      becomeDriver: 'ببە بە شۆفێر',
      support: 'پاڵپشتی',
      dashboard: 'پانێڵی بەکارهێنەر',
      signIn: 'چوونەژوورەوە',
      signOut: 'چوونەدەرەوە',
      register: 'تۆمارکردن',
      joinAsPassenger: 'وەک گەشتیار بەشداربە',
      joinAsDriver: 'وەک شۆفێر بەشداربە',
    },

    hero: {
      kicker: 'تۆڕی گواستنەوەی هاوبەش لە نێوان پارێزگاکانی عێراق',
      headline: 'کورسی تەکسی نێوان پارێزگاکان بگرە و شۆفێر دێتە ماڵەوە بێ چوون بۆ گەراج',
      subtitle:
        'ڕاستەوخۆ پەیوەندی ببەستە بە شۆفێرە متمانەپێکراوەکانەوە لە بەغدا، هەولێر، بەسرە، نەجەف، کەربەلا، سلێمانی و هەموو پارێزگاکان. شۆفێر دێتە ماڵەوە یان شوێنی ڕێککەوتن و پارەدان بە کاشە لەگەڵ خاڵی پاداشت.',
      fromLabel: 'پارێزگای دەرچوون',
      toLabel: 'ئاراستەی گەیشتن',
      dateLabel: 'بەرواری گەشت',
      selectDate: 'بەروار هەڵبژێرە',
      clearDate: 'هەموو',
      seatsLabel: 'ژمارەی کورسی',
      allGovernorates: 'هەموو پارێزگاکان',
      selectDeparture: 'شوێنی دەرچوون هەڵبژێرە',
      selectDestination: 'ئاراستە هەڵبژێرە',
      searchButton: 'گەڕان بۆ گەشت',
      swapCities: 'گۆڕینەوەی ئاراستە',
      statVerifiedDrivers: 'شۆفێری پشکنراو و متمانەپێکراو',
      statGovernorates: 'پارێزگای بەیەکەوەبەستراو',
      statCashPayment: 'پارەدانی کاش ڕاستەوخۆ بە شۆفێر',
      statPointsPerTrip: 'خاڵ بۆ هەر گەشتێکی تەواوبوو',
      statPointsLabel: 'خاڵی دڵسۆزی بۆ هەر گەشتێک',
      verifiedBadgeTitle: 'گەشتی ڕۆژانەی باوەڕپێکراو',
      verifiedBadgeSub: 'وەرگرتن لە ماڵەوە یان شوێنی ڕێککەوتن لە کاتی دیاریکراودا',
      governoratesCount: '18',
      catTrips: 'گرتنی گەشت',
      catEmptyCars: 'ئۆتۆمبێلی بەتاڵ',
      catRoutes: 'هێڵە سەرەکییەکان',
      catRewards: 'خاڵەکانی پاداشت',
      catDrivers: 'پۆرتاڵی شۆفێران',
      timeWindowLabel: 'کاتی دەرچوون',
      timeAll: 'هەموو کاتەکان',
      timeMorning: 'بەیانی (04:00 - 12:00)',
      timeAfternoon: 'نیوەڕۆ (12:00 - 17:00)',
      timeEvening: 'ئێوارە (17:00 - 23:59)',
      verifiedOnlyCheck: 'تەنها شۆفێرە پەسەندکراوەکان',
      specialOffersOnlyCheck: 'تەنها ئۆفەرە تایبەتەکان',
      breadcrumbHome: 'سەرەکی',
      breadcrumbSection: 'گرتنی تەکسی نێوان پارێزگاکان',
      breadcrumbEmptyCars: 'ئۆتۆمبێلی بەتاڵ',
    },

    subnav: {
      popular: 'هێڵە سەرەکییەکان',
      emptyCars: 'ئۆتۆمبێلی بەتاڵ',
      trips: 'گەشتە بەردەستەکان',
      providers: 'ڕووماڵی پارێزگاکان',
      ratings: 'هەڵسەنگاندنەکان',
      factsFaq: 'زانیاری خێرا و پرسیارەکان',
    },

    filters: {
      all: 'هەموو',
      cheapest: 'هەرزانترین',
      offers: 'ئۆفەری تایبەت',
      morning: 'دەرچوونی بەیانی',
      multiSeat: '٢+ کورسی بەردەست',
    },

    home: {
      popularDestinationsTitle: 'زۆرترین داواکاری لە ئاراستەکان',
      popularDestinationsSub: 'هێڵە ڕۆژانەییەکان کە پارێزگاکان بەیەکەوە دەبەستنەوە بە وەرگرتن لە ماڵەوە یان شوێنی ڕێککەوتن.',
      exploreTripsFrom: 'بینینی گەشتەکان بۆ',
      availableTripsTitle: 'گەشتە بەردەستەکانی ئێستا',
      availableTripsSub: 'نرخی شەفاف بۆ هەر کورسییەک و نوێکردنەوەی خێرای کورسییەکان.',
      showingCount: 'گەشتی بەردەست',
      resetFilters: 'پیشاندانی هەموو گەشتەکان',
      noTripsTitle: 'هیچ گەشتێک نەدۆزرایەوە بۆ گەڕانەکەت',
      noTripsDesc: 'بەروار یان پارێزگاکە بگۆڕە، یان سەیری هەموو گەشتە بەردەستەکان بکە.',
      cheapestTripsTitle: 'هەرزانترین گەشتە بەردەستەکان',
      cheapestTripsSub: 'نرخەکان بەراورد بکە و باشترین کورسی هەڵبژێرە.',
      specialOffersTitle: 'ئۆفەرە تایبەتەکان',
      specialOffersSub: 'داشکاندنی تایبەت لەلایەن شۆفێرەکانەوە بۆ گەشتە دیاریکراوەکان.',
      mapTitle: 'ڕووماڵی گواستنەوە لە پارێزگاکان',
      mapSub: 'وەرگرتن و گەیاندن لە نێوان هەموو پارێزگاکانی عێراقدا.',
      loyaltyTitle: 'سیستەمی خاڵەکانی مەسار و پاداشت',
      loyaltySub: 'زیاتر گەشت بکە و خاڵ کۆبکەرەوە بۆ گەشتی بێبەرامبەر.',
      loyaltyEarnRule: 'خاڵ دەخرێتە سەر هەژمارەکەت دوای تەواوبوونی هەر گەشتێکی ڕاستەقینە',
      loyaltyRedeemRule: 'خاڵ بلیتێکی گەشتی بێبەرامبەرت پێدەبەخشێت',
      loyaltyReferralRule: 'خاڵی پاداشت بۆ تۆ و هاوڕێکەت دوای تەواوبوونی یەکەم گەشت',
      loyaltyCta: 'کردنەوەی جزدانەی خاڵەکان',
      topDriversTitle: 'باشترین شۆفێرە متمانەپێکراوەکان',
      topDriversSub: 'هەموو شۆفێرێک بەڵگەنامە و مۆڵەت و ئۆتۆمبێلەکەی پشکنینی بۆ دەکرێت پێش بڵاوکردنەوەی گەشت.',
      noDriversYet: 'شۆفێرە پەسەندکراوەکان لێرە دەردەکەون دوای پەسەندکردنی داواکارییەکانیان.',
      reviewsTitle: 'بۆچوونی گەشتیاران',
      reviewsSub: 'هەڵسەنگاندنی ڕاستەقینە لەلایەن گەشتیارانەوە دوای تەواوکردنی گەشتەکانیان.',
      noReviewsYet: 'هێشتا هیچ هەڵسەنگاندنێک بڵاونەکراوەتەوە.',
      howItWorksTitle: 'پلاتفۆرمی مەساری عێراق چۆن کاردەکات؟',
      howItWorksSub: 'چوار هەنگاوی سادە بەبێ چوون بۆ گەراج و چاوەڕوانی بەیانیان.',
      step1Title: 'گەڕان و بەراورد',
      step1Desc: 'پارێزگای دەرچوون، ئاراستە و بەروار هەڵبژێرە و نرخ و کورسییەکان بەراورد بکە.',
      step2Title: 'ناردنی داواکاری',
      step2Desc: 'ژمارەی کورسییەکان و ناونیشانی وەرگرتن لە ماڵەوە دیاری بکە و داواکاری بنێرە.',
      step3Title: 'پەسەندکردنی دەستبەجێ',
      step3Desc: 'شۆفێر داواکارییەکەت پەسەند دەکات و کورسییەکەت دەستبەجێ دەگیرێت بۆ هاتنە ماڵەوە.',
      step4Title: 'وەرگرتن لە ماڵەوە و کاش',
      step4Desc: 'شۆفێر دێتە ماڵەوە یان شوێنی ڕێککەوتن، بە کاش پارە بدە و خاڵی پاداشت وەربگرە.',
      becomeDriverTitle: 'شۆفێری نێوان پارێزگاکانیت؟',
      becomeDriverSub: 'پێشوەختە کورسییەکانی ئۆتۆمبێلەکەت پڕ بکەرەوە و شوێنی وەرگرتنی گەشتیاران و داهاتت ڕێکبخە.',
      becomeDriverBenefit1: 'حجزکردنی پێشوەختە بەبێ چاوەڕوانی لە گەراج',
      becomeDriverBenefit2: 'باجی فەرمی شۆفێری باوەڕپێکراو بۆ متمانەی زیاتر',
      becomeDriverBenefit3: 'بەڕێوەبردنی تەواوی گەشت، کاش و داهاتەکان',
      becomeDriverCta: 'ئێستا وەک شۆفێر تۆمارببە',
      supportTitle: 'پاڵپشتی گەشتیار و شۆفێران',
      supportSub: 'تیمی پاڵپشتی ئامادەیە بۆ وەڵامدانەوەی پرسیارەکان و ڕێکخستنی گەشتەکان.',
      supportContactBtn: 'پەیوەندی بە پاڵپشتییەوە',
      footerDesc: 'پلاتفۆرمی عێراقی بۆ گرتنی کورسی تەکسی هاوبەش لە نێوان پارێزگاکان بە وەرگرتن لە ماڵەوە یان شوێنی ڕێککەوتن.',
      footerLegal: 'سیاسەت و یاساکان',
      footerRoutes: 'بەستەرە خێراکان',
      privacyPolicy: 'سیاسەتی پاراستنی نهێنی',
      termsConditions: 'مەرج و ڕێساکان',
      cancellationPolicy: 'سیاسەتی هەڵوەشاندنەوە',
      contactUs: 'پەیوەندیمان پێوە بکە',
      copyright: 'هەموو مافەکان پارێزراون بۆ مەساری عێراق',
      fareCompareTitle: 'بەراوردی تێکڕای نرخی هێڵە سەرەکییەکان',
      fareCompareSub: 'تێکڕای کرێی کورسی بە دیناری عێراقی لە نێوان پارێزگا سەرەکییەکاندا بەراورد بکە.',
      avgFareLabel: 'تێکڕای کرێی کورسی',
      partnersTitle: 'ڕووماڵی وەرگرتن لە پارێزگاکانی عێراق',
      partnersSub: 'وەرگرتن لە ماڵەوە یان شوێنی ڕێککەوتن لە بەغدا، هەولێر، بەسرە و هەموو پارێزگاکان.',
      partnerStationTag: 'ڕووماڵی چالاک',
      ratingBreakdownTitle: 'وردەکاری هەڵسەنگاندنی گەشتیاران و کوالیتی خزمەتگوزاری',
      ratingOverallLabel: 'ئاستی متمانەی پلاتفۆرم',
      ratingBasedOn: 'لەسەر بنەمای گەشتە تەواوبووەکانی نێوان پارێزگاکان',
      ratingPunctuality: 'پابەندبوون بە کاتی دەرچوون',
      ratingComfort: 'پاکوخاوێنی و ئاسوودەیی ئۆتۆمبێل',
      ratingStations: 'وردی هاتن بۆ شوێنی وەرگرتن',
      ratingValue: 'شەفافیەتی نرخ و بەها',
      fastFactsTitle: 'زانیاری خێرا لەسەر مەساری عێراق',
      fact1Title: 'تۆڕی پارێزگاکان',
      fact1Value: '١٨ پارێزگای عێراق بەیەکەوەبەستراون',
      fact2Title: 'پارەدانی پێشوەختە',
      fact2Value: '٠ د.ع — لەناو ئۆتۆمبێل بە کاش بدە',
      fact3Title: 'خاڵی دڵسۆزی',
      fact3Value: '+5,000 خاڵ بۆ هەر گەشتێکی تەواوبوو',
      fact4Title: 'پشکنینی شۆفێر',
      fact4Value: '١٠٠٪ پشکنینی ناسنامە و مۆڵەت',
      faqTitle: 'پرسیارە باوەکان دەربارەی حجزکردنی تەکسی هاوبەش',
      faqSub: 'وەڵامی ڕوون بۆ حجزکردن، وەرگرتن لە ماڵەوە، پارەدان، و گۆڕینی کات.',
      faqItems: [
        {
          q: 'چۆن کورسییەکەم دڵنیا دەکرێتەوە بەبێ چوون بۆ گەراج؟',
          a: 'هێڵ و بەروار و ژمارەی کورسی هەڵبژێرە و داواکاری بنێرە. دوای پەسەندکردنی شۆفێر، کورسییەکەت بە ژمارەی تابلۆ جێگیر دەبێت و شۆفێر دێتە ماڵەوە یان شوێنی ڕێککەوتن.',
        },
        {
          q: 'ئایا پێویستە کاتی حجزکردن پارە بە ئۆنلاین بدەم؟',
          a: 'نەخێر، هەموو گەشتەکان بە کاش ڕاستەوخۆ دەدرێن بە شۆفێر کاتی وەرگرتن، یان دەتوانیت خاڵەکانی دڵسۆزی بەکاربهێنیت.',
        },
        {
          q: 'سیاسەتی هەڵوەشاندنەوە یان گۆڕینی کات چییە؟',
          a: 'داواکاری هەڵپەسێردراو هەموو کات هەڵدەوەشێتەوە، و حجزە پەسەندکراوەکان لانیکەم ٣ کاتژمێر پێش دەرچوون بەبێ سزا هەڵدەوەشێنەوە.',
        },
        {
          q: 'چۆن دڵنیایی لە شۆفێرەکان دەکرێتەوە؟',
          a: 'هەموو شۆفێرێک کارتی نیشتمانی، مۆڵەتی شۆفێری و وێنەی ئۆتۆمبێل پێشکەش دەکات و لەلایەن تیمی کارگێڕییەوە پەسەند دەکرێت.',
        },
      ],
      footerSupportTitle: 'خزمەتگوزاری گەشتیار',
      footerDriverTitle: 'هاوبەش و شۆفێران',
      footerPlatformNote: 'عێراق · دراوی فەرمی: دیناری عێراقی (IQD)',
      startingFrom: 'دەستپێکردن لە',
      noFareDataYet: 'هێشتا داتای نرخ نییە — تێکڕای نرخەکان بە خۆکار دەردەکەون کاتێک شۆفێران گەشت بڵاودەکەنەوە.',
      noRoutesYetShort: 'چاوەڕوانی گەشتە',
      emptyCarsTitle: 'ئۆتۆمبێلی بەتاڵ (حجزی تەواوی ئۆتۆمبێل)',
      emptyCarsSub: 'تەواوی ئۆتۆمبێل بگرە بە نرخی دیاریکراوی کاپتن کاتێک هیچ کورسییەک حجز نەکراوە.',
      emptyCarsPageTitle: 'بەشی ئۆتۆمبێلە بەتاڵەکان — حجزی تەواوی ئۆتۆمبێل',
      emptyCarsPageSub: 'ئەو ئۆتۆمبێلانە ببینە کە بۆ حجزی تەواو بەردەستن (٤ یان ٦ کورسی) بە نرخی کاپتن.',
      emptyCarsEmptyState: 'هیچ ئۆتۆمبێلێک بە نرخی حجزی تەواو نەدۆزرایەوە بۆ فلتەرەکەت.',
      viewAllEmptyCars: 'پیشاندانی هەموو ئۆتۆمبێلە بەتاڵەکان',
      emptyCarsCount: 'ئۆتۆمبێل بە نرخی تەواو',
      emptyCarsFilterAll: 'هەموو ئۆتۆمبێلەکان',
      emptyCarsFilterOnlyEmpty: 'تەنها تەواو بەتاڵەکان',
      emptyCarsFilter4Seats: '٤ کورسی',
      emptyCarsFilter6Seats: '٦ کورسی',
    },

    tripCard: {
      seatsAvailable: 'کورسی ماوە',
      fullTrip: 'پڕبووە',
      perSeat: 'بۆ کورسییەک',
      cashOnBoard: 'پارەدان بە کاش',
      verifiedDriver: 'شۆفێری باوەڕپێکراو',
      completedTrips: 'گەشتی تەواوبوو',
      specialOffer: 'ئۆفەری تایبەت',
      bookSeat: 'کورسی بگرە',
      notifySeat: 'ئاگادارم بکەرەوە کاتێک کورسی بەتاڵ بوو',
      alertSubscribed: 'ئاگادارکردنەوە چالاککرا',
      garageDeparture: 'خاڵی دەرچوون',
      garageArrival: 'خاڵی گەیشتن',
      homePickupLabel: 'وەرگرتن لە ماڵەوە یان شوێنی ڕێککەوتن',
      durationMins: 'خولەک',
      ownTrip: 'گەشتی خۆتە',
      unratedDriver: 'نوێ',
      fullCarPriceLabel: 'نرخی تەواوی ئۆتۆمبێل',
      bookFullCar: 'حجزی تەواوی ئۆتۆمبێل',
      carNotEmpty: 'ئۆتۆمبێلەکە بەتاڵ نییە',
      carNotEmptyTooltip: 'ئۆتۆمبێلەکە بەتاڵ نییە — لانیکەم یەک کورسی حجزکراوە',
      emptyCarReadyBadge: 'تەواو بەتاڵە',
      seatsCapacityBadge: 'فراوانی',
      seatsUnit: 'کورسی',
    },

    auth: {
      welcomeTitle: 'چوونەژوورەوە بۆ مەساری عێراق',
      welcomeSub: 'بە هەژماری Google بچۆ ژوورەوە بۆ بەڕێوەبردنی گەشتەکانت وەک گەشتیار یان شۆفێر.',
      continueGoogle: 'بەردەوامبوون بە Google',
      completeProfileTitle: 'تەواوکردنی زانیاری هەژمار',
      completeProfileSub: 'زانیارییەکانت بنووسە بۆ چالاککردنی تەواوی هەژمارەکەت.',
      chooseRole: 'جۆری هەژمار هەڵبژێرە',
      rolePassenger: 'هەژماری گەشتیار',
      rolePassengerDesc: 'بۆ گەڕان، حجزکردنی کورسی و کۆکردنەوەی خاڵی پاداشت.',
      roleDriver: 'هەژماری شۆفێر',
      roleDriverDesc: 'تۆمارکردنی ئۆتۆمبێل و بەڵگەنامە بۆ پەسەندکردنی کارگێڕی و بڵاوکردنەوەی گەشت.',
      fullName: 'ناوی تەواو',
      phone: 'ژمارەی مۆبایلی عێراقی',
      phonePlaceholder: '0750 123 4567',
      governorate: 'پارێزگا',
      referralCodeOptional: 'کۆدی بانگهێشت (ئارەزوومەندانە)',
      referralCodePlaceholder: 'نموونە: MASAR-A1B2',
      driverDetailsSection: 'زانیاری پشکنینی شۆفێر',
      homeGarage: 'گەراجی سەرەکی',
      nationalIdNumber: 'ژمارەی کارتی نیشتمانی',
      licenseNumber: 'ژمارەی مۆڵەتی شۆفێری',
      idDocumentPhoto: 'وێنەی کارتی نیشتمانی',
      licenseDocumentPhoto: 'وێنەی مۆڵەتی شۆفێری',
      vehicleSection: 'زانیاری ئۆتۆمبێل',
      vehicleModel: 'جۆر و مۆدێلی ئۆتۆمبێل',
      vehicleModelPlaceholder: 'تۆیۆتا کامری / هیوندای ستاریا',
      vehicleYear: 'ساڵی دروستکردن',
      plateNumber: 'ژمارەی تابلۆ',
      plateSectionGov: 'پارێزگا و کۆد',
      plateSectionLetter: 'پیت',
      plateSectionDigits: 'ژمارە',
      plateFormatHint: 'نموونە: 22 هەولێر | H | 12345',
      platePreviewLabel: 'پێشبینینی تابلۆ',
      vehicleColor: 'ڕەنگ',
      passengerCapacity: 'ژمارەی کورسی سەرنشین',
      vehiclePhoto: 'وێنەی ئۆتۆمبێل',
      uploadFile: 'هەڵبژاردنی وێنە',
      fileAttached: 'وێنە هاوپێچکرا',
      submitRegistration: 'تۆمارکردن و ناردن',
      submitting: 'تۆمار دەکرێت...',
      accountSuspendedTitle: 'ئەم هەژمارە بە شێوەی کاتی ڕاگیراوە',
      accountSuspendedDesc: 'تکایە پەیوەندی بە کارگێڕیی مەساری عێراقەوە بکە.',
      invalidReferralCode: 'کۆدی بانگهێشت نەدۆزرایەوە. دڵنیابە لە کۆدەکە.',
      selfReferralBlocked: 'ناتوانیت کۆدی بانگهێشتی خۆت بەکاربهێنیت.',
      loginTab: 'چوونەژوورەوە',
      registerTab: 'دروستکردنی هەژمار',
      registerAsPassenger: 'تۆمارکردن وەک گەشتیار',
      registerAsDriver: 'تۆمارکردن وەک شۆفێر',
      email: 'ئیمەیڵ',
      emailPlaceholder: 'name@example.com',
      password: 'وشەی نهێنی',
      passwordPlaceholder: 'لانیکەم ٦ پیت',
      showPassword: 'پیشاندانی وشەی نهێنی',
      hidePassword: 'شاردنەوەی وشەی نهێنی',
      signInButton: 'چوونەژوورەوە',
      signingIn: 'چوونەژوورەوە...',
      orContinueWith: 'یان بەردەوامبە بە Google',
      requiredDocsTitle: 'بەڵگەنامە و وێنە داواکراوەکان',
      requiredDocsHintPassenger: 'بۆ تۆمارکردن وەک گەشتیار، پێویست بە بارکردنی ناسنامە ناکات — تەنها وێنەی کەسیت باربکە.',
      requiredDocsHintDriver: 'بۆ تۆمارکردن وەک شۆفێر، ٥ وێنە پێویستە: وێنەی کەسی، پێشەوە و پشتەوەی ناسنامە، و پێشەوە و پشتەوەی مۆڵەتی شۆفێری.',
      idCardPhoto: 'وێنەی ناسنامە',
      idGroupLabel: 'کارتی نیشتمانی / ناسنامە',
      idFrontPhoto: 'پێشەوە — کارتی نیشتمانی',
      idBackPhoto: 'پشتەوە — کارتی نیشتمانی',
      portraitPhoto: 'وێنەی کەسیت',
      drivingLicensePhoto: 'وێنەی مۆڵەتی شۆفێری',
      licenseGroupLabel: 'مۆڵەتی شۆفێری',
      licenseFrontPhoto: 'پێشەوە — مۆڵەتی شۆفێری',
      licenseBackPhoto: 'پشتەوە — مۆڵەتی شۆفێری',
      frontSideLabel: 'پێشەوە',
      backSideLabel: 'پشتەوە',
      requiredTag: 'پێویستە',
      replacePhoto: 'گۆڕین',
      removePhoto: 'سڕینەوە',
      tapToUpload: 'کرتە بکە بۆ هەڵبژاردنی وێنە',
      missingRequiredFields: 'تکایە هەموو خانە پێویستەکان پڕبکەرەوە و وێنە داواکراوەکان باربکە.',
      creatingAccount: 'دروستکردنی هەژمار...',
      uploadingPhotos: 'بارکردنی وێنەکان بۆ Firebase Storage...',
      savingProfile: 'پاشەکەوتکردنی زانیارییەکان...',
      pendingReview: 'لەژێر پێداچوونەوەدا',
      verifiedStatus: 'پەسەندکراو',
      rejectedStatus: 'ڕەتکراوەتەوە',
      noAccountPrompt: 'هەژمارت نییە؟',
      hasAccountPrompt: 'پێشتر هەژمارت هەیە؟',
      createAccountBtn: 'دروستکردنی هەژمار',
      noOtpNote: 'تەنها بۆ پەیوەندیکردنی ڕاستەوخۆ بەکاردێت بەبێ کۆدی SMS.',
      checkingAccount: 'پشکنینی دۆخی هەژمار...',
      pendingApprovalBannerTitle: 'هەژمارەکەت لەژێر پێداچوونەوەدایە / چاوەڕوانی پەسەندکردنی کارگێڕییە',
      pendingApprovalBannerDesc: 'بەڵگەنامەکانت وەرگیران. دوای پەسەندکردنی کارگێڕی دەتوانیت حجز بکەیت یان گەشت بڵاوبکەیتەوە.',
      verifiedPassengerBadge: 'هەژماری گەشتیاری پەسەندکراو',
      resubmitDocsTitle: 'دووبارە ناردنی بەڵگەنامەکان بۆ پێداچوونەوە',
      resubmitDocsBtn: 'ناردنی بەڵگەنامە نوێکراوەکان',
      docsResubmitted: 'بەڵگەنامەکان نێردرانەوە و ئێستا لەژێر پێداچوونەوەی کارگێڕیدایە.',
    },

    booking: {
      modalTitle: 'داواکاری حجزکردنی کورسی',
      routeSummary: 'پوختەی گەشت',
      seatsCount: 'ژمارەی کورسی',
      notesLabel: 'ناونیشانی وەرگرتن یان تێبینی بۆ شۆفێر',
      notesPlaceholder: 'نموونە: تکایە وەرگرتن لە ماڵەوە - گەڕەک یان شوێنی ڕێککەوتن',
      paymentMethodTitle: 'شێوازی پارەدان',
      payCashLabel: 'پارەدان بە کاش لەکاتی سەرکەوتن',
      payCashDesc: 'بڕی پارەکە ڕاستەوخۆ بە کاش دەدرێت بە شۆفێر.',
      redeemPointsLabel: 'گۆڕینەوەی خاڵەکان بۆ گەشتی بێبەرامبەر',
      redeemPointsDesc: 'خاڵەکانت بەکاربهێنە بۆ بەدەستهێنانی کورسی بێبەرامبەر.',
      insufficientPoints: 'خاڵەکانت بەشی گۆڕینەوە ناکەن.',
      exceedsMaxFreeValue: 'نرخی ئەم گەشتە لە بەرزترین ئاستی گەشتی بێبەرامبەر زیاترە.',
      onlyOneSeatForFree: 'گۆڕینەوەی خاڵ تەنها بۆ یەک کورسی دەبێت.',
      roundTripLabel: 'زیادکردنی گەشتی گەڕانەوە (چوون و هاتن)',
      selectReturnTrip: 'گەشتی گەڕانەوەی بەردەست هەڵبژێرە',
      noReturnTrips: 'لە ئێستادا هیچ گەشتێکی گەڕانەوە بەردەست نییە.',
      totalDueCash: 'کۆی گشتی بە کاش',
      pointsToDeduct: 'خاڵی بڕدراو',
      policyNotice: 'حجزی پەسەندکراو دەتوانرێت هەڵبوەشێنرێتەوە پێش کاتی دیاریکراو بەپێی سیاسەتی هەڵوەشاندنەوە.',
      confirmRequest: 'ناردنی داواکاری حجز',
      requestSent: 'داواکاری حجز بە سەرکەوتوویی بۆ شۆفێر نێردرا.',
      cancel: 'پاشگەزبوونەوە',
      selectSeatsTitle: 'کورسییەکەت لەناو ئۆتۆمبێلدا هەڵبژێرە',
      frontOfCar: 'پێشەوەی ئۆتۆمبێل',
      driverSeatLabel: 'شۆفێر',
      seatFrontPassenger: 'تەنیشت شۆفێر',
      seatRearRight: 'دواوەی ڕاست',
      seatRearMiddle: 'دواوەی ناوەڕاست',
      seatRearLeft: 'دواوەی چەپ',
      seatExtraRight: 'زیادەی ڕاست',
      seatExtraLeft: 'زیادەی چەپ',
      seatAvailable: 'بەردەستە',
      seatSelected: 'هەڵبژێردراو',
      seatBooked: 'حجزکراوە',
      selectedSeatsLabel: 'کورسییە هەڵبژێردراوەکان',
      selectAtLeastOneSeat: 'تکایە لانیکەم یەک کورسی لە نەخشەکەوە هەڵبژێرە.',
      seatAlreadyBooked: 'یەکێک لە کورسییەکان تازە حجزکرا، تکایە کورسییەکی تر هەڵبژێرە.',
      dropOffTitle: 'شوێنی دابەزین لە کاتی گەیشتن',
      standardDropOffLabel: 'گەیاندنی ئاسایی (لەسەر ڕێڕەو)',
      standardDropOffDesc: 'دابەزین لە خاڵی گەیشتنی دیاریکراو بەبێ تێچووی زیادە.',
      customDropOffLabel: 'گەیاندن بۆ شوێنی دیاریکراو لەسەر نەخشە (+10,000 د.ع)',
      customDropOffDesc: 'شوێنی دابەزینی ورد لەسەر نەخشە هەڵبژێرە بۆ ئەوەی شۆفێر ڕاستەوخۆ بتگەیەنێت.',
      customDropOffFeeLabel: 'تێچووی گەیاندن بۆ شوێنی دیاریکراو',
      customDropOffAddressLabel: 'نزیکترین نیشانە یان ناونیشانی دابەزین (ئارەزوومەندانە)',
      customDropOffAddressPlaceholder: 'نموونە: نزیک دەروازەی زانکۆ، شەقامی ٦٠...',
      locatingMap: 'خەریکە شوێنەکەت لەسەر نەخشە دیاری دەکرێت...',
      locatedSuccess: 'شوێنی ئێستات لەسەر نەخشە دیاریکرا',
      locateFallbackNotice: 'نەتوانرا شوێنەکەت بە شێوەی خۆکار بدۆزرێتەوە — کرتە لەسەر نەخشە بکە یان نیشانەکە بجوڵێنە.',
      recenterMyLocation: 'دیاریکردنی شوێنی ئێستام',
      tapOrDragPinHint: 'کرتە لەسەر نەخشە بکە یان نیشانە شینەکە ڕابکێشە بۆ دیاریکردنی شوێن.',
      selectedCoordsLabel: 'پۆتانە هەڵبژێردراوەکان',
      customDropOffMissingCoords: 'تکایە سەرەتا شوێنی دابەزین لەسەر نەخشە دیاری بکە.',
      openDriverNavLink: 'کردنەوەی ئاڕاستەی گەیاندن (Google Maps)',
      customDropOffBadge: 'گەیاندنی تایبەت',
      seatsSubtotalLabel: 'کۆی کورسییە هەڵبژێردراوەکان',
      cargoOptionTitle: 'گواستنەوەی کاڵا و پاکێج لەگەڵ شۆفێر',
      cargoOptionDesc: 'پاکێج یان بار زیاد بکە بۆ ئەم گەشتە بەپێی نرخی دیاریکراوی شۆفێر.',
      cargoAddLabel: 'زیادکردنی گواستنەوەی کاڵا / پاکێج بۆ ئەم گەشتە',
      cargoFeeLabel: 'کرێی گواستنەوەی کاڵا / پاکێج',
      cargoNotesPlaceholder: 'وەسفی پاکێج یان کاڵا (نموونە: جانتای مامناوەند، بەڵگەنامە...)',
      cargoBadge: 'لەگەڵ پاکێج',
      cargoAvailableBadge: 'ناردنی پاکێج بەردەستە',
      seatPriceRangeHint: 'بەپێی کورسی هەڵبژێردراو',
      fullCarModalTitle: 'حجزی تەواوی ئۆتۆمبێل',
      fullCarFareLabel: 'نرخی تەواوی ئۆتۆمبێل (نرخی کاپتن)',
      fullCarIncludedAllSeats: 'هەموو کورسییەکانی ناو ئۆتۆمبێلەکە بۆ گەشتی تایبەت دەگیرێن.',
      fullCarCannotRedeemPoints: 'گۆڕینەوەی خاڵ تەنها بۆ یەک کورسی دەبێت و بۆ حجزی تەواو بەکارنایەت.',
      carNotEmptyError: 'ببورە، ئەم ئۆتۆمبێلە بەتاڵ نییە (کورسییەک یان زیاتر حجزکراوە).',
    },

    statuses: {
      pending: 'چاوەڕوانە',
      accepted: 'پەسەندکراو',
      rejected: 'ڕەتکراوەتەوە',
      cancelled: 'هەڵوەشاوەتەوە',
      completed: 'تەواوبووە',
      scheduled: 'خشتەکراو',
      in_progress: 'لە ڕێگادایە',
      approved: 'پەسەندکراو',
      suspended: 'ڕاگیراو',
      blocked: 'بلۆککراو',
      active: 'چالاک',
      unpaid: 'نەدراوە',
      paid: 'بە کاش دراوە',
      disputed: 'کێشەی لەسەرە',
      refunded: 'گەڕێندراوەتەوە',
      open: 'کراوەیە',
      investigating: 'لەژێر پشکنیندایە',
      resolved: 'چارەسەرکرا',
      dismissed: 'داخرا',
      published: 'بڵاوکراوە',
      hidden: 'شاردراوە',
    },

    passenger: {
      title: 'پانێڵی گەشتیار',
      tabSearch: 'گەڕان و حجز',
      tabBookings: 'حجزەکانم',
      tabLoyalty: 'خاڵەکانی دڵسۆزی',
      tabReferrals: 'بانگهێشتی هاوڕێیان',
      tabNotifications: 'ئاگادارکردنەوەکان',
      tabSupport: 'پاڵپشتی و سکاڵا',
      tabProfile: 'پڕۆفایل',
      upcomingBookings: 'حجزە ئێستا و داهاتووەکان',
      bookingHistory: 'مێژووی گەشتەکان',
      noBookings: 'هێشتا هیچ حجزێکت نییە. گەڕان بکە بۆ گەشتێک.',
      cancelBooking: 'هەڵوەشاندنەوەی حجز',
      cancelReasonPrompt: 'هۆکاری هەڵوەشاندنەوە (ئارەزوومەندانە):',
      rescheduleBtn: 'داواکاری گۆڕینی کات',
      newDatePrompt: 'بەرواری نوێ بنووسە (YYYY-MM-DD):',
      shareTripBtn: 'هاوبەشکردنی زانیاری گەشت لەگەڵ خێزان',
      copiedShareText: 'زانیاری گەشت کۆپیکرا.',
      liveLocationActive: 'شوێنی ڕاستەوخۆی شۆفێر بەردەستە',
      rateDriverBtn: 'هەڵسەنگاندنی شۆفێر و گەشت',
      driverRating: 'هەڵسەنگاندنی شۆفێر',
      vehicleRating: 'هەڵسەنگاندنی ئۆتۆمبێل',
      experienceRating: 'هەڵسەنگاندنی گشتی',
      reviewComment: 'بۆچوونی خۆت بنووسە',
      submitReview: 'ناردنی هەڵسەنگاندن',
      disputePaymentBtn: 'تۆمارکردنی کێشەی پارەدان',
      disputeReason: 'کێشەی پارەدان بە کاش ڕوونبکەرەوە:',
      walletBalance: 'باڵانسی ئێستا',
      totalEarned: 'کۆی خاڵە بەدەستهاتووەکان',
      totalRedeemed: 'کۆی خاڵە بەکارهاتووەکان',
      progressFreeTrip: 'پێشکەوتن بەرەو گەشتی بێبەرامبەر',
      pointsRemaining: 'خاڵ ماوە بۆ گەشتی بێبەرامبەر',
      freeTripReady: 'ئێستا دەتوانیت خاڵەکانت بگۆڕیتەوە بۆ گەشتی بێبەرامبەر!',
      transactionsHistory: 'مێژووی جوڵەی خاڵەکان',
      noTransactions: 'هێشتا هیچ جوڵەیەکی خاڵ تۆمارنەکراوە.',
      yourReferralLink: 'بەستەری بانگهێشتی تایبەتی تۆ',
      yourReferralCode: 'کۆدی بانگهێشت',
      copyLink: 'کۆپیکردنی بەستەر',
      linkCopied: 'بەستەری بانگهێشت کۆپیکرا.',
      referredFriends: 'هاوڕێ بانگهێشتکراوەکان',
      noReferrals: 'هێشتا هیچ هاوڕێیەک لە ڕێگەی بەستەرەکەتەوە تۆمارنەبووە.',
      markAllRead: 'هەمووی وەک خوێندراو دیاریبکە',
      noNotifications: 'هیچ ئاگادارکردنەوەیەکی نوێ نییە.',
      submitComplaintTitle: 'ناردنی سکاڵا یان داواکاری پاڵپشتی',
      complaintCategory: 'جۆری سکاڵا',
      complaintSubject: 'بابەت',
      complaintDesc: 'وردەکاری',
      sendComplaint: 'ناردنی سکاڵا',
      myComplaints: 'سکاڵاکانی پێشوو',
      profileSave: 'پاشەکەوتکردن',
      profileSaved: 'زانیارییەکانت بە سەرکەوتوویی نوێکرانەوە.',
    },

    driver: {
      title: 'پانێڵی شۆفێر',
      tabOverview: 'پوختەی هەژمار',
      tabRequests: 'داواکاری حجزەکان',
      tabMyTrips: 'گەشتەکانم',
      tabPublish: 'بڵاوکردنەوەی گەشت',
      tabVehicleDocs: 'بەڵگەنامە و ئۆتۆمبێل',
      tabEarnings: 'داهات و پارەدان',
      tabReviews: 'هەڵسەنگاندنەکان',
      verificationPendingTitle: 'هەژمارەکەت لەژێر پێداچوونەوەی کارگێڕیدایە',
      verificationPendingDesc: 'ناتوانیت گەشت بڵاوبکەیتەوە تا بەڵگەنامەکانت پەسەند دەکرێن.',
      verificationRejectedTitle: 'داواکاری پەسەندکردن ڕەتکرایەوە',
      verificationApprovedBadge: 'شۆفێری باوەڕپێکراو و پەسەندکراو',
      availabilityToggle: 'باری ئامادەبوون',
      availableNow: 'ئامادەم بۆ گەشت',
      offlineNow: 'لە ئێستادا بەردەست نیم',
      acceptBooking: 'پەسەندکردن و گرتنی کورسی',
      rejectBooking: 'ڕەتکردنەوە',
      rejectReason: 'هۆکاری ڕەتکردنەوە (ئارەزوومەندانە):',
      confirmCashPaid: 'پشتڕاستکردنەوەی وەرگرتنی کاش',
      markCompleted: 'تەواوکردنی گەشت و پێدانی خاڵ',
      startTrip: 'دەستپێکردنی گەشت',
      completeTrip: 'کۆتاییهێنان بە گەشت',
      cancelTrip: 'هەڵوەشاندنەوەی گەشت',
      shareLiveLocation: 'هاوبەشکردنی شوێنی ڕاستەوخۆ',
      stopLiveLocation: 'وەستاندنی شوێنی ڕاستەوخۆ',
      publishTripTitle: 'دروستکردن و بڵاوکردنەوەی گەشتی نوێ',
      departureGov: 'پارێزگای دەرچوون',
      destinationGov: 'پارێزگای گەیشتن',
      departureGarage: 'گەراجی دەرچوون',
      destinationGarage: 'گەراجی گەیشتن',
      departureDate: 'بەرواری دەرچوون',
      departureTime: 'کاتی دەرچوون',
      pricePerSeat: 'نرخی کورسی (د.ع)',
      originalPriceOptional: 'نرخی پێش داشکاندن (ئارەزوومەندانە)',
      seatsToOffer: 'ژمارەی کورسی بەردەست',
      estimatedDuration: 'ماوەی خەمڵێنراو (خولەک)',
      tripNotes: 'تێبینی بۆ گەشتیاران',
      publishTripBtn: 'بڵاوکردنەوەی گەشت',
      editTripLockedNotice: 'دوای پەسەندکردنی حجز، نرخ و ڕێڕەو ناگۆڕدرێن.',
      totalEarningsGross: 'کۆی پارەی وەرگیراو',
      platformCommission: 'کۆمیسیۆنی پلاتفۆرم',
      netEarnings: 'داهاتی پاکی شۆفێر',
      completedBookingsCount: 'حجزە تەواوبووەکان',
      saveVehicleDocs: 'نوێکردنەوەی زانیاری ئۆتۆمبێل و بەڵگەنامە',
      savedSuccess: 'زانیارییەکان بە سەرکەوتوویی پاشەکەوتکران.',
      noRequests: 'هیچ داواکارییەکی حجز نییە.',
      noTrips: 'هێشتا هیچ گەشتێکت بڵاونەکردووەتەوە.',
      addNewTripBtn: 'زیادکردنی گەشتی نوێ',
      departureDateTimeLabel: 'کاتی دەرچوون',
      pickupNotesLabel: 'تێبینییەکانی دەرچوون / گەیاندن (ئارەزوومەندانە)',
      pickupNotesPlaceholder: 'نموونە: دەرچوون لە مەنسوور، وەرگرتن لە ماڵەوە بەپێی ڕێککەوتن...',
      autoAttachedInfoTitle: 'زانیاری شۆفێر و ئۆتۆمبێل بە شێوەی خۆکار دەبەسترێتەوە',
      fourCabinSeatsReady: 'هەر ٤ کورسییەکەی ناو ئۆتۆمبێل بە بەتاڵی دادەنرێت بۆ هەڵبژاردنی گەشتیاران.',
      deleteTrip: 'سڕینەوەی گەشت',
      confirmDeleteTrip: 'دڵنیاکردنەوەی سڕینەوە',
      tripBookingsTitle: 'حجزە هاتووەکان و شوێنی گەیاندن',
      noTripBookings: 'هێشتا هیچ حجزێک بۆ ئەم گەشتە نییە.',
      cabinSeatsOverview: 'دۆخی ٤ کورسییەکە',
      perSeatPricingTitle: 'نرخدانان بۆ هەر کورسییەک بە جیا (د.ع)',
      applyToAllSeats: 'جێبەجێکردن بۆ هەمووان',
      baseSeatPrice: 'نرخی بنەڕەتی خێرا',
      seatPriceShort: 'نرخی کورسی',
      cargoShippingTitle: 'گواستنەوەی کاڵا و پاکێج',
      enableCargoTransport: 'ڕێگەدان بە گواستنەوەی کاڵا و پاکێج لەم گەشتەدا',
      cargoPriceLabel: 'کرێی ناردنی کاڵا / پاکێج (د.ع)',
      editTripBtn: 'دەستکاری گەشت و نرخ',
      saveTripChangesBtn: 'پاشەکەوتکردنی گۆڕانکارییەکان',
      tripUpdatedSuccess: 'زانیاری و نرخەکانی گەشت بە سەرکەوتوویی نوێکرانەوە.',
      seatCapacityLabel: 'فراوانی ئۆتۆمبێل بۆ ئەم گەشتە',
      capacity4Seats: '٤ کورسی (ئۆتۆمبێلی ئاسایی)',
      capacity6Seats: '٦ کورسی (٤ سەرەکی + ٢ کورسی زیادە)',
      fullCarPriceLabel: 'نرخی حجزی تەواوی ئۆتۆمبێل (د.ع)',
      fullCarPricePlaceholder: 'نموونە: 120000 (بەتاڵی بهێڵە یان 0 بۆ ناچالاککردن)',
      fullCarPriceHint: 'لە بەشی «ئۆتۆمبێلی بەتاڵ» دەردەکەوێت تا کاتێک هیچ کورسییەک حجز نەکرابێت.',
      sixCabinSeatsReady: 'هەر ٦ کورسییەکە (6/6 بەتاڵ) ئامادە دەکرێن لەوانە ٢ کورسی زیادەکەی نەخشەی سێڕەهەندی.',
      fullCarBadge: 'حجزی تەواوی ئۆتۆمبێل',
      cabinSeatsOverview6: 'دۆخی ٦ کورسییەکە',
      weeklyFeeModalTitle: 'دانی کۆمیسیۆنی هەفتانە (20,000 د.ع)',
      weeklyFeeModalSubtitle:
        'تۆ یەکەم گەشتی ئەم هەفتەیەت ئەنجامدا. بۆ بڵاوکردنەوەی گەشتی تر، تکایە 20,000 د.ع بنێرە لە ڕێگەی ڕافیدەین.',
      weeklyFeeAmountLabel: 'بڕی پارەی پێویست بۆ ئەم هەفتەیە',
      weeklyFeeWeekLabel: 'هەفتە',
      rafidainNumberLabel: 'ژمارەی ڕافیدەین بۆ ناردن',
      copyNumberBtn: 'کۆپیکردنی ژمارە',
      copiedBadge: 'کۆپیکرا',
      transferNotesNoticeTitle: 'ئاگاداری گرنگ — تێبینی حەواڵە',
      transferNotesNoticeBody:
        'پێویستە ناوی تەواوت لە «تێبینی حەواڵە» بنووسیت لە کاتی ناردنی 20,000 د.ع بۆ ژمارەی ڕافیدەین، بۆ ئەوەی کارگێڕی (2006) حەواڵەکە بناسێتەوە و هەژمارەکەت بۆ هەفتەکە پەسەند بکات.',
      driverTransferNameLabel: 'ناوی شۆفێر (وەک لە تێبینی حەواڵە نووسراوە)',
      driverTransferNamePlaceholder: 'ناوی تەواوت وەک تێبینی حەواڵە بنووسە',
      submitWeeklyFeeBtn: 'ناردنی دڵنیایی حەواڵە بۆ پەسەندکردن',
      weeklyFeeSubmittedSuccess:
        'زانیاری حەواڵە نێردرا! چاوەڕوانی پشکنین و پەسەندکردنی کارگێڕی (2006) بکە.',
      weeklyFeeBannerDueTitle: 'کۆمیسیۆنی هەفتانە (20,000 د.ع) پێویستە بدرێت',
      weeklyFeeBannerDueDesc:
        'یەکەم گەشتی هەفتەت دەستپێکرد. 20,000 د.ع بنێرە بۆ ڕافیدەین 07738235028 بۆ بڵاوکردنەوەی گەشتی نوێ.',
      weeklyFeeBannerPendingTitle: 'حەواڵەی هەفتانە (20,000 د.ع) چاوەڕوانی پەسەندکردنە',
      weeklyFeeBannerPendingDesc: 'نێردراوە بە ناوی:',
      weeklyFeeBannerApprovedTitle: 'هەژمارەکەت بۆ ئەم هەفتەیە چالاکە (20,000 د.ع پەسەندکراوە)',
      weeklyFeeBannerRejectedTitle: 'داواکاری هەفتانە ڕەتکرایەوە — تکایە دووبارە بینێرە',
      payWeeklyFeeBtn: 'دانی / دڵنیاکردنەوەی 20,000 د.ع',
      viewPaymentDetailsBtn: 'بینینی زانیاری ڕافیدەین',
    },

    admin: {
      title: 'پانێڵی کارگێڕی پلاتفۆرم',
      tabOverview: 'ئامار و داهات',
      tabDrivers: 'پەسەندکردنی شۆفێران',
      tabUsers: 'بەکارهێنەران',
      tabGeography: 'پارێزگا و گەراجەکان',
      tabTripsBookings: 'گەشت و حجزەکان',
      tabPayments: 'پارەدانی کاش',
      tabLoyaltyConfig: 'ڕێکخستنی خاڵ و کۆمیسیۆن',
      tabComplaintsReviews: 'سکاڵا و هەڵسەنگاندن',
      seedIraqDataBtn: 'ئامادەکردنی داتای پارێزگا و گەراجەکانی عێراق',
      seedDone: 'داتای سەرەتایی عێراق بە سەرکەوتوویی تۆمارکرا.',
      totalRevenueGmv: 'کۆی قەبارەی گەشتەکان',
      platformCommissionEarned: 'داهاتی کۆمیسیۆن',
      totalBookings: 'کۆی حجزەکان',
      activeTrips: 'گەشتە چالاکەکان',
      pendingDriversCount: 'داواکاری شۆفێرانی چاوەڕوان',
      approveDriver: 'پەسەندکردن',
      rejectDriver: 'ڕەتکردنەوە',
      suspendDriver: 'ڕاگرتن',
      viewDocuments: 'بینینی بەڵگەنامەکان',
      suspendUser: 'ڕاگرتن',
      activateUser: 'چالاککردن',
      blockUser: 'بلۆککردن',
      addGarageTitle: 'زیادکردنی گەراجی نوێ',
      garageNameAr: 'ناوی گەراج (عەرەبی)',
      garageNameKu: 'ناوی گەراج (کوردی)',
      garageNameEn: 'ناوی گەراج (ئینگلیزی)',
      operatingHours: 'کاتژمێری کارکردن',
      latitude: 'هێڵی پانی',
      longitude: 'هێڵی درێژی',
      saveGarage: 'پاشەکەوتکردنی گەراج',
      deleteGarage: 'سڕینەوە',
      resolvePaymentPaid: 'پشتڕاستکردنەوەی پارەدان',
      resolvePaymentRefunded: 'گۆڕین بۆ گەڕێندراوە',
      loyaltySettingsTitle: 'ڕێکخستنی خاڵەکانی دڵسۆزی و کۆمیسیۆن',
      pointsPerTripLabel: 'خاڵ بۆ هەر گەشتێکی تەواوبوو',
      freeTripCostLabel: 'نرخی گەشتی بێبەرامبەر بە خاڵ',
      maxFreeValueLabel: 'زۆرترین بەهای گەشتی بێبەرامبەر (د.ع)',
      refBonusReferrerLabel: 'پاداشتی بانگهێشتکار (خاڵ)',
      refBonusRefereeLabel: 'پاداشتی هاوڕێی نوێ (خاڵ)',
      commissionRateLabel: 'ڕێژەی کۆمیسیۆنی پلاتفۆرم (%)',
      cancellationHoursLabel: 'ماوەی ڕێگەپێدراو بۆ هەڵوەشاندنەوە (کاتژمێر)',
      supportPhoneLabel: 'ژمارەی پاڵپشتی',
      supportEmailLabel: 'ئیمەیڵی پاڵپشتی',
      saveSettingsBtn: 'پاشەکەوتکردنی ڕێکخستنەکان',
      manualPointsTitle: 'دەستکاریکردنی خاڵی بەکارهێنەر',
      selectUserId: 'ناسنامەی بەکارهێنەر (UID)',
      pointsDelta: 'ژمارەی خاڵ (+ یان -)',
      pointsReason: 'هۆکار',
      applyPointsBtn: 'جێبەجێکردن',
      broadcastTitle: 'ناردنی ئاگادارکردنەوە بۆ بەکارهێنەر',
      sendBroadcastBtn: 'ناردنی ئاگادارکردنەوە',
      hideReview: 'شاردنەوە',
      publishReview: 'پیشاندان',
      updateComplaint: 'نوێکردنەوەی سکاڵا',
      adminNotesPlaceholder: 'تێبینی کارگێڕی...',
      adminAccessBtn: 'کۆدی ئەدمین',
      adminCodeModalTitle: 'دەروازەی چوونەژوورەوەی کارگێڕی',
      adminCodeModalDesc: 'کۆدی نهێنی کارگێڕی (2006) بنووسە بۆ کردنەوەی ڕاستەوخۆی پانێڵی کارگێڕی.',
      adminCodeLabel: 'کۆدی ئەدمین',
      adminCodePlaceholder: 'کۆد بنووسە',
      adminCodeSubmit: 'کردنەوەی پانێڵی کارگێڕی',
      adminCodeInvalid: 'کۆدی کارگێڕی هەڵەیە. تکایە دووبارە هەوڵبدەرەوە.',
      adminAuthRequired: 'بە هەژماری Google بچۆ ژوورەوە بۆ هاوکاتکردنی داتا زیندووەکان.',
      adminNotAuthorizedEmail: 'نەتوانرا پشتڕاستکردنەوەی کارگێڕی بکرێت.',
      signInAsAdminGoogle: 'چوونەژوورەوە بە Google بۆ هاوکاتکردن',
      bookingsWithGpsTitle: 'حجزەکان، کورسییەکان و گەیاندنی GPS (+10,000 د.ع)',
      driverTripsModerationTitle: 'گەشتە بڵاوکراوەکانی شۆفێران',
      selectedSeatsCol: 'کورسی هەڵبژێردراو',
      gpsDropOffCol: 'شوێنی دابەزین (GPS)',
      standardGarageDropOff: 'گەیاندنی ئاسایی (ناو هێڵ)',
      deleteTripConfirm: 'دڵنیاکردنەوەی سڕینەوە',
      adminCodeUnlockedNotice: 'پانێڵی کارگێڕی بە سەرکەوتوویی بە کۆدی 2006 کرایەوە.',
      adminOptionalSignInHint: 'دەتوانیت ئێستا کاربکەیت، یان بە هەر هەژمارێکی Google بچیتە ژوورەوە بۆ بینینی هەموو تۆمارەکانی Firestore.',
      cargoCol: 'کاڵا / پاکێج',
      pendingUsersCount: 'بەکارهێنەرانی چاوەڕوانی پەسەندکردن',
      emptyList: 'هیچ تۆمارێکی زیندوو لە ئێستادا نییە.',
      tabWeeklyFees: 'کۆمیسیۆنی هەفتانە (20,000)',
      weeklyFeesTitle: 'پێداچوونەوەی حەواڵەی هەفتانەی ڕافیدەین (20,000 د.ع)',
      weeklyFeesSubtitle:
        'ناوی ناو تێبینی حەواڵەکە لەگەڵ حەواڵەکانی 07738235028 بگونجێنە و هەفتەکە پەسەند بکە.',
      transferSenderNameCol: 'ناو لە تێبینی حەواڵە',
      approveWeeklyFeeBtn: 'پەسەندکردنی هەفتە',
      rejectWeeklyFeeBtn: 'ڕەتکردنەوە',
    },

    map: {
      allGarages: 'هەموو گەراجە فەرمییەکان',
      selectGaragePrompt: 'کلیک لەسەر هەر گەراجێک بکە بۆ بینینی زانیاری و گەشتەکان',
      hours: 'کاتی کارکردن',
      openExternalMap: 'کردنەوە لە Google Maps',
      activeRoutesFromHere: 'گەشتە دەرچووەکان لەم گەراجەوە',
      regionLabel: 'تۆڕی عێراق · ١٨ پارێزگا',
      zoomIn: 'نزیککردنەوە',
      zoomOut: 'دوورخستنەوە',
      resetZoom: 'ڕێکخستنەوە',
      garagePinLegend: 'گەراجی فەرمی',
      liveDriversLegend: 'ئۆتۆمبێلی چالاک',
      selectedGarageLabel: 'گەراجی هەڵبژێردراو',
      exploreMapCta: 'گەڕان لە نەخشەدا',
      startingFrom: 'دەستپێکردن لە',
    },

    supportCategories: {
      app_issue: 'بەرنامە یان حجز',
      payment: 'پارەدانی کاش',
      driver_behavior: 'شۆفێر',
      vehicle: 'ئۆتۆمبێل',
      other: 'هیتر',
    },

    common: {
      languageLabel: 'زمانی خوازراو',
      noImageUploaded: 'هیچ وێنەیەک بارنەکراوە',
      idLabel: 'کارتی نیشتمانی',
      licenseLabel: 'مۆڵەتی شۆفێری',
      cashMethod: 'کاش',
      freePointsMethod: 'خاڵی دڵسۆزی',
      close: 'داخستن',
      menu: 'لیست',
      verifiedBadge: 'باوەڕپێکراو',
    },

    tables: {
      booking: 'حجز',
      method: 'شێواز',
      amount: 'بڕ',
      net: 'پاک',
      commission: 'کۆمیسیۆن',
      status: 'دۆخ',
      dispute: 'کێشە',
      user: 'بەکارهێنەر',
      role: 'ڕۆڵ',
      referralCode: 'کۆدی بانگهێشت',
      actions: 'کردارەکان',
      passenger: 'گەشتیار',
      driver: 'شۆفێر',
      date: 'بەروار',
      seats: 'کورسی',
      total: 'کۆی گشتی',
    },

    roles: {
      passenger: 'گەشتیار',
      driver: 'شۆفێر',
      admin: 'کارگێڕ',
    },

    legal: {
      backHome: 'گەڕانەوە بۆ سەرەکی',
      privacyTitle: 'سیاسەتی پاراستنی نهێنی',
      privacyBody: [
        'پلاتفۆرمی مەساری عێراق پابەندە بە پاراستنی زانیارییە کەسییەکانی گەشتیاران و شۆفێران بە بەرزترین ئاستی ئاسایش.',
        'ژمارەی مۆبایل تەنها بۆ پەیوەندیکردن لە نێوان گەشتیار و شۆفێری حجزە پەسەندکراوەکان بەکاردێت.',
        'بەڵگەنامەکانی شۆفێران تەنها لەلایەن تیمی کارگێڕییەوە بۆ پشتڕاستکردنەوە دەبینرێن.',
      ],
      termsTitle: 'مەرج و ڕێساکان',
      termsBody: [
        'مەساری عێراق نێوەندگیری تەکنیکییە بۆ بەستنەوەی گەشتیاران بە شۆفێرە پەسەندکراوەکانی نێوان پارێزگاکان بە خزمەتگوزاری وەرگرتن لە ماڵەوە یان شوێنی ڕێککەوتن.',
        'شۆفێر ناتوانێت گەشت بڵاوبکاتەوە پێش پەسەندکردنی لەلایەن کارگێڕییەوە.',
        'پارەدان لە ئێستادا تەنها بە کاشە ڕاستەوخۆ بۆ شۆفێر.',
        'دروستکردنی هەژماری ساختە بۆ بەدەستهێنانی خاڵ یان بانگهێشت قەدەغەیە.',
      ],
      cancellationTitle: 'سیاسەتی هەڵوەشاندنەوە و گۆڕینی کات',
      cancellationBody: [
        'گەشتیار دەتوانێت داواکاری حجزی چاوەڕوان هەڵبوەشێنێتەوە بەبێ سنوور.',
        'بۆ حجزی پەسەندکراو، هەڵوەشاندنەوە ڕێگەپێدراوە پێش ماوەی دیاریکراو (٣ کاتژمێر پێش دەرچوون).',
        'لە کاتی هەڵوەشاندنەوەدا خاڵە بەکارهاتووەکان دەگەڕێنرێنەوە.',
      ],
      contactTitle: 'پەیوەندی و پاڵپشتی',
      contactDesc: 'پێشوازی لە پرسیارەکانی گەشتیاران و شۆفێران دەکەین لە سەرتاسەری عێراق.',
      workingHours: 'ڕۆژانە لە ٠٧:٠٠ بەیانی تا ١١:٠٠ شەو بە کاتی بەغدا',
    },

    errors: {
      generic: 'هەڵەیەک ڕوویدا. تکایە دووبارە هەوڵبدەرەوە.',
      signInRequired: 'تکایە سەرەتا بچۆ ژوورەوە.',
      insufficientSeats: 'ببورە، ژمارەی کورسی پێویست نەماوە.',
      sameGovernorate: 'پارێزگای گەیشتن دەبێت جیاواز بێت لە پارێزگای دەرچوون.',
      unapprovedDriver: 'پێویستە هەژماری شۆفێر پەسەند کرابێت.',
      unapprovedUser: 'هەژمارەکەت لەژێر پێداچوونەوەدایە / چاوەڕوانی پەسەندکردنی کارگێڕییە. پێش پەسەندکردن ناتوانیت حجز بکەیت.',
      cancellationTooLate: 'کاتی ڕێگەپێدراو بۆ هەڵوەشاندنەوەی حجز تێپەڕیوە.',
      locationDenied: 'دەستگەیشتن بە شوێنی جوگرافی ڕەتکرایەوە.',
      duplicateBooking: 'تۆ پێشتر حجزێکی چالاکت هەیە لەم گەشتەدا.',
      authEmailInUse: 'ئەم ئیمەیڵە پێشتر تۆمارکراوە. تکایە بچۆ ژوورەوە.',
      authWeakPassword: 'وشەی نهێنی لاوازە. پێویستە لانیکەم ٦ پیت بێت.',
      authInvalidEmail: 'شێوازی ئیمەیڵ هەڵەیە.',
      authInvalidCredential: 'ئیمەیڵ یان وشەی نهێنی هەڵەیە.',
      authOperationNotAllowed: 'چوونەژوورەوە بە ئیمەیڵ چالاک نەکراوە لە ڕێکخستنەکانی Firebase Auth.',
      authPopupClosed: 'پەنجەرەی Google داخرا پێش تەواوکردن.',
      storageUnauthorized: 'بارکردنی وێنەکان سەرکەوتوو نەبوو بەهۆی دەسەڵاتی Firebase Storage.',
      invalidImageFile: 'تکایە فایلێکی وێنەی دروست هەڵبژێرە (JPG یان PNG).',
      cannotDeleteTripWithBookings: 'ناتوانرێت گەشتێک بسڕدرێتەوە کە حجزی پەسەندکراوی تێدایە.',
      carNotEmpty: 'ببورە، ئەم ئۆتۆمبێلە بەتاڵ نییە — یەک کورسی یان زیاتر حجزکراوە.',
      weeklyCommissionRequired:
        'دەبێت کۆمیسیۆنی هەفتانە (20,000 د.ع) بنێریت بۆ 07738235028 و پەسەند بکرێت پێش گەشتی دووەم.',
      weeklyCommissionPending:
        'حەواڵەی کۆمیسیۆنی هەفتانە لەژێر پشکنیندایە. دوای پەسەندکردن دەتوانیت گەشتی نوێ بڵاوبکەیتەوە.',
      invalidTransferName: 'تکایە ناوی تەواوت وەک تێبینی حەواڵە بنووسە.',
    },
  },

  en: {
    brand: 'Masar Iraq',
    brandShort: 'Masar',
    currency: 'IQD',
    pointsUnit: 'pts',
    langAr: 'العربية',
    langKu: 'کوردی',
    langEn: 'English',

    nav: {
      searchTrips: 'Trips',
      emptyCars: 'Empty Cars',
      destinations: 'Destinations',
      loyalty: 'Loyalty',
      becomeDriver: 'Drive with Us',
      support: 'Support',
      dashboard: 'Dashboard',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      register: 'Register',
      joinAsPassenger: 'Join as Passenger',
      joinAsDriver: 'Join as Driver',
    },

    hero: {
      kicker: 'Iraq Intercity Shared Taxi Network',
      headline: 'Book your intercity taxi seat online with direct home pickup',
      subtitle:
        'Connect directly with verified drivers across Baghdad, Erbil, Basra, Najaf, Karbala, Mosul, and all Iraqi governorates. Your driver picks you up from home or your agreed meeting point — pay cash on board and earn loyalty rewards.',
      fromLabel: 'Departure Governorate',
      toLabel: 'Destination',
      dateLabel: 'Travel Date',
      selectDate: 'Select date',
      clearDate: 'All dates',
      seatsLabel: 'Seats',
      allGovernorates: 'All Governorates',
      selectDeparture: 'Select origin',
      selectDestination: 'Select destination',
      searchButton: 'Search Trips',
      swapCities: 'Swap cities',
      statVerifiedDrivers: 'Verified & approved drivers',
      statGovernorates: 'connected Iraqi governorates',
      statCashPayment: 'Cash payment to driver',
      statPointsPerTrip: 'pts per completed trip',
      statPointsLabel: 'loyalty points per completed trip',
      verifiedBadgeTitle: 'Daily Verified Departures',
      verifiedBadgeSub: 'On-time pickup from your home or agreed meeting point',
      governoratesCount: '18',
      catTrips: 'Intercity Trips',
      catEmptyCars: 'Empty Cars',
      catRoutes: 'Popular Routes',
      catRewards: 'Loyalty Rewards',
      catDrivers: 'Drive With Us',
      timeWindowLabel: 'Departure Window',
      timeAll: 'Any time',
      timeMorning: 'Morning (04:00 - 12:00)',
      timeAfternoon: 'Afternoon (12:00 - 17:00)',
      timeEvening: 'Evening (17:00 - 23:59)',
      verifiedOnlyCheck: 'Verified drivers only',
      specialOffersOnlyCheck: 'Special fare offers only',
      breadcrumbHome: 'Home',
      breadcrumbSection: 'Intercity Taxi Hire',
      breadcrumbEmptyCars: 'Empty Cars',
    },

    subnav: {
      popular: 'Popular routes',
      emptyCars: 'Empty cars',
      trips: 'Available trips',
      providers: 'Pickup coverage',
      ratings: 'Ratings & reviews',
      factsFaq: 'Fast facts & FAQ',
    },

    filters: {
      all: 'All',
      cheapest: 'Cheapest',
      offers: 'Special offers',
      morning: 'Morning departures',
      multiSeat: '2+ seats left',
    },

    home: {
      popularDestinationsTitle: 'Popular Iraqi Intercity Routes',
      popularDestinationsSub: 'Daily scheduled shared taxis linking Iraqi governorates with direct home or agreed-point pickup.',
      exploreTripsFrom: 'View trips to',
      availableTripsTitle: 'Available Trips',
      availableTripsSub: 'Transparent per-seat fares in IQD with real-time seat inventory.',
      showingCount: 'trips available',
      resetFilters: 'Show All Trips',
      noTripsTitle: 'No trips match your current filter',
      noTripsDesc: 'Try adjusting the travel date or governorate, or view all published routes.',
      cheapestTripsTitle: 'Cheapest Available Fares',
      cheapestTripsSub: 'Compare seat prices across verified drivers.',
      specialOffersTitle: 'Special Route Offers',
      specialOffersSub: 'Discounted seats offered by drivers on selected departures.',
      mapTitle: 'Iraq Intercity Pickup Coverage',
      mapSub: 'Flexible home and meeting-point pickup across all 18 governorates.',
      loyaltyTitle: 'Masar Loyalty Points & Free Trips',
      loyaltySub: 'Every completed intercity journey builds points toward free rides.',
      loyaltyEarnRule: 'points credited automatically upon genuine trip completion',
      loyaltyRedeemRule: 'points redeemable for a free intercity seat',
      loyaltyReferralRule: 'bonus points for both you and your invited friend after their first trip',
      loyaltyCta: 'Open Loyalty Wallet',
      topDriversTitle: 'Top-Rated Verified Drivers',
      topDriversSub: 'Every driver passes identity, license, and vehicle inspection before publishing trips.',
      noDriversYet: 'Verified drivers will appear here as soon as admin approvals are completed.',
      reviewsTitle: 'Passenger Reviews',
      reviewsSub: 'Verified feedback exclusively from passengers who completed their booked rides.',
      noReviewsYet: 'No published reviews yet. Complete a trip to leave the first verified review.',
      howItWorksTitle: 'How Masar Iraq Works',
      howItWorksSub: 'Four clear steps replacing trips to crowded garages and early-morning waits.',
      step1Title: 'Search & Compare',
      step1Desc: 'Pick departure governorate, destination, and date to compare fares and open seats.',
      step2Title: 'Request Your Seats',
      step2Desc: 'Select seat count, enter your home pickup address or meeting note, and send your request.',
      step3Title: 'Instant Seat Reservation',
      step3Desc: 'Once accepted, your seats lock immediately with vehicle details and driver contact for home pickup.',
      step4Title: 'Home Pickup & Cash Payment',
      step4Desc: 'Your driver picks you up at home or your agreed spot — pay cash on board and earn loyalty points.',
      becomeDriverTitle: 'Drive Between Iraqi Governorates?',
      becomeDriverSub: 'Pre-fill seats before departing, coordinate flexible passenger pickups, and track your cash earnings.',
      becomeDriverBenefit1: 'Pre-booked seats without waiting hours at garages',
      becomeDriverBenefit2: 'Official verification badge that builds passenger trust',
      becomeDriverBenefit3: 'Full control over schedules, bookings, and cash ledger',
      becomeDriverCta: 'Register as a Driver',
      supportTitle: 'Passenger & Driver Support',
      supportSub: 'Dedicated operations team handling route inquiries, disputes, and trip coordination.',
      supportContactBtn: 'Contact Support',
      footerDesc: 'Intercity shared taxi seat booking platform across Iraq with direct home or agreed-point pickup.',
      footerLegal: 'Policies & Legal',
      footerRoutes: 'Quick Links',
      privacyPolicy: 'Privacy Policy',
      termsConditions: 'Terms & Conditions',
      cancellationPolicy: 'Cancellation Policy',
      contactUs: 'Contact Us',
      copyright: 'All rights reserved to Masar Iraq',
      fareCompareTitle: 'Average Seat Fare Comparison Across Major Routes',
      fareCompareSub: 'Compare typical per-seat fares in IQD across Iraq’s busiest intercity corridors.',
      avgFareLabel: 'Average fare per seat',
      partnersTitle: 'Governorate Home-Pickup Coverage',
      partnersSub: 'Door-to-door and agreed-point pickups across Baghdad, Erbil, Basra, Najaf, and all 18 governorates.',
      partnerStationTag: 'Active Coverage',
      ratingBreakdownTitle: 'Passenger Rating Breakdown & Service Quality',
      ratingOverallLabel: 'Platform Reliability Score',
      ratingBasedOn: 'Based on completed intercity bookings',
      ratingPunctuality: 'On-time departure',
      ratingComfort: 'Vehicle cleanliness & AC',
      ratingStations: 'Home pickup punctuality',
      ratingValue: 'Transparent fare value',
      fastFactsTitle: 'Fast Facts About Masar Iraq',
      fact1Title: 'Network Coverage',
      fact1Value: '18 Iraqi governorates connected',
      fact2Title: 'Upfront Prepayment',
      fact2Value: '0 IQD — Pay cash on board',
      fact3Title: 'Loyalty Rewards',
      fact3Value: '+5,000 pts per completed trip',
      fact4Title: 'Driver Verification',
      fact4Value: '100% ID & license vetted',
      faqTitle: 'Frequently Asked Questions',
      faqSub: 'Everything you need to know about reserving shared intercity taxi seats with home pickup.',
      faqItems: [
        {
          q: 'How is my seat confirmed without going to a garage?',
          a: 'Select your route, date, and seats to send a booking request. Once the verified driver accepts, your seat locks immediately and the driver picks you up from your home or agreed meeting point on time.',
        },
        {
          q: 'Do I have to pay online when booking?',
          a: 'No. Rides are paid in cash directly to the driver at pickup, or redeemed using your Masar loyalty points.',
        },
        {
          q: 'What is the cancellation and rescheduling policy?',
          a: 'Pending requests can be cancelled anytime. Accepted bookings can be cancelled free of charge at least 3 hours before scheduled departure.',
        },
        {
          q: 'How are drivers verified on the platform?',
          a: 'Every driver submits their National ID, driving license, vehicle photos, and profile details for administrative approval prior to publishing trips.',
        },
      ],
      footerSupportTitle: 'Passenger Support',
      footerDriverTitle: 'Partners & Drivers',
      footerPlatformNote: 'Iraq · Currency: Iraqi Dinar (IQD)',
      startingFrom: 'Starting from',
      noFareDataYet: 'No live route pricing yet — averages appear automatically once drivers publish trips.',
      noRoutesYetShort: 'Awaiting trips',
      emptyCarsTitle: 'Empty Cars (Book Full Vehicle)',
      emptyCarsSub: 'Reserve an entire empty vehicle at the captain’s full-car rate when zero seats are booked.',
      emptyCarsPageTitle: 'Empty Cars — Full-Vehicle Booking',
      emptyCarsPageSub: 'Browse vehicles priced by captains for private full-car booking across 4-seat and 6-seat capacities.',
      emptyCarsEmptyState: 'No trips with captain full-car pricing match your current filters.',
      viewAllEmptyCars: 'View All Empty Cars',
      emptyCarsCount: 'full-car trips',
      emptyCarsFilterAll: 'All Vehicles',
      emptyCarsFilterOnlyEmpty: 'Completely Empty Only',
      emptyCarsFilter4Seats: '4 Seats',
      emptyCarsFilter6Seats: '6 Seats',
    },

    tripCard: {
      seatsAvailable: 'seats left',
      fullTrip: 'Full',
      perSeat: 'per seat',
      cashOnBoard: 'Cash payment',
      verifiedDriver: 'Verified driver',
      completedTrips: 'completed trips',
      specialOffer: 'Special Offer',
      bookSeat: 'Book Seat',
      notifySeat: 'Notify me when a seat opens',
      alertSubscribed: 'Seat alert active',
      garageDeparture: 'Pickup area',
      garageArrival: 'Drop-off area',
      homePickupLabel: 'Home or agreed pickup',
      durationMins: 'min est.',
      ownTrip: 'Your trip',
      unratedDriver: 'New',
      fullCarPriceLabel: 'Full-car rate',
      bookFullCar: 'Book Full Car',
      carNotEmpty: 'Car Not Empty',
      carNotEmptyTooltip: 'Car is not completely empty — one or more seats are already reserved',
      emptyCarReadyBadge: 'Completely Empty',
      seatsCapacityBadge: 'Capacity',
      seatsUnit: 'seats',
    },

    auth: {
      welcomeTitle: 'Sign in to Masar Iraq',
      welcomeSub: 'Sign in with Google to manage bookings as a passenger or register as a verified driver.',
      continueGoogle: 'Continue with Google',
      completeProfileTitle: 'Complete Your Profile',
      completeProfileSub: 'Provide your details to activate your account across the platform.',
      chooseRole: 'Select Account Type',
      rolePassenger: 'Passenger Account',
      rolePassengerDesc: 'Search routes, reserve seats, track rides, and earn loyalty points.',
      roleDriver: 'Driver Account',
      roleDriverDesc: 'Submit your documents and vehicle for admin approval to publish trips.',
      fullName: 'Full Name',
      phone: 'Iraqi Phone Number',
      phonePlaceholder: '+964 770 123 4567',
      governorate: 'Governorate',
      referralCodeOptional: 'Referral Code (Optional)',
      referralCodePlaceholder: 'e.g. MASAR-A1B2',
      driverDetailsSection: 'Driver Verification Details',
      homeGarage: 'Home Garage',
      nationalIdNumber: 'National ID Number',
      licenseNumber: 'Driving License Number',
      idDocumentPhoto: 'National ID Photo',
      licenseDocumentPhoto: 'Driving License Photo',
      vehicleSection: 'Vehicle Information',
      vehicleModel: 'Make & Model',
      vehicleModelPlaceholder: 'Toyota Camry / Hyundai Staria',
      vehicleYear: 'Model Year',
      plateNumber: 'Plate Number',
      plateSectionGov: 'Governorate & Code',
      plateSectionLetter: 'Letter',
      plateSectionDigits: 'Number',
      plateFormatHint: 'Example: 22 Erbil | H | 12345',
      platePreviewLabel: 'Plate Preview',
      vehicleColor: 'Color',
      passengerCapacity: 'Passenger Seat Capacity',
      vehiclePhoto: 'Vehicle Photo',
      uploadFile: 'Select Image',
      fileAttached: 'Image attached',
      submitRegistration: 'Save & Submit Registration',
      submitting: 'Submitting...',
      accountSuspendedTitle: 'Account Suspended',
      accountSuspendedDesc: 'Please contact Masar Iraq administration to review your account status.',
      invalidReferralCode: 'Referral code not found. Check the code or leave it blank.',
      selfReferralBlocked: 'You cannot use your own referral code.',
      loginTab: 'Sign In',
      registerTab: 'Create Account',
      registerAsPassenger: 'Register as Passenger',
      registerAsDriver: 'Register as Driver',
      email: 'Email Address',
      emailPlaceholder: 'name@example.com',
      password: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      signInButton: 'Sign In',
      signingIn: 'Signing in...',
      orContinueWith: 'Or continue with Google',
      requiredDocsTitle: 'Mandatory Verification Photos',
      requiredDocsHintPassenger: 'No National ID upload is required for passengers — only your personal portrait.',
      requiredDocsHintDriver: 'All 5 photos are required for drivers: personal portrait, National ID (front & back), and driving license (front & back).',
      idCardPhoto: 'National ID Photo',
      idGroupLabel: 'National ID / Unified Card',
      idFrontPhoto: 'Front — National ID',
      idBackPhoto: 'Back — National ID',
      portraitPhoto: 'Personal Portrait',
      drivingLicensePhoto: 'Driving License Photo',
      licenseGroupLabel: 'Driving License',
      licenseFrontPhoto: 'Front — Driving License',
      licenseBackPhoto: 'Back — Driving License',
      frontSideLabel: 'Front',
      backSideLabel: 'Back',
      requiredTag: 'Required',
      replacePhoto: 'Replace',
      removePhoto: 'Remove',
      tapToUpload: 'Tap to upload image',
      missingRequiredFields: 'Please complete all required fields and upload every mandatory photo first.',
      creatingAccount: 'Creating account...',
      uploadingPhotos: 'Uploading verification photos to Firebase Storage...',
      savingProfile: 'Saving profile to Firestore...',
      pendingReview: 'Pending Review',
      verifiedStatus: 'Verified',
      rejectedStatus: 'Rejected',
      noAccountPrompt: 'Don’t have an account?',
      hasAccountPrompt: 'Already have an account?',
      createAccountBtn: 'Create Account',
      noOtpNote: 'Used for direct ride coordination with no SMS/OTP verification needed.',
      checkingAccount: 'Checking account status...',
      pendingApprovalBannerTitle: 'Account Under Review / Pending Admin Approval',
      pendingApprovalBannerDesc: 'Your documents were received. Booking and publishing features unlock once an admin approves your account.',
      verifiedPassengerBadge: 'Verified & Approved Passenger',
      resubmitDocsTitle: 'Resubmit Verification Documents',
      resubmitDocsBtn: 'Submit Updated Documents for Review',
      docsResubmitted: 'Documents resubmitted. Your account status is back under admin review.',
    },

    booking: {
      modalTitle: 'Request Seat Booking',
      routeSummary: 'Route Summary',
      seatsCount: 'Number of Seats',
      notesLabel: 'Pickup address or notes for driver',
      notesPlaceholder: 'e.g. Home pickup from Al-Mansour street 14, or near agreed meeting point',
      paymentMethodTitle: 'Payment Method',
      payCashLabel: 'Cash on Board',
      payCashDesc: 'Pay the fare in cash directly to the driver.',
      redeemPointsLabel: 'Redeem Loyalty Points for Free Trip',
      redeemPointsDesc: 'Use your earned points balance for a free seat.',
      insufficientPoints: 'Insufficient points balance for redemption.',
      exceedsMaxFreeValue: 'This trip price exceeds the maximum free-trip cap.',
      onlyOneSeatForFree: 'Points redemption applies to 1 seat per booking.',
      roundTripLabel: 'Add Return Trip (Round-Trip)',
      selectReturnTrip: 'Choose an available return trip',
      noReturnTrips: 'No return trips currently scheduled on the reverse route.',
      totalDueCash: 'Total Cash Due',
      pointsToDeduct: 'Points Redeemed',
      policyNotice: 'Accepted bookings may be cancelled ahead of departure within the cancellation window.',
      confirmRequest: 'Submit Booking Request',
      requestSent: 'Booking request sent to driver.',
      cancel: 'Cancel',
      selectSeatsTitle: 'Select Your Cabin Seat(s)',
      frontOfCar: 'Front of Vehicle',
      driverSeatLabel: 'Driver',
      seatFrontPassenger: 'Front Passenger',
      seatRearRight: 'Rear Right',
      seatRearMiddle: 'Rear Middle',
      seatRearLeft: 'Rear Left',
      seatExtraRight: 'Extra Right',
      seatExtraLeft: 'Extra Left',
      seatAvailable: 'Available',
      seatSelected: 'Selected',
      seatBooked: 'Booked',
      selectedSeatsLabel: 'Selected Seat(s)',
      selectAtLeastOneSeat: 'Select at least one seat from the cabin diagram above.',
      seatAlreadyBooked: 'One of your selected seats was just booked. Please pick another.',
      dropOffTitle: 'Arrival Drop-off Location',
      standardDropOffLabel: 'Standard Drop-off (Included)',
      standardDropOffDesc: 'Drop-off at the standard arrival area with no extra fee.',
      customDropOffLabel: 'Custom Map Pin Drop-off (+10,000 IQD)',
      customDropOffDesc: 'Pin your exact drop-off spot on the map for direct door-to-door delivery.',
      customDropOffFeeLabel: 'Custom Drop-off Fee',
      customDropOffAddressLabel: 'Drop-off Landmark / Address Note (Optional)',
      customDropOffAddressPlaceholder: 'e.g. Near University Gate, 60m Street...',
      locatingMap: 'Locating your position on the map...',
      locatedSuccess: 'Live browser location pinned',
      locateFallbackNotice: 'Could not auto-detect GPS — tap the map or drag the pin to set your location.',
      recenterMyLocation: 'Use My Current Location',
      tapOrDragPinHint: 'Tap anywhere on the map or drag the blue pin to adjust your drop-off spot.',
      selectedCoordsLabel: 'Selected Coordinates',
      customDropOffMissingCoords: 'Please select a drop-off pin on the map first.',
      openDriverNavLink: 'Navigate to Drop-off (Google Maps)',
      customDropOffBadge: 'Custom Drop-off',
      seatsSubtotalLabel: 'Selected Seats Subtotal',
      cargoOptionTitle: 'Cargo / Parcel Transport',
      cargoOptionDesc: 'Include a parcel or cargo item on this trip at the captain’s shipping rate.',
      cargoAddLabel: 'Include cargo / parcel shipping with this booking',
      cargoFeeLabel: 'Cargo / Parcel Fee',
      cargoNotesPlaceholder: 'Describe package/cargo (e.g. medium box, documents, gift...)',
      cargoBadge: 'With Cargo',
      cargoAvailableBadge: 'Cargo Accepted',
      seatPriceRangeHint: 'Varies by seat',
      fullCarModalTitle: 'Book Full Car',
      fullCarFareLabel: 'Full-car fare (set by captain)',
      fullCarIncludedAllSeats: 'Reserves every seat in the cabin exclusively for your private journey.',
      fullCarCannotRedeemPoints: 'Loyalty point redemptions apply to single-seat bookings only.',
      carNotEmptyError: 'Sorry, this car is no longer completely empty.',
    },

    statuses: {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      completed: 'Completed',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      approved: 'Approved',
      suspended: 'Suspended',
      blocked: 'Blocked',
      active: 'Active',
      unpaid: 'Unpaid',
      paid: 'Paid (Cash)',
      disputed: 'Disputed',
      refunded: 'Refunded',
      open: 'Open',
      investigating: 'Investigating',
      resolved: 'Resolved',
      dismissed: 'Dismissed',
      published: 'Published',
      hidden: 'Hidden',
    },

    passenger: {
      title: 'Passenger Dashboard',
      tabSearch: 'Search Trips',
      tabBookings: 'My Bookings',
      tabLoyalty: 'Loyalty Wallet',
      tabReferrals: 'Referrals',
      tabNotifications: 'Notifications',
      tabSupport: 'Support',
      tabProfile: 'Profile',
      upcomingBookings: 'Active & Upcoming Bookings',
      bookingHistory: 'Trip History',
      noBookings: 'No bookings yet. Search intercity trips to reserve your first seat.',
      cancelBooking: 'Cancel Booking',
      cancelReasonPrompt: 'Reason for cancellation (optional):',
      rescheduleBtn: 'Request Reschedule',
      newDatePrompt: 'Enter requested new date (YYYY-MM-DD):',
      shareTripBtn: 'Share Trip Details with Family',
      copiedShareText: 'Trip summary copied to clipboard.',
      liveLocationActive: 'Driver live location active',
      rateDriverBtn: 'Rate Driver & Trip',
      driverRating: 'Driver Rating',
      vehicleRating: 'Vehicle Rating',
      experienceRating: 'Trip Experience',
      reviewComment: 'Written Review',
      submitReview: 'Submit Review',
      disputePaymentBtn: 'Report Payment Dispute',
      disputeReason: 'Describe the cash payment dispute:',
      walletBalance: 'Current Balance',
      totalEarned: 'Total Earned',
      totalRedeemed: 'Total Redeemed',
      progressFreeTrip: 'Progress to Next Free Trip',
      pointsRemaining: 'points remaining for free trip',
      freeTripReady: 'You have enough points for a free trip!',
      transactionsHistory: 'Points Ledger',
      noTransactions: 'No points transactions yet.',
      yourReferralLink: 'Your Unique Referral Link',
      yourReferralCode: 'Referral Code',
      copyLink: 'Copy Link',
      linkCopied: 'Referral link copied.',
      referredFriends: 'Referred Friends',
      noReferrals: 'No friends have registered via your link yet.',
      markAllRead: 'Mark All Read',
      noNotifications: 'No notifications yet.',
      submitComplaintTitle: 'Submit Complaint or Support Ticket',
      complaintCategory: 'Category',
      complaintSubject: 'Subject',
      complaintDesc: 'Description',
      sendComplaint: 'Submit Ticket',
      myComplaints: 'My Tickets',
      profileSave: 'Save Changes',
      profileSaved: 'Profile updated successfully.',
    },

    driver: {
      title: 'Driver Dashboard',
      tabOverview: 'Overview',
      tabRequests: 'Booking Requests',
      tabMyTrips: 'My Trips',
      tabPublish: 'Publish Trip',
      tabVehicleDocs: 'Documents & Vehicle',
      tabEarnings: 'Earnings & Cash',
      tabReviews: 'Reviews',
      verificationPendingTitle: 'Verification Pending Admin Review',
      verificationPendingDesc: 'You can publish trips and accept bookings once an administrator approves your documents and vehicle.',
      verificationRejectedTitle: 'Verification Rejected',
      verificationApprovedBadge: 'Verified & Approved Driver',
      availabilityToggle: 'Driver Availability',
      availableNow: 'Available for Trips',
      offlineNow: 'Currently Offline',
      acceptBooking: 'Accept & Reserve Seats',
      rejectBooking: 'Reject',
      rejectReason: 'Rejection reason (optional):',
      confirmCashPaid: 'Confirm Cash Received',
      markCompleted: 'Complete Trip & Credit Points',
      startTrip: 'Start Trip',
      completeTrip: 'Mark Trip Completed',
      cancelTrip: 'Cancel Trip',
      shareLiveLocation: 'Share Live Location',
      stopLiveLocation: 'Stop Live Location',
      publishTripTitle: 'Create & Publish New Trip',
      departureGov: 'Departure Governorate',
      destinationGov: 'Destination Governorate',
      departureGarage: 'Departure Garage',
      destinationGarage: 'Destination Garage',
      departureDate: 'Departure Date',
      departureTime: 'Departure Time',
      pricePerSeat: 'Price per Seat (IQD)',
      originalPriceOptional: 'Original Price (optional for Special Offer)',
      seatsToOffer: 'Available Seats',
      estimatedDuration: 'Est. Duration (minutes)',
      tripNotes: 'Trip Notes',
      publishTripBtn: 'Publish Trip',
      editTripLockedNotice: 'Price and route are locked once confirmed bookings exist.',
      totalEarningsGross: 'Gross Cash Collected',
      platformCommission: 'Platform Commission',
      netEarnings: 'Net Driver Earnings',
      completedBookingsCount: 'Completed Bookings',
      saveVehicleDocs: 'Save Vehicle & Documents',
      savedSuccess: 'Saved successfully.',
      noRequests: 'No booking requests yet.',
      noTrips: 'No published trips yet.',
      addNewTripBtn: 'Add New Trip',
      departureDateTimeLabel: 'Departure Date & Time',
      pickupNotesLabel: 'Pickup / Home-Pickup Notes (Optional)',
      pickupNotesPlaceholder: 'e.g. Departing Al-Mansour, flexible home pickup by agreement...',
      autoAttachedInfoTitle: 'Auto-Attached Driver & Vehicle Details',
      fourCabinSeatsReady: 'All 4 passenger cabin seats will be initialized as Available for 3D selection.',
      deleteTrip: 'Remove Trip',
      confirmDeleteTrip: 'Confirm Remove',
      tripBookingsTitle: 'Incoming Bookings & Drop-off Details',
      noTripBookings: 'No incoming bookings on this trip yet.',
      cabinSeatsOverview: '4-Seat Cabin Status',
      perSeatPricingTitle: 'Individual Per-Seat Pricing (IQD)',
      applyToAllSeats: 'Apply to All Seats',
      baseSeatPrice: 'Quick Default Price',
      seatPriceShort: 'Seat Price',
      cargoShippingTitle: 'Cargo / Parcel Transport Option',
      enableCargoTransport: 'Allow cargo / parcels on this trip',
      cargoPriceLabel: 'Cargo / Parcel Fee (IQD)',
      editTripBtn: 'Edit Trip & Prices',
      saveTripChangesBtn: 'Save Trip Changes',
      tripUpdatedSuccess: 'Trip details and pricing updated successfully.',
      seatCapacityLabel: 'Vehicle Capacity for This Trip',
      capacity4Seats: '4 Seats (Standard Sedan)',
      capacity6Seats: '6 Seats (4 Core + 2 Extra Cabin Seats)',
      fullCarPriceLabel: 'Full-Car Booking Price (IQD)',
      fullCarPricePlaceholder: 'e.g. 120000 (leave blank or 0 to disable full-car)',
      fullCarPriceHint: 'Listed in Empty Cars with Book Full Car active while zero seats are booked.',
      sixCabinSeatsReady: 'All 6 cabin seats (6/6 open), including 2 extra seats, will appear in the 3D cabin selector.',
      fullCarBadge: 'Full-Car Booking',
      cabinSeatsOverview6: '6-Seat Cabin Status',
      weeklyFeeModalTitle: 'Weekly Platform Commission (20,000 IQD)',
      weeklyFeeModalSubtitle:
        'You started your first trip this week. Transfer 20,000 IQD via Rafidain to unlock additional trips this week.',
      weeklyFeeAmountLabel: 'Weekly Amount Due',
      weeklyFeeWeekLabel: 'Week',
      rafidainNumberLabel: 'Rafidain Transfer Number',
      copyNumberBtn: 'Copy Number',
      copiedBadge: 'Copied',
      transferNotesNoticeTitle: 'Important — Transfer Notes Requirement',
      transferNotesNoticeBody:
        'You must write your full name in the transfer notes (ملاحظات التحويل) when sending 20,000 IQD to the Rafidain number above so the admin (2006) can match your transfer and approve your week.',
      driverTransferNameLabel: 'Driver Name (written in transfer notes)',
      driverTransferNamePlaceholder: 'Enter your name exactly as written in transfer notes',
      submitWeeklyFeeBtn: 'Submit Transfer for Admin Approval',
      weeklyFeeSubmittedSuccess:
        'Transfer submitted! Waiting for admin (2006) verification to unlock this week.',
      weeklyFeeBannerDueTitle: 'Weekly 20,000 IQD Commission Required (Rafidain)',
      weeklyFeeBannerDueDesc:
        'First trip of the week recorded. Transfer 20,000 IQD to Rafidain 07738235028 with your name in the transfer notes to publish more trips.',
      weeklyFeeBannerPendingTitle: 'Weekly 20,000 IQD Transfer Pending Admin Approval',
      weeklyFeeBannerPendingDesc: 'Submitted under transfer notes name:',
      weeklyFeeBannerApprovedTitle: 'Account Approved for This Week (20,000 IQD Verified)',
      weeklyFeeBannerRejectedTitle: 'Weekly Commission Transfer Rejected — Please Re-submit',
      payWeeklyFeeBtn: 'Pay / Submit 20,000 IQD',
      viewPaymentDetailsBtn: 'View Rafidain Details',
    },

    admin: {
      title: 'Platform Administration',
      tabOverview: 'Analytics & Revenue',
      tabDrivers: 'Driver Approvals',
      tabUsers: 'Users',
      tabGeography: 'Governorates & Garages',
      tabTripsBookings: 'Trips & Bookings',
      tabPayments: 'Cash Payments',
      tabLoyaltyConfig: 'Loyalty & Commission',
      tabComplaintsReviews: 'Complaints & Reviews',
      seedIraqDataBtn: 'Initialize Iraq Governorates & Garages',
      seedDone: 'Iraq reference data initialized in Firestore.',
      totalRevenueGmv: 'Gross Booking Volume',
      platformCommissionEarned: 'Platform Commission',
      totalBookings: 'Total Bookings',
      activeTrips: 'Active Trips',
      pendingDriversCount: 'Pending Driver Applications',
      approveDriver: 'Approve',
      rejectDriver: 'Reject',
      suspendDriver: 'Suspend',
      viewDocuments: 'Inspect Documents',
      suspendUser: 'Suspend',
      activateUser: 'Activate',
      blockUser: 'Block',
      addGarageTitle: 'Add Garage / Departure Station',
      garageNameAr: 'Garage Name (Arabic)',
      garageNameKu: 'Garage Name (Kurdish)',
      garageNameEn: 'Garage Name (English)',
      operatingHours: 'Operating Hours',
      latitude: 'Latitude',
      longitude: 'Longitude',
      saveGarage: 'Save Garage',
      deleteGarage: 'Delete',
      resolvePaymentPaid: 'Mark Paid',
      resolvePaymentRefunded: 'Mark Refunded',
      loyaltySettingsTitle: 'Loyalty, Referral & Commission Configuration',
      pointsPerTripLabel: 'Points per Completed Trip',
      freeTripCostLabel: 'Points Required for Free Trip',
      maxFreeValueLabel: 'Max Free Trip Value Cap (IQD)',
      refBonusReferrerLabel: 'Referrer Bonus Points',
      refBonusRefereeLabel: 'Referee Bonus Points',
      commissionRateLabel: 'Platform Commission (%)',
      cancellationHoursLabel: 'Cancellation Cutoff (hours)',
      supportPhoneLabel: 'Support Phone',
      supportEmailLabel: 'Support Email',
      saveSettingsBtn: 'Save Platform Settings',
      manualPointsTitle: 'Manual Wallet Points Adjustment',
      selectUserId: 'Target User UID',
      pointsDelta: 'Points Delta (+ or -)',
      pointsReason: 'Adjustment Reason',
      applyPointsBtn: 'Apply Adjustment',
      broadcastTitle: 'Send System Notification',
      sendBroadcastBtn: 'Send Notification',
      hideReview: 'Hide Review',
      publishReview: 'Publish Review',
      updateComplaint: 'Update Ticket',
      adminNotesPlaceholder: 'Admin notes...',
      adminAccessBtn: 'Admin Code',
      adminCodeModalTitle: 'Admin Dashboard Access',
      adminCodeModalDesc: 'Enter the admin security code (2006) to directly unlock verifications & bookings management.',
      adminCodeLabel: 'Admin Code',
      adminCodePlaceholder: 'Enter code',
      adminCodeSubmit: 'Open Admin Dashboard',
      adminCodeInvalid: 'Invalid admin code. Please try again.',
      adminAuthRequired: 'Sign in with Google to sync live Firestore admin records.',
      adminNotAuthorizedEmail: 'Could not verify admin session.',
      signInAsAdminGoogle: 'Sign in with Google for Live Sync',
      bookingsWithGpsTitle: 'Bookings, Seat Selections & Custom GPS Drop-offs (+10,000 IQD)',
      driverTripsModerationTitle: 'Driver-Published Trips (Moderation)',
      selectedSeatsCol: 'Selected Seats',
      gpsDropOffCol: 'GPS Drop-off',
      standardGarageDropOff: 'Standard Drop-off',
      deleteTripConfirm: 'Confirm Delete',
      adminCodeUnlockedNotice: 'Admin Dashboard unlocked via code (2006).',
      adminOptionalSignInHint: 'You can inspect the console now, or sign in with any Google account to sync live Firestore collections.',
      cargoCol: 'Cargo / Parcel',
      pendingUsersCount: 'Users Pending Approval',
      emptyList: 'No live records yet.',
      tabWeeklyFees: 'Weekly Fees (20,000)',
      weeklyFeesTitle: 'Weekly Driver 20,000 IQD Commission Reviews',
      weeklyFeesSubtitle:
        'Match the driver name written in transfer notes for 07738235028 Rafidain transfers and approve their week.',
      transferSenderNameCol: 'Name in Transfer Notes',
      approveWeeklyFeeBtn: 'Match & Approve Week',
      rejectWeeklyFeeBtn: 'Reject Transfer',
    },

    map: {
      allGarages: 'All Certified Garages',
      selectGaragePrompt: 'Click any garage marker to inspect coordinates and active departures',
      hours: 'Operating Hours',
      openExternalMap: 'Open in Google Maps',
      activeRoutesFromHere: 'Scheduled departures from this garage',
      regionLabel: 'Iraq Network · 18 Governorates',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      resetZoom: 'Reset view',
      garagePinLegend: 'Certified garage',
      liveDriversLegend: 'Active vehicle',
      selectedGarageLabel: 'Selected Garage',
      exploreMapCta: 'Explore map',
      startingFrom: 'From',
    },

    supportCategories: {
      app_issue: 'App / Booking',
      payment: 'Cash Payment',
      driver_behavior: 'Driver',
      vehicle: 'Vehicle',
      other: 'Other',
    },

    common: {
      languageLabel: 'Preferred Language',
      noImageUploaded: 'No image uploaded',
      idLabel: 'National ID',
      licenseLabel: 'License',
      cashMethod: 'Cash',
      freePointsMethod: 'Loyalty Points',
      close: 'Close',
      menu: 'Menu',
      verifiedBadge: 'Verified',
    },

    tables: {
      booking: 'Booking',
      method: 'Method',
      amount: 'Amount',
      net: 'Net',
      commission: 'Commission',
      status: 'Status',
      dispute: 'Dispute',
      user: 'User',
      role: 'Role',
      referralCode: 'Referral Code',
      actions: 'Actions',
      passenger: 'Passenger',
      driver: 'Driver',
      date: 'Date',
      seats: 'Seats',
      total: 'Total',
    },

    roles: {
      passenger: 'Passenger',
      driver: 'Driver',
      admin: 'Admin',
    },

    legal: {
      backHome: 'Back to Home',
      privacyTitle: 'Privacy Policy',
      privacyBody: [
        'Masar Iraq isolates sensitive personal data (email, phone, and national IDs) and restricts access to authorized parties only.',
        'Contact phone numbers are shared strictly between a passenger and their confirmed driver for pickup coordination.',
        'Driver identification documents are accessible exclusively to platform administrators for verification and safety compliance.',
      ],
      termsTitle: 'Terms & Conditions',
      termsBody: [
        'Masar Iraq operates as a digital booking platform connecting intercity passengers with verified taxi drivers across Iraq with direct home or agreed-point pickup.',
        'Drivers must pass administrative verification before publishing trips or accepting bookings.',
        'All rides are settled in cash directly with the driver at initial launch unless redeemed via verified loyalty points.',
        'Fake accounts, duplicate bookings, or referral manipulation result in immediate suspension and forfeiture of rewards.',
      ],
      cancellationTitle: 'Cancellation & Rescheduling Policy',
      cancellationBody: [
        'Pending booking requests may be cancelled at any time without penalty, restoring any redeemed loyalty points immediately.',
        'Accepted bookings may be cancelled by passengers up to the configured cutoff window prior to departure (default: 3 hours).',
        'If a driver cancels or rejects a booking, reserved seats and any redeemed points are automatically refunded.',
      ],
      contactTitle: 'Contact & Customer Support',
      contactDesc: 'Reach out to our operations desk for passenger assistance and driver onboarding across Iraq.',
      workingHours: 'Daily 07:00 AM – 11:00 PM Baghdad Time',
    },

    errors: {
      generic: 'An error occurred. Please try again.',
      signInRequired: 'Please sign in first to continue.',
      insufficientSeats: 'Not enough seats remaining on this trip.',
      sameGovernorate: 'Destination governorate must differ from departure.',
      unapprovedDriver: 'Driver verification must be approved before publishing trips.',
      unapprovedUser: 'Your account is pending admin approval. Verified bookings unlock once approved.',
      cancellationTooLate: 'The cancellation window before departure has passed.',
      locationDenied: 'Location permission denied by browser.',
      duplicateBooking: 'You already have an active booking on this trip.',
      authEmailInUse: 'This email is already registered. Please sign in instead.',
      authWeakPassword: 'Password is too weak. Please enter at least 6 characters.',
      authInvalidEmail: 'Please enter a valid email address.',
      authInvalidCredential: 'Incorrect email or password.',
      authOperationNotAllowed: 'Email/Password sign-in is not enabled in Firebase Authentication settings.',
      authPopupClosed: 'Google sign-in popup was closed before completing.',
      storageUnauthorized: 'Unable to upload verification photos due to Firebase Storage permissions.',
      invalidImageFile: 'Please choose a valid image file (JPG or PNG).',
      cannotDeleteTripWithBookings: 'Cannot remove a trip with confirmed bookings. Cancel bookings first.',
      carNotEmpty: 'This car is no longer completely empty — at least one seat is already reserved.',
      weeklyCommissionRequired:
        'Please pay the weekly 20,000 IQD commission to Rafidain (07738235028) and wait for admin approval before publishing more trips this week.',
      weeklyCommissionPending:
        'Your weekly 20,000 IQD transfer is pending admin approval. Additional trips unlock once verified.',
      invalidTransferName: 'Please enter your full name matching the transfer notes.',
    },
  },
};

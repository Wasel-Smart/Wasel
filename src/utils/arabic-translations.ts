/**
 * Arabic Language Constants - Complete Translation
 * النصوص العربية الكاملة للتطبيق
 */

export const ARABIC_TRANSLATIONS = {
  // Navigation & Headers
  nav: {
    home: 'الرئيسية',
    findRide: 'ابحث عن رحلة',
    offerRide: 'اعرض رحلة',
    myTrips: 'رحلاتي',
    messages: 'الرسائل',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    help: 'المساعدة',
    logout: 'تسجيل الخروج'
  },

  // Authentication
  auth: {
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    phoneNumber: 'رقم الهاتف',
    forgotPassword: 'نسيت كلمة المرور؟',
    rememberMe: 'تذكرني',
    createAccount: 'إنشاء حساب جديد',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟'
  },

  // Trip Booking
  booking: {
    from: 'من',
    to: 'إلى',
    departure: 'المغادرة',
    return: 'العودة',
    passengers: 'الركاب',
    searchTrips: 'البحث عن رحلات',
    bookNow: 'احجز الآن',
    price: 'السعر',
    duration: 'المدة',
    distance: 'المسافة',
    availableSeats: 'المقاعد المتاحة',
    driverRating: 'تقييم السائق',
    vehicleType: 'نوع المركبة',
    pickupLocation: 'موقع الاستلام',
    dropoffLocation: 'موقع التوصيل',
    bookingConfirmed: 'تم تأكيد الحجز',
    tripDetails: 'تفاصيل الرحلة'
  },

  // Trip Status
  status: {
    searching: 'جاري البحث...',
    found: 'تم العثور على رحلات',
    booked: 'محجوز',
    confirmed: 'مؤكد',
    inProgress: 'جارية',
    completed: 'مكتملة',
    cancelled: 'ملغية',
    waiting: 'في الانتظار',
    arriving: 'في الطريق',
    pickedUp: 'تم الاستلام'
  },

  // Payment
  payment: {
    paymentMethod: 'طريقة الدفع',
    creditCard: 'بطاقة ائتمان',
    wallet: 'المحفظة',
    cash: 'نقداً',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    fees: 'الرسوم',
    discount: 'الخصم',
    payNow: 'ادفع الآن',
    paymentSuccessful: 'تم الدفع بنجاح',
    paymentFailed: 'فشل في الدفع',
    refund: 'استرداد',
    receipt: 'الإيصال'
  },

  // Driver Features
  driver: {
    becomeDriver: 'كن سائقاً',
    driverDashboard: 'لوحة السائق',
    earnings: 'الأرباح',
    todayEarnings: 'أرباح اليوم',
    weeklyEarnings: 'الأرباح الأسبوعية',
    monthlyEarnings: 'الأرباح الشهرية',
    totalTrips: 'إجمالي الرحلات',
    rating: 'التقييم',
    goOnline: 'اتصل',
    goOffline: 'اقطع الاتصال',
    acceptTrip: 'قبول الرحلة',
    declineTrip: 'رفض الرحلة',
    startTrip: 'بدء الرحلة',
    endTrip: 'إنهاء الرحلة',
    navigation: 'التنقل'
  },

  // Messages
  messages: {
    newMessage: 'رسالة جديدة',
    sendMessage: 'إرسال رسالة',
    typeMessage: 'اكتب رسالة...',
    noMessages: 'لا توجد رسائل',
    messageDelivered: 'تم التسليم',
    messageRead: 'تم القراءة',
    online: 'متصل',
    offline: 'غير متصل',
    lastSeen: 'آخر ظهور'
  },

  // Notifications
  notifications: {
    newTrip: 'رحلة جديدة متاحة',
    tripConfirmed: 'تم تأكيد رحلتك',
    driverAssigned: 'تم تعيين سائق لرحلتك',
    driverArriving: 'السائق في الطريق إليك',
    tripStarted: 'بدأت رحلتك',
    tripCompleted: 'اكتملت رحلتك',
    paymentReceived: 'تم استلام الدفعة',
    ratingRequest: 'يرجى تقييم رحلتك',
    promoCode: 'لديك كود خصم جديد'
  },

  // Profile & Settings
  profile: {
    personalInfo: 'المعلومات الشخصية',
    contactInfo: 'معلومات الاتصال',
    preferences: 'التفضيلات',
    language: 'اللغة',
    currency: 'العملة',
    notifications: 'الإشعارات',
    privacy: 'الخصوصية',
    security: 'الأمان',
    paymentMethods: 'طرق الدفع',
    emergencyContacts: 'جهات الاتصال الطارئة',
    documents: 'الوثائق',
    verification: 'التحقق'
  },

  // Smart Route AI
  smartRoute: {
    aiSuggestions: 'اقتراحات الذكاء الاصطناعي',
    smartMatching: 'المطابقة الذكية',
    predictiveBooking: 'الحجز التنبؤي',
    routeOptimization: 'تحسين المسار',
    dynamicPricing: 'التسعير الديناميكي',
    comfortScore: 'نقاط الراحة',
    efficiencyRating: 'تقييم الكفاءة',
    marketMirror: 'مرآة السوق',
    demandForecast: 'توقع الطلب',
    supplyDensity: 'كثافة العرض',
    optimalTiming: 'التوقيت الأمثل',
    priceOptimization: 'تحسين السعر'
  },

  // Services
  services: {
    carpool: 'مشاركة السيارة',
    packageDelivery: 'توصيل الطرود',
    schoolTransport: 'النقل المدرسي',
    medicalTransport: 'النقل الطبي',
    petTransport: 'نقل الحيوانات الأليفة',
    luxuryRides: 'الرحلات الفاخرة',
    scooterRental: 'تأجير السكوتر',
    carRental: 'تأجير السيارات',
    shuttleService: 'خدمة النقل الجماعي',
    freightShipping: 'الشحن التجاري'
  },

  // Emergency
  emergency: {
    sos: 'طوارئ',
    emergencyAlert: 'تنبيه طوارئ',
    callPolice: 'اتصل بالشرطة',
    callAmbulance: 'اتصل بالإسعاف',
    shareLocation: 'شارك الموقع',
    emergencyContacts: 'جهات الاتصال الطارئة',
    reportIncident: 'الإبلاغ عن حادث',
    safetyCenter: 'مركز الأمان'
  },

  // Admin Dashboard
  admin: {
    dashboard: 'لوحة الإدارة',
    users: 'المستخدمون',
    drivers: 'السائقون',
    trips: 'الرحلات',
    revenue: 'الإيرادات',
    analytics: 'التحليلات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    systemHealth: 'صحة النظام',
    fraudDetection: 'كشف الاحتيال',
    disputeResolution: 'حل النزاعات',
    userManagement: 'إدارة المستخدمين',
    financialReports: 'التقارير المالية'
  },

  // Common Actions
  actions: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    view: 'عرض',
    download: 'تحميل',
    upload: 'رفع',
    share: 'مشاركة',
    copy: 'نسخ',
    print: 'طباعة',
    refresh: 'تحديث',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    confirm: 'تأكيد',
    retry: 'إعادة المحاولة'
  },

  // Time & Date
  time: {
    now: 'الآن',
    today: 'اليوم',
    tomorrow: 'غداً',
    yesterday: 'أمس',
    thisWeek: 'هذا الأسبوع',
    nextWeek: 'الأسبوع القادم',
    thisMonth: 'هذا الشهر',
    nextMonth: 'الشهر القادم',
    morning: 'الصباح',
    afternoon: 'بعد الظهر',
    evening: 'المساء',
    night: 'الليل',
    minutes: 'دقائق',
    hours: 'ساعات',
    days: 'أيام'
  },

  // Error Messages
  errors: {
    networkError: 'خطأ في الشبكة',
    serverError: 'خطأ في الخادم',
    invalidCredentials: 'بيانات اعتماد غير صحيحة',
    userNotFound: 'المستخدم غير موجود',
    emailExists: 'البريد الإلكتروني موجود بالفعل',
    weakPassword: 'كلمة المرور ضعيفة',
    invalidEmail: 'بريد إلكتروني غير صحيح',
    requiredField: 'هذا الحقل مطلوب',
    noTripsFound: 'لم يتم العثور على رحلات',
    bookingFailed: 'فشل في الحجز',
    paymentFailed: 'فشل في الدفع',
    locationNotFound: 'الموقع غير موجود',
    somethingWentWrong: 'حدث خطأ ما'
  },

  // Success Messages
  success: {
    accountCreated: 'تم إنشاء الحساب بنجاح',
    loginSuccessful: 'تم تسجيل الدخول بنجاح',
    profileUpdated: 'تم تحديث الملف الشخصي',
    tripBooked: 'تم حجز الرحلة بنجاح',
    paymentSuccessful: 'تم الدفع بنجاح',
    messagesSent: 'تم إرسال الرسالة',
    settingsSaved: 'تم حفظ الإعدادات',
    documentUploaded: 'تم رفع الوثيقة',
    verificationComplete: 'تم التحقق بنجاح'
  },

  // Vehicle Types
  vehicles: {
    economy: 'اقتصادي',
    comfort: 'مريح',
    premium: 'مميز',
    luxury: 'فاخر',
    suv: 'دفع رباعي',
    van: 'فان',
    motorcycle: 'دراجة نارية',
    bicycle: 'دراجة هوائية',
    scooter: 'سكوتر',
    truck: 'شاحنة'
  },

  // Ratings & Reviews
  ratings: {
    excellent: 'ممتاز',
    good: 'جيد',
    average: 'متوسط',
    poor: 'ضعيف',
    terrible: 'سيء جداً',
    rateYourTrip: 'قيم رحلتك',
    rateDriver: 'قيم السائق',
    ratePassenger: 'قيم الراكب',
    writeReview: 'اكتب مراجعة',
    helpful: 'مفيد',
    punctual: 'دقيق في المواعيد',
    friendly: 'ودود',
    cleanVehicle: 'مركبة نظيفة',
    safeDriver: 'سائق آمن'
  }
};

// RTL Styles for Arabic
export const RTL_STYLES = {
  direction: 'rtl',
  textAlign: 'right' as const,
  fontFamily: 'Cairo, Tajawal, Arial, sans-serif'
};

// Arabic Number Formatting
export const formatArabicNumber = (number: number): string => {
  return new Intl.NumberFormat('ar-AE').format(number);
};

// Arabic Currency Formatting
export const formatArabicCurrency = (amount: number, currency: string = 'AED'): string => {
  return new Intl.NumberFormat('ar-AE', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Arabic Date Formatting
export const formatArabicDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Arabic Time Formatting
export const formatArabicTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-AE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export default ARABIC_TRANSLATIONS;
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Safe localStorage access
function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem('wassel-language');
    return (saved === 'ar' ? 'ar' : 'en') as Language;
  } catch (error) {
    console.warn('localStorage not available, using default language:', error);
    return 'en';
  }
}

function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem('wassel-language', lang);
  } catch (error) {
    console.warn('Could not save language preference:', error);
  }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => getSavedLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
    
    // Update HTML dir attribute
    try {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (error) {
      console.warn('Could not update document attributes:', error);
    }
  };

  useEffect(() => {
    // Set initial dir attribute
    try {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    } catch (error) {
      console.warn('Could not set initial document attributes:', error);
    }
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Translations object
const translations: Record<Language, any> = {
  en: {
    common: {
      wassel: 'Wassel',
      loading: 'Loading...',
      save: 'Save',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      close: 'Close',
      submit: 'Submit',
      confirm: 'Confirm',
      viewAll: 'View All',
      seeAll: 'See All',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      forgotPassword: 'Forgot Password?',
      continueWithGoogle: 'Continue with Google',
      continueWithFacebook: 'Continue with Facebook',
      orContinueWith: 'Or continue with',
    },
    landing: {
      hero: {
        title: 'Share Rides, Share Costs, Share Experiences',
        subtitle: 'Connect with verified travelers on your route. Safe, affordable, and eco-friendly carpooling across the UAE and beyond.',
        getStarted: 'Get Started',
        learnMore: 'Learn More',
      },
      features: {
        title: 'Why Choose Wassel?',
        verified: 'Verified Users',
        verifiedDesc: 'All drivers and passengers are verified for your safety',
        affordable: 'Affordable',
        affordableDesc: 'Save money on fuel and reduce your carbon footprint',
        flexible: 'Flexible Routes',
        flexibleDesc: 'Find rides that match your schedule and destination',
      },
    },
    dashboard: {
      title: 'Dashboard',
      welcome: 'Welcome back',
      overview: 'Overview',
      quickActions: 'Quick Actions',
      findRide: 'Find a Ride',
      offerRide: 'Offer a Ride',
      viewTrips: 'View My Trips',
      stats: {
        totalTrips: 'Total Trips',
        activeRides: 'Active Rides',
        moneySaved: 'Money Saved',
        co2Reduced: 'CO₂ Reduced',
      },
      recentTrips: 'Recent Trips',
      upcomingTrips: 'Upcoming Trips',
      noTrips: 'No trips yet',
    },
    header: {
      search: 'Search...',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings',
      language: 'Language',
      journeyProgress: 'Journey Progress',
    },
    sidebar: {
      dashboard: 'Dashboard',
      findRide: 'Find Ride',
      offerRide: 'Offer Ride',
      myTrips: 'My Trips',
      recurring: 'Recurring Trips',
      messages: 'Messages',
      favorites: 'Favorites',
      payments: 'Payments',
      analytics: 'Trip Analytics',
      safety: 'Safety Center',
      verification: 'Verification',
      settings: 'Settings',
      profile: 'Profile',
      referrals: 'Referral Program',
      business: 'Business',
      packageDelivery: 'Package Delivery',
      packagedelivery: 'Package Delivery',
      findride: 'Find Ride',
      offerride: 'Offer Ride',
      mytrips: 'My Trips',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your account preferences',
      profile: {
        title: 'Profile Information',
        subtitle: 'Update your personal details',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone Number',
        bio: 'Bio',
        bioPlaceholder: 'Tell us about yourself...',
      },
      notifications: {
        title: 'Notifications',
        subtitle: 'Manage how you receive notifications',
        tripUpdates: 'Trip Updates',
        tripUpdatesDesc: 'Get notified about trip bookings and changes',
        messages: 'Messages',
        messagesDesc: 'Receive notifications for new messages',
        payments: 'Payment Alerts',
        paymentsDesc: 'Get notified about payments and transactions',
        promotional: 'Promotional Emails',
        promotionalDesc: 'Receive offers and updates from Wassel',
      },
      security: {
        title: 'Privacy & Security',
        subtitle: 'Manage your security preferences',
        twoFactor: 'Two-Factor Authentication',
        twoFactorDesc: 'Add an extra layer of security',
        changePassword: 'Change Password',
        changePasswordDesc: 'Update your password regularly',
        profileVisibility: 'Profile Visibility',
        profileVisibilityDesc: 'Control who can see your profile',
        enable: 'Enable',
        change: 'Change',
      },
      language: {
        title: 'Language & Region',
        subtitle: 'Set your preferred language and location',
        language: 'Language',
        country: 'Country/Region',
        savePreferences: 'Save Preferences',
      },
      help: {
        title: 'Help & Support',
        helpCenter: 'Help Center',
        contactSupport: 'Contact Support',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
      },
      danger: {
        title: 'Danger Zone',
        subtitle: 'Irreversible actions',
        deactivate: 'Deactivate Account',
        deleteAccount: 'Delete Account',
      },
    },
    profile: {
      title: 'User Profile',
      editProfile: 'Edit Profile',
      viewMode: 'View Mode',
      name: 'Name',
      nameAr: 'الاسم بالعربية',
      bioAr: 'نبذة بالعربية',
      joinDate: 'Joined',
      location: 'Location',
      member: 'Member since',
      about: 'About',
      stats: 'Stats',
      trips: 'Trips',
      rating: 'Rating',
      reviews: 'Reviews',
      achievements: 'Achievements',
      badges: 'Badges',
      uploadPhoto: 'Upload Photo',
      uploading: 'Uploading...',
      changePhoto: 'Change Photo',
    },
    verification: {
      title: 'Verification Center',
      subtitle: 'Complete your profile verification to unlock all features',
      progress: 'Verification Progress',
      complete: 'Complete',
      pending: 'Pending',
      verified: 'Verified',
      notStarted: 'Not Started',
      privacyNote: 'All documents are encrypted and stored securely. We never share your personal information with other users.',
    },
  },
  ar: {
    common: {
      wassel: 'واصل',
      loading: 'جاري التحميل...',
      save: 'حفظ',
      saveChanges: 'حفظ التغييرات',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      search: 'بحث',
      filter: 'تصفية',
      close: 'إغلاق',
      submit: 'إرسال',
      confirm: 'تأكيد',
      viewAll: 'عرض الكل',
      seeAll: 'مشاهدة الكل',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      signOut: 'تسجيل الخروج',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      fullName: 'الاسم الكامل',
      createAccount: 'إنشاء حساب',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      forgotPassword: 'نسيت كلمة المرور؟',
      continueWithGoogle: 'متابعة بحساب جوجل',
      continueWithFacebook: 'متابعة بحساب فيسبوك',
      orContinueWith: 'أو المتابعة باستخدام',
    },
    landing: {
      hero: {
        title: 'شارك الرحلات، شارك التكاليف، شارك التجارب',
        subtitle: 'تواصل مع مسافرين موثوقين على طريقك. مشاركة سيارات آمنة واقتصادية وصديقة للبيئة في الإمارات وما بعدها.',
        getStarted: 'ابدأ الآن',
        learnMore: 'اعرف المزيد',
      },
      features: {
        title: 'لماذا تختار واصل؟',
        verified: 'مستخدمون موثوقون',
        verifiedDesc: 'جميع السائقين والركاب تم التحقق منهم لسلامتك',
        affordable: 'اقتصادي',
        affordableDesc: 'وفر المال على الوقود وقلل من انبعاثات الكربون',
        flexible: 'مسارات مرنة',
        flexibleDesc: 'اعثر على رحلات تتناسب مع جدولك ووجهتك',
      },
    },
    dashboard: {
      title: 'لوحة التحكم',
      welcome: 'مرحباً بعودتك',
      overview: 'نظرة عامة',
      quickActions: 'إجراءات سريعة',
      findRide: 'ابحث عن رحلة',
      offerRide: 'عرض رحلة',
      viewTrips: 'عرض رحلاتي',
      stats: {
        totalTrips: 'إجمالي الرحلات',
        activeRides: 'الرحلات النشطة',
        moneySaved: 'المال الموفر',
        co2Reduced: 'CO₂ المخفض',
      },
      recentTrips: 'الرحلات الأخيرة',
      upcomingTrips: 'الرحلات القادمة',
      noTrips: 'لا توجد رحلات بعد',
    },
    header: {
      search: 'بحث...',
      notifications: 'الإشعارات',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      language: 'اللغة',
      journeyProgress: 'تقدم الرحلة',
    },
    sidebar: {
      dashboard: 'لوحة التحكم',
      findRide: 'ابحث عن رحلة',
      offerRide: 'عرض رحلة',
      myTrips: 'رحلاتي',
      recurring: 'الرحلات المتكررة',
      messages: 'الرسائل',
      favorites: 'المفضلة',
      payments: 'المدفوعات',
      analytics: 'تحليل الرحلات',
      safety: 'مركز السلامة',
      verification: 'التحقق',
      settings: 'الإعدادات',
      profile: 'الملف الشخصي',
      referrals: 'برنامج الإحالة',
      business: 'الأعمال',
      packageDelivery: 'توصيل الطرود',
      packagedelivery: 'توصيل الطرود',
      findride: 'ابحث عن رحلة',
      offerride: 'عرض رحلة',
      mytrips: 'رحلاتي',
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'إدارة تفضيلات حسابك',
      profile: {
        title: 'معلومات الملف الشخصي',
        subtitle: 'تحديث بياناتك الشخصية',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        bio: 'نبذة',
        bioPlaceholder: 'أخبرنا عن نفسك...',
      },
      notifications: {
        title: 'الإشعارات',
        subtitle: 'إدارة كيفية تلقي الإشعارات',
        tripUpdates: 'تحديثات الرحلة',
        tripUpdatesDesc: 'احصل على إشعارات حول حجوزات وتغييرات الرحلات',
        messages: 'الرسائل',
        messagesDesc: 'تلقي إشعارات الرسائل الجديدة',
        payments: 'تنبيهات الدفع',
        paymentsDesc: 'احصل على إشعارات حول المدفوعات والمعاملات',
        promotional: 'رسائل البريد الترويجية',
        promotionalDesc: 'تلقي العروض والتحديثات من واصل',
      },
      security: {
        title: 'الخصوصية والأمان',
        subtitle: 'إدارة تفضيلات الأمان',
        twoFactor: 'المصادقة الثنائية',
        twoFactorDesc: 'أضف طبقة إضافية من الأمان',
        changePassword: 'تغيير كلمة المرور',
        changePasswordDesc: 'قم بتحديث كلمة المرور بانتظام',
        profileVisibility: 'رؤية الملف الشخصي',
        profileVisibilityDesc: 'تحكم في من يمكنه رؤية ملفك الشخصي',
        enable: 'تفعيل',
        change: 'تغيير',
      },
      language: {
        title: 'اللغة والمنطقة',
        subtitle: 'اختر اللغة والموقع المفضل لديك',
        language: 'اللغة',
        country: 'الدولة/المنطقة',
        savePreferences: 'حفظ التفضيلات',
      },
      help: {
        title: 'المساعدة والدعم',
        helpCenter: 'مركز المساعدة',
        contactSupport: 'اتصل بالدعم',
        termsOfService: 'شروط الخدمة',
        privacyPolicy: 'سياسة الخصوصية',
      },
      danger: {
        title: 'منطقة الخطر',
        subtitle: 'إجراءات لا رجعة فيها',
        deactivate: 'تعطيل الحساب',
        deleteAccount: 'حذف الحساب',
      },
    },
    profile: {
      title: 'الملف الشخصي',
      editProfile: 'تعديل الملف الشخصي',
      viewMode: 'وضع العرض',
      name: 'الاسم',
      nameAr: 'الاسم بالعربية',
      bioAr: 'نبذة بالعربية',
      joinDate: 'انضم في',
      location: 'الموقع',
      member: 'عضو منذ',
      about: 'نبذة',
      stats: 'الإحصائيات',
      trips: 'الرحلات',
      rating: 'التقييم',
      reviews: 'المراجعات',
      achievements: 'الإنجازات',
      badges: 'الشارات',
      uploadPhoto: 'رفع صورة',
      uploading: 'جاري الرفع...',
      changePhoto: 'تغيير الصورة',
    },
    verification: {
      title: 'مركز التحقق',
      subtitle: 'أكمل التحقق من ملفك الشخصي لفتح جميع الميزات',
      progress: 'تقدم التحقق',
      complete: 'مكتمل',
      pending: 'قيد الانتظار',
      verified: 'تم التحقق',
      notStarted: 'لم يبدأ',
      privacyNote: 'جميع المستندات مشفرة ومخزنة بشكل آمن. نحن لا نشارك معلوماتك الشخصية مع المستخدمين الآخرين أبدًا.',
    },
  },
};

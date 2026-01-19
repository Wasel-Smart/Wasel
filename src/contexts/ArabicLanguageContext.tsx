/**
 * Arabic Language Context Provider
 * مزود سياق اللغة العربية مع دعم RTL
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ARABIC_TRANSLATIONS, RTL_STYLES } from '../utils/arabic-translations';

interface LanguageContextType {
  language: 'en' | 'ar';
  translations: typeof ARABIC_TRANSLATIONS;
  isRTL: boolean;
  toggleLanguage: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'ar'>('ar'); // Default to Arabic
  const [translations] = useState(ARABIC_TRANSLATIONS);

  // Apply RTL styles when Arabic is selected
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (language === 'ar') {
      htmlElement.dir = 'rtl';
      htmlElement.lang = 'ar';
      document.body.style.fontFamily = RTL_STYLES.fontFamily;
    } else {
      htmlElement.dir = 'ltr';
      htmlElement.lang = 'en';
      document.body.style.fontFamily = 'Inter, system-ui, sans-serif';
    }
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguageState(newLang);
    localStorage.setItem('wasel-language', newLang);
  };

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('wasel-language', lang);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    if (language === 'en') {
      // Return English fallback or key itself
      return getEnglishTranslation(key) || key;
    }

    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || key;
  };

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('wasel-language') as 'en' | 'ar';
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const value: LanguageContextType = {
    language,
    translations,
    isRTL: language === 'ar',
    toggleLanguage,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// English translations fallback
const getEnglishTranslation = (key: string): string | undefined => {
  const englishTranslations: Record<string, any> = {
    'nav.home': 'Home',
    'nav.findRide': 'Find Ride',
    'nav.offerRide': 'Offer Ride',
    'nav.myTrips': 'My Trips',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.logout': 'Logout',
    
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.phoneNumber': 'Phone Number',
    
    'booking.from': 'From',
    'booking.to': 'To',
    'booking.departure': 'Departure',
    'booking.passengers': 'Passengers',
    'booking.searchTrips': 'Search Trips',
    'booking.bookNow': 'Book Now',
    'booking.price': 'Price',
    
    'status.searching': 'Searching...',
    'status.found': 'Trips Found',
    'status.booked': 'Booked',
    'status.confirmed': 'Confirmed',
    'status.inProgress': 'In Progress',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    
    'payment.paymentMethod': 'Payment Method',
    'payment.creditCard': 'Credit Card',
    'payment.wallet': 'Wallet',
    'payment.cash': 'Cash',
    'payment.total': 'Total',
    'payment.payNow': 'Pay Now',
    
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.delete': 'Delete',
    'actions.edit': 'Edit',
    'actions.view': 'View',
    'actions.search': 'Search',
    'actions.confirm': 'Confirm',
    
    'errors.networkError': 'Network Error',
    'errors.serverError': 'Server Error',
    'errors.somethingWentWrong': 'Something went wrong',
    
    'success.accountCreated': 'Account created successfully',
    'success.loginSuccessful': 'Login successful',
    'success.tripBooked': 'Trip booked successfully'
  };

  const keys = key.split('.');
  let value: any = englishTranslations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  return value;
};

// Hook for RTL-aware styling
export const useRTLStyles = () => {
  const { isRTL } = useLanguage();
  
  return {
    textAlign: isRTL ? 'right' as const : 'left' as const,
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    marginLeft: (value: string) => isRTL ? undefined : value,
    marginRight: (value: string) => isRTL ? value : undefined,
    paddingLeft: (value: string) => isRTL ? undefined : value,
    paddingRight: (value: string) => isRTL ? value : undefined,
    left: (value: string) => isRTL ? undefined : value,
    right: (value: string) => isRTL ? value : undefined,
    borderLeft: (value: string) => isRTL ? undefined : value,
    borderRight: (value: string) => isRTL ? value : undefined,
    borderRadius: (value: string) => {
      if (isRTL && value.includes(' ')) {
        const parts = value.split(' ');
        if (parts.length === 4) {
          // Flip border-radius for RTL: top-left top-right bottom-right bottom-left
          return `${parts[1]} ${parts[0]} ${parts[3]} ${parts[2]}`;
        }
      }
      return value;
    }
  };
};

export default LanguageProvider;
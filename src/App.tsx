import { Suspense, lazy, useState, memo, useCallback } from 'react';
import { InstallPWA } from './components/InstallPWA';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { Toaster } from './components/ui/sonner';

// Core components (loaded immediately for critical path)
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Lazy loaded components for better performance (code splitting)
// Authentication & Landing
const AuthPage = lazy(() => import('./components/AuthPage').then(m => ({ default: m.AuthPage })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));

// Dashboard
const EnhancedDashboard = lazy(() => import('./components/premium/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));

// Core Rides
const FindRide = lazy(() => import('./components/FindRide').then(m => ({ default: m.FindRide })));
const OfferRide = lazy(() => import('./components/OfferRide').then(m => ({ default: m.OfferRide })));
const MyTrips = lazy(() => import('./components/MyTrips').then(m => ({ default: m.MyTrips })));
const RecurringTrips = lazy(() => import('./components/RecurringTrips').then(m => ({ default: m.RecurringTrips })));
const ScheduledTrips = lazy(() => import('./components/ScheduledTrips').then(m => ({ default: m.ScheduledTrips })));

// Communication
const Messages = lazy(() => import('./components/Messages').then(m => ({ default: m.Messages })));
const NotificationCenter = lazy(() => import('./components/NotificationCenter').then(m => ({ default: m.NotificationCenter })));

// User
const Favorites = lazy(() => import('./components/Favorites').then(m => ({ default: m.Favorites })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const ReferralProgram = lazy(() => import('./components/ReferralProgram').then(m => ({ default: m.ReferralProgram })));

// Financial
const Payments = lazy(() => import('./components/Payments').then(m => ({ default: m.Payments })));
const PaymentMethods = lazy(() => import('./components/PaymentMethods').then(m => ({ default: m.PaymentMethods })));
const DriverEarnings = lazy(() => import('./components/DriverEarnings').then(m => ({ default: m.DriverEarnings })));
const TripAnalytics = lazy(() => import('./components/TripAnalytics').then(m => ({ default: m.TripAnalytics })));

// Safety & Verification
const SafetyCenter = lazy(() => import('./components/SafetyCenter').then(m => ({ default: m.SafetyCenter })));
const VerificationCenter = lazy(() => import('./components/VerificationCenter').then(m => ({ default: m.VerificationCenter })));
const DisputeCenter = lazy(() => import('./components/DisputeCenter').then(m => ({ default: m.DisputeCenter })));

// Business
const BusinessAccounts = lazy(() => import('./components/BusinessAccounts').then(m => ({ default: m.BusinessAccounts })));

// Delivery & Shipping
const PackageDelivery = lazy(() => import('./components/PackageDelivery').then(m => ({ default: m.PackageDelivery })));
const FreightShipping = lazy(() => import('./components/FreightShipping').then(m => ({ default: m.FreightShipping })));

// Transport Services
const ScooterRentals = lazy(() => import('./components/ScooterRentals').then(m => ({ default: m.ScooterRentals })));
const PetTransport = lazy(() => import('./components/PetTransport').then(m => ({ default: m.PetTransport })));
const SchoolTransport = lazy(() => import('./components/SchoolTransport').then(m => ({ default: m.SchoolTransport })));
const MedicalTransport = lazy(() => import('./components/MedicalTransport').then(m => ({ default: m.MedicalTransport })));
const CarRentals = lazy(() => import('./components/CarRentals').then(m => ({ default: m.CarRentals })));
const ShuttleService = lazy(() => import('./components/ShuttleService').then(m => ({ default: m.ShuttleService })));
const LuxuryRides = lazy(() => import('./components/LuxuryRides').then(m => ({ default: m.LuxuryRides })));

// Special Services (NEW)
const ElderlyCare = lazy(() => import('./components/ElderlyCare').then(m => ({ default: m.ElderlyCare })));
const KidsActivity = lazy(() => import('./components/KidsActivity').then(m => ({ default: m.KidsActivity })));

// Admin
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// Legal
const TermsOfService = lazy(() => import('./components/legal/TermsOfService').then(m => ({ default: m.TermsOfService })));
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));

// Premium & Advanced
const FloatingActionButton = lazy(() => import('./components/premium/FloatingActionButton').then(m => ({ default: m.FloatingActionButton })));
const VoiceAssistant = lazy(() => import('./components/advanced/VoiceAssistant').then(m => ({ default: m.VoiceAssistant })));
const RideSocial = lazy(() => import('./components/social/RideSocial').then(m => ({ default: m.RideSocial })));

// Analytics & Growth
const Analytics = lazy(() => import('./components/Analytics').then(m => ({ default: m.Analytics })));

// Loading spinner component for Suspense fallback
const LoadingSpinner = memo(() => (
  <div className="flex h-full min-h-[200px] items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Full page loading for auth/landing
const FullPageLoading = memo(() => (
  <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
));

FullPageLoading.displayName = 'FullPageLoading';

// Memoized page renderer for performance
const PageRenderer = memo(({ currentPage, onNavigate }: { currentPage: string; onNavigate: (page: string) => void }) => {
  switch (currentPage) {
    case 'dashboard':
      return <EnhancedDashboard onNavigate={onNavigate} />;
    case 'find-ride':
    case 'carpool':
      return <FindRide />;
    case 'offer-ride':
      return <OfferRide />;
    case 'my-trips':
      return <MyTrips />;
    case 'recurring':
      return <RecurringTrips />;
    case 'messages':
      return <Messages />;
    case 'favorites':
      return <Favorites />;
    case 'payments':
      return <Payments />;
    case 'analytics':
      return <TripAnalytics />;
    case 'safety':
      return <SafetyCenter />;
    case 'verification':
      return <VerificationCenter />;
    case 'settings':
      return <Settings />;
    case 'notifications':
      return <NotificationCenter />;
    case 'profile':
      return <UserProfile />;
    case 'referrals':
      return <ReferralProgram />;
    case 'business':
      return <BusinessAccounts />;
    case 'package-delivery':
      return <PackageDelivery />;
    case 'scooters':
      return <ScooterRentals />;
    case 'freight':
      return <FreightShipping />;
    case 'pets':
      return <PetTransport />;
    case 'school':
      return <SchoolTransport />;
    case 'medical':
      return <MedicalTransport />;
    case 'car-rentals':
      return <CarRentals />;
    case 'shuttle':
      return <ShuttleService />;
    case 'luxury':
      return <LuxuryRides />;
    case 'elderly-care':
      return <ElderlyCare />;
    case 'kids-activity':
      return <KidsActivity />;
    case 'driver-earnings':
      return <DriverEarnings />;
    case 'dispute-center':
      return <DisputeCenter />;
    case 'payment-methods':
      return <PaymentMethods />;
    case 'scheduled-trips':
      return <ScheduledTrips />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'terms-of-service':
      return <TermsOfService />;
    case 'privacy-policy':
      return <PrivacyPolicy />;
    case 'ride-social':
      return <RideSocial />;
    case 'growth-analytics':
      return <Analytics />;
    default:
      return <EnhancedDashboard onNavigate={onNavigate} />;
  }
});

PageRenderer.displayName = 'PageRenderer';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');

  // Memoized callbacks for better performance
  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleLogin = useCallback(() => {
    setAuthTab('login');
    setShowAuthPage(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    setAuthTab('signup');
    setShowAuthPage(true);
  }, []);

  const handleAuthBack = useCallback(() => {
    setShowAuthPage(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    // AuthContext will automatically update user state
    // No need to manually navigate
  }, []);

  const handleBookRide = useCallback(() => setCurrentPage('find-ride'), []);
  const handleBookDelivery = useCallback(() => setCurrentPage('package-delivery'), []);
  const handleScheduleTrip = useCallback(() => setCurrentPage('scheduled-trips'), []);
  const handleCorporateBooking = useCallback(() => setCurrentPage('business'), []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, show Landing Page or Auth Page
  if (!user) {
    if (showAuthPage) {
      return (
        <>
          <Toaster />
          <Suspense fallback={<FullPageLoading />}>
            <AuthPage
              initialTab={authTab}
              onBack={handleAuthBack}
              onSuccess={handleAuthSuccess}
            />
          </Suspense>
        </>
      );
    }

    return (
      <>
        <Toaster />
        <Suspense fallback={<FullPageLoading />}>
          <LandingPage
            onLogin={handleLogin}
            onGetStarted={handleGetStarted}
          />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <InstallPWA />
      <Toaster />

      {/* Voice Assistant - Lazy loaded */}
      <Suspense fallback={null}>
        <VoiceAssistant />
      </Suspense>

      {/* Floating Action Button - Lazy loaded */}
      <Suspense fallback={null}>
        <FloatingActionButton
          onBookRide={handleBookRide}
          onBookDelivery={handleBookDelivery}
          onScheduleTrip={handleScheduleTrip}
          onCorporateBooking={handleCorporateBooking}
        />
      </Suspense>

      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={handleMenuClick}
            onNavigate={handleNavigate}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <Suspense fallback={<LoadingSpinner />}>
              <PageRenderer currentPage={currentPage} onNavigate={handleNavigate} />
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
}

// Memoize AppContent for performance
const MemoizedAppContent = memo(AppContent);

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AIProvider>
          <MemoizedAppContent />
        </AIProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
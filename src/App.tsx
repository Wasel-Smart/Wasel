import { Suspense, lazy, useState, memo, useCallback, useEffect } from 'react';
import { InstallPWA } from './components/InstallPWA';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Core components (loaded immediately)
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Lazy loaded components with proper error handling
const Dashboard = lazy(() =>
  import('./components/Dashboard')
    .then(m => ({ default: m.Dashboard }))
    .catch(error => {
      console.error('Failed to load Dashboard:', error);
      return { default: () => <div className="p-4 text-red-600">Failed to load Dashboard</div> };
    })
);

const LandingPage = lazy(() =>
  import('./components/LandingPage')
    .then(m => ({ default: m.LandingPage }))
    .catch(error => {
      console.error('Failed to load LandingPage:', error);
      return { default: () => <div className="p-4 text-red-600">Failed to load Landing Page</div> };
    })
);

const LaundryService = lazy(() =>
  import('./components/LaundryService')
    .then(m => ({ default: m.LaundryService }))
    .catch(error => {
      console.error('Failed to load LaundryService:', error);
      return { default: () => <div className="p-4 text-red-600">Failed to load Laundry Service</div> };
    })
);

const FindRide = lazy(() =>
  import('./components/FindRide')
    .then(m => ({ default: m.FindRide }))
    .catch(error => {
      console.error('Failed to load FindRide:', error);
      return { default: () => <div className="p-4 text-red-600">Failed to load Find Ride</div> };
    })
);

const Messages = lazy(() =>
  import('./components/Messages')
    .then(m => ({ default: m.default }))
    .catch(error => {
      console.error('Failed to load Messages:', error);
      return { default: () => <div className="p-4 text-red-600">Failed to load Messages</div> };
    })
);

const LoadingSpinner = memo(() => (
  <div className="flex h-full min-h-[200px] items-center justify-center" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" aria-hidden="true"></div>
    <span className="sr-only">Loading...</span>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const { currentPage, navigate } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = useCallback((page: string) => {
    navigate(page);
    setSidebarOpen(false); // Close sidebar on navigation
  }, [navigate]);

  const handleMenuClick = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900" role="status" aria-label="Loading application">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="sr-only">Loading application...</span>
      </div>
    );
  }

  // If not logged in, show landing page
  if (!user) {
    return (
      <>
        <Toaster />
        <Suspense fallback={<LoadingSpinner />}>
          <LandingPage
            onLogin={() => { }}
            onGetStarted={() => { }}
          />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <InstallPWA />
      <Toaster />

      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={handleMenuClick}
            onNavigate={handleNavigate}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-6" role="main">
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
                {currentPage === 'laundry' && <LaundryService />}
                {currentPage === 'find-ride' && <FindRide />}
                {currentPage === 'messages' && <Messages />}
                {/* Default to dashboard for other pages */}
                {!['dashboard', 'laundry', 'find-ride', 'messages'].includes(currentPage) && <Dashboard onNavigate={handleNavigate} />}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
}

const MemoizedAppContent = memo(AppContent);

export default function App() {
  useEffect(() => {
    console.log('✅ Wasel App initialized');
  }, []);

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <AIProvider>
            <NavigationProvider>
              <MemoizedAppContent />
            </NavigationProvider>
          </AIProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

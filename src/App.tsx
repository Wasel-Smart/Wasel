import { Suspense, lazy, useState, memo, useCallback, useEffect } from 'react';
import { InstallPWA } from './components/InstallPWA';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Core components (loaded immediately)
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const LaundryService = lazy(() => import('./components/LaundryService').then(m => ({ default: m.LaundryService })));

const LoadingSpinner = memo(() => (
  <div className="flex h-full min-h-[200px] items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page);
  }, []);

  const handleMenuClick = useCallback(() => {
    // Sidebar toggle logic
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
            onLogin={() => {}}
            onGetStarted={() => {}}
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
          isOpen={false}
          onClose={() => {}}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={handleMenuClick}
            onNavigate={handleNavigate}
          />

          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <Suspense fallback={<LoadingSpinner />}>
              {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
              {currentPage === 'laundry' && <LaundryService />}
              {/* Default to dashboard for other pages */}
              {!['dashboard', 'laundry'].includes(currentPage) && <Dashboard onNavigate={handleNavigate} />}
            </Suspense>
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
            <MemoizedAppContent />
          </AIProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

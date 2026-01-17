import { useEffect, useState } from 'react';
import { BellDot, Menu, CircleUserRound, ChevronDown, X, Languages } from 'lucide-react';
import { Badge } from './ui/badge';
import { Logo } from './Logo';
import { JourneyProgress } from './JourneyProgress';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
  const { unreadCount } = useNotifications();
  const { profile, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showJourneyProgress, setShowJourneyProgress] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Default values if not in profile
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [currentStep, setCurrentStep] = useState(2);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showLanguageMenu) setShowLanguageMenu(false);
    };

    if (showLanguageMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showLanguageMenu]);

  // Sync with profile data
  useEffect(() => {
    if (profile) {
      if (profile.onboarding_completed_steps && Array.isArray(profile.onboarding_completed_steps)) {
        setCompletedSteps(profile.onboarding_completed_steps);
      }
      if (profile.onboarding_current_step) {
        setCurrentStep(profile.onboarding_current_step);
      }
    }
  }, [profile]);

  // Auto-hide when all steps completed
  useEffect(() => {
    if (completedSteps.length === 5) {
      setTimeout(() => {
        setShowJourneyProgress(false);
      }, 5000); // Hide after 5 seconds when complete
    }
  }, [completedSteps]);

  const saveProgress = async (completed: number[], current: number) => {
    // Optimistic update
    setCompletedSteps(completed);
    setCurrentStep(current);

    // Save to backend
    if (profile) {
      await updateProfile({
        ...profile,
        onboarding_completed_steps: completed,
        onboarding_current_step: current
      });
    }
  };

  const handleNavigate = (page: string) => {
    onNavigate?.(page);

    // Update current step based on navigation
    let newCompleted = [...completedSteps];
    let newCurrent = currentStep;
    let changed = false;

    if (page === 'profile') {
      if (!newCompleted.includes(1)) {
        newCompleted.push(1);
        changed = true;
      }
      // If going to profile, maybe set current step to 1 if not done? 
      // Or just keep current.
    } else if (page === 'find-ride') {
      if (newCompleted.includes(1) && !newCompleted.includes(2)) {
        newCompleted.push(2);
        newCurrent = 3;
        changed = true;
      }
    } else if (page === 'offer-ride' || page === 'my-trips') {
      // Maybe step 3?
      if (newCompleted.includes(1) && newCompleted.includes(2) && !newCompleted.includes(3)) {
        newCompleted.push(3);
        newCurrent = 4;
        changed = true;
      }
    }

    if (changed) {
      saveProgress(newCompleted, newCurrent);
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <Logo size="xs" showText={false} className="lg:hidden" />
            <div className="hidden sm:block">
              <h1 className="text-gray-900 dark:text-white">Wassel</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">واصل</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Journey Progress Toggle */}
            {completedSteps.length < 5 && (
              <button
                onClick={() => setShowJourneyProgress(!showJourneyProgress)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                aria-label="Toggle journey progress"
              >
                <span className="font-medium text-sm">
                  Journey: {completedSteps.length}/5
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${showJourneyProgress ? 'rotate-180' : ''
                    }`}
                />
              </button>
            )}

            {/* Notifications */}
            <button
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => onNavigate?.('notifications')}
              aria-label="Notifications"
            >
              <BellDot className="size-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 size-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <button
              className="size-11 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors min-w-[44px] min-h-[44px]"
              onClick={() => onNavigate?.('profile')}
              aria-label="Profile"
            >
              <CircleUserRound className="size-5 text-primary" />
            </button>

            {/* Language Menu */}
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLanguageMenu(!showLanguageMenu);
                }}
                aria-label="Change language"
              >
                <Languages className="size-5 text-gray-700 dark:text-gray-300" />
              </button>
              {showLanguageMenu && (
                <div className="absolute top-12 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 min-w-[120px]">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${language === 'en' ? 'bg-primary/10 font-bold text-primary' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguage('en');
                      setShowLanguageMenu(false);
                    }}
                  >
                    English
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${language === 'ar' ? 'bg-primary/10 font-bold text-primary' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLanguage('ar');
                      setShowLanguageMenu(false);
                    }}
                  >
                    العربية
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Journey Progress Dropdown */}
      <AnimatePresence>
        {showJourneyProgress && completedSteps.length < 5 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 relative">
              <button
                onClick={() => setShowJourneyProgress(false)}
                className="absolute top-4 right-6 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close journey progress"
              >
                <X className="size-4" />
              </button>
              <JourneyProgress
                currentStep={currentStep}
                completedSteps={completedSteps}
                onNavigate={handleNavigate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
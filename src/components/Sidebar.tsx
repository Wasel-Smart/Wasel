import {
  Home,
  Search,
  Route,
  MessageSquare,
  CreditCard,
  Sparkles,
  UserCog,
  BarChart3,
  Heart,
  ShieldCheck,
  RefreshCw,
  BadgePercent,
  Repeat,
  UserPlus,
  Settings,
  Building2,
  Package,
  Calendar,
  Bell,
  CheckCircle,
  Gift,
  X,
  Bus,
  Users,
  TrendingUp,
  Truck
} from 'lucide-react';
import { Logo } from './Logo';
import { Separator } from './ui/separator';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const mainMenuItems = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'find-ride', icon: Navigation2 },
  { id: 'offer-ride', icon: Route },
  { id: 'package-delivery', icon: PackageCheck },
  { id: 'my-trips', icon: CalendarDays },
  { id: 'recurring', icon: Repeat },
  { id: 'messages', icon: MessagesSquare },
  { id: 'favorites', icon: Heart },
];

const specialServicesItems = [
  { id: 'elderly-care', icon: Heart, label: 'Elderly Care' },
  { id: 'kids-activity', icon: Bus, label: 'Kids Activity' },
];

const accountMenuItems = [
  { id: 'profile', icon: UserCog },
  { id: 'growth-analytics', icon: TrendingUp, label: 'Growth Analytics' },
  { id: 'analytics', icon: BarChart3 },
  { id: 'payments', icon: CreditCard },
  { id: 'notifications', icon: BellDot },
  { id: 'verification', icon: BadgeCheck },
  { id: 'safety', icon: ShieldCheck },
  { id: 'referrals', icon: Gift },
  { id: 'business', icon: Building2 },
  { id: 'settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  const { t, language } = useLanguage();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50
        w-64 bg-white dark:bg-gray-900 border-${language === 'ar' ? 'l' : 'r'} border-gray-200 dark:border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : language === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <Logo size="sm" />
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <CircleX className="size-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="space-y-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors min-h-[44px]
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="size-5 flex-shrink-0" />
                    <span>{t(`sidebar.${item.id.replace('-', '')}`)}</span>
                  </button>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {language === 'ar' ? 'خدمات خاصة' : 'Special Services'}
              </p>
              {specialServicesItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors min-h-[44px]
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="size-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <p className="px-4 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                {language === 'ar' ? 'الحساب' : 'Account'}
              </p>
              {accountMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors min-h-[44px]
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="size-5 flex-shrink-0" />
                    <span>{(item as any).label || t(`sidebar.${item.id.replace('-', '')}`)}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
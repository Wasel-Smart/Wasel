/**
 * Service Tabs Component
 * 
 * Unified tabs component that provides Package Delivery, Find Ride, and Share Ride
 * options for all service pages. This ensures consistency across all services.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PackageCheck, Search, Users, Zap } from 'lucide-react';
import { PackageDelivery } from './PackageDelivery';
import { FindRide } from './FindRide';
import { OfferRide } from './OfferRide';
import { IntermodalPlanner } from './IntermodalPlanner';
import { ReactNode } from 'react';

interface ServiceTabsProps {
  /**
   * The main service component to display in the default tab
   */
  mainService: ReactNode;
  /**
   * Title for the main service tab
   */
  mainServiceTitle: string;
  /**
   * Icon for the main service tab
   */
  mainServiceIcon: ReactNode;
  /**
   * Whether to show all tabs or just the main service
   * @default true
   */
  showAllTabs?: boolean;
}

export function ServiceTabs({
  mainService,
  mainServiceTitle,
  mainServiceIcon,
  showAllTabs = true,
}: ServiceTabsProps) {
  if (!showAllTabs) {
    return <>{mainService}</>;
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="main" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 h-14">
          <TabsTrigger value="main" className="flex items-center gap-2 text-sm md:text-base">
            {mainServiceIcon}
            <span className="hidden sm:inline">{mainServiceTitle}</span>
          </TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center gap-2 text-sm md:text-base">
            <Zap className="w-4 h-4 text-teal-500" />
            <span className="hidden sm:inline">Smart Route</span>
          </TabsTrigger>
          <TabsTrigger value="package" className="flex items-center gap-2 text-sm md:text-base">
            <PackageCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Package</span>
          </TabsTrigger>
          <TabsTrigger value="find" className="flex items-center gap-2 text-sm md:text-base">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Find Ride</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2 text-sm md:text-base">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Share Ride</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="mt-0">
          {mainService}
        </TabsContent>

        <TabsContent value="smart" className="mt-0">
          <IntermodalPlanner />
        </TabsContent>

        <TabsContent value="package" className="mt-0">
          <PackageDelivery />
        </TabsContent>

        <TabsContent value="find" className="mt-0">
          <FindRide />
        </TabsContent>

        <TabsContent value="share" className="mt-0">
          <OfferRide />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bike, Battery, MapPin, Scan, Clock, Zap, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MapComponent } from './MapComponent';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceTabs } from './ServiceTabs';
import scooterService from '../services/scooterService';
import { useAuth } from '../contexts/AuthContext';

interface Scooter {
  id: string;
  code: string;
  battery: number;
  range: number; // km
  lat: number;
  lng: number;
  pricePerMin: number;
  status: 'available' | 'in-use' | 'low-battery';
}

const MOCK_SCOOTERS: Scooter[] = [
  { id: '1', code: 'WAS-001', battery: 85, range: 25, lat: 25.2048, lng: 55.2708, pricePerMin: 1.0, status: 'available' },
  { id: '2', code: 'WAS-002', battery: 42, range: 12, lat: 25.2040, lng: 55.2715, pricePerMin: 1.0, status: 'available' },
  { id: '3', code: 'WAS-003', battery: 15, range: 4, lat: 25.2055, lng: 55.2720, pricePerMin: 1.0, status: 'low-battery' },
  { id: '4', code: 'WAS-004', battery: 92, range: 28, lat: 25.2035, lng: 55.2695, pricePerMin: 1.0, status: 'available' },
];

export function ScooterRentals() {
  const { user } = useAuth();
  const [scooters, setScooters] = useState<Scooter[]>([]);
  const [selectedScooter, setSelectedScooter] = useState<Scooter | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [rideDuration, setRideDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load nearby scooters on mount
  useEffect(() => {
    loadNearbyScooters();
  }, []);

  const loadNearbyScooters = async () => {
    try {
      setLoading(true);
      const nearby = await scooterService.getNearbyScooters(25.2048, 55.2708, 3);
      setScooters(nearby);
    } catch (error) {
      console.error('Failed to load scooters:', error);
      toast.error('Failed to load scooters');
    } finally {
      setLoading(false);
    }
  };

  // Timer for active ride
  useEffect(() => {
    let interval: any;
    if (activeRide) {
      interval = setInterval(() => {
        setRideDuration(Math.floor((Date.now() - activeRide.startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeRide]);

  const handleUnlock = async () => {
    if (!selectedScooter || !user) {
      toast.error('Please sign in to rent a scooter');
      return;
    }
    
    setIsUnlocking(true);
    
    try {
      const rental = await scooterService.unlockScooter(selectedScooter.id);
      
      setActiveRide({
        rental,
        startTime: Date.now(),
        scooter: selectedScooter
      });
      
      toast.success('Scooter unlocked! Enjoy your ride.');
      setSelectedScooter(null);
      loadNearbyScooters(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlock scooter');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleEndRide = async () => {
    if (!activeRide) return;
    
    try {
      const { cost } = await scooterService.endRide(
        activeRide.rental.id,
        { lat: 25.2048, lng: 55.2708 } // In production, get from GPS
      );
      
      toast.success(`Ride ended. Total: AED ${cost.toFixed(2)}. Payment processed.`);
      setActiveRide(null);
      setRideDuration(0);
      loadNearbyScooters(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to end ride');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const mainServiceContent = (
    <div className="h-[calc(100vh-80px)] flex flex-col relative bg-gray-50 dark:bg-gray-900">
      
      {/* Map Layer */}
      <div className="flex-1 relative z-0">
        <MapComponent className="w-full h-full" />
        
        {/* Scooter Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {scooters.map((scooter) => (
             // Simple positioning simulation for demo purposes
             // In a real app, these would be rendered by the MapComponent based on coords
            <div 
              key={scooter.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto transition-transform hover:scale-110"
              style={{ 
                top: `${50 + (scooter.lat - 25.2048) * 1000}%`, 
                left: `${50 + (scooter.lng - 55.2708) * 1000}%` 
              }}
              onClick={() => setSelectedScooter(scooter)}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white
                ${scooter.status === 'low-battery' ? 'bg-red-500' : 'bg-green-500'}
              `}>
                <Bike className="w-5 h-5 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UI Overlays */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
        <Card className="pointer-events-auto bg-white/90 backdrop-blur-md shadow-lg border-0">
          <CardContent className="p-4 flex items-center gap-3">
             <div className="p-2 bg-green-100 rounded-lg">
                <Bike className="w-5 h-5 text-green-600" />
             </div>
             <div>
               <p className="font-bold text-sm">Nearby Scooters</p>
               <p className="text-xs text-muted-foreground">{MOCK_SCOOTERS.filter(s => s.status === 'available').length} available</p>
             </div>
          </CardContent>
        </Card>
        
        {activeRide && (
          <Card className="pointer-events-auto bg-green-600 text-white shadow-lg border-0 animate-pulse">
            <CardContent className="p-4 flex items-center gap-4">
               <div>
                 <p className="text-xs text-green-100 uppercase font-bold">Ride Time</p>
                 <p className="font-mono text-2xl font-bold">{formatTime(rideDuration)}</p>
               </div>
               <Button variant="secondary" size="sm" onClick={handleEndRide} className="bg-white text-green-700 hover:bg-green-50">
                 End Ride
               </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Scooter Sheet */}
      <AnimatePresence>
        {selectedScooter && !activeRide && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 z-20"
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Bike className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {selectedScooter.code}
                        <Badge variant={selectedScooter.battery > 20 ? 'default' : 'destructive'} className="text-xs">
                          {selectedScooter.battery}% Battery
                        </Badge>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {selectedScooter.range}km range</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Electronic</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">AED {selectedScooter.pricePerMin}</p>
                    <p className="text-xs text-muted-foreground">per min</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700"
                    onClick={handleUnlock}
                    disabled={isUnlocking || selectedScooter.status === 'low-battery'}
                  >
                    {isUnlocking ? (
                      <span className="animate-pulse">Unlocking...</span>
                    ) : (
                      <>
                        <Scan className="mr-2 w-5 h-5" />
                        {selectedScooter.status === 'low-battery' ? 'Low Battery' : 'Scan to Unlock'}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 aspect-square"
                    onClick={() => setSelectedScooter(null)}
                  >
                    X
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Scan Button (when nothing selected) */}
      {!selectedScooter && !activeRide && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <Button 
            size="lg" 
            className="h-16 rounded-full px-8 shadow-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-transform"
            onClick={() => toast.info('Point camera at scooter QR code')}
          >
            <Scan className="mr-2 w-6 h-6" />
            Scan to Ride
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <ServiceTabs
      mainService={mainServiceContent}
      mainServiceTitle="Scooter Rentals"
      mainServiceIcon={<Bike className="w-4 h-4" />}
      showAllTabs={true}
    />
  );
}

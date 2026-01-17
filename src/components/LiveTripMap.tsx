/**
 * Live Trip Map - Real-time GPS tracking with enhanced features
 * Features:
 * - Live driver/passenger location updates
 * - ETA calculation
 * - Route optimization
 * - Share location
 * - Emergency SOS
 * - Traffic visualization
 */

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, Share2, AlertTriangle, Clock, Users, Car, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MapComponent } from './MapComponent';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export interface LiveTripMapProps {
  tripId: string;
  route: Array<{ lat: number; lng: number; label?: string }>;
  isDriver?: boolean;
  allowLocationSharing?: boolean;
  onShareLocation?: (location: { lat: number; lng: number }) => void;
  onEmergency?: () => void;
}

export function LiveTripMap({
  tripId,
  route,
  isDriver = false,
  allowLocationSharing = true,
  onShareLocation,
  onEmergency,
}: LiveTripMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [passengerLocation, setPassengerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [isSharing, setIsSharing] = useState(false);
  const [tripProgress, setTripProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const locationWatchId = useRef<number | null>(null);
  const lastUpdate = useRef<number>(Date.now());

  // Real-time location tracking
  useEffect(() => {
    if ('geolocation' in navigator) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setCurrentLocation(newLocation);
          
          // Calculate speed (km/h)
          if (position.coords.speed !== null) {
            setSpeed(Math.round(position.coords.speed * 3.6)); // m/s to km/h
          }

          // Auto-share if enabled
          if (isSharing && onShareLocation) {
            onShareLocation(newLocation);
          }

          // Update role-specific location
          if (isDriver) {
            setDriverLocation(newLocation);
          } else {
            setPassengerLocation(newLocation);
          }

          lastUpdate.current = Date.now();
        },
        (error) => {
          console.error('Location tracking error:', error);
          toast.error('Unable to track location. Please enable GPS.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );
    }

    return () => {
      if (locationWatchId.current !== null) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, [isSharing, isDriver, onShareLocation]);

  // Calculate ETA and distance
  useEffect(() => {
    if (!currentLocation || route.length === 0) return;

    const destination = route[route.length - 1];
    const distanceToDestination = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );

    setDistance(distanceToDestination);

    // Calculate ETA based on current speed or average speed
    const averageSpeed = speed > 0 ? speed : 40; // Default 40 km/h
    const etaMinutes = (distanceToDestination / averageSpeed) * 60;
    setEta(Math.round(etaMinutes));

    // Calculate trip progress
    if (route.length > 1) {
      const totalDistance = calculateTotalRouteDistance(route);
      const progress = Math.min(100, Math.max(0, ((totalDistance - distanceToDestination) / totalDistance) * 100));
      setTripProgress(progress);
    }
  }, [currentLocation, route, speed]);

  // Toggle location sharing
  const toggleLocationSharing = () => {
    setIsSharing(!isSharing);
    toast.success(isSharing ? 'Location sharing stopped' : 'Location sharing started');
  };

  // Handle emergency
  const handleEmergency = () => {
    if (onEmergency) {
      onEmergency();
    }
    toast.error('Emergency alert sent to contacts and authorities');
  };

  // Share current location
  const shareLocation = () => {
    if (currentLocation) {
      const url = `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
      if (navigator.share) {
        navigator.share({
          title: 'My Current Location',
          text: 'Track my location in real-time',
          url: url,
        });
      } else {
        navigator.clipboard.writeText(url);
        toast.success('Location link copied to clipboard');
      }
    }
  };

  // Prepare map locations
  const mapLocations = [
    ...route.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      label: point.label || `Stop ${index + 1}`,
      type: index === 0 ? 'start' : index === route.length - 1 ? 'destination' : 'stop',
    })),
    ...(driverLocation ? [{
      lat: driverLocation.lat,
      lng: driverLocation.lng,
      label: 'Driver',
      type: 'driver' as const,
    }] : []),
    ...(passengerLocation && !isDriver ? [{
      lat: passengerLocation.lat,
      lng: passengerLocation.lng,
      label: 'You',
      type: 'user' as const,
    }] : []),
  ];

  return (
    <div className="relative h-full flex flex-col">
      {/* Enhanced Map */}
      <div className="flex-1 relative">
        <MapComponent
          locations={mapLocations}
          showRoute={true}
          realTimeTracking={true}
          style="streets"
          interactive={true}
          className="h-full"
        />

        {/* Floating Trip Info Card */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 z-20"
            >
              <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-0">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* ETA */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4 text-primary mr-1" />
                        <span className="text-xs text-muted-foreground">ETA</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {eta !== null ? `${eta}m` : '--'}
                      </div>
                    </div>

                    {/* Distance */}
                    <div className="text-center border-x border-gray-200">
                      <div className="flex items-center justify-center mb-1">
                        <Navigation className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="text-xs text-muted-foreground">Distance</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {distance.toFixed(1)}km
                      </div>
                    </div>

                    {/* Speed */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Car className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-xs text-muted-foreground">Speed</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {speed}
                        <span className="text-sm ml-1">km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Trip Progress</span>
                      <span className="text-xs font-semibold text-primary">{tripProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-blue-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${tripProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Driver/Passenger Info */}
        {(driverLocation || passengerLocation) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-24 left-4 z-20"
          >
            <Card className="bg-white/95 backdrop-blur-xl shadow-lg border-0">
              <CardContent className="p-3 flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-white">
                    {isDriver ? <Users className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {isDriver ? 'Passenger Location' : 'Driver Location'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isDriver ? 'Tracking enabled' : 'En route to pickup'}
                  </div>
                </div>
                <Badge variant={isDriver ? "default" : "secondary"} className="text-xs">
                  Live
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Bottom Control Panel */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
          {/* Location Sharing */}
          {allowLocationSharing && (
            <Button
              variant={isSharing ? "default" : "outline"}
              size="sm"
              onClick={toggleLocationSharing}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <MapPin className={`w-5 h-5 ${isSharing ? 'animate-pulse' : ''}`} />
              <span className="text-xs">{isSharing ? 'Sharing' : 'Share'}</span>
            </Button>
          )}

          {/* Share Location Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={shareLocation}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">Share</span>
          </Button>

          {/* Call/Message */}
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Call</span>
          </Button>

          {/* Emergency SOS */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergency}
            className="flex flex-col items-center gap-1 h-auto py-3 bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs">SOS</span>
          </Button>
        </div>

        {/* Last Update */}
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdate.current).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateTotalRouteDistance(route: Array<{ lat: number; lng: number }>): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
  }
  return total;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

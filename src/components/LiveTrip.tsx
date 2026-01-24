/**
 * Live Trip Tracking Component
 * 
 * Real-time trip tracking interface with driver location,
 * ETA updates, and emergency features.
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import {
  Phone,
  MessageCircle,
  AlertTriangle,
  Navigation,
  Clock,
  MapPin,
  Share2,
  X,
  Shield
} from 'lucide-react';
import { realTimeTrackingService, LocationUpdate, TripStatus } from '../services/realTimeTracking';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/api';
import { useNavigation } from '../contexts/NavigationContext';

interface LiveTripProps {
  tripId: string;
  driverId: string;
  driverInfo: {
    name: string;
    photo?: string;
    rating: number;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor: string;
  };
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  onCancel?: () => void;
  onComplete?: () => void;
}

export function LiveTrip({
  tripId,
  driverId,
  driverInfo,
  pickupLocation,
  dropoffLocation,
  onCancel,
  onComplete,
}: LiveTripProps) {
  const { t } = useLanguage();
  const { navigate } = useNavigation();
  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus | null>(null);
  const [verificationCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [showEmergency, setShowEmergency] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to driver location updates
    const unsubscribeLocation = realTimeTrackingService.subscribeToDriverLocation(
      tripId,
      driverId,
      (location) => {
        setDriverLocation(location);
        updateMapMarker(location);

        // Calculate ETA
        if (tripStatus?.status === 'arriving' || tripStatus?.status === 'waiting') {
          const eta = realTimeTrackingService.calculateETA(
            location.coordinates,
            pickupLocation.coordinates,
            location.speed
          );
          setTripStatus((prev) => prev ? { ...prev, ...eta } : null);
        }
      }
    );

    // Subscribe to trip status updates
    const unsubscribeStatus = realTimeTrackingService.subscribeToTripStatus(
      tripId,
      (status) => {
        setTripStatus(status);

        if (status.status === 'completed') {
          toast.success(t('trip.completed'));
          onComplete?.();
        }
      }
    );

    // Monitor pickup zone
    const stopMonitoring = realTimeTrackingService.monitorPickupZone(
      tripId,
      pickupLocation.coordinates,
      100,
      () => {
        toast.info(t('trip.driverNearby'));
      }
    );

    return () => {
      unsubscribeLocation();
      unsubscribeStatus();
      stopMonitoring();
    };
  }, [tripId, driverId, pickupLocation, t, onComplete]);

  const updateMapMarker = (location: LocationUpdate) => {
    // In production, this would update Google Maps marker
    console.log('Update map marker:', location);
  };

  const handleCall = async () => {
    toast.info('Initiating call to driver...');
    try {
      const { twilioService } = await import('../services/twilioService');

      // Get user's phone number
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      const { data: driverProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', driverId)
        .single();

      if (userProfile?.phone && driverProfile?.phone) {
        const result = await twilioService.initiateCall(
          userProfile.phone,
          driverProfile.phone
        );

        if (result.success) {
          toast.success('Call initiated successfully');
        } else {
          toast.error(result.error || 'Failed to initiate call');
        }
      } else {
        toast.error('Phone numbers not available');
      }
    } catch (error) {
      console.error('Call initiation failed:', error);
      toast.error('Failed to initiate call');
    }
  };

  const handleMessage = () => {
    navigate('messages');
    toast.info('Opening messages...');
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/track/${tripId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Track my trip',
        text: `Follow my trip on Wassel. Verification code: ${verificationCode}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const handleEmergencySOS = async () => {
    if (!driverLocation) return;

    const confirmed = window.confirm(
      'Are you sure you want to send an emergency alert? This will notify authorities and your emergency contacts.'
    );

    if (confirmed) {
      const success = await realTimeTrackingService.sendEmergencySOS(
        tripId,
        driverLocation.coordinates,
        'User initiated SOS'
      );

      if (success) {
        toast.error('Emergency alert sent! Help is on the way.');
      } else {
        toast.error('Failed to send emergency alert. Please call emergency services directly.');
      }
    }
  };

  const getStatusText = () => {
    switch (tripStatus?.status) {
      case 'waiting':
        return 'Driver is on the way';
      case 'arriving':
        return 'Driver is arriving';
      case 'picked_up':
        return 'Picked up - heading to destination';
      case 'in_progress':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      default:
        return 'Connecting...';
    }
  };

  const getStatusColor = () => {
    switch (tripStatus?.status) {
      case 'waiting':
      case 'arriving':
        return 'bg-yellow-500';
      case 'picked_up':
      case 'in_progress':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatETA = () => {
    if (!tripStatus?.eta) return 'Calculating...';

    const now = new Date();
    const eta = new Date(tripStatus.eta);
    const diffMinutes = Math.round((eta.getTime() - now.getTime()) / 60000);

    if (diffMinutes < 1) return 'Arriving now';
    if (diffMinutes === 1) return '1 min away';
    return `${diffMinutes} mins away`;
  };

  const formatDistance = () => {
    if (!tripStatus?.distance) return '-';

    const km = (tripStatus.distance / 1000).toFixed(1);
    return `${km} km`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
              <div>
                <p className="font-semibold">{getStatusText()}</p>
                <p className="text-sm text-muted-foreground">
                  Trip ID: {tripId.slice(0, 8)}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {verificationCode}
            </Badge>
          </div>

          {/* ETA Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatETA()}
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                {formatDistance()}
              </span>
            </div>
            <Progress value={tripStatus?.distance ? 100 - (tripStatus.distance / 10000) * 100 : 0} />
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="w-full h-96 bg-gray-200 rounded-lg relative overflow-hidden"
          >
            {/* Placeholder for map - integrate Google Maps here */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Map view</p>
                <p className="text-sm">Integrate Google Maps API</p>
              </div>
            </div>

            {/* Emergency Button Overlay */}
            <Button
              variant="destructive"
              size="lg"
              className="absolute bottom-4 right-4 shadow-lg"
              onClick={handleEmergencySOS}
            >
              <Shield className="w-5 h-5 mr-2" />
              SOS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={driverInfo.photo} />
                <AvatarFallback>{driverInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{driverInfo.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>⭐ {driverInfo.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{driverInfo.vehicleModel}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {driverInfo.vehicleColor} • {driverInfo.vehiclePlate}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleCall}>
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleMessage}>
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Pickup */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-12 bg-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pickup</p>
              <p className="font-medium">{pickupLocation.address}</p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Dropoff</p>
              <p className="font-medium">{dropoffLocation.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Trip
        </Button>

        {tripStatus?.status === 'waiting' && onCancel && (
          <Button variant="destructive" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel Trip
          </Button>
        )}
      </div>

      {/* Safety Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Your safety is our priority
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-200">
                <li>• Share your trip with trusted contacts</li>
                <li>• Verify driver details before entering vehicle</li>
                <li>• Use SOS button in case of emergency</li>
                <li>• All trips are tracked and recorded</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

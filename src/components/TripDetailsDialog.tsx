import { useState, useEffect } from 'react';
import { CircleX, Locate, CalendarClock, Timer, UsersRound, CircleDollarSign, Sparkles, Smartphone, MessagesSquare, MapPin, Navigation2, ShieldCheck, Clock, User, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { MapComponent } from './MapComponent';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { twilioService } from '../services/twilioService';
import { supabase } from '../services/api';

interface TripStop {
  label: string;
  lat: number;
  lng: number;
}

interface TripDetails {
  id: number;
  driver: {
    name: string;
    initials: string;
    rating: number;
    trips: number;
    phone?: string;
    verified?: boolean;
    id?: string;
  };
  from: string;
  to: string;
  stops?: TripStop[];
  date: string;
  time: string;
  seats: number;
  price: number;
  tripType: 'wasel' | 'raje3';
  vehicleModel?: string;
  vehicleColor?: string;
  vehiclePlate?: string;
  notes?: string;
  preferences?: {
    noSmoking?: boolean;
    petsAllowed?: boolean;
    musicOk?: boolean;
    quietRide?: boolean;
  };
  instantBook?: boolean;
  estimatedDuration?: string;
  distance?: string;
}

interface TripDetailsDialogProps {
  trip: TripDetails | null;
  open: boolean;
  onClose: () => void;
  onBook?: (tripId: number, seats: number) => void;
}

export function TripDetailsDialog({ trip, open, onClose, onBook }: TripDetailsDialogProps) {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');

  useEffect(() => {
    if (trip?.driver?.id && open) {
      fetchDriverPhone(trip.driver.id);
      fetchUserPhone();
    }
  }, [trip, open]);

  const fetchDriverPhone = async (driverId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', driverId)
        .single();
      
      if (data?.phone) {
        setDriverPhone(data.phone);
      }
    } catch (error) {
      console.error('Error fetching driver phone:', error);
    }
  };

  const fetchUserPhone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();
      
      if (data?.phone) {
        setUserPhone(data.phone);
      }
    } catch (error) {
      console.error('Error fetching user phone:', error);
    }
  };

  if (!trip) return null;

  // Prepare map locations with proper coordinates
  const mapLocations = [
    {
      lat: trip.stops?.[0]?.lat || 25.2048,
      lng: trip.stops?.[0]?.lng || 55.2708,
      label: trip.from,
      type: 'start' as const
    },
    ...(trip.stops?.slice(1, -1).map((stop) => ({
      lat: stop.lat,
      lng: stop.lng,
      label: stop.label,
      type: 'stop' as const
    })) || []),
    {
      lat: trip.stops?.[trip.stops.length - 1]?.lat || 24.4539,
      lng: trip.stops?.[trip.stops.length - 1]?.lng || 54.3773,
      label: trip.to,
      type: 'destination' as const
    }
  ];

  const handleCall = async () => {
    if (!driverPhone || !userPhone) {
      toast.error('Phone numbers not available. Please update your profile.');
      return;
    }

    setLoading(true);
    try {
      const result = await twilioService.initiateCall(userPhone, driverPhone);
      
      if (result.success) {
        toast.success('Call initiated successfully');
      } else {
        toast.error(result.error || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Call failed:', error);
      toast.error('Failed to initiate call');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messages with driver
    toast.info('Opening chat with driver...');
    // TODO: Implement navigation to messages
  };

  const handleGetDirections = () => {
    const origin = `${trip.stops?.[0]?.lat || 25.2048},${trip.stops?.[0]?.lng || 55.2708}`;
    const destination = `${trip.stops?.[trip.stops!.length - 1]?.lat || 24.4539},${trip.stops?.[trip.stops!.length - 1]?.lng || 54.3773}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
  };

  const handleBooking = async () => {
    if (!onBook) return;
    
    if (selectedSeats < 1 || selectedSeats > trip.seats) {
      toast.error('Invalid number of seats');
      return;
    }

    setLoading(true);
    try {
      await onBook(trip.id, selectedSeats);
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = trip.price * selectedSeats;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Trip Details</DialogTitle>
            <div className="flex items-center gap-2">
              {trip.instantBook && (
                <Badge variant="default" className="bg-green-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Instant Book
                </Badge>
              )}
              <Badge variant={trip.tripType === 'wasel' ? 'default' : 'secondary'}>
                {trip.tripType === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Info with Enhanced Actions */}
          <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
            <Avatar className="w-20 h-20 border-4 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {trip.driver.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{trip.driver.name}</h3>
                {trip.driver.verified && (
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{trip.driver.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{trip.driver.trips} trips completed</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleCall}
                  disabled={loading || !driverPhone}
                >
                  <Phone className="w-4 h-4" />
                  Call Driver
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleMessage}
                >
                  <MessagesSquare className="w-4 h-4" />
                  Message
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleGetDirections}
                >
                  <Navigation2 className="w-4 h-4" />
                  Directions
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Enhanced Interactive Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Route & Stops</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {trip.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{trip.estimatedDuration}</span>
                  </div>
                )}
                {trip.distance && (
                  <div className="flex items-center gap-1">
                    <Navigation2 className="w-4 h-4" />
                    <span>{trip.distance}</span>
                  </div>
                )}
              </div>
            </div>
            <MapComponent 
              locations={mapLocations}
              showRoute={true}
              height="450px"
              interactive={true}
              style="streets"
              showTraffic={false}
              className="shadow-xl"
            />
          </div>

          {/* Booking Section */}
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Number of Seats</p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                      disabled={selectedSeats <= 1 || loading}
                      className="w-10 h-10 text-lg font-bold"
                    >
                      -
                    </Button>
                    <span className="w-12 text-center text-2xl font-bold">{selectedSeats}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSeats(Math.min(trip.seats, selectedSeats + 1))}
                      disabled={selectedSeats >= trip.seats || loading}
                      className="w-10 h-10 text-lg font-bold"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                  <p className="text-4xl font-bold text-primary">${totalPrice}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${trip.price} × {selectedSeats} seat{selectedSeats > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[200px] h-14 text-lg font-semibold shadow-lg"
                onClick={handleBooking}
                disabled={loading || selectedSeats < 1}
              >
                {loading ? 'Processing...' : `Book ${selectedSeats} Seat${selectedSeats > 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

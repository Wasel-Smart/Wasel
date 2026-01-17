import { useState } from 'react';
import { Locate, CalendarClock, UsersRound, CircleDollarSign, Sparkles, MoveRight, SlidersHorizontal, CircleX, Sparkle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { TripDetailsDialog } from './TripDetailsDialog';
import { toast } from 'sonner';
import { useSearchTrips } from '../hooks/useTrips';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/mockDataService';

export function FindRide() {
  const { user } = useAuth();
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  
  const { trips, loading, error, searchTrips } = useSearchTrips({
    from: searchFrom,
    to: searchTo,
    departureDate: searchDate,
    seats: parseInt(passengers)
  });

  // Advanced filters
  const [filters, setFilters] = useState({
    priceRange: [0, 200],
    minRating: 4.0,
    verifiedOnly: false,
    instantBook: false,
    preferences: {
      noSmoking: false,
      petsAllowed: false,
      musicOk: false,
      quietRide: false
    }
  });

  const handleSearch = () => {
      searchTrips();
  };

  const handleViewDetails = (ride: any) => {
    setSelectedTrip(ride);
    setDialogOpen(true);
  };

  const handleBookTrip = async (tripId: string) => {
    if (!user) {
        toast.error('Please sign in to book a trip');
        return;
    }
    try {
        await dataService.createBooking(tripId, parseInt(passengers));
        toast.success('Trip booked successfully! Check "My Trips" for details.');
        setDialogOpen(false);
        // Refresh search results
        searchTrips();
    } catch (err: any) {
        toast.error(err.message || 'Failed to book trip');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Find a Ride</CardTitle>
          <CardDescription>Search for available rides across the Middle East</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <div className="relative">
                <Locate className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Starting location"
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <div className="relative">
                <Locate className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Destination"
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Passengers</Label>
              <div className="relative">
                <UsersRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full md:w-auto mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search Rides'}
          </Button>
        </CardContent>
      </Card>

      {/* Available Rides */}
      <div className="space-y-4">
        <h2>Available Rides</h2>
        
        {loading && <p>Loading rides...</p>}
        {!loading && trips.length === 0 && <p>No rides found. Try changing your search criteria.</p>}

        <div className="space-y-4">
          {trips.map((ride: any) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Driver Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span>{ride.driver?.initials || 'DR'}</span>
                    </div>
                    <div>
                      <p className="font-medium">{ride.driver?.name || 'Unknown Driver'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Sparkles className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{ride.driver?.rating || 'New'}</span>
                        <span>•</span>
                        <span>{ride.driver?.trips || 0} trips</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{ride.from}</span>
                        <MoveRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{ride.to}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{ride.departure_date}</span>
                        <span>•</span>
                        <span>{ride.departure_time}</span>
                        <span>•</span>
                        <span>{ride.available_seats} seats left</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl text-primary">${ride.price_per_seat}</div>
                      <p className="text-sm text-gray-500">per seat</p>
                    </div>
                    {ride.type && (
                      <Badge variant={ride.type === 'wasel' ? 'default' : 'secondary'}>
                        {ride.type === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
                      </Badge>
                    )}
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleViewDetails(ride)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trip Details Dialog with Map */}
      <TripDetailsDialog
        trip={selectedTrip}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onBook={handleBookTrip}
      />
    </div>
  );
}
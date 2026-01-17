import { useState, useEffect } from 'react';
import { CalendarDays, Locate, UsersRound, CircleDollarSign, MoveRight, Radar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { LiveTripMap } from './LiveTripMap';
import { useTrips } from '../hooks/useTrips';
import { useBookings } from '../hooks/useBookings';
import { useAuth } from '../contexts/AuthContext';

// Data is now loaded dynamically from hooks

export function MyTrips() {
  const { user } = useAuth();
  const [selectedTripForTracking, setSelectedTripForTracking] = useState<any>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  // Fetch user's bookings (as passenger)
  const { bookings: userBookings, loading: bookingsLoading } = useBookings();

  // Fetch user's trips (as driver)
  const { trips: driverTrips, loading: tripsLoading } = useTrips({ driverId: user?.id });

  // Combine and format data
  const [upcomingTripsData, setUpcomingTripsData] = useState<any[]>([]);
  const [driverTripsData, setDriverTripsData] = useState<any[]>([]);
  const [completedTripsData, setCompletedTripsData] = useState<any[]>([]);

  useEffect(() => {
    // Format user bookings as upcoming trips
    const upcoming = (userBookings || [])
      .filter((b: any) => b.status === 'pending' || b.status === 'accepted')
      .map((booking: any) => ({
        id: booking.trip_id || booking.id,
        type: booking.trip?.trip_type || 'wasel',
        status: booking.status === 'accepted' ? 'Confirmed' : 'Pending',
        from: booking.trip?.from || 'Unknown',
        to: booking.trip?.to || 'Unknown',
        date: booking.trip?.departure_date || new Date().toISOString().split('T')[0],
        time: booking.trip?.departure_time || '12:00',
        seats: booking.seats_requested || 1,
        totalPrice: booking.total_price || 0,
        driver: {
          name: booking.trip?.driver_name || 'Driver',
          initials: (booking.trip?.driver_name || 'D').split(' ').map((n: string) => n[0]).join(''),
          vehicle: booking.trip?.vehicle?.model || 'Vehicle',
        },
      }));
    setUpcomingTripsData(upcoming);

    // Format driver trips
    const trips = (driverTrips || [])
      .filter((t: any) => t.status === 'published' || t.status === 'in_progress');

    const formatted = trips.map((trip: any) => {
      // Get bookings for this trip from userBookings
      const tripBookings = (userBookings || []).filter((b: any) => b.trip_id === trip.id);
      const passengers = tripBookings.map((b: any) => ({
        name: b.passenger_name || 'Passenger',
        initials: (b.passenger_name || 'P').split(' ').map((n: string) => n[0]).join(''),
        seats: b.seats_requested || 1,
      }));

      return {
        id: trip.id,
        type: trip.trip_type || 'wasel',
        from: trip.from,
        to: trip.to,
        date: trip.departure_date,
        time: trip.departure_time,
        totalSeats: trip.total_seats,
        booked: trip.total_seats - trip.available_seats,
        pricePerSeat: trip.price_per_seat,
        earnings: (trip.total_seats - trip.available_seats) * trip.price_per_seat,
        passengers,
      };
    });

    setDriverTripsData(formatted);

    // Format completed trips
    const completed = [
      ...(userBookings || []).filter((b: any) => b.status === 'completed'),
      ...(driverTrips || []).filter((t: any) => t.status === 'completed'),
    ].map((item: any) => ({
      id: item.id || item.trip_id,
      type: item.trip_type || item.trip?.trip_type || 'wasel',
      from: item.from || item.trip?.from || 'Unknown',
      to: item.to || item.trip?.to || 'Unknown',
      date: item.departure_date || item.trip?.departure_date || new Date().toISOString().split('T')[0],
      price: item.total_price || item.price_per_seat || 0,
    }));
    setCompletedTripsData(completed);
  }, [userBookings, driverTrips]);

  const handleTrackTrip = (trip: any) => {
    setSelectedTripForTracking(trip);
    setTrackingDialogOpen(true);
  };

  const handleLocationShare = (location: { lat: number; lng: number }) => {
    console.log('Location shared:', location);
    // In production, send to backend/other riders
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1>My Trips</h1>
        <p className="text-gray-600">Manage your upcoming and past journeys</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="as-driver">As Driver</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {bookingsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : upcomingTripsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No upcoming trips. Book a ride to get started!</p>
              </CardContent>
            </Card>
          ) : (
            upcomingTripsData.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Trip Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={trip.type === 'wasel' ? 'default' : 'secondary'}>
                          {trip.type === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
                        </Badge>
                        <Badge variant="outline">{trip.status}</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <Locate className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trip.from}</span>
                          <MoveRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{trip.to}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>{trip.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UsersRound className="w-4 h-4" />
                          <span>{trip.seats} seats booked</span>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm">{trip.driver.initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{trip.driver.name}</p>
                          <p className="text-sm text-gray-500">{trip.driver.vehicle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4">
                      <div className="text-right">
                        <div className="text-2xl text-primary">${trip.totalPrice}</div>
                        <p className="text-sm text-gray-500">Total price</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackTrip(trip)}
                          className="gap-1"
                        >
                          <Radar className="w-3 h-3" />
                          Track Live
                        </Button>
                        <Button variant="outline" size="sm">Contact Driver</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="as-driver" className="space-y-4">
          {tripsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : driverTripsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>You haven't offered any rides yet. Share a ride to get started!</p>
              </CardContent>
            </Card>
          ) : (
            driverTripsData.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={trip.type === 'wasel' ? 'default' : 'secondary'}>
                          {trip.type === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
                        </Badge>
                        <Badge variant="outline">{trip.booked}/{trip.totalSeats} seats booked</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <Locate className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trip.from}</span>
                          <MoveRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{trip.to}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="w-4 h-4" />
                        <span>{trip.date} at {trip.time}</span>
                      </div>

                      {trip.passengers && trip.passengers.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Passengers:</p>
                          <div className="space-y-2">
                            {trip.passengers.map((passenger: { name: string; initials: string; seats: number }, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs">{passenger.initials}</span>
                                </div>
                                <span>{passenger.name}</span>
                                <span className="text-gray-500">• {passenger.seats} seat(s)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4">
                      <div className="text-right">
                        <div className="text-2xl text-primary">AED {trip.earnings}</div>
                        <p className="text-sm text-gray-500">Est. earnings</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Cancel Trip
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTripsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>No completed trips yet.</p>
              </CardContent>
            </Card>
          ) : (
            completedTripsData.map((trip) => (
              <Card key={trip.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                        <Badge variant={trip.type === 'wasel' ? 'default' : 'secondary'}>
                          {trip.type === 'wasel' ? 'Wasel' : 'Raje3'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <Locate className="w-5 h-5 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{trip.from}</span>
                          <MoveRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{trip.to}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">{trip.date}</p>
                    </div>

                    <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4">
                      <div className="text-right">
                        <div className="text-2xl">${trip.price}</div>
                      </div>
                      <Button variant="outline" size="sm">Rate Driver</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Live Tracking Dialog */}
      {selectedTripForTracking && (
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Live Trip Tracking</DialogTitle>
            </DialogHeader>
            <LiveTripMap
              tripId={selectedTripForTracking.id.toString()}
              route={selectedTripForTracking.route || []}
              isDriver={false}
              allowLocationSharing={true}
              onShareLocation={handleLocationShare}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
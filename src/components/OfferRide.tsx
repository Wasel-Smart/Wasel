import { useState } from 'react';
import { Locate, CalendarClock, Timer, UsersRound, CircleDollarSign, CarFront, CirclePlus, CircleX, Radar, PackageCheck, TruckIcon, Scale, Info, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { MapComponent } from './MapComponent';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useTrips } from '../hooks/useTrips';

interface Stop {
  label: string;
  lat: number;
  lng: number;
}

export function OfferRide() {
  const { user } = useAuth();
  const [tripType, setTripType] = useState('wasel');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [stops, setStops] = useState<Stop[]>([]);
  const [newStopLabel, setNewStopLabel] = useState('');
  const [showRoutePreview, setShowRoutePreview] = useState(false);
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [seats, setSeats] = useState('4');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptPackages, setAcceptPackages] = useState(false);

  // Mock geocoding - In production, use a real geocoding service
  const geocodeLocation = (location: string): { lat: number; lng: number } => {
    const mockCoordinates: Record<string, { lat: number; lng: number }> = {
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'abu dhabi': { lat: 24.4539, lng: 54.3773 },
      'riyadh': { lat: 24.7136, lng: 46.6753 },
      'jeddah': { lat: 21.5433, lng: 39.1728 },
      'cairo': { lat: 30.0444, lng: 31.2357 },
      'alexandria': { lat: 31.2001, lng: 29.9187 },
      'doha': { lat: 25.2867, lng: 51.5310 },
    };
    
    const key = location.toLowerCase();
    return mockCoordinates[key] || { lat: 25.2048, lng: 55.2708 };
  };

  const addStop = () => {
    if (newStopLabel.trim()) {
      const coords = geocodeLocation(newStopLabel);
      setStops([...stops, { label: newStopLabel, ...coords }]);
      setNewStopLabel('');
    }
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const { createTrip } = useTrips();

  const handlePublish = async () => {
    if (!user) {
        toast.error('Please sign in to offer a ride');
        return;
    }
    if (!from || !to || !date || !time || !price || !vehicle) {
      toast.error('Please enter all required details');
      return;
    }
    
    try {
        const { data, error } = await createTrip({
            trip_type: tripType === 'wasel' ? 'wasel' : 'raje3',
            from,
            to,
            from_coords: geocodeLocation(from),
            to_coords: geocodeLocation(to),
            departure_date: date,
            departure_time: time,
            return_date: returnDate || undefined,
            return_time: returnTime || undefined,
            vehicle: {
                make: vehicle.split(' ')[0] || 'Unknown',
                model: vehicle,
                year: 2023,
                color: 'White',
                plate_number: 'XXX-0000',
            },
            total_seats: parseInt(seats),
            available_seats: parseInt(seats),
            price_per_seat: parseFloat(price),
            preferences: {
                smoking_allowed: false,
                pets_allowed: false,
                music_allowed: true,
            },
        });
        
        if (error) {
          toast.error(error);
          return;
        }
        
        toast.success('Ride published successfully! Your trip is now visible to passengers.');
        // Reset form
        setFrom('');
        setTo('');
        setDate('');
        setTime('');
        setPrice('');
        setVehicle('');
        setStops([]);
    } catch (error: any) {
        toast.error(error.message || 'Failed to publish ride');
    }
  };

  // Prepare map locations for preview
  const getMapLocations = () => {
    if (!from && !to && stops.length === 0) return [];
    
    const locations = [];
    
    if (from) {
      const coords = geocodeLocation(from);
      locations.push({ ...coords, label: from, type: 'start' as const });
    }
    
    stops.forEach(stop => {
      locations.push({ ...stop, type: 'stop' as const });
    });
    
    if (to) {
      const coords = geocodeLocation(to);
      locations.push({ ...coords, label: to, type: 'destination' as const });
    }
    
    return locations;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1>Offer a Ride</h1>
        <p className="text-gray-600">Share your journey and help others reach their destination</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>Provide information about your journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trip Type */}
          <div className="space-y-3">
            <Label>Trip Type</Label>
            <RadioGroup value={tripType} onValueChange={setTripType} className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <RadioGroupItem value="wasel" id="wasel" className="peer sr-only" />
                <Label
                  htmlFor="wasel"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="text-center space-y-2">
                    <div className="text-4xl">→</div>
                    <p className="font-medium">Wasel (واصل)</p>
                    <p className="text-sm text-gray-500">One-way trip</p>
                  </div>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="raje3" id="raje3" className="peer sr-only" />
                <Label
                  htmlFor="raje3"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-gray-200 p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <div className="text-center space-y-2">
                    <div className="text-4xl">↔</div>
                    <p className="font-medium">Raje3 (راجع)</p>
                    <p className="text-sm text-gray-500">Return trip</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Route */}
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="relative">
                  <Locate className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Starting location" 
                    className="pl-10"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <div className="relative">
                  <Locate className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Destination" 
                    className="pl-10"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Add Stops */}
            <div className="space-y-3">
              <Label>Stops Along the Way (Optional)</Label>
              
              {stops.length > 0 && (
                <div className="space-y-2">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Locate className="w-4 h-4 text-secondary" />
                      <span className="flex-1">{stop.label}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStop(index)}
                      >
                        <CircleX className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Locate className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Add a stop (e.g., Dubai Marina)"
                    className="pl-10"
                    value={newStopLabel}
                    onChange={(e) => setNewStopLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStop()}
                  />
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={addStop}
                  className="gap-2"
                >
                  <CirclePlus className="w-4 h-4" />
                  Add Stop
                </Button>
              </div>
            </div>

            {/* Route Preview */}
            {(from || to || stops.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Route Preview</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRoutePreview(!showRoutePreview)}
                    className="gap-2"
                  >
                    <Radar className="w-4 h-4" />
                    {showRoutePreview ? 'Hide Map' : 'Show Map'}
                  </Button>
                </div>
                
                {showRoutePreview && (
                  <MapComponent
                    locations={getMapLocations()}
                    showRoute={true}
                    height="300px"
                  />
                )}
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <div className="relative">
                <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    type="date" 
                    className="pl-10"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Departure Time</Label>
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    type="time" 
                    className="pl-10" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Return Trip (if Raje3) */}
          {tripType === 'raje3' && (
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-secondary/5 rounded-lg">
              <div className="space-y-2">
                <Label>Return Date</Label>
                <div className="relative">
                  <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                      type="date" 
                      className="pl-10" 
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Return Time</Label>
                <div className="relative">
                  <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                      type="time" 
                      className="pl-10"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vehicle & Seats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Model</Label>
              <div className="relative">
                <CarFront className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    placeholder="e.g., Toyota Camry" 
                    className="pl-10" 
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Seats</Label>
              <div className="relative">
                <UsersRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                    type="number" 
                    min="1" 
                    max="8" 
                    placeholder="1-8 seats" 
                    className="pl-10"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label>Price per Seat (USD)</Label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="Enter price" 
                  className="pl-10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)} 
              />
            </div>
            <p className="text-sm text-gray-500">Set a fair price based on distance and fuel costs</p>
          </div>

          {/* Package Delivery Options */}
          <div className="space-y-4 p-6 border-2 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-start justify-between relative">
              <div className="space-y-2 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <PackageCheck className="h-5 w-5 text-primary" />
                  </div>
                  <Label className="text-lg font-semibold">Accept Package Deliveries</Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Maximize your earnings by delivering packages along your route. Safe, secure, and simple.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Earn up to 40% more
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Insured packages
                  </Badge>
                </div>
              </div>
              <Switch 
                  id="accept-packages" 
                  checked={acceptPackages}
                  onCheckedChange={setAcceptPackages}
                  className="mt-1"
              />
            </div>
            
            {acceptPackages && (
              <div className="grid gap-6 pt-4 border-t border-primary/20 animate-in slide-in-from-top-2">
                {/* Package Size Selection */}
                <div className="grid gap-3">
                  <Label className="flex items-center gap-2 text-base">
                    <Scale className="h-4 w-4 text-primary" />
                    Select Package Sizes You Can Accept
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                      <Checkbox id="pkg-small" className="peer sr-only" />
                      <Label 
                        htmlFor="pkg-small" 
                        className="flex flex-col gap-2 p-4 border-2 rounded-lg bg-background hover:bg-accent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex items-center justify-between">
                          <PackageCheck className="h-5 w-5 text-primary" />
                          <Badge variant="outline" className="text-xs">+AED 15-25</Badge>
                        </div>
                        <div>
                          <div className="font-semibold">Small Package</div>
                          <div className="text-xs text-muted-foreground">Under 2kg</div>
                          <div className="text-xs text-muted-foreground mt-1">Documents, keys, phones</div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <Checkbox id="pkg-medium" className="peer sr-only" />
                      <Label 
                        htmlFor="pkg-medium" 
                        className="flex flex-col gap-2 p-4 border-2 rounded-lg bg-background hover:bg-accent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex items-center justify-between">
                          <PackageCheck className="h-6 w-6 text-primary" />
                          <Badge variant="outline" className="text-xs">+AED 35-50</Badge>
                        </div>
                        <div>
                          <div className="font-semibold">Medium Package</div>
                          <div className="text-xs text-muted-foreground">2-18kg</div>
                          <div className="text-xs text-muted-foreground mt-1">Boxes, bags, electronics</div>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="relative">
                      <Checkbox id="pkg-large" className="peer sr-only" />
                      <Label 
                        htmlFor="pkg-large" 
                        className="flex flex-col gap-2 p-4 border-2 rounded-lg bg-background hover:bg-accent cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex items-center justify-between">
                          <TruckIcon className="h-7 w-7 text-primary" />
                          <Badge variant="outline" className="text-xs">+AED 60-100</Badge>
                        </div>
                        <div>
                          <div className="font-semibold">Large Package</div>
                          <div className="text-xs text-muted-foreground">Over 20kg</div>
                          <div className="text-xs text-muted-foreground mt-1">Suitcases, equipment</div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">How Package Delivery Works:</p>
                      <ul className="space-y-1.5 text-blue-800 dark:text-blue-200">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Package details and pickup/dropoff are shared before you accept</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>All packages are insured up to AED 5,000 at no extra cost</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>Payment is secured and automatically released after delivery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>You can decline any package request without penalty</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea 
              placeholder="Any special instructions or requirements for riders..."
              className="min-h-24"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1">
              Save as Draft
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handlePublish}
            >
              Publish Ride
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for a Great Ride</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✓ Be punctual and communicate any delays</li>
            <li>✓ Keep your vehicle clean and comfortable</li>
            <li>✓ Set fair prices based on distance and fuel costs</li>
            <li>✓ Be respectful and maintain good conversation</li>
            <li>✓ Follow safety guidelines and traffic rules</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
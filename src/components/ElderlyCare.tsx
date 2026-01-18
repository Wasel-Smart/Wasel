import { useState } from 'react';
import { 
  Heart,
  MapPin,
  Phone,
  Shield,
  AlertCircle,
  Clock,
  Users,
  Check,
  Plus,
  Trash2,
  Edit2,
  Search,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface ElderlyCareTrip {
  id: string;
  passengerId: string;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  schedule: 'once' | 'daily' | 'weekly';
  purpose: string; // doctor, shopping, social, exercise, medical
  medicalNeeds?: string;
  companion?: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferredDriver?: {
    id: string;
    name: string;
    rating: number;
    experience: number; // years
  };
  estimatedCost: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  scheduledDate: Date;
}

interface CaregiverProfile {
  id: string;
  name: string;
  rating: number;
  experience: number;
  specializations: string[];
  verification: 'pending' | 'verified' | 'rejected';
  backgroundCheck: boolean;
  languages: string[];
  photo: string;
  bio: string;
}

export function ElderlyCare() {
  const [trips, setTrips] = useState<ElderlyCareTrip[]>([
    {
      id: '1',
      passengerId: 'elderly-1',
      passengerName: 'Fatima Al-Mansouri',
      pickupLocation: 'Al Wasl Hospital, Dubai',
      dropoffLocation: 'Home - Al Manara, Dubai',
      schedule: 'once',
      purpose: 'doctor',
      companion: {
        name: 'Ahmed Al-Mansouri',
        relationship: 'Son',
        phone: '+971-501234567'
      },
      preferredDriver: {
        id: 'driver-1',
        name: 'Hassan Mohammed',
        rating: 4.9,
        experience: 8
      },
      estimatedCost: 35,
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      scheduledDate: new Date('2024-01-15')
    }
  ]);

  const [caregivers, setCaregivers] = useState<CaregiverProfile[]>([
    {
      id: 'caregiver-1',
      name: 'Hassan Mohammed',
      rating: 4.9,
      experience: 8,
      specializations: ['Elderly Transport', 'Medical Appointments', 'Mobility Assistance'],
      verification: 'verified',
      backgroundCheck: true,
      languages: ['Arabic', 'English', 'Hindi'],
      photo: 'https://picsum.photos/100/100?random=1',
      bio: 'Experienced caregiver with 8 years in elderly transport services'
    },
    {
      id: 'caregiver-2',
      name: 'Layla Ahmed',
      rating: 4.8,
      experience: 6,
      specializations: ['Elderly Care', 'Companion Services', 'Hospital Runs'],
      verification: 'verified',
      backgroundCheck: true,
      languages: ['Arabic', 'English', 'Urdu'],
      photo: 'https://picsum.photos/100/100?random=2',
      bio: 'Compassionate caregiver specializing in elderly wellness and comfort'
    }
  ]);

  const [showNewTrip, setShowNewTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ElderlyCareTrip | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTrip = (formData: Partial<ElderlyCareTrip>) => {
    const newTrip: ElderlyCareTrip = {
      id: Math.random().toString(),
      passengerId: 'elderly-' + Math.random(),
      passengerName: formData.passengerName || 'New Passenger',
      pickupLocation: formData.pickupLocation || '',
      dropoffLocation: formData.dropoffLocation || '',
      schedule: formData.schedule || 'once',
      purpose: formData.purpose || 'doctor',
      companion: formData.companion,
      preferredDriver: formData.preferredDriver,
      estimatedCost: formData.estimatedCost || 40,
      status: 'pending',
      createdAt: new Date(),
      scheduledDate: formData.scheduledDate || new Date()
    };

    setTrips([newTrip, ...trips]);
    setShowNewTrip(false);
    toast.success('Care trip scheduled successfully');
  };

  const handleCancelTrip = (tripId: string) => {
    setTrips(trips.map(trip =>
      trip.id === tripId ? { ...trip, status: 'cancelled' as const } : trip
    ));
    toast.success('Trip cancelled');
  };

  const filteredTrips = trips.filter(trip =>
    trip.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingTrips = filteredTrips.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completedTrips = filteredTrips.filter(t => t.status === 'completed');

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            Elderly Care Services
          </h1>
          <p className="text-muted-foreground mt-2">
            Safe, reliable transportation and care services for seniors
          </p>
        </div>
        <Dialog open={showNewTrip} onOpenChange={setShowNewTrip}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Care Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Elderly Care Trip</DialogTitle>
            </DialogHeader>
            <NewTripForm onSubmit={handleCreateTrip} onCancel={() => setShowNewTrip(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Safety Features Highlight */}
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Background Verified</p>
                <p className="text-sm text-red-800 dark:text-red-200">All caregivers fully vetted</p>
              </div>
            </div>
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Emergency Support</p>
                <p className="text-sm text-red-800 dark:text-red-200">24/7 emergency assistance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Heart className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">Compassionate Care</p>
                <p className="text-sm text-red-800 dark:text-red-200">Specialized elderly training</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Caregivers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Trusted Caregivers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {caregivers.map((caregiver) => (
            <motion.div
              key={caregiver.id}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <img
                      src={caregiver.photo}
                      alt={caregiver.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{caregiver.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{caregiver.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({caregiver.experience} yrs exp)
                            </span>
                          </div>
                        </div>
                        {caregiver.verification === 'verified' && (
                          <Badge variant="default" className="bg-green-600">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">{caregiver.bio}</p>
                        <div className="flex flex-wrap gap-1">
                          {caregiver.specializations.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by passenger name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Trips Tabs */}
      <div className="space-y-6">
        {/* Upcoming Trips */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Upcoming Care Trips</h2>
          {upcomingTrips.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="pt-12 pb-12 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No upcoming care trips</p>
                <Button onClick={() => setShowNewTrip(true)}>Schedule a Care Trip</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onCancel={handleCancelTrip} />
              ))}
            </div>
          )}
        </div>

        {/* Completed Trips */}
        {completedTrips.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Completed Care Trips</h2>
            <div className="space-y-3">
              {completedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} readonly />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TripCard({ trip, onCancel, readonly = false }: {
  trip: ElderlyCareTrip;
  onCancel?: (id: string) => void;
  readonly?: boolean;
}) {
  const statusColors = {
    pending: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200',
    confirmed: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200',
    'in-progress': 'bg-purple-50 dark:bg-purple-950/20 border-purple-200',
    completed: 'bg-green-50 dark:bg-green-950/20 border-green-200',
    cancelled: 'bg-red-50 dark:bg-red-950/20 border-red-200'
  };

  const statusBadgeColor = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  };

  return (
    <Card className={`border-2 ${statusColors[trip.status]}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{trip.passengerName}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(trip.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
            <Badge className={statusBadgeColor[trip.status]}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="text-sm font-medium">{trip.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="text-sm font-medium">{trip.dropoffLocation}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="capitalize">{trip.purpose}</span>
            </div>
            {trip.companion && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-primary" />
                <span>{trip.companion.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{trip.schedule}</span>
            </div>
          </div>

          {trip.preferredDriver && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded border">
              <p className="text-xs text-muted-foreground mb-1">Caregiver</p>
              <div className="flex items-center justify-between">
                <p className="font-medium">{trip.preferredDriver.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-semibold">{trip.preferredDriver.rating}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <p className="font-semibold text-lg">AED {trip.estimatedCost.toFixed(2)}</p>
            {!readonly && trip.status !== 'cancelled' && trip.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel?.(trip.id)}
                className="text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewTripForm({ onSubmit, onCancel }: {
  onSubmit: (data: Partial<ElderlyCareTrip>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    passengerName: '',
    pickupLocation: '',
    dropoffLocation: '',
    purpose: 'doctor',
    schedule: 'once',
    estimatedCost: 40
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Passenger Name</Label>
        <Input
          id="name"
          value={formData.passengerName}
          onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickup">Pickup Location</Label>
        <Input
          id="pickup"
          value={formData.pickupLocation}
          onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dropoff">Dropoff Location</Label>
        <Input
          id="dropoff"
          value={formData.dropoffLocation}
          onChange={(e) => setFormData({ ...formData, dropoffLocation: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <select
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="doctor">Doctor Appointment</option>
            <option value="shopping">Shopping</option>
            <option value="social">Social Visit</option>
            <option value="exercise">Exercise</option>
            <option value="medical">Medical Procedure</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule">Frequency</Label>
          <select
            id="schedule"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="once">One Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Schedule Trip</Button>
      </div>
    </form>
  );
}

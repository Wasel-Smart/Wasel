import { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  Plus,
  Heart,
  AlertCircle,
  CheckCircle,
  MapPinOff,
  Calendar,
  Phone,
  Mail,
  Bus,
  Home,
  Search,
  Badge as BadgeIcon,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface KidsActivityRoute {
  id: string;
  childName: string;
  childAge: number;
  activityName: string;
  activityType: 'school' | 'sports' | 'tuition' | 'recreational' | 'cultural';
  pickupLocation: string;
  dropoffLocation: string;
  departureTime: string;
  returnTime: string;
  days: string[]; // ['Monday', 'Tuesday', etc.]
  driver?: {
    name: string;
    phone: string;
    rating: number;
    vehicleInfo: string;
  };
  parentContact: {
    name: string;
    phone: string;
    email: string;
    emergencyContact: string;
  };
  specialNeeds?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  nextPickup?: Date;
}

interface SafetyFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export function KidsActivity() {
  const [routes, setRoutes] = useState<KidsActivityRoute[]>([
    {
      id: '1',
      childName: 'Zainab Al-Mansouri',
      childAge: 8,
      activityName: 'Dubai International School',
      activityType: 'school',
      pickupLocation: 'Home - Al Wasl, Dubai',
      dropoffLocation: 'Dubai International School, Jebel Ali',
      departureTime: '07:30',
      returnTime: '14:30',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      driver: {
        name: 'Fatima Al-Noor',
        phone: '+971-501234568',
        rating: 4.9,
        vehicleInfo: 'Toyota Sienna Silver - License: UAE-2024-ABC'
      },
      parentContact: {
        name: 'Ahmed Al-Mansouri',
        phone: '+971-501234567',
        email: 'ahmed@example.com',
        emergencyContact: '+971-501234569'
      },
      status: 'active',
      createdAt: new Date('2024-01-10'),
      nextPickup: new Date(new Date().setDate(new Date().getDate() + 1))
    },
    {
      id: '2',
      childName: 'Mohammed Al-Mansouri',
      childAge: 10,
      activityName: 'Dubai Football Academy',
      activityType: 'sports',
      pickupLocation: 'Home - Al Wasl, Dubai',
      dropoffLocation: 'Dubai Football Academy, Al Safa',
      departureTime: '16:00',
      returnTime: '18:00',
      days: ['Tuesday', 'Thursday', 'Saturday'],
      driver: {
        name: 'Hassan Ibrahim',
        phone: '+971-501234570',
        rating: 4.8,
        vehicleInfo: 'Honda Odyssey Black - License: UAE-2024-XYZ'
      },
      parentContact: {
        name: 'Ahmed Al-Mansouri',
        phone: '+971-501234567',
        email: 'ahmed@example.com',
        emergencyContact: '+971-501234569'
      },
      status: 'active',
      createdAt: new Date('2024-01-15'),
      nextPickup: new Date(new Date().setDate(new Date().getDate() + 2))
    }
  ]);

  const [showNewRoute, setShowNewRoute] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<KidsActivityRoute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const safetyFeatures: SafetyFeature[] = [
    {
      id: '1',
      name: 'Real-time Tracking',
      description: 'Live GPS tracking of vehicle location',
      icon: <MapPin className="h-5 w-5 text-primary" />
    },
    {
      id: '2',
      name: 'Emergency Alerts',
      description: 'Instant notifications of delays or issues',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />
    },
    {
      id: '3',
      name: 'Verified Drivers',
      description: 'Background checks and verification completed',
      icon: <ShieldAlert className="h-5 w-5 text-green-600" />
    },
    {
      id: '4',
      name: 'Check-in/Check-out',
      description: 'Automatic notifications when child is picked up/dropped',
      icon: <CheckCircle className="h-5 w-5 text-blue-600" />
    }
  ];

  const handleCreateRoute = (formData: Partial<KidsActivityRoute>) => {
    const newRoute: KidsActivityRoute = {
      id: Math.random().toString(),
      childName: formData.childName || 'New Child',
      childAge: formData.childAge || 5,
      activityName: formData.activityName || 'Activity',
      activityType: formData.activityType || 'school',
      pickupLocation: formData.pickupLocation || '',
      dropoffLocation: formData.dropoffLocation || '',
      departureTime: formData.departureTime || '08:00',
      returnTime: formData.returnTime || '15:00',
      days: formData.days || [],
      parentContact: formData.parentContact || {
        name: '',
        phone: '',
        email: '',
        emergencyContact: ''
      },
      status: 'active',
      createdAt: new Date(),
      nextPickup: new Date()
    };

    setRoutes([newRoute, ...routes]);
    setShowNewRoute(false);
    toast.success('Activity route created successfully');
  };

  const handleToggleStatus = (routeId: string) => {
    setRoutes(routes.map(route =>
      route.id === routeId
        ? { ...route, status: route.status === 'active' ? 'paused' : 'active' }
        : route
    ));
    toast.success('Route status updated');
  };

  const filteredRoutes = routes.filter(route =>
    route.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.activityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRoutes = filteredRoutes.filter(r => r.status === 'active');
  const pausedRoutes = filteredRoutes.filter(r => r.status === 'paused');

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bus className="h-8 w-8 text-blue-500" />
            Kids Activity Transport
          </h1>
          <p className="text-muted-foreground mt-2">
            Safe pickup and dropoff for school, sports, and activities
          </p>
        </div>
        <Dialog open={showNewRoute} onOpenChange={setShowNewRoute}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Activity Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Activity Route</DialogTitle>
            </DialogHeader>
            <NewRouteForm onSubmit={handleCreateRoute} onCancel={() => setShowNewRoute(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Safety Features */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-600" />
            Safety Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {safetyFeatures.map((feature) => (
              <div key={feature.id} className="flex gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg">
                {feature.icon}
                <div>
                  <p className="font-semibold text-sm">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Children</p>
                <p className="text-2xl font-bold">{new Set(routes.map(r => r.childName)).size}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Routes</p>
                <p className="text-2xl font-bold">{activeRoutes.length}</p>
              </div>
              <Bus className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activities</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Drivers</p>
                <p className="text-2xl font-bold">{new Set(routes.filter(r => r.driver).map(r => r.driver?.name)).size}</p>
              </div>
              <BadgeIcon className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by child name or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Active Routes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Active Routes</h2>
        {activeRoutes.length === 0 ? (
          <Card className="bg-muted/30">
            <CardContent className="pt-12 pb-12 text-center">
              <Bus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No active routes</p>
              <Button onClick={() => setShowNewRoute(true)}>Create Activity Route</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Paused Routes */}
      {pausedRoutes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Paused Routes</h2>
          <div className="grid gap-4">
            {pausedRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RouteCard({ route, onToggleStatus }: {
  route: KidsActivityRoute;
  onToggleStatus: (id: string) => void;
}) {
  const activityColors = {
    school: 'text-blue-600 bg-blue-100',
    sports: 'text-green-600 bg-green-100',
    tuition: 'text-purple-600 bg-purple-100',
    recreational: 'text-pink-600 bg-pink-100',
    cultural: 'text-orange-600 bg-orange-100'
  };

  const activityIcons = {
    school: '🏫',
    sports: '⚽',
    tuition: '📚',
    recreational: '🎨',
    cultural: '🎭'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="cursor-pointer"
    >
      <Card className={route.status === 'paused' ? 'opacity-60' : ''}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`text-3xl ${activityColors[route.activityType]} rounded-full w-12 h-12 flex items-center justify-center`}>
                  {activityIcons[route.activityType]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{route.childName}</h3>
                  <p className="text-sm text-muted-foreground">{route.activityName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Age {route.childAge}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${activityColors[route.activityType]} text-xs capitalize`}>
                  {route.activityType}
                </Badge>
                <Badge variant={route.status === 'active' ? 'default' : 'outline'}>
                  {route.status === 'active' ? 'Active' : 'Paused'}
                </Badge>
              </div>
            </div>

            {/* Route Details */}
            <div className="grid md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex gap-2">
                <Home className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="text-sm font-medium">{route.pickupLocation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Dropoff</p>
                  <p className="text-sm font-medium">{route.dropoffLocation}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Departure</p>
                  <p className="text-sm font-medium">{route.departureTime}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Return</p>
                  <p className="text-sm font-medium">{route.returnTime}</p>
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="flex gap-1 flex-wrap">
              {route.days.map((day) => (
                <Badge key={day} variant="outline" className="text-xs">
                  {day.substring(0, 3)}
                </Badge>
              ))}
            </div>

            {/* Driver Info */}
            {route.driver && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded">
                <p className="text-xs text-muted-foreground mb-1">Assigned Driver</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{route.driver.name}</p>
                    <p className="text-xs text-muted-foreground">{route.driver.vehicleInfo}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-semibold">{route.driver.rating}</span>
                    </div>
                    <a href={`tel:${route.driver.phone}`} className="text-xs text-blue-600 hover:underline">
                      {route.driver.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Parent Contact */}
            <div className="grid md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{route.parentContact.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{route.parentContact.email}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(route.id)}
              >
                {route.status === 'active' ? 'Pause Route' : 'Resume Route'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NewRouteForm({ onSubmit, onCancel }: {
  onSubmit: (data: Partial<KidsActivityRoute>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: 5,
    activityName: '',
    activityType: 'school' as const,
    pickupLocation: '',
    dropoffLocation: '',
    departureTime: '08:00',
    returnTime: '15:00',
    days: [] as string[],
    parentContact: {
      name: '',
      phone: '',
      email: '',
      emergencyContact: ''
    }
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter(d => d !== day)
        : [...formData.days, day]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Child Details */}
      <div className="space-y-3 pb-3 border-b">
        <h3 className="font-semibold">Child Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="childName">Child Name</Label>
            <Input
              id="childName"
              value={formData.childName}
              onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="childAge">Age</Label>
            <Input
              id="childAge"
              type="number"
              min="3"
              max="18"
              value={formData.childAge}
              onChange={(e) => setFormData({ ...formData, childAge: parseInt(e.target.value) })}
              required
            />
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="space-y-3 pb-3 border-b">
        <h3 className="font-semibold">Activity Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="activity">Activity Name</Label>
            <Input
              id="activity"
              value={formData.activityName}
              onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={formData.activityType}
              onChange={(e) => setFormData({ ...formData, activityType: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="school">School</option>
              <option value="sports">Sports</option>
              <option value="tuition">Tuition</option>
              <option value="recreational">Recreational</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
        </div>
      </div>

      {/* Route Details */}
      <div className="space-y-3 pb-3 border-b">
        <h3 className="font-semibold">Route Details</h3>
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
            <Label htmlFor="departure">Departure Time</Label>
            <Input
              id="departure"
              type="time"
              value={formData.departureTime}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="return">Return Time</Label>
            <Input
              id="return"
              type="time"
              value={formData.returnTime}
              onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Days Selection */}
      <div className="space-y-3 pb-3 border-b">
        <h3 className="font-semibold">Days of Week</h3>
        <div className="grid grid-cols-4 gap-2">
          {weekDays.map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.days.includes(day)}
                onChange={() => handleDayToggle(day)}
                className="w-4 h-4"
              />
              <span className="text-sm">{day.substring(0, 3)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Parent Contact */}
      <div className="space-y-3 pb-3 border-b">
        <h3 className="font-semibold">Parent Contact</h3>
        <div className="space-y-2">
          <Label htmlFor="parentName">Parent Name</Label>
          <Input
            id="parentName"
            value={formData.parentContact.name}
            onChange={(e) => setFormData({
              ...formData,
              parentContact: { ...formData.parentContact, name: e.target.value }
            })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentPhone">Phone</Label>
          <Input
            id="parentPhone"
            value={formData.parentContact.phone}
            onChange={(e) => setFormData({
              ...formData,
              parentContact: { ...formData.parentContact, phone: e.target.value }
            })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentEmail">Email</Label>
          <Input
            id="parentEmail"
            type="email"
            value={formData.parentContact.email}
            onChange={(e) => setFormData({
              ...formData,
              parentContact: { ...formData.parentContact, email: e.target.value }
            })}
            required
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Route</Button>
      </div>
    </form>
  );
}

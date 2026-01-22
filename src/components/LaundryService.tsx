import { useState, useEffect } from 'react';
import { Locate, CalendarClock, Shirt, TruckIcon, Scale, Info, CircleDollarSign, Shield, WashingMachine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { MapComponent } from './MapComponent';
import laundryService, { LaundryServiceType, LaundryPartner } from '../services/laundryService';
import { useAuth } from '../contexts/AuthContext';

interface LaundryOrderResult {
  id: string;
  partnerName: string;
  partnerRating: number;
  estimatedPickup: string;
  totalPrice: number;
  serviceType: LaundryServiceType;
}

export function LaundryService() {
  const { user } = useAuth();
  const [step, setStep] = useState<'search' | 'partners' | 'details' | 'confirmation'>('search');
  const [serviceType, setServiceType] = useState<LaundryServiceType>('wasel');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [loadWeight, setLoadWeight] = useState<number>(5);
  const [laundryItems, setLaundryItems] = useState<string[]>(['Shirts', 'Pants']);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [preferredPickupTime, setPreferredPickupTime] = useState('');
  const [partners, setPartners] = useState<LaundryPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<LaundryPartner | null>(null);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'partners') {
      loadPartners();
    }
  }, [step]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const availablePartners = await laundryService.getAvailablePartners();
      setPartners(availablePartners);
    } catch (error) {
      toast.error('Failed to load laundry partners');
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePrice = async () => {
    if (!selectedPartner) return;

    try {
      const priceData = await laundryService.calculatePrice(
        loadWeight,
        serviceType,
        selectedPartner.id
      );
      setPricing(priceData);
    } catch (error) {
      toast.error('Failed to calculate price');
      console.error('Error calculating price:', error);
    }
  };

  const handleCreateOrder = async () => {
    if (!user || !selectedPartner || !pickupLocation || !preferredPickupTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (serviceType === 'raje3' && !deliveryLocation) {
      toast.error('Delivery location is required for round-trip service');
      return;
    }

    try {
      setLoading(true);
      const order = await laundryService.createOrder(
        user.id,
        serviceType,
        pickupLocation,
        serviceType === 'raje3' ? deliveryLocation : undefined,
        selectedPartner.id,
        {
          weight_kg: loadWeight,
          items: laundryItems,
          special_instructions: specialInstructions || undefined
        },
        preferredPickupTime
      );

      toast.success('Laundry order created successfully!');
      setStep('confirmation');

      // Here you could trigger captain assignment
      // await laundryService.assignCaptain(order.id, someCaptainId);

    } catch (error) {
      toast.error('Failed to create laundry order');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLaundryItem = (item: string) => {
    if (!laundryItems.includes(item)) {
      setLaundryItems([...laundryItems, item]);
    }
  };

  const removeLaundryItem = (item: string) => {
    setLaundryItems(laundryItems.filter(i => i !== item));
  };

  if (step === 'search') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WashingMachine className="h-6 w-6" />
            Laundry Service
          </CardTitle>
          <CardDescription>
            Professional laundry pickup and delivery service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Service Type</Label>
            <RadioGroup value={serviceType} onValueChange={(value: LaundryServiceType) => setServiceType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wasel" id="wasel" />
                <Label htmlFor="wasel" className="flex items-center gap-2">
                  <TruckIcon className="h-4 w-4" />
                  Wasel (One-way pickup only)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="raje3" id="raje3" />
                <Label htmlFor="raje3" className="flex items-center gap-2">
                  <TruckIcon className="h-4 w-4" />
                  Raje3 (Pickup + Return delivery)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup" className="flex items-center gap-2">
                <Locate className="h-4 w-4" />
                Pickup Location
              </Label>
              <Input
                id="pickup"
                placeholder="Enter pickup address"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
              />
            </div>

            {serviceType === 'raje3' && (
              <div className="space-y-2">
                <Label htmlFor="delivery" className="flex items-center gap-2">
                  <Locate className="h-4 w-4" />
                  Delivery Location
                </Label>
                <Input
                  id="delivery"
                  placeholder="Enter delivery address"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Load Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Load Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="20"
                value={loadWeight}
                onChange={(e) => setLoadWeight(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Laundry Items</Label>
              <div className="flex flex-wrap gap-2">
                {['Shirts', 'Pants', 'Dresses', 'Bed Sheets', 'Towels', 'Curtains'].map((item) => (
                  <Badge
                    key={item}
                    variant={laundryItems.includes(item) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => laundryItems.includes(item) ? removeLaundryItem(item) : addLaundryItem(item)}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions (Optional)</Label>
              <Input
                id="instructions"
                placeholder="e.g., Dry clean only, stain treatment needed"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickup-time" className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Preferred Pickup Time
              </Label>
              <Input
                id="pickup-time"
                type="datetime-local"
                value={preferredPickupTime}
                onChange={(e) => setPreferredPickupTime(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={() => setStep('partners')}
            className="w-full"
            disabled={!pickupLocation || !preferredPickupTime || (serviceType === 'raje3' && !deliveryLocation)}
          >
            Find Laundry Partners
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'partners') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Available Laundry Partners</CardTitle>
          <CardDescription>
            Select a laundry partner near you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading partners...</div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8">
              <p>No laundry partners available in your area.</p>
              <Button onClick={() => setStep('search')} className="mt-4">
                Go Back
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <Card
                  key={partner.id}
                  className={`cursor-pointer transition-all ${
                    selectedPartner?.id === partner.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPartner(partner)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{partner.name}</h3>
                        <p className="text-sm text-gray-600">{partner.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">★ {partner.rating}</Badge>
                          <Badge variant="outline">{partner.pricing_per_kg} AED/kg</Badge>
                        </div>
                      </div>
                      <Shirt className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={() => setStep('search')}>
              Back
            </Button>
            <Button
              onClick={() => setStep('details')}
              disabled={!selectedPartner}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'details') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>
            Review your laundry order details and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedPartner && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Partner:</span>
                <span className="font-medium">{selectedPartner.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service Type:</span>
                <Badge>{serviceType === 'wasel' ? 'One-way Pickup' : 'Round-trip'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Load Weight:</span>
                <span>{loadWeight} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Items:</span>
                <span>{laundryItems.join(', ')}</span>
              </div>
            </div>
          )}

          <Separator />

          {pricing && (
            <div className="space-y-3">
              <h3 className="font-medium">Pricing Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Service Fee:</span>
                  <span>{pricing.basePrice} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Weight Price ({loadWeight}kg × {pricing.weightPrice/loadWeight} AED):</span>
                  <span>{pricing.weightPrice} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Captain Fee:</span>
                  <span>{pricing.captainFee} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Partner Processing:</span>
                  <span>{pricing.partnerFee} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Wasel Commission:</span>
                  <span>{pricing.waselCommission} AED</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{pricing.total} AED</span>
                </div>
              </div>
            </div>
          )}

          {!pricing && (
            <Button onClick={handleCalculatePrice} className="w-full">
              Calculate Price
            </Button>
          )}

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('partners')}>
              Back
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={!pricing || loading}
              className="flex-1"
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'confirmation') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Order Confirmed!</CardTitle>
          <CardDescription className="text-center">
            Your laundry order has been created successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl">✅</div>
          <p>You will receive a notification when a captain is assigned to pick up your laundry.</p>
          <Button onClick={() => {
            setStep('search');
            setSelectedPartner(null);
            setPricing(null);
          }}>
            Create Another Order
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
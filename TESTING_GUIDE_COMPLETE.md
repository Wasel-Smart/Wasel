# 🧪 Complete Testing Guide for Wasel Backend

## Table of Contents
1. [Setup](#setup)
2. [Authentication Testing](#authentication-testing)
3. [Payment Testing](#payment-testing)
4. [Maps & Routing Testing](#maps--routing-testing)
5. [Real-time Features Testing](#real-time-features-testing)
6. [Emergency Features Testing](#emergency-features-testing)
7. [Integration Testing](#integration-testing)

---

## Setup

### Install Testing Dependencies

```bash
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

### Update package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Authentication Testing

### 1. Phone Verification

```bash
# Send verification code
curl -X POST http://localhost:3002/api/auth/verify/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+96277853xxxx",
    "channel": "sms"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Verification code sent via sms to +96277853xxxx"
# }

# Verify code
curl -X POST http://localhost:3002/api/auth/verify/check \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+96277853xxxx",
    "code": "123456"
  }'

# Expected Response:
# {
#   "success": true,
#   "valid": true,
#   "message": "Phone number verified successfully"
# }
```

### 2. Token Authentication

```bash
# Get token from Supabase first, then:
curl -X GET http://localhost:3002/api/payments/history \
  -H "Authorization: Bearer YOUR_SUPABASE_TOKEN"

# Expected Response:
# {
#   "success": true,
#   "data": []
# }
```

---

## Payment Testing

### 1. Create Payment Intent

```bash
curl -X POST http://localhost:3002/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tripId": "trip-uuid-here",
    "amount": 50.00,
    "currency": "aed"
  }'

# Expected Response:
# {
#   "success": true,
#   "clientSecret": "pi_xxx_secret_xxx",
#   "paymentIntentId": "pi_xxx"
# }
```

### 2. Test Stripe Webhook (Local Testing)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3002/api/webhooks/stripe

# Trigger test payment success
stripe trigger payment_intent.succeeded

# Check your server logs for webhook handling
```

### 3. Test Refund

```bash
curl -X POST http://localhost:3002/api/payments/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "paymentIntentId": "pi_xxx",
    "amount": 25.00,
    "reason": "requested_by_customer"
  }'
```

---

## Maps & Routing Testing

### 1. Get Route

```bash
curl -X POST http://localhost:3002/api/maps/route \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "origin": {"lat": 31.9454, "lng": 35.9284},
    "destination": {"lat": 32.0000, "lng": 36.0000}
  }'

# Expected Response:
# {
#   "success": true,
#   "distance": 12.5,
#   "duration": 25,
#   "polyline": "encoded_polyline_string",
#   "steps": [...]
# }
```

### 2. Geocode Address

```bash
curl -X POST http://localhost:3002/api/maps/geocode \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "address": "King Abdullah II Street, Amman, Jordan"
  }'

# Expected Response:
# {
#   "success": true,
#   "location": {"lat": 31.9454, "lng": 35.9284},
#   "formattedAddress": "..."
# }
```

### 3. Search Places

```bash
curl -X POST http://localhost:3002/api/maps/search-places \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "restaurants",
    "location": {"lat": 31.9454, "lng": 35.9284},
    "radius": 5000
  }'
```

---

## Real-time Features Testing

### 1. WebSocket Connection Test

Create a simple HTML file for testing:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
    <h1>WebSocket Testing</h1>
    <div id="status">Disconnected</div>
    <button onclick="connect()">Connect</button>
    <button onclick="joinTrip()">Join Trip</button>
    <button onclick="sendLocation()">Send Location</button>
    <div id="messages"></div>

    <script>
        let socket;
        const tripId = 'test-trip-id';
        const userId = 'test-user-id';

        function connect() {
            socket = io('http://localhost:3002', {
                auth: {
                    token: 'YOUR_TOKEN_HERE',
                    userId: userId
                }
            });

            socket.on('connect', () => {
                document.getElementById('status').textContent = 'Connected';
                console.log('Connected:', socket.id);
            });

            socket.on('location-update', (data) => {
                console.log('Location update:', data);
                addMessage('Location: ' + JSON.stringify(data));
            });

            socket.on('chat-message', (data) => {
                console.log('Chat message:', data);
                addMessage('Message: ' + data.message);
            });

            socket.on('error', (error) => {
                console.error('Error:', error);
                addMessage('Error: ' + error.message);
            });
        }

        function joinTrip() {
            socket.emit('join-trip', { tripId, userId });
        }

        function sendLocation() {
            socket.emit('location-update', {
                tripId,
                coordinates: { lat: 31.9454, lng: 35.9284 },
                heading: 90,
                speed: 30,
                accuracy: 10
            });
        }

        function addMessage(msg) {
            const div = document.createElement('div');
            div.textContent = new Date().toLocaleTimeString() + ' - ' + msg;
            document.getElementById('messages').appendChild(div);
        }
    </script>
</body>
</html>
```

### 2. Test Location Updates

Open browser console and run:

```javascript
socket.emit('location-update', {
  tripId: 'your-trip-id',
  coordinates: { lat: 31.9454, lng: 35.9284 },
  heading: 90,
  speed: 30,
  accuracy: 10,
  timestamp: new Date().toISOString()
});
```

### 3. Test Chat

```javascript
socket.emit('chat-message', {
  tripId: 'your-trip-id',
  message: 'Hello from passenger!',
  senderId: 'your-user-id',
  timestamp: new Date().toISOString()
});
```

---

## Emergency Features Testing

### 1. Test SOS Alert

```bash
curl -X POST http://localhost:3002/api/emergency/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tripId": "trip-uuid",
    "location": {"lat": 31.9454, "lng": 35.9284},
    "reason": "Emergency - Need help"
  }'

# Expected Response:
# {
#   "success": true,
#   "alert": {...}
# }

# Check server logs for emergency notification
# Check WebSocket for broadcast to trip participants
```

---

## Integration Testing

### Full Trip Flow Test

```bash
#!/bin/bash

# 1. Send phone verification
echo "Step 1: Sending verification code..."
curl -X POST http://localhost:3002/api/auth/verify/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+96277853xxxx", "channel": "sms"}'

# 2. Verify code (replace with actual code from SMS)
echo "\nStep 2: Verifying code..."
curl -X POST http://localhost:3002/api/auth/verify/check \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+96277853xxxx", "code": "123456"}'

# 3. Create trip
echo "\nStep 3: Creating trip..."
curl -X POST http://localhost:3002/api/trips/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "pickupLocation": {"lat": 31.9454, "lng": 35.9284},
    "dropoffLocation": {"lat": 32.0000, "lng": 36.0000},
    "vehicleType": "sedan",
    "seats": 1
  }'

# 4. Get route details
echo "\nStep 4: Getting route..."
curl -X POST http://localhost:3002/api/maps/route \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "origin": {"lat": 31.9454, "lng": 35.9284},
    "destination": {"lat": 32.0000, "lng": 36.0000}
  }'

# 5. Create payment
echo "\nStep 5: Creating payment..."
curl -X POST http://localhost:3002/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tripId": "TRIP_ID_FROM_STEP_3",
    "amount": 50.00,
    "currency": "aed"
  }'

echo "\n\nTest complete!"
```

---

## Load Testing

### Using Apache Bench

```bash
# Test health endpoint
ab -n 1000 -c 10 http://localhost:3002/api/health

# Test authenticated endpoint (save token to file)
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:3002/api/payments/history
```

### Using Artillery

```bash
npm install -g artillery

# Create artillery.yml
cat > artillery.yml <<EOF
config:
  target: 'http://localhost:3002'
  phases:
    - duration: 60
      arrivalRate: 10
      
scenarios:
  - name: "Health check"
    flow:
      - get:
          url: "/api/health"
          
  - name: "Get route"
    flow:
      - post:
          url: "/api/maps/route"
          headers:
            Authorization: "Bearer YOUR_TOKEN"
          json:
            origin: {lat: 31.9454, lng: 35.9284}
            destination: {lat: 32.0000, lng: 36.0000}
EOF

# Run load test
artillery run artillery.yml
```

---

## Monitoring & Debugging

### 1. Check Server Logs

```bash
# Development
npm run dev | tee server.log

# Production
pm2 logs wasel-backend
```

### 2. Monitor Real-time Connections

```bash
# Check connected WebSocket clients
curl http://localhost:3002/api/health | jq '.metrics.connectedClients'

# Check active trips
curl http://localhost:3002/api/health | jq '.metrics.activeTrips'
```

### 3. Database Queries

```sql
-- Check recent trips
SELECT * FROM trips ORDER BY created_at DESC LIMIT 10;

-- Check payment status
SELECT * FROM payments WHERE status = 'pending';

-- Check emergency alerts
SELECT * FROM emergency_alerts WHERE status = 'active';

-- Check verification attempts
SELECT phone_number, COUNT(*) as attempts
FROM verification_attempts
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY phone_number
ORDER BY attempts DESC;
```

---

## Common Issues & Solutions

### Issue 1: Phone Verification Not Working

```bash
# Check Twilio credentials
echo $TWILIO_ACCOUNT_SID
echo $TWILIO_VERIFY_SERVICE_SID

# Test Twilio directly
curl -X POST 'https://verify.twilio.com/v2/Services/YOUR_SERVICE_SID/Verifications' \
  --data-urlencode 'To=+96277853xxxx' \
  --data-urlencode 'Channel=sms' \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

### Issue 2: Payment Failing

```bash
# Check Stripe configuration
echo $STRIPE_SECRET_KEY

# Test Stripe connection
curl https://api.stripe.com/v1/payment_intents \
  -u YOUR_STRIPE_SECRET_KEY: \
  -d amount=5000 \
  -d currency=aed
```

### Issue 3: Maps API Not Responding

```bash
# Test Google Maps API
curl "https://maps.googleapis.com/maps/api/geocode/json?address=Amman&key=YOUR_API_KEY"
```

---

## Automated Test Suite

Create `tests/integration.test.ts`:

```typescript
import request from 'supertest';
import { app } from '../src/backend/server-production-complete';

describe('Integration Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Get auth token
    // authToken = await getTestToken();
  });

  describe('Authentication', () => {
    it('should send verification code', async () => {
      const response = await request(app)
        .post('/api/auth/verify/send')
        .send({ phoneNumber: '+1234567890', channel: 'sms' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Payments', () => {
    it('should create payment intent', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tripId: 'test-trip-id',
          amount: 50,
          currency: 'aed'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Maps', () => {
    it('should get route', async () => {
      const response = await request(app)
        .post('/api/maps/route')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          origin: { lat: 31.9454, lng: 35.9284 },
          destination: { lat: 32.0, lng: 36.0 }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.distance).toBeGreaterThan(0);
    });
  });
});
```

Run tests:

```bash
npm test
```

---

## Checklist

- [ ] Phone verification working
- [ ] Payment processing functional
- [ ] Maps & routing accurate
- [ ] WebSocket connections stable
- [ ] Emergency SOS alerts working
- [ ] Database queries optimized
- [ ] Error handling comprehensive
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Logging implemented
- [ ] Load testing passed

---

**Ready for Production!** ✅

# Real-time Features Implementation Roadmap - Phase 1 Part 3

**Target:** Replace polling with Supabase Realtime subscriptions  
**Status:** ⏳ Ready for Implementation  
**Priority:** Critical (HIGH)

---

## Overview

Replace all polling mechanisms with Supabase Realtime subscriptions for:
- Trip status updates (driver location, ETA)
- Instant messaging
- Live notifications
- Driver location tracking

---

## Current State Analysis

### Existing Architecture

**Polling Model (Current):**
```typescript
// Old approach - inefficient
useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId);
    setTripData(data);
  }, 2000); // Poll every 2 seconds

  return () => clearInterval(interval);
}, [tripId]);
```

**Problems with Polling:**
- ❌ Constant database queries
- ❌ Network overhead
- ❌ Battery drain on mobile
- ❌ Delayed updates (2s lag)
- ❌ Scalability issues at peak load

### Supabase Realtime (Target)

**Realtime Model (Optimized):**
```typescript
// New approach - efficient & instant
useEffect(() => {
  const channel = supabase
    .channel(`trip:${tripId}`)
    .on('postgres_changes', 
      { 
        event: '*',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`
      },
      (payload) => {
        setTripData(payload.new);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [tripId]);
```

**Benefits:**
- ✅ Instant updates (<100ms)
- ✅ Reduced database load
- ✅ Lower network usage
- ✅ Better mobile performance
- ✅ Scalable to thousands of users

---

## Implementation Tasks

### Task 1: Set Up Supabase Realtime

#### 1.1 Enable Realtime in Supabase Dashboard

**Steps:**
1. Go to Supabase dashboard
2. Navigate to: Replication > Publications
3. Enable publication for tables:
   - [ ] trips
   - [ ] messages
   - [ ] notifications
   - [ ] driver_locations
   - [ ] driver_status

#### 1.2 Create Realtime Hooks

**Create File:** `src/hooks/useTripsRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Trip {
  id: string;
  status: string;
  driverId: string;
  latitude: number;
  longitude: number;
  eta: number;
  [key: string]: any;
}

export function useTripsRealtime(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch initial data
    const fetchInitialTrip = async () => {
      const { data, error: fetchError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (fetchError) {
        setError(fetchError);
      } else {
        setTrip(data);
      }
      setLoading(false);
    };

    fetchInitialTrip();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`trips:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTrip(payload.new as Trip);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Trip realtime subscribed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  return { trip, loading, error };
}
```

---

### Task 2: Real-time Trip Updates

#### 2.1 Driver Location Updates

**Create File:** `src/hooks/useDriverLocationRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  bearing: number;
  accuracy: number;
  timestamp: number;
}

export function useDriverLocationRealtime(driverId: string) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [history, setHistory] = useState<DriverLocation[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`drivers:${driverId}:location`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_locations',
          filter: `driver_id=eq.${driverId}`
        },
        (payload) => {
          const newLocation = payload.new as DriverLocation;
          setLocation(newLocation);
          setHistory(prev => [...prev, newLocation].slice(-100)); // Keep last 100
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [driverId]);

  return { location, history };
}
```

#### 2.2 ETA Calculation

**Create File:** `src/hooks/useETACalculation.ts`

```typescript
import { useEffect, useState } from 'react';

interface ETAData {
  minutes: number;
  distance: number;
  updatedAt: number;
}

export function useETACalculation(
  pickupLat: number,
  pickupLng: number,
  driverLat: number,
  driverLng: number
) {
  const [eta, setETA] = useState<ETAData | null>(null);

  useEffect(() => {
    // Haversine formula for distance
    const calculateDistance = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number
    ) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distance = calculateDistance(
      pickupLat,
      pickupLng,
      driverLat,
      driverLng
    );

    // Assume average speed of 40 km/h in city
    const avgSpeed = 40;
    const minutes = Math.ceil((distance / avgSpeed) * 60);

    setETA({
      minutes,
      distance,
      updatedAt: Date.now(),
    });
  }, [pickupLat, pickupLng, driverLat, driverLng]);

  return eta;
}
```

---

### Task 3: Real-time Messaging

#### 3.1 Message Subscriptions

**Create File:** `src/hooks/useMessagesRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Message {
  id: string;
  tripId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export function useMessagesRealtime(tripId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('timestamp', { ascending: true });

      setMessages(data || []);
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [tripId]);

  // Send message function
  const sendMessage = async (content: string, recipientId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        trip_id: tripId,
        sender_id: userId,
        recipient_id: recipientId,
        content,
        timestamp: Date.now(),
        read: false,
      })
      .select();

    if (error) throw error;
    return data;
  };

  return { messages, loading, sendMessage };
}
```

#### 3.2 Typing Indicators

**Create File:** `src/hooks/useTypingIndicators.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

export function useTypingIndicators(tripId: string, userId: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  let typingTimeout: NodeJS.Timeout;

  useEffect(() => {
    const channel = supabase
      .channel(`typing:${tripId}`)
      .on(
        'broadcast',
        { event: 'user_typing' },
        ({ payload }) => {
          if (payload.userId !== userId) {
            setTypingUsers(prev => 
              [...new Set([...prev, payload.userId])]
            );

            // Remove after 3 seconds
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
              setTypingUsers(prev => 
                prev.filter(id => id !== payload.userId)
              );
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(typingTimeout);
      supabase.removeChannel(channel);
    };
  }, [tripId, userId]);

  const broadcastTyping = () => {
    channel?.send({
      type: 'broadcast',
      event: 'user_typing',
      payload: { userId, tripId }
    });
  };

  return { typingUsers, broadcastTyping };
}
```

---

### Task 4: Real-time Notifications

#### 4.1 Notification Subscriptions

**Create File:** `src/hooks/useNotificationsRealtime.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Notification {
  id: string;
  userId: string;
  type: 'trip_update' | 'message' | 'promo' | 'system';
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

export function useNotificationsRealtime(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('timestamp', { ascending: false });

      setNotifications(data || []);
      setUnreadCount(data?.length || 0);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          if (!newNotification.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAsRead };
}
```

---

### Task 5: Connection Management

#### 5.1 Reconnection Logic

**Create File:** `src/hooks/useRealtimeConnection.ts`

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error: Error | null;
  attemptCount: number;
}

export function useRealtimeConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: true,
    reconnecting: false,
    error: null,
    attemptCount: 0,
  });

  useEffect(() => {
    const checkConnection = () => {
      // Check if realtime is connected
      const socket = supabase.getChannels();
      const isConnected = socket.length > 0;

      setStatus(prev => ({
        ...prev,
        connected: isConnected,
      }));
    };

    // Check connection every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    // Handle reconnection
    const handleReconnect = async () => {
      setStatus(prev => ({
        ...prev,
        reconnecting: true,
        attemptCount: prev.attemptCount + 1,
      }));

      try {
        // Attempt to reconnect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStatus(prev => ({
          ...prev,
          connected: true,
          reconnecting: false,
        }));
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error as Error,
          reconnecting: false,
        }));
      }
    };

    return () => clearInterval(interval);
  }, []);

  return status;
}
```

---

### Task 6: Update Components to Use Realtime

#### 6.1 LiveTrip Component

**Update File:** `src/components/LiveTrip.tsx`

```typescript
import { useTripsRealtime } from '../hooks/useTripsRealtime';
import { useDriverLocationRealtime } from '../hooks/useDriverLocationRealtime';
import { useETACalculation } from '../hooks/useETACalculation';
import { useNotificationsRealtime } from '../hooks/useNotificationsRealtime';

export function LiveTrip({ tripId, userId }: { tripId: string; userId: string }) {
  const { trip, loading } = useTripsRealtime(tripId);
  const { location: driverLocation } = useDriverLocationRealtime(trip?.driver_id);
  const eta = useETACalculation(
    trip?.pickup_lat,
    trip?.pickup_lng,
    driverLocation?.latitude,
    driverLocation?.longitude
  );
  const { notifications } = useNotificationsRealtime(userId);

  if (loading) return <div>Loading trip...</div>;

  return (
    <div>
      <h2>Trip Status: {trip?.status}</h2>
      <p>ETA: {eta?.minutes} minutes</p>
      <p>Driver Location: {driverLocation?.latitude}, {driverLocation?.longitude}</p>
      <p>Distance: {eta?.distance.toFixed(1)} km</p>
      {/* Map component showing real-time location */}
    </div>
  );
}
```

#### 6.2 Messages Component

**Update File:** `src/components/Messages.tsx`

```typescript
import { useMessagesRealtime } from '../hooks/useMessagesRealtime';
import { useTypingIndicators } from '../hooks/useTypingIndicators';

export function Messages({ tripId, userId }: { tripId: string; userId: string }) {
  const { messages, sendMessage } = useMessagesRealtime(tripId, userId);
  const { typingUsers, broadcastTyping } = useTypingIndicators(tripId, userId);

  const handleSend = async (content: string) => {
    broadcastTyping();
    await sendMessage(content, /* recipientId */);
  };

  return (
    <div>
      <div className="messages-list">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <p>{msg.content}</p>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      
      {typingUsers.length > 0 && (
        <p className="typing">Someone is typing...</p>
      )}

      <input
        type="text"
        placeholder="Type a message..."
        onChange={(e) => handleSend(e.target.value)}
      />
    </div>
  );
}
```

---

### Task 7: Database Schema Updates

#### 7.1 Ensure Tables Have Realtime Enabled

**SQL to execute in Supabase:**

```sql
-- Enable realtime on trips table
ALTER PUBLICATION supabase_realtime ADD TABLE trips;

-- Enable realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime on driver_locations table
ALTER PUBLICATION supabase_realtime ADD TABLE driver_locations;

-- Enable realtime on driver_status table
ALTER PUBLICATION supabase_realtime ADD TABLE driver_status;

-- Check what's published
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

### Task 8: Testing Real-time Features

#### 8.1 Test Real-time Connections

**Tests Already Created:** `src/__tests__/realtime/realtimeFeatures.test.ts`

#### 8.2 Manual Testing Checklist

- [ ] Verify trip updates appear in real-time
- [ ] Check driver location updates every 2-5 seconds
- [ ] Test message delivery (<1s latency)
- [ ] Verify typing indicators appear/disappear
- [ ] Test connection loss and reconnection
- [ ] Monitor WebSocket connection in DevTools
- [ ] Check memory usage (watch for memory leaks)
- [ ] Test on slow network (2G/3G simulation)

---

## Implementation Checklist

### Week 1: Setup & Basic Implementation
- [ ] Enable Realtime in Supabase
- [ ] Create useTripsRealtime hook
- [ ] Create useDriverLocationRealtime hook
- [ ] Create useMessagesRealtime hook
- [ ] Create useNotificationsRealtime hook
- [ ] Test basic subscriptions

### Week 2: Integration
- [ ] Update LiveTrip component
- [ ] Update Messages component
- [ ] Update NotificationCenter component
- [ ] Integrate ETA calculation
- [ ] Add typing indicators

### Week 3: Advanced Features
- [ ] Connection management
- [ ] Reconnection logic
- [ ] Error handling
- [ ] Offline fallback

### Week 4: Optimization & Testing
- [ ] Performance optimization
- [ ] Memory leak fixes
- [ ] Comprehensive testing
- [ ] Production deployment

---

## Performance Impact

### Expected Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Database Queries/sec | ~1000 | ~100 | -90% |
| Network Overhead | High | Low | -70% |
| Update Latency | 2000ms | <100ms | 20x faster |
| Battery Usage | High | Low | -50% |
| Scalability | Limited | 10000+ concurrent | 100x |

---

## Monitoring & Metrics

### Key Metrics to Track

```typescript
const metrics = {
  realtime_subscriptions_active: 0,
  realtime_messages_per_minute: 0,
  realtime_connection_errors: 0,
  realtime_reconnections: 0,
  average_message_latency_ms: 0,
  websocket_open_time_ms: 0,
};
```

---

## Expected Rating Impact: +3-5 points

- Real-time updates: +2 points
- Improved responsiveness: +1.5 points
- Better mobile experience: +1 point
- User satisfaction: +0.5 point

---

## References

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [WebSocket Performance](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Status:** Ready for implementation after testing suite and performance optimization are complete.

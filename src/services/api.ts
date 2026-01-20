import { createClient } from '@supabase/supabase-js';

// Simple validation functions
const validateInput = {
  sanitize: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  validatePassword: (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  }
};

// Simple rate limiter
const rateLimiter = {
  requests: new Map<string, { count: number; resetTime: number }>(),
  checkLimit: (key: string, limit: number, windowMs: number): boolean => {
    const now = Date.now();
    const userRequests = rateLimiter.requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      rateLimiter.requests.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userRequests.count >= limit) {
      return false;
    }
    
    userRequests.count++;
    return true;
  }
};

// Simple error handler
const handleError = (error: Error, context?: string) => {
  console.error(`[${context || 'API'}] Error:`, error.message);
};

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const projectId = supabaseUrl?.split('//')[1]?.split('.')[0] || 'default';

const supabaseClient = createClient(supabaseUrl, supabaseKey);
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

// Ensure client exists with proper error handling
if (!supabaseClient) {
  handleError(new Error('Supabase client not initialized'), 'initialization');
  throw new Error('Supabase client not initialized');
}

export const supabase = supabaseClient;

// Helper to get current user ID and session token with validation
async function getAuthDetails() {
  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      handleError(error as Error, 'getAuthDetails');
      throw new Error('Authentication failed. Please sign in again.');
    }
    
    if (!session) {
      throw new Error('No active session. Please sign in.');
    }
    
    // Validate session expiry
    if (new Date(session.expires_at!) < new Date()) {
      await supabase.auth.signOut();
      throw new Error('Session expired. Please sign in again.');
    }
    
    return { 
      token: session.access_token,
      userId: session.user.id
    };
  } catch (error: unknown) {
    handleError(error as Error, 'getAuthDetails');
    throw error;
  }
}

// ============ AUTH API ============

export const authAPI = {
  async signUp(email: string, password: string, firstName: string, lastName: string, phone: string) {
    try {
      // Input validation
      if (!validateInput.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (!validateInput.validatePassword(password)) {
        throw new Error('Password must be 8+ characters with uppercase, lowercase, and number');
      }
      if (!firstName?.trim()) {
        throw new Error('First name is required');
      }
      
      // Rate limiting
      if (!rateLimiter.checkLimit(`signup_${email}`, 3, 3600000)) {
        throw new Error('Too many signup attempts. Try again in 1 hour.');
      }
      
      // Sanitize inputs
      const sanitizedFirstName = validateInput.sanitize(firstName);
      const sanitizedLastName = validateInput.sanitize(lastName || '');
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password, 
          fullName: `${sanitizedFirstName} ${sanitizedLastName}`.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(error.error || `Signup failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'signUp');
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      // Input validation
      if (!validateInput.validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      if (!password?.trim()) {
        throw new Error('Password is required');
      }
      
      // Rate limiting
      if (!rateLimiter.checkLimit(`signin_${email}`, 5, 900000)) {
        throw new Error('Too many login attempts. Try again in 15 minutes.');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        handleError(error as Error, 'signIn');
        throw error;
      }
      
      return data;
    } catch (error: unknown) {
      handleError(error as Error, 'signIn');
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      handleError(error as Error, 'signOut');
      throw error;
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    } catch (error: unknown) {
      handleError(error as Error, 'getSession');
      throw error;
    }
  },

  async getProfile() {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // If 404, profile might not exist yet (e.g. just signed up via Supabase Auth but not API)
        // The signup API creates the profile, so this should be rare unless manually inserted.
        if (response.status === 404) return null;
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getProfile');
      throw error;
    }
  },

  async updateProfile(updates: any) {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'updateProfile');
      throw error;
    }
  }
};

// ============ TRIPS API ============

export const tripsAPI = {
  async createTrip(tripData: any) {
    try {
      const { token } = await getAuthDetails();
      
      // Validate required fields
      if (!tripData.from_location || !tripData.to_location) {
        throw new Error('Origin and destination are required');
      }
      if (!tripData.departure_date || !tripData.departure_time) {
        throw new Error('Departure date and time are required');
      }
      if (!tripData.total_seats || tripData.total_seats < 1 || tripData.total_seats > 8) {
        throw new Error('Total seats must be between 1 and 8');
      }
      if (!tripData.fare || tripData.fare < 0) {
        throw new Error('Valid fare is required');
      }
      
      // Sanitize string inputs
      const sanitizedData = {
        ...tripData,
        from_location: validateInput.sanitize(tripData.from_location),
        to_location: validateInput.sanitize(tripData.to_location),
        notes: tripData.notes ? validateInput.sanitize(tripData.notes) : null
      };

      const response = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create trip');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'createTrip');
      throw error;
    }
  },

  async searchTrips(from?: string, to?: string, date?: string, seats?: number) {
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (date) params.append('date', date);
      if (seats) params.append('seats', seats.toString());

      const response = await fetch(`${API_URL}/trips/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search trips');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'searchTrips');
      throw error;
    }
  },

  async getTripById(tripId: string) {
    try {
      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trip');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getTripById');
      throw error;
    }
  },

  async getDriverTrips() {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/trips/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch driver trips');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getDriverTrips');
      throw error;
    }
  },
  
  async calculatePrice(type: 'passenger' | 'package', weight?: number, distance_km?: number, base_price?: number) {
    try {
      const response = await fetch(`${API_URL}/trips/calculate-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, weight, distance_km, base_price })
      });
      
      if (!response.ok) {
          throw new Error('Failed to calculate price');
      }
      
      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'calculatePrice');
      throw error;
    }
  },

  async updateTrip(tripId: string, updates: any) {
    try {
      const { token } = await getAuthDetails();

      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update trip');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'updateTrip');
      throw error;
    }
  },

  async deleteTrip(tripId: string) {
    try {
      const { token } = await getAuthDetails();

      const response = await fetch(`${API_URL}/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete trip');
      }

      return { success: true };
    } catch (error: unknown) {
      handleError(error as Error, 'deleteTrip');
      throw error;
    }
  }
};

// ============ BOOKINGS API ============

export const bookingsAPI = {
  async createBooking(tripId: string, seatsRequested: number, pickup?: string, dropoff?: string) {
    try {
      const { token } = await getAuthDetails();

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trip_id: tripId, seats_requested: seatsRequested, pickup_stop: pickup, dropoff_stop: dropoff })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'createBooking');
      throw error;
    }
  },

  async getUserBookings() {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/bookings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getUserBookings');
      throw error;
    }
  },

  async getTripBookings(tripId: string) {
    try {
      const { token } = await getAuthDetails();

      const response = await fetch(`${API_URL}/trips/${tripId}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trip bookings');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getTripBookings');
      throw error;
    }
  },

  async updateBookingStatus(bookingId: string, status: 'accepted' | 'rejected' | 'cancelled') {
    try {
      const { token } = await getAuthDetails();

      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || 'Failed to update booking');
      }
      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'updateBookingStatus');
      throw error;
    }
  }
};

// ============ MESSAGES API ============

export const messagesAPI = {
  async sendMessage(recipientId: string, tripId: string, content: string) {
    try {
      const { token } = await getAuthDetails();

      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipient_id: recipientId, trip_id: tripId, content })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'sendMessage');
      throw error;
    }
  },

  async getConversations() {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/messages/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getConversations');
      throw error;
    }
  },
  
  async getConversationWithUser(otherUserId: string) {
    try {
      const { token, userId } = await getAuthDetails();
      
      const response = await fetch(`${API_URL}/messages/conversation/${userId}/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
          throw new Error('Failed to fetch messages');
      }
      
      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getConversationWithUser');
      throw error;
    }
  }
};

// ============ WALLET API ============

export const walletAPI = {
  async getWallet() {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/wallet/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getWallet');
      throw error;
    }
  },

  async addFunds(amount: number) {
    try {
      const { token, userId } = await getAuthDetails();

      const response = await fetch(`${API_URL}/wallet/${userId}/add-funds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        throw new Error('Failed to add funds');
      }

      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'addFunds');
      throw error;
    }
  }
};

// ============ NOTIFICATIONS API ============

export const notificationsAPI = {
  async getNotifications() {
    try {
      const { token, userId } = await getAuthDetails();
      const response = await fetch(`${API_URL}/notifications/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'getNotifications');
      throw error;
    }
  },

  async markAsRead(notificationId: string) {
    try {
      const { token } = await getAuthDetails();
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    } catch (error: unknown) {
      handleError(error as Error, 'markAsRead');
      throw error;
    }
  }
};

// ============ REFERRAL API ============
export const referralAPI = {
    async getReferralCode() {
        try {
            const { token, userId } = await getAuthDetails();
            const response = await fetch(`${API_URL}/referral/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch referral code');
            return await response.json();
        } catch (error: unknown) {
            handleError(error as Error, 'getReferralCode');
            throw error;
        }
    },
    
    async applyReferralCode(code: string) {
        try {
            const { token } = await getAuthDetails();
            const response = await fetch(`${API_URL}/referral/apply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ referral_code: code })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to apply code');
            }
            return await response.json();
        } catch (error: unknown) {
            handleError(error as Error, 'applyReferralCode');
            throw error;
        }
    }
};

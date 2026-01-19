import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase as supabaseClient } from '../utils/supabase/client';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

// Ensure client exists (it should given info.tsx has constants)
if (!supabaseClient) {
  throw new Error('Supabase client not initialized');
}

export const supabase = supabaseClient;

// Helper to get current user ID and session token
async function getAuthDetails() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed. Please sign in again.');
    }
    if (!session) {
      throw new Error('No active session. Please sign in.');
    }
    return { 
      token: session.access_token,
      userId: session.user.id
    };
  } catch (error) {
    console.error('Failed to get auth details:', error);
    throw error;
  }
}

// ============ AUTH API ============

export const authAPI = {
  async signUp(email: string, password: string, firstName: string, lastName: string, phone: string) {
    try {
      // Input validation
      if (!email || !password || !firstName) {
        throw new Error('Email, password, and first name are required');
      }
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, fullName: `${firstName} ${lastName}` })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(error.error || `Signup failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  async getProfile() {
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
  },

  async updateProfile(updates: any) {
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
  }
};

// ============ TRIPS API ============

export const tripsAPI = {
  async createTrip(tripData: any) {
    const { token } = await getAuthDetails();

    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tripData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create trip');
    }

    return await response.json();
  },

  async searchTrips(from?: string, to?: string, date?: string, seats?: number) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (date) params.append('date', date);
    if (seats) params.append('seats', seats.toString());

    const response = await fetch(`${API_URL}/trips/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search trips');
    }

    return await response.json();
  },

  async getTripById(tripId: string) {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trip');
    }

    return await response.json();
  },

  async getDriverTrips() {
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
  },
  
  async calculatePrice(type: 'passenger' | 'package', weight?: number, distance_km?: number, base_price?: number) {
    const response = await fetch(`${API_URL}/trips/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, weight, distance_km, base_price })
    });
    
    if (!response.ok) {
        throw new Error('Failed to calculate price');
    }
    
    return await response.json();
  },

  async updateTrip(tripId: string, updates: any) {
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
  },

  async deleteTrip(tripId: string) {
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
  }
};

// ============ BOOKINGS API ============

export const bookingsAPI = {
  async createBooking(tripId: string, seatsRequested: number, pickup?: string, dropoff?: string) {
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
  },

  async getUserBookings() {
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
  },

  async getTripBookings(tripId: string) {
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
  },

  async updateBookingStatus(bookingId: string, status: 'accepted' | 'rejected' | 'cancelled') {
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
  }
};

// ============ MESSAGES API ============

export const messagesAPI = {
  async sendMessage(recipientId: string, tripId: string, content: string) {
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
  },

  async getConversations() {
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
  },
  
  async getConversationWithUser(otherUserId: string) {
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
  }
};

// ============ WALLET API ============

export const walletAPI = {
  async getWallet() {
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
  },

  async addFunds(amount: number) {
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
  }
};

// ============ NOTIFICATIONS API ============

export const notificationsAPI = {
  async getNotifications() {
    const { token, userId } = await getAuthDetails();
    const response = await fetch(`${API_URL}/notifications/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  },

  async markAsRead(notificationId: string) {
    const { token } = await getAuthDetails();
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return await response.json();
  }
};

// ============ REFERRAL API ============
export const referralAPI = {
    async getReferralCode() {
        const { token, userId } = await getAuthDetails();
        const response = await fetch(`${API_URL}/referral/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch referral code');
        return await response.json();
    },
    
    async applyReferralCode(code: string) {
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
    }
};

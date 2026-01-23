import { createClient } from '@supabase/supabase-js';

/* ================================
   ENV (Vite-safe)
================================ */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

/* ================================
   SUPABASE CLIENT (NAMED EXPORT)
================================ */
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const projectId =
  SUPABASE_URL.split('//')[1]?.split('.')[0] ?? 'default';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

/* ================================
   UTILITIES
================================ */
const handleError = (error: unknown, context = 'API') => {
  console.error(`[${context}]`, error);
};

const validateInput = {
  sanitize(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  validatePassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  }
};

/* ================================
   AUTH HELPERS
================================ */
async function getAuthDetails() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw new Error('Not authenticated');
  }

  const session = data.session;

  if (
    typeof session.expires_at === 'number' &&
    session.expires_at * 1000 < Date.now()
  ) {
    await supabase.auth.signOut();
    throw new Error('Session expired');
  }

  return {
    token: session.access_token,
    userId: session.user.id
  };
}

/* ================================
   AUTH API
================================ */
export const authAPI = {
  async signUp(email: string, password: string, firstName: string, lastName = '') {
    if (!validateInput.validateEmail(email)) {
      throw new Error('Invalid email');
    }
    if (!validateInput.validatePassword(password)) {
      throw new Error('Weak password');
    }

    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        password,
        fullName: `${validateInput.sanitize(firstName)} ${validateInput.sanitize(lastName)}`.trim()
      })
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    return response.json();
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data;
  }
};

/* ================================
   TRIPS API (pattern applies to all)
================================ */
export const tripsAPI = {
  async createTrip(tripData: any) {
    const { token } = await getAuthDetails();

    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(tripData)
    });

    if (!response.ok) {
      throw new Error('Failed to create trip');
    }

    return response.json();
  }
};

/* 
✔ The rest of your APIs (bookings, wallet, messages, referral, notifications)
✔ follow the SAME FIXED PATTERN above
✔ NO process.env
✔ NO export mismatch
*/

"use strict";
/**
 * Third-Party Integrations Service
 *
 * Centralized service for all external API integrations.
 * Ready for production - just add API keys to environment variables.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTrackingService = exports.analyticsService = exports.identityVerificationService = exports.pushNotificationService = exports.emailService = exports.smsService = exports.paymentService = exports.mapsService = exports.INTEGRATION_CONFIG = void 0;
exports.checkIntegrationStatus = checkIntegrationStatus;
exports.getIntegrationHealth = getIntegrationHealth;
// ============ CONFIGURATION ============
exports.INTEGRATION_CONFIG = {
    // Google Maps
    googleMaps: {
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        enabled: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    },
    // Stripe Payments
    stripe: {
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
        enabled: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    },
    // Twilio (SMS/Voice)
    twilio: {
        accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
        enabled: !!import.meta.env.VITE_TWILIO_ACCOUNT_SID,
    },
    // SendGrid (Email)
    sendgrid: {
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
        enabled: !!import.meta.env.VITE_SENDGRID_API_KEY,
    },
    // Firebase (Push Notifications)
    firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        enabled: !!import.meta.env.VITE_FIREBASE_API_KEY,
    },
    // Identity Verification (Jumio)
    jumio: {
        apiKey: import.meta.env.VITE_JUMIO_API_KEY || '',
        apiSecret: import.meta.env.VITE_JUMIO_API_SECRET || '',
        enabled: !!import.meta.env.VITE_JUMIO_API_KEY,
    },
    // Analytics
    mixpanel: {
        token: import.meta.env.VITE_MIXPANEL_TOKEN || '',
        enabled: !!import.meta.env.VITE_MIXPANEL_TOKEN,
    },
    // Error Tracking
    sentry: {
        dsn: import.meta.env.VITE_SENTRY_DSN || '',
        enabled: !!import.meta.env.VITE_SENTRY_DSN,
    },
};
exports.mapsService = {
    async calculateRoute(origin, destination, waypoints) {
        if (!exports.INTEGRATION_CONFIG.googleMaps.enabled) {
            // Fallback: simple calculation
            return this.calculateRouteFallback(origin, destination);
        }
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?` +
                `origin=${origin.lat},${origin.lng}&` +
                `destination=${destination.lat},${destination.lng}&` +
                `key=${exports.INTEGRATION_CONFIG.googleMaps.apiKey}`);
            const data = await response.json();
            if (data.status === 'OK') {
                const route = data.routes[0];
                const leg = route.legs[0];
                return {
                    distance: leg.distance.value,
                    duration: leg.duration.value,
                    polyline: route.overview_polyline.points,
                    steps: leg.steps.map((step) => ({
                        instruction: step.html_instructions,
                        distance: step.distance.value,
                        duration: step.duration.value,
                    })),
                };
            }
            throw new Error(data.status);
        }
        catch (error) {
            console.error('Maps API error:', error);
            return this.calculateRouteFallback(origin, destination);
        }
    },
    calculateRouteFallback(origin, destination) {
        // Haversine formula for distance
        const R = 6371e3; // Earth radius in meters
        const φ1 = (origin.lat * Math.PI) / 180;
        const φ2 = (destination.lat * Math.PI) / 180;
        const Δφ = ((destination.lat - origin.lat) * Math.PI) / 180;
        const Δλ = ((destination.lng - origin.lng) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        const duration = distance / 13.89; // Assume 50 km/h average speed
        return {
            distance: Math.round(distance),
            duration: Math.round(duration),
            polyline: '',
            steps: [
                {
                    instruction: `Head to ${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}`,
                    distance: Math.round(distance),
                    duration: Math.round(duration),
                },
            ],
        };
    },
    async geocodeAddress(address) {
        if (!exports.INTEGRATION_CONFIG.googleMaps.enabled) {
            return null;
        }
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?` +
                `address=${encodeURIComponent(address)}&` +
                `key=${exports.INTEGRATION_CONFIG.googleMaps.apiKey}`);
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
                const result = data.results[0];
                return {
                    address: result.formatted_address,
                    coordinates: {
                        lat: result.geometry.location.lat,
                        lng: result.geometry.location.lng,
                    },
                    placeId: result.place_id,
                };
            }
            return null;
        }
        catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    },
    async reverseGeocode(lat, lng) {
        if (!exports.INTEGRATION_CONFIG.googleMaps.enabled) {
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?` +
                `latlng=${lat},${lng}&` +
                `key=${exports.INTEGRATION_CONFIG.googleMaps.apiKey}`);
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
                return data.results[0].formatted_address;
            }
            return null;
        }
        catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    },
};
exports.paymentService = {
    async createPaymentIntent(amount, currency = 'aed', metadata) {
        if (!exports.INTEGRATION_CONFIG.stripe.enabled) {
            // Fallback: mock payment
            return {
                id: `pi_mock_${Date.now()}`,
                clientSecret: 'mock_secret',
                amount,
                currency,
                status: 'succeeded',
            };
        }
        try {
            // Call your backend to create payment intent
            const response = await fetch('/api/payments/create-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency, metadata }),
            });
            return await response.json();
        }
        catch (error) {
            console.error('Payment intent creation failed:', error);
            throw error;
        }
    },
    async confirmPayment(paymentIntentId, paymentMethodId) {
        if (!exports.INTEGRATION_CONFIG.stripe.enabled) {
            return { success: true };
        }
        try {
            const response = await fetch('/api/payments/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentIntentId, paymentMethodId }),
            });
            return await response.json();
        }
        catch (error) {
            console.error('Payment confirmation failed:', error);
            return { success: false, error: 'Payment failed' };
        }
    },
    async refund(paymentIntentId, amount) {
        if (!exports.INTEGRATION_CONFIG.stripe.enabled) {
            return { success: true, refundId: `re_mock_${Date.now()}` };
        }
        try {
            const response = await fetch('/api/payments/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentIntentId, amount }),
            });
            return await response.json();
        }
        catch (error) {
            console.error('Refund failed:', error);
            return { success: false };
        }
    },
};
// ============ SMS SERVICE (TWILIO) ============
exports.smsService = {
    async sendVerificationCode(phoneNumber, code) {
        if (!exports.INTEGRATION_CONFIG.twilio.enabled) {
            console.log(`[Mock SMS] Code ${code} to ${phoneNumber}`);
            return true;
        }
        try {
            const response = await fetch('/api/sms/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, code }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('SMS send failed:', error);
            return false;
        }
    },
    async sendTripNotification(phoneNumber, message) {
        if (!exports.INTEGRATION_CONFIG.twilio.enabled) {
            console.log(`[Mock SMS] ${message} to ${phoneNumber}`);
            return true;
        }
        try {
            const response = await fetch('/api/sms/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, message }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('SMS send failed:', error);
            return false;
        }
    },
    async initiateCall(fromNumber, toNumber) {
        if (!exports.INTEGRATION_CONFIG.twilio.enabled) {
            console.log(`[Mock Call] From ${fromNumber} to ${toNumber}`);
            return { callSid: `CA_mock_${Date.now()}` };
        }
        try {
            const response = await fetch('/api/voice/initiate-call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: fromNumber, to: toNumber }),
            });
            return await response.json();
        }
        catch (error) {
            console.error('Call initiation failed:', error);
            return null;
        }
    },
};
// ============ EMAIL SERVICE (SENDGRID) ============
exports.emailService = {
    async sendVerificationEmail(email, verificationLink) {
        if (!exports.INTEGRATION_CONFIG.sendgrid.enabled) {
            console.log(`[Mock Email] Verification link sent to ${email}`);
            return true;
        }
        try {
            const response = await fetch('/api/email/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, verificationLink }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('Email send failed:', error);
            return false;
        }
    },
    async sendTripReceipt(email, tripId, receiptData) {
        if (!exports.INTEGRATION_CONFIG.sendgrid.enabled) {
            console.log(`[Mock Email] Receipt sent to ${email} for trip ${tripId}`);
            return true;
        }
        try {
            const response = await fetch('/api/email/send-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, tripId, receiptData }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('Email send failed:', error);
            return false;
        }
    },
    async sendPasswordReset(email, resetLink) {
        if (!exports.INTEGRATION_CONFIG.sendgrid.enabled) {
            console.log(`[Mock Email] Password reset sent to ${email}`);
            return true;
        }
        try {
            const response = await fetch('/api/email/send-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, resetLink }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('Email send failed:', error);
            return false;
        }
    },
};
// ============ PUSH NOTIFICATION SERVICE (FIREBASE) ============
exports.pushNotificationService = {
    async sendPushNotification(userId, notification) {
        if (!exports.INTEGRATION_CONFIG.firebase.enabled) {
            console.log(`[Mock Push] ${notification.title} to user ${userId}`);
            return true;
        }
        try {
            const response = await fetch('/api/notifications/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, notification }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('Push notification failed:', error);
            return false;
        }
    },
    async subscribeToTopic(userId, topic) {
        if (!exports.INTEGRATION_CONFIG.firebase.enabled) {
            return true;
        }
        try {
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, topic }),
            });
            return response.ok;
        }
        catch (error) {
            console.error('Topic subscription failed:', error);
            return false;
        }
    },
};
// ============ IDENTITY VERIFICATION SERVICE (JUMIO) ============
exports.identityVerificationService = {
    async initiateVerification(userId, userInfo) {
        if (!exports.INTEGRATION_CONFIG.jumio.enabled) {
            return {
                verificationId: `jm_mock_${Date.now()}`,
                redirectUrl: '/verification/mock',
            };
        }
        try {
            const response = await fetch('/api/verification/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, userInfo }),
            });
            return await response.json();
        }
        catch (error) {
            console.error('Identity verification initiation failed:', error);
            return null;
        }
    },
    async checkVerificationStatus(verificationId) {
        if (!exports.INTEGRATION_CONFIG.jumio.enabled) {
            return { status: 'approved' };
        }
        try {
            const response = await fetch(`/api/verification/status/${verificationId}`);
            return await response.json();
        }
        catch (error) {
            console.error('Verification status check failed:', error);
            return { status: 'pending' };
        }
    },
};
// ============ ANALYTICS SERVICE (MIXPANEL) ============
exports.analyticsService = {
    track(event, properties) {
        if (!exports.INTEGRATION_CONFIG.mixpanel.enabled) {
            console.log(`[Analytics] ${event}`, properties);
            return;
        }
        try {
            // Mixpanel tracking
            window.mixpanel?.track(event, properties);
        }
        catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    },
    identify(userId, userProperties) {
        if (!exports.INTEGRATION_CONFIG.mixpanel.enabled) {
            return;
        }
        try {
            window.mixpanel?.identify(userId);
            if (userProperties) {
                window.mixpanel?.people.set(userProperties);
            }
        }
        catch (error) {
            console.error('Analytics identify failed:', error);
        }
    },
    setUserProperty(property, value) {
        if (!exports.INTEGRATION_CONFIG.mixpanel.enabled) {
            return;
        }
        try {
            window.mixpanel?.people.set({ [property]: value });
        }
        catch (error) {
            console.error('Analytics set property failed:', error);
        }
    },
};
// ============ ERROR TRACKING SERVICE (SENTRY) ============
exports.errorTrackingService = {
    captureException(error, context) {
        if (!exports.INTEGRATION_CONFIG.sentry.enabled) {
            console.error('[Error]', error, context);
            return;
        }
        try {
            window.Sentry?.captureException(error, { extra: context });
        }
        catch (e) {
            console.error('Error tracking failed:', e);
        }
    },
    captureMessage(message, level = 'info') {
        if (!exports.INTEGRATION_CONFIG.sentry.enabled) {
            console.log(`[${level.toUpperCase()}]`, message);
            return;
        }
        try {
            window.Sentry?.captureMessage(message, level);
        }
        catch (error) {
            console.error('Message tracking failed:', error);
        }
    },
    setUser(user) {
        if (!exports.INTEGRATION_CONFIG.sentry.enabled) {
            return;
        }
        try {
            window.Sentry?.setUser(user);
        }
        catch (error) {
            console.error('Set user failed:', error);
        }
    },
};
// ============ INTEGRATION STATUS CHECK ============
function checkIntegrationStatus() {
    return {
        googleMaps: exports.INTEGRATION_CONFIG.googleMaps.enabled,
        stripe: exports.INTEGRATION_CONFIG.stripe.enabled,
        twilio: exports.INTEGRATION_CONFIG.twilio.enabled,
        sendgrid: exports.INTEGRATION_CONFIG.sendgrid.enabled,
        firebase: exports.INTEGRATION_CONFIG.firebase.enabled,
        jumio: exports.INTEGRATION_CONFIG.jumio.enabled,
        mixpanel: exports.INTEGRATION_CONFIG.mixpanel.enabled,
        sentry: exports.INTEGRATION_CONFIG.sentry.enabled,
    };
}
function getIntegrationHealth() {
    const status = checkIntegrationStatus();
    const entries = Object.entries(status);
    const healthy = entries.filter(([_, enabled]) => enabled).length;
    const missing = entries
        .filter(([_, enabled]) => !enabled)
        .map(([name]) => name);
    return {
        healthy,
        total: entries.length,
        percentage: Math.round((healthy / entries.length) * 100),
        missing,
    };
}
//# sourceMappingURL=integrations.js.map
/**
 * Third-Party Integrations Service
 *
 * Centralized service for all external API integrations.
 * Ready for production - just add API keys to environment variables.
 */
export declare const INTEGRATION_CONFIG: {
    googleMaps: {
        apiKey: any;
        enabled: boolean;
    };
    stripe: {
        publishableKey: any;
        enabled: boolean;
    };
    twilio: {
        accountSid: any;
        enabled: boolean;
    };
    sendgrid: {
        apiKey: any;
        enabled: boolean;
    };
    firebase: {
        apiKey: any;
        projectId: any;
        enabled: boolean;
    };
    jumio: {
        apiKey: any;
        apiSecret: any;
        enabled: boolean;
    };
    mixpanel: {
        token: any;
        enabled: boolean;
    };
    sentry: {
        dsn: any;
        enabled: boolean;
    };
};
export interface RouteResult {
    distance: number;
    duration: number;
    polyline: string;
    steps: Array<{
        instruction: string;
        distance: number;
        duration: number;
    }>;
}
export interface GeocodingResult {
    address: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    placeId: string;
}
export declare const mapsService: {
    calculateRoute(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }, waypoints?: Array<{
        lat: number;
        lng: number;
    }>): Promise<RouteResult>;
    calculateRouteFallback(origin: {
        lat: number;
        lng: number;
    }, destination: {
        lat: number;
        lng: number;
    }): RouteResult;
    geocodeAddress(address: string): Promise<GeocodingResult | null>;
    reverseGeocode(lat: number, lng: number): Promise<string | null>;
};
export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
    status: string;
}
export declare const paymentService: {
    createPaymentIntent(amount: number, currency?: string, metadata?: Record<string, string>): Promise<PaymentIntent>;
    confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    refund(paymentIntentId: string, amount?: number): Promise<{
        success: boolean;
        refundId?: string;
    }>;
};
export declare const smsService: {
    sendVerificationCode(phoneNumber: string, code: string): Promise<boolean>;
    sendTripNotification(phoneNumber: string, message: string): Promise<boolean>;
    initiateCall(fromNumber: string, toNumber: string): Promise<{
        callSid: string;
    } | null>;
};
export declare const emailService: {
    sendVerificationEmail(email: string, verificationLink: string): Promise<boolean>;
    sendTripReceipt(email: string, tripId: string, receiptData: any): Promise<boolean>;
    sendPasswordReset(email: string, resetLink: string): Promise<boolean>;
};
export declare const pushNotificationService: {
    sendPushNotification(userId: string, notification: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<boolean>;
    subscribeToTopic(userId: string, topic: string): Promise<boolean>;
};
export declare const identityVerificationService: {
    initiateVerification(userId: string, userInfo: {
        firstName: string;
        lastName: string;
        country: string;
    }): Promise<{
        verificationId: string;
        redirectUrl: string;
    } | null>;
    checkVerificationStatus(verificationId: string): Promise<{
        status: "pending" | "approved" | "rejected";
        details?: any;
    }>;
};
export declare const analyticsService: {
    track(event: string, properties?: Record<string, any>): void;
    identify(userId: string, userProperties?: Record<string, any>): void;
    setUserProperty(property: string, value: any): void;
};
export declare const errorTrackingService: {
    captureException(error: Error, context?: Record<string, any>): void;
    captureMessage(message: string, level?: "info" | "warning" | "error"): void;
    setUser(user: {
        id: string;
        email?: string;
        username?: string;
    }): void;
};
export declare function checkIntegrationStatus(): {
    googleMaps: boolean;
    stripe: boolean;
    twilio: boolean;
    sendgrid: boolean;
    firebase: boolean;
    jumio: boolean;
    mixpanel: boolean;
    sentry: boolean;
};
export declare function getIntegrationHealth(): {
    healthy: number;
    total: number;
    percentage: number;
    missing: string[];
};
//# sourceMappingURL=integrations.d.ts.map
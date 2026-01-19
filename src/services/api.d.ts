export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare const authAPI: {
    signUp(email: string, password: string, firstName: string, lastName: string, phone: string): Promise<unknown>;
    signIn(email: string, password: string): Promise<{
        user: import("@supabase/supabase-js").AuthUser;
        session: import("@supabase/supabase-js").AuthSession;
        weakPassword?: import("@supabase/supabase-js").WeakPassword;
    }>;
    signOut(): Promise<void>;
    getSession(): Promise<{
        session: import("@supabase/supabase-js").AuthSession;
    } | {
        session: null;
    }>;
    getProfile(): Promise<unknown>;
    updateProfile(updates: any): Promise<unknown>;
};
export declare const tripsAPI: {
    createTrip(tripData: any): Promise<unknown>;
    searchTrips(from?: string, to?: string, date?: string, seats?: number): Promise<unknown>;
    getTripById(tripId: string): Promise<unknown>;
    getDriverTrips(): Promise<unknown>;
    calculatePrice(type: "passenger" | "package", weight?: number, distance_km?: number, base_price?: number): Promise<unknown>;
    updateTrip(tripId: string, updates: any): Promise<unknown>;
    deleteTrip(tripId: string): Promise<{
        success: boolean;
    }>;
};
export declare const bookingsAPI: {
    createBooking(tripId: string, seatsRequested: number, pickup?: string, dropoff?: string): Promise<unknown>;
    getUserBookings(): Promise<unknown>;
    getTripBookings(tripId: string): Promise<unknown>;
    updateBookingStatus(bookingId: string, status: "accepted" | "rejected" | "cancelled"): Promise<unknown>;
};
export declare const messagesAPI: {
    sendMessage(recipientId: string, tripId: string, content: string): Promise<unknown>;
    getConversations(): Promise<unknown>;
    getConversationWithUser(otherUserId: string): Promise<unknown>;
};
export declare const walletAPI: {
    getWallet(): Promise<unknown>;
    addFunds(amount: number): Promise<unknown>;
};
export declare const notificationsAPI: {
    getNotifications(): Promise<unknown>;
    markAsRead(notificationId: string): Promise<unknown>;
};
export declare const referralAPI: {
    getReferralCode(): Promise<unknown>;
    applyReferralCode(code: string): Promise<unknown>;
};
//# sourceMappingURL=api.d.ts.map
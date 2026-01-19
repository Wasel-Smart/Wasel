"use strict";
/**
 * Security Middleware - Production Ready
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = exports.validateSession = exports.rateLimit = exports.validateInput = void 0;
const client_1 = require("../utils/supabase/client");
// Input validation
exports.validateInput = {
    email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    phone: (phone) => /^\+?[1-9]\d{1,14}$/.test(phone),
    password: (password) => password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
    sanitize: (input) => input.replace(/[<>\"'&]/g, ''),
};
// Rate limiting
const rateLimits = new Map();
const rateLimit = (key, maxAttempts = 5, windowMs = 900000) => {
    const now = Date.now();
    const limit = rateLimits.get(key);
    if (!limit || now > limit.resetTime) {
        rateLimits.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }
    if (limit.count >= maxAttempts)
        return false;
    limit.count++;
    return true;
};
exports.rateLimit = rateLimit;
// Session validation
const validateSession = async () => {
    try {
        const { data: { session }, error } = await client_1.supabase.auth.getSession();
        if (error || !session)
            return { valid: false };
        // Check session expiry
        if (new Date(session.expires_at) < new Date()) {
            await client_1.supabase.auth.signOut();
            return { valid: false };
        }
        return { valid: true, user: session.user };
    }
    catch {
        return { valid: false };
    }
};
exports.validateSession = validateSession;
// Secure headers
exports.securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};
//# sourceMappingURL=authSecurity.js.map
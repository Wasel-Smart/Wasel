/**
 * Security Middleware - Production Ready
 */
export declare const validateInput: {
    email: (email: string) => boolean;
    phone: (phone: string) => boolean;
    password: (password: string) => boolean;
    sanitize: (input: string) => string;
};
export declare const rateLimit: (key: string, maxAttempts?: number, windowMs?: number) => boolean;
export declare const validateSession: () => Promise<{
    valid: boolean;
    user?: any;
}>;
export declare const securityHeaders: {
    'X-Content-Type-Options': string;
    'X-Frame-Options': string;
    'X-XSS-Protection': string;
    'Strict-Transport-Security': string;
};
//# sourceMappingURL=authSecurity.d.ts.map
/**
 * Global Error Handler - Production Ready
 */
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export interface ErrorContext {
    userId?: string;
    tripId?: string;
    component?: string;
    action?: string;
    metadata?: any;
}
declare class GlobalErrorHandler {
    private errorQueue;
    private isProcessing;
    handleError(error: Error, severity: ErrorSeverity, context?: ErrorContext): void;
    private processErrorQueue;
    private reportError;
    private storeErrorLog;
    withRetry<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
}
export declare const globalErrorHandler: GlobalErrorHandler;
export declare const setupGlobalErrorHandling: () => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map
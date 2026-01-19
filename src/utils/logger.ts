/**
 * Production Logging Service
 */

import { globalErrorHandler, ErrorSeverity } from './errorHandler';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  component?: string;
  action?: string;
  userId?: string;
  metadata?: any;
}

class Logger {
  private logLevel: LogLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogLevel, message: string, component?: string, action?: string, metadata?: any): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      component,
      action,
      metadata
    };

    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const logMethod = level >= LogLevel.ERROR ? console.error : 
                     level >= LogLevel.WARN ? console.warn : console.log;
    
    logMethod(`[${LogLevel[level]}] ${component ? `[${component}]` : ''} ${message}`, metadata || '');

    // Report critical errors
    if (level >= LogLevel.ERROR) {
      globalErrorHandler.handleError(
        new Error(message),
        level === LogLevel.CRITICAL ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
        { component, action, metadata }
      );
    }
  }

  debug(message: string, component?: string, action?: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, component, action, metadata);
  }

  info(message: string, component?: string, action?: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, component, action, metadata);
  }

  warn(message: string, component?: string, action?: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, component, action, metadata);
  }

  error(message: string, component?: string, action?: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, component, action, metadata);
  }

  critical(message: string, component?: string, action?: string, metadata?: any): void {
    this.log(LogLevel.CRITICAL, message, component, action, metadata);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level !== undefined ? this.logs.filter(log => log.level >= level) : this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

export const logger = new Logger();
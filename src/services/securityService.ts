/**
 * Security Service
 * Handles authentication, authorization, fraud detection, and security monitoring
 */

import { supabase } from './api';
import { errorTracking } from './errorTracking';

export interface SecurityEvent {
  id: string;
  user_id?: string;
  event_type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'fraud_detected' | 'account_locked' | 'password_reset';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  location?: {
    country: string;
    city: string;
    lat: number;
    lng: number;
  };
  timestamp: string;
}

export interface FraudDetectionResult {
  risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendations: string[];
  should_block: boolean;
}

export interface DeviceFingerprint {
  device_id: string;
  user_agent: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  platform: string;
  is_mobile: boolean;
  browser_fingerprint: string;
}

export interface SecuritySettings {
  user_id: string;
  two_factor_enabled: boolean;
  biometric_enabled: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  device_tracking: boolean;
  session_timeout: number; // minutes
  max_failed_attempts: number;
  lockout_duration: number; // minutes
}

class SecurityService {
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30; // minutes
  private readonly SESSION_TIMEOUT = 60; // minutes

  /**
   * Authenticate user with enhanced security checks
   */
  async authenticateUser(
    email: string,
    password: string,
    deviceFingerprint: DeviceFingerprint,
    ipAddress: string,
    userAgent: string
  ): Promise<{
    success: boolean;
    user?: any;
    session?: any;
    requires_2fa?: boolean;
    security_flags?: string[];
    error?: string;
  }> {
    try {
      // Check if account is locked
      const isLocked = await this.isAccountLocked(email);
      if (isLocked) {
        await this.logSecurityEvent({
          event_type: 'login_attempt',
          severity: 'medium',
          details: { email, reason: 'account_locked' },
          ip_address: ipAddress,
          user_agent: userAgent,
        });
        return { success: false, error: 'Account is temporarily locked' };
      }

      // Attempt authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await this.handleFailedLogin(email, ipAddress, userAgent, error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Perform fraud detection
      const fraudResult = await this.detectFraud(data.user.id, {
        device_fingerprint: deviceFingerprint,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      const securityFlags = [];

      // Check for suspicious activity
      if (fraudResult.risk_score > 70) {
        securityFlags.push('high_fraud_risk');
        await this.logSecurityEvent({
          user_id: data.user.id,
          event_type: 'suspicious_activity',
          severity: 'high',
          details: { fraud_score: fraudResult.risk_score, flags: fraudResult.flags },
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      }

      // Check if 2FA is required
      const requires2FA = await this.requires2FA(data.user.id, deviceFingerprint);

      // Log successful login
      await this.logSecurityEvent({
        user_id: data.user.id,
        event_type: 'login_attempt',
        severity: 'low',
        details: { success: true, requires_2fa: requires2FA },
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(email);

      // Update device tracking
      await this.updateDeviceTracking(data.user.id, deviceFingerprint, ipAddress);

      return {
        success: true,
        user: data.user,
        session: data.session,
        requires_2fa: requires2FA,
        security_flags: securityFlags,
      };
    } catch (error: any) {
      errorTracking.captureException(error, { context: 'authentication' });
      return { success: false, error: 'Authentication service error' };
    }
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(
    email: string,
    ipAddress: string,
    userAgent: string,
    errorMessage: string
  ): Promise<void> {
    // Increment failed attempts
    const failedAttempts = await this.incrementFailedAttempts(email);

    // Log the failed attempt
    await this.logSecurityEvent({
      event_type: 'failed_login',
      severity: failedAttempts >= this.MAX_FAILED_ATTEMPTS ? 'high' : 'medium',
      details: { email, error: errorMessage, failed_attempts: failedAttempts },
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    // Lock account if too many failed attempts
    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      await this.lockAccount(email);
      await this.logSecurityEvent({
        event_type: 'account_locked',
        severity: 'high',
        details: { email, reason: 'too_many_failed_attempts' },
        ip_address: ipAddress,
        user_agent: userAgent,
      });
    }
  }

  /**
   * Detect fraudulent activity
   */
  async detectFraud(
    userId: string,
    context: {
      device_fingerprint: DeviceFingerprint;
      ip_address: string;
      user_agent: string;
      location?: { lat: number; lng: number };
    }
  ): Promise<FraudDetectionResult> {
    let riskScore = 0;
    const flags: string[] = [];
    const recommendations: string[] = [];

    // Check device fingerprint
    const knownDevice = await this.isKnownDevice(userId, context.device_fingerprint);
    if (!knownDevice) {
      riskScore += 20;
      flags.push('unknown_device');
      recommendations.push('Verify device through 2FA');
    }

    // Check IP reputation
    const ipRisk = await this.checkIPReputation(context.ip_address);
    if (ipRisk.is_suspicious) {
      riskScore += 30;
      flags.push('suspicious_ip');
      recommendations.push('Additional verification required');
    }

    // Check for impossible travel
    if (context.location) {
      const impossibleTravel = await this.checkImpossibleTravel(userId, context.location);
      if (impossibleTravel) {
        riskScore += 40;
        flags.push('impossible_travel');
        recommendations.push('Location verification required');
      }
    }

    // Check user behavior patterns
    const behaviorRisk = await this.analyzeBehaviorPatterns(userId, context);
    riskScore += behaviorRisk.score;
    flags.push(...behaviorRisk.flags);

    // Determine risk level
    let riskLevel: FraudDetectionResult['risk_level'] = 'low';
    if (riskScore >= 80) riskLevel = 'critical';
    else if (riskScore >= 60) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';

    const shouldBlock = riskScore >= 80;

    return {
      risk_score: Math.min(riskScore, 100),
      risk_level: riskLevel,
      flags,
      recommendations,
      should_block: shouldBlock,
    };
  }

  /**
   * Check if 2FA is required
   */
  private async requires2FA(
    userId: string,
    deviceFingerprint: DeviceFingerprint
  ): Promise<boolean> {
    // Get user security settings
    const settings = await this.getUserSecuritySettings(userId);
    if (!settings.two_factor_enabled) return false;

    // Check if device is trusted
    const isTrustedDevice = await this.isTrustedDevice(userId, deviceFingerprint);
    return !isTrustedDevice;
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(
    userId: string,
    code: string,
    method: 'sms' | 'email' | 'authenticator'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, this would verify against stored codes/TOTP
      const isValid = await this.validate2FACode(userId, code, method);
      
      if (isValid) {
        await this.logSecurityEvent({
          user_id: userId,
          event_type: 'login_attempt',
          severity: 'low',
          details: { two_factor_verified: true, method },
          ip_address: 'unknown',
          user_agent: 'unknown',
        });
        return { success: true };
      } else {
        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error: any) {
      errorTracking.captureException(error, { context: '2fa_verification' });
      return { success: false, error: 'Verification service error' };
    }
  }

  /**
   * Get user security settings
   */
  async getUserSecuritySettings(userId: string): Promise<SecuritySettings> {
    const { data, error } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return default settings
      return {
        user_id: userId,
        two_factor_enabled: false,
        biometric_enabled: false,
        login_notifications: true,
        suspicious_activity_alerts: true,
        device_tracking: true,
        session_timeout: this.SESSION_TIMEOUT,
        max_failed_attempts: this.MAX_FAILED_ATTEMPTS,
        lockout_duration: this.LOCKOUT_DURATION,
      };
    }

    return data;
  }

  /**
   * Update user security settings
   */
  async updateSecuritySettings(
    userId: string,
    settings: Partial<SecuritySettings>
  ): Promise<void> {
    const { error } = await supabase
      .from('user_security_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'suspicious_activity',
      severity: 'low',
      details: { action: 'security_settings_updated', changes: settings },
      ip_address: 'unknown',
      user_agent: 'unknown',
    });
  }

  /**
   * Check if account is locked
   */
  private async isAccountLocked(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('account_locks')
      .select('locked_until')
      .eq('email', email)
      .single();

    if (!data) return false;

    const lockedUntil = new Date(data.locked_until);
    return lockedUntil > new Date();
  }

  /**
   * Lock account
   */
  private async lockAccount(email: string): Promise<void> {
    const lockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION * 60 * 1000);

    await supabase
      .from('account_locks')
      .upsert({
        email,
        locked_until: lockedUntil.toISOString(),
        created_at: new Date().toISOString(),
      });
  }

  /**
   * Increment failed login attempts
   */
  private async incrementFailedAttempts(email: string): Promise<number> {
    const { data } = await supabase
      .from('failed_login_attempts')
      .select('attempts')
      .eq('email', email)
      .single();

    const currentAttempts = data?.attempts || 0;
    const newAttempts = currentAttempts + 1;

    await supabase
      .from('failed_login_attempts')
      .upsert({
        email,
        attempts: newAttempts,
        last_attempt: new Date().toISOString(),
      });

    return newAttempts;
  }

  /**
   * Reset failed login attempts
   */
  private async resetFailedAttempts(email: string): Promise<void> {
    await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('email', email);
  }

  /**
   * Check if device is known
   */
  private async isKnownDevice(
    userId: string,
    deviceFingerprint: DeviceFingerprint
  ): Promise<boolean> {
    const { data } = await supabase
      .from('user_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('device_id', deviceFingerprint.device_id)
      .single();

    return !!data;
  }

  /**
   * Check if device is trusted
   */
  private async isTrustedDevice(
    userId: string,
    deviceFingerprint: DeviceFingerprint
  ): Promise<boolean> {
    const { data } = await supabase
      .from('user_devices')
      .select('is_trusted')
      .eq('user_id', userId)
      .eq('device_id', deviceFingerprint.device_id)
      .single();

    return data?.is_trusted || false;
  }

  /**
   * Update device tracking
   */
  private async updateDeviceTracking(
    userId: string,
    deviceFingerprint: DeviceFingerprint,
    ipAddress: string
  ): Promise<void> {
    await supabase
      .from('user_devices')
      .upsert({
        user_id: userId,
        device_id: deviceFingerprint.device_id,
        user_agent: deviceFingerprint.user_agent,
        last_ip: ipAddress,
        last_seen: new Date().toISOString(),
        device_info: deviceFingerprint,
      });
  }

  /**
   * Check IP reputation
   */
  private async checkIPReputation(ipAddress: string): Promise<{
    is_suspicious: boolean;
    risk_score: number;
    reasons: string[];
  }> {
    // Mock implementation - in production, this would use IP reputation services
    const suspiciousIPs = ['192.168.1.100', '10.0.0.1']; // Mock suspicious IPs
    
    return {
      is_suspicious: suspiciousIPs.includes(ipAddress),
      risk_score: suspiciousIPs.includes(ipAddress) ? 80 : 10,
      reasons: suspiciousIPs.includes(ipAddress) ? ['known_malicious_ip'] : [],
    };
  }

  /**
   * Check for impossible travel
   */
  private async checkImpossibleTravel(
    userId: string,
    currentLocation: { lat: number; lng: number }
  ): Promise<boolean> {
    // Get last known location
    const { data } = await supabase
      .from('user_locations')
      .select('lat, lng, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!data) return false;

    // Calculate distance and time difference
    const distance = this.calculateDistance(
      { lat: data.lat, lng: data.lng },
      currentLocation
    );
    const timeDiff = Date.now() - new Date(data.timestamp).getTime();
    const timeDiffHours = timeDiff / (1000 * 60 * 60);

    // Check if travel is physically impossible (>1000 km/h)
    const maxSpeed = 1000; // km/h
    return distance > maxSpeed * timeDiffHours;
  }

  /**
   * Analyze behavior patterns
   */
  private async analyzeBehaviorPatterns(
    userId: string,
    context: any
  ): Promise<{ score: number; flags: string[] }> {
    // Mock behavior analysis - in production, this would use ML models
    return {
      score: Math.floor(Math.random() * 20), // Random score 0-20
      flags: [],
    };
  }

  /**
   * Validate 2FA code
   */
  private async validate2FACode(
    userId: string,
    code: string,
    method: string
  ): Promise<boolean> {
    // Mock validation - in production, this would validate against TOTP or stored codes
    return code === '123456'; // Mock valid code
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    await supabase
      .from('security_events')
      .insert({
        ...event,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Get security events for user
   */
  async getSecurityEvents(
    userId: string,
    limit: number = 50
  ): Promise<SecurityEvent[]> {
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Generate device fingerprint
   */
  generateDeviceFingerprint(): DeviceFingerprint {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    return {
      device_id: this.generateDeviceId(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      is_mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      browser_fingerprint: btoa(canvas.toDataURL()),
    };
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('wassel_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('wassel_device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Trust current device
   */
  async trustDevice(userId: string, deviceId: string): Promise<void> {
    await supabase
      .from('user_devices')
      .update({ is_trusted: true })
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'suspicious_activity',
      severity: 'low',
      details: { action: 'device_trusted', device_id: deviceId },
      ip_address: 'unknown',
      user_agent: 'unknown',
    });
  }

  /**
   * Revoke device trust
   */
  async revokeDeviceTrust(userId: string, deviceId: string): Promise<void> {
    await supabase
      .from('user_devices')
      .update({ is_trusted: false })
      .eq('user_id', userId)
      .eq('device_id', deviceId);

    await this.logSecurityEvent({
      user_id: userId,
      event_type: 'suspicious_activity',
      severity: 'medium',
      details: { action: 'device_trust_revoked', device_id: deviceId },
      ip_address: 'unknown',
      user_agent: 'unknown',
    });
  }
}

export const securityService = new SecurityService();
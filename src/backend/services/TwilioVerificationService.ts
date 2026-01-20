/**
 * Twilio Verification Service
 * Handles phone number verification with OTP
 */

import { Twilio } from 'twilio';
import { supabase } from '../supabase';

interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface VerificationCheckResult extends VerificationResult {
  valid?: boolean;
}

export class TwilioVerificationService {
  private static client: Twilio;
  private static verifyServiceSid: string;

  private static initialize() {
    if (!this.client) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || '';

      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured');
      }

      this.client = new Twilio(accountSid, authToken);
    }
  }

  /**
   * Send verification code to phone number
   */
  static async sendVerificationCode(
    phoneNumber: string,
    channel: 'sms' | 'call' = 'sms'
  ): Promise<VerificationResult> {
    try {
      this.initialize();

      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        return {
          success: false,
          error: 'Invalid phone number format. Use E.164 format: +1234567890'
        };
      }

      // Check rate limiting
      const canSend = await this.checkRateLimit(phoneNumber);
      if (!canSend) {
        return {
          success: false,
          error: 'Too many verification attempts. Please try again later.'
        };
      }

      // Send verification code
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phoneNumber,
          channel: channel
        });

      // Log verification attempt
      await this.logVerificationAttempt(phoneNumber, 'sent');

      return {
        success: true,
        message: `Verification code sent via ${channel} to ${phoneNumber}`
      };
    } catch (error: any) {
      console.error('Send verification error:', error);
      
      // Handle specific Twilio errors
      if (error.code === 60200) {
        return { success: false, error: 'Invalid phone number' };
      } else if (error.code === 60203) {
        return { success: false, error: 'Phone number blocked or invalid' };
      } else if (error.code === 60212) {
        return { success: false, error: 'Too many requests. Please try again later.' };
      }

      return {
        success: false,
        error: error.message || 'Failed to send verification code'
      };
    }
  }

  /**
   * Verify the code entered by user
   */
  static async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<VerificationCheckResult> {
    try {
      this.initialize();

      if (!code || code.length < 4) {
        return {
          success: false,
          valid: false,
          error: 'Invalid verification code'
        };
      }

      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code
        });

      const isValid = verificationCheck.status === 'approved';

      // Log verification result
      await this.logVerificationAttempt(
        phoneNumber,
        isValid ? 'verified' : 'failed'
      );

      if (isValid) {
        // Update user verification status
        await this.markPhoneAsVerified(phoneNumber);
      }

      return {
        success: true,
        valid: isValid,
        message: isValid
          ? 'Phone number verified successfully'
          : 'Invalid verification code'
      };
    } catch (error: any) {
      console.error('Verify code error:', error);

      if (error.code === 60200) {
        return { success: false, valid: false, error: 'Invalid phone number' };
      } else if (error.code === 60202) {
        return { success: false, valid: false, error: 'Max check attempts reached' };
      }

      return {
        success: false,
        valid: false,
        error: error.message || 'Failed to verify code'
      };
    }
  }

  /**
   * Resend verification code
   */
  static async resendCode(
    phoneNumber: string,
    channel: 'sms' | 'call' = 'sms'
  ): Promise<VerificationResult> {
    // Check if enough time has passed since last send (30 seconds)
    const canResend = await this.checkResendLimit(phoneNumber);
    if (!canResend) {
      return {
        success: false,
        error: 'Please wait 30 seconds before requesting a new code'
      };
    }

    return this.sendVerificationCode(phoneNumber, channel);
  }

  /**
   * Validate phone number format (E.164)
   */
  private static isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format: +[country code][number]
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Check rate limiting (max 5 attempts per hour)
   */
  private static async checkRateLimit(phoneNumber: string): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('verification_attempts')
        .select('id')
        .eq('phone_number', phoneNumber)
        .gte('created_at', oneHourAgo);

      if (error) throw error;

      return (data?.length || 0) < 5;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error to not block users
    }
  }

  /**
   * Check resend limit (30 seconds between requests)
   */
  private static async checkResendLimit(phoneNumber: string): Promise<boolean> {
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();

      const { data, error } = await supabase
        .from('verification_attempts')
        .select('id')
        .eq('phone_number', phoneNumber)
        .eq('status', 'sent')
        .gte('created_at', thirtySecondsAgo)
        .limit(1);

      if (error) throw error;

      return (data?.length || 0) === 0;
    } catch (error) {
      console.error('Resend limit check error:', error);
      return true;
    }
  }

  /**
   * Log verification attempt
   */
  private static async logVerificationAttempt(
    phoneNumber: string,
    status: 'sent' | 'verified' | 'failed'
  ): Promise<void> {
    try {
      await supabase.from('verification_attempts').insert({
        phone_number: phoneNumber,
        status,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Log verification error:', error);
    }
  }

  /**
   * Mark phone as verified in user profile
   */
  private static async markPhoneAsVerified(phoneNumber: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          phone_verified: true,
          phone_verified_at: new Date().toISOString()
        })
        .eq('phone', phoneNumber);
    } catch (error) {
      console.error('Mark phone verified error:', error);
    }
  }

  /**
   * Send SMS notification (non-verification)
   */
  static async sendSMS(
    phoneNumber: string,
    message: string
  ): Promise<VerificationResult> {
    try {
      this.initialize();

      if (!this.isValidPhoneNumber(phoneNumber)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      if (message.length > 1600) {
        return { success: false, error: 'Message too long (max 1600 characters)' };
      }

      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return {
        success: true,
        message: `SMS sent successfully (SID: ${result.sid})`
      };
    } catch (error: any) {
      console.error('Send SMS error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Get verification status
   */
  static async getVerificationStatus(
    phoneNumber: string
  ): Promise<{ verified: boolean; attempts: number }> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('phone_verified')
        .eq('phone', phoneNumber)
        .single();

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: attempts } = await supabase
        .from('verification_attempts')
        .select('id')
        .eq('phone_number', phoneNumber)
        .gte('created_at', oneHourAgo);

      return {
        verified: user?.phone_verified || false,
        attempts: attempts?.length || 0
      };
    } catch (error) {
      console.error('Get verification status error:', error);
      return { verified: false, attempts: 0 };
    }
  }
}

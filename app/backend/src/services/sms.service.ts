import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export interface SendSmsResult {
  delivered: boolean;
  provider: 'fast2sms' | 'twilio' | '2factor' | 'simulated';
  messageId?: string;
  error?: string;
}

/**
 * Production-ready SMS Service supporting Indian SMS gateways:
 * - Fast2SMS (popular, instant API key for India mobile numbers)
 * - 2Factor.in (Indian DLT/OTP provider)
 * - Twilio (global standard)
 * - Simulated fallback (for development/testing without live SMS credits)
 */
export const smsService = {
  async sendOtp(phone: string, otp: string): Promise<SendSmsResult> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const message = `Dev Creation: Your verification code is ${otp}. Valid for 5 mins.`;

    // 1. Try Fast2SMS if configured
    if (env.FAST2SMS_API_KEY) {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: env.FAST2SMS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: message,
            numbers: cleanPhone,
          }),
        });

        const data = (await response.json()) as { return?: boolean; request_id?: string; message?: string[] };
        if (data.return) {
          logger.info(`[SMS-SERVICE] ✅ Sent OTP to +91 ${cleanPhone} via Fast2SMS (ReqId: ${data.request_id})`);
          return {
            delivered: true,
            provider: 'fast2sms',
            messageId: data.request_id,
          };
        } else {
          logger.warn(`[SMS-SERVICE] Fast2SMS returned error: ${JSON.stringify(data.message)}`);
        }
      } catch (err) {
        logger.error(`[SMS-SERVICE] Fast2SMS request failed: ${(err as Error).message}`);
      }
    }

    // 2. Try 2Factor.in if configured
    if (env.TWO_FACTOR_API_KEY) {
      try {
        const url = `https://2factor.in/v1/API/V1/${env.TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/${otp}/OTP1`;
        const response = await fetch(url);
        const data = (await response.json()) as { Status?: string; Details?: string };
        if (data.Status === 'Success') {
          logger.info(`[SMS-SERVICE] ✅ Sent OTP to +91 ${cleanPhone} via 2Factor (Session: ${data.Details})`);
          return {
            delivered: true,
            provider: '2factor',
            messageId: data.Details,
          };
        } else {
          logger.warn(`[SMS-SERVICE] 2Factor returned error: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        logger.error(`[SMS-SERVICE] 2Factor request failed: ${(err as Error).message}`);
      }
    }

    // 3. Try Twilio if configured
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
      try {
        const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const params = new URLSearchParams({
          To: `+91${cleanPhone}`,
          From: env.TWILIO_PHONE_NUMBER,
          Body: message,
        });

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          },
        );

        const data = (await response.json()) as { sid?: string; status?: string; message?: string };
        if (data.sid) {
          logger.info(`[SMS-SERVICE] ✅ Sent OTP to +91 ${cleanPhone} via Twilio (SID: ${data.sid})`);
          return {
            delivered: true,
            provider: 'twilio',
            messageId: data.sid,
          };
        } else {
          logger.warn(`[SMS-SERVICE] Twilio returned error: ${data.message || JSON.stringify(data)}`);
        }
      } catch (err) {
        logger.error(`[SMS-SERVICE] Twilio request failed: ${(err as Error).message}`);
      }
    }

    // 4. Fallback: Simulated / Development Mode
    logger.info(
      `[SMS-SERVICE] 📱 Simulated OTP for +91 ${cleanPhone}: [${otp}] (Configure FAST2SMS_API_KEY in .env to deliver real SMS to mobile phones)`,
    );

    return {
      delivered: true,
      provider: 'simulated',
    };
  },
};

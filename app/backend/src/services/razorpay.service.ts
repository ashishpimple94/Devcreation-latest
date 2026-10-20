import crypto from 'crypto';
import https from 'https';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { ApiError } from '@/utils/ApiError';

export interface CreateRazorpayOrderInput {
  amount: number; // in Rupees
  receipt: string;
  currency?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
  notes: Record<string, string>;
}

export interface VerifySignatureInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const razorpayService = {
  /**
   * Creates a Razorpay Order through official Razorpay REST API.
   * Converts amount in INR to Paise (e.g. ₹599 -> 59900 paise).
   */
  async createOrder(input: CreateRazorpayOrderInput): Promise<RazorpayOrderResponse> {
    const amountInPaise = Math.round(input.amount * 100);

    const postData = JSON.stringify({
      amount: amountInPaise,
      currency: input.currency || 'INR',
      receipt: input.receipt,
      notes: input.notes || {},
    });

    const authHeader = 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.razorpay.com',
          path: '/v1/orders',
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                logger.info(`[RAZORPAY] Order created successfully: ${parsed.id} for receipt: ${input.receipt}`);
                resolve(parsed as RazorpayOrderResponse);
              } else {
                logger.error('[RAZORPAY] Order creation failed', { status: res.statusCode, body });
                reject(ApiError.badRequest(parsed.error?.description || 'Razorpay order creation failed'));
              }
            } catch (err) {
              reject(ApiError.internal('Failed to parse Razorpay API response'));
            }
          });
        },
      );

      req.on('error', (err) => {
        logger.error('[RAZORPAY] Request error', { err: err.message });
        reject(ApiError.internal(`Razorpay gateway connection error: ${err.message}`));
      });

      req.write(postData);
      req.end();
    });
  },

  /**
   * Verifies Razorpay payment signature using SHA-256 HMAC algorithm.
   */
  verifySignature(input: VerifySignatureInput): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;
    if (!isValid) {
      logger.warn('[RAZORPAY] Signature verification mismatch', {
        razorpayOrderId,
        razorpayPaymentId,
      });
    }
    return isValid;
  },

  /**
   * Fetches payment details from Razorpay to verify status.
   */
  async fetchPayment(paymentId: string): Promise<any> {
    const authHeader = 'Basic ' + Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.razorpay.com',
          path: `/v1/payments/${encodeURIComponent(paymentId)}`,
          method: 'GET',
          headers: {
            Authorization: authHeader,
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                resolve(parsed);
              } else {
                reject(ApiError.badRequest(parsed.error?.description || 'Failed to fetch payment'));
              }
            } catch (err) {
              reject(ApiError.internal('Failed to parse Razorpay payment response'));
            }
          });
        },
      );

      req.on('error', (err) => {
        reject(ApiError.internal(`Razorpay payment fetch error: ${err.message}`));
      });

      req.end();
    });
  },
};

import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Hostinger SMTP configuration with automatic port 465 -> port 587 fallback.
 * Hostinger SMTP uses:
 *   - Primary: smtp.hostinger.com:465 (SSL)
 *   - Fallback: smtp.hostinger.com:587 (TLS / STARTTLS)
 */
const host = env.SMTP_HOST || 'smtp.hostinger.com';
const user = env.SMTP_USER || 'support@devcreation24.in';
const pass = env.SMTP_PASS || 'Devcreation@890*';

function createTransportForPort(targetPort: number, isSecure: boolean): Transporter {
  return nodemailer.createTransport({
    host,
    port: targetPort,
    secure: isSecure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
    // Prevent indefinite hanging if Hostinger firewall blocks outgoing port
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

// Primary transport: Port 465 SSL
let primaryTransporter: Transporter = createTransportForPort(
  Number(env.SMTP_PORT) || 465,
  (Number(env.SMTP_PORT) || 465) === 465 ? true : Boolean(env.SMTP_SECURE),
);

// Fallback transport: Port 587 STARTTLS
let fallbackTransporter: Transporter = createTransportForPort(587, false);

/** Verifies the SMTP connection at startup. */
export async function verifyMailer(): Promise<void> {
  try {
    await primaryTransporter.verify();
    logger.info('SMTP primary transport (port 465) verified and ready');
  } catch (err1) {
    logger.warn('SMTP port 465 verification failed, testing port 587 fallback...', {
      err: (err1 as Error).message,
    });
    try {
      await fallbackTransporter.verify();
      logger.info('SMTP fallback transport (port 587) verified and ready');
    } catch (err2) {
      logger.error('SMTP verification failed on both ports 465 and 587', {
        err465: (err1 as Error).message,
        err587: (err2 as Error).message,
      });
    }
  }
}

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: string;
  portUsed?: number;
}

export function resolveFromAddress(): string {
  const configured = (env.EMAIL_FROM || '').trim();
  // Reject dummy placeholder/example domains that trigger Hostinger 450 4.1.8 Sender address rejected
  if (!configured || configured.includes('.example') || configured.includes('localhost') || !configured.includes('@')) {
    return `"Dev Creation" <${env.SMTP_USER || 'support@devcreation24.in'}>`;
  }
  return configured;
}

/** Sends an email with automatic fallback between port 465 and port 587. */
export async function sendMailWithDetails(input: SendMailInput): Promise<SendMailResult> {
  const fromAddress = resolveFromAddress();

  // Try Primary (Port 465)
  try {
    const info = await primaryTransporter.sendMail({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });
    logger.info('Email sent successfully via primary transport (465)', {
      to: input.to,
      subject: input.subject,
      messageId: info?.messageId,
    });
    return { success: true, messageId: info?.messageId, portUsed: Number(env.SMTP_PORT) || 465 };
  } catch (primaryErr: any) {
    logger.warn('Email send failed on primary port 465, attempting port 587 fallback...', {
      to: input.to,
      subject: input.subject,
      err: primaryErr?.message,
      code: primaryErr?.code,
    });

    // Try Fallback (Port 587)
    try {
      const info = await fallbackTransporter.sendMail({
        from: fromAddress,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        attachments: input.attachments,
      });
      logger.info('Email sent successfully via fallback transport (587)', {
        to: input.to,
        subject: input.subject,
        messageId: info?.messageId,
      });
      return { success: true, messageId: info?.messageId, portUsed: 587 };
    } catch (fallbackErr: any) {
      logger.error('Email send failed on both primary and fallback transports', {
        to: input.to,
        subject: input.subject,
        primaryError: primaryErr?.message,
        fallbackError: fallbackErr?.message,
      });
      return {
        success: false,
        error: `Primary (465): ${primaryErr?.message} | Fallback (587): ${fallbackErr?.message}`,
        code: fallbackErr?.code || primaryErr?.code,
      };
    }
  }
}

/** Sends an email. Resolves to true on success, false on failure. */
export async function sendMail(input: SendMailInput): Promise<boolean> {
  const res = await sendMailWithDetails(input);
  return res.success;
}

import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Email transport. When SMTP is configured a real nodemailer transport is used;
 * otherwise the app runs in "log" mode where emails are written to the logger
 * instead of being sent. This keeps order/checkout flows working in dev without
 * a mail server, and never throws on a send failure.
 */
const host = env.SMTP_HOST || 'smtp.hostinger.com';
const port = Number(env.SMTP_PORT) || 465;
const user = env.SMTP_USER || 'support@devcreation24.in';
const pass = env.SMTP_PASS || 'Devcreation@890*';
const secure = port === 465 ? true : Boolean(env.SMTP_SECURE);

let transporter: Transporter | null = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  tls: {
    rejectUnauthorized: false,
  },
});

/** Verifies the SMTP connection at startup (no-op in log mode). */
export async function verifyMailer(): Promise<void> {
  if (!transporter) {
    logger.warn('SMTP not configured — emails will be logged to the console, not sent');
    return;
  }
  try {
    await transporter.verify();
    logger.info('SMTP transport ready');
  } catch (err) {
    logger.warn('SMTP verification failed — emails may not be delivered', {
      err: (err as Error).message,
    });
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

/** Sends (or logs) an email. Resolves to true on success, false on failure. */
export async function sendMail(input: SendMailInput): Promise<boolean> {
  if (!transporter) {
    logger.info('📧 [email:log-mode]', {
      to: input.to,
      subject: input.subject,
      attachments: input.attachments?.map((a) => a.filename),
    });
    return true;
  }
  try {
    const fromAddress = env.EMAIL_FROM || '"Dev Creation" <support@devcreation24.in>';
    const info = await transporter.sendMail({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });
    logger.info('Email sent successfully', { to: input.to, subject: input.subject, messageId: info?.messageId });
    return true;
  } catch (err) {
    logger.error('Email send failed', { to: input.to, subject: input.subject, err: (err as Error).message });
    return false;
  }
}

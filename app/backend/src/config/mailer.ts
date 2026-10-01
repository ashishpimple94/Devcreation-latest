import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

/**
 * Email transport. When SMTP is configured a real nodemailer transport is used;
 * otherwise the app runs in "log" mode where emails are written to the logger
 * instead of being sent. This keeps order/checkout flows working in dev without
 * a mail server, and never throws on a send failure.
 */
const smtpConfigured = Boolean(env.SMTP_HOST);

let transporter: Transporter | null = null;

if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

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
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });
    logger.info('Email sent', { to: input.to, subject: input.subject });
    return true;
  } catch (err) {
    logger.error('Email send failed', { to: input.to, subject: input.subject, err: (err as Error).message });
    return false;
  }
}

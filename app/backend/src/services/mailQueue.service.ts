import { sendMailWithDetails, type SendMailInput, type SendMailResult } from '@/config/mailer';
import { logger } from '@/utils/logger';

export interface MailJob extends SendMailInput {
  id?: string;
  dedupKey?: string;
  maxRetries?: number;
  priority?: 'normal' | 'high';
  onSuccess?: (result: SendMailResult) => void;
  onError?: (err: Error) => void;
}

interface InternalJob extends MailJob {
  id: string;
  attempts: number;
  createdAt: number;
}

/**
 * Scalable Asynchronous In-Memory Mail Queue
 * 
 * Features:
 * - Non-blocking: API calls enqueue emails in <1ms and respond immediately.
 * - Concurrency control: Limits simultaneous SMTP connections to avoid hitting Hostinger limits.
 * - Rate limiting / pacing: Adds a controlled pause between deliveries.
 * - Exponential backoff retry on transient SMTP connection issues.
 * - In-flight deduplication: Prevents double-sending the same order email within 60s.
 */
class MailQueue {
  private queue: InternalJob[] = [];
  private activeWorkers = 0;
  private readonly maxConcurrency = 2; // Maximum concurrent SMTP connections
  private readonly paceIntervalMs = 300; // Polite delay between emails
  private readonly defaultMaxRetries = 3;
  private dedupSet = new Map<string, number>(); // dedupKey -> timestamp
  private totalProcessed = 0;
  private totalFailed = 0;

  constructor() {
    // Periodically clean up deduplication cache (older than 2 minutes)
    setInterval(() => {
      const now = Date.now();
      for (const [key, ts] of this.dedupSet.entries()) {
        if (now - ts > 120_000) {
          this.dedupSet.delete(key);
        }
      }
    }, 60_000).unref();
  }

  /**
   * Enqueues an email for asynchronous delivery.
   * Returns immediately with the generated job ID.
   */
  public enqueue(job: MailJob): string {
    const id = job.id || `mail_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Check deduplication
    if (job.dedupKey) {
      const lastSent = this.dedupSet.get(job.dedupKey);
      if (lastSent && Date.now() - lastSent < 60_000) {
        logger.warn(`[MAIL-QUEUE] ⏩ Deduplicating email with key "${job.dedupKey}" (already sent within 60s)`);
        return id;
      }
      this.dedupSet.set(job.dedupKey, Date.now());
    }

    const internalJob: InternalJob = {
      ...job,
      id,
      attempts: 0,
      createdAt: Date.now(),
      maxRetries: job.maxRetries ?? this.defaultMaxRetries,
    };

    if (job.priority === 'high') {
      this.queue.unshift(internalJob);
    } else {
      this.queue.push(internalJob);
    }

    logger.debug(`[MAIL-QUEUE] 📥 Enqueued job ${id}: "${job.subject}" to <${job.to}> (Queue depth: ${this.queue.length})`);

    // Kick off worker if under concurrency limit
    this.scheduleNext();

    return id;
  }

  /**
   * Spawns worker loops while there are queued jobs and capacity.
   */
  private scheduleNext(): void {
    while (this.activeWorkers < this.maxConcurrency && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;
      this.activeWorkers++;
      this.processJob(job);
    }
  }

  /**
   * Processes an individual email job with pacing and retry logic.
   */
  private async processJob(job: InternalJob): Promise<void> {
    const startTime = Date.now();
    job.attempts++;

    try {
      logger.info(`[MAIL-QUEUE] 🚀 Sending [Job ${job.id}] (Attempt ${job.attempts}/${job.maxRetries}): "${job.subject}" to <${job.to}>`);

      const result = await sendMailWithDetails({
        to: job.to,
        subject: job.subject,
        html: job.html,
        text: job.text,
        attachments: job.attachments,
      });

      if (!result.success) {
        throw new Error(result.error || 'SMTP delivery returned unsuccessful');
      }

      const elapsed = Date.now() - startTime;
      this.totalProcessed++;
      logger.info(`[MAIL-QUEUE] ✅ Delivered [Job ${job.id}] in ${elapsed}ms (Port: ${result.portUsed}, MsgId: ${result.messageId || 'ok'})`);

      try {
        job.onSuccess?.(result);
      } catch (err) {
        logger.warn(`[MAIL-QUEUE] onSuccess callback error: ${(err as Error).message}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      logger.warn(`[MAIL-QUEUE] ⚠️ Delivery failed for [Job ${job.id}] (Attempt ${job.attempts}/${job.maxRetries}): ${errorMsg}`);

      if (job.attempts < (job.maxRetries || this.defaultMaxRetries)) {
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, job.attempts) * 1000;
        logger.info(`[MAIL-QUEUE] ⏳ Scheduling retry for [Job ${job.id}] in ${delay}ms`);

        setTimeout(() => {
          this.queue.unshift(job);
          this.scheduleNext();
        }, delay);
      } else {
        this.totalFailed++;
        logger.error(`[MAIL-QUEUE] ❌ Permanently failed [Job ${job.id}] after ${job.attempts} attempts: ${errorMsg}`);
        try {
          job.onError?.(err instanceof Error ? err : new Error(errorMsg));
        } catch {}
      }
    } finally {
      // Small pause between emails to prevent SMTP flood
      setTimeout(() => {
        this.activeWorkers--;
        this.scheduleNext();
      }, this.paceIntervalMs);
    }
  }

  /** Returns queue health & statistics */
  public getStats() {
    return {
      queueLength: this.queue.length,
      activeWorkers: this.activeWorkers,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
    };
  }
}

export const mailQueue = new MailQueue();

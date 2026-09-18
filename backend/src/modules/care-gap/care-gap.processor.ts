import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CareGapService } from './care-gap.service';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CareGapJobPayload {
  tenantId: string;
  patientId?: string;
  triggerSource: string;
}

@Injectable()
export class CareGapProcessor {
  private readonly logger = new Logger(CareGapProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly careGapService: CareGapService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledGapScan() {
    this.logger.log('[Cron] Starting scheduled daily care gap scan...');
    const tenants = await this.prisma.tenant.findMany({ where: { status: 'ACTIVE' }, select: { id: true } });
    for (const tenant of tenants) {
      await this.processCohortScan({ tenantId: tenant.id, triggerSource: 'DAILY_CRON' });
    }
    this.logger.log('[Cron] Scheduled daily care gap scan complete.');
  }

  /**
   * Enqueue or schedule asynchronous cohort scan
   */
  async enqueueCohortScan(tenantId: string): Promise<{ jobId: string; status: string }> {
    const jobId = `job_gap_scan_${tenantId}_${Date.now()}`;
    this.logger.log(`[BullMQ Worker] Enqueued asynchronous cohort care gap scan for tenant ${tenantId} (Job: ${jobId})`);

    // Process asynchronously in background without blocking caller
    setImmediate(async () => {
      await this.processCohortScan({ tenantId, triggerSource: 'ASYNC_SCHEDULE' });
    });

    return { jobId, status: 'QUEUED' };
  }

  /**
   * Background processor worker for patient cohort scan
   */
  async processCohortScan(payload: CareGapJobPayload): Promise<void> {
    if (this.isProcessing) {
      this.logger.warn(`Cohort scan already in progress for tenant ${payload.tenantId}, skipping overlapping cycle.`);
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();
    this.logger.log(`[BullMQ Worker] Starting background care gap evaluation for tenant ${payload.tenantId}`);

    try {
      const gaps = await this.careGapService.detectGaps(payload.tenantId);
      this.logger.log(`[BullMQ Worker] Detected ${gaps.length} care gaps for tenant ${payload.tenantId}. Generating follow-up tasks...`);

      // Automatically generate prioritized follow-up tasks with explainable reasons
      await this.careGapService.autoGenerateTasks(payload.tenantId, gaps);

      const elapsed = Date.now() - startTime;
      this.logger.log(`[BullMQ Worker] Care gap evaluation completed in ${elapsed}ms for tenant ${payload.tenantId}`);
    } catch (err: any) {
      this.logger.error(`[BullMQ Worker] Error during care gap evaluation: ${err.message}`, err.stack);
    } finally {
      this.isProcessing = false;
    }
  }
}

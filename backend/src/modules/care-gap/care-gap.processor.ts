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

      // Batch convert high-priority gaps into follow-up tasks
      for (const gap of gaps) {
        if (!gap.patientId) continue;

        const existingTask = await this.prisma.followUpTask.findFirst({
          where: {
            tenantId: payload.tenantId,
            patientId: gap.patientId,
            taskType: gap.ruleType || 'CARE_GAP',
            status: { in: ['OPEN', 'IN_PROGRESS'] as any[] },
          },
        });

        if (!existingTask) {
          await this.prisma.followUpTask.create({
            data: {
              tenantId: payload.tenantId,
              patientId: gap.patientId,
              taskType: gap.ruleType || 'CARE_GAP',
              priority: gap.priorityWeight && gap.priorityWeight >= 80 ? ('URGENT' as any) : ('HIGH' as any),
              issueDescription: gap.description || 'Automated care gap flagged by oncology protocol engine.',
              dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Due in 48h
              status: 'OPEN' as any,
            },
          });
        }
      }

      const elapsed = Date.now() - startTime;
      this.logger.log(`[BullMQ Worker] Care gap evaluation completed in ${elapsed}ms for tenant ${payload.tenantId}`);
    } catch (err: any) {
      this.logger.error(`[BullMQ Worker] Error during care gap evaluation: ${err.message}`, err.stack);
    } finally {
      this.isProcessing = false;
    }
  }
}

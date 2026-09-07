import { CareGapService } from './care-gap.service';
import { CareGapRuleType } from './dto/create-rule.dto';

describe('CareGapService', () => {
  let service: CareGapService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      careGapRule: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      appointment: {
        findMany: jest.fn(),
      },
      followUpTask: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    service = new CareGapService(mockPrisma);
  });

  describe('detectGaps', () => {
    it('should detect missed appointment care gaps and sort by priority score descending', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          ruleType: CareGapRuleType.MISSED_APPOINTMENT,
          priorityWeight: 80,
          conditions: { lookbackDays: 7 },
        },
      ];
      mockPrisma.careGapRule.findMany.mockResolvedValue(mockRules);

      const mockMissedAppts = [
        {
          id: 'appt-1',
          patientId: 'patient-1',
          patient: { name: 'Patient One', mrn: 'MRN-001' },
          status: 'NO_SHOW',
        },
      ];
      mockPrisma.appointment.findMany.mockResolvedValue(mockMissedAppts);

      const gaps = await service.detectGaps('tenant-test');

      expect(gaps).toHaveLength(1);
      expect(gaps[0].patientId).toBe('patient-1');
      expect(gaps[0].gapType).toBe(CareGapRuleType.MISSED_APPOINTMENT);
      expect(gaps[0].priorityScore).toBe(80);
      expect(gaps[0].actionableInfo.appointmentId).toBe('appt-1');
    });
  });

  describe('autoGenerateTasks', () => {
    it('should not duplicate tasks if an open task already exists for the patient', async () => {
      mockPrisma.followUpTask.findFirst.mockResolvedValue({
        id: 'existing-task-1',
        patientId: 'patient-1',
        status: 'OPEN',
      });

      const gaps = [
        { patientId: 'patient-1', description: 'Missed appointment detected' },
      ];

      const tasks = await service.autoGenerateTasks('tenant-test', gaps);

      expect(tasks).toHaveLength(0);
      expect(mockPrisma.followUpTask.create).not.toHaveBeenCalled();
    });

    it('should create high-priority follow-up task if no open task exists', async () => {
      mockPrisma.followUpTask.findFirst.mockResolvedValue(null);
      mockPrisma.followUpTask.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'new-task', ...data }));

      const gaps = [
        { patientId: 'patient-2', description: 'Missed Chemo Session' },
      ];

      const tasks = await service.autoGenerateTasks('tenant-test', gaps);

      expect(tasks).toHaveLength(1);
      expect(mockPrisma.followUpTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-test',
            patientId: 'patient-2',
            taskType: 'CARE_GAP_FOLLOW_UP',
            priority: 'HIGH',
          }),
        }),
      );
    });
  });
});

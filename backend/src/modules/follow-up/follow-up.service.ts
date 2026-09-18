import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto, TaskPriority } from './dto/create-task.dto';
import { UpdateTaskDto, TaskStatus } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { BarrierStatus, PatientFollowUpStage, EventType, EventStatus } from '@prisma/client';

export interface TaskHandoffDto {
  toUserId?: string;
  toRole: string;
  reason: string;
  notes?: string;
}

export interface RecoverAppointmentDto {
  newAppointmentDate: string | Date;
  departmentId?: string;
  doctorId?: string;
  notes?: string;
  barrierIdToResolve?: string;
}

@Injectable()
export class FollowUpService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateTaskDto) {
    return this.prisma.followUpTask.create({
      data: {
        ...dto,
        tenantId,
        status: TaskStatus.OPEN,
        escalationLevel: 0,
      } as any,
    });
  }

  async findAll(tenantId: string, filterDto: TaskFilterDto) {
    const { page = 1, limit = 10, patientId, assignedToId, status, priority, taskType, dueDateFrom, dueDateTo, overdue } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (assignedToId) where.assignedToId = assignedToId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (taskType) where.taskType = taskType;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }
    
    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] };
    }

    const [items, total] = await Promise.all([
      this.prisma.followUpTask.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mrn: true,
              followUpStage: true,
              careCoordinatorId: true,
              phone: true,
              careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1 },
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userRoles: { select: { role: { select: { name: true } } } },
            },
          },
          barriers: true,
          handoffs: { orderBy: { handoffDate: 'desc' } },
        } as any,
        orderBy: [{ priorityScore: 'desc' }, { dueDate: 'asc' }],
      }),
      this.prisma.followUpTask.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const task = await this.prisma.followUpTask.findFirst({
      where: { id, tenantId } as any,
      include: {
        outreachLogs: { orderBy: { contactDate: 'desc' } },
        patient: {
          include: {
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1 },
          },
        },
        assignedTo: {
          include: {
            userRoles: { include: { role: true } },
          },
        },
        barriers: true,
        handoffs: { orderBy: { handoffDate: 'desc' } },
      } as any,
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateTaskDto) {
    const data: any = { ...dto };
    if (dto.status === TaskStatus.RESOLVED) {
      data.resolvedAt = new Date();
      data.resolvedById = userId;
    }
    return this.prisma.followUpTask.update({
      where: { id, tenantId } as any,
      data,
    });
  }

  async assign(tenantId: string, id: string, userId: string) {
    return this.prisma.followUpTask.update({
      where: { id, tenantId } as any,
      data: { assignedToId: userId } as any,
    });
  }

  async escalate(tenantId: string, id: string) {
    const task = await this.findById(tenantId, id);
    let nextPriority = TaskPriority.LOW;
    const currentPriority = (task as any).priority;
    if (currentPriority === TaskPriority.LOW) nextPriority = TaskPriority.MEDIUM;
    else if (currentPriority === TaskPriority.MEDIUM) nextPriority = TaskPriority.HIGH;
    else if (currentPriority === TaskPriority.HIGH) nextPriority = TaskPriority.URGENT;
    else nextPriority = TaskPriority.URGENT;

    return this.prisma.followUpTask.update({
      where: { id, tenantId } as any,
      data: {
        priority: nextPriority,
        priorityScore: Math.min(100, ((task as any).priorityScore || 50) + 20),
        escalationLevel: { increment: 1 },
        lastAction: 'Task escalated to higher clinical priority',
      } as any,
    });
  }

  async getMyTasks(tenantId: string, userId: string) {
    return this.prisma.followUpTask.findMany({
      where: { tenantId, assignedToId: userId, status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } } as any,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            followUpStage: true,
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1 },
          },
        },
        barriers: true,
      },
      orderBy: [{ priorityScore: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async getOverdueTasks(tenantId: string) {
    return this.prisma.followUpTask.findMany({
      where: {
        tenantId,
        dueDate: { lt: new Date() },
        status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
      } as any,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            mrn: true,
            followUpStage: true,
            careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1 },
          },
        },
        barriers: true,
      },
      orderBy: [{ priorityScore: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async getDashboardStats(tenantId: string, userId?: string) {
    const whereBase: any = { tenantId };
    if (userId) whereBase.assignedToId = userId;
    
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [open, inProgress, overdue, resolvedToday, totalThisWeek] = await Promise.all([
      this.prisma.followUpTask.count({ where: { ...whereBase, status: TaskStatus.OPEN } as any }),
      this.prisma.followUpTask.count({ where: { ...whereBase, status: TaskStatus.IN_PROGRESS } as any }),
      this.prisma.followUpTask.count({ where: { ...whereBase, dueDate: { lt: new Date() }, status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } } as any }),
      this.prisma.followUpTask.count({ where: { ...whereBase, status: TaskStatus.RESOLVED, resolvedAt: { gte: startOfToday } } as any }),
      this.prisma.followUpTask.count({ where: { ...whereBase, createdAt: { gte: startOfWeek } } as any }),
    ]);

    return { open, inProgress, overdue, resolvedToday, totalThisWeek };
  }

  async getCommandCenter(tenantId: string) {
    const now = new Date();
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date().setHours(23, 59, 59, 999));

    const [
      totalRequiringAttention,
      criticalCount,
      overdueCount,
      dueTodayCount,
      missedApptsCount,
      noFutureApptCount,
      stalledOutreachCount,
      escalatedCount,
      recoveredCount,
      tasks,
    ] = await Promise.all([
      this.prisma.followUpTask.count({
        where: { tenantId, status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          OR: [{ priority: TaskPriority.URGENT }, { priorityScore: { gte: 70 } }],
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          dueDate: { lt: now },
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          dueDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          careGapType: 'MISSED_APPOINTMENT',
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          careGapType: 'NO_FUTURE_APPOINTMENT',
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          careGapType: 'STALLED_OUTREACH',
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
          escalationLevel: { gt: 0 },
        },
      }),
      this.prisma.followUpTask.count({
        where: {
          tenantId,
          status: TaskStatus.RESOLVED,
          lastAction: { contains: 'Appointment recovered' },
        },
      }),
      this.prisma.followUpTask.findMany({
        where: { tenantId, status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mrn: true,
              followUpStage: true,
              careCoordinatorId: true,
              phone: true,
              careJourneys: { select: { diagnosisCategory: true, careStage: true }, take: 1 },
            },
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userRoles: { select: { role: { select: { name: true } } } },
            },
          },
          barriers: {
            orderBy: { createdAt: 'desc' },
          },
          handoffs: {
            orderBy: { handoffDate: 'desc' },
          },
          outreachLogs: {
            take: 3,
            orderBy: { contactDate: 'desc' },
          },
        },
        orderBy: [{ priorityScore: 'desc' }, { dueDate: 'asc' }],
        take: 100,
      }),
    ]);

    return {
      metrics: {
        totalRequiringAttention,
        criticalCount,
        overdueCount,
        dueTodayCount,
        missedApptsCount,
        noFutureApptCount,
        stalledOutreachCount,
        escalatedCount,
        recoveredCount,
      },
      tasks,
    };
  }

  async handoff(tenantId: string, id: string, fromUserId: string, dto: TaskHandoffDto) {
    const task = await this.findById(tenantId, id);
    const fromUser = await this.prisma.user.findUnique({
      where: { id: fromUserId },
      include: { userRoles: { include: { role: true } } },
    });
    const fromRole = fromUser?.userRoles?.[0]?.role?.name || 'CARE_COORDINATOR';

    let toUserId = dto.toUserId;
    if (!toUserId) {
      const candidate = await this.prisma.user.findFirst({
        where: {
          tenantId,
          status: 'ACTIVE',
          userRoles: { some: { role: { name: { contains: dto.toRole, mode: 'insensitive' } } } },
        },
      });
      toUserId = candidate?.id || fromUserId;
    }

    const handoff = await this.prisma.taskHandoff.create({
      data: {
        tenantId,
        taskId: id,
        fromUserId,
        toUserId: toUserId!,
        fromRole,
        toRole: dto.toRole,
        reason: dto.reason,
        notes: dto.notes || null,
      },
    });

    const isEscalation = ['DOCTOR', 'HOD', 'CHIEF_ONCOLOGIST'].includes(dto.toRole.toUpperCase());

    const updatedTask = await this.prisma.followUpTask.update({
      where: { id },
      data: {
        assignedToId: toUserId,
        lastAction: 'Handoff to ' + dto.toRole + ': ' + dto.reason,
        nextAction: dto.notes || 'Review clinical notes and follow up with patient',
        ...(isEscalation && {
          escalationLevel: { increment: 1 },
          priority: TaskPriority.URGENT,
          priorityScore: Math.min(100, ((task as any).priorityScore || 60) + 15),
        }),
      },
      include: {
        patient: true,
        assignedTo: true,
        handoffs: { orderBy: { handoffDate: 'desc' } },
        barriers: true,
      },
    });

    return { handoff, task: updatedTask };
  }

  async recoverAppointment(tenantId: string, id: string, userId: string, dto: RecoverAppointmentDto) {
    const task = await this.findById(tenantId, id);
    const scheduledAt = new Date(dto.newAppointmentDate);

    // Ensure doctor and department exist and are valid UUIDs
    const isUuid = (val?: string) => val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    let doctorId = dto.doctorId;
    let departmentId = dto.departmentId;

    if (!isUuid(doctorId)) {
      const journey = await this.prisma.careJourney.findFirst({
        where: { tenantId, patientId: task.patientId },
      });
      if (journey && isUuid(journey.primaryDoctorId)) {
        doctorId = journey.primaryDoctorId;
      } else {
        const defaultDoc = await this.prisma.user.findFirst({
          where: { tenantId, status: 'ACTIVE' },
        });
        doctorId = defaultDoc?.id || userId;
      }
    }

    if (!isUuid(departmentId)) {
      const dept = await this.prisma.department.findFirst({ where: { tenantId } });
      if (dept) {
        departmentId = dept.id;
      } else {
        let hospital = await this.prisma.hospital.findFirst({ where: { tenantId } });
        if (!hospital) {
          hospital = await this.prisma.hospital.create({
            data: {
              tenantId,
              name: 'CancerCare Comprehensive Institute',
              code: 'CCCI',
              
              
              
            },
          });
        }
        const newDept = await this.prisma.department.create({
          data: {
            tenantId,
            hospitalId: hospital.id,
            name: typeof dto.departmentId === 'string' && dto.departmentId.length > 0 ? dto.departmentId : 'Medical Oncology',
            type: 'CLINICAL',
          },
        });
        departmentId = newDept.id;
      }
    }

    // 1. Create recovered appointment
    const newAppointment = await this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: task.patientId,
        doctorId: doctorId!,
        departmentId: departmentId!,
        appointmentType: 'RECOVERY_FOLLOW_UP',
        scheduledAt,
        durationMinutes: 30,
        status: 'SCHEDULED',
        createdById: userId,
        notes: 'Recovered follow-up appointment: ' + (dto.notes || 'Care gap resolution'),
      },
    });

    // 2. Resolve the follow-up task
    const resolvedTask = await this.prisma.followUpTask.update({
      where: { id },
      data: {
        status: TaskStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedById: userId,
        lastAction: 'Appointment recovered for ' + scheduledAt.toLocaleDateString(),
        nextAction: 'Send appointment confirmation reminder & prep clinical charts',
      },
    });

    // 3. Resolve barrier if specified
    if (dto.barrierIdToResolve) {
      await this.prisma.patientBarrier.update({
        where: { id: dto.barrierIdToResolve },
        data: {
          status: BarrierStatus.RESOLVED,
          resolvedAt: new Date(),
          interventionNotes: 'Resolved via appointment recovery on ' + scheduledAt.toLocaleDateString(),
        },
      });
    }

    // 4. Update patient followUpStage to RE_ENGAGED
    await this.prisma.patient.update({
      where: { id: task.patientId },
      data: {
        followUpStage: PatientFollowUpStage.RE_ENGAGED,
        reEngagedAt: new Date(),
        reEngagementNotes: 'Re-engaged: Follow-up booked for ' + scheduledAt.toLocaleDateString(),
      },
    });

    // 5. Create journey event for audit if journey exists
    const journey = await this.prisma.careJourney.findFirst({
      where: { tenantId, patientId: task.patientId },
    });
    if (journey) {
      await this.prisma.journeyEvent.create({
        data: {
          tenantId,
          patientId: task.patientId,
          journeyId: journey.id,
          eventDate: new Date(),
          eventType: EventType.FOLLOW_UP,
          status: EventStatus.COMPLETED,
          createdById: userId,
          notes: 'Care coordinator recovered appointment scheduled for ' + scheduledAt.toLocaleDateString() + '. ' + (dto.notes || ''),
        },
      });
    }

    return {
      appointment: newAppointment,
      task: resolvedTask,
      message: 'Patient successfully recovered and re-engaged.',
    };
  }
}

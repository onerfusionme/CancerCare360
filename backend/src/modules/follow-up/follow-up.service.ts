import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTaskDto, TaskPriority } from './dto/create-task.dto';
import { UpdateTaskDto, TaskStatus } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

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
          patient: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        } as any,
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
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
        outreachLogs: true,
        patient: true,
        assignedTo: true,
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
         escalationLevel: { increment: 1 },
      } as any,
    });
  }

  async getMyTasks(tenantId: string, userId: string) {
     return this.prisma.followUpTask.findMany({
        where: { tenantId, assignedToId: userId, status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } } as any,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
     });
  }

  async getOverdueTasks(tenantId: string) {
     return this.prisma.followUpTask.findMany({
        where: {
           tenantId,
           dueDate: { lt: new Date() },
           status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] },
        } as any,
        orderBy: [{ dueDate: 'asc' }],
     });
  }

  async getDashboardStats(tenantId: string, userId?: string) {
     const whereBase: any = { tenantId };
     if (userId) whereBase.assignedToId = userId;
     
     const now = new Date();
     const startOfToday = new Date(now.setHours(0,0,0,0));
     
     const startOfWeek = new Date(now);
     startOfWeek.setDate(now.getDate() - now.getDay());
     startOfWeek.setHours(0,0,0,0);

     const [open, inProgress, overdue, resolvedToday, totalThisWeek] = await Promise.all([
        this.prisma.followUpTask.count({ where: { ...whereBase, status: TaskStatus.OPEN } as any }),
        this.prisma.followUpTask.count({ where: { ...whereBase, status: TaskStatus.IN_PROGRESS } as any }),
        this.prisma.followUpTask.count({ where: { ...whereBase, dueDate: { lt: new Date() }, status: { in: [TaskStatus.OPEN, TaskStatus.IN_PROGRESS] } } as any }),
        this.prisma.followUpTask.count({ where: { ...whereBase, status: TaskStatus.RESOLVED, resolvedAt: { gte: startOfToday } } as any }),
        this.prisma.followUpTask.count({ where: { ...whereBase, createdAt: { gte: startOfWeek } } as any }),
     ]);

     return { open, inProgress, overdue, resolvedToday, totalThisWeek };
  }
}

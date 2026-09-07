import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto, AppointmentStatus } from './dto/update-appointment.dto';
import { AppointmentFilterDto } from './dto/appointment-filter.dto';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateAppointmentDto) {
    const start = new Date(dto.scheduledAt);
    const end = new Date(start.getTime() + (dto.durationMinutes || 30) * 60000);

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        doctorId: dto.doctorId,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        scheduledAt: { lte: end, gte: new Date(start.getTime() - 120 * 60000) }, // Roughly checking near appointments, exact overlap check would require queryRaw. I will just do simple check as instructed.
      } as any,
    });

    if (conflict) {
      // Note: Full overlap check should be handled at DB level with duration, for now simplifying based on request.
      throw new BadRequestException('Doctor is already booked for this time slot');
    }

    return this.prisma.appointment.create({
      data: {
        tenantId,
        patientId: dto.patientId,
        journeyId: dto.journeyId,
        doctorId: dto.doctorId,
        departmentId: dto.departmentId,
        appointmentType: dto.appointmentType,
        scheduledAt: start,
        durationMinutes: dto.durationMinutes || 30,
        notes: dto.notes,
        status: AppointmentStatus.SCHEDULED,
        createdById: userId,
      } as any,
    });
  }

  async findAll(tenantId: string, filterDto: AppointmentFilterDto) {
    const { page = 1, limit = 10, patientId, doctorId, departmentId, status, dateFrom, dateTo, appointmentType } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;
    if (appointmentType) where.appointmentType = appointmentType;
    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) where.scheduledAt.gte = new Date(dateFrom);
      if (dateTo) where.scheduledAt.lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
          doctor: { select: { id: true, firstName: true, lastName: true } },
          department: { select: { id: true, name: true } },
        } as any,
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.appointment.count({ where }),
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
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, tenantId } as any,
      include: {
        patient: true,
        doctor: true,
        department: true,
        journey: true,
      } as any,
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(tenantId: string, id: string, dto: UpdateAppointmentDto) {
    const current = await this.findById(tenantId, id);
    const data: any = { ...dto };
    
    if (dto.status === AppointmentStatus.IN_PROGRESS && current.status !== AppointmentStatus.IN_PROGRESS) {
        if (!data.consultationStartAt) data.consultationStartAt = new Date();
        const checkInTime = data.checkInAt ? new Date(data.checkInAt) : (current as any).checkInAt;
        if (checkInTime) {
            data.waitingDurationMinutes = Math.floor((new Date(data.consultationStartAt).getTime() - checkInTime.getTime()) / 60000);
        }
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async checkIn(tenantId: string, id: string) {
    return this.prisma.appointment.update({
      where: { id, tenantId } as any,
      data: {
        status: AppointmentStatus.CHECKED_IN,
        checkInAt: new Date(),
      } as any,
    });
  }

  async startConsultation(tenantId: string, id: string) {
    const current = await this.findById(tenantId, id);
    const startAt = new Date();
    let waitingDurationMinutes = null;

    if ((current as any).checkInAt) {
      waitingDurationMinutes = Math.floor((startAt.getTime() - (current as any).checkInAt.getTime()) / 60000);
    }

    return this.prisma.appointment.update({
      where: { id, tenantId } as any,
      data: {
        status: AppointmentStatus.IN_PROGRESS,
        consultationStartAt: startAt,
        waitingDurationMinutes,
      } as any,
    });
  }

  async completeConsultation(tenantId: string, id: string) {
    return this.prisma.appointment.update({
      where: { id, tenantId } as any,
      data: {
        status: AppointmentStatus.COMPLETED,
        consultationEndAt: new Date(),
      } as any,
    });
  }

  async cancel(tenantId: string, id: string, reason: string) {
    return this.prisma.appointment.update({
      where: { id, tenantId } as any,
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
      } as any,
    });
  }

  async markNoShow(tenantId: string, id: string) {
    return this.prisma.appointment.update({
      where: { id, tenantId } as any,
      data: {
        status: AppointmentStatus.NO_SHOW,
      } as any,
    });
  }

  async getTodaysAppointments(tenantId: string, doctorId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId,
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      } as any,
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
      } as any,
    });
  }

  async getAvailableSlots(tenantId: string, doctorId: string, date: string) {
    const queryDate = new Date(date);
    const dayOfWeek = queryDate.getDay();

    const schedules = await this.prisma.doctorSchedule.findMany({
      where: {
        tenantId,
        doctorId,
        dayOfWeek,
        isActive: true,
        effectiveFrom: { lte: queryDate },
      } as any,
    });

    // filter by effectiveTo if exists
    const validSchedules = schedules.filter(s => !(s as any).effectiveTo || (s as any).effectiveTo >= queryDate);

    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId,
        status: { notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW] },
        scheduledAt: { gte: startOfDay, lte: endOfDay },
      } as any,
    });

    const slots = [];
    for (const schedule of validSchedules) {
      const [startHour, startMin] = (schedule as any).startTime.split(':').map(Number);
      const [endHour, endMin] = (schedule as any).endTime.split(':').map(Number);
      
      let currentSlot = new Date(queryDate);
      currentSlot.setHours(startHour, startMin, 0, 0);
      
      const endTime = new Date(queryDate);
      endTime.setHours(endHour, endMin, 0, 0);
      
      const slotDuration = (schedule as any).slotDurationMinutes || 15;

      while (currentSlot.getTime() + slotDuration * 60000 <= endTime.getTime()) {
        const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
        
        // check conflict
        const isBooked = bookedAppointments.some(appt => {
           const apptStart = new Date((appt as any).scheduledAt);
           const apptEnd = new Date((appt as any).scheduledEndAt || apptStart.getTime() + (appt as any).durationMinutes * 60000);
           return (currentSlot < apptEnd && slotEnd > apptStart);
        });

        if (!isBooked) {
           slots.push({
             start: new Date(currentSlot),
             end: new Date(slotEnd),
           });
        }
        
        currentSlot = slotEnd;
      }
    }

    return slots;
  }

  async calculateNoShowRisk(tenantId: string, patientId: string): Promise<{ riskScore: number; riskLevel: string; factors: string[] }> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const history = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        patientId,
        scheduledAt: { gte: oneYearAgo, lte: new Date() }
      } as any,
      orderBy: { scheduledAt: 'desc' }
    });

    if (history.length === 0) {
      return { riskScore: 0, riskLevel: 'LOW', factors: ['No appointment history in last 12 months'] };
    }

    let noShowCount = 0;
    let cancelCount = 0;
    let recentStreak = 0;
    let streakActive = true;
    let lastCompletedDate: Date | null = null;

    for (const appt of history) {
      const status = (appt as any).status;
      if (status === 'NO_SHOW') {
        noShowCount++;
        if (streakActive) recentStreak++;
      } else if (status === 'CANCELLED') {
        cancelCount++;
        streakActive = false;
      } else if (status === 'COMPLETED') {
        if (!lastCompletedDate) lastCompletedDate = (appt as any).scheduledAt;
        streakActive = false;
      } else {
        streakActive = false;
      }
    }

    const total = history.length;
    const noShowRatio = noShowCount / total;
    const cancellationRatio = cancelCount / total;

    let daysSinceLastVisit = 0;
    if (lastCompletedDate) {
      daysSinceLastVisit = Math.floor((new Date().getTime() - lastCompletedDate.getTime()) / (1000 * 3600 * 24));
    } else {
      daysSinceLastVisit = 365;
    }

    const score1 = Math.min(noShowRatio * 100 * 0.4, 40);
    const score2 = Math.min(cancellationRatio * 100 * 0.2, 20);
    const score3 = Math.min((daysSinceLastVisit / 365) * 20, 20);
    const score4 = Math.min(recentStreak * 10, 20);

    const riskScore = Math.round(score1 + score2 + score3 + score4);
    
    let riskLevel = 'LOW';
    if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    const factors = [];
    if (noShowRatio > 0.2) factors.push(`High no-show rate (${Math.round(noShowRatio * 100)}%)`);
    if (cancellationRatio > 0.3) factors.push(`High cancellation rate (${Math.round(cancellationRatio * 100)}%)`);
    if (daysSinceLastVisit > 180) factors.push(`Over 6 months since last completed visit`);
    if (recentStreak > 0) factors.push(`${recentStreak} consecutive recent no-shows`);

    return { riskScore, riskLevel, factors };
  }

  async getHighRiskAppointments(tenantId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    if (!date) targetDate.setDate(targetDate.getDate() + 1); // default tomorrow
    
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        scheduledAt: { gte: start, lte: end },
        status: 'SCHEDULED'
      } as any,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, mrn: true, phone: true } }
      } as any
    });

    const risks = await Promise.all(
      appointments.map(async (appt) => {
        const risk = await this.calculateNoShowRisk(tenantId, (appt as any).patientId);
        return {
          appointment: appt,
          ...risk
        };
      })
    );

    return risks.sort((a, b) => b.riskScore - a.riskScore);
  }
}

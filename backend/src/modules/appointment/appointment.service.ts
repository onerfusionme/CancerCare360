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
        scheduledAt: { lt: end },
        scheduledEndAt: { gt: start },
      } as any,
    });

    if (conflict) {
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
        scheduledEndAt: end, // Assuming there is a scheduledEndAt based on logic
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
          patient: { select: { id: true, name: true, mrn: true } },
          doctor: { select: { id: true, name: true } },
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
        patient: { select: { id: true, name: true, mrn: true } },
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
}

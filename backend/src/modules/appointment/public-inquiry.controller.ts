import { Controller, Post, Body, Get, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AppointmentStatus, Gender, PatientStatus } from '@prisma/client';

import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class PublicInquiryDto {
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsString()
  @IsOptional()
  preferredDate?: string;

  @IsString()
  @IsOptional()
  visitType?: string; // 'IN_PERSON' | 'TELE_CONSULT' | 'SECOND_OPINION'

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  symptoms?: string[];
}

@ApiTags('Public Website Inquiries')
@Controller('public')
export class PublicInquiryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('doctors')
  @ApiOperation({ summary: 'Get public directory of oncology doctors' })
  async getPublicDoctors() {
    const doctors = await this.prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        department: { isNot: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      data: doctors.map((d) => ({
        id: d.id,
        name: `Dr. ${d.firstName} ${d.lastName}`,
        department: d.department?.name || 'Oncology',
        designation: d.department?.name === 'Medical Oncology' ? 'Senior Medical Oncologist' : (d.department?.name === 'Surgical Oncology' ? 'Lead Surgical Oncologist' : 'Chief Radiation Oncologist'),
        experience: '15+ Years Clinical Experience',
        opdHours: 'Mon - Fri: 10:00 AM - 04:00 PM',
      })),
    };
  }

  @Post('inquiries')
  @ApiOperation({ summary: 'Submit public consultation or second opinion inquiry' })
  async submitInquiry(@Body() dto: PublicInquiryDto) {
    if (!dto.patientName || !dto.phone) {
      throw new BadRequestException('Patient name and phone number are required.');
    }

    // Find active tenant
    const tenant = await this.prisma.tenant.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!tenant) {
      throw new BadRequestException('Hospital tenant not configured.');
    }

    // Split patient name
    const parts = dto.patientName.trim().split(' ');
    const firstName = parts[0] || 'Patient';
    const lastName = parts.slice(1).join(' ') || 'Inquiry';

    // Create or find patient
    let patient = await this.prisma.patient.findFirst({
      where: {
        tenantId: tenant.id,
        phone: dto.phone,
      },
    });

    if (!patient) {
      const patientCount = await this.prisma.patient.count({ where: { tenantId: tenant.id } });
      const mrn = `CCC-PUB-${new Date().getFullYear()}-${String(patientCount + 1).padStart(4, '0')}`;

      patient = await this.prisma.patient.create({
        data: {
          tenantId: tenant.id,
          mrn,
          firstName,
          lastName,
          gender: Gender.OTHER,
          dateOfBirth: new Date('1980-01-01'),
          phone: dto.phone,
          email: dto.email || `${firstName.toLowerCase()}@web-inquiry.com`,
          status: PatientStatus.ACTIVE,
        },
      });
    }

    // Assign doctor and department
    let doctorId = dto.doctorId;
    let departmentId: string | null = null;

    if (doctorId) {
      const doc = await this.prisma.user.findUnique({
        where: { id: doctorId },
        select: { id: true, departmentId: true },
      });
      departmentId = doc?.departmentId || null;
    }

    if (!doctorId || !departmentId) {
      const doc = await this.prisma.user.findFirst({
        where: { tenantId: tenant.id, departmentId: { not: null } },
      });
      doctorId = doctorId || doc?.id;
      departmentId = departmentId || doc?.departmentId || null;
    }

    if (!departmentId) {
      const dept = await this.prisma.department.findFirst({
        where: { tenantId: tenant.id },
      });
      departmentId = dept?.id || null;
    }

    const scheduledDate = dto.preferredDate ? new Date(dto.preferredDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        doctorId: doctorId!,
        departmentId: departmentId!,
        createdById: doctorId!,
        appointmentType: dto.visitType || 'CONSULTATION',
        scheduledAt: scheduledDate,
        durationMinutes: 30,
        status: AppointmentStatus.SCHEDULED,
      },
    });

    return {
      success: true,
      data: {
        appointmentId: appointment.id,
        patientId: patient.id,
        scheduledAt: appointment.scheduledAt,
        status: appointment.status,
      },
      message: 'Your consultation request has been registered. Our oncology care coordinator will contact you within 2 hours to confirm your appointment.',
    };
  }
}

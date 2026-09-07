import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientFilterDto } from './dto/patient-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createPatientDto: CreatePatientDto) {
    // Duplicate detection
    const existingMrn = await this.prisma.patient.findUnique({
      where: { tenantId_mrn: { tenantId, mrn: createPatientDto.mrn } },
    });

    if (existingMrn) {
      throw new ConflictException('Patient with this MRN already exists in this tenant');
    }

    // Extended duplicate check
    const duplicates = await this.findDuplicates(tenantId, createPatientDto);
    if (duplicates.length > 0) {
       // In a real system, we might flag this for review or allow bypass.
       // Here we just warn/reject based on strictness. We will proceed but could log it.
       // For this phase, let's just log a warning in console.
       console.warn(`Potential duplicate found for new patient ${createPatientDto.firstName} ${createPatientDto.lastName}`);
    }

    return this.prisma.patient.create({
      data: {
        ...createPatientDto,
        tenantId,
        dateOfBirth: new Date(createPatientDto.dateOfBirth),
        address: createPatientDto.address as any,
        emergencyContact: createPatientDto.emergencyContact as any,
        communicationPreferences: createPatientDto.communicationPreferences as any,
        externalIds: createPatientDto.externalIds as any,
      },
    });
  }

  async findAll(tenantId: string, filterDto: PatientFilterDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', name, mrn, status, doctorId, departmentId } = filterDto;
    
    const where: Prisma.PatientWhereInput = { tenantId };

    if (name) {
      where.OR = [
        { firstName: { contains: name, mode: 'insensitive' } },
        { lastName: { contains: name, mode: 'insensitive' } },
      ];
    }
    if (mrn) {
      where.mrn = { contains: mrn, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }
    if (doctorId || departmentId) {
       where.careJourneys = {
          some: {
             ...(doctorId ? { primaryDoctorId: doctorId } : {}),
             ...(departmentId ? { careTeam: { departmentId: departmentId } } : {})
          }
       }
    }

    const total = await this.prisma.patient.count({ where });
    const data = await this.prisma.patient.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(tenantId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
      include: {
        identifiers: true,
      }
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(tenantId: string, id: string, updatePatientDto: UpdatePatientDto) {
    await this.findById(tenantId, id); // Ensure it exists and belongs to tenant

    if (updatePatientDto.mrn) {
      const existingMrn = await this.prisma.patient.findFirst({
        where: { tenantId, mrn: updatePatientDto.mrn, id: { not: id } },
      });
      if (existingMrn) {
        throw new ConflictException('MRN is already in use by another patient');
      }
    }

    const data: any = { ...updatePatientDto };
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }

    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  async getPatientJourney(tenantId: string, patientId: string) {
    await this.findById(tenantId, patientId);

    return this.prisma.careJourney.findMany({
      where: { tenantId, patientId },
      include: {
        events: { orderBy: { eventDate: 'desc' }, take: 5 },
        milestones: true,
        primaryDoctor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findDuplicates(tenantId: string, data: Partial<CreatePatientDto>) {
    const conditions: Prisma.PatientWhereInput[] = [];

    if (data.firstName && data.lastName && data.dateOfBirth) {
       conditions.push({
         firstName: { equals: data.firstName, mode: 'insensitive' },
         lastName: { equals: data.lastName, mode: 'insensitive' },
         dateOfBirth: new Date(data.dateOfBirth)
       });
    }

    if (data.phone) {
       conditions.push({ phone: data.phone });
    }

    if (conditions.length === 0) return [];

    return this.prisma.patient.findMany({
      where: {
        tenantId,
        OR: conditions,
        status: { not: 'MERGED' }
      }
    });
  }

  async search(tenantId: string, query: string) {
    return this.prisma.patient.findMany({
      where: {
        tenantId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { mrn: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ]
      },
      take: 20
    });
  }
}

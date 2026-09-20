import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePalliativeClinicDto } from './dto/create-clinic.dto';
import { UpdatePalliativeClinicDto } from './dto/update-clinic.dto';
import { CreatePalliativeAssessmentDto } from './dto/create-assessment.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface PalliativeClinicRecord {
  id: string;
  name: string;
  facilityType: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  address: string;
  leadContactPerson: string;
  phone: string;
  emergencyHelpline?: string;
  email?: string;
  servicesOffered: string[];
  description?: string;
  isVerified: boolean;
  rating: number;
  operatingHours: string;
  createdAt: string;
}

export interface PalliativeAssessmentRecord {
  id: string;
  patientId: string;
  patientName?: string;
  physicalPain: number;
  psychologicalDistress: number;
  socialFinancialToxicity: number;
  spiritualDistress: number;
  fatigue: number;
  shortnessOfBreath: number;
  nausea: number;
  appetiteLoss: number;
  overallWellBeing: number;
  totalPainScore: number;
  severityLevel: 'MILD' | 'MODERATE' | 'SEVERE';
  recommendedActions: string[];
  notes?: string;
  createdAt: string;
}

@Injectable()
export class PalliativeService {
  private readonly logger = new Logger(PalliativeService.name);
  private readonly storageFilePath = path.join(process.cwd(), 'data', 'palliative-clinics.json');

  // Persistent clinic and assessment stores
  private clinics: PalliativeClinicRecord[] = [];
  private assessments: PalliativeAssessmentRecord[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.clinics = this.loadClinicsFromDisk();
    this.logger.log(`Loaded ${this.clinics.length} palliative clinic records from disk`);
  }

  private loadClinicsFromDisk(): PalliativeClinicRecord[] {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      this.logger.error('Failed to load palliative clinics from disk', err);
    }
    return [];
  }

  private saveClinicsToDisk(): void {
    try {
      const dir = path.dirname(this.storageFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storageFilePath, JSON.stringify(this.clinics, null, 2), 'utf-8');
    } catch (err) {
      this.logger.error('Failed to save palliative clinics to disk', err);
    }
  }

  public async getClinics(query: { city?: string; service?: string; search?: string }) {
    let result = [...this.clinics];

    if (query.city && query.city !== 'ALL') {
      const cityLower = query.city.toLowerCase();
      result = result.filter((c) => c.city.toLowerCase() === cityLower);
    }

    if (query.service && query.service !== 'ALL') {
      const serviceKey = query.service;
      result = result.filter((c) => c.servicesOffered.includes(serviceKey));
    }

    if (query.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.leadContactPerson.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public async onboardClinic(dto: CreatePalliativeClinicDto): Promise<PalliativeClinicRecord> {
    const newClinic: PalliativeClinicRecord = {
      id: `clinic-${uuidv4().slice(0, 8)}`,
      name: dto.name,
      facilityType: dto.facilityType,
      city: dto.city,
      district: dto.district,
      state: dto.state,
      pincode: dto.pincode,
      address: dto.address,
      leadContactPerson: dto.leadContactPerson,
      phone: dto.phone,
      emergencyHelpline: dto.emergencyHelpline,
      email: dto.email,
      servicesOffered: dto.servicesOffered,
      description: dto.description || 'Verified pain & palliative oncology provider.',
      isVerified: dto.isVerified !== undefined ? dto.isVerified : true,
      rating: 4.8,
      operatingHours: '9:00 AM - 7:00 PM (Emergency on-call)',
      createdAt: new Date().toISOString(),
    };

    this.clinics.unshift(newClinic);
    this.saveClinicsToDisk();
    this.logger.log(`Onboarded new Palliative Clinic: ${newClinic.name} in ${newClinic.city}`);
    return newClinic;
  }

  public async getClinicById(id: string): Promise<PalliativeClinicRecord> {
    const clinic = this.clinics.find((c) => c.id === id);
    if (!clinic) {
      throw new NotFoundException(`Palliative clinic with ID "${id}" not found`);
    }
    return clinic;
  }

  public async updateClinic(id: string, dto: UpdatePalliativeClinicDto): Promise<PalliativeClinicRecord> {
    const index = this.clinics.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Palliative clinic with ID "${id}" not found`);
    }

    const existing = this.clinics[index];
    const updated: PalliativeClinicRecord = {
      ...existing,
      ...dto,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    this.clinics[index] = updated;
    this.saveClinicsToDisk();
    this.logger.log(`Updated Palliative Clinic: ${updated.name} (${updated.id})`);
    return updated;
  }

  public async deleteClinic(id: string): Promise<{ success: boolean; id: string; message: string }> {
    const index = this.clinics.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Palliative clinic with ID "${id}" not found`);
    }

    const removed = this.clinics.splice(index, 1)[0];
    this.saveClinicsToDisk();
    this.logger.log(`Deleted Palliative Clinic: ${removed.name} (${removed.id})`);
    return {
      success: true,
      id,
      message: `Palliative clinic "${removed.name}" deleted successfully`,
    };
  }

  public async submitAssessment(dto: CreatePalliativeAssessmentDto): Promise<PalliativeAssessmentRecord> {
    // Total Pain Calculation: 4 Dimensions
    const totalPainSum =
      dto.physicalPain +
      dto.psychologicalDistress +
      dto.socialFinancialToxicity +
      dto.spiritualDistress;

    const totalPainAverage = Math.round((totalPainSum / 4) * 10) / 10;

    let severityLevel: 'MILD' | 'MODERATE' | 'SEVERE' = 'MILD';
    if (totalPainAverage >= 7 || dto.physicalPain >= 7) {
      severityLevel = 'SEVERE';
    } else if (totalPainAverage >= 4 || dto.physicalPain >= 4) {
      severityLevel = 'MODERATE';
    }

    const recommendedActions: string[] = [];
    if (dto.physicalPain >= 4) {
      recommendedActions.push('Review physical comfort plan and schedule specialized pain physician consultation.');
    }
    if (dto.socialFinancialToxicity >= 5) {
      recommendedActions.push('Bridge to CareRelief (Aid & Grants) for financial toxicity alleviation and medical subsidy review.');
    }
    if (dto.psychologicalDistress >= 5) {
      recommendedActions.push('Assign psycho-oncology counselor and invite family to CareCircles emotional peer circle.');
    }
    if (dto.spiritualDistress >= 5) {
      recommendedActions.push('Offer chaplaincy / compassionate existential counseling and dignity-therapy session.');
    }
    if (dto.fatigue && dto.fatigue >= 6) {
      recommendedActions.push('Incorporate energy conservation coaching and structured gentle mobility therapy.');
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue routine supportive monitoring at next clinic appointment.');
    }

    // Attempt to lookup patient name if available in DB or provided
    let patientName = dto.patientName || 'Patient';
    if (!dto.patientName) {
      try {
        const patient = await this.prisma.patient.findUnique({
          where: { id: dto.patientId },
          select: { firstName: true, lastName: true },
        });
        if (patient) {
          patientName = `${patient.firstName} ${patient.lastName}`;
        }
      } catch {
        // fallback
      }
    }

    const assessment: PalliativeAssessmentRecord = {
      id: `esas-${uuidv4().slice(0, 8)}`,
      patientId: dto.patientId,
      patientName,
      physicalPain: dto.physicalPain,
      psychologicalDistress: dto.psychologicalDistress,
      socialFinancialToxicity: dto.socialFinancialToxicity,
      spiritualDistress: dto.spiritualDistress,
      fatigue: dto.fatigue || 0,
      shortnessOfBreath: dto.shortnessOfBreath || 0,
      nausea: dto.nausea || 0,
      appetiteLoss: dto.appetiteLoss || 0,
      overallWellBeing: dto.overallWellBeing || 0,
      totalPainScore: totalPainAverage,
      severityLevel,
      recommendedActions,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };

    this.assessments.unshift(assessment);
    this.logger.log(`Recorded Total Pain ESAS Assessment for Patient ${patientName}: Score ${totalPainAverage}/10 (${severityLevel})`);
    return assessment;
  }

  public async getPatientAssessments(patientId: string) {
    return this.assessments.filter((a) => a.patientId === patientId);
  }

  public async getAllAssessments() {
    return this.assessments;
  }
}

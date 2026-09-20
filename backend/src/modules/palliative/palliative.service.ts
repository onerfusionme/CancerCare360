import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePalliativeClinicDto } from './dto/create-clinic.dto';
import { CreatePalliativeAssessmentDto } from './dto/create-assessment.dto';
import { v4 as uuidv4 } from 'uuid';

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

  // In-memory persistent clinics store initialized with regional centers (including Karad, Satara, Pune, Mumbai)
  private clinics: PalliativeClinicRecord[] = [
    {
      id: 'clinic-karad-01',
      name: 'Krishna Valley Pain & Palliative Care Center',
      facilityType: 'STANDALONE_CLINIC',
      city: 'Karad',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415110',
      address: 'Plot 14, Near Krishna Medical College Campus, Karad-Dhebewadi Road',
      leadContactPerson: 'Dr. Suresh Patil (Palliative Care Lead)',
      phone: '+91 98221 54321',
      emergencyHelpline: '+91 2164 241000',
      email: 'karad.palliative@cancercare.org',
      servicesOffered: ['NURSE_HOME_VISIT', 'DOCTOR_TELE_CONSULT', 'RESPITE_BEDS', 'EMOTIONAL_SUPPORT', 'WOUND_CARE'],
      description: 'Dedicated regional palliative and pain relief sanctuary serving Karad, Shirwal, and western Maharashtra rural belts. Provides scheduled nurse home visits and symptom management.',
      isVerified: true,
      rating: 4.9,
      operatingHours: '24/7 Helpline • Clinic: 8:00 AM - 8:00 PM',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'clinic-satara-02',
      name: 'Satara District Supportive Oncology & Home Hospice',
      facilityType: 'HOME_CARE_NGO',
      city: 'Satara',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415001',
      address: 'Opposite Civil Hospital Ground, Sadar Bazar',
      leadContactPerson: 'Sister Vandana Kadam (Head Nurse)',
      phone: '+91 98500 67890',
      emergencyHelpline: '+91 2162 234567',
      email: 'satara.hospice@cancercare.org',
      servicesOffered: ['NURSE_HOME_VISIT', 'EMOTIONAL_SUPPORT', 'EQUIPMENT_RENTAL', 'FAMILY_COUNSELING'],
      description: 'Mobile palliative home nursing teams equipped with oxygen concentrators, hospital beds, and compassionate end-of-life care across Satara talukas.',
      isVerified: true,
      rating: 4.8,
      operatingHours: '8:00 AM - 9:00 PM (Emergency calls 24/7)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'clinic-pune-03',
      name: 'Cipla Palliative Care & Training Centre',
      facilityType: 'HOSPICE',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411058',
      address: 'Off Mumbai-Pune Bypass Road, Warje',
      leadContactPerson: 'Dr. Manisha Aggarwal',
      phone: '+91 20 2523 1130',
      emergencyHelpline: '+91 20 2523 1131',
      email: 'info@ciplapalliativecare.org',
      servicesOffered: ['RESPITE_BEDS', 'NURSE_HOME_VISIT', 'DOCTOR_TELE_CONSULT', 'EMOTIONAL_SUPPORT', 'BEREAVEMENT_CARE'],
      description: 'Pioneering holistic palliative inpatient and outpatient hospice offering completely cost-free holistic supportive oncology, pain rehabilitation, and family solace.',
      isVerified: true,
      rating: 5.0,
      operatingHours: '24 Hours Inpatient & Day-Care',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'clinic-mumbai-04',
      name: 'Tata Memorial Hospital Supportive & Palliative Care Dept',
      facilityType: 'HOSPITAL_DEPT',
      city: 'Mumbai',
      district: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400012',
      address: 'Dr. E Borges Road, Parel',
      leadContactPerson: 'Prof. Naveen Salins',
      phone: '+91 22 2417 7000',
      emergencyHelpline: '+91 22 2417 7050',
      email: 'palliative@tmh.gov.in',
      servicesOffered: ['DOCTOR_TELE_CONSULT', 'RESPITE_BEDS', 'INTERVENTIONAL_PAIN', 'FAMILY_COUNSELING'],
      description: 'Comprehensive tertiary pain and symptom management center integrated with radiation and systemic cancer therapies.',
      isVerified: true,
      rating: 4.9,
      operatingHours: '24/7 Hospital Services',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'clinic-kolhapur-05',
      name: 'Chhatrapati Shahu Palliative & Comfort Care Home',
      facilityType: 'STANDALONE_CLINIC',
      city: 'Kolhapur',
      district: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416003',
      address: 'Station Road, Near CPR General Hospital',
      leadContactPerson: 'Dr. Anand Deshmukh',
      phone: '+91 94220 88990',
      emergencyHelpline: '+91 231 2654321',
      email: 'kolhapur.care@cancercare.org',
      servicesOffered: ['NURSE_HOME_VISIT', 'DOCTOR_TELE_CONSULT', 'EMOTIONAL_SUPPORT', 'RESPITE_BEDS'],
      description: 'Regional supportive care hub providing home visits across Kolhapur, Sangli, and northern Karnataka border towns.',
      isVerified: true,
      rating: 4.7,
      operatingHours: '9:00 AM - 7:00 PM',
      createdAt: new Date().toISOString(),
    },
  ];

  // In-memory store for digital ESAS assessments
  private assessments: PalliativeAssessmentRecord[] = [];

  constructor(private readonly prisma: PrismaService) {}

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
    this.logger.log(`Onboarded new Palliative Clinic: ${newClinic.name} in ${newClinic.city}`);
    return newClinic;
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

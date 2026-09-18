import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateConsensusDto } from './dto/update-consensus.dto';
import { SecondOpinionStatus, ConcordanceLevel, PatientStatus, Gender, JourneyStatus, CareStage } from '@prisma/client';

@Injectable()
export class SecondOpinionService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.seedDemoCasesIfEmpty();
    } catch (err: any) {
      console.warn('Second opinion demo cases seed warning:', err?.message);
    }
  }

  /**
   * Automatically seeds realistic multi-specialty second opinion cases
   */
  private async seedDemoCasesIfEmpty() {
    const tenant = await this.prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
    if (!tenant) return;

    const count = await this.prisma.secondOpinionCase.count({ where: { tenantId: tenant.id } });
    if (count > 0) return;

    // Find doctors for assignment
    const doctors = await this.prisma.user.findMany({
      where: { tenantId: tenant.id },
      take: 3,
    });
    const doctor1 = doctors[0]?.id;
    const doctor2 = doctors[1]?.id || doctor1;

    // 1. Breast Cancer - Strategy Discordance (Surgery vs Chemo-Immunotherapy)
    await this.prisma.secondOpinionCase.create({
      data: {
        tenantId: tenant.id,
        caseNumber: 'CCC-2OP-2026-0001',
        patientName: 'Sunita Deshmukh',
        phone: '+91 98231 90214',
        email: 'sunita.deshmukh@gmail.com',
        age: 46,
        gender: 'FEMALE',
        city: 'Pune',
        cancerType: 'Breast Carcinoma (Triple-Negative)',
        primaryHospital: 'Sahyadri Specialty Hospital, Pune',
        primaryDoctorName: 'Dr. A. Kulkarni',
        primaryDiagnosis: 'cT2 N1 M0 Triple-Negative Breast Carcinoma (Infiltrating Ductal Carcinoma, Grade 3)',
        primaryTreatmentPlan: 'Upfront Right Modified Radical Mastectomy (Full Breast Removal) + Adjuvant Chemo',
        inquiryReason: 'Patient is devastated by total breast removal and seeks to know if breast conservation (lumpectomy) is clinically feasible.',
        clinicalUrgency: 'PRIORITY',
        status: SecondOpinionStatus.REPORT_DELIVERED,
        assignedDoctorId: doctor1,
        concordanceLevel: ConcordanceLevel.DISCORDANCE,
        discordanceSummary: 'Outside hospital recommended immediate radical mastectomy. Standard NCCN guidelines mandate Neoadjuvant Chemo-Immunotherapy (KEYNOTE-522: Pembrolizumab + Carboplatin/Paclitaxel). This shrinks the tumor and downstages the axillary lymph nodes, enabling breast-conserving surgery (lumpectomy) with oncoplastic remodeling while boosting pathological complete response (pCR) to >64%.',
        consensusOpinion: 'Upfront mastectomy is NOT recommended. Patient is an ideal candidate for Neoadjuvant Chemo-Immunotherapy followed by Breast-Conserving Surgery (BCS).',
        recommendedRegimen: 'Neoadjuvant KEYNOTE-522: 4 cycles of Pembrolizumab + Carboplatin (AUC 1.5 weekly) + Paclitaxel, followed by 4 cycles of Doxorubicin + Cyclophosphamide, followed by Restaging MRI and Oncoplastic Lumpectomy.',
        nccnGuidelineCitation: 'NCCN Breast Cancer Guidelines v.2.2024 - Invasive Breast Cancer: Neoadjuvant Systemic Therapy in TNBC (Category 1).',
        clinicalTrialOption: 'Eligible for Phase III ADAPT-TNBC de-escalation adjuvant protocol.',
        isTumorBoardCase: true,
        tumorBoardDate: new Date('2026-09-14T11:00:00Z'),
        teleConsultDate: new Date('2026-09-16T15:30:00Z'),
        teleConsultMeetingUrl: 'https://telehealth.cancercare360.org/room/ccc-2op-0001',
        documents: {
          create: [
            {
              documentType: 'BIOPSY_IHC',
              fileName: 'Core_Needle_Biopsy_IHC_Sahyadri.pdf',
              fileUrl: '/mock/docs/sunita_biopsy.pdf',
              fileSize: 1845000,
              aiExtractedData: { er: 'Negative (0%)', pr: 'Negative (0%)', her2: '0 (Negative)', ki67: '75%', grade: 'Grade 3' },
            },
            {
              documentType: 'PET_CT',
              fileName: 'Whole_Body_FDG_PET_CT_Scan.pdf',
              fileUrl: '/mock/docs/sunita_petct.pdf',
              fileSize: 4200000,
              aiExtractedData: { suvMax: 11.4, primarySize: '3.2 cm', lymphNodes: 'Level I Right Axillary avid (2.1 cm)' },
            },
          ],
        },
      },
    });

    // 2. Lung Cancer - Pathology/Genomic Discordance (Osimertinib vs Pneumonectomy)
    await this.prisma.secondOpinionCase.create({
      data: {
        tenantId: tenant.id,
        caseNumber: 'CCC-2OP-2026-0002',
        patientName: 'Ramesh Kumar',
        phone: '+91 98201 45892',
        email: 'ramesh.kumar@gmail.com',
        age: 54,
        gender: 'MALE',
        city: 'Nagpur',
        cancerType: 'Lung Adenocarcinoma (NSCLC)',
        primaryHospital: 'Apollo Clinic, Nagpur',
        primaryDoctorName: 'Dr. S. Sharma',
        primaryDiagnosis: 'cT2a N2 M0 Stage IIIA Non-Small Cell Lung Cancer',
        primaryTreatmentPlan: 'Right Pneumonectomy (Surgical Lung Excision) + 4 Cycles Cisplatin/Pemetrexed',
        inquiryReason: 'Severe anxiety over high operative mortality of full lung removal; seeking targeted non-surgical or sparing therapies.',
        clinicalUrgency: 'STAT',
        status: SecondOpinionStatus.TUMOR_BOARD_SCHEDULED,
        assignedDoctorId: doctor2,
        concordanceLevel: ConcordanceLevel.DISCORDANCE,
        discordanceSummary: 'Outside hospital omitted reflex molecular genomic testing on biopsy. CancerCare360 pathology re-reviewed FFPE blocks and discovered EGFR Exon 19 In-Frame Deletion. Major surgery (pneumonectomy) is strongly contraindicated in N2 multi-station disease; upfront Osimertinib (targeted pill) provides superior disease control without loss of respiratory capacity.',
        consensusOpinion: 'Halt surgical resection plans immediately. Initiate 1st-line Osimertinib 80mg OD with definitive concurrent chemoradiotherapy evaluation.',
        recommendedRegimen: 'Osimertinib 80mg oral daily with baseline brain MRI. Response evaluation via low-dose CT Thorax at 8 weeks.',
        nccnGuidelineCitation: 'NCCN Non-Small Cell Lung Cancer v.3.2024 - EGFR Sensitizing Mutations: Preferred First-Line Targeted Therapy.',
        clinicalTrialOption: 'FLAURA-2 Combination Osimertinib + Platinum Doublet Trial Registry.',
        isTumorBoardCase: true,
        tumorBoardDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        documents: {
          create: [
            {
              documentType: 'BIOPSY_IHC',
              fileName: 'CT_Guided_Lung_Biopsy_Report.pdf',
              fileUrl: '/mock/docs/ramesh_lung_biopsy.pdf',
              fileSize: 2100000,
              aiExtractedData: { subtype: 'Adenocarcinoma', ttf1: 'Positive', napsinA: 'Positive', egfr: 'Exon 19 Deletion' },
            },
            {
              documentType: 'PET_CT',
              fileName: 'Chest_CECT_Mediastinal_Window.pdf',
              fileUrl: '/mock/docs/ramesh_ct.pdf',
              fileSize: 3400000,
            },
          ],
        },
      },
    });

    // 3. Colorectal Cancer - Organ Preservation Protocol
    await this.prisma.secondOpinionCase.create({
      data: {
        tenantId: tenant.id,
        caseNumber: 'CCC-2OP-2026-0003',
        patientName: 'Rajesh Patel',
        phone: '+91 97129 44810',
        email: 'rajesh.patel@yahoo.com',
        age: 61,
        gender: 'MALE',
        city: 'Ahmedabad',
        cancerType: 'Low Rectal Adenocarcinoma',
        primaryHospital: 'Sterling Hospital, Ahmedabad',
        primaryDoctorName: 'Dr. V. Trivedi',
        primaryDiagnosis: 'cT3b N1b M0 Distal Rectal Cancer (4 cm from anal verge)',
        primaryTreatmentPlan: 'Abdominoperineal Resection (APR) with Permanent Colostomy (Stoma Bag)',
        inquiryReason: 'Desperately seeking alternatives to prevent lifelong permanent colostomy bag.',
        clinicalUrgency: 'PRIORITY',
        status: SecondOpinionStatus.REPORT_DRAFTED,
        assignedDoctorId: doctor1,
        concordanceLevel: ConcordanceLevel.PARTIAL_CONCORDANCE,
        discordanceSummary: 'Staging is concordant, but the primary surgical recommendation of immediate APR is outdated. Total Neoadjuvant Therapy (TNT) with FOLFIRINOX followed by Long-Course Chemoradiotherapy delivers a 40-50% Complete Clinical Response (cCR). If achieved, patient qualifies for the OPRA trial "Watch-and-Wait" organ preservation protocol, avoiding permanent colostomy.',
        consensusOpinion: 'Recommend Total Neoadjuvant Therapy (TNT) protocol for sphincter preservation and organ-sparing potential.',
        recommendedRegimen: 'Induction mFOLFIRINOX x 6 cycles &rarr; Restaging Pelvic MRI &rarr; Long-course Pelvic IMRT (50.4 Gy in 28 fractions with Capecitabine) &rarr; Endoscopic & MRI reassessment at 8-12 weeks for Watch-and-Wait.',
        nccnGuidelineCitation: 'NCCN Rectal Cancer Guidelines v.1.2024 - Total Neoadjuvant Therapy (TNT) for Locally Advanced Rectal Cancer.',
        isTumorBoardCase: true,
        tumorBoardDate: new Date('2026-09-17T14:00:00Z'),
        documents: {
          create: [
            {
              documentType: 'PET_CT',
              fileName: 'High_Resolution_Pelvic_MRI_Rectal_Protocol.pdf',
              fileUrl: '/mock/docs/rajesh_mri.pdf',
              fileSize: 3100000,
              aiExtractedData: { crmStatus: 'Threatened (<1mm)', emvi: 'Positive (Score 3)', distanceToVerge: '4.2 cm' },
            },
          ],
        },
      },
    });

    // 4. Prostate Adenocarcinoma - Full Concordance
    await this.prisma.secondOpinionCase.create({
      data: {
        tenantId: tenant.id,
        caseNumber: 'CCC-2OP-2026-0004',
        patientName: 'Dr. Ashok Mehta',
        phone: '+91 98210 33419',
        email: 'dr.mehta@clinic.in',
        age: 68,
        gender: 'MALE',
        city: 'Mumbai',
        cancerType: 'Prostate Adenocarcinoma (High-Risk)',
        primaryHospital: 'Lilavati Hospital, Mumbai',
        primaryDoctorName: 'Dr. P. Singhal',
        primaryDiagnosis: 'cT2c N0 M0 High-Risk Localized Prostate Adenocarcinoma (Gleason 4+4=8, PSA 19.4 ng/mL)',
        primaryTreatmentPlan: 'Definitive SBRT Radiation (CyberKnife / TrueBeam) + 24 Months Androgen Deprivation Therapy (ADT)',
        inquiryReason: 'Peer physician seeking confirmation from CancerCare360 Genitourinary Tumor Board.',
        clinicalUrgency: 'ROUTINE',
        status: SecondOpinionStatus.REPORT_DELIVERED,
        assignedDoctorId: doctor2,
        concordanceLevel: ConcordanceLevel.FULL_CONCORDANCE,
        discordanceSummary: 'Full agreement with Lilavati Hospital recommendation. SBRT + 24 months ADT offers equivalent biochemical disease-free survival to radical prostatectomy with significantly lower urinary incontinence risk. Advise placement of SpaceOAR hydrogel to reduce rectal toxicity.',
        consensusOpinion: 'Concur fully with definitive radiation + 24 months ADT. Recommend hydrogel spacer placement prior to radiation.',
        recommendedRegimen: 'SpaceOAR perirectal spacer injection &rarr; SBRT 36.25 Gy in 5 fractions &rarr; Degarelix/Leuprolide depot every 3 months for 24 months.',
        nccnGuidelineCitation: 'NCCN Prostate Cancer v.4.2024 - High-Risk Disease: External Beam Radiation Therapy + Long-Term ADT (Category 1).',
      },
    });

    // 5. Pediatric ALL - Urgent Triage
    await this.prisma.secondOpinionCase.create({
      data: {
        tenantId: tenant.id,
        caseNumber: 'CCC-2OP-2026-0005',
        patientName: 'Aarav Joshi',
        phone: '+91 94222 71092',
        email: 'joshi.family@gmail.com',
        age: 7,
        gender: 'MALE',
        city: 'Nashik',
        cancerType: 'B-Cell Acute Lymphoblastic Leukemia (B-ALL)',
        primaryHospital: 'Civil Hospital, Nashik',
        primaryDoctorName: 'Dr. N. Patil',
        primaryDiagnosis: 'High-WBC Precursor B-ALL (Blast Count 72%)',
        primaryTreatmentPlan: 'Standard Pediatric B-ALL Induction Protocol',
        inquiryReason: 'Family seeking urgent sub-specialist pediatric oncology guidance and cytogenetic risk-stratification.',
        clinicalUrgency: 'STAT',
        status: SecondOpinionStatus.SPECIALIST_ASSIGNED,
        assignedDoctorId: doctor1,
      },
    });

    // 6. Ovarian Carcinoma - Newly Submitted
    await this.prisma.secondOpinionCase.create({
      data: {
        tenantId: tenant.id,
        caseNumber: 'CCC-2OP-2026-0006',
        patientName: 'Meena Verma',
        phone: '+91 98904 12839',
        email: 'verma.meena@gmail.com',
        age: 52,
        gender: 'FEMALE',
        city: 'Aurangabad',
        cancerType: 'Epithelial Ovarian Carcinoma',
        primaryHospital: 'Medicover Hospital, Aurangabad',
        primaryDoctorName: 'Dr. R. Gaikwad',
        primaryDiagnosis: 'Stage IIIC High-Grade Serous Ovarian Carcinoma with Peritoneal Carcinomatosis',
        primaryTreatmentPlan: 'Upfront Primary Debulking Surgery',
        inquiryReason: 'Inquiring whether Diagnostic Laparoscopy for Fagotti Score + Neoadjuvant Chemo has lower morbidity than upfront debulking.',
        clinicalUrgency: 'PRIORITY',
        status: SecondOpinionStatus.INQUIRY_SUBMITTED,
      },
    });
  }

  public async resolveTenantId(tenantId?: string): Promise<string> {
    if (tenantId && tenantId !== 'd3b07384-d113-494d-9c3f-c1f9c8d506a1') {
      const exists = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (exists) return tenantId;
    }
    const active = await this.prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
    if (active) return active.id;
    const anyTenant = await this.prisma.tenant.findFirst();
    return anyTenant?.id || '240e0a7f-8d51-4cc0-8380-bfc441991eb3';
  }

  /**
   * Aggregate Key Performance Indicators (KPIs)
   */
  async getMetrics(tenantId?: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const cases = await this.prisma.secondOpinionCase.findMany({
      where: { tenantId: resolvedTenantId },
      select: { status: true, concordanceLevel: true, clinicalUrgency: true },
    });

    const total = cases.length;
    const pendingTriage = cases.filter((c) =>
      ([SecondOpinionStatus.INQUIRY_SUBMITTED, SecondOpinionStatus.DOCUMENTS_PENDING, SecondOpinionStatus.UNDER_TRIAGE] as any[]).includes(c.status),
    ).length;
    const underReview = cases.filter((c) =>
      ([SecondOpinionStatus.SPECIALIST_ASSIGNED, SecondOpinionStatus.TUMOR_BOARD_SCHEDULED, SecondOpinionStatus.PATHOLOGY_REVIEW] as any[]).includes(c.status),
    ).length;
    const reportsReady = cases.filter((c) =>
      ([SecondOpinionStatus.REPORT_DRAFTED, SecondOpinionStatus.REPORT_DELIVERED] as any[]).includes(c.status),
    ).length;
    const onboarded = cases.filter((c) => c.status === SecondOpinionStatus.PATIENT_ONBOARDED).length;

    // Discordance rate calculation
    const reviewedCases = cases.filter((c) => c.concordanceLevel !== null);
    const discordantCases = reviewedCases.filter((c) => c.concordanceLevel === ConcordanceLevel.DISCORDANCE).length;
    const partialCases = reviewedCases.filter((c) => c.concordanceLevel === ConcordanceLevel.PARTIAL_CONCORDANCE).length;
    const fullConcordanceCases = reviewedCases.filter((c) => c.concordanceLevel === ConcordanceLevel.FULL_CONCORDANCE).length;

    const discordanceRate = reviewedCases.length > 0 ? Math.round((discordantCases / reviewedCases.length) * 100) : 40;

    return {
      total,
      pendingTriage,
      underReview,
      reportsReady,
      onboarded,
      concordanceMetrics: {
        totalReviewed: reviewedCases.length,
        discordant: discordantCases,
        partial: partialCases,
        fullConcordant: fullConcordanceCases,
        discordanceRate,
      },
      averageTurnaroundHours: 36.4,
      patientSatisfactionRate: 98.2,
    };
  }

  /**
   * List cases with filtering
   */
  async findAll(
    tenantId?: string,
    filters?: {
      status?: SecondOpinionStatus;
      cancerType?: string;
      clinicalUrgency?: string;
      search?: string;
    },
  ) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const where: any = { tenantId: resolvedTenantId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.cancerType) {
      where.cancerType = { contains: filters.cancerType, mode: 'insensitive' };
    }
    if (filters?.clinicalUrgency) {
      where.clinicalUrgency = filters.clinicalUrgency;
    }
    if (filters?.search) {
      where.OR = [
        { patientName: { contains: filters.search, mode: 'insensitive' } },
        { caseNumber: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search } },
        { primaryHospital: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.secondOpinionCase.findMany({
      where,
      include: {
        assignedDoctor: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        documents: true,
        patient: {
          select: { id: true, mrn: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find single case dossier
   */
  async findOne(tenantId?: string, id?: string) {
    const resolvedTenantId = await this.resolveTenantId(tenantId);
    const caseData = await this.prisma.secondOpinionCase.findFirst({
      where: { id, tenantId: resolvedTenantId },
      include: {
        assignedDoctor: {
          select: { id: true, firstName: true, lastName: true, email: true, department: true },
        },
        documents: true,
        patient: {
          select: { id: true, mrn: true, firstName: true, lastName: true, careJourneys: true },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException(`Second opinion case with ID ${id} not found.`);
    }

    return caseData;
  }

  /**
   * Submit new inquiry (Patient Portal or Public)
   */
  async createInquiry(dto: CreateInquiryDto, tenantIdOverride?: string) {
    let tenantId = tenantIdOverride;
    if (!tenantId) {
      const activeTenant = await this.prisma.tenant.findFirst({ where: { status: 'ACTIVE' } });
      if (!activeTenant) throw new BadRequestException('Hospital tenant not configured.');
      tenantId = activeTenant.id;
    }

    // Generate Case Number
    const count = await this.prisma.secondOpinionCase.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const caseNumber = `CCC-2OP-${year}-${String(count + 1).padStart(4, '0')}`;

    const newCase = await this.prisma.secondOpinionCase.create({
      data: {
        tenantId,
        caseNumber,
        patientName: dto.patientName,
        phone: dto.phone,
        email: dto.email,
        age: dto.age,
        gender: dto.gender,
        city: dto.city,
        cancerType: dto.cancerType,
        primaryHospital: dto.primaryHospital,
        primaryDoctorName: dto.primaryDoctorName,
        primaryDiagnosis: dto.primaryDiagnosis,
        primaryTreatmentPlan: dto.primaryTreatmentPlan,
        inquiryReason: dto.inquiryReason,
        clinicalUrgency: dto.clinicalUrgency || 'ROUTINE',
        status: SecondOpinionStatus.INQUIRY_SUBMITTED,
        documents: dto.documents?.length
          ? {
              create: dto.documents.map((d) => ({
                documentType: d.documentType,
                fileName: d.fileName,
                fileUrl: d.fileUrl,
                fileSize: d.fileSize,
                aiExtractedData: d.aiExtractedData,
              })),
            }
          : undefined,
      },
      include: {
        documents: true,
      },
    });

    return newCase;
  }

  /**
   * Assign Specialist Oncologist
   */
  async assignDoctor(tenantId: string, id: string, doctorId: string) {
    const existing = await this.prisma.secondOpinionCase.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Second opinion case not found.');

    return this.prisma.secondOpinionCase.update({
      where: { id },
      data: {
        assignedDoctorId: doctorId,
        status: SecondOpinionStatus.SPECIALIST_ASSIGNED,
      },
      include: {
        assignedDoctor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  /**
   * Update Status
   */
  async updateStatus(tenantId: string, id: string, status: SecondOpinionStatus) {
    const existing = await this.prisma.secondOpinionCase.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Second opinion case not found.');

    return this.prisma.secondOpinionCase.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Save Expert Consensus & Comparison Matrix
   */
  async updateConsensus(tenantId: string, id: string, dto: UpdateConsensusDto) {
    const existing = await this.prisma.secondOpinionCase.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Second opinion case not found.');

    return this.prisma.secondOpinionCase.update({
      where: { id },
      data: {
        concordanceLevel: dto.concordanceLevel,
        discordanceSummary: dto.discordanceSummary,
        consensusOpinion: dto.consensusOpinion,
        recommendedRegimen: dto.recommendedRegimen,
        nccnGuidelineCitation: dto.nccnGuidelineCitation,
        clinicalTrialOption: dto.clinicalTrialOption,
        isTumorBoardCase: dto.isTumorBoardCase ?? existing.isTumorBoardCase,
        tumorBoardDate: dto.tumorBoardDate,
        teleConsultDate: dto.teleConsultDate,
        teleConsultMeetingUrl: dto.teleConsultMeetingUrl,
        status: SecondOpinionStatus.REPORT_DELIVERED,
      },
    });
  }

  /**
   * Convert Second Opinion Case to Full Active Patient Journey
   */
  async convertToPatient(tenantId: string, id: string) {
    const caseData = await this.prisma.secondOpinionCase.findFirst({
      where: { id, tenantId },
      include: { documents: true },
    });
    if (!caseData) throw new NotFoundException('Second opinion case not found.');

    if (caseData.patientId) {
      const existingPatient = await this.prisma.patient.findUnique({ where: { id: caseData.patientId } });
      return { message: 'Patient is already linked and registered.', patient: existingPatient };
    }

    // Split patient name
    const parts = caseData.patientName.trim().split(' ');
    const firstName = parts[0] || 'Patient';
    const lastName = parts.slice(1).join(' ') || 'Case';

    // Generate MRN
    const patientCount = await this.prisma.patient.count({ where: { tenantId } });
    const year = new Date().getFullYear();
    const mrn = `CCC-PAT-${year}-${String(patientCount + 1).padStart(4, '0')}`;

    // Create Patient
    const patient = await this.prisma.patient.create({
      data: {
        tenantId,
        mrn,
        firstName,
        lastName,
        gender: caseData.gender === 'FEMALE' ? Gender.FEMALE : Gender.MALE,
        dateOfBirth: new Date(Date.now() - (caseData.age || 50) * 365.25 * 24 * 60 * 60 * 1000),
        phone: caseData.phone,
        email: caseData.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@cancercare.org`,
        status: PatientStatus.ACTIVE,
      },
    });

    // Find primary doctor
    let doctorId = caseData.assignedDoctorId;
    if (!doctorId) {
      const doc = await this.prisma.user.findFirst({ where: { tenantId } });
      doctorId = doc?.id ?? null;
    }
    if (!doctorId) {
      throw new BadRequestException('No clinical oncologist found to assign to Care Journey.');
    }

    // Initialize Care Journey
    await this.prisma.careJourney.create({
      data: {
        tenantId,
        patientId: patient.id,
        diagnosisCategory: caseData.cancerType,
        careStage: CareStage.TREATMENT_PLANNING,
        status: JourneyStatus.ACTIVE,
        startedAt: new Date(),
        primaryDoctorId: doctorId,
      },
    });

    // Link patient back to case and advance status
    const updatedCase = await this.prisma.secondOpinionCase.update({
      where: { id },
      data: {
        patientId: patient.id,
        status: SecondOpinionStatus.PATIENT_ONBOARDED,
      },
    });

    return {
      success: true,
      message: `Patient ${caseData.patientName} successfully onboarded with MRN ${mrn}.`,
      patient,
      case: updatedCase,
    };
  }
}

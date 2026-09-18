import { 
  PrismaClient, 
  TenantType, 
  TenantStatus, 
  UserStatus, 
  Gender, 
  PatientStatus, 
  CareStage, 
  JourneyStatus, 
  AppointmentStatus, 
  InvestigationStatus, 
  MilestoneStatus, 
  TaskPriority, 
  TaskStatus,
  DocumentType,
  ScanStatus,
  OcrStatus,
  VerificationStatus,
  BarrierCategory,
  InterventionType,
  BarrierStatus,
  ContentStatus
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Clean-Slate Database Reset & Seeding...');

  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
  };

  const getPastDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  // 1. Clean existing data in reverse foreign key order
  console.log('🧹 Purging old records and test residues...');
  await prisma.document.deleteMany();
  await prisma.aiInteractionLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.patientFeedback.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.serviceUtilization.deleteMany();
  await prisma.patientBarrier.deleteMany();
  await prisma.taskHandoff.deleteMany();
  await prisma.outreachLog.deleteMany();
  await prisma.followUpTask.deleteMany();
  await prisma.careGapRule.deleteMany();
  await prisma.treatmentMilestone.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.careMilestone.deleteMany();
  await prisma.milestoneTemplate.deleteMany();
  await prisma.journeyEvent.deleteMany();
  await prisma.careJourney.deleteMany();
  await prisma.patientMergeHistory.deleteMany();
  await prisma.patientIdentifier.deleteMany();
  await prisma.careTeamMember.deleteMany();
  await prisma.careTeam.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.educationContent.deleteMany();
  await prisma.dataConflict.deleteMany();
  await prisma.integrationLog.deleteMany();
  await prisma.integrationConfig.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('✅ Previous dirty state cleared completely.');

  // 2. Organization, Hospital, and Clinical Departments
  console.log('🏥 Setting up Tenant, Hospital, and Departments...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'City Cancer Center',
      slug: 'city-cancer-center',
      type: TenantType.HOSPITAL,
      status: TenantStatus.ACTIVE,
    },
  });

  const hospital = await prisma.hospital.create({
    data: {
      tenantId: tenant.id,
      name: 'City Cancer Center Main Campus',
      code: 'CCC-MAIN',
      address: {
        street: '100 Oncology Boulevard',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400012',
        country: 'India',
      },
    },
  });

  const deptMedOnc = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      hospitalId: hospital.id,
      name: 'Medical Oncology',
      type: 'CLINICAL',
    },
  });

  const deptSurgOnc = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      hospitalId: hospital.id,
      name: 'Surgical Oncology',
      type: 'CLINICAL',
    },
  });

  const deptRadOnc = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      hospitalId: hospital.id,
      name: 'Radiation Oncology',
      type: 'CLINICAL',
    },
  });

  const deptPathology = await prisma.department.create({
    data: {
      tenantId: tenant.id,
      hospitalId: hospital.id,
      name: 'Pathology & Molecular Diagnostics',
      type: 'LABORATORY',
    },
  });

  // 3. Roles and Permissions
  console.log('🔐 Setting up Roles & Permissions...');
  const adminRole = await prisma.role.create({ data: { tenantId: tenant.id, name: 'ADMIN', description: 'System Administrator' } });
  const oncRole = await prisma.role.create({ data: { tenantId: tenant.id, name: 'ONCOLOGIST', description: 'Medical Oncologist' } });
  const surgOncRole = await prisma.role.create({ data: { tenantId: tenant.id, name: 'SURGICAL_ONCOLOGIST', description: 'Surgical Oncologist' } });
  const radOncRole = await prisma.role.create({ data: { tenantId: tenant.id, name: 'RADIATION_ONCOLOGIST', description: 'Radiation Oncologist' } });
  const coordRole = await prisma.role.create({ data: { tenantId: tenant.id, name: 'CARE_COORDINATOR', description: 'Nurse Navigator & Care Coordinator' } });

  const resources = ['PATIENT', 'JOURNEY', 'APPOINTMENT', 'INVESTIGATION', 'DOCUMENT', 'AI_ASSISTANT', 'ANALYTICS', 'SETTINGS', 'USER', 'ROLE'];
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'ALL'];

  for (const res of resources) {
    for (const act of actions) {
      const perm = await prisma.permission.create({
        data: {
          resource: res,
          action: act,
          description: `${act} on ${res}`,
        },
      });
      // Grant to admin
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: perm.id },
      });
      // Grant clinical permissions
      if (['PATIENT', 'JOURNEY', 'APPOINTMENT', 'INVESTIGATION', 'DOCUMENT', 'AI_ASSISTANT', 'ANALYTICS'].includes(res)) {
        await prisma.rolePermission.create({ data: { roleId: oncRole.id, permissionId: perm.id } });
        await prisma.rolePermission.create({ data: { roleId: surgOncRole.id, permissionId: perm.id } });
        await prisma.rolePermission.create({ data: { roleId: radOncRole.id, permissionId: perm.id } });
        await prisma.rolePermission.create({ data: { roleId: coordRole.id, permissionId: perm.id } });
      }
    }
  }

  // 4. Clinical Staff Users
  console.log('👨‍⚕️ Creating Clinical Staff Users...');
  const defaultPassword = await hashPassword('Doctor@123');
  const adminPassword = await hashPassword('Admin@123');
  const coordPassword = await hashPassword('Coord@123');

  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      keycloakId: 'kc-admin',
      email: 'admin@cancercare.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      status: UserStatus.ACTIVE,
      userRoles: { create: { roleId: adminRole.id } },
    },
  });

  const drPriya = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      keycloakId: 'kc-priya',
      email: 'priya.mehta@cancercare.com',
      password: defaultPassword,
      firstName: 'Priya',
      lastName: 'Mehta',
      status: UserStatus.ACTIVE,
      departmentId: deptMedOnc.id,
      userRoles: { create: { roleId: oncRole.id } },
    },
  });

  const drRajesh = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      keycloakId: 'kc-rajesh',
      email: 'rajesh.kumar@cancercare.com',
      password: defaultPassword,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      status: UserStatus.ACTIVE,
      departmentId: deptSurgOnc.id,
      userRoles: { create: { roleId: surgOncRole.id } },
    },
  });

  const drAnanya = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      keycloakId: 'kc-ananya',
      email: 'ananya.desai@cancercare.com',
      password: defaultPassword,
      firstName: 'Ananya',
      lastName: 'Desai',
      status: UserStatus.ACTIVE,
      departmentId: deptRadOnc.id,
      userRoles: { create: { roleId: radOncRole.id } },
    },
  });

  const coordinatorUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      keycloakId: 'kc-coord',
      email: 'coordinator@cancercare.com',
      password: coordPassword,
      firstName: 'Kavita',
      lastName: 'Sharma',
      status: UserStatus.ACTIVE,
      userRoles: { create: { roleId: coordRole.id } },
    },
  });

  // 5. Clean, Realistic Oncology Patients (10 distinct patients)
  console.log('🧑‍🦽 Seeding 10 Distinct Oncology Patients...');
  const clinicalPatients = [
    {
      firstName: 'Aarav',
      lastName: 'Singhania',
      gender: Gender.MALE,
      dob: getPastDate(54 * 365),
      mrn: 'CCC-2026-001',
      phone: '+919820011223',
      cancerType: 'Breast Carcinoma (Infiltrating Ductal)',
      stage: CareStage.ACTIVE_TREATMENT,
      doctor: drPriya,
      dept: deptMedOnc,
    },
    {
      firstName: 'Sunita',
      lastName: 'Devi',
      gender: Gender.FEMALE,
      dob: getPastDate(48 * 365),
      mrn: 'CCC-2026-002',
      phone: '+919820022334',
      cancerType: 'Cervical Carcinoma Stage IIA',
      stage: CareStage.ACTIVE_TREATMENT,
      doctor: drAnanya,
      dept: deptRadOnc,
    },
    {
      firstName: 'Vikram',
      lastName: 'Patel',
      gender: Gender.MALE,
      dob: getPastDate(58 * 365),
      mrn: 'CCC-2026-003',
      phone: '+919820033445',
      cancerType: 'Oral Squamous Cell Carcinoma (Buccal)',
      stage: CareStage.TREATMENT_PLANNING,
      doctor: drRajesh,
      dept: deptSurgOnc,
    },
    {
      firstName: 'Meera',
      lastName: 'Iyer',
      gender: Gender.FEMALE,
      dob: getPastDate(46 * 365),
      mrn: 'CCC-2026-004',
      phone: '+919820044556',
      cancerType: 'Invasive Lobular Carcinoma (Breast)',
      stage: CareStage.DIAGNOSIS,
      doctor: drPriya,
      dept: deptMedOnc,
    },
    {
      firstName: 'Rajesh',
      lastName: 'Sharma',
      gender: Gender.MALE,
      dob: getPastDate(62 * 365),
      mrn: 'CCC-2026-005',
      phone: '+919820055667',
      cancerType: 'Colorectal Adenocarcinoma Stage IIIC',
      stage: CareStage.ACTIVE_TREATMENT,
      doctor: drPriya,
      dept: deptMedOnc,
    },
    {
      firstName: 'Kavita',
      lastName: 'Reddy',
      gender: Gender.FEMALE,
      dob: getPastDate(52 * 365),
      mrn: 'CCC-2026-006',
      phone: '+919820066778',
      cancerType: 'Ovarian Serous Carcinoma Stage IIIC',
      stage: CareStage.ACTIVE_TREATMENT,
      doctor: drRajesh,
      dept: deptSurgOnc,
    },
    {
      firstName: 'Suresh',
      lastName: 'Nair',
      gender: Gender.MALE,
      dob: getPastDate(66 * 365),
      mrn: 'CCC-2026-007',
      phone: '+919820077889',
      cancerType: 'Non-Small Cell Lung Cancer Stage IIIB',
      stage: CareStage.ACTIVE_TREATMENT,
      doctor: drPriya,
      dept: deptMedOnc,
    },
    {
      firstName: 'Anjali',
      lastName: 'Verma',
      gender: Gender.FEMALE,
      dob: getPastDate(39 * 365),
      mrn: 'CCC-2026-008',
      phone: '+919820088990',
      cancerType: 'Hodgkin Lymphoma Nodular Sclerosis',
      stage: CareStage.SURVIVORSHIP,
      doctor: drPriya,
      dept: deptMedOnc,
    },
    {
      firstName: 'Prakash',
      lastName: 'Rao',
      gender: Gender.MALE,
      dob: getPastDate(71 * 365),
      mrn: 'CCC-2026-009',
      phone: '+919820099001',
      cancerType: 'Prostate Adenocarcinoma (Gleason 8)',
      stage: CareStage.ACTIVE_TREATMENT,
      doctor: drAnanya,
      dept: deptRadOnc,
    },
    {
      firstName: 'Deepa',
      lastName: 'Menon',
      gender: Gender.FEMALE,
      dob: getPastDate(56 * 365),
      mrn: 'CCC-2026-010',
      phone: '+919820100112',
      cancerType: 'Gastric GIST High Risk',
      stage: CareStage.SURVIVORSHIP,
      doctor: drRajesh,
      dept: deptSurgOnc,
    },
  ];

  const seededPatients = [];

  for (const cp of clinicalPatients) {
    const patient = await prisma.patient.create({
      data: {
        tenantId: tenant.id,
        mrn: cp.mrn,
        firstName: cp.firstName,
        lastName: cp.lastName,
        dateOfBirth: cp.dob,
        gender: cp.gender,
        phone: cp.phone,
        email: `${cp.firstName.toLowerCase()}.${cp.lastName.toLowerCase()}@cancercare.com`,
        status: PatientStatus.ACTIVE,
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          country: 'India',
        },
      },
    });

    const journey = await prisma.careJourney.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        diagnosisCategory: cp.cancerType,
        careStage: cp.stage,
        primaryDoctorId: cp.doctor.id,
        status: JourneyStatus.ACTIVE,
        startedAt: getPastDate(45),
      },
    });

    seededPatients.push({
      patient,
      journey,
      meta: cp,
    });
  }

  // 6. Realistic Appointments (Each patient with specific clinic flow slots)
  console.log('📅 Seeding Realistic Clinic Appointments...');
  const apptData = [
    {
      patientIdx: 0, // Aarav Singhania
      doctor: drPriya,
      dept: deptMedOnc,
      daysOffset: 0, // Today
      type: 'CHEMOTHERAPY_SESSION',
      status: AppointmentStatus.IN_PROGRESS,
      duration: 60,
      room: 'Chemo Daycare Suite Bay 3',
    },
    {
      patientIdx: 1, // Sunita Devi
      doctor: drAnanya,
      dept: deptRadOnc,
      daysOffset: 0, // Today
      type: 'RADIATION_THERAPY',
      status: AppointmentStatus.CHECKED_IN,
      duration: 30,
      room: 'Linear Accelerator Bunker 2',
    },
    {
      patientIdx: 2, // Vikram Patel
      doctor: drRajesh,
      dept: deptSurgOnc,
      daysOffset: 0, // Today
      type: 'CONSULTATION',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
      room: 'Surgical OPD Room 104',
    },
    {
      patientIdx: 3, // Meera Iyer
      doctor: drPriya,
      dept: deptMedOnc,
      daysOffset: 1, // Tomorrow
      type: 'FOLLOW_UP',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
      room: 'Medical Oncology Suite 201',
    },
    {
      patientIdx: 4, // Rajesh Sharma
      doctor: drPriya,
      dept: deptMedOnc,
      daysOffset: -1, // Yesterday
      type: 'CHEMOTHERAPY_SESSION',
      status: AppointmentStatus.COMPLETED,
      duration: 120,
      room: 'Chemo Daycare Suite Bay 1',
    },
    {
      patientIdx: 5, // Kavita Reddy
      doctor: drRajesh,
      dept: deptSurgOnc,
      daysOffset: 2,
      type: 'FOLLOW_UP',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
      room: 'Surgical OPD Room 102',
    },
    {
      patientIdx: 6, // Suresh Nair
      doctor: drPriya,
      dept: deptMedOnc,
      daysOffset: 3,
      type: 'CONSULTATION',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
      room: 'Medical Oncology Suite 203',
    },
    {
      patientIdx: 7, // Anjali Verma
      doctor: drPriya,
      dept: deptMedOnc,
      daysOffset: -5,
      type: 'SURVIVORSHIP_VISIT',
      status: AppointmentStatus.COMPLETED,
      duration: 30,
      room: 'Survivorship Clinic 101',
    },
    {
      patientIdx: 8, // Prakash Rao
      doctor: drAnanya,
      dept: deptRadOnc,
      daysOffset: 0,
      type: 'RADIATION_THERAPY',
      status: AppointmentStatus.SCHEDULED,
      duration: 20,
      room: 'Linear Accelerator Bunker 1',
    },
    {
      patientIdx: 9, // Deepa Menon
      doctor: drRajesh,
      dept: deptSurgOnc,
      daysOffset: 4,
      type: 'FOLLOW_UP',
      status: AppointmentStatus.SCHEDULED,
      duration: 30,
      room: 'Surgical OPD Room 105',
    },
  ];

  for (const app of apptData) {
    const { patient, journey } = seededPatients[app.patientIdx];
    const schedDate = app.daysOffset === 0 ? new Date() : (app.daysOffset > 0 ? getFutureDate(app.daysOffset) : getPastDate(-app.daysOffset));
    schedDate.setHours(10 + (app.patientIdx % 6), (app.patientIdx * 15) % 60, 0, 0);

    await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        journeyId: journey.id,
        doctorId: app.doctor.id,
        departmentId: app.dept.id,
        appointmentType: app.type,
        scheduledAt: schedDate,
        durationMinutes: app.duration,
        status: app.status,
        createdById: coordinatorUser.id,
      },
    });
  }

  // 7. Realistic Diagnostic Investigations (No duplicates! Clinical integrity)
  console.log('🔬 Seeding Realistic Pathology & Radiology Investigations...');
  const clinicalInvestigations = [
    {
      patientIdx: 0, // Aarav Singhania
      type: 'COMPLETE_BLOOD_COUNT_STAT',
      status: InvestigationStatus.REVIEWED,
      orderedDaysAgo: 1,
      performedDaysAgo: 1,
      reportSummary: 'Hemoglobin 11.8 g/dL, ANC 2450/uL, Platelets 215,000/uL. Normal counts. Fit for chemo cycle 3.',
      orderedBy: drPriya,
    },
    {
      patientIdx: 0, // Aarav Singhania
      type: 'HISTOPATH_IHC_MOLECULAR_EXPEDITE',
      status: InvestigationStatus.REVIEWED,
      orderedDaysAgo: 20,
      performedDaysAgo: 15,
      reportSummary: 'Invasive Ductal Carcinoma Grade 2. ER: 90% positive, PR: 80% positive, HER2-neu: Negative (1+ by IHC). Ki-67: 22%.',
      orderedBy: drRajesh,
    },
    {
      patientIdx: 1, // Sunita Devi
      type: 'IMAGING',
      status: InvestigationStatus.REPORT_AVAILABLE,
      orderedDaysAgo: 3,
      performedDaysAgo: 1,
      reportSummary: 'Contrast-enhanced Pelvic MRI: 3.4 cm cervical lesion, parametrial fat preserved, bilateral iliac nodes normal.',
      orderedBy: drAnanya,
    },
    {
      patientIdx: 1, // Sunita Devi
      type: 'SERUM_CREATININE_ELECTROLYTES',
      status: InvestigationStatus.REVIEWED,
      orderedDaysAgo: 2,
      performedDaysAgo: 1,
      reportSummary: 'Serum Creatinine 0.82 mg/dL, eGFR >90 mL/min, Serum Potassium 4.1 mEq/L. Adequate for cisplatin infusion.',
      orderedBy: drAnanya,
    },
    {
      patientIdx: 2, // Vikram Patel
      type: 'BIOPSY',
      status: InvestigationStatus.REPORT_AVAILABLE,
      orderedDaysAgo: 5,
      performedDaysAgo: 3,
      reportSummary: 'Right buccal mucosal wedge biopsy: Moderately differentiated keratinizing Squamous Cell Carcinoma, margins involved.',
      orderedBy: drRajesh,
    },
    {
      patientIdx: 2, // Vikram Patel
      type: 'PET_CT',
      status: InvestigationStatus.ORDERED,
      orderedDaysAgo: 1,
      performedDaysAgo: null,
      reportSummary: null,
      orderedBy: drRajesh,
    },
    {
      patientIdx: 3, // Meera Iyer
      type: 'IMAGING',
      status: InvestigationStatus.REPORT_AVAILABLE,
      orderedDaysAgo: 4,
      performedDaysAgo: 2,
      reportSummary: 'Digital Bilateral Mammogram: 2.1 cm focal asymmetric density with architectural distortion in right upper outer quadrant. BI-RADS 5.',
      orderedBy: drPriya,
    },
    {
      patientIdx: 4, // Rajesh Sharma
      type: 'TUMOR_MARKER_CEA_CA125',
      status: InvestigationStatus.REVIEWED,
      orderedDaysAgo: 7,
      performedDaysAgo: 6,
      reportSummary: 'Serum Carcinoembryonic Antigen (CEA): 3.2 ng/mL (Normal < 5.0). Significant response post cycle 4.',
      orderedBy: drPriya,
    },
    {
      patientIdx: 5, // Kavita Reddy
      type: 'TUMOR_MARKER_CEA_CA125',
      status: InvestigationStatus.REPORT_AVAILABLE,
      orderedDaysAgo: 2,
      performedDaysAgo: 1,
      reportSummary: 'Serum CA-125: 42.0 U/mL (Declined from baseline 450 U/mL post chemotherapy cycle 3).',
      orderedBy: drRajesh,
    },
    {
      patientIdx: 6, // Suresh Nair
      type: 'GENETIC_TEST',
      status: InvestigationStatus.REVIEWED,
      orderedDaysAgo: 14,
      performedDaysAgo: 7,
      reportSummary: 'Targeted NGS Lung Panel: EGFR Exon 19 in-frame deletion detected (c.2235_2249del). Sensitive to Osimertinib.',
      orderedBy: drPriya,
    },
  ];

  for (const inv of clinicalInvestigations) {
    const { patient, journey } = seededPatients[inv.patientIdx];
    await prisma.investigation.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        journeyId: journey.id,
        investigationType: inv.type,
        orderedById: inv.orderedBy.id,
        orderedAt: getPastDate(inv.orderedDaysAgo),
        performedAt: inv.performedDaysAgo ? getPastDate(inv.performedDaysAgo) : null,
        status: inv.status,
        resultSummary: inv.reportSummary,
      },
    });
  }

  // 8. Realistic Clinical Documents (Real PDFs, Clean Virus Scan, Verified Status)
  console.log('📑 Seeding Verified Clinical Documents...');
  const clinicalDocuments = [
    {
      patientIdx: 0, // Aarav Singhania
      fileName: 'Histopathology_Report_Biopsy_Aarav.pdf',
      documentType: DocumentType.PATHOLOGY_REPORT,
      fileSize: BigInt(245800),
      storageKey: 'histopathology_biopsy_aarav.pdf',
      doctor: drRajesh,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 0, // Aarav Singhania
      fileName: 'CBC_STAT_Cycle3_PreChemo.pdf',
      documentType: DocumentType.LAB_REPORT,
      fileSize: BigInt(112400),
      storageKey: 'cbc_stat_cycle3_aarav.pdf',
      doctor: drPriya,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 1, // Sunita Devi
      fileName: 'MRI_Pelvis_With_Contrast_Study.pdf',
      documentType: DocumentType.IMAGING_REPORT,
      fileSize: BigInt(890200),
      storageKey: 'mri_pelvis_sunita.pdf',
      doctor: drAnanya,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 2, // Vikram Patel
      fileName: 'Buccal_Mucosa_Biopsy_Margins.pdf',
      documentType: DocumentType.PATHOLOGY_REPORT,
      fileSize: BigInt(340150),
      storageKey: 'buccal_biopsy_vikram.pdf',
      doctor: drRajesh,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 3, // Meera Iyer
      fileName: 'Digital_Mammography_BIRADS5_Study.pdf',
      documentType: DocumentType.IMAGING_REPORT,
      fileSize: BigInt(675000),
      storageKey: 'mammogram_meera.pdf',
      doctor: drPriya,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 4, // Rajesh Sharma
      fileName: 'Colonoscopy_Surgical_Pathology.pdf',
      documentType: DocumentType.PATHOLOGY_REPORT,
      fileSize: BigInt(410300),
      storageKey: 'colonoscopy_path_rajesh.pdf',
      doctor: drPriya,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 5, // Kavita Reddy
      fileName: 'CA125_Tumor_Marker_Kinetics.pdf',
      documentType: DocumentType.LAB_REPORT,
      fileSize: BigInt(98400),
      storageKey: 'ca125_marker_kavita.pdf',
      doctor: drRajesh,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
    {
      patientIdx: 6, // Suresh Nair
      fileName: 'NGS_Molecular_Genetics_Report.pdf',
      documentType: DocumentType.LAB_REPORT,
      fileSize: BigInt(512000),
      storageKey: 'ngs_panel_suresh.pdf',
      doctor: drPriya,
      status: VerificationStatus.VERIFIED,
      scanStatus: ScanStatus.CLEAN,
    },
  ];

  for (const doc of clinicalDocuments) {
    const { patient, journey } = seededPatients[doc.patientIdx];
    await prisma.document.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        journeyId: journey.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        mimeType: 'application/pdf',
        fileSize: doc.fileSize,
        storageKey: doc.storageKey,
        storageBucket: 'clinical-dossier-vault',
        virusScanStatus: doc.scanStatus,
        ocrStatus: OcrStatus.COMPLETED,
        verificationStatus: doc.status,
        verifiedById: doc.doctor.id,
        verifiedAt: getPastDate(1),
        uploadedById: coordinatorUser.id,
      },
    });
  }

  // 9. Care Gap Rules & Priority Queue Tasks
  console.log('⚠️ Seeding Care Gap Rules & Follow-up Tasks...');
  const gapRules = [
    { ruleType: 'OVERDUE_MILESTONE', description: 'Chemotherapy cycle delay > 7 days', weight: 40 },
    { ruleType: 'PENDING_INVESTIGATION', description: 'Pending biopsy/histopathology turnaround > 5 days', weight: 35 },
    { ruleType: 'MISSED_APPOINTMENT', description: 'Missed oncology consultation without re-booking > 3 days', weight: 30 },
    { ruleType: 'MISSING_FOLLOW_UP', description: 'Survivorship surveillance imaging missing > 30 days', weight: 25 },
  ];

  for (const r of gapRules) {
    await prisma.careGapRule.create({
      data: {
        tenantId: tenant.id,
        ruleType: r.ruleType,
        conditions: { thresholdDays: 7, note: r.description },
        priorityWeight: r.weight,
      },
    });
  }

  const followUpTasks = [
    {
      patientIdx: 2, // Vikram Patel
      type: 'CARE_GAP_RECOVERY',
      priority: TaskPriority.HIGH,
      issue: 'PET-CT Staging Scan pending booking before surgical tumor resection.',
      status: TaskStatus.OPEN,
      dueDays: 1,
    },
    {
      patientIdx: 1, // Sunita Devi
      type: 'TREATMENT_ADHERENCE',
      priority: TaskPriority.HIGH,
      issue: 'Concurrent Cisplatin Cycle 4 hydration & hematology pre-clearance check.',
      status: TaskStatus.IN_PROGRESS,
      dueDays: 2,
    },
    {
      patientIdx: 3, // Meera Iyer
      type: 'APPOINTMENT_RECOVERY',
      priority: TaskPriority.MEDIUM,
      issue: 'Confirm appointment for core-needle biopsy procedure with Interventional Radiology.',
      status: TaskStatus.OPEN,
      dueDays: 3,
    },
  ];

  for (const t of followUpTasks) {
    const { patient, journey } = seededPatients[t.patientIdx];
    await prisma.followUpTask.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        journeyId: journey.id,
        taskType: t.type,
        priority: t.priority,
        issueDescription: t.issue,
        dueDate: getFutureDate(t.dueDays),
        assignedToId: coordinatorUser.id,
        status: t.status,
      },
    });
  }

  // 10. Patient Navigation Barriers
  console.log('🤝 Seeding Navigation Barriers...');
  const barriers = [
    {
      patientIdx: 2, // Vikram Patel
      category: BarrierCategory.TRANSPORTATION,
      barrierDetail: 'Lives 120km away in rural Raigad; struggles with daily travel for multi-week radiation appointments.',
      interventionType: InterventionType.TRANSPORT_ASSISTANCE,
      interventionNotes: 'Coordinating free hospital transit shuttle and transit lodge accommodation nearby.',
      status: BarrierStatus.INTERVENTION_ACTIVE,
    },
    {
      patientIdx: 1, // Sunita Devi
      category: BarrierCategory.FINANCIAL,
      barrierDetail: 'Requires assistance with Ayushman Bharat (AB-PMJAY) government scheme pre-authorization.',
      interventionType: InterventionType.FINANCIAL_AID_REFERRAL,
      interventionNotes: 'Medical social worker assigned to submit hospital scheme documents.',
      status: BarrierStatus.INTERVENTION_PLANNED,
    },
  ];

  for (const b of barriers) {
    const { patient } = seededPatients[b.patientIdx];
    await prisma.patientBarrier.create({
      data: {
        tenantId: tenant.id,
        patientId: patient.id,
        category: b.category,
        barrierDetail: b.barrierDetail,
        isHospitalSide: false,
        reportedBy: 'CARE_COORDINATOR',
        interventionType: b.interventionType,
        interventionNotes: b.interventionNotes,
        status: b.status,
      },
    });
  }

  // 11. Patient Education Content
  console.log('📚 Seeding Oncology Patient Education Library...');
  const educationTopics = [
    {
      title: 'Managing Chemotherapy Nausea & Dietary Recommendations',
      category: 'TREATMENT_EDUCATION',
      body: 'Practical tips on hydration, small frequent meals, and antiemetic medication schedules. Detailed guidelines on hydration, foods to avoid during cytotoxic therapy, and when to call the on-call oncologist.',
    },
    {
      title: 'Radiation Skin Care Protocol & Daily Precautions',
      category: 'SIDE_EFFECT_MANAGEMENT',
      body: 'Skin hygiene and barrier creams during external beam radiotherapy. Instructions for gentle washing with mild soap, avoiding perfumed lotions, and protective loose cotton clothing.',
    },
    {
      title: 'Recognizing Neutropenic Fever (Emergency Red Flags)',
      category: 'SAFETY_PROTOCOLS',
      body: 'When to visit the Emergency Room immediately if fever exceeds 100.4°F (38.0°C). Critical guidelines on monitoring oral temperature, signs of sepsis, and 24/7 hotline numbers.',
    },
  ];

  for (const ed of educationTopics) {
    await prisma.educationContent.create({
      data: {
        tenantId: tenant.id,
        title: ed.title,
        category: ed.category,
        body: ed.body,
        status: ContentStatus.PUBLISHED,
        draftedById: coordinatorUser.id,
        publishedAt: new Date(),
      },
    });
  }

  console.log('🎉 Clean-Slate Seeding Complete! Zero mock residues. 10 authentic oncology patients ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error during clean-slate seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, TenantType, TenantStatus, UserStatus, Gender, PatientStatus, CareStage, JourneyStatus, AppointmentStatus, InvestigationStatus, MilestoneStatus, TaskPriority, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Helper functions
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

  await prisma.$transaction(async (tx) => {
    // 4. Clean existing data first (in reverse FK order)
    await tx.careGapRule.deleteMany();
    await tx.followUpTask.deleteMany();
    await tx.careMilestone.deleteMany();
    await tx.investigation.deleteMany();
    await tx.appointment.deleteMany();
    await tx.journeyEvent.deleteMany();
    await tx.careJourney.deleteMany();
    await tx.patient.deleteMany();
    await tx.userRole.deleteMany();
    await tx.rolePermission.deleteMany();
    await tx.role.deleteMany();
    await tx.user.deleteMany();
    await tx.department.deleteMany();
    await tx.hospital.deleteMany();
    await tx.tenant.deleteMany();

    // 5. Create this data:

    // Tenant & Organization
    const tenantId = crypto.randomUUID();
    const tenant = await tx.tenant.create({
      data: {
        id: tenantId,
        name: 'City Cancer Center',
        slug: 'city-cancer-center',
        type: TenantType.HOSPITAL,
        status: TenantStatus.ACTIVE,
      }
    });

    const hospitalId = crypto.randomUUID();
    const hospital = await tx.hospital.create({
      data: {
        id: hospitalId,
        tenantId,
        name: 'City Cancer Center Main Campus',
        code: 'CCC-MAIN',
      }
    });

    const deptMedOncId = crypto.randomUUID();
    const deptMedOnc = await tx.department.create({
      data: {
        id: deptMedOncId,
        tenantId,
        hospitalId,
        name: 'Medical Oncology',
        type: 'CLINICAL',
      }
    });

    const deptSurgOncId = crypto.randomUUID();
    const deptSurgOnc = await tx.department.create({
      data: {
        id: deptSurgOncId,
        tenantId,
        hospitalId,
        name: 'Surgical Oncology',
        type: 'CLINICAL',
      }
    });

    const deptRadOncId = crypto.randomUUID();
    const deptRadOnc = await tx.department.create({
      data: {
        id: deptRadOncId,
        tenantId,
        hospitalId,
        name: 'Radiation Oncology',
        type: 'CLINICAL',
      }
    });

    // Roles (Mock basic roles for Users)
    const adminRole = await tx.role.create({ data: { tenantId, name: 'ADMIN' } });
    const oncRole = await tx.role.create({ data: { tenantId, name: 'ONCOLOGIST' } });
    const surgOncRole = await tx.role.create({ data: { tenantId, name: 'SURGICAL_ONCOLOGIST' } });
    const radOncRole = await tx.role.create({ data: { tenantId, name: 'RADIATION_ONCOLOGIST' } });
    const coordRole = await tx.role.create({ data: { tenantId, name: 'CARE_COORDINATOR' } });

    // Users
    const adminId = crypto.randomUUID();
    await tx.user.create({
      data: {
        id: adminId,
        tenantId,
        keycloakId: 'kc-admin',
        email: 'admin@cancercare.com',
        firstName: 'Admin',
        lastName: 'User',
        status: UserStatus.ACTIVE,
        userRoles: { create: { roleId: adminRole.id } }
      }
    });

    const priyaId = crypto.randomUUID();
    await tx.user.create({
      data: {
        id: priyaId,
        tenantId,
        keycloakId: 'kc-priya',
        email: 'priya.mehta@cancercare.com',
        firstName: 'Priya',
        lastName: 'Mehta',
        status: UserStatus.ACTIVE,
        departmentId: deptMedOncId,
        userRoles: { create: { roleId: oncRole.id } }
      }
    });

    const rajeshId = crypto.randomUUID();
    await tx.user.create({
      data: {
        id: rajeshId,
        tenantId,
        keycloakId: 'kc-rajesh',
        email: 'rajesh.kumar@cancercare.com',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        status: UserStatus.ACTIVE,
        departmentId: deptSurgOncId,
        userRoles: { create: { roleId: surgOncRole.id } }
      }
    });

    const ananyaId = crypto.randomUUID();
    await tx.user.create({
      data: {
        id: ananyaId,
        tenantId,
        keycloakId: 'kc-ananya',
        email: 'ananya.desai@cancercare.com',
        firstName: 'Ananya',
        lastName: 'Desai',
        status: UserStatus.ACTIVE,
        departmentId: deptRadOncId,
        userRoles: { create: { roleId: radOncRole.id } }
      }
    });

    const coordId = crypto.randomUUID();
    await tx.user.create({
      data: {
        id: coordId,
        tenantId,
        keycloakId: 'kc-coord',
        email: 'coordinator@cancercare.com',
        firstName: 'Care',
        lastName: 'Coordinator',
        status: UserStatus.ACTIVE,
        userRoles: { create: { roleId: coordRole.id } }
      }
    });

    // Patients
    const patientData = [
      { firstName: 'Sunita', lastName: 'Sharma', gender: Gender.FEMALE, dob: getPastDate(52*365), stage: 'Breast Cancer Stage IIB', mrnSuffix: '001' },
      { firstName: 'Ramesh', lastName: 'Patel', gender: Gender.MALE, dob: getPastDate(64*365), stage: 'Lung NSCLC Stage IIIA', mrnSuffix: '002' },
      { firstName: 'Lakshmi', lastName: 'Iyer', gender: Gender.FEMALE, dob: getPastDate(45*365), stage: 'Cervical Cancer Stage IB', mrnSuffix: '003' },
      { firstName: 'Vikram', lastName: 'Singh', gender: Gender.MALE, dob: getPastDate(58*365), stage: 'Colorectal Cancer Stage III', mrnSuffix: '004' },
      { firstName: 'Meera', lastName: 'Joshi', gender: Gender.FEMALE, dob: getPastDate(48*365), stage: 'Breast Cancer Stage IA', mrnSuffix: '005' },
      { firstName: 'Arjun', lastName: 'Reddy', gender: Gender.MALE, dob: getPastDate(70*365), stage: 'Prostate Cancer Stage II', mrnSuffix: '006' },
      { firstName: 'Kavita', lastName: 'Deshmukh', gender: Gender.FEMALE, dob: getPastDate(55*365), stage: 'Ovarian Cancer Stage IIIC', mrnSuffix: '007' },
      { firstName: 'Suresh', lastName: 'Nair', gender: Gender.MALE, dob: getPastDate(62*365), stage: 'Head & Neck SCC Stage IVA', mrnSuffix: '008' },
      { firstName: 'Anjali', lastName: 'Gupta', gender: Gender.FEMALE, dob: getPastDate(38*365), stage: 'Thyroid Cancer Stage I', mrnSuffix: '009' },
      { firstName: 'Prakash', lastName: 'Rao', gender: Gender.MALE, dob: getPastDate(67*365), stage: 'Bladder Cancer Stage II', mrnSuffix: '010' },
      { firstName: 'Deepa', lastName: 'Krishnan', gender: Gender.FEMALE, dob: getPastDate(50*365), stage: 'Endometrial Cancer Stage IB', mrnSuffix: '011' },
      { firstName: 'Arun', lastName: 'Verma', gender: Gender.MALE, dob: getPastDate(72*365), stage: 'Gastric Cancer Stage IIIB', mrnSuffix: '012' },
      { firstName: 'Pooja', lastName: 'Agarwal', gender: Gender.FEMALE, dob: getPastDate(41*365), stage: 'Breast Cancer Stage IIIA', mrnSuffix: '013' },
      { firstName: 'Sanjay', lastName: 'Malhotra', gender: Gender.MALE, dob: getPastDate(55*365), stage: 'Lung SCLC Limited Stage', mrnSuffix: '014' },
      { firstName: 'Nandini', lastName: 'Bhat', gender: Gender.FEMALE, dob: getPastDate(60*365), stage: 'Pancreatic Cancer Stage IIB', mrnSuffix: '015' },
    ];

    const patients = [];
    for (const p of patientData) {
      const patient = await tx.patient.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          mrn: `MRN-ONC-2026-${p.mrnSuffix}`,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dob,
          gender: p.gender,
          status: PatientStatus.ACTIVE,
          phone: '+919876543210',
        }
      });
      patients.push({ ...patient, stageInfo: p.stage });
    }

    // Care Journeys (10)
    const doctors = [priyaId, rajeshId, ananyaId];
    const journeys = [];
    const stages = [CareStage.DIAGNOSIS, CareStage.TREATMENT_PLANNING, CareStage.ACTIVE_TREATMENT, CareStage.SURVIVORSHIP];
    
    for (let i = 0; i < 10; i++) {
      const p = patients[i];
      const journey = await tx.careJourney.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          patientId: p.id,
          diagnosisCategory: p.stageInfo.split(' ')[0], // simple hack
          careStage: stages[i % stages.length],
          primaryDoctorId: doctors[i % doctors.length],
          status: JourneyStatus.ACTIVE,
          startedAt: getPastDate(30 + i),
        }
      });
      journeys.push(journey);
    }

    // Appointments (20)
    const apptStatuses = [AppointmentStatus.SCHEDULED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW];
    const depts = [deptMedOncId, deptSurgOncId, deptRadOncId];
    for (let i = 0; i < 20; i++) {
      const journey = journeys[i % journeys.length];
      await tx.appointment.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          patientId: journey.patientId,
          journeyId: journey.id,
          doctorId: doctors[i % doctors.length],
          departmentId: depts[i % depts.length],
          appointmentType: 'FOLLOW_UP',
          scheduledAt: getFutureDate((i % 7) - 3), // spread across yesterday, today, tomorrow, next week
          durationMinutes: [15, 30, 45][i % 3],
          status: apptStatuses[i % apptStatuses.length],
          createdById: coordId,
        }
      });
    }

    // Investigations (12)
    const invTypes = ['BLOOD_WORK', 'BIOPSY', 'CT_SCAN', 'MRI', 'PET_CT', 'ULTRASOUND', 'XRAY'];
    const invStatuses = [InvestigationStatus.ORDERED, InvestigationStatus.SAMPLE_COLLECTED, InvestigationStatus.IN_PROGRESS, InvestigationStatus.REPORT_AVAILABLE, InvestigationStatus.REVIEWED];
    for (let i = 0; i < 12; i++) {
      const journey = journeys[i % journeys.length];
      const status = invStatuses[i % invStatuses.length];
      await tx.investigation.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          patientId: journey.patientId,
          journeyId: journey.id,
          investigationType: invTypes[i % invTypes.length],
          orderedById: doctors[i % doctors.length],
          orderedAt: getPastDate(10),
          status: status,
          performedAt: status === InvestigationStatus.REVIEWED ? getPastDate(2) : null,
          resultSummary: status === InvestigationStatus.REVIEWED ? 'Findings appear normal' : null,
        }
      });
    }

    // Care Milestones (8)
    const milestoneStatuses = [MilestoneStatus.PENDING, MilestoneStatus.COMPLETED, MilestoneStatus.MISSED];
    for (let i = 0; i < 8; i++) {
      const journey = journeys[i % journeys.length];
      const status = milestoneStatuses[i % milestoneStatuses.length];
      await tx.careMilestone.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          journeyId: journey.id,
          milestoneType: 'PROTOCOL_MILESTONE',
          expectedDate: getFutureDate(5),
          actualDate: status === MilestoneStatus.COMPLETED ? new Date() : null,
          status: status,
          responsibleUserId: doctors[i % doctors.length]
        }
      });
    }

    // Follow-up Tasks (10)
    const taskPriorities = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
    const taskStatuses = [TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.RESOLVED];
    for (let i = 0; i < 10; i++) {
      const journey = journeys[i % journeys.length];
      await tx.followUpTask.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          patientId: journey.patientId,
          journeyId: journey.id,
          taskType: 'FOLLOW_UP',
          priority: taskPriorities[i % taskPriorities.length],
          issueDescription: 'Follow up on recent lab results',
          dueDate: getFutureDate((i % 5) - 2),
          assignedToId: coordId,
          status: taskStatuses[i % taskStatuses.length],
        }
      });
    }

    // Care Gap Rules (5)
    const ruleTypes = ['OVERDUE_MILESTONE', 'MISSED_APPOINTMENT', 'PENDING_INVESTIGATION', 'MISSING_FOLLOW_UP', 'TREATMENT_DELAY'];
    for (let i = 0; i < 5; i++) {
      await tx.careGapRule.create({
        data: {
          id: crypto.randomUUID(),
          tenantId,
          ruleType: ruleTypes[i],
          conditions: { thresholdDays: 7 },
          priorityWeight: (5 - i) * 10,
        }
      });
    }

  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

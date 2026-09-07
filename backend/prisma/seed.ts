import { PrismaClient, TenantType, TenantStatus, UserStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. System Roles and Permissions
  const permissions = [
    { resource: 'patient', action: 'read', description: 'Read patient data' },
    { resource: 'patient', action: 'write', description: 'Create and update patients' },
    { resource: 'appointment', action: 'read', description: 'View appointments' },
    { resource: 'appointment', action: 'write', description: 'Manage appointments' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { resource_action: { resource: perm.resource, action: perm.action } },
      update: {},
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();

  const adminRole = await prisma.role.create({
    data: {
      name: 'platform_admin',
      description: 'Platform Administrator',
      isSystem: true,
      rolePermissions: {
        create: allPerms.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const doctorRole = await prisma.role.create({
    data: {
      name: 'oncologist',
      description: 'Oncologist',
      isSystem: true,
      rolePermissions: {
        create: allPerms
          .filter((p) => p.resource === 'patient' || p.resource === 'appointment')
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  // 2. Default Platform Tenant
  const platformTenant = await prisma.tenant.upsert({
    where: { slug: 'cancercare-platform' },
    update: {},
    create: {
      name: 'CancerCare360 Platform',
      slug: 'cancercare-platform',
      type: TenantType.PLATFORM,
      status: TenantStatus.ACTIVE,
    },
  });

  // Sample Hospital Tenant
  const hospitalTenant = await prisma.tenant.upsert({
    where: { slug: 'city-hospital' },
    update: {},
    create: {
      name: 'City General Hospital',
      slug: 'city-hospital',
      type: TenantType.HOSPITAL,
      status: TenantStatus.ACTIVE,
    },
  });

  const hospital = await prisma.hospital.create({
    data: {
      tenantId: hospitalTenant.id,
      name: 'City General Hospital - Main Branch',
      code: 'CGH-MAIN',
    },
  });

  const department = await prisma.department.create({
    data: {
      tenantId: hospitalTenant.id,
      hospitalId: hospital.id,
      name: 'Medical Oncology',
      type: 'CLINICAL',
    },
  });

  // 3. Default Admin User
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: platformTenant.id,
        email: 'admin@cancercare360.com',
      },
    },
    update: {},
    create: {
      tenantId: platformTenant.id,
      keycloakId: uuidv4(), // In real scenario, sync this with actual Keycloak user
      email: 'admin@cancercare360.com',
      firstName: 'Platform',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // Sample Doctor User
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: hospitalTenant.id,
        email: 'doctor@cityhospital.com',
      },
    },
    update: {},
    create: {
      tenantId: hospitalTenant.id,
      departmentId: department.id,
      keycloakId: uuidv4(),
      email: 'doctor@cityhospital.com',
      firstName: 'Jane',
      lastName: 'Smith',
      status: UserStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: doctorRole.id,
          departmentId: department.id,
        },
      },
    },
  });

  const doctorUser = await prisma.user.findFirst({
    where: { tenantId: hospitalTenant.id, email: 'doctor@cityhospital.com' },
  });

  // 4. Sample Care Coordinator User
  let coordinatorRole = await prisma.role.findFirst({ where: { name: 'care_coordinator' } });
  if (!coordinatorRole) {
    coordinatorRole = await prisma.role.create({
      data: {
        name: 'care_coordinator',
        description: 'Oncology Care Coordinator',
        isSystem: true,
      },
    });
  }

  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: hospitalTenant.id,
        email: 'coordinator@cityhospital.com',
      },
    },
    update: {},
    create: {
      tenantId: hospitalTenant.id,
      departmentId: department.id,
      keycloakId: uuidv4(),
      email: 'coordinator@cityhospital.com',
      firstName: 'Pooja',
      lastName: 'Verma',
      status: UserStatus.ACTIVE,
      userRoles: {
        create: {
          roleId: coordinatorRole.id,
          departmentId: department.id,
        },
      },
    },
  });

  // 5. Sample Oncology Patient (Priya Sharma - Breast Cancer Stage IIB)
  const patient = await prisma.patient.upsert({
    where: {
      tenantId_mrn: {
        tenantId: hospitalTenant.id,
        mrn: 'MRN-ONC-2026-001',
      },
    },
    update: {},
    create: {
      tenantId: hospitalTenant.id,
      mrn: 'MRN-ONC-2026-001',
      abhaId: '91-5544-3322-1100',
      firstName: 'Priya',
      lastName: 'Sharma',
      dateOfBirth: new Date('1982-04-12'),
      gender: 'FEMALE' as any,
      phone: '+919876543210',
      email: 'priya.sharma@example.com',
      status: 'ACTIVE' as any,
      preferredLanguage: 'hi',
      address: {
        line1: 'B-402 Palm Greens',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400050',
      },
      communicationPreferences: {
        sms: true,
        whatsapp: true,
        email: true,
      },
    },
  });

  // 6. Longitudinal Care Journey
  let journey = await prisma.careJourney.findFirst({
    where: { tenantId: hospitalTenant.id, patientId: patient.id },
  });

  if (!journey && doctorUser) {
    journey = await prisma.careJourney.create({
      data: {
        tenantId: hospitalTenant.id,
        patientId: patient.id,
        diagnosisCategory: 'BREAST_CANCER',
        careStage: 'ACTIVE_TREATMENT' as any,
        primaryDoctorId: doctorUser.id,
        status: 'ACTIVE' as any,
        startedAt: new Date('2026-01-15'),
      },
    });
  }

  // 7. Care Gap Detection Rules
  const gapRules = [
    {
      ruleType: 'MISSED_APPOINTMENT',
      conditions: { lookbackDays: 7 },
      priorityWeight: 90,
    },
    {
      ruleType: 'OVERDUE_MILESTONE',
      conditions: { maxDelayDays: 14 },
      priorityWeight: 85,
    },
    {
      ruleType: 'PENDING_INVESTIGATION',
      conditions: { maxWaitDays: 5 },
      priorityWeight: 75,
    },
  ];

  for (const rule of gapRules) {
    const existingRule = await prisma.careGapRule.findFirst({
      where: { tenantId: hospitalTenant.id, ruleType: rule.ruleType },
    });
    if (!existingRule) {
      await prisma.careGapRule.create({
        data: {
          tenantId: hospitalTenant.id,
          ...rule,
          isActive: true,
        },
      });
    }
  }

  console.log('Seed completed successfully with realistic clinical oncology data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

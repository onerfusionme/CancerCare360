import { 
  PrismaClient, 
  TenantType, 
  TenantStatus, 
  UserStatus, 
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Clean-Slate Database Reset & Seeding...');

  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
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
      id: '0dbe98a4-4de6-453e-94e0-5ffa703c8fdc',
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
      id: 'a783fe7b-398c-43ff-a10f-69eabfc763cb',
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
      id: 'e6f2d1f3-3469-47c1-a11f-bc03437dfdc3',
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
      id: '11712c24-c7ea-40d5-93a9-0594c8754d25',
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
      id: 'b30c87a6-ec11-4bad-8d3c-b95c3413ea54',
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

  console.log('🎉 Clean-Slate Seeding Complete! Staff accounts and clinical departments ready. Zero mock patient data.');
}

main()
  .catch((e) => {
    console.error('❌ Error during clean-slate seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

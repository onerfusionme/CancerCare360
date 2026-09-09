import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Initiating complete clean-slate purge of all transactional & patient data...');

  await prisma.$transaction(async (tx) => {
    // 1. Clinical timeline & journeys
    await tx.journeyEvent.deleteMany();
    await tx.treatmentMilestone.deleteMany();
    await tx.careMilestone.deleteMany();
    await tx.careJourney.deleteMany();

    // 2. Appointments & Waitlist
    await tx.waitlistEntry.deleteMany();
    await tx.appointment.deleteMany();

    // 3. Diagnostics & Documents
    await tx.investigation.deleteMany();
    await tx.document.deleteMany();

    // 4. Care gaps & Outreach
    await tx.outreachLog.deleteMany();
    await tx.followUpTask.deleteMany();

    // 5. Patient Engagement & Feedback
    await tx.patientFeedback.deleteMany();
    await tx.referral.deleteMany();
    await tx.campaign.deleteMany();
    await tx.notification.deleteMany();
    await tx.serviceUtilization.deleteMany();

    // 6. Logs & Conflicts
    await tx.dataConflict.deleteMany();
    await tx.aiInteractionLog.deleteMany();
    await tx.auditLog.deleteMany();

    // 7. Care team mappings
    await tx.careTeamMember.deleteMany();
    await tx.careTeam.deleteMany();

    // 8. Patient entity & identifiers
    await tx.patientIdentifier.deleteMany();
    await tx.patientMergeHistory.deleteMany();
    await tx.patient.deleteMany();
  });

  console.log('Clean-slate purge complete! All patient and transactional records are now 0.');
}

main()
  .catch((e) => {
    console.error('Purge error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

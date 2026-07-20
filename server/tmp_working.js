const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctorProfile.findMany();
  for (const doc of doctors) {
    await prisma.workingDay.upsert({
      where: { doctorId_dayOfWeek: { doctorId: doc.id, dayOfWeek: 0 } },
      update: { isActive: true },
      create: { doctorId: doc.id, dayOfWeek: 0, isActive: true, startTime: '09:00', endTime: '17:00' }
    });
    await prisma.workingDay.upsert({
      where: { doctorId_dayOfWeek: { doctorId: doc.id, dayOfWeek: 6 } },
      update: { isActive: true },
      create: { doctorId: doc.id, dayOfWeek: 6, isActive: true, startTime: '09:00', endTime: '17:00' }
    });
  }
  console.log('Added weekends');
  await prisma.$disconnect();
}
main();

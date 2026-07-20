import prisma from './src/shared/database';
import { generateTimeSlots } from './src/shared/utils/helpers';

async function generateAllSlots() {
  console.log('Generating slots for all doctors...');
  const doctors = await prisma.doctorProfile.findMany({
    include: { workingDays: true }
  });

  let slotsCreated = 0;

  for (const doc of doctors) {
    const doctorId = doc.id;
    const workingDays = doc.workingDays;

    if (workingDays.length === 0) continue;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dayOfWeek = date.getDay();

      const workingDay = workingDays.find((d) => d.dayOfWeek === dayOfWeek);
      if (!workingDay || !workingDay.isActive) continue;

      const startHour = parseInt(workingDay.startTime.split(':')[0], 10);
      const endHour = parseInt(workingDay.endTime.split(':')[0], 10);
      const slots = generateTimeSlots(startHour, endHour, 30);

      for (let i = 0; i < slots.length - 1; i++) {
        const existingSlot = await prisma.availableSlot.findUnique({
          where: { doctorId_date_startTime: { doctorId, date, startTime: slots[i] } },
        });

        if (!existingSlot) {
          await prisma.availableSlot.create({
            data: {
              doctorId,
              date,
              startTime: slots[i],
              endTime: slots[i + 1] || `${String(endHour).padStart(2, '0')}:00`,
            },
          });
          slotsCreated++;
        }
      }
    }
    console.log(`Generated slots for Doctor: ${doc.fullName}`);
  }

  console.log(`Successfully created ${slotsCreated} slots!`);
}

generateAllSlots()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

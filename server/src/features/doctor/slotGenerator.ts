import prisma from '../../shared/database';
import { addDays, parse, format, isBefore, startOfDay, addMinutes } from 'date-fns';

export async function generateDoctorSlots(doctorId: string, daysToGenerate: number = 30) {
  // 1. Get the doctor's active working days
  const workingDays = await prisma.workingDay.findMany({
    where: { doctorId, isActive: true },
  });

  if (workingDays.length === 0) return;

  // 2. Clear existing future slots that are NOT booked yet
  const todayStr = new Date().toLocaleDateString('en-CA');
  const today = new Date(todayStr); // UTC midnight of local today

  await prisma.availableSlot.deleteMany({
    where: {
      doctorId,
      isBooked: false,
      date: { gte: today },
    },
  });

  const slotsToCreate = [];
  const slotDurationMinutes = 30; // 30 minute slots

  // 3. Generate slots for the next X days
  for (let i = 0; i < daysToGenerate; i++) {
    const currentDate = new Date(today);
    currentDate.setUTCDate(currentDate.getUTCDate() + i);
    const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    // Does the doctor work on this day?
    const workingDay = workingDays.find(wd => wd.dayOfWeek === dayOfWeek);
    if (!workingDay) continue;

    // Generate time slots based on startTime and endTime
    const startTimeStr = workingDay.startTime; // e.g., "09:00"
    const endTimeStr = workingDay.endTime;     // e.g., "17:00"

    let currentSlotTime = parse(startTimeStr, 'HH:mm', currentDate);
    const endTime = parse(endTimeStr, 'HH:mm', currentDate);

    while (isBefore(currentSlotTime, endTime)) {
      const slotEndTime = addMinutes(currentSlotTime, slotDurationMinutes);
      
      if (isBefore(endTime, slotEndTime)) break; // Don't exceed the end time

      slotsToCreate.push({
        doctorId,
        date: currentDate,
        startTime: format(currentSlotTime, 'HH:mm'),
        endTime: format(slotEndTime, 'HH:mm'),
        isBooked: false,
      });

      currentSlotTime = slotEndTime;
    }
  }

  // 4. Batch insert the new slots (ignoring conflicts using basic unique constraint logic if necessary, 
  // but since we deleted unbooked ones, this should be safe)
  
  // We should do this safely in case some slots are already booked.
  // We'll use a loop to create them, wrapping in try/catch to ignore unique constraint violations (already booked slots)
  for (const slot of slotsToCreate) {
    try {
      // Check if slot already exists (e.g. it was booked so it wasn't deleted)
      const existing = await prisma.availableSlot.findFirst({
        where: {
          doctorId: slot.doctorId,
          date: slot.date,
          startTime: slot.startTime,
        }
      });

      if (!existing) {
        await prisma.availableSlot.create({ data: slot });
      }
    } catch (e) {
      // Ignore duplicates
    }
  }

  console.log(`Generated slots for doctor ${doctorId}`);
}

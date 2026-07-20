import { PrismaClient, UserRole, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const specialties = [
  { name: 'Cardiology', nameAr: 'طب القلب', nameFr: 'Cardiologie', icon: 'heart' },
  { name: 'Dermatology', nameAr: 'طب الجلدية', nameFr: 'Dermatologie', icon: 'skin' },
  { name: 'General Practice', nameAr: 'طب عام', nameFr: 'Médecine Générale', icon: 'stethoscope' },
  { name: 'Orthopedics', nameAr: 'طب العظام', nameFr: 'Orthopédie', icon: 'bone' },
  { name: 'Pediatrics', nameAr: 'طب الأطفال', nameFr: 'Pédiatrie', icon: 'child' },
  { name: 'Neurology', nameAr: 'طب الأعصاب', nameFr: 'Neurologie', icon: 'brain' },
  { name: 'Ophthalmology', nameAr: 'طب العيون', nameFr: 'Ophtalmologie', icon: 'eye' },
  { name: 'Urology', nameAr: 'طب المسالك البولية', nameFr: 'Urologie', icon: 'kidney' },
  { name: 'Gastroenterology', nameAr: 'طب الجهاز الهضمي', nameFr: 'Gastro-entérologie', icon: 'stomach' },
  { name: 'ENT', nameAr: 'طب الأنف والأذن والحنجرة', nameFr: 'ORL', icon: 'ear' },
  { name: 'Dentistry', nameAr: 'طب الأسنان', nameFr: 'Dentisterie', icon: 'tooth' },
];

const doctors = [
  { email: 'doctor1@test.com', fullName: 'Dr. Ahmed Ben Ali', username: 'dr_ahmed', specialtyIdx: 0, city: 'Algiers', clinicName: 'Cabinet Cardiologique', price: 3000 },
  { email: 'doctor2@test.com', fullName: 'Dr. Fatima Zahra', username: 'dr_fatima', specialtyIdx: 1, city: 'Oran', clinicName: 'Clinique Dermatologique', price: 2500 },
  { email: 'doctor3@test.com', fullName: 'Dr. Mohamed Amine', username: 'dr_mohamed', specialtyIdx: 2, city: 'Constantine', clinicName: 'Centre Médical', price: 1500 },
  { email: 'doctor4@test.com', fullName: 'Dr. Sara Bouzid', username: 'dr_sara', specialtyIdx: 3, city: 'Algiers', clinicName: 'Cabinet Orthopédique', price: 4000 },
  { email: 'doctor5@test.com', fullName: 'Dr. Karim Mansouri', username: 'dr_karim', specialtyIdx: 4, city: 'Tlemcen', clinicName: 'Clinique Pédiatrique', price: 2000 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed specialties
  for (const spec of specialties) {
    await prisma.specialty.upsert({
      where: { name: spec.name },
      update: {},
      create: spec,
    });
  }
  console.log(`✅ ${specialties.length} specialties seeded`);

  // Seed doctors
  const hashedPassword = await bcrypt.hash('password123', 10);
  const allSpecialties = await prisma.specialty.findMany();

  for (const doc of doctors) {
    const specialty = allSpecialties[doc.specialtyIdx];

    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        phone: `+213${String(Math.floor(Math.random() * 9000000000) + 5500000000)}`,
        password: hashedPassword,
        role: UserRole.DOCTOR,
      },
    });

    await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: doc.fullName,
        username: doc.username,
        specialtyId: specialty.id,
        clinicName: doc.clinicName,
        address: `${doc.city}, Algeria`,
        description: `Experienced ${specialty.name.toLowerCase()} specialist with over 10 years of practice.`,
        consultationPrice: doc.price,
        latitude: 36.7538 + Math.random() * 0.1,
        longitude: 3.0588 + Math.random() * 0.1,
        isOpen: true,
      },
    });

    // Create working days Mon-Fri
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
    if (doctorProfile) {
      for (let day = 1; day <= 5; day++) {
        await prisma.workingDay.upsert({
          where: { doctorId_dayOfWeek: { doctorId: doctorProfile.id, dayOfWeek: day } },
          update: {},
          create: {
            doctorId: doctorProfile.id,
            dayOfWeek: day,
            isActive: true,
            startTime: '09:00',
            endTime: '17:00',
          },
        });
      }
    }

    console.log(`✅ Doctor ${doc.fullName} seeded`);
  }

  // Seed Clinic
  const clinicUser = await prisma.user.upsert({
    where: { email: 'clinic@test.com' },
    update: {},
    create: {
      email: 'clinic@test.com',
      phone: `+213${String(Math.floor(Math.random() * 9000000000) + 5500000000)}`,
      password: hashedPassword,
      role: UserRole.CLINIC,
    },
  });

  const clinicProfile = await prisma.clinicProfile.upsert({
    where: { userId: clinicUser.id },
    update: {},
    create: {
      userId: clinicUser.id,
      name: 'MawiDoc Central Clinic',
      address: 'Algiers, Algeria',
      description: 'A multi-specialty modern clinic providing top healthcare services.',
      latitude: 36.7540,
      longitude: 3.0590,
      specialties: {
        connect: [
          { name: 'Cardiology' },
          { name: 'Dermatology' },
          { name: 'Dentistry' },
        ]
      }
    }
  });

  // Assign Doctor 1 and Doctor 2 to the Clinic
  const doc1 = await prisma.user.findUnique({ where: { email: 'doctor1@test.com' } });
  const doc2 = await prisma.user.findUnique({ where: { email: 'doctor2@test.com' } });
  
  if (doc1 && doc2) {
    await prisma.doctorProfile.update({
      where: { userId: doc1.id },
      data: { clinicId: clinicProfile.id }
    });
    await prisma.doctorProfile.update({
      where: { userId: doc2.id },
      data: { clinicId: clinicProfile.id }
    });
  }

  // Add Gallery Photos
  await prisma.galleryPhoto.createMany({
    data: [
      { clinicId: clinicProfile.id, url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800' },
      { clinicId: clinicProfile.id, url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800' },
      { clinicId: clinicProfile.id, url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800' },
    ]
  });
  console.log(`✅ Clinic seeded`);

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

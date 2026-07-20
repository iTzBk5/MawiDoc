import { PrismaClient, UserRole, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "patient@test.com";
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      phone: "+213550000000",
      password: hashedPassword,
      role: UserRole.PATIENT,
      patientProfile: {
        create: {
          fullName: "Yassine Patient",
          username: "yassine_patient",
          age: 25,
          gender: Gender.MALE,
          city: "Algiers",
        }
      }
    }
  });

  console.log("Patient created successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

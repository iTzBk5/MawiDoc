import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    include: { patientProfile: true }
  });
  console.log(JSON.stringify(patients, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

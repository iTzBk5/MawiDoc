import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const docs = await prisma.doctorProfile.findMany({ include: { photos: true } });
  console.log(JSON.stringify(docs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

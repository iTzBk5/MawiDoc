-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'CLINIC';

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "patientName" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "doctor_profiles" ADD COLUMN     "clinicId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetPasswordCode" TEXT,
ADD COLUMN     "verificationCode" TEXT;

-- CreateTable
CREATE TABLE "clinic_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClinicSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_profiles_userId_key" ON "clinic_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ClinicSpecialties_AB_unique" ON "_ClinicSpecialties"("A", "B");

-- CreateIndex
CREATE INDEX "_ClinicSpecialties_B_index" ON "_ClinicSpecialties"("B");

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinic_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_profiles" ADD CONSTRAINT "clinic_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinic_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClinicSpecialties" ADD CONSTRAINT "_ClinicSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "clinic_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClinicSpecialties" ADD CONSTRAINT "_ClinicSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

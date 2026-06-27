-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('GROOMING', 'VET', 'TRAINING', 'BOARDING', 'OTHER');

-- AlterEnum: replace NEW with PENDING, add COMPLETED
ALTER TYPE "BookingStatus" RENAME VALUE 'NEW' TO 'PENDING';
ALTER TYPE "BookingStatus" ADD VALUE 'COMPLETED';

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "ServiceBooking" ADD COLUMN "serviceId" TEXT;
ALTER TABLE "ServiceBooking" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Service_providerId_isActive_idx" ON "Service"("providerId", "isActive");
CREATE INDEX "ServiceBooking_serviceId_idx" ON "ServiceBooking"("serviceId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceBooking" ADD CONSTRAINT "ServiceBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

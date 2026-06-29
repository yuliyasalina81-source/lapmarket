-- CreateEnum
CREATE TYPE "SlotBookedBy" AS ENUM ('USER', 'MANUAL');

-- AlterTable
ALTER TABLE "Slot" ADD COLUMN "bookedBy" "SlotBookedBy";

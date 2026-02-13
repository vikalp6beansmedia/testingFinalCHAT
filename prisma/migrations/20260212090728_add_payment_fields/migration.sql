/*
  Warnings:

  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "lastPaymentAt" TIMESTAMP(3),
ADD COLUMN     "lastPaymentStatus" TEXT,
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_razorpayPaymentId_key" ON "Subscription"("razorpayPaymentId");

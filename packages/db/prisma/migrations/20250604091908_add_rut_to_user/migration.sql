-- AlterTable
ALTER TABLE "User" ADD COLUMN "rut" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_rut_key" ON "User"("rut");
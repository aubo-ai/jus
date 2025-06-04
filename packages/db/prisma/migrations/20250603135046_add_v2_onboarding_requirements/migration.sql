-- AlterTable
ALTER TABLE "Onboarding" ADD COLUMN  "completed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Onboarding" ALTER COLUMN "completed" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN "website" TEXT;

-- CreateTable
CREATE TABLE "Context" (
    "id" TEXT NOT NULL DEFAULT generate_prefixed_cuid('ctx'::text),
    "organizationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Context_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Context_organizationId_idx" ON "Context"("organizationId");

-- CreateIndex
CREATE INDEX "Context_question_idx" ON "Context"("question");

-- CreateIndex
CREATE INDEX "Context_answer_idx" ON "Context"("answer");

-- CreateIndex
CREATE INDEX "Context_tags_idx" ON "Context"("tags");

-- AddForeignKey
ALTER TABLE "Context" ADD CONSTRAINT "Context_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
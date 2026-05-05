-- CreateTable
CREATE TABLE "IrbConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "n" INTEGER NOT NULL,
    "r" INTEGER NOT NULL,
    "s" INTEGER NOT NULL,
    "sequence" INTEGER[],
    "isValid" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrbConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeKind" TEXT NOT NULL,
    "irbSequence" INTEGER[],
    "packets" INTEGER NOT NULL,
    "errorProbability" DOUBLE PRECISION NOT NULL,
    "totalBits" INTEGER NOT NULL,
    "bitErrors" INTEGER NOT NULL,
    "successfulPackets" INTEGER NOT NULL,
    "recoveredPackets" INTEGER NOT NULL,
    "bitFlipRate" DOUBLE PRECISION NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "comparisons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "scorePct" DOUBLE PRECISION NOT NULL,
    "answers" JSONB NOT NULL,
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IrbConfig_userId_createdAt_idx" ON "IrbConfig"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SimulationRun_userId_createdAt_idx" ON "SimulationRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_createdAt_idx" ON "TestAttempt"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "IrbConfig" ADD CONSTRAINT "IrbConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

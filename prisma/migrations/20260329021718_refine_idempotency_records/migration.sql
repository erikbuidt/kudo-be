/*
  Warnings:

  - The primary key for the `idempotency_records` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `idempotency_records` table. All the data in the column will be lost.
  - Added the required column `request_type` to the `idempotency_records` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `idempotency_records` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IdempotencyRequestType" AS ENUM ('REDEEM_REWARD');

-- DropIndex
DROP INDEX "idempotency_records_key_user_id_key";

-- AlterTable
ALTER TABLE "idempotency_records" DROP CONSTRAINT "idempotency_records_pkey",
DROP COLUMN "id",
ADD COLUMN     "request_type" "IdempotencyRequestType" NOT NULL,
ADD COLUMN     "status" "IdempotencyStatus" NOT NULL DEFAULT 'PROCESSING',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "response" DROP NOT NULL,
ADD CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("key");

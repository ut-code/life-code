/*
  Warnings:

  - Added the required column `boardPreview` to the `BoardState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BoardState" ADD COLUMN     "boardPreview" JSONB NOT NULL;

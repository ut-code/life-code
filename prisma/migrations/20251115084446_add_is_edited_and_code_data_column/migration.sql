/*
  Warnings:

  - Added the required column `codeData` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isEdited` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "codeData" JSONB NOT NULL,
ADD COLUMN     "isEdited" BOOLEAN NOT NULL;

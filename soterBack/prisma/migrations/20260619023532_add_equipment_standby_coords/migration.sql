-- AlterEnum
ALTER TYPE "EquipmentStatus" ADD VALUE 'STANDBY';

-- AlterTable
ALTER TABLE "equipments" ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'STANDBY';

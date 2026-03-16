const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inserting MONTHLY in PlanType Enum...');
  try {
    await prisma.$executeRawUnsafe('ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS \'MONTHLY\';');
  } catch (e) {
    console.log("Enum add Error (can be ignored):", e.message);
  }
  
  console.log('Updating user_subscriptions to MONTHLY...');
  await prisma.$executeRawUnsafe('UPDATE "user_subscriptions" SET "planType" = \'MONTHLY\' WHERE "planType"::text = \'LIFETIME\';');
  console.log('Fixed enum mismatch successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

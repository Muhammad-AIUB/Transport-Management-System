import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed data here
  console.log("Seeding database...");

  // Example seed
  await prisma.feeMaster.create({
    data: {
      amount: 1000,
      description: "Monthly transport fee",
    },
  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
const prismaOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as const)
      : (["error"] as const),
};

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient(prismaOptions);
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;

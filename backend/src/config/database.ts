import { PrismaClient } from "@prisma/client";
type LogLevel = 'query' | 'info' | 'warn' | 'error';
const prismaOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as LogLevel[])
      : (["error"] as LogLevel[]),
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
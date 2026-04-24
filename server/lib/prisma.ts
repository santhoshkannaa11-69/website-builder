import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const createPrismaClient = () => {
    const adapter = new PrismaPg(databaseUrl);
    return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & {
    prisma?: ReturnType<typeof createPrismaClient>;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;

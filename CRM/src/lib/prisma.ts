import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

if (!process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config()
  } catch {
    // ignore in environments without dotenv
  }
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DIRECT_URL ||
  "postgresql://zafoor:zafoor_password@localhost:5432/zafoor_clinic"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function makePrismaClient() {
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? makePrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

export const db = prisma

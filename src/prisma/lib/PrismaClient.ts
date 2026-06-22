import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/client";

const connectionString = `${process.env.DATABASE_URL_SQLITE}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prismaClient = new PrismaClient({ adapter });

export { prismaClient };
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { Env } from "./env";

const adapter = new PrismaMariaDb({
  host: Env.DB_HOST,
  port: Env.DB_PORT,
  user: Env.DB_USER,
  password: Env.DB_PASSWORD,
  database: Env.DB_NAME,
  connectionLimit: 10,
});

class Database {
  public readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      adapter,
      log:
        Env.NODE_ENV === "development"
          ? ["query", "warn", "error"]
          : ["error"],
    });
  }

  public async connect(): Promise<void> {
    await this.client.$connect();
  }

  public async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }
}

export const database = new Database();
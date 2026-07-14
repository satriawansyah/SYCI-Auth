import "dotenv/config";

export class Env {
  static readonly APP_NAME = process.env.APP_NAME!;

  static readonly NODE_ENV = process.env.NODE_ENV!;

  static readonly PORT = Number(process.env.PORT);

  static readonly FRONTEND_URL = process.env.FRONTEND_URL!;

  static readonly DB_HOST = process.env.DATABASE_HOST!;

  static readonly DB_PORT = Number(process.env.DATABASE_PORT);

  static readonly DB_NAME = process.env.DATABASE_NAME!;

  static readonly DB_USER = process.env.DATABASE_USER!;

  static readonly DB_PASSWORD = process.env.DATABASE_PASSWORD!;
}
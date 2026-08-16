import type { Prisma } from '../../generated/prisma/client';
import { database } from '../../config/database';

export type DatabaseClient =
  | Prisma.TransactionClient
  | typeof database.client;

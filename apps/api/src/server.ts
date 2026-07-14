import app from "./app";
import { Env } from "./config/env";
import { logger } from "./config/logger";
import { database } from "./config/database";

async function bootstrap() {
  await database.connect();

  app.listen(Env.PORT, () => {
    logger.info(`🚀 ${Env.APP_NAME}`);
    logger.info(`Running at http://localhost:${Env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error(error);
  process.exit(1);
});
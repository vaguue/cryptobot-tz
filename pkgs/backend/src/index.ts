import { config } from "./config.js";
import { connectMongo } from "./db/mongo.js";
import logger from "./logger.js";
import { createApp } from "./server/app.js";

const main = async (): Promise<void> => {
  await connectMongo();
  logger.info(`Mongoose connected (${config.MONGO_DB_NAME})`);

  const app = createApp();
  app.listen(config.HTTP_PORT, () => {
    logger.info(`HTTP listening on :${config.HTTP_PORT}`);
  });
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import cli from "./src/cli/index.js";
import { DB } from "./src/db/index.js";
import script from "./src/scripts/index.js";
import "./src/utils/env.js";
import { extractArgs } from "./src/utils/index.js";

const logger = console.log;

async function main() {
  const {
    step: steps,
    model: models,
    service,
    path,
    image,
    db: dbName,
    name: appName,
    mongo_url,
    domain,
    modelsAll,
  } = cli.opts();

  for (const step of steps) {
    logger("start step", step);
    switch (step) {
      case "dirs":
        await script(logger, {}, "dirs", path);
        break;
      case "docker-service":
        await script(
          logger,
          {
            DB_NAME: dbName,
            APP_NAME: appName,
            BASE_URL: domain,
            MONGO_URL: mongo_url,
          },
          "service",
          service,
          image
        );
        break;
      case "db":
        const db = new DB(logger);
        await db.connect(dbName);
        if (modelsAll) await db.migrateAll();
        else for (const modelName of models) await db.migrate(modelName);
        await db.disconnect();
        break;
    }
  }
}
main();

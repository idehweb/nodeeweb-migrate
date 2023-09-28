import { DB } from "./src/db/index.js";
import script from "./src/scripts/index.js";
import "./src/utils/env.js";
import { extractArgs } from "./src/utils/index.js";

const logger = console.log;

async function main() {
  const { steps, models, service, path, image } = extractArgs(
    process.argv.join(" "),
    (opt) => {
      switch (opt) {
        case "-s":
        case "--service":
          return "service";

        case "--image":
          return "image";

        case "--path":
          return "path";

        case "--step":
          return "steps";

        case "-m":
        case "--model":
          return "models";
        default:
          return null;
      }
    }
  );

  const db = new DB(logger);
  await db.connect();

  for (const step of steps) {
    logger("start step", step);
    switch (step) {
      case "dirs":
        await script(logger, "dirs", path?.[0]);
        break;
      case "docker-service":
        await script(logger, "service", service[0], image?.[0]);
        break;
      case "db":
        for (const modelName of models) await db.migrate(modelName);
        break;
    }
  }

  await db.disconnect();
}
main();

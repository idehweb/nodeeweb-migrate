import chalk from "chalk";
import exec from "../utils/exec.js";
import { getPath } from "../utils/path.js";
import { getEnv } from "../utils/env.js";

export default function script(logger, envs, cmd, ...args) {
  const env = {
    MONGO_URL: getEnv("mongo_url"),
    DB_NAME: envs.DB_NAME,
    APP_NAME: envs.APP_NAME,
    BASE_URL: envs.BASE_URL,
    PORT: "3000",
  };
  return exec(`${getPath("src", "scripts", `${cmd}.sh`)} ${args.join(" ")}`, {
    logger: (...args) => logger(chalk.bgGray("[script]"), ...args),
    envs: env,
  });
}

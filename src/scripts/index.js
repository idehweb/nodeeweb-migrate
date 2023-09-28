import chalk from "chalk";
import exec from "../utils/exec.js";
import { getPath } from "../utils/path.js";
import { getEnv } from "../utils/env.js";

export default function script(logger, envs, cmd, ...args) {
  const env = {
    MONGO_URL: getEnv("mongo_url"),
    PORT: "3000",
    ...envs,
  };
  return exec(`${getPath("src", "scripts", `${cmd}.sh`)} ${args.join(" ")}`, {
    logger: (...args) => logger(chalk.bgGray("[script]"), ...args),
    envs: env,
  });
}

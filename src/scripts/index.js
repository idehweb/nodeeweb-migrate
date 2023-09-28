import chalk from "chalk";
import exec from "../utils/exec.js";
import { getPath } from "../utils/path.js";

export default function script(logger, cmd, ...args) {
  return exec(`${getPath("src", "scripts", `${cmd}.sh`)} ${args.join(" ")}`, {
    logger: (...args) => logger(chalk.bgGray("[script]"), ...args),
  });
}

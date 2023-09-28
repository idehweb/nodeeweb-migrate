import chalk from "chalk";
import { spawn } from "child_process";

export default function exec(cmd, { logger = console.log } = {}) {
  logger.log(chalk.yellow(cmd));
  const sp = spawn(cmd, {
    shell: true,
    stdio: [process.stdin, process.stdout, process.stderr],
    windowsHide: true,
  });
  return new Promise((resolve, reject) => {
    sp.on("close", (code) => {
      if (code && code !== 0)
        return reject(new Error(`Exec Failed\ncode:${code}\ncmd:${cmd}`));
      resolve(true);
    });
  });
}

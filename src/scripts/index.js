import exec from "../utils/exec.js";
import { getPath } from "../utils/path.js";

export default function script(logger, cmd, ...args) {
  return exec(`${getPath("scripts", `${cmd}.sh`, ...args)}`, { logger });
}

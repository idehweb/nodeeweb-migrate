import exec from "../utils/exec";
import { getPath } from "../utils/path";

export default function script(logger, cmd, ...args) {
  return exec(`${getPath("scripts", `${cmd}.sh`, ...args)}`, { logger });
}

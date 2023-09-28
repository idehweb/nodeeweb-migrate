import path from "path";
import { cwd } from "process";

export function getPath(...paths) {
  return path.resolve(cwd(), ...paths);
}

import path, { join } from "path";
import { cwd } from "process";

export function getPath(...paths) {
  return path.resolve(cwd(), ...paths);
}

export function getRelativePath(...path) {
  return `./${join(...path)}`;
}

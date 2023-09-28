import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".local.env") });

export function getEnv(envKey = "") {
  envKey = envKey.replace(/[-\s]/g, "_").toUpperCase();
  return process.env[envKey];
}

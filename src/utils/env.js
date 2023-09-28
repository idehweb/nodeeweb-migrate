import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".local.env") });

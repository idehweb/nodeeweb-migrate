import mongoose, { Schema } from "mongoose";
import { getEnv } from "../utils/env.js";
import { getPath } from "../utils/path.js";
import chalk from "chalk";

export class DB {
  constructor(logger = console.log) {
    this.logger = (...args) => logger(chalk.bgGray("[db]"), ...args);
  }
  async connect() {
    const db = await mongoose.connect(getEnv("mongo_url"));
    this.db = db;
    this.logger(chalk.green("db connect"));
  }
  async disconnect() {
    await this.db.disconnect();
    this.logger(chalk.red("db disconnect"));
  }

  async migrate(modelName) {
    const schema = new Schema({}, { strict: false, strictQuery: false });
    const model = this.db.model(modelName, schema);
    const collection = mongoose.pluralize()(modelName);

    // backup
    model.aggregate([{ $out: `${collection}-bk` }]);
    this.logger(chalk.gray("backup", collection));

    // query
    try {
      const { default: plCreator } = require(getPath("db", `${modelName}.js`));
      const pl = plCreator();
      await model.aggregate(pl, { allowDiskUse: true });
      this.logger(chalk.green("resolve", modelName, "successfully"));
    } catch (err) {
      this.logger(chalk.red("resolve", modelName, "error", err));
    }
  }
}

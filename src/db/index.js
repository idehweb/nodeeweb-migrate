import mongoose, { Schema, model } from "mongoose";
import fs from "fs";
import { getEnv } from "../utils/env.js";
import { getPath, getRelativePath } from "../utils/path.js";
import chalk from "chalk";

export class DB {
  constructor(logger = console.log) {
    this.logger = (...args) => logger(chalk.bgGray("[db]"), ...args);
  }
  async connect(dbName) {
    const db = await mongoose.connect(getEnv("mongo_url"), { dbName });
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
    await model.aggregate([{ $out: `${collection}-bk` }]);
    this.logger(chalk.gray("backup", collection));

    // remove indexes
    await model.collection.dropIndexes();
    this.logger(chalk.gray(`drop ${collection} indexes`));

    // query
    try {
      const { default: plCreator } = await import(
        getRelativePath(`${modelName}.js`)
      );
      const pl = plCreator();
      await model.aggregate(pl, { allowDiskUse: true });
      this.logger(chalk.green("migrate", modelName, "successfully"));
    } catch (err) {
      this.logger(chalk.red("migrate", modelName, "error", err));
    }
  }

  async migrateAll() {
    const models = (await fs.promises.readdir(getPath("src", "db")))
      .filter((name) => name !== "index.js")
      .map((name) => name.split(".")[0]);
    for (const model of models) {
      await this.migrate(model);
    }
  }
}

import mongoose, { Schema } from "mongoose";
import { getEnv } from "../utils/env";
import { getPath } from "../utils/path";

export class DB {
  constructor(logger = console.log) {
    this.logger = (...args) => logger("[db]", ...args);
  }
  async connect() {
    const db = await mongoose.connect(getEnv("mongo_url"));
    this.db = db;
    this.logger("db connect");
  }
  async disconnect() {
    await this.db.disconnect();
    this.logger("db disconnect");
  }

  async migrate(modelName) {
    const schema = new Schema({}, { strict: false, strictQuery: false });
    const model = this.db.model(modelName, schema);
    const collection = mongoose.pluralize()(modelName);

    // backup
    model.aggregate([{ $out: `${collection}-bk` }]);
    this.logger("backup", collection);

    // query
    try {
      const { default: plCreator } = require(getPath("db", `${modelName}.js`));
      const pl = plCreator();
      await model.aggregate(pl, { allowDiskUse: true });
      this.logger("resolve", modelName, "successfully");
    } catch (err) {
      this.logger("resolve", modelName, "error", err);
    }
  }
}

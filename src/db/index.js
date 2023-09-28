import mongoose from "mongoose";

export class DB {
  async connect() {
    mongoose.connect();
  }
  async disconnect() {}
}

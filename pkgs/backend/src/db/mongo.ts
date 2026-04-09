import mongoose from "mongoose";
import { config } from "../config.js";

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.MONGO_URI, { dbName: config.MONGO_DB_NAME });
  return mongoose;
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

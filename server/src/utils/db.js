import mongoose from "mongoose";

export const connectDb = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sydney_events";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { dbName: "sydney_events" });
};

import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pet-care-smart";
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true },
    email: String,
    name: String,
    avatarUrl: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

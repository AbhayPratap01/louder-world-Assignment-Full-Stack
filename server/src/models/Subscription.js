import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    email: { type: String, required: true },
    consent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

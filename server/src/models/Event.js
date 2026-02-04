import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startsAt: Date,
    endsAt: Date,
    venueName: String,
    venueAddress: String,
    city: { type: String, default: "Sydney" },
    description: String,
    categories: [String],
    imageUrl: String,
    sourceName: String,
    sourceUrl: String,
    status: {
      type: String,
      enum: ["new", "updated", "inactive", "imported"],
      default: "new",
    },
    lastScrapedAt: Date,
    importedAt: Date,
    importedBy: String,
    importNotes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);

import dotenv from "dotenv";
import { connectDb } from "../utils/db.js";
import { sources } from "./sources.js";
import { scrapeSource } from "./parse.js";
import { normalizeEvent } from "./normalize.js";
import { Event } from "../models/Event.js";

dotenv.config();
await connectDb();

for (const source of sources) {
  const events = await scrapeSource(source);
  const seenUrls = new Set(events.map((event) => event.sourceUrl));

  for (const event of events) {
    const normalized = normalizeEvent(event);
    const existing = await Event.findOne({ sourceUrl: normalized.sourceUrl });

    if (!existing) {
      await Event.create({
        ...normalized,
        status: "new",
        lastScrapedAt: new Date(),
      });
      continue;
    }

    const hasChanges =
      existing.title !== normalized.title ||
      existing.startsAt?.toISOString() !== normalized.startsAt?.toISOString() ||
      existing.venueName !== normalized.venueName ||
      existing.venueAddress !== normalized.venueAddress ||
      existing.description !== normalized.description ||
      existing.imageUrl !== normalized.imageUrl ||
      JSON.stringify(existing.categories || []) !== JSON.stringify(normalized.categories || []);

    if (hasChanges) {
      existing.set({
        ...normalized,
        status: "updated",
        lastScrapedAt: new Date(),
        isActive: true,
      });
      await existing.save();
    } else {
      existing.set({ lastScrapedAt: new Date(), isActive: true });
      await existing.save();
    }
  }

  await Event.updateMany(
    {
      sourceName: source.name,
      sourceUrl: { $nin: Array.from(seenUrls) },
      isActive: true,
    },
    { status: "inactive", isActive: false }
  );

  await Event.updateMany(
    { startsAt: { $lt: new Date() }, isActive: true },
    { status: "inactive", isActive: false }
  );
}

process.exit(0);

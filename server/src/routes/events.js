import express from "express";
import { Event } from "../models/Event.js";
import { Subscription } from "../models/Subscription.js";

export const eventsRouter = express.Router();

eventsRouter.get("/", async (req, res) => {
  const { city = "Sydney", q, start, end, status } = req.query;
  const filters = {
    city,
  };

  if (q) {
    filters.$or = [
      { title: new RegExp(q, "i") },
      { venueName: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
    ];
  }

  if (status) {
    filters.status = status;
  }

  if (start || end) {
    filters.startsAt = {};
    if (start) filters.startsAt.$gte = new Date(start);
    if (end) filters.startsAt.$lte = new Date(end);
  }

  const events = await Event.find(filters).sort({ startsAt: 1 });
  res.json(events);
});

eventsRouter.post("/subscribe", async (req, res) => {
  const { eventId, email, consent } = req.body;
  if (!email || !eventId) {
    return res.status(400).json({ message: "Email and eventId are required" });
  }

  const subscription = await Subscription.create({ eventId, email, consent });
  const event = await Event.findById(eventId);

  res.json({
    subscriptionId: subscription.id,
    redirectUrl: event?.sourceUrl,
  });
});

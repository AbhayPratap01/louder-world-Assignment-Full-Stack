import express from "express";
import { Event } from "../models/Event.js";

export const adminRouter = express.Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

adminRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

adminRouter.get("/events", requireAuth, async (req, res) => {
  const { city = "Sydney", q, start, end, status } = req.query;
  const filters = { city };

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

adminRouter.post("/import", requireAuth, async (req, res) => {
  const { eventId, importNotes } = req.body;
  const updated = await Event.findByIdAndUpdate(
    eventId,
    {
      status: "imported",
      importedAt: new Date(),
      importedBy: req.user?.email || "admin",
      importNotes,
    },
    { new: true }
  );

  res.json(updated);
});

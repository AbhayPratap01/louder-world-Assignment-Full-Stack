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

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { connectDb } from "./utils/db.js";
import { configurePassport } from "./utils/passport.js";
import { eventsRouter } from "./routes/events.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { scheduleScrapes } from "./scraper/scheduler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  })
);

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/events", eventsRouter);
app.use("/api/admin", adminRouter);
app.use("/auth", authRouter);

await connectDb();
scheduleScrapes();

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

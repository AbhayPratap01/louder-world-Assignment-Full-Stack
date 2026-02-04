import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

export const configurePassport = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const user = await User.findOneAndUpdate(
            { googleId: profile.id },
            {
              googleId: profile.id,
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value || "",
            },
            { upsert: true, new: true }
          );
          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
};

# Sydney Events Assignment

This repository contains a minimal MERN-style implementation for the Sydney event scraping assignment.

## Structure
- `server`: Express + MongoDB API, scraper, Google OAuth auth.
- `client`: React + Vite UI for public listings and the admin-style preview panel.

## Setup
1. Install dependencies:
   - `cd server && npm install`
   - `cd ../client && npm install`
2. Configure environment variables (see `server/.env.example`).
3. Start services:
   - `cd server && npm run dev`
   - `cd client && npm run dev`
4. Run scraper manually:
   - `cd server && npm run scrape`

## Notes
- Scraper targets Time Out Sydney and City of Sydney and runs hourly.
- Dashboard actions require Google OAuth login.

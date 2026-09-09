# Nikal Backend

Node.js + Express + MongoDB (Mongoose) API for the Nikal carpooling app.

## Structure

```
server.js
src/
  config/      # DB connection, Firebase Admin init
  models/      # Mongoose schemas
  controllers/ # Route handlers
  routes/      # Express routers
  middleware/  # auth, adminOnly, error handling
  utils/       # jwt signing, async handler
  sockets/     # Socket.IO (booking chat)
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

   - `MONGODB_URI` — MongoDB Atlas connection string.
   - `JWT_SECRET` / `JWT_EXPIRES_IN` — used to sign the app's own session JWTs.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — from a
     Firebase service account, used to verify phone-OTP ID tokens sent by the mobile app.
   - `CLIENT_ORIGIN` — allowed CORS origin (and Socket.IO origin).

3. Run in development (auto-restarts on file changes):
   ```bash
   npm run dev
   ```

4. Run in production:
   ```bash
   npm start
   ```

The server listens on `PORT` (default `4000`) and exposes `GET /health` for a liveness check.

## Auth flow

1. Mobile app signs the user in with Firebase (phone OTP) and gets a Firebase ID token.
2. `POST /auth/firebase` with `{ "idToken": "<firebase-id-token>" }` — the server verifies
   the token with `firebase-admin`, upserts a `User` by phone number, and returns
   `{ token, user }` where `token` is the app's own JWT.
3. Send that JWT as `Authorization: Bearer <token>` on subsequent requests.

## Routes

| Method | Path         | Auth       | Description                    |
|--------|--------------|------------|---------------------------------|
| GET    | /health      | none       | Liveness check                  |
| POST   | /auth/firebase | none     | Exchange a Firebase ID token for a JWT |
| GET    | /users/me    | required   | Get the current user            |
| PUT    | /users/me    | required   | Update the current user's profile |
| POST   | /vehicles    | required   | Add a vehicle for the current user |
| GET    | /vehicles    | required   | List the current user's vehicles |

`adminOnly` middleware is available in `src/middleware/auth.js` for future admin-only routes
(checks `req.user.isAdmin`).

## Data models

`User`, `Vehicle`, `Ride`, `Booking`, `Payment`, `Rating`, `Message`, `Report`, and `Payout`
are all defined under `src/models`. `Ride.from.loc` and `Ride.to.loc` are GeoJSON `Point`s
with `2dsphere` indexes for geospatial nearby-ride queries.

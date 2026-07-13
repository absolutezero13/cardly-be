# Cardly AI backend

This repository contains the backend API for the [Cardly AI mobile app](https://github.com/absolutezero13/cardly). It authenticates mobile requests, analyzes card images with Gemini, and persists users, collections, and saved card metadata.

## Architecture

The service uses Node.js, Express, and TypeScript with a small route -> middleware -> controller -> service/model structure:

- Firebase Admin verifies the ID token attached by the mobile app.
- Authenticated user IDs scope database access.
- Multer keeps the two scan images in memory long enough to send them to Gemini; scan analysis does not require a database connection.
- Gemini returns a structured JSON response constrained by a response schema.
- Mongoose schemas validate MongoDB writes and define the indexes used by card and collection queries.
- The MongoDB connection is cached on `globalThis` for reuse across warm Vercel invocations.

The backend owns the Gemini credential and analysis prompt so those responsibilities are not exposed to the mobile client. The scan and persistence steps are separate: an analyzed card is written to MongoDB only after the user reviews and saves it.

## API

`GET /health` is public. Every other route requires `Authorization: Bearer <Firebase ID token>`.

- `POST /cards/scan` analyzes `front` and `back` multipart image fields.
- `/cards` provides authenticated card CRUD.
- `/collections` provides authenticated collection CRUD.
- `/users` creates or retrieves the authenticated user's backend record and seeds default collections for a new user.

The scan route limits uploads to two supported images and defaults to 2 MB per image. It returns distinct status codes for missing or unsupported images, oversized uploads, unidentified cards, unavailable analysis, and invalid model responses.

## Third-party services

- **Gemini 2.5 Flash-Lite** performs multimodal card recognition. Its image input and structured response schema keep the integration small and avoid parsing free-form output.
- **MongoDB Atlas** stores users, collections, and card metadata. Mongoose supplies schema validation and query indexes while Atlas provides a practical managed free tier.
- **Firebase Admin** verifies the anonymous Firebase identities created by the mobile app, keeping authorization decisions on the server.

## Setup

Node.js 20 or newer is required.

```bash
npm install
cp .env.example .env
npm run dev
```

Configure `.env` with:

```dotenv
MONGODB_URI=
GEMINI_API_KEY=
GEMINI_CARD_ANALYSIS_MODEL=gemini-2.5-flash-lite
MAX_CARD_IMAGE_BYTES=2097152
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
PORT=3000
```

`MONGODB_URI` and `GEMINI_API_KEY` are required. The model, upload limit, and port have the defaults shown above. Hosted environments need the three Firebase service-account values; local development may use Application Default Credentials. Escaped `\\n` sequences in `FIREBASE_PRIVATE_KEY` are converted before Firebase Admin is initialized.

## Validation

```bash
npm run typecheck
npm run build
```

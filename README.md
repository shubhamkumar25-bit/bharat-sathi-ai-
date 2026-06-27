# BharatSaathi AI

BharatSaathi AI is a multilingual React application for career guidance, government scheme discovery, resume building, farmer support, and student support. The project is scaffolded for Firebase Authentication, Firestore, and Gemini-based AI conversations.

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS
- React Router
- Firebase Auth + Firestore
- Gemini API
- Web Speech API for voice input and output

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
copy .env.example .env
```

3. Fill in your Firebase and Gemini keys in `.env`.

4. Start the app:

```bash
npm run dev
```

## Firebase

Create a Firebase project and enable:

- Authentication with Email/Password and Google if needed
- Firestore Database

Use the generated config values in `.env`.

## Deployment

Build the app with:

```bash
npm run build
```

Deploy the static output from `dist/` to Netlify, Vercel, Firebase Hosting, or any static host.

## Notes

- Gemini calls are isolated in `src/services/gemini.ts`.
- Firestore read/write helpers are in `src/services/firestore.ts`.
- Protected routes guard the dashboard and user modules.
- The UI is mobile-first with light/dark support.
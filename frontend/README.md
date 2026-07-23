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

The project is split into perfectly isolated `frontend` and `backend` modules. 

1. Install dependencies and start the backend:

```bash
cd backend
npm install
npm run dev
```

2. Copy environment variables in the frontend and start the client:

```bash
cd frontend
copy .env.example .env
# Fill in your Firebase and Gemini keys in .env
npm install
npm run dev
```

## Firebase

Create a Firebase project and enable:

- Authentication with Email/Password and Google if needed
- Firestore Database

Use the generated config values in `frontend/.env`.

## Deployment

Build the frontend app with:

```bash
cd frontend
npm run build
```

Deploy the static output from `frontend/dist/` to Netlify, Vercel, Firebase Hosting, or any static host.

## Notes

- Gemini calls are isolated in `frontend/src/services/gemini.ts` and the backend.
- Firestore read/write helpers are in `frontend/src/services/firestore.ts`.
- Protected routes guard the dashboard and user modules.
- The UI is mobile-first with light/dark support.
# AI Context and Notes

## AI Tools and Work Breakdown
- **Tools Used:** Antigravity IDE (Gemini 3.1 Pro, Gemini 3.5 Flash, Claude sonnet, claude opus), Cursor IDE, Claude AI, and ChatGPT.
- **Work Split:** 
  - **AI handled:** Writing the boilerplate, setting up the Discord ED25519 signature verification middleware, designing the Prisma schema, constructing the React+Tailwind UI, and writing the integration logic for the Groq SDK.
  - **I handled:** Defining the architectural boundaries, enforcing the project's exact folder structure, writing code for logical edge cases (like strict date validations), manually testing the bot in Discord, instructing the AI to refine its prompt engineering to be more context-aware, and migrating the database from MySQL to PostgreSQL (Neon).

## Key Decisions
1. **Prisma ORM with PostgreSQL (Neon):** I chose PostgreSQL hosted on Neon rather than a local MySQL instance. It provides a robust, type-safe schema and makes the app instantly deployable to serverless environments.
2. **Groq AI for Inference:** I chose to use the Groq API running `llama-3.3-70b-versatile` for the AI triage. Discord strictly requires interaction endpoints to respond within 3 seconds. Groq's LPU inference engine provides near-instantaneous text generation, which easily allows synchronous or deferred responses without timing out.
3. **Database-backed JWT Authentication:** Initially, the AI suggested using hardcoded `.env` variables for the Admin Dashboard login. I decided to pivot to a fully database-backed JWT approach with a `User` table and a `seed.js` script to maximize security and allow for future multi-admin expansion.

## Recent Improvements
- **Dynamic Settings UI:** I expanded the dashboard to allow administrators to dynamically edit the Groq AI System Prompts directly from the React UI without touching the source code. The changes are saved to the database and override the hardcoded prompts instantly.
- **Interactive Discord Components:** Implemented an "Acknowledge" button on the `/report` command that triggers a secondary interaction, seamlessly updating the message state in Discord.
- **Cross-Origin Auth:** Updated the JWT cookie settings (`sameSite: 'none'`, `secure: true`) to flawlessly support authenticating against VS Code Port Forwarding during local development.

## Hardest Bug / Wrong Turn
**The Bug:** The AI confidently wrote the `AuthContext.tsx` file for the React frontend, importing `ReactNode` directly alongside standard React hooks (`import { createContext, useState, ReactNode } from 'react'`). The code worked perfectly during local development with Vite's development server.
**How I noticed & Fixed it:** When I went to run the final production build (`npm run build`) to prepare for deployment, the entire build crashed! I noticed a hidden TypeScript error: `error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.` The AI completely missed this strict Vite TS configuration quirk. I fixed it by manually separating the import into `import type { ReactNode } from 'react';`.

**Honorable Mention Bug:** A single space in the `.env` file (`GROQ_API_KEY ="..."`) caused the AI integration to silently fail because Node's `dotenv` parser included the space in the key name, resulting in `undefined`.

## What to Improve with More Time
1. **Queuing for Failure Resilience:** Instead of relying entirely on `handleLeaveSubmit(req).catch(...)` running in the background of the Express memory space, I would integrate a Redis queue (like BullMQ). This ensures that if the server crashes while Groq is generating a response, the job isn't lost.
2. **WebSocket Real-time Updates:** Currently, the React dashboard polls the backend every 10 seconds for new commands. With more time, I would implement Socket.io to push real-time database updates to the client instantly.

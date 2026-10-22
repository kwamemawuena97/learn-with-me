# LinguaQuest — English Learning MVP

A responsive, Duolingo-inspired learning web app built with React, TypeScript, and Vite.

## Features
- Eight English lessons across A1 foundations and the next A2 level, with five questions each
- Multiple-choice quiz with instant feedback and explanations
- XP rewards (10 XP per correct answer; 10 XP perfect lesson bonus)
- Levels (100 XP per level)
- Daily XP goal
- Consecutive-day streak tracking
- Optional Supabase email accounts with cloud-synced learner progress
- Level-adaptive AI Tutor with structured corrections and suggested replies
- Daily activity history and consecutive-answer achievements
- Course completion, answer accuracy, and achievements
- Offline progress saved in browser localStorage
- Responsive desktop and mobile layouts
- Reset progress control

## Requirements
- Node.js 20.19+ or 22.12+ recommended
- npm

## Run locally
1. Extract this ZIP.
2. Open a terminal in the `linguaquest` folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Connect Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates the learner progress table and row-level security policies so each account can access only its own data.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon/publishable key from the Supabase project API settings.
4. In Supabase Authentication URL settings, allow the local app URL (`http://localhost:5173`) and your deployed app URL. Configure email confirmation to match how you want accounts activated.
5. Restart the dev server. The account form is in **My progress**.

The browser uses only the Supabase anon/publishable key. Never put a service-role key in the frontend. Existing local progress is copied to the first account that signs in on that browser; a different account starts with its own cloud progress. If Supabase is not configured, the app continues in local-only mode.

## Enable the AI Tutor

1. Complete the Supabase project setup above and install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. From the project folder, deploy the Edge Function:

   ```bash
   supabase functions deploy english-tutor
   ```

3. Store the OpenAI API key as a server-side Supabase secret:

   ```bash
   supabase secrets set OPENAI_API_KEY=your-key
   ```

   Optionally set `OPENAI_MODEL` to choose a compatible chat-completions model. Never add the OpenAI key to a Vite env file or browser code.
4. Sign in to LinguaQuest and open **AI Tutor**. The function reads the learner's XP through their authenticated row-level-security context, applies the matching Level 1–5 policy, and validates the four-field JSON reply before returning it.

The tutor needs a signed-in account and a deployed Edge Function. It does not generate pretend or offline AI responses when these services are unavailable.

## Build for production

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Test and type-check

```bash
npm test
npm run typecheck
npm run build
```

Tests cover answer normalization, accepted free-text answers, A1 curriculum structure, replay XP prevention, streak continuity, missed-day resets, and daily XP rollover.

## Architecture and deployment notes

- The frontend is React 19, TypeScript, and Vite, with Supabase JavaScript authentication/database support.
- The current app is a state-driven single-page experience rather than a multi-route application. `vercel.json` provides the SPA fallback for page refreshes.
- Course exercises are beginning to move out of the React component into [src/data/curriculum.ts](src/data/curriculum.ts).
- Progress is saved locally and, when signed in, in the existing `learner_progress` table.
- Lesson rewards currently remain client-calculated; the reviewed SQL migration in `supabase/migrations/20261022000001_secure_lesson_completion.sql` provides a server-side design but must be tested and approved before application.
- The tutor Edge Function requires its own Supabase deployment and server-side `OPENAI_API_KEY` secret.

## Vercel environment variables

Configure these values in Vercel Project Settings. Do not add the Supabase access token, service-role key, database password, or OpenAI key as `VITE_*` variables.

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

## Project structure

```text
linguaquest/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── .env.example
├── supabase/
│   ├── functions/
│   │   └── english-tutor/
│   │       └── index.ts
│   └── schema.sql
└── src/
   ├── account.css
   ├── App.tsx
   ├── learning-path.css
   ├── main.tsx
   ├── styles.css
   ├── tutor.css
   ├── vite-env.d.ts
   └── lib/
      ├── tutor.ts
      └── supabase.ts
```

## Notes
- Without Supabase credentials, progress remains in local browser storage.
- Daily activity is recorded when a lesson is completed. XP is awarded once per lesson; replays continue to count toward answer accuracy but do not farm XP.
- The streak uses the device's local calendar date.
- Lesson content and XP calculations still run in the client. Production deployments should validate reward calculations on a trusted backend and add automated tests for progression and account flows.

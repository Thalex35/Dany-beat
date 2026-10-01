# Dany Beats

Dany Beats is a full-stack beat catalogue and producer platform. Visitors can discover and preview instrumentals, explore licensing details, and contact the producer about a purchase. The producer can manage the catalogue and review engagement through a protected admin area.

Online payments are not enabled. Purchase inquiries are handled through WhatsApp.

## Features

- Responsive public pages for the home page, beat catalogue, beat details, about, and contact.
- Catalogue search and filters for beat discovery.
- Audio previews for uploaded beats and YouTube-backed tracks.
- A shared player with controls that remains available while navigating between pages.
- Supabase authentication, user profiles, likes, and comments.
- Beat licensing and cart requests, with purchase inquiries directed to WhatsApp.
- Admin tools for beats, users, comments, and site settings.
- Engagement analytics for catalogue views, playback, and user interactions.
- Supabase Row Level Security and migrations for application data.

## Stack

- React 19, TypeScript, and TanStack Start/Router
- Tailwind CSS 4
- Supabase Auth, PostgreSQL, Storage, and Realtime
- Vite and Nitro; the Vite configuration uses the Cloudflare module preset by default
- Vitest for unit tests

## Requirements

- Node.js 20 or 22
- npm
- A Supabase project with the project's migrations applied

## Local Development

```sh
git clone https://github.com/Thalex35/Dany-beat.git
cd Dany-beat
npm ci
```

Create a local environment file such as `.env.local` and configure the Supabase URL and publishable key. The browser client accepts the `VITE_` aliases; server-side authentication middleware reads the server variable names.

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

`SUPABASE_SERVICE_ROLE_KEY` is only for trusted server-side operations that require elevated access. Never prefix it with `VITE_` or expose it to the browser.

Apply pending database migrations using the Supabase CLI after linking the project:

```sh
supabase link --project-ref <project-ref>
supabase db push
```

Start the development server:

```sh
npm run dev
```

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm test`        | Run the Vitest test suite            |
| `npm run lint`    | Run ESLint                           |
| `npm run format`  | Format files with Prettier           |

## Routes

| Route          | Description                          |
| -------------- | ------------------------------------ |
| `/`            | Home page and featured beats         |
| `/beats`       | Public beat catalogue                |
| `/beats/:slug` | Beat details, playback, and comments |
| `/about`       | Producer information                 |
| `/contact`     | Contact options                      |
| `/auth`        | Sign in and account access           |
| `/profile`     | Authenticated user profile           |
| `/admin`       | Protected administration area        |

Admin sections include beat management, users, comments, settings, and cart requests.

## Supabase

Database schema changes are maintained in `supabase/migrations/`. Storage buckets, authentication, authorization policies, and the Edge Function are configured in the `supabase/` directory. Review the migrations and environment configuration for the target Supabase project before deploying.

The publishable key is intended for client use with the project's Row Level Security policies. Privileged service-role credentials must remain server-side.

## CI

GitHub Actions runs `npm ci`, the production build, and the test suite on Node.js 20 and 22 for pushes and pull requests targeting `main`.

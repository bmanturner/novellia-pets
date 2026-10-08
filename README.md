# Novellia Pets

Track your household's pets and their medical records, see what care is overdue or due soon, and ask a Claude-powered assistant about them in plain language.

**Live demo:** _add the Vercel production URL here_ (see [Deploy on Vercel](#deploy-on-vercel))

## What to try

The demo data is a fictional household of famous movie pets. Mr. Jinx is overdue for care, Hooch and Toto are due soon, and the rest are up to date.

- **Dashboard:** care that's overdue or due soon across all pets, current medications, and the pet roster. Search by name, breed or microchip number; filter by species and care status. Filters live in the URL, so they survive a refresh and can be shared.
- **Pets:** add, edit and delete pets. A pet's page has three tabs:
  - **Status:** allergies and conditions, current medications, vaccinations and the last vet visit.
  - **Records:** full history; filter by type and search titles and notes.
  - **Profile:** species, breed, sex, age, microchip and notes.
- **Medical records:** vaccinations, medications, vet visits, and allergies or conditions. Each has a date, an optional end date and an optional due date. Logging this year's rabies shot clears last year's due date.
- **Chat:** open **Ask** in the top bar. Try:
  - "Who's overdue for anything?"
  - "What medications is Marley on?"
  - "Log a rabies vaccine for Marley today, due again in a year." The assistant asks you to approve every change before making it.

> [!NOTE]
> Chat needs an Anthropic API key. Without one, the app works the same but chat doesn't appear anywhere.

## Getting started

Requires Node.js 24 or newer (`.nvmrc` pins 24; run `nvm use`).

```bash
npm install
npm run setup   # create .env from .env.example, migrate, and seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To enable chat, set `ANTHROPIC_API_KEY` in `.env` and restart the dev server.

To get the original demo data back, run `npm run db:reset`.

## How it's built

- **App:** [Next.js](https://nextjs.org) 16 App Router, React 19, Server Components and Server Actions, [Tailwind CSS](https://tailwindcss.com) 4.
- **Data:** SQLite through [Kysely](https://kysely.dev) (`better-sqlite3`), with [Zod](https://zod.dev) validating inputs.
- **Chat:** [Vercel AI SDK](https://ai-sdk.dev) agent on Anthropic's Claude models.
- **MCP:** [`@modelcontextprotocol/server`](https://github.com/modelcontextprotocol/typescript-sdk), served over Streamable HTTP.

Every query and change is defined once, in [`lib/tools/registry.ts`](lib/tools/registry.ts), on top of the data models in `db/models/`. The chat agent and the MCP server both use that registry, so a tool added there is available to both.

```text
app/              routes, Server Actions (app/pets/actions.ts), /api/chat, /api/mcp
components/       UI, grouped by area (dashboard, pets, forms, chat)
db/models/        data access, always scoped to the current household
db/migrations/    schema and reference data (species, record types)
db/seeds/         fictional demo data
lib/tools/        the shared tool registry
lib/chat/         chat agent and client state
lib/mcp/          MCP server
```

**Adding things:**

- **A query or change for chat and MCP:** add a tool to `lib/tools/registry.ts`. Write tools also need a `confirmMessage`.
- **A species or record type:** write a migration that inserts the row. A record type also needs its details schema and form fields.
- **A schema change:** run `npm run db:make -- <name>`, then register the migration in [`db/bootstrap.ts`](db/bootstrap.ts). The deployed app and the tests migrate from that list, not from the folder.

## Scope and limitations

- **No authentication.** The app acts as a single household. All data access goes through one current-household lookup, so auth would replace that lookup with a session.
- **Dates are calendar dates** (`YYYY-MM-DD`). "Today" is the server's local date.
- **Chat conversations aren't saved.** Reloading the page starts a new one.
- **The deployed demo doesn't keep its data.** See [Deploy on Vercel](#deploy-on-vercel).

Product decisions and their reasons are in [`PRODUCT.md`](PRODUCT.md); the visual system ("Vet Passport") is in [`DESIGN.md`](DESIGN.md).

## Development

### Database

`npm run setup` creates `.env` (`DATABASE_URL=.data/app.db`), migrates, and seeds. Migrations and seeds run through [`kysely-ctl`](https://github.com/kysely-org/kysely-ctl).

| Script                      | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `npm run db:make -- <name>` | Create a migration in `db/migrations/`       |
| `npm run db:migrate`        | Migrate to latest and regenerate types       |
| `npm run db:rollback`       | Undo the last migration and regenerate types |
| `npm run db:seed`           | Run seeds in `db/seeds/`                     |
| `npm run db:reset`          | Roll back everything, migrate, and seed      |
| `npm run db:types`          | Regenerate `db/types.ts` from the database   |

The app's Kysely instance (`db/index.ts`) uses `CamelCasePlugin`: query with `camelCase`, store as `snake_case`. Migrations run without the plugin, so write table and column names in `snake_case` there. `db/types.ts` is generated; don't edit it.

### Tests

[Vitest](https://vitest.dev) runs data access and logic tests (`*.test.ts`, next to the code they test).

```bash
npm test             # run once
npm run test:watch   # watch mode
```

Tests use the real `db` from `@/db` against an in-memory SQLite database; `.data/app.db` is never touched. Before every test, `test/setup-db.ts` rolls back and re-applies all migrations, so each test starts from an empty schema and every migration's `down()` runs.

### Code quality

| Script                 | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `npm run lint`         | ESLint (formatting rules are left to Prettier)        |
| `npm run format`       | Format everything with Prettier                       |
| `npm run format:check` | Check formatting without writing                      |
| `npm run typecheck`    | Generate Next.js route types, then run `tsc --noEmit` |

### Chat and MCP internals

Both endpoints answer only requests addressed to `localhost` or, on Vercel, to the deployment's own domains. Requests from other hosts or cross-site origins get a 403 ([`lib/request-guard.ts`](lib/request-guard.ts)).

**Chat** (`POST /api/chat`) returns 404 without `ANTHROPIC_API_KEY`. `ANTHROPIC_MODEL` picks another Claude model (default `claude-haiku-5-5`).

- **UI:** the docked panel in [`components/chat/`](components/chat). From 1280px wide it pushes the page column; between 640 and 1279px it slides over the page; below 640px it opens as a full-screen sheet. Page layouts that change at 1024px use container queries on the app shell (`@min-[1024px]:`), not viewport breakpoints.
- **Page context:** pet pages publish their pet with `<ChatPetContext>`, and requests send its `petId` so "this pet" resolves.
- **Approvals:** the server streams each change's confirmation sentence (the registry's `confirmMessage`) as a `data-confirm` part ([`lib/chat/confirmations.ts`](lib/chat/confirmations.ts)).
- **Chat-only tools:** `citeRecords` lists the records an answer used; `navigate` opens a page in the browser.
- **Client state:** client components use `usePetsChat()` and `useChatPanel()` inside `<ChatProvider>` ([`lib/chat/chat-provider.tsx`](lib/chat/chat-provider.tsx)).

**MCP** (`/api/mcp`, Streamable HTTP, no auth) serves the registry's tools, without `navigate` and `citeRecords`:

```bash
claude mcp add --transport http novellia-pets http://localhost:3000/api/mcp
# or the deployed app: https://<your-app>.vercel.app/api/mcp
```

Before each change runs, the server asks the client to confirm it through elicitation. Clients that don't support elicitation can read but can't make changes.

### Species art

Drop black-on-transparent files at `public/species/<species-id>.svg` (or `.png` / `.webp`). They're tinted with the theme colour through a CSS mask and replace that species' emoji on the next request, with no restart needed. Match the existing set: 512×512 PNG, animal centred with its longest side at about 88% of the canvas, fully transparent background (only alpha is used).

## Deploy on Vercel

Vercel functions have no persistent disk, so the deployed app keeps SQLite in `/tmp` and creates its own demo database. With `DATABASE_BOOTSTRAP=true`, the first query on a new instance migrates and seeds an empty database ([`db/bootstrap.ts`](db/bootstrap.ts)).

1. Import the repository at [vercel.com/new](https://vercel.com/new) (framework preset: Next.js; Node.js 24).
2. Set these environment variables for Production:

   | Variable             | Value                                    |
   | -------------------- | ---------------------------------------- |
   | `DATABASE_URL`       | `/tmp/app.db`                            |
   | `DATABASE_BOOTSTRAP` | `true`                                   |
   | `ANTHROPIC_API_KEY`  | your key (omit to disable chat)          |
   | `ANTHROPIC_MODEL`    | optional, defaults to `claude-haiku-5-5` |

3. Deploy, and share the production domain (`<project>.vercel.app`). By default, Vercel's Deployment Protection asks for a Vercel login on preview URLs but not on the production domain.

> [!WARNING]
> Demo data on Vercel is per instance and temporary. Changes last until Vercel recycles the instance (after idle time or a redeploy), and requests served by different instances can see different data. Everyone with the link shares the same household.

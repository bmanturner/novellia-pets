This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Requires Node.js 24 or newer (`.nvmrc` pins 24; run `nvm use`).

```bash
npm install
npm run setup   # create .env from .env.example, migrate, and seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

SQLite via [Kysely](https://kysely.dev). Migrations and seeds run through [`kysely-ctl`](https://github.com/kysely-org/kysely-ctl).

`npm run setup` creates `.env` (`DATABASE_URL=.data/app.db`) and migrates and seeds the database.

| Script                      | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `npm run db:make -- <name>` | Create a migration in `db/migrations/`       |
| `npm run db:migrate`        | Migrate to latest and regenerate types       |
| `npm run db:rollback`       | Undo the last migration and regenerate types |
| `npm run db:seed`           | Run seeds in `db/seeds/`                     |
| `npm run db:reset`          | Roll back everything, migrate, and seed      |
| `npm run db:types`          | Regenerate `db/types.ts` from the database   |

The app's Kysely instance (`db/index.ts`) uses `CamelCasePlugin`: query with `camelCase`, store as `snake_case`. Migrations run without the plugin, so write table and column names in `snake_case` there. `db/types.ts` is generated; don't edit it.

## Chat agent and MCP server

Every query and change the app makes is defined once in [`lib/tools/registry.ts`](lib/tools/registry.ts) and exposed two ways. Both endpoints answer only requests from `localhost`: other hosts and cross-site origins get a 403.

**Chat** (`POST /api/chat`) runs a [Vercel AI SDK](https://ai-sdk.dev) agent on Anthropic's Claude models through the [Anthropic API](https://docs.anthropic.com). Set `ANTHROPIC_API_KEY` in `.env` to enable it; without a key the route returns 404 and no chat UI renders anywhere. `ANTHROPIC_MODEL` picks another Claude model (default `claude-haiku-5-5`). Conversations live in memory only.

- **UI:** the Ask button in the top bar opens a docked panel ([`components/chat/`](components/chat)). From 1280px wide it pushes the page column; between 640 and 1279px it slides over the page; below 640px it opens as a full-screen sheet. Page layouts that change at 1024px use container queries on the app shell (`@min-[1024px]:`), not viewport breakpoints.
- **Page context:** pet pages publish their pet with `<ChatPetContext>`, and requests send its `petId` so "this pet" resolves.
- **Approvals:** every change waits for the user to approve it. The server streams the confirmation sentence from the registry's `confirmMessage` as a `data-confirm` part ([`lib/chat/confirmations.ts`](lib/chat/confirmations.ts)).
- **Chat-only tools:** the agent cites the records an answer used with `citeRecords`, and opens pages with `navigate`, which runs in the browser.
- **Client state:** client components use `usePetsChat()` and `useChatPanel()` inside `<ChatProvider>` ([`lib/chat/chat-provider.tsx`](lib/chat/chat-provider.tsx)).

**MCP** (`/api/mcp`, Streamable HTTP, no auth) serves the same tools, except the chat-only `navigate` and `citeRecords`, to MCP clients on this machine:

```bash
claude mcp add --transport http novellia-pets http://localhost:3000/api/mcp
```

Each write asks the client to confirm through elicitation before it runs. Clients that don't support elicitation can still read but can't write.

## Tests

[Vitest](https://vitest.dev) runs data access and logic tests (`*.test.ts`, colocated with the code under test).

```bash
npm test             # run once
npm run test:watch   # watch mode
```

Tests use the real `db` from `@/db` against an in-memory SQLite database; `.data/app.db` is never touched. Before every test, `test/setup-db.ts` rolls back and re-applies all migrations, so each test starts from an empty schema and every migration's `down()` is exercised.

## Code Quality

| Script                 | Purpose                                               |
| ---------------------- | ----------------------------------------------------- |
| `npm run lint`         | ESLint (formatting rules are left to Prettier)        |
| `npm run format`       | Format everything with Prettier                       |
| `npm run format:check` | Check formatting without writing                      |
| `npm run typecheck`    | Generate Next.js route types, then run `tsc --noEmit` |

## Design

The visual system ("Vet Passport") is documented in [`DESIGN.md`](DESIGN.md); product decisions live in [`PRODUCT.md`](PRODUCT.md).

Species art: drop black-on-transparent files at `public/species/<species-id>.svg` (or `.png` / `.webp`). They're inked in the theme colour via a CSS mask and replace that species' emoji on the next request, no restart needed. Match the existing set: 512×512 PNG, animal centred with its longest side at about 88% of the canvas, fully transparent background (only alpha is used).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

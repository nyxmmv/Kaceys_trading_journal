# Kacey's Trading Journal

A private journal for trades, ideas, screenshots, reviews, and multiple trading accounts.

## What works

- Create, edit, and delete trades and ideas.
- Create, edit, archive, and delete trading accounts without deleting their journal entries.
- Assign each trade to an account and optionally record risk and net P&L.
- Filter the journal, calendar, playbooks, and analytics by account.
- Keep balances and results separate by account currency.
- Record the pair, direction, setup, date, outcome, reasoning, review, and lessons.
- Upload up to five PNG, JPEG, or WebP screenshots per entry (5 MB each).
- Find entries with search and browse them by date in the calendar.
- Track performance in R alongside optional account balances and currency amounts.
- Review win rate, profit factor, expectancy, best and worst days, running R,
  plan adherence, FOMO, sessions, setup grades, and directions.
- Build a playbook library from setup names and custom tags.
- Entries persist in Cloudflare D1; screenshots persist in R2.
- No broker integration or Notion sync.

## Open the code

Extract the source ZIP, then open this folder in VS Code. The main screen is
`app/page.tsx`, its styling is `app/globals.css`, and API routes are in `app/api`.

## Run on your computer

Install Node.js 22.13 or newer and the pnpm version specified in package.json.
Then run these commands in the project folder:

```sh
pnpm install --frozen-lockfile
pnpm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_tired_miracleman.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_bright_wolf_cub.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_tiresome_patriot.sql
pnpm run dev
```

Open the address printed in your terminal. Apply each migration once in filename order,
not every time you start the app. Local records are separate from the hosted
journal. `pnpm run build` creates the production build; `pnpm start` runs it
locally. See DEVELOPMENT.md for runtime details and migration instructions.

## Hosting and access

The provided Sites deployment is owner-private and uses platform access
control for the whole app, including API routes and screenshots. The code
is a single-user app, not a public multi-user service. Keep that private
access policy. Hosting it elsewhere requires equivalent server-side access
control and persistent D1/R2 resources. Local development binds to loopback.

The source ZIP contains code, not hosted journal data or screenshots.
The original Notion journal is separate and has not been imported.

## Checks

The production build and TypeScript checks cover compilation. Browser and
WebMCP runtime testing have not been performed. The optional WebMCP tool only
opens a new entry draft; it never saves entries without the normal form flow.

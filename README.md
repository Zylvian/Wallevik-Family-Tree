# Wallevik Family Tree

An interactive family tree website that visualizes your lineage as a zoomable, panable tree graph. Each person appears as a named bubble on the tree — click any node to see full details.

**Live site:** [https://zylvian.github.io/Wallevik-Family-Tree/](https://zylvian.github.io/Wallevik-Family-Tree/)

## Features

- **Interactive tree graph** — zoom (scroll), pan (drag), and click nodes for details
- **Literal tree design** — nodes sit on branches above decorative tree trunks
- **Person editor** — add or edit family members with a parent dropdown
- **Shared database** — editor changes sync via Supabase (free tier) for all visitors
- **Export** — download current data as JSON

## Supabase setup (free, ~5 minutes)

Editor saves require a free [Supabase](https://supabase.com) project. The free tier includes 500 MB storage and is enough for a family tree of any realistic size.

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) (free)
2. **New project** → pick a name and password → wait for it to provision

### 2. Run the database schema

1. In Supabase: **SQL Editor** → **New query**
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Click **Run** — this creates the `people` table and seeds your family data

### 3. Get your API keys

1. **Project Settings** → **API**
2. Copy **Project URL** and the **anon public** key

### 4. Configure locally

```bash
cd app
cp .env.example .env
# Edit .env with your URL and anon key
npm install
npm run dev
```

### 5. Configure GitHub Pages deploy

Add repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your **publishable** key (`sb_publishable_...`) from **Settings → API Keys** |

The project URL is already configured. You do **not** need the secret key (`sb_secret_...`) in the app — that must never go in frontend code.

> **Important:** Use the **publishable** key, not the secret key. The secret key only works in server-side code and will not work in the browser.

Push to `main` (or re-run the **Build site to repo root** workflow) to rebuild with the database connected.

## GitHub Pages

Source code lives in `app/`. The built site is committed to the repo root for GitHub Pages.

**Settings → Pages:** Deploy from branch **`main`** / **`(root)`**

## Local development

```bash
cd app
npm install
npm run dev
```

## Build

```bash
cd app
npm run build   # outputs built files to repo root
```

## Data model

Each person in the `people` table:

| Column | Description |
|--------|-------------|
| `id` | Unique slug |
| `name` | Full name |
| `birth_year` | Birth year |
| `death_date` | Optional death date |
| `parent_id` | Links to parent's `id` |

## Tech stack

- React 19 + TypeScript
- Vite
- D3.js (tree layout, zoom, pan)
- Supabase (PostgreSQL, free tier)

# Wallevik Family Tree

An interactive family tree website that visualizes your lineage as a zoomable, panable tree graph. Each person appears as a named bubble on the tree — click any node to see full details.

**Live site:** [https://zylvian.github.io/Wallevik-Family-Tree/](https://zylvian.github.io/Wallevik-Family-Tree/)

## Features

- **Interactive tree graph** — zoom (scroll), pan (drag), and click nodes for details
- **Literal tree design** — nodes sit on branches above decorative tree trunks
- **Person editor** — add or edit family members with a parent dropdown
- **JSON data model** — flat list of people linked by `parentId`, easy to extend
- **Export** — download your current data as JSON

## Data format

Each person in `public/data/family.json`:

```json
{
  "id": "unique-slug",
  "name": "Full Name",
  "birthYear": 1998,
  "deathDate": null,
  "parentId": "parent-id-or-null"
}
```

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The site deploys automatically to GitHub Pages on push to `main` via GitHub Actions.

To enable GitHub Pages:
1. Go to **Settings → Pages**
2. Under **Build and deployment**, set Source to **GitHub Actions**

## Data persistence

Edits made in the browser are saved to `localStorage` so they survive page reloads. Use **Export** to download JSON, then commit the file to update the canonical data in the repo.

### Future database options (free tier)

| Service | Best for | Free tier |
|---------|----------|-----------|
| **Supabase** | PostgreSQL with a simple REST API | 500 MB, 50k monthly active users |
| **Firebase Firestore** | Real-time sync, easy SDK | 1 GB storage, 50k reads/day |
| **Turso** | Edge SQLite, low latency | 9 GB storage, 500 databases |
| **Cloudflare D1 + Workers** | Serverless, pairs with Pages | 5 GB, 100k reads/day |
| **JSON in repo** | Zero cost, version-controlled | Free via GitHub Pages |

For a fully free, zero-maintenance setup: keep JSON in the repo and edit via PRs, or add Supabase later for live editing without commits.

## Tech stack

- React 19 + TypeScript
- Vite
- D3.js (tree layout, zoom, pan)

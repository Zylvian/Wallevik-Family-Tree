# Wallevik Family Tree

An interactive family tree website that visualizes your lineage as a zoomable, panable tree graph. Each person appears as a named bubble on the tree — click any node to see full details.

**Live site:** [https://zylvian.github.io/Wallevik-Family-Tree/](https://zylvian.github.io/Wallevik-Family-Tree/)

## Features

- **Interactive tree graph** — zoom (scroll), pan (drag), and click nodes for details
- **Literal tree design** — nodes sit on branches above decorative tree trunks
- **Person editor** — add or edit family members with a parent dropdown
- **JSON data model** — flat list of people linked by `parentId`, easy to extend
- **Export** — download your current data as JSON

## GitHub Pages

Source code lives in `app/`. The built site is committed to the repo root (`index.html`, `assets/`, `data/`) so GitHub Pages can serve it directly from **`main` / `(root)`**.

## Data format

Each person in `app/public/data/family.json`:

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
cd app
npm install
npm run dev
```

## Build

```bash
cd app
npm run build   # outputs built files to repo root
```

## Data persistence

Edits made in the browser are saved to `localStorage`. Use **Export** to download JSON, then update `app/public/data/family.json` and push to `main`.

## Tech stack

- React 19 + TypeScript
- Vite
- D3.js (tree layout, zoom, pan)

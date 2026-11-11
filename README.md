# Prompt Vault — Personal Prompt Library

A fast, self-contained single-page Prompt Vault and Library for storing, categorizing, searching, importing/exporting, and copying AI prompts with one click.

---

## Features

- **Full-Width Prompt Workspace**: Clean, scannable layout with 6-line scrollable prompt cards, live character counts, and one-click clipboard copy feedback.
- **Category Management**: Filter prompts by category with live badge counts, create custom categories when adding or editing prompts, and delete categories (with the option to reassign or delete their prompts).
- **Instant Multi-Keyword Search**: Real-time search across prompt titles, categories, and body text (press `/` to focus the search input from anywhere).
- **Persistent Local Storage + Remote JSON Sync**:
  - Automatically persists prompts, custom categories, and theme preference (`light` / `dark`) in `localStorage`.
  - Automatically syncs with `./prompts.json` on load and merges remote updates with local unsaved prompts.
- **JSON Import & Export**:
  - **Export**: Download your entire library (`prompts.json`) including categories and timestamps.
  - **Import**: Upload a `.json` file (supports both `{ "prompts": [...], "categories": [...] }` and a direct `[...]` array).
  - **Reset**: Restore the library from `./prompts.json` at any time.
- **Light & Dark Themes**: Toggle between light and dark modes with persistent preference storage.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (Node 20 recommended)
- **npm**

### Installation

```bash
npm install --legacy-peer-deps
```

### Start Development Server

```bash
npm run dev
```

The development server runs at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

Production assets are output to the `./dist` directory with relative asset paths (`base: './'`) ready for static hosting or GitHub Pages.

### Run Type Check & Unit Tests

```bash
npm run lint
npx tsx --test src/utils/promptLogic.test.ts
```

---

## Updating Prompts via `prompts.json`

You can pre-populate or update the default prompts served by the app by editing `public/prompts.json` (and `prompts.json` in the project root):

```json
{
  "version": "1.0",
  "exportedAt": "2026-11-11T06:30:00.000Z",
  "categories": [
    "Video & AI",
    "Coding & Web",
    "Content Writing",
    "Design & Art"
  ],
  "prompts": [
    {
      "id": "prompt-1",
      "title": "Example Prompt Title",
      "category": "Coding & Web",
      "body": "Your full prompt text here...",
      "createdAt": "2026-10-15T09:30:00.000Z",
      "updatedAt": "2026-10-15T09:30:00.000Z"
    }
  ]
}
```

---

## Deployment to GitHub Pages

This project includes a pre-configured GitHub Actions workflow at `.github/workflows/deploy.yml`:

1. Push your repository to GitHub (`main` or `master` branch).
2. In your GitHub repository, navigate to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Every push to `main`/`master` (or manual run via the **Actions** tab) will automatically install dependencies, build the project into `./dist`, and deploy to GitHub Pages.

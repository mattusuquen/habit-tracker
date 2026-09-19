# HabitCanvas

A habit tracker that turns consistency into art. Every day you complete your
habits, a little more of that month's painting is revealed on your calendar
grid — miss a habit and the tile stays covered. Finish the year, finish the
gallery.

## How it works

- You define a handful of habits (e.g. Workout, Read, Meditate, No Social
  Media), each worth an equal share of a day's tile.
- Each day is a square in the month's calendar grid, painted with that
  month's artwork.
- Checking off a habit for a day reveals a fraction of that day's tile;
  check off all of them and the tile is fully uncovered.
- Months you haven't reached yet are locked. Finished months collect in the
  **Year in Art** gallery, alongside overall year progress.

## Project structure

```
web/   Next.js app (App Router, TypeScript, Tailwind CSS)
```

The web app currently ships as a single interactive page (`web/app/page.tsx`)
with local component state — no backend yet.

## Getting started

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

See [`web/README.md`](web/README.md) for the underlying Next.js project
details.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)

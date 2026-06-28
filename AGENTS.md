# AGENTS.md

## Cursor Cloud specific instructions

### Project layout
- The actual application lives in the `lab-schedule-pro/` subdirectory, **not** the repo root. Run all npm commands from there (e.g. `cd lab-schedule-pro` or `npm --prefix lab-schedule-pro <cmd>`). The root `README.md` is just a stub.

### What this is
- `lab-schedule-pro` is a 100% client-side React 19 + TypeScript + Vite 8 SPA (hospital lab staff scheduling). There is **no backend, database, API, or environment variables** — all data persists in the browser's LocalStorage via Zustand. Nothing else needs to run.

### Commands (all from `lab-schedule-pro/`)
- Dev server: `npm run dev` (Vite, serves http://localhost:5173). This is the only service.
- Lint: `npm run lint` (oxlint). Note: currently emits a few non-blocking `no-unused-vars`/fast-refresh warnings and still exits 0.
- Build: `npm run build` (`tsc -b && vite build`). The build prints a chunk-size >500kB warning — this is expected and not an error.
- Preview production build: `npm run preview`.

### Notes
- Dependencies are installed automatically by the startup update script (`npm ci` in `lab-schedule-pro`).
- To smoke-test core functionality, open the app, go to a department's Monthly schedule, click a calendar cell, and assign a shift — the colored badge persists in LocalStorage.

# Task Plan: centroid-finder-frontend (Wave 5: Improving)

Goal: build the Wave 5 improvements chosen in [priorityImprovements.md](priorityImprovements.md) on one branch per improvement. sabinMas and onjamm (and their AI agents) work at the same time without ever editing the same file on two open branches.

This replaces the original build plan. That version is still in git history (the commit before this file changed).

**This file is strict.** An agent working on a task may only create, edit, or delete the files listed under that task's **May touch**. Anything under **Must NOT touch**, or anything not listed at all, is off limits. If a task can't be finished without touching another file, the agent **stops and asks its human**. It doesn't work around the rule.

---

## Section 0: Rules for every task (both people, both agents)

1. **One task = one branch = one PR.** Use the exact branch name given. Branch from the latest `main`:
   ```
   git checkout main && git pull
   git checkout -b <branch-name>
   ```
2. **Only the files listed under "May touch".** No drive-by fixes, no formatting other files, no renames outside the list. If you spot another problem, write it down in the PR description under "Noticed, not fixed".
3. **No new npm dependencies** in any Wave 5 task. `package.json` and `package-lock.json` are off limits for every task below.
4. **Don't change the API contract.** The URLs and JSON shapes in `src/api/*.js` stay exactly as they are (see "Frozen contracts" below). The backend is being refactored at the same time and relies on them.
5. **Commits:** small and frequent, pushed to your own branch. Every AI-assisted commit message starts with `AI Used`. Don't mix human-written and AI-written changes in one commit.
6. **Before opening the PR:** run `npm run lint`, `npm test` and `npm run build`. Run `npm run test:e2e` if the task touches anything under `src/pages`, `src/components` or `tests/e2e`. All must pass.
7. **PR:** from your branch into `main`. The title starts with the category, exactly as given in the task. Fill in: what changed, why, how you tested it, and "Noticed, not fixed".
8. **Review:** the *other* partner reviews, leaves comments, and comments **LGTM** when satisfied. Nobody approves or merges their own PR without that LGTM.
9. **After any PR merges into `main`,** everyone with an open branch merges `main` into it before continuing:
   ```
   git checkout <your-branch> && git merge main
   ```
10. **Don't delete old branches** (`main`, `frontend`, `onjamm-dev`, `sabinmas-dev`). The instructor still grades them.

### Frozen contracts (read-only for every task)

- `src/api/client.js`, `src/api/videos.js`, `src/api/thumbnail.js`, `src/api/process.js`: function names, URLs and return shapes.
- `src/lib/centroid/index.js`: `findLargestCentroid(imageData, targetColorHex, threshold) → {x, y} | null`.
- Routing in `src/App.jsx`: `/` redirects to `/videos`, `/videos`, `/preview/:filename`.

---

## Section 1: Ownership map

| Area | Owner | Notes |
|---|---|---|
| `src/lib/**`, `src/api/**`, `src/App.jsx`, `src/main.jsx`, `src/theme.js`, `src/index.css` | **sabinMas** | |
| `src/components/JobStatusPanel.jsx` | **sabinMas** | |
| `tests/unit/**`, `.mocharc.json` | **sabinMas** | |
| `README.md`, `TASKS.md`, `priorityImprovements.md`, `docs/**`, `.github/**`, `package.json`, `package-lock.json`, other root config | **sabinMas** | No Wave 5 task edits these, except the header-comment note under F-R1. |
| `src/pages/**`, `src/components/**` (except `JobStatusPanel.jsx`), `src/components/hoc/**`, `src/mock/**` | **onjamm** | |
| `tests/e2e/**`, `playwright.config.js` | **onjamm** | |

**The one planned crossing:** F-R1 (sabinMas) removes the old `OWNED BY` / `FROZEN` / `Contract` header comments from files in onjamm's area. It changes **only those comment lines**, and it merges **before** onjamm starts F-E1. onjamm does backend tasks first, so nobody waits.

---

## Section 2: Merge order

```
F-R1  (sabinMas)  ──merge──►  F-T1 (sabinMas)
                    └──────►  F-E1 (onjamm, starts only after F-R1 is merged)
```

- F-R1 merges first.
- After that, F-T1 and F-E1 run in parallel. They share no files.

---

## Section 3: sabinMas's tasks

**You own:** everything marked sabinMas in Section 1.
**You must NOT touch:** `src/pages/**`, `src/components/**` (except `JobStatusPanel.jsx`, and the F-R1 header lines), `src/mock/**`, `tests/e2e/**`, `playwright.config.js`.

### F-R1: Remove Vite scaffold CSS and stale ownership headers

- **Category / PR title:** `Refactoring: removed Vite scaffold CSS and stale ownership headers`
- **Branch:** `refactoring/remove-scaffold-dead-code`
- **Depends on:** nothing. **Merge first.**
- **May touch:**
  - `src/index.css`: delete the Vite starter rules. If nothing is worth keeping, delete the file.
  - `src/main.jsx`: only to remove the `index.css` import, if the file is deleted.
  - The top-of-file comment lines that say `OWNED BY ...`, `FROZEN ...`, or `Contract to build against ...` in: `src/App.jsx`, `src/theme.js`, `src/lib/recentJobs.js`, `src/lib/centroid/*.js`, `src/components/*.jsx`, `src/components/hoc/withLoading.jsx`, `src/pages/VideoChooser.jsx`, `src/pages/VideoPreview.jsx`.
- **Must NOT touch:** any line of code other than those comment lines; `tests/**`; `src/mock/**`; `README.md`; `TASKS.md`; `package*.json`.
- **Keep:** comments that explain what a file does or why (for example "Port of DistanceImageBinarizer.java"). Only the ownership and frozen markers go.
- **Done when:**
  - The app looks the same or better with only MUI's `CssBaseline` and `theme.js`. Check both pages in the browser, in light and dark OS mode.
  - No file in `src/` mentions `OWNED BY`, `FROZEN`, or `TASKS.md`.
  - Lint, unit tests, build and e2e all pass.

### F-T1: Unit tests for recentJobs.js and the API client

- **Category / PR title:** `Tests: added unit tests for recentJobs and the API client`
- **Branch:** `tests/recent-jobs-and-api-client`
- **Depends on:** F-R1 merged.
- **May touch:**
  - New files in `tests/unit/`, such as `recentJobs.test.js`, `client.test.js`, and `api.test.js`. A small shared test helper in `tests/unit/` is fine.
  - `.mocharc.json`: only to register a test setup file, if one is needed (for example, for a fake `localStorage` or `fetch`).
- **Must NOT touch:** anything in `src/`. These are tests only. If a test exposes a bug, record it in the PR under "Noticed, not fixed". Don't fix it in this branch.
- **Cover at least:**
  - `recentJobs.js`: the empty history; newest first; the cap of 10; `clearRecentJobs`; stored JSON that's corrupt; stored JSON that isn't an array (record the current behavior and the bug); `localStorage` throwing on read and on write.
  - `api/client.js` `fetchJson`: a 2xx JSON body; a non-2xx with an `{ error }` body (the message comes through); a non-2xx with no body (the generic message); a 204 or non-JSON body.
  - `api/videos.js`, `api/process.js`, `api/thumbnail.js`: the exact URL and method each one uses, including that filenames with spaces or `#` are encoded.
- **Done when:** `npm test` passes and the new tests fail if you deliberately break the code they cover (check this locally, then undo the break).

---

## Section 4: onjamm's tasks

**You own:** everything marked onjamm in Section 1.
**You must NOT touch:** `src/lib/**`, `src/api/**`, `src/App.jsx`, `src/main.jsx`, `src/theme.js`, `src/index.css`, `src/components/JobStatusPanel.jsx`, `tests/unit/**`, `README.md`, `package*.json`, `.github/**`.

### F-E1: Replace the silent mock-video fallback with an error and Retry

- **Category / PR title:** `Error handling: Video Chooser shows a retry state instead of mock videos`
- **Branch:** `error-handling/video-list-retry`
- **Depends on:** F-R1 merged. Start after your backend tasks B-R3 and B-T1, or as soon as F-R1 is in.
- **May touch:**
  - `src/pages/VideoChooser.jsx`
  - `src/mock/videos.js` and `src/mock/jobs.js`: delete them, and the `src/mock/` folder, once nothing imports them. Search the whole repo first. Only `VideoChooser.jsx` should import them.
  - `tests/e2e/videoChooser.spec.js`
  - Optionally one new presentational component in `src/components/` (for example, an error-and-retry or empty-state box), if it keeps the page readable.
- **Must NOT touch:** `src/api/**` (use `getVideos()` as it is); `src/pages/VideoPreview.jsx`; `src/components/JobStatusPanel.jsx`; `README.md`. The README still mentions the mock fallback. Put that in "Noticed, not fixed" so sabinMas can update it in a later docs task.
- **Behavior to build:**
  - **Loading:** while the list is being fetched, show a loading state (the existing `withLoading` HOC is a good fit).
  - **Error:** if `getVideos()` fails, show a clear error message and a Retry button that tries again. Never show fake videos.
  - **Empty:** if the backend returns an empty list, say so ("No videos found") instead of showing nothing.
  - **Success:** unchanged. The list renders and clicking navigates to `/preview/:filename`.
  - Recent Jobs must keep working in every state above.
- **Done when:**
  - The e2e spec covers loading-then-success, error-then-retry-success, and empty, with the API mocked via `page.route`. The old "falls back to sample videos" test is replaced.
  - No file in the repo imports from `src/mock/`.
  - Lint, unit tests, build and e2e all pass.

---

## Section 5: Why this split causes no conflicts

- sabinMas's two tasks only touch `src/index.css`, header comment lines (F-R1, merged first), and new files in `tests/unit/` (F-T1).
- onjamm's task only touches `src/pages/VideoChooser.jsx`, `src/mock/`, `tests/e2e/videoChooser.spec.js`, and optionally one new component file.
- The only file both people's tasks touch is `src/pages/VideoChooser.jsx`. F-R1 removes its header comment, and F-E1 changes its code. F-R1 merges before F-E1 starts, so F-E1 branches from a `main` that already has the header removed.
- Nobody edits `src/api/**`, `package*.json`, or the README in Wave 5, so the frozen contracts and the backend stay compatible.

## Backlog (not in Wave 5)

Everything else in `priorityImprovements.md` (F-R2, F-T2, F-E2, F-D1, F-D2, F-P1, F-P2, F-S1, F-S2, F-B1, F-B2, F-O1) is backlog. If you finish early and want to add one, add it to this file first with its own **May touch** list and owner, and get your partner's OK before starting.

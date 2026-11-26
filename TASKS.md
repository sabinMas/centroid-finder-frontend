# Task Plan: centroid-finder-frontend (Wave 6: Polish and new features)

Goal: make the project presentable and add the features we chose in our three planning docs, on one branch per task, with Mason (`sabinMas`) and Drew (`onjamm`) and their AI agents working at the same time without ever editing the same file on two open branches.

Wave 5 (refactor, tests, errors, docs) is finished and merged. This file replaces the Wave 5 plan, which is still in git history. The unfinished backlog items from `priorityImprovements.md` that are still worth doing are carried over as P3 tasks below.

Planning docs this plan comes from (Google Docs):
- `polish.md`: https://docs.google.com/document/d/1N_2zOiaBYQEuWfaEvRkixsmPV8f9JIyet6B6DlBLOKg
- `goals.md`: https://docs.google.com/document/d/1wkgRvXCg3f1Z22FyMVEgtCJ7uVUjwnuEU91JfHBx29E
- `ideas.md`: https://docs.google.com/document/d/14McXyMaQQZ2r0qkniSWUz9fkieG6hbORiUazEuf5tFo

The matching plan for the backend is in `onjamm/centroid-finder/TASKS.md`. Sections 0, 1, 2, 7 and 8 are the same in both.

**This file is strict.** An agent working on a task may only create, edit, or delete the files listed under that task's **May touch**. Anything under **Must NOT touch**, or anything not listed at all, is off limits. If a task can't be finished without touching another file, the agent **stops and asks its human** (and tells the partner through the pair relay). It does not work around the rule.

Handles used below: **Mason = `sabinMas`**, **Drew = `onjamm`**.

---

## Section 0: Rules for every task (both people, both agents)

1. **One task = one branch = one PR.** Use the exact branch name given. Branch from the latest `main`:
   ```
   git checkout main && git pull
   git checkout -b <branch-name>
   ```
2. **Only the files listed under "May touch".** No drive-by fixes, no reformatting other files, no renames. If you spot another problem, put it in the PR description under "Noticed, not fixed". A file that a task **creates** belongs to that task's owner for the rest of Wave 6, even inside the other person's folder (for example a new component in `src/components/`). The only planned handover is the stub pages in F-N1.
3. **Dependencies.** Mason approved the free **Supabase** (database, sign-in) and **Vercel** (frontend hosting) route on 2026-11-25. That approves `@supabase/supabase-js` in `server/` (B-DB2) and in the frontend (F-A1), and nothing else. Mason also approved `multer` 2.x for uploads in `server/` (B-U1) on 2026-11-25, and said OpenCV may be added if a task really needs it (the Java processor already bundles it through JavaCV; if a task wants a new OpenCV dependency anywhere, say which artifact and why in the PR). Any other new dependency: say why in the PR and ask your human first.
4. **Contracts.** Every route, query parameter, status code and JSON shape that exists today stays exactly as it is. Wave 6 only adds what Section 2 lists. Changing Section 2 needs both humans to agree, and the same edit made to this section in both repos.
5. **Commits.** Small and frequent, on your own branch. The `AI Used` prefix was a Wave 1 rule and is no longer required (Mason, 2026-11-25). Every commit still has your human as author and the other partner as a `Co-authored-by:` trailer (see CLAUDE.md section 1). Keep README changes in their own human-written commits (rule 13).
6. **Before opening a PR.**
   - Backend: `mvn -B test` in `processor/` if you touched `processor/`, and `npm test` in `server/` if you touched `server/`.
   - Frontend: `npm run lint`, `npm test` and `npm run build`, plus `npm run test:e2e` if you touched `src/pages`, `src/components` or `tests/e2e`.
7. **PR.** From your branch into `main`. The title starts with the category given in the task. The description has: what changed, why, how you tested it (exact commands), and "Noticed, not fixed".
8. **Review.** The *other* partner reviews and comments **LGTM** when satisfied (an approval carries only that text). Nobody approves their own PR. Mason merges his own PRs after Drew's LGTM. Mason's agent may review, approve and squash-merge Drew's PRs. Drew's agent asks Drew first.
9. **After any PR merges into `main`,** everyone with an open branch merges `main` into it before continuing:
   ```
   git checkout <your-branch> && git merge main
   ```
10. **One open branch per agent per repo.** Take tasks in the merge order of Section 4. Different repos can run at the same time.
11. **Never delete the branches the professor grades.** Backend: `main`, `server`, `video`, `video-agentic-approach`. Frontend: `main`, `onjamm-dev`, `sabinmas-dev`.
12. **Secrets.** Supabase keys live only in `.env` files, which are gitignored. Share them through a password manager, never through chat, the pair relay, a commit or a PR. The **service-role key** is server-only and must never reach the frontend or any `VITE_` variable.
13. **README is human-written.** Our `polish.md` says the README must not be AI-written, because recruiters spot that style. For the two README tasks (B-D3, F-D1) the agent does **not** draft prose. It may run commands to check the README's steps, check links, and leave review comments. Commits to a README contain only human-written text.
14. **Where new features land in the PR title.** New features use the `Other:` prefix (Mason confirmed, decision D1). Their branch prefix is `other/` (as used below) or `feature/`.

---

## Section 1: Wave 6 at a glance (same table in both repos)

Sources: `polish.md`, `goals.md` and `ideas.md` (Google Docs, linked from the top of this file), plus the unfinished backlog from `priorityImprovements.md`. Wave 5 is finished: all 8 PRs merged (list in CLAUDE.md section 9).

Priority: **P1** = required by `polish.md` or marked a priority by Mason. **P2** = "Easy" and "Goal" items from `goals.md`. **P3** = hosting and the hygiene backlog.

| Feature | Pri | Backend tasks | Frontend tasks |
|---|---|---|---|
| Human-written README + demo GIF | P1 | B-D3 (Drew) | F-D1 (Mason) |
| Remove unneeded files | P1 | B-R1 (Mason) | F-R3 (Mason) |
| **File picker: upload your own video** (+ phone camera) | P1 | B-S1, B-U1 (Drew) | F-API1 (Mason), F-U1 (Drew) |
| **Jobs database + jobs table** (replaces the plain recent-jobs list) | P1 | B-DB1, B-DB2, B-J1 (Drew), S-0 (Mason) | F-API1 (Mason), F-J1 (Drew) |
| **Export formats** (CSV, JSON, TSV, PNG trajectory) | P1 | none (done in the browser) | F-X1 (Mason) |
| Color picker no longer covers the object | P2 | none | F-C1 (Drew) |
| Settings page + Help/Docs panel | P2 | none | F-ST1 (Mason) |
| UI/UX polish | P2 | none | F-TH1 (Mason), F-UX1 (Drew) |
| Metadata extraction + geolocation tag | P2 | B-M1 (Drew) | F-API1 (Mason), F-M1 (Drew) |
| Legacy vs new behaviors in menu tabs | P2 | none | F-N1 (Mason) |
| Sign-in + persistent history | P2 | B-A1 (Drew), S-0 (Mason) | F-A1, F-A2 (Mason) |
| Mobile-first + phone camera | P2 | none | F-TH2 (Mason), F-MB1 (Drew), F-U1 (Drew) |
| Hosting (**parked: local only for now**, decision D2) | P3 | B-H1 (parked) | F-H1 (parked) |
| Hygiene backlog (tests, perf, docs, security, bugs) | P3 | B-R2, B-B1, B-P1, B-B2, B-P2, B-D1 (Mason); B-E2, B-S2 (Drew) | F-S1, F-S2, F-P1, F-O1, F-B1 (Mason); F-E2, F-R2, F-P2, F-B2, F-T2, F-D2 (Drew) |

Not assigned (backlog, Section 8): live stream + live stats, AI real-time readings, sound tracking in silent videos, full AR overlay.

---

## Section 2: Contract additions (the new halves are built in parallel against this)

Everything under `/api` is already proxied by the frontend's `vite.config.js`, so **no proxy change is needed** and `vite.config.js` is not touched by any feature task.

### Sign-in header (optional everywhere)

- The frontend sends `Authorization: Bearer <Supabase access token>` when the user is signed in. Guests send nothing and everything keeps working.
- The server sets `req.user = { id, email }` when the token is valid. A missing header means guest. A present but invalid or expired token gets `401 { "error": "Invalid or expired sign-in" }`.
- When a signed-in user starts a job, the job is saved with their user id.

### New routes

| Method | Path | Success | Errors (always `{ "error": "..." }`) |
|---|---|---|---|
| POST | `/api/videos` (multipart form, one file in the field `video`) | 201 `{ "filename": "<stored name>" }` | 400 no file or extension not allowed, 413 too large, 500 |
| GET | `/api/videos/:filename/metadata` | 200 `VideoMetadata` (below) | 400 bad name, 404 `Video not found`, 500 ffprobe failed |
| GET | `/api/jobs` | 200 array of `JobSummary` (below), newest first, at most 100, only the signed-in user's | 401 `Sign in to see saved jobs` (guests), 500 |
| POST | `/process/:filename?...` (existing) | adds **429** `Too many jobs running, try again shortly` when the cap in B-S2 is reached | existing codes unchanged |

The stored filename is the sanitized original name. If it already exists, the server adds a suffix, so an upload never overwrites a video. The response tells the frontend which name was used.

```
VideoMetadata = {
  filename: string,
  durationSeconds: number | null,
  width: number | null, height: number | null,
  frameRate: number | null,
  videoCodec: string | null,
  bitRate: number | null,
  sizeBytes: number,
  createdAt: string | null,            // ISO 8601 from the container tags
  location: { latitude: number, longitude: number, altitude: number | null } | null,
  tags: { [key: string]: string }      // raw container tags, strings only
}

JobSummary = {
  jobId: string, filename: string, targetColor: string, threshold: number,
  status: "processing" | "done" | "error",
  result: string | null,               // "/results/<jobId>.csv" when done
  error: string | null,
  createdAt: string, updatedAt: string // ISO 8601
}
```

### Jobs table (Supabase Postgres), built in B-DB2

`jobs(id uuid primary key, user_id uuid null references auth.users, filename text not null, target_color text not null, threshold int not null, status text not null check (status in ('processing','done','error')), result text null, error text null, created_at timestamptz not null default now(), updated_at timestamptz not null default now())`. The server talks to it with the service-role key and always filters by the verified user id. Row level security is switched on as a second layer: users may read only their own rows.

### Unchanged on purpose

`GET /api/videos`, `GET /thumbnail/:filename`, `POST /process/:filename`, `GET /process/:jobId/status`, `/results/*.csv`, the JAR arguments, the CSV format and the exit codes. The frontend's existing `src/api/*` function names and `findLargestCentroid` keep their signatures. New functions may be added.

---

## Section 3: Ownership map (this repo)

| Area | Owner |
|---|---|
| `src/lib/**`, `src/api/**`, `src/App.jsx`, `src/main.jsx`, `src/theme.js`, `src/components/JobStatusPanel.jsx` | **Mason** |
| `tests/unit/**`, `.mocharc.json` | **Mason** |
| `index.html`, `public/**`, `README.md`, `docs/**`, `.github/**`, `package.json`, `package-lock.json`, `vite.config.js`, `vercel.json`, `.env.example`, `.oxlintrc.json`, other root config, and the root planning docs for F-R3 only | **Mason** |
| New by Mason's tasks: `src/components/nav/**`, `src/components/export/**`, `src/components/settings/**`, `src/context/**`, `src/pages/SettingsPage.jsx`, `src/pages/HelpPage.jsx`, `src/pages/SignInPage.jsx`, and the new specs `tests/e2e/nav.spec.js`, `auth.spec.js`, `settings.spec.js`, `export.spec.js`, `mobileTheme.spec.js` | **Mason** |
| `src/pages/VideoChooser.jsx`, `src/pages/VideoPreview.jsx`, `src/components/ColorPicker.jsx`, `ThresholdSlider.jsx`, `ThumbnailCanvas.jsx`, `VideoListItem.jsx`, `src/components/hoc/**`, `src/hooks/**` | **Drew** |
| New by Drew's tasks: `src/components/VideoUpload.jsx`, `JobsTable.jsx`, `MetadataPanel.jsx`, and the new specs `tests/e2e/videoUpload.spec.js`, `jobs.spec.js`, `metadata.spec.js` | **Drew** |
| Existing specs `tests/e2e/videoChooser.spec.js`, `videoPreview.spec.js`, and `playwright.config.js` | **Drew** |
| **The one handover:** F-N1 (Mason) creates the stub pages `src/pages/JobsPage.jsx` and `src/pages/MetadataPage.jsx`. Once F-N1 merges, **Drew owns those two files** and Mason never edits them again. | |
| `TASKS.md` | nobody (read-only) |

`src/App.jsx` is edited only by Mason's F-B1 and F-N1. F-N1 adds every Wave 6 route up front, pointing at stub pages, so Drew's page tasks never need `App.jsx`.

Any new dependency in this repo is added by a Mason task (F-A1), because `package.json` has one owner. Drew's tasks add none.

## Section 4: Merge order

### Lane order in this repo

```
Mason:  F-API1 -> F-N1 -> F-R3 -> F-S2 -> F-O1 -> F-B1 -> F-S1 -> F-P1 -> F-A1 -> F-A2 -> F-ST1 -> F-X1 -> F-TH1 -> F-TH2 -> F-D1      (F-H1 is parked)
Drew:   F-U1 -> F-E2 -> F-R2 -> F-C1 -> F-J1 -> F-M1 -> F-P2 -> F-B2 -> F-UX1 -> F-MB1 -> F-T2 -> F-D2
```

Drew's page tasks all touch `VideoPreview.jsx`, `VideoChooser.jsx` or `ThumbnailCanvas.jsx`, so they go strictly in this order.

### Cross-repo and cross-lane gates

| Gate | Needed by |
|---|---|
| **F-API1** merged (Mason, small, do it first) | Drew's F-U1 (`uploadVideo`), F-J1 (`getJobs`), F-M1 (`getVideoMetadata`) |
| **F-N1** merged (Mason, do it second): routes and stub pages exist | Drew's F-J1 and F-M1 |
| **F-A2** merged: `useAuth()` exists | Drew's F-J1 |
| **F-P1** merged: faster centroid code | Drew's F-P2 |
| **F-ST1** merged: `loadSettings()` exists | Drew's F-B2 |
| **F-TH1** merged | Drew's F-UX1 |
| **F-TH2** merged | Drew's F-MB1 |
| **F-S1** merged (both edit `JobStatusPanel.jsx`) | Mason's F-X1 |
| Backend **B-U1, B-J1, B-M1** merged | Real end-to-end check of F-U1, F-J1, F-M1. Their Playwright specs mock the API, so the PRs do not wait. |
| All features and F-MB1 merged | Mason's F-D1 (the README and the demo GIF show the finished app) |
| Backend S-0 stage 1 done (Supabase keys) | Live checks in F-A1 and F-A2 |

---

## Section 5: Mason's tasks (this repo)

**You own:** everything marked Mason in Section 3.
**You must NOT touch:** Drew's files in Section 3, except the F-N1 stub creation.

Every task: a short header comment in each new file, JSDoc on every exported function, tests for new code in `tests/unit/` (plain Node, using the fakes in `tests/unit/testDoubles.js`, no jsdom, no sinon).

### F-API1: API helpers for upload, metadata and saved jobs

- **Category / PR title:** `Other: added API helpers for uploads, metadata and saved jobs`
- **Priority:** P1. **Branch:** `other/api-helpers`. **Depends on:** nothing. **Do this first:** it unblocks Drew.
- **May touch:** `src/api/videos.js` (add `uploadVideo(file)` and `getVideoMetadata(filename)`), new `src/api/jobs.js` (`getJobs()`), `src/api/client.js` only if `fetchJson` needs to accept a `FormData` body without forcing a JSON content type, and `tests/unit/api.test.js`, `tests/unit/client.test.js`.
- **Do:** build against Section 2, the backend does not need to exist yet.
  - `uploadVideo(file)` sends a `FormData` with the field `video` to `POST /api/videos` and resolves to `{ filename }`. Do not set the `Content-Type` header yourself, the browser adds the boundary.
  - `getVideoMetadata(filename)` calls `GET /api/videos/<encoded name>/metadata`. `getJobs()` calls `GET /api/jobs`.
  - Check the shape of what comes back (a string `filename`, an array for jobs) and throw a clear `Error` if it is wrong. Existing function names and URLs are unchanged.
- **Done when:** unit tests cover the URL, method, body type, encoding of names with spaces and `#`, and error messages for 400, 401 and 413. Lint, test and build pass.

### F-N1: Navigation tabs and every route up front

- **Category / PR title:** `Other: added a navigation bar that separates the original tool from the new ones`
- **Priority:** P2 (`goals.md`: separate legacy and new behaviors into menu options). **Branch:** `other/nav-tabs`. **Depends on:** nothing. **Do this second.**
- **May touch:** `src/App.jsx`, new `src/components/nav/AppNav.jsx`, new stub pages `src/pages/JobsPage.jsx`, `MetadataPage.jsx`, `SettingsPage.jsx`, `HelpPage.jsx`, `SignInPage.jsx` (each shows its title and "Coming soon"), new `tests/e2e/nav.spec.js`.
- **Must NOT touch:** `VideoChooser.jsx`, `VideoPreview.jsx`, the existing e2e specs.
- **Do:** tabs **Track color** (the original tool: `/videos`, `/preview/:filename`, unchanged behavior), **Metadata** (`/metadata/:filename?`), **Jobs** (`/jobs`). On the right: Help (`/help`), Settings (`/settings`), Sign in (`/sign-in`). `/` still redirects to `/videos`. The nav highlights the current tab.
- **Done when:** the two existing e2e specs pass **unchanged**. If the nav breaks one, stop and ask Drew, do not edit his specs. `nav.spec.js` covers each tab and the redirect.

### F-R3: Remove unneeded files

- **Category / PR title:** `Refactoring: moved old planning docs out of the repo root`
- **Priority:** P1 (`polish.md`: remove unneeded files). **Branch:** `refactoring/tidy-root`. **Depends on:** nothing.
- **May touch:** move `humanImprovements.md`, `robotImprovements.md`, `ideas.md`, `priorityImprovements.md` into `docs/planning/`. Delete files in `docs/screenshots/` only after Mason says which ones the final README no longer needs. `.gitignore` if needed.
- **Must NOT touch:** `README.md` (it is rewritten by hand in F-D1, Section 0 rule 13). List the moved paths in the PR so the README author knows.
- **Done when:** lint, unit tests and build pass, and nothing in `src/` or `tests/` referenced a moved file.

### F-S2: Dependency updates and Dependabot

- **Category / PR title:** `Security: updated dependencies and enabled Dependabot`
- **Priority:** P3. **Branch:** `security/dependency-updates`. **Depends on:** F-R3 merged.
- **May touch:** `package.json`, `package-lock.json`, new `.github/dependabot.yml`.
- **Do:** run `npm outdated` and `npm audit`, update within the current major versions, run lint, unit tests, build and e2e. Dependabot checks `npm` and `github-actions` weekly. **Rule from here on:** do not merge a Dependabot PR while a task that edits `package.json` is open.
- **Done when:** all checks pass and the PR lists what changed and what was left alone.

### F-O1: Frontend CI

- **Category / PR title:** `Other: added a GitHub Actions workflow for lint, tests and build`
- **Priority:** P3. **Branch:** `other/frontend-ci`. **Depends on:** F-S2 merged.
- **May touch:** new `.github/workflows/ci.yml`. Leave `.github/workflows/claude.yml` and `claude-code-review.yml` alone: they came from the Claude Code GitHub app (PR #7) and are not a test CI.
- **Do:** on pull requests to `main` and pushes to `main`: Node 20, `npm ci`, `npm run lint`, `npm test`, `npm run build`, then `npx playwright install --with-deps chromium` and `npm run test:e2e`. Use current major versions of the actions.
- **Done when:** the PR's own checks show every step running and green. Link the run in the PR.

### F-B1: Error boundary

- **Category / PR title:** `Bug fix: added an error boundary around each route`
- **Priority:** P3. **Branch:** `bugfix/error-boundary`. **Depends on:** F-N1 merged (F-N1 adds the routes, this only wraps them).
- **May touch:** `src/App.jsx`, new `src/components/ErrorBoundary.jsx`.
- **Do:** if a page throws while rendering, show a short message with a "Back to videos" button instead of a white screen. The nav stays usable.
- **Done when:** you checked it by temporarily throwing inside a page (undo it), and lint, tests, build and e2e pass.

### F-S1: Validate data from the server and from localStorage

- **Category / PR title:** `Security: validated the result link and stored recent jobs before rendering`
- **Priority:** P3. **Branch:** `security/validate-untrusted-data`. **Depends on:** nothing.
- **May touch:** `src/components/JobStatusPanel.jsx`, `src/lib/recentJobs.js`, `tests/unit/recentJobs.test.js`.
- **Do:** the CSV link must match `/results/<uuid>.csv` before it goes into an `href`. Recent-job colors must be six hex digits before they go into a style. A stored value that is not an array becomes an empty history (Wave 5's tests recorded the old behavior, update them).
- **Done when:** unit tests cover each bad value, and lint, tests and build pass.

### F-P1: Faster centroid code

- **Category / PR title:** `Performance: removed per-pixel allocations from the centroid pipeline`
- **Priority:** P3. **Branch:** `performance/centroid-inner-loops`. **Depends on:** nothing.
- **May touch:** `src/lib/centroid/*.js`, `tests/unit/*.test.js`.
- **Do:** no object per pixel in `binarize`, no neighbor array per pixel in the group finder. Add one **new** export in `src/lib/centroid/index.js` that does the binarize once and returns both the binary result and the centroid, so Drew's F-P2 can stop binarizing every frame twice. `findLargestCentroid(imageData, targetColorHex, threshold) -> {x, y} | null` keeps its signature and results, and must behave like the Java version.
- **Done when:** existing unit tests pass unchanged, new tests cover the new export, and the PR shows a timing before and after on a full-HD frame.

### F-A1: Supabase client and sign-in token helper

- **Category / PR title:** `Other: added the Supabase client and a sign-in token helper`
- **Priority:** P2. **Branch:** `other/supabase-client`. **Depends on:** F-S1 merged, decision D8. S-0 stage 1 for the live check.
- **May touch:** `package.json` and `package-lock.json` (add `@supabase/supabase-js` only), new `src/lib/supabase.js`, new `src/lib/auth.js`, `src/api/client.js`, new `.env.example`, `tests/unit/auth.test.js`, `tests/unit/client.test.js`.
- **Do:**
  - `supabase.js` is tiny: it creates the client from `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, or exports `null` when they are missing, so the app still runs as a guest.
  - Put the logic in `auth.js` with its dependencies passed in, because Mocha has no `import.meta.env`. `getAccessToken()` returns the current token or `null`.
  - `fetchJson` adds `Authorization: Bearer <token>` when a token exists. Nothing else about it changes.
  - **Only the anon key, never the service-role key.**
- **Done when:** unit tests cover token present, token missing, a failing token lookup (request still goes out as a guest), and the header being added. The app starts with no env variables set.

### F-A2: Sign in, sign up, sign out

- **Category / PR title:** `Other: added sign-in, sign-up and sign-out`
- **Priority:** P2. **Branch:** `other/auth-ui`. **Depends on:** F-A1 and F-N1 merged.
- **May touch:** new `src/context/AuthContext.jsx`, `src/main.jsx` (wrap the provider), `src/pages/SignInPage.jsx` (replace the stub), `src/components/nav/AppNav.jsx`, new `tests/e2e/auth.spec.js`.
- **Do:** `useAuth()` returns `{ user, loading, signIn(email, password), signUp(email, password), signOut }`, with `user` `null` for guests. Show real error messages (wrong password, email taken) and a loading state. With no Supabase env variables, the page says sign-in is not set up and everything else still works. The nav shows the email and a sign-out button when signed in.
- **Done when:** the e2e spec mocks the Supabase auth endpoints with `page.route` and covers sign-in success, a wrong password, sign-out, and the not-configured state. Drew's F-J1 can now use `useAuth()`.

### F-ST1: Settings page and Help guide

- **Category / PR title:** `Other: added a settings page and an in-app help guide`
- **Priority:** P2. **Branch:** `other/settings-and-help`. **Depends on:** F-N1 merged.
- **May touch:** `src/pages/SettingsPage.jsx`, `src/pages/HelpPage.jsx`, new `src/components/settings/**`, new `src/lib/settings.js`, `tests/unit/settings.test.js`, new `tests/e2e/settings.spec.js`.
- **Do:**
  - `settings.js`: `loadSettings()` and `saveSettings()` in `localStorage` (key `centroidFinder.settings`, every call in try/catch). `loadSettings()` always returns a valid object: default color (six hex digits, default `4F080B`), default threshold (0 to 441, default `60`), theme mode (`system`, `light`, `dark`, default `system`). Bad stored values fall back to the defaults. A "Reset to defaults" button.
  - The Settings page edits those fields. The theme mode is only stored here, F-TH1 connects it.
  - The Help page gives straightforward advice on how to use the tool: what it does, picking a color, what the threshold means (with a good starting value), reading the CSV, the tabs, exporting, what happens to uploaded videos, and the difference between guest and signed-in.
- **Done when:** unit tests cover the defaults, corrupt storage, out-of-range values and a throwing `localStorage`. The e2e spec changes a setting and reloads. Drew's F-B2 can now call `loadSettings()`.

### F-X1: Export formats

- **Category / PR title:** `Other: added export formats (CSV, JSON, TSV, PNG) for finished jobs`
- **Priority:** **P1** (`polish.md` extra idea). **Branch:** `other/export-formats`. **Depends on:** F-S1 merged (same file). Decision D7.
- **May touch:** new `src/lib/export/` (`parseCsv.js`, `toJson.js`, `toTsv.js`, `trajectory.js`), new `src/components/export/ExportMenu.jsx`, `src/components/JobStatusPanel.jsx` (mount the menu), `tests/unit/export.test.js`, new `tests/e2e/export.spec.js`.
- **Do:** no backend change, everything is built in the browser from the job's CSV.
  - `parseCsv`: rows are `timestamp,x,y` with no header. `-1,-1` means "not found" and becomes `found: false`. Handle a trailing newline and CRLF.
  - JSON: `[{ "timestamp": 0.5, "x": 12, "y": 40, "found": true }, ...]`. TSV: a header row `timestamp<TAB>x<TAB>y`, `-1` rows kept as they are.
  - PNG: draw the first frame (`getThumbnailUrl(filename)`) with the path as a line and dots (skip "not found" rows), at the frame's natural size, then `canvas.toBlob`. Keep the pure geometry in `trajectory.js` so it can be unit tested.
  - The original CSV link stays. Download through a Blob URL and an `<a download>`, then revoke the URL. File names look like `<video>-<jobId>.<ext>`.
- **Done when:** unit tests cover the parser (including not-found rows, empty input, CRLF) and each converter. The e2e spec clicks each format and checks the download name.

### F-TH1: Theme refresh

- **Category / PR title:** `Other: refreshed the theme and global look`
- **Priority:** P2. **Branch:** `other/theme-refresh`. **Depends on:** F-ST1 merged and **decision D10 made** (humans pick the direction first).
- **May touch:** `src/theme.js`, `src/main.jsx`, `index.html` (title, description, theme color), `public/favicon.svg`, new `src/context/ThemeModeContext.jsx`, `src/components/settings/**` (connect the theme-mode setting).
- **Do:** propose two or three directions with a sentence each and wait for Mason to choose. Then implement it: palette, typography, shape, and the `system`, `light`, `dark` modes from Settings (`system` follows the OS). Check text contrast. No layout edits to pages, that is Drew's F-UX1.
- **Done when:** both pages and Settings look right in light and dark, in the browser, and lint, tests, build and e2e pass.

### F-TH2: Mobile-first theme

- **Category / PR title:** `Other: mobile-first theme (breakpoints, type scale, touch targets)`
- **Priority:** P2. **Branch:** `other/mobile-first-theme`. **Depends on:** F-TH1 merged.
- **May touch:** `src/theme.js`, `index.html` (viewport meta), `src/components/nav/**`, `src/components/export/**`, `src/components/settings/**`, `src/pages/SettingsPage.jsx`, `HelpPage.jsx`, `SignInPage.jsx`, new `tests/e2e/mobileTheme.spec.js`.
- **Do:** touch targets at least 44 px, readable type, the nav collapses to a menu on small screens, and no horizontal scroll at 360 px wide on the pages and components you own.
- **Done when:** the new spec runs at 360 x 740 and checks the page does not scroll sideways and the nav is usable. Drew's F-MB1 can now start.

### F-H1: Vercel configuration (PARKED, do not start)

**Parked by decision D2 (2026-11-25): local only for now.** The text below is kept so the task can be revived. Nobody takes it in Wave 6 unless Mason says so.

- **Category / PR title:** `Other: Vercel config so the frontend can be deployed`
- **Priority:** P3. **Branch:** `other/vercel-config`. **Depends on:** backend B-H1 merged and a new decision on D2.
- **May touch:** new `vercel.json`, new `docs/deploy.md`, `.env.example`.
- **Do:** `vercel.json` falls back to `index.html` for client-side routes and rewrites `/api/*`, `/thumbnail/*`, `/process/*`, `/results/*` and `/videos/*` to the backend URL, so the browser still sees one origin (no CORS). `docs/deploy.md` lists the `VITE_` variables to set in Vercel.
- **Risk to test early:** large uploads through a Vercel rewrite may hit Vercel's request-size limits (I have not verified the current numbers). Try a 50 MB upload on the preview deployment. If it fails, the fallback is to let the frontend call the backend directly (a base-URL setting in `src/api`, plus CORS on the server), which becomes a new task.
- **Never** create the Vercel project, push, or deploy from an agent. Mason does that and approves each step.
- **Done when:** a preview deployment loads the app, lists videos and processes one.

### F-D1: README (human-written) and demo GIF

- **Category / PR title:** `Documentation: rewrote the README by hand with a demo GIF`
- **Priority:** **P1.** **Branch:** `docs/human-readme`. **Depends on:** all features and F-MB1 merged. Do this last.
- **Written by Mason, not by an AI** (Section 0 rule 13). The agent does not write or rewrite sentences. It may run the README's commands to check they work, check links, and **record the GIF** if Mason asks.
- **May touch:** `README.md`, new `docs/demo.gif` (keep it small, a few MB at most), `docs/screenshots/**` (remove what the README no longer uses).
- **Write it for a recruiter or hiring manager** (`polish.md`): what the tool does and why it is interesting, the GIF near the top (choose or upload a video, move the color and threshold, Process, result, export), how to run it with the backend, the architecture in a few lines (live preview in the browser, heavy work in the Java processor), what we each built, and what we learned. Remove the stale mentions of the mock-video fallback and of `npm test` covering only `src/lib/centroid`.
- **Done when:** a teammate can clone, install, run and test using only the README, and every link works.

---

## Section 6: Drew's tasks (this repo)

**You own:** everything marked Drew in Section 3.
**You must NOT touch:** `src/lib/**`, `src/api/**`, `src/App.jsx`, `src/main.jsx`, `src/theme.js`, `src/components/JobStatusPanel.jsx`, `src/components/nav/**`, `src/components/export/**`, `src/components/settings/**`, `src/context/**`, Mason's pages (`SettingsPage.jsx`, `HelpPage.jsx`, `SignInPage.jsx`), `tests/unit/**` (except a new test file for a pure helper you create), `package*.json`, `.github/**`, `README.md`, `docs/**`.

Every task: a header comment in each new file, JSDoc on every exported function, an e2e spec that mocks the backend with `page.route`, and no new dependencies. A new pure helper may get a new file in `tests/unit/` with a unique name.

### F-U1: File picker (upload your own video)

- **Category / PR title:** `Other: added a file picker so users can upload their own videos`
- **Priority:** **P1, Mason's stated priority.** **Branch:** `other/upload-ui`. **Depends on:** F-API1 merged. Backend B-U1 for the live check.
- **May touch:** new `src/components/VideoUpload.jsx`, `src/pages/VideoChooser.jsx`, new `tests/e2e/videoUpload.spec.js`.
- **Do:**
  - An "Upload video" button and a drop area on the chooser, using `uploadVideo(file)` from `src/api/videos.js`. On a phone, also a "Record" button using `<input type="file" accept="video/*" capture="environment">`.
  - Check the extension and show the server's message for a too-large file (413) or a rejected one (400). Disable the controls while uploading so nobody double-submits. Real errors with a retry, never a silent fallback.
  - On success the list refreshes, the new video is highlighted, and there is an "Open" action. Recent Jobs keeps working in every state.
  - Keyboard and screen reader friendly (a real `<label>` and button).
- **Done when:** the e2e spec covers success, a 400, a 413 and the server being down, and lint, unit tests, build and e2e pass.

### F-E2: Sturdier job polling

- **Category / PR title:** `Error handling: disable Process while busy and retry failed status polls`
- **Priority:** P3. **Branch:** `error-handling/job-polling`. **Depends on:** nothing.
- **May touch:** `src/pages/VideoPreview.jsx`, `tests/e2e/videoPreview.spec.js`.
- **Do:** the Process button is disabled while a job runs (no double submit). Polls never overlap. One failed poll does not fail the job: retry a few times, then show an error with a "Try again" action. A job that runs too long shows a message instead of polling forever. Polling stops when the page is left.
- **Done when:** the e2e spec covers a single failed poll that recovers, repeated failures, and a double click on Process.

### F-R2: Extract hooks from the preview

- **Category / PR title:** `Refactoring: extracted thumbnail-loading and job-polling hooks from the preview page`
- **Priority:** P3. **Branch:** `refactoring/extract-preview-hooks`. **Depends on:** F-E2 merged.
- **May touch:** `src/components/ThumbnailCanvas.jsx`, `src/pages/VideoPreview.jsx`, new files in `src/hooks/` (including the pure black-and-white image helper, because `src/lib/` is Mason's).
- **Do:** behavior does not change. Add or extend tests first, then move the code.
- **Done when:** the existing e2e specs pass unchanged.

### F-C1: Pick the color from the frame

- **Category / PR title:** `Other: pick the target color from the video frame instead of a popup that covers it`
- **Priority:** P2 (`goals.md` Easy: fix the color picker). **Branch:** `other/frame-color-picker`. **Depends on:** F-R2 merged.
- **May touch:** `src/components/ColorPicker.jsx`, `src/components/ThumbnailCanvas.jsx`, `src/pages/VideoPreview.jsx`, new `src/hooks/colorSampling.js`, new `tests/unit/colorSampling.test.js`, `tests/e2e/videoPreview.spec.js`.
- **Why it is broken:** the picker is a native `<input type="color">`. Its dialog is drawn by the operating system, so it can open right over the object you are trying to pick from, and we cannot move it.
- **Do:** replace it with (1) clicking the frame to sample that spot (crosshair cursor), averaging a small area such as 3 x 3 pixels so one noisy pixel does not decide the color, and (2) a hex field plus a swatch placed **beside or below** the frame, never over it. Pure helpers `pixelToHex` and `averageHex` live in `colorSampling.js`.
- **Done when:** unit tests cover the helpers (edges of the image, a 1 x 1 area), and the e2e spec clicks the canvas and sees the color field update and the preview redraw.

### F-J1: Jobs table

- **Category / PR title:** `Other: added a jobs table backed by the database`
- **Priority:** **P1** (`polish.md` extra idea). **Branch:** `other/jobs-table`. **Depends on:** F-N1, F-API1 and F-A2 merged. Backend B-J1 for the live check.
- **May touch:** `src/pages/JobsPage.jsx` (yours since F-N1), new `src/components/JobsTable.jsx`, new `tests/e2e/jobs.spec.js`.
- **Do:** a MUI table of the user's jobs from `getJobs()`: video, a color swatch, threshold, a status chip, created time, a link to the result, and an "Open" link to `/preview/<filename>?color=RRGGBB&threshold=N` (F-B2 makes the preview read those parameters). Sort newest first. Loading, error with retry, and empty states. While any job is `processing`, refresh with a delay and pause when the tab is hidden. Guests see a sign-in prompt, plus their local recent jobs (`getRecentJobs()` from `src/lib/recentJobs.js`) in the same table. Validate the color and the result path before using them (see Mason's F-S1).
- **Done when:** the e2e spec covers a signed-in user with jobs, empty, an error then retry, a guest, and a processing row refreshing to done.

### F-M1: Metadata page

- **Category / PR title:** `Other: added a metadata page with the location tag`
- **Priority:** P2. **Branch:** `other/metadata-page`. **Depends on:** F-N1 and F-API1 merged. Backend B-M1 for the live check. Decision D6.
- **May touch:** `src/pages/MetadataPage.jsx` (yours since F-N1), new `src/components/MetadataPanel.jsx`, `src/components/VideoListItem.jsx` (add a secondary "Metadata" link, the existing click still opens the preview), new `tests/e2e/metadata.spec.js`.
- **Do:** `/metadata` lists the videos. `/metadata/:filename` shows duration (as mm:ss), resolution, frame rate, codec, size, bit rate and created date. Unknown values read "Unknown". If there is a location, show the numbers and an "Open in map" link to OpenStreetMap built **only** from validated numbers (finite, latitude -90 to 90, longitude -180 to 180) with `rel="noopener noreferrer"`. No location reads "No location in this file". Loading and error with retry.
- **Done when:** the e2e spec covers a full result, a result with nulls, no location, a 404, and a 500.

### F-P2: Throttle the live preview

- **Category / PR title:** `Performance: throttled the live preview while dragging the slider`
- **Priority:** P3. **Branch:** `performance/throttle-live-preview`. **Depends on:** F-P1 (Mason) and F-C1 merged.
- **May touch:** the hook files in `src/hooks/`, `src/components/ThumbnailCanvas.jsx`.
- **Do:** at most one recompute per animation frame while dragging, and use Mason's new binarize-once export so each frame is binarized once.
- **Done when:** the e2e spec still passes, and the PR shows how many recomputes a slider drag causes before and after.

### F-B2: Recent jobs reopen with their settings

- **Category / PR title:** `Bug fix: recent jobs reopen with their saved color and threshold`
- **Priority:** P3. **Branch:** `bugfix/restore-recent-job-settings`. **Depends on:** F-ST1 and F-C1 merged.
- **May touch:** `src/pages/VideoChooser.jsx`, `src/pages/VideoPreview.jsx`, `tests/e2e/videoChooser.spec.js`, `tests/e2e/videoPreview.spec.js`.
- **Do:** recent-job links go to `/preview/<filename>?color=RRGGBB&threshold=N`. The preview validates both (six hex digits, 0 to 441) and ignores bad ones. With no parameters, the defaults come from `loadSettings()` in `src/lib/settings.js`, then the built-in `4F080B` and `60`.
- **Done when:** the e2e spec covers a valid link, a bad link, and the defaults from settings.

### F-UX1: UI and UX polish across the pages

- **Category / PR title:** `Other: UI and UX polish across the pages`
- **Priority:** P2. **Branch:** `other/ux-polish`. **Depends on:** F-U1, F-C1, F-J1, F-M1, F-B2 and F-TH1 merged, and decision D10.
- **May touch:** `src/pages/VideoChooser.jsx`, `VideoPreview.jsx`, `src/components/ColorPicker.jsx`, `ThresholdSlider.jsx`, `ThumbnailCanvas.jsx`, `VideoListItem.jsx`, `src/components/VideoUpload.jsx`, `JobsTable.jsx`, `MetadataPanel.jsx`, `src/components/hoc/**`, `tests/e2e/`.
- **Do:** apply the direction the humans chose. Consistent page headers and spacing, loading skeletons, clear empty states, plain wording around the Process flow, and contextual links to `/help`. No behavior changes.
- **Done when:** lint, unit tests, build and e2e pass, and the PR has before and after screenshots.

### F-MB1: Mobile-first pages and phone camera

- **Category / PR title:** `Other: mobile-first layout for the pages and phone camera support`
- **Priority:** P2. **Branch:** `other/mobile-first-pages`. **Depends on:** F-UX1 and F-TH2 merged.
- **May touch:** the same files as F-UX1, plus `playwright.config.js` (add a phone-sized project).
- **Do:** no sideways scroll at 360 px, stacked layout, 44 px touch targets, the canvas scales to the screen, the slider is easy to grab with a thumb, and the Record button from F-U1 works on a real phone (use `npm run dev -- --host` and open it on the phone over the same Wi-Fi).
- **Done when:** the e2e suite also runs in the phone-sized project and passes, and you tried it on a real phone.

### F-T2: Stronger end-to-end assertions

- **Category / PR title:** `Tests: strengthened Playwright tests to check canvas pixels and job flows`
- **Priority:** P3. **Branch:** `tests/e2e-real-assertions`. **Depends on:** F-MB1 merged (most specs are touched by earlier tasks).
- **May touch:** `tests/e2e/videoChooser.spec.js`, `videoPreview.spec.js`, `playwright.config.js`.
- **Do:** the slider test must fail if nothing redraws (compare canvas pixels). Add the error, polling and recent-jobs flows, and replace fixed sleeps with waiting on a condition.
- **Done when:** each new assertion fails if you deliberately break the code it covers (check locally, then undo).

### F-D2: JSDoc for components and pages

- **Category / PR title:** `Documentation: added JSDoc to components and pages`
- **Priority:** P3. **Branch:** `docs/component-jsdoc`. **Depends on:** F-T2 merged. Do this last in your lane.
- **May touch:** comment-only changes in `src/components/*.jsx` (your files), `src/pages/*.jsx` (your files) and `src/hooks/**`.
- **Done when:** `git diff` shows only comments and everything still passes.

---

## Section 7: Decisions needed (same list in both repos)

Each line has a **default**. An agent that reaches a task blocked by an open decision uses the default only if its human says so; otherwise it asks.

| # | Decision | Default if nobody objects | Blocks |
|---|---|---|---|
| D1 | PR label for new features. | **Decided 2026-11-25:** `Other:` in the PR title, branch prefix `other/` or `feature/`. | none |
| D2 | **Where the backend runs.** | **Decided 2026-11-25: local only for now.** B-H1 and F-H1 are parked. Reminder for later: Vercel can host the React app but not the Java 21 + ffmpeg backend, so that part would need a Docker host, and each host's free limits (memory especially) must be checked first. | nothing in Wave 6 |
| D3 | Add `multer` (2.x) to `server/` for uploads. | **Decided 2026-11-25: yes.** OpenCV may also be added if a task really needs it, with the reason in the PR. | none |
| D4 | Guests on a deployed site. | Locally everything works without signing in. On the deployed site, uploading requires sign-in, set by an env variable added in B-H1. | B-H1 |
| D5 | Metadata engine. | `ffprobe` from the server (it ships with ffmpeg, no new dependency). Java stays untouched. | B-M1 |
| D6 | What "geolocation tags" means (`goals.md` asks Drew's agent to revise this item). | Read the location tag if the file has one, show it and link to a map. We do not write tags into videos. | B-M1, F-M1 |
| D7 | Export formats. | CSV, JSON, TSV and a PNG of the path drawn over the first frame. No wav/mp3. | F-X1 |
| D8 | Sign-in method. | Supabase email + password. Sign-in stays optional, guest mode keeps working. | B-A1, F-A1, F-A2 |
| D9 | Who owns the Supabase project. | Mason creates it and shares keys with Drew through a password manager. | S-0 |
| D10 | UI direction (`goals.md`: "find some uniqueness"). | Before F-TH1 and F-UX1, the agent proposes two or three directions and the humans choose. No restyle before then. | F-TH1, F-UX1 |

---

## Section 8: Backlog (not assigned in Wave 6)

Add one of these to this file first, with its own **May touch** list and owner, and get your partner's OK before starting.

- **Hosting** (B-H1 Docker setup and deploy notes for the backend, F-H1 `vercel.json` for the frontend). Parked by decision D2 (local only for now). Both task texts stay in Section 5 or 6, marked PARKED. If we revive them, also decide guest access on a public site (uploads without sign-in) and where results are stored if the host wipes its disk.
- **Live stream capabilities and live stats** (distance, speed, geolocation overlay). Needs a new streaming path and a decision on the processor. `goals.md` calls it a stretch.
- **AI for real-time readings.** The biggest stretch.
- **Metadata for images** (EXIF). Needs a new Java or Node dependency.
- **Sonification export** (wav/mp3 from the path). A fun idea, decision D7 leaves it out.
- **Settings and history synced to the account** beyond what F-ST1 stores locally.
- **Results kept in Supabase Storage** instead of the server's disk. Needed if the chosen host has an ephemeral disk (B-H1 will say).
- **Sound tracking in silent videos.** Marked impossible in `goals.md` (out of scope for our equipment).
- **Full AR overlay.** Marked impossible in `goals.md`. A canvas drawn over the camera feed is possible, true AR is not reliable in browsers yet.
- **Single `/api` prefix for every route.** Couples both repos, leave until Wave 6 is done.
- **Java package restructure.** Touches every Java file, so only do it alone and first.
- Stretch ideas from Mason's Google Docs (pan-tilt servo tracker, phone livestream report app, AR walking guide). New projects, plan them with the humans first.

## Keeping the two files in sync

Sections 0, 1, 2, 7 and 8 are identical in `onjamm/centroid-finder` and `sabinMas/centroid-finder-frontend`. Sections 3 to 6 are about the repo they sit in. When a shared section changes, change it in both repos in the same session and tell the partner through the pair relay.

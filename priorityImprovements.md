# Priority Improvements (Frontend, Wave 4)

Scoped to `sabinMas/centroid-finder-frontend`. This file only lists improvements for this repo. The shared Google doc [priorityImprovements](https://docs.google.com/document/d/1u7U2ftQbZdAJyk1OF5iQ6v1unYbatToOxnap652U4Tk/edit) covers both repos together, including the concerns they share.

**Status: Wave 5 set chosen.** The rest are AI-ranked proposals pulled from `humanImprovements.md` and `robotImprovements.md`. The assignment says the two of us decide the final top two per category, so edit freely. Once it's settled, this becomes the basis for the new `TASKS.md`.

## What the assignment asks for

- **Wave 4:** list the top **two** improvements in each category. Refactoring, tests, error handling and documentation are required. Performance, security, bug fixes and other are optional.
- **Wave 5:** make at least **6** improvements across the project, with at least one from each required category. Each one gets its own branch and a PR whose title starts with the category. The partner reviews it and says LGTM, and nobody approves their own PR.

## Lanes (who owns which files in this repo)

- **sabinMas:** `src/lib/**`, `src/api/**`, `src/App.jsx`, `src/main.jsx`, `src/theme.js`, `src/components/JobStatusPanel.jsx`, `src/index.css`, `tests/unit/**`, `README.md`, `package.json` and `package-lock.json`, `.github/**`, `docs/`
- **onjamm:** `src/pages/**`, `src/components/**` (except `JobStatusPanel.jsx`), a new `src/hooks/**` folder, `src/mock/` (to delete), `tests/e2e/**`

Lanes follow the split that already worked in the original `TASKS.md`, so the two agents almost never edit the same file.

## Chosen for Wave 5 (confirmed)

We picked these 8 branches across both repos: 4 for sabinMas and 4 for onjamm. Together they cover every required category and clear the minimum of 6. The exact steps, file ownership and merge order for this repo are in `TASKS.md`. Everything else in this file stays as backlog.

| ID | Category | Owner | Reviewer | Branch | Repo |
|---|---|---|---|---|---|
| F-R1 | Refactoring code | sabinMas | onjamm | `refactoring/remove-scaffold-dead-code` | **this repo** |
| F-T1 | Adding tests | sabinMas | onjamm | `tests/recent-jobs-and-api-client` | **this repo** |
| B-T2 | Adding tests | sabinMas | onjamm | `tests/restore-video-fixture` | backend |
| B-E1 | Improving error handling | sabinMas | onjamm | `error-handling/exit-codes-and-exceptions` | backend |
| B-R3 | Refactoring code | onjamm | sabinMas | `refactoring/extract-job-runner` | backend |
| F-E1 | Improving error handling | onjamm | sabinMas | `error-handling/video-list-retry` | **this repo** |
| B-T1 | Adding tests | onjamm | sabinMas | `tests/fix-ci-workflow` | backend |
| B-D2 | Writing documentation | onjamm | sabinMas | `docs/readme-and-server-jsdoc` | backend |

The ones in this repo:

- **F-R1** (Refactoring code, sabinMas): Remove Vite scaffold CSS and stale ownership headers (`refactoring/remove-scaffold-dead-code`)
- **F-T1** (Adding tests, sabinMas): Unit tests for recentJobs.js and api/client.js (`tests/recent-jobs-and-api-client`)
- **F-E1** (Improving error handling, onjamm): Replace the silent mock-video fallback with an error and Retry (`error-handling/video-list-retry`)

## Top two per category

### Refactoring code (required)

#### F-R1: Remove Vite scaffold CSS and stale ownership headers

- **Why:** Most of src/index.css is leftover Vite starter CSS that fights the MUI theme, and every file still says OWNED BY / FROZEN from the old parallel-branch plan. 
- **Branch:** `refactoring/remove-scaffold-dead-code`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** src/index.css; src/main.jsx (only the index.css import, if the file is deleted); the OWNED BY / FROZEN / Contract header comment lines at the top of files in src/
- **Collision notes:** Touches the top of many files, so merge this FIRST before any other frontend branch starts.
- **PR title:** "Refactoring: removed Vite scaffold CSS and stale ownership headers"

#### F-R2: Split ThumbnailCanvas and VideoPreview into hooks and a pure helper

- **Why:** ThumbnailCanvas loads the image, builds the black-and-white image and draws the dot in one component. VideoPreview mixes layout with the job-polling logic. Splitting them makes each piece testable (Wave 2 wanted ThumbnailCanvas split).
- **Branch:** `refactoring/extract-preview-hooks`
- **Suggested owner:** onjamm
- **Files this branch may touch:** src/components/ThumbnailCanvas.jsx; src/pages/VideoPreview.jsx; new src/hooks/ folder (put the pure black-and-white image helper there too, since src/lib/ is the other lane)
- **Collision notes:** Same files as F-E2, F-P2, F-D2 and F-B2. Do F-E2 first, then this, in the same lane.
- **PR title:** "Refactoring: extracted thumbnail-loading and job-polling hooks from the preview page"

### Adding tests (required)

#### F-T1: Unit tests for recentJobs.js and api/client.js

- **Why:** Both are pure logic with zero tests. Cover the 10-item cap, corrupt or non-array localStorage, fetchJson success, error with and without a body, and the URLs the api helpers build.
- **Branch:** `tests/recent-jobs-and-api-client`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** new files in tests/unit/; .mocharc.json only if a test setup file is needed
- **Collision notes:** No collisions. Good first branch.
- **PR title:** "Tests: added unit tests for recentJobs and the API client"

#### F-T2: Make the e2e tests assert real behavior

- **Why:** The slider test only checks that the canvas is still visible, so it passes even if nothing redraws. Add pixel checks plus error, polling and recent-jobs flows.
- **Branch:** `tests/e2e-real-assertions`
- **Suggested owner:** onjamm
- **Files this branch may touch:** tests/e2e/*.spec.js only
- **Collision notes:** F-E1 and F-E2 also edit these specs. Start this after both merge, or rebase on them.
- **PR title:** "Tests: strengthened Playwright tests to check canvas pixels and job flows"

### Improving error handling (required)

#### F-E1: Replace the silent mock-video fallback with an error and Retry

- **Why:** When the backend fails for any reason, the chooser shows three fake videos that then fail on the next page. Show a real error with Retry, plus loading and empty states, and delete src/mock/ (Wave 2 marked it red).
- **Branch:** `error-handling/video-list-retry`
- **Suggested owner:** onjamm
- **Files this branch may touch:** src/pages/VideoChooser.jsx; src/mock/ (delete); tests/e2e/videoChooser.spec.js (the fallback test)
- **Collision notes:** README mentions the mock fallback, so F-D1 should update that line after this merges.
- **PR title:** "Error handling: Video Chooser shows a retry state instead of mock videos"

#### F-E2: Sturdier job polling and no double submits

- **Why:** The Process button stays enabled while busy, polls can overlap, there's no timeout, and one network blip marks the job failed for good.
- **Branch:** `error-handling/job-polling`
- **Suggested owner:** onjamm
- **Files this branch may touch:** src/pages/VideoPreview.jsx; tests/e2e/videoPreview.spec.js
- **Collision notes:** Same lane as F-R2. Merge this before F-R2 starts.
- **PR title:** "Error handling: disable Process while busy and retry failed status polls"

### Writing documentation (required)

#### F-D1: README update plus JSDoc for lib/ and api/

- **Why:** README is missing the lint script and e2e instructions, still describes the mock fallback and the missing ball.mp4, and has no how-it-works section.
- **Branch:** `docs/readme-and-lib-jsdoc`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** README.md; comment-only changes in src/lib/** and src/api/**
- **Collision notes:** Comments in src/lib/centroid overlap F-P1 (same lane). Merge F-P1 first, or keep this to README only.
- **PR title:** "Documentation: updated README and added JSDoc to lib and api"

#### F-D2: JSDoc for components and pages (the Wave 2 blue items)

- **Why:** ThresholdSlider, ThumbnailCanvas, VideoChooser and VideoPreview were all flagged blue for more docs in Wave 2.
- **Branch:** `docs/component-jsdoc`
- **Suggested owner:** onjamm
- **Files this branch may touch:** comment-only changes in src/components/*.jsx and src/pages/*.jsx
- **Collision notes:** Do this LAST in the onjamm lane, after F-E1, F-E2 and F-R2, because it touches the same files.
- **PR title:** "Documentation: added JSDoc to components and pages"

### Improving performance (optional)

#### F-P1: Faster centroid code (no per-pixel objects, binarize once)

- **Why:** binarize() makes a new object per pixel, the group finder allocates a neighbor array per pixel, and the preview binarizes every frame twice. On a full-HD frame that's millions of objects per slider tick.
- **Branch:** `performance/centroid-inner-loops`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** src/lib/centroid/*.js; tests/unit/*.test.js
- **Collision notes:** Only lib/centroid, so it doesn't collide with the onjamm lane. Exposes a 'binary in' function that F-P2 then uses.
- **PR title:** "Performance: removed per-pixel allocations from the centroid pipeline"

#### F-P2: Throttle the live preview

- **Why:** The slider fires onChange continuously while dragging, and each change reruns the whole pipeline.
- **Branch:** `performance/throttle-live-preview`
- **Suggested owner:** onjamm
- **Files this branch may touch:** src/components/ThumbnailCanvas.jsx (or the hook from F-R2)
- **Collision notes:** Needs F-P1 and F-R2 merged first.
- **PR title:** "Performance: throttled the live preview while dragging the slider"

### Hardening security (optional)

#### F-S1: Validate data from the server and from localStorage

- **Why:** The CSV link from the server goes straight into an href, and recent-job colors from localStorage go straight into a style value.
- **Branch:** `security/validate-untrusted-data`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** src/components/JobStatusPanel.jsx; src/lib/recentJobs.js; tests/unit/ (recent jobs tests)
- **Collision notes:** Merge after F-T1, since both touch the recent-jobs tests. No other branch edits JobStatusPanel.
- **PR title:** "Security: validated the result link and stored recent jobs before rendering"

#### F-S2: Dependency updates and automatic audits

- **Why:** npm outdated shows MUI 9.5 to 9.6 and oxlint 1.94 to 1.95. Add Dependabot so this stays current.
- **Branch:** `security/dependency-updates`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** package.json; package-lock.json; new .github/dependabot.yml
- **Collision notes:** The only branch allowed to change package.json. Anyone else who needs a dependency asks first.
- **PR title:** "Security: updated dependencies and enabled Dependabot"

### Bug fixes (optional)

#### F-B1: Add an error boundary so one crash doesn't blank the app

- **Why:** findLargestCentroid can throw, and nothing catches it, so the whole page goes white.
- **Branch:** `bugfix/error-boundary`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** src/App.jsx; one new component file in src/components/
- **Collision notes:** No collisions after F-R1.
- **PR title:** "Bug fix: added an error boundary around each route"

#### F-B2: Clicking a recent job should restore its settings

- **Why:** Recent jobs save the color and threshold, but clicking one opens the preview with the defaults.
- **Branch:** `bugfix/restore-recent-job-settings`
- **Suggested owner:** onjamm
- **Files this branch may touch:** src/pages/VideoChooser.jsx; src/pages/VideoPreview.jsx
- **Collision notes:** After F-E1, F-E2 and F-R2 in the onjamm lane.
- **PR title:** "Bug fix: recent jobs reopen with their saved color and threshold"

### Other (optional)

#### F-O1: Frontend CI workflow (lint, unit tests, build, e2e)

- **Why:** This was our Wave 2 CI/CD item. The frontend has no CI at all.
- **Branch:** `other/frontend-ci`
- **Suggested owner:** sabinMas
- **Files this branch may touch:** new .github/workflows/ci.yml
- **Collision notes:** No collisions.
- **PR title:** "Other: added a GitHub Actions workflow for lint, tests and build"

## Merge order (per lane)

- **sabinMas:** F-R1 → F-T1 → F-S1 → F-P1 → F-D1 → F-B1 → F-S2 → F-O1
- **onjamm:** F-E1 → F-E2 → F-R2 → F-P2 → F-B2 → F-T2 → F-D2

The two lanes run in parallel. Exception: F-R1 touches the header comments of most files in src/, so it merges before the onjamm frontend lane starts (onjamm works on backend tasks first). F-P2 also waits for F-P1 from the other lane.

## Deferred (not this round)

- **API route rename** (a single `/api` prefix): couples both repos and every `src/api/` file, so leave it until after Wave 5.
- **Click-the-frame color picker, upload from PC, hosting, serverless database:** new features, and the assignment says no new features this phase.

## Rules so two AI agents don't cross paths

1. **Stay in your lane.** Each agent only edits files in its owner's lane (above) and only the files listed for its current branch. If it needs a file outside that list, it stops and asks a human instead of editing it.
2. **One branch at a time per agent**, in the merge order listed above. Branch from the latest `main` every time.
3. **Shared files have one owner.** Only the listed owner changes them; anyone else asks first. That covers `package.json` and `package-lock.json` in the frontend, and `pom.xml`, `.gitignore` and `README.md` in the backend.
4. **After any merge to `main`**, both agents merge `main` into their open branch before continuing.
5. **No drive-by fixes.** If an agent notices another problem, it writes it down instead of fixing it in the current branch.

## Shared concerns (both repos)

These affect both repos, so both agents need to know about them. The full list is in the shared Google doc.

- **The API contract is frozen for Wave 5.** No branch renames routes or changes the JSON shapes (`GET /api/videos`, `GET /thumbnail/:filename`, `POST /process/:filename`, `GET /process/:jobId/status`, `/results/*.csv`). The frontend's `src/api/` and the backend's `server/routes/` must keep matching.
- **The missing `ball.mp4`.** Backend B-T2 restores a test video. Frontend F-D1 updates the frontend README's setup steps to match, after B-T2 merges.
- **Error messages.** Backend B-E2 makes the server return short, friendly errors in the same `{ error }` shape. The frontend shows `error` as-is, so nothing changes on the frontend side.
- **Course rules for every branch:** one improvement per branch. The PR title starts with its category. The partner who didn't write it reviews it and comments LGTM. Nobody approves their own PR. Merge `main` into your other open branches after each merge. Every AI-assisted commit starts with "AI Used".

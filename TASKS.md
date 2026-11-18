# Task Plan: centroid-finder-frontend

Goal: build the React frontend described in the "Centroid Finder Frontend" Canvas assignment, with two people working at the same time on two branches that can each be merged into `frontend` with **zero merge conflicts**, because the two tracks never write to the same file.

## Branch layout

```
main
 └─ frontend          (integration branch - PRs land here first)
     ├─ onjamm-dev     (onjamm's work)
     └─ sabinmas-dev   (sabinmas's work)
```

Workflow: commit to your own `*-dev` branch, open a PR into `frontend` when ready, merge both into `frontend`, test the integrated app, then PR `frontend` into `main` for submission.

## Section 1 - Framework & Schema Setup (done)

This section was completed already (by Claude, on `main`) before the dev branches were cut. It exists so both of you can build in parallel against a fixed contract instead of waiting on each other. **Neither dev branch should need to touch these files** - if you think you need to, stop and coordinate first, since a change here affects both of you.

What's in place:

- **Tooling**: Vite + React 19 + React Router 7 + MUI installed. Mocha + Chai for unit tests, Playwright for e2e tests. `npm run dev` serves on **port 5180** (pinned in `vite.config.js` via `strictPort` - chosen because port 5173 was already in use on our machine; don't change it back without checking first).
- **Dev proxy**: `vite.config.js` proxies `/api`, `/thumbnail`, `/process`, `/results`, `/videos` to `http://localhost:3000` (the Express backend), so components can `fetch('/api/videos')` directly with no CORS setup.
- **Routing shell** (`src/App.jsx`, `src/main.jsx`): `/` redirects to `/videos`; `/videos` and `/preview/:filename` are wired to page components. `main.jsx` already wraps the app in MUI's `ThemeProvider`/`CssBaseline` and React Router's `BrowserRouter`.
- **API client contract** (`src/api/*.js` - fully implemented, frozen):
  - `getVideos()` → `GET /api/videos` → `Promise<string[]>`
  - `getThumbnailUrl(filename)` → returns the string `/thumbnail/:filename` (use directly as an `<img>`/canvas source)
  - `startProcessingJob(filename, targetColorHex, threshold)` → `POST /process/:filename?targetColor=&threshold=` → `Promise<{jobId}>`
  - `getJobStatus(jobId)` → `GET /process/:jobId/status` → `Promise<{status:'processing'} | {status:'done', result} | {status:'error', error}>`
- **Mock data contract** (`src/mock/*.js` - frozen): `mockVideoList`, `mockJobId`, `mockJobStatuses` (`.processing`/`.done`/`.error`), matching the real API shapes above.
- **`lib/centroid` contract** (`src/lib/centroid/*.js` - signatures frozen, bodies are `sabinmas-dev`'s to implement): the single function UI code should call is `findLargestCentroid(imageData, targetColorHex, threshold) → {x, y} | null`. It currently always returns `null` (safe no-op) so the UI builds and runs before the real algorithm lands.
- **Component/page stubs** (signatures frozen, bodies are `onjamm-dev`'s to implement): every component in `src/components/` and `src/pages/` exists with the right props/exports and renders a `TODO` placeholder, so routing and imports all work out of the box.
- **Test scaffolding**: `tests/unit/*.test.js` (Mocha/Chai, currently failing - that's intentional, they're `sabinmas-dev`'s targets) and `tests/e2e/videoChooser.spec.js` (Playwright, currently passing).

If either of you genuinely needs a new npm dependency, add it on your own branch, mention it in your PR description, and resolve `package-lock.json` conflicts by re-running `npm install` after merging (a lockfile conflict is the one acceptable exception to the "never touch the same file" rule, and it's mechanical to fix).

## Section 2 - onjamm's tasks (branch: `onjamm-dev`)

**You own, and are the only one who should edit:**
```
src/pages/VideoChooser.jsx
src/pages/VideoPreview.jsx
src/components/VideoListItem.jsx
src/components/ThumbnailCanvas.jsx
src/components/ThresholdSlider.jsx
src/components/ColorPicker.jsx
src/components/JobStatusPanel.jsx
src/components/hoc/withLoading.jsx
src/theme.js
tests/e2e/**
```
You may **import** (never edit) anything under `src/api/`, `src/mock/`, and `src/lib/centroid/` (via `findLargestCentroid`) - those are frozen contracts from Section 1.

### Tasks

1. **Video Chooser page** (`src/pages/VideoChooser.jsx`, route `/videos`)
   - `useEffect` + `useState` to call `getVideos()` from `src/api/videos.js`; fall back to `mockVideoList` from `src/mock/videos.js` if the fetch fails (backend might not be running yet).
   - Render one `VideoListItem` per video.
   - Clicking an item navigates to `/preview/:filename` (`useNavigate`).
   - Style the list with MUI (`List`/`ListItemButton`, a page heading, etc.).

2. **VideoListItem** (`src/components/VideoListItem.jsx`)
   - Replace the placeholder `<div>` with an MUI `ListItemButton`/`Card` showing the filename, calling `onClick(filename)`.

3. **Video Preview & Processing page** (`src/pages/VideoPreview.jsx`, route `/preview/:filename`)
   - `useParams()` for `:filename`.
   - Render `ThumbnailCanvas`, `ThresholdSlider`, `ColorPicker` side by side.
   - State for `targetColorHex` (default e.g. `"570D0E"`, matching the processor's validated salamander color from `plan.md` in the backend repo) and `threshold` (default e.g. `35`).
   - A "Process Video with These Settings" button that calls `startProcessingJob(filename, targetColorHex, threshold)` from `src/api/process.js`, stores the returned `jobId`.
   - Poll `getJobStatus(jobId)` (e.g. every 2s with `setInterval` inside a `useEffect`, cleared on unmount or once status is `done`/`error`) and pass the result into `JobStatusPanel`.
   - Wrap the processing section (or the whole page) with `withLoading` for the initial load state - this satisfies the assignment's HOC requirement.

4. **ThumbnailCanvas** (`src/components/ThumbnailCanvas.jsx`)
   - Load `getThumbnailUrl(filename)` into an `<img>`, draw it to a `<canvas>`, read `ImageData` via `getImageData()`.
   - Call `findLargestCentroid(imageData, targetColorHex, threshold)` (from `src/lib/centroid/index.js`) whenever `targetColorHex`/`threshold` change.
   - Render two canvases side by side: the original thumbnail, and a binarized version with a dot drawn at the returned centroid (if not `null`). You can draw the binarized pixels yourself here for the visual (black/white per-pixel), independent of what `findLargestCentroid` returns internally - or import `binarize` from `lib/centroid` too if that's easier (it's part of the same frozen module, read-only).
   - This updates live as the slider/color picker change (that's "live tuning" in the assignment).

5. **ThresholdSlider / ColorPicker** - swap the placeholder `<input>` elements for a real MUI `Slider` and a styled color input (MUI has no built-in color picker; a plain `<input type="color">` styled with `sx`, or a small library, is fine).

6. **JobStatusPanel** - style with MUI (`Alert` for error, `LinearProgress`/`CircularProgress` for processing, a `Link`/`Button` to the CSV for done).

7. **withLoading HOC** (`src/components/hoc/withLoading.jsx`) - implement it for real: when `loading` is true, render a centered `CircularProgress`; otherwise render the wrapped component.

8. **Styling** - fill out `src/theme.js` (palette, typography, spacing) for a consistent, attractive look across both pages.

9. **One unique feature of your choice** - pick something self-contained that doesn't require touching `sabinmas-dev`'s files, e.g.:
   - A "recent jobs" history (stored in `localStorage`) shown on the Video Chooser page.
   - A dark-mode toggle (extends `src/theme.js`).
   - Drag-and-drop reordering or filtering of the video list.

10. **Tests** (`tests/e2e/*.spec.js`, Playwright) - cover: the `/` → `/videos` redirect (already written), the video list rendering and navigating to a preview page, the slider/color picker updating the canvas, and the process button triggering a job status display (mock the API responses with Playwright's route interception, or run against the real backend if it's up).

## Section 3 - sabinmas's tasks (branch: `sabinmas-dev`)

**You own, and are the only one who should edit:**
```
src/lib/centroid/colorDistance.js
src/lib/centroid/binarize.js
src/lib/centroid/groupFinder.js
src/lib/centroid/index.js
tests/unit/**
```
You should not need to touch anything under `src/components/`, `src/pages/`, `src/theme.js`, or `tests/e2e/`.

This is a direct port of the Part 1 Java classes you and onjamm already wrote in the `centroid-finder` repo - same algorithms, same edge cases, just in JavaScript operating on a canvas `ImageData` buffer instead of a `BufferedImage`.

### Tasks

1. **`colorDistance.js`** - port of `EuclideanColorDistance.java`:
   - `hexToRgb(hex)`: parse a `"RRGGBB"` (optionally `"#RRGGBB"`) string into `{r, g, b}`.
   - `colorDistance(colorA, colorB)`: `sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2)`.
   - Make `tests/unit/colorDistance.test.js` pass (already written, describes the expected behavior - this mirrors how you started with tests in the Java course).

2. **`binarize.js`** - port of `DistanceImageBinarizer.toBinaryArray`:
   - `binarize(imageData, targetColorHex, threshold)`: walk `imageData.data` (a flat `Uint8ClampedArray` of RGBA quadruples, so pixel `i`'s red is at `data[i*4]`), compute each pixel's distance to the target color via `colorDistance`/`hexToRgb`, and return a `Uint8Array` of length `width*height` (not `width*height*4`) with `1` where distance `< threshold`, else `0`.
   - Make `tests/unit/binarize.test.js` pass.

3. **`groupFinder.js`** - port of `DfsBinaryGroupFinder.java` + `Group.java`'s centroid/sort logic:
   - `findConnectedGroups(binary, width, height)`: flood-fill (DFS or BFS, same idea as the Java version) over 4-connected (not diagonal) groups of `1`s in the flat `binary` array, compute each group's centroid via **integer division** (`Math.trunc` or `| 0`, matching Java's int division) of the summed x/y coordinates, and return an array of `{size, centroidX, centroidY}` sorted **descending by size** (ties don't need to match Java's exact tiebreak unless a test requires it - check `tests/unit/groupFinder.test.js` for what's actually asserted).
   - Make `tests/unit/groupFinder.test.js` pass.

4. **`index.js`** - already wires `binarize` + `findConnectedGroups` into `findLargestCentroid`. You shouldn't need to change this file once the three above are correct, but double check it once your pieces are done (it currently swallows errors into `null` - decide with onjamm whether that's still the right behavior once the real implementation lands, since a thrown error during development now means "not implemented," but after your work lands it would mean a real bug).

5. **Tests** (`tests/unit/*.test.js`, Mocha/Chai) - the three files above already have failing tests describing the contract (run `npm test` to see them). Add more as you find edge cases worth covering (empty image, single-pixel groups, a target color matching nothing, thresholds of 0, etc.) - same spirit as the thorough Java unit tests from Part 1.

## Why this split causes no conflicts

- `onjamm-dev` only ever edits files under `src/components/`, `src/pages/`, `src/theme.js`, and `tests/e2e/`.
- `sabinmas-dev` only ever edits files under `src/lib/centroid/` and `tests/unit/`.
- Both import from `src/api/` and `src/mock/`, but neither edits them (they're frozen from Section 1).
- The one shared file either might touch is `package.json`/`package-lock.json` if a new dependency is needed - call it out in your PR description so the other person knows, and resolve any lockfile conflict with a fresh `npm install`.

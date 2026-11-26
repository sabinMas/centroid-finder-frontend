# Robot Improvements (Wave 3: AI Improvements)

This is the AI pass over `centroid-finder-frontend`. It builds on our Wave 2 notes in [humanImprovements.md](humanImprovements.md) and the Google doc, and it follows the prompt we were given:

> Please look through this code and identify improvements I could make. Focus on things like refactoring code, fixing bugs, adding tests, improving performance, improving error handling, hardening security, and writing documentation. Please do not write the exact code fixes. Instead give me overall direction on what I should be focusing on.

The sections follow the same category order as the assignment's Wave 2 questions (required categories first, then the optional ones), so it's easy to pick the top two per category for Wave 4. This pass covers the frontend repo only.

Everything below is direction, not finished code. Each item says what to look at, why it matters, and what "done" would look like, so we can decide how to build it ourselves.

---

## How this pass was done

In Wave 2 we walked the repo file by file and asked a few questions about each one. This pass asks the same questions, plus a few that only come up once you try to break the app:

1. **Is it readable?** Could a new teammate understand the file without asking us?
2. **Is it dead?** Is anything here left over from scaffolding, the parallel-branch plan, or mock data we no longer need?
3. **Is it doing too much?** Would splitting it make each piece easier to test or explain?
4. **Does it need docs?** Do the JSDoc comments explain *why*, not just *what*?
5. **What happens when it fails?** Backend down, slow network, bad input, empty list, a job that never finishes.
6. **Is it tested where it can break?** Do the tests check behavior, or only that something rendered?
7. **Is it fast enough on real footage?** Our tests use 1x1 and 2x2 images. The salamander video is full HD.
8. **Could someone misuse it?** Data from the URL, from `localStorage`, and from the server, all ending up in the page.

Before verifying any of this, we ran the current checks: `npm test` (21 unit tests passing), `oxlint` (clean), `npm run build` (succeeds, about 445 kB of JS before gzip), and `npm audit` (0 production vulnerabilities). `npm outdated` shows only minor updates available (`@mui/material` and `@mui/icons-material` 9.5 to 9.6, `oxlint` 1.94 to 1.95). So nothing below is about a broken build. It's about what the checks don't currently catch.

### Color key (same as Wave 2)

- ⚫ **Black** = fine as is
- 🟣 **Purple** = backlog item
- 🔵 **Blue** = should be updated now
- 🔴 **Red** = delete

---

## Top priorities

If we only get to a few things, these give the most value for the effort:

1. 🔵 **Stop the live preview from doing double work on every slider tick** (Performance, `ThumbnailCanvas.jsx`).
2. 🔵 **Stop double-submitting jobs and make polling sturdier** (Bugs and error handling, `VideoPreview.jsx`).
3. 🔵 **Stop quietly showing fake videos when the backend fails** (Error handling, `VideoChooser.jsx` and `src/mock/`).
4. 🔴 **Delete the leftover Vite scaffold CSS** (Dead code, `src/index.css`).
5. 🔵 **Split `ThumbnailCanvas` and `VideoPreview` into hooks plus presentational pieces** (Refactoring, which also unlocks testing).
6. 🔵 **Add tests for the parts that have none: `recentJobs.js`, `api/client.js`, and real assertions in the e2e slider test** (Tests).
7. 🟣 **Add a CI workflow that runs lint, unit tests, build and e2e on every PR** (this was our Wave 2 CI/CD item).

---

## 1. Refactoring code

### Split the two "big" components by responsibility

Wave 2 already flagged `ThumbnailCanvas.jsx` as "possibly separate into 2 files." After reading it closely, it does three separate jobs:

- loading the thumbnail image and turning it into `ImageData`,
- turning a binary array into a black-and-white image,
- drawing the centroid dot.

**Direction:** move the image loading into a custom hook (something like "use the thumbnail's image data"), and move the "binary array to RGBA pixels" step into `src/lib/` as a plain function. Then the component only wires them together and renders the two `FramePanel`s. The plain function can be unit tested with Mocha the same way the centroid code is, with no browser needed.

`VideoPreview.jsx` has the same shape: page layout mixed with a job-polling state machine. **Direction:** pull the "start a job, poll it, stop on done or error" logic into its own hook. The page then just reads a status and renders. That hook is the piece most worth testing (see section 2).

`VideoChooser.jsx` defines `RecentJobListItem` inside the page file. **Direction:** give it its own file next to `VideoListItem.jsx`, and consider moving the "fetch videos, fall back, track loading" logic into a hook too.

### Retire the "parallel branches" scaffolding now that it's merged

Almost every file starts with a header such as `// OWNED BY onjamm-dev` or `// FROZEN`, and points to `TASKS.md`. That plan did its job: the branches merged with no conflicts. Now those comments make the code look unfinished and tell future readers not to touch files they should feel free to change.

**Direction:** remove the ownership and "frozen" headers, and either archive `TASKS.md` under `docs/` as project history or replace it with a short "how the app fits together" doc (see section 4). The comments that explain *what the file does* (like "port of DistanceImageBinarizer.java") are worth keeping.

### Make the API routes consistent (ties to "conventions from Josh's class")

The frontend calls `/api/videos`, but `/thumbnail/...`, `/process/...` and `/results/...` have no `/api` prefix. Because of that, `vite.config.js` needs a separate proxy rule for each path, and starting a job (`POST /process/:filename`) shares a prefix with checking one (`GET /process/:jobId/status`), even though one takes a filename and the other a job id.

**Direction:** agree with the backend on a single prefix and resource-style names (for example, videos, a video's thumbnail, jobs, and a job's result), then update the four `src/api/*.js` files and collapse the proxy config to one rule. Since `src/api/` is already the only place that knows the URLs, this change stays small on the frontend. It is a cross-repo change, so plan it together with the backend refactor from Wave 2.

### Keep root-level config files tidy without fighting the tools

Wave 2 wanted the root to look less cluttered. `package.json` and `package-lock.json` have to stay at the root. **Direction:** the Mocha settings in `.mocharc.json` can move into `package.json` if you prefer one fewer file. Most other config files (`vite.config.js`, `playwright.config.js`, `.oxlintrc.json`) are expected at the root by their tools, so moving them means passing extra flags everywhere. That's probably not worth it. A good README "project structure" section does more for clutter than moving files.

### Small cleanups

- `data-testid="thumbnail-canvas"` is on the *binarized* canvas. Rename it so the test id says what it is.
- `ThresholdSlider` and `ColorPicker` render their label as a `Typography` that isn't connected to the input. See accessibility below.
- Constants such as the default color, default threshold, and poll interval live at the top of `VideoPreview.jsx`. If they start being shared (for example, by recent jobs or tests), give them a small `config` or `constants` module.

---

## 2. Adding tests

The unit tests for `src/lib/centroid` are solid. The gaps are everywhere else, and in tests that pass without really checking anything.

### Unit tests (Mocha + Chai, no browser needed)

- **`src/lib/recentJobs.js`:** no tests at all, and it's pure logic. Cover the 10-item cap, newest-first ordering, clearing, corrupted JSON, non-array JSON, and `localStorage` throwing. You'll need a small fake `localStorage` on the global object in the test setup.
- **`src/api/client.js`:** stub `fetch` and cover: a 2xx JSON body, a non-2xx with an `error` field, a non-2xx with no body, and a body that isn't JSON.
- **`src/api/*.js`:** check the URLs and query strings they build, especially that filenames with spaces or `#` are encoded.
- **Centroid edge cases** (from the Wave 1 plan, still not all covered): a 0x0 image, a threshold of 0, an image where every pixel matches, a long thin one-pixel-wide group, and a tie between two equally sized groups to lock in the sort order.
- **Parity with Java:** pick one real frame and record the centroid the Java processor gives for a known color and threshold. Add a test that the JS port returns the same result. This is the test that proves the live preview is trustworthy.

### End-to-end tests (Playwright)

- The slider test only checks that the canvas is still visible after a key press, which passes even if nothing is redrawn. **Direction:** read pixels off the canvas, or compare screenshots, and check that changing the threshold actually changes the image.
- Add flows for: a job that goes processing then done (polling stops), a job that ends in `error`, the process request itself failing, the button being disabled during submit, recent jobs appearing after a run and clearing, and the empty-list state.
- Once the polling hook is extracted, you can test timing behavior with Playwright's clock control instead of waiting real seconds.

### Running them

`npm test` only runs unit tests, and e2e needs the dev server. Document this in the README and run both in CI (section 9, Root).

---

## 3. Improving error handling

- **Don't quietly replace real errors with mock data.** When `getVideos()` fails *for any reason*, the chooser shows the three mock filenames. Clicking one then fails on the preview page with a thumbnail error, which is confusing. The warning banner helps, but the user is still shown videos that don't exist. **Direction:** show a clear error with a "Retry" button instead, and keep mock data for tests only. Playwright's route mocking already covers what the mocks were for. This is the "why" behind Wave 2's "delete `mock`" item.
- **Tell apart the kinds of failure.** "Backend not running", "server error", and "video not found" each need a different next step for the user. `fetchJson` already pulls the server's `error` message. Consider also attaching the HTTP status to the thrown error so the UI can choose a message.
- **Requests have no timeout and can't be cancelled.** If the backend hangs, the UI waits forever, and requests started by a page keep running after you leave it. **Direction:** support an abort signal in `fetchJson` and use it from effects' cleanup functions.
- **Thumbnail failure message.** "Make sure the backend is running and ffmpeg is installed" is good for us but not for an end user. Consider showing a friendly message plus a "details" section for the developer hint.
- **Add an error boundary** around each route so one broken component shows a message instead of a blank page.

---

## 4. Writing documentation

### JSDoc (our Wave 2 "add javascript documentation" item)

Most files already have a one-line JSDoc. The gap is the *why*.

- `ThresholdSlider` and `ColorPicker`: explain what the threshold actually means (a color distance, and that the largest possible distance between two colors is about 441, while the slider stops at 255) and what format the hex value is in (no `#`, uppercase).
- `ThumbnailCanvas`: document the data flow (image to `ImageData` to binary array to centroid) and which parts mirror the Java pipeline.
- `VideoPreview`: document the job lifecycle (idle, submitting, processing, then done or error) and when polling stops.
- `VideoChooser`: document the fallback and error behavior once you've decided what it should be.
- 🟣 **Make the JSDoc checkable.** The project already writes JSDoc types. Turning on JavaScript type checking in the editor (a small `jsconfig.json` with type checking enabled) makes VS Code flag places where the code doesn't match its own comments, with no TypeScript migration needed.

### README

- Add `npm run lint` to the scripts list (it exists in `package.json` but isn't documented).
- Explain how to run e2e tests (does the backend need to be running, or are all API calls mocked?).
- Add a short "how it works" section: the pages, the job lifecycle, and how the live preview relates to the Java processor (including the JPEG note in section 7).
- Double-check the backend link, which points at a `server` branch. Make sure that's still where the backend lives.
- Replace the mention of the mock fallback once that behavior changes.

### Project docs

- Archive or rewrite `TASKS.md` (see section 1).
- Add a short contributing note: branch naming, the PR-into-`main` flow, and the course rule that AI-assisted commits are labeled. That's the "extra precaution when working agentically" from Wave 2.

---

## 5. Improving performance (optional)

This is the biggest hidden issue, because our tests use tiny images and the real video is 1920x1080, which is about 2 million pixels.

- **Binarizing twice per change.** On every color or threshold change, `ThumbnailCanvas` calls `binarize()` to draw the image, then calls `findLargestCentroid()`, which binarizes the same frame *again* internally. **Direction:** binarize once and pass the result to the group finder. That means exposing a function in `lib/centroid` that takes an existing binary array, while keeping `findLargestCentroid` for callers that want the one-call version.
- **Work on every slider tick.** MUI's `Slider` calls `onChange` continuously while dragging, so the full pipeline runs many times a second. **Direction:** throttle or debounce the preview, or use the slider's "change committed" event for the expensive part, or preview on a scaled-down copy of the frame while dragging and run full resolution when the user lets go.
- **Inner-loop allocations.** `binarize` creates a new `{r, g, b}` object for every pixel, and `findConnectedGroups` creates a new array of four neighbor pairs for every pixel it visits. That's millions of short-lived objects per frame. **Direction:** read the channel values directly and check neighbors inline. Also, comparing *squared* distance against *squared* threshold gives the same answer without a square root per pixel. Keep the existing tests green as the safety net while you do this.
- **Main-thread blocking.** If it's still slow after the above, the whole pipeline is a good fit for a Web Worker, so the UI keeps responding while the preview computes.
- **Measure first.** Use the browser Performance panel on the real salamander frame before and after each change, and note the numbers in the PR. That also makes a nice thing to show in the presentation.
- 🟣 **Bundle size.** 445 kB of JS (141 kB gzipped) is mostly MUI. Not urgent for a two-page app, but lazy-loading the preview route is an easy experiment later.

---

## 6. Hardening security (optional)

This is a local, single-user app, so the risk is low. These are still good habits, and worth having before the hosting backlog item.

- **Validate the result link before rendering it.** The CSV link comes straight from the server's response and is rendered as an `href` that opens in a new tab. **Direction:** only render it if it's a relative path under the results route you expect. That way a bad or tampered response can't turn the button into a link to somewhere else.
- **Validate data coming back from `localStorage`.** The recent-jobs color is put straight into a style value. Check that it's a 6-digit hex (and that the rest of the record has the right shape) before using it.
- **Validate the `:filename` route param** in the same way the backend's `isSafeFilename` does, and show a "not found" state early instead of sending odd values on to the server. The API helpers already encode it, which is good. Keep that.
- **Plan for production before hosting.** The app only reaches the backend through the Vite *dev* proxy. A `npm run build` output served anywhere else has no way to find the API. **Direction:** decide whether Express will serve the built frontend (same origin, simplest) or whether the frontend needs a configurable API base URL through Vite env variables. Whichever you choose, also add basic security headers (such as a Content Security Policy) on whatever serves the page.
- **Keep dependencies honest.** `npm audit` is clean today. Add it, or GitHub's Dependabot, to CI so it stays that way.
- **Accessibility is part of quality.** It's not strictly security, but worth fixing in the same sweep. Connect the slider and color labels to their inputs, give the two canvases text alternatives, and make sure the process button state is announced to screen readers.

---

## 7. Bug fixes (optional)

### The process button can submit the same job several times

The "Process Video with These Settings" button stays enabled while the request is in flight and while a job is processing. Clicking it twice starts two backend Java processes and writes two entries to recent jobs. **Direction:** disable the button (or change its label) while submitting or processing, and decide what should happen if someone changes the settings while a job is running.

### Polling can overlap, never stop, or give up too early

`setInterval` fires every 2 seconds whether or not the previous status request has come back, so on a slow backend requests can stack up. There's no limit, so a job stuck in `processing` is polled until you leave the page. And one failed request, even a brief network blip, marks the job as `error` for good, even though the job may still be running on the server.

**Direction:** schedule the next poll only after the previous one finishes, add a reasonable timeout or maximum number of attempts, and tell apart "the job failed" (the server said `error`) from "we couldn't reach the server this time" (retry a few times before showing an error).

### Recent jobs don't restore what they recorded

Each recent job saves the color, threshold and job id, but clicking one only navigates to `/preview/:filename` with the *default* settings, and the job's status and CSV link aren't shown. So the feature remembers the settings and then drops them. **Direction:** decide what clicking a recent job should do (restore the settings, show the job's result, or both) and pass that through the route (query string or router state).

### A bad value can crash the page

`hexToRgb` throws on an invalid color, and `findLargestCentroid` deliberately lets that error through (we chose that in Wave 1, and it was the right call). But `ThumbnailCanvas` calls it inside an effect with nothing catching it, and the app has no error boundary, so any throw there blanks the whole app. The color picker always gives a valid hex today, but the moment a color comes from a recent job, a URL, or a text field, this becomes reachable. **Direction:** add an error boundary around the preview, and validate colors where they come into the app rather than deep in the drawing code.

### `localStorage` data is trusted as-is

`loadRecentJobs` parses whatever is stored and returns it. If the stored value is valid JSON but not an array (old format, manual edit, another app on the same origin), `.length` and `.map` on the chooser page will throw. **Direction:** check the shape of what comes back and fall back to an empty list if it doesn't match.

### The preview may not match the real result exactly

The backend makes the thumbnail by encoding the first frame as **JPEG**. JPEG compression shifts pixel colors slightly, while the Java processor reads the original decoded frames. So the live preview's binarized image and centroid can differ a bit from what ends up in the CSV, especially near the threshold edge. **Direction:** this is mostly a backend decision (a lossless format such as PNG for thumbnails), but it's worth knowing on the frontend when tuning and when explaining the preview in the README.

### Minor UI edge cases

- `JobStatusPanel` shows an empty red alert if the server sends `status: 'error'` with no message, and a "Download CSV" button with no link if `done` arrives without a `result`. Give both a fallback.
- The chooser shows nothing at all when the backend returns an empty list. Add an empty state ("No videos found in the videos folder").
- There's no loading state on the chooser while the list is being fetched.

---

## 8. Other

- **Stay inside the "no new features" rule.** A few ideas here go beyond refactoring and are marked as new features: clicking the frame to pick a color, upload-from-PC, a serverless database, and hosting. Keep them for a later phase. Restoring recent-job settings, empty and loading states, and the error boundary are fixes to existing behavior, so they are fair game.
- **Keep the frontend's API contract stable while the backend refactors.** If the backend renames routes (section 1), change `src/api/*.js` in the same PR window so `main` never has a broken pairing.
- **Small branches.** Most items above are a good size for one Wave 5 branch and PR each (for example "Error handling: replace mock fallback on Video Chooser with a retry state").

## 9. File-by-file pass (in the Wave 2 format)

- `src`
  - `api`
    - ⚫ `client.js`: still small and readable. 🔵 Add a timeout or abort support and keep the HTTP status on errors.
    - ⚫ `process.js`, `thumbnail.js`, `videos.js`: readable. 🟣 Rename the routes once the backend agrees on a single prefix.
  - 🔴 `assets`: already gone, nothing left to do.
  - `components`
    - ⚫ `hoc/withLoading.jsx`: clean.
    - 🟣 `ColorPicker.jsx`: Wave 2 noted the native picker popup covers the screen while using the eyedropper. The native popup is drawn by the browser, so we can't restyle it. **Direction:** for this assignment, a hex text field next to the swatch is the smallest fix. Clicking a pixel on the *original* frame to pick its color would fit the app even better, but that's a new feature, so save it for later. Connect the label to the input.
    - ⚫ `JobStatusPanel.jsx`: clean. 🔵 Add fallbacks for a missing error message or missing result link, and validate the link.
    - 🔵 `ThresholdSlider.jsx`: add docs explaining the threshold. Connect the label. Decide on the right max value.
    - 🔵 `ThumbnailCanvas.jsx`: split into hook, pure helper and view. Binarize once. Throttle the preview. Add docs.
    - 🟣 `VideoListItem.jsx`: upload-from-PC is still a backlog feature. It needs backend work (an upload route and file size and type limits) before the frontend can do it.
  - `lib`
    - `centroid`
      - ⚫ `binarize.js`, `colorDistance.js`, `groupFinder.js`, `index.js`: correct and well tested. 🔵 Performance work (no per-pixel allocations, squared distance, a binary-in entry point). Use the existing tests as the safety net.
    - 🔵 `recentJobs.js`: validate stored data and add unit tests. 🟣 The serverless-database idea from Wave 2 only matters once the app is hosted for more than one person. Until then, `localStorage` is the right tool.
  - 🔴 `mock`: delete once the chooser no longer falls back to it. Playwright's route mocking replaces it in tests.
  - `pages`
    - 🔵 `VideoChooser.jsx`: replace the silent mock fallback with a real error and retry. Add loading and empty states. Move `RecentJobListItem` out. Add docs.
    - 🔵 `VideoPreview.jsx`: disable the button while busy, extract the polling hook, make polling sturdier, restore recent-job settings. Add docs.
  - 🔴 `index.css`: almost all of it is leftover from the Vite starter template (`#social`, `.counter`, 56px `h1`, a fixed 1126px centered `#root` with borders, and a `color-scheme: light dark` setting that clashes with our light-only MUI theme). MUI's `CssBaseline` and `theme.js` already handle global styles. Delete it, or cut it down to the few rules we actually want.
  - ⚫ `theme.js`, `main.jsx`, `App.jsx`: fine. 🔵 Remove the "FROZEN" header from `App.jsx`. 🟣 Add a catch-all "not found" route and an error boundary here.
- `tests`
  - ⚫ `unit/*`: good coverage of the centroid code. 🔵 Add the edge cases and the Java parity test.
  - 🔵 `e2e/*`: make the slider test check pixels. Add the error, polling and recent-jobs flows.
- Root
  - 🔵 `README.md`: see section 4.
  - 🔴/🟣 `TASKS.md`: archive or replace.
  - 🟣 `.mocharc.json`: optional move into `package.json`.
  - 🟣 **CI:** add a GitHub Actions workflow that runs `npm ci`, lint, unit tests, build and Playwright on every PR to `main`. Make it a required check before merging.

---

## Notes for the backend repo (for later, not part of this pass)

We only changed the frontend this round, but a few frontend findings depend on the backend:

- Route naming and a shared `/api` prefix (section 1).
- Thumbnail format, JPEG versus lossless (section 7).
- Serving the built frontend, or allowing a configured origin, for hosting (section 6).
- An upload route with size and type limits before upload-from-PC can happen (`VideoListItem` backlog).
- Wave 2's doc spells `Experiement.java`, but the file in the repo is `Experiment.java`. Just make sure the doc matches when you do the folder reorganization.

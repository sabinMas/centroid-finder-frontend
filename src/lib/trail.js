// Pure helpers for the Trail Replay feature: turn the processor's result CSV into a
// salamander path and summarize how it moved. No React or DOM here, so it's unit-testable.

/**
 * @typedef {{ time: number, x: number, y: number, visible: boolean, glitch?: boolean }} TrailPoint
 *   visible: the processor found a matching group in this sample (it wrote something other than -1,-1)
 *   glitch: set by markGlitches when this sample looks like the tracker jumped to noise
 */

/**
 * True when a sample is a trustworthy position of the salamander.
 *
 * @param {TrailPoint} point
 * @returns {boolean}
 */
export function isTracked(point) {
  return point.visible && !point.glitch;
}

/**
 * Parses the processor's CSV (one "time,x,y" row per sampled frame, "-1,-1" when nothing
 * matched) into trail points. Blank or malformed lines are skipped.
 *
 * @param {string} csvText
 * @returns {TrailPoint[]}
 */
export function parseTrailCsv(csvText) {
  const points = [];
  for (const line of csvText.split(/\r?\n/)) {
    const fields = line.trim().split(',');
    if (fields.length !== 3) continue;
    const [time, x, y] = fields.map(Number);
    if ([time, x, y].some(Number.isNaN)) continue;
    points.push({ time, x, y, visible: x >= 0 && y >= 0 });
  }
  return points;
}

/**
 * Flags tracking glitches: moments where the largest matching group briefly switched from the
 * salamander to some noise elsewhere in the frame. A glitch looks like an impossibly fast jump
 * away, later followed by an impossibly fast jump back to (near) where it started. The samples
 * in between are marked `glitch: true`. A fast jump that never comes back is left alone, since
 * it could be real movement after the salamander was hidden.
 *
 * @param {TrailPoint[]} points
 * @param {{ glitchSpeed?: number, returnRadius?: number }} [options]
 *   glitchSpeed: px/s above which a jump between samples is treated as impossible
 *   returnRadius: how close (px) the jump back must land to where the jump away started
 * @returns {TrailPoint[]} new points with a `glitch` flag on each
 */
export function markGlitches(points, { glitchSpeed = 200, returnRadius = 100 } = {}) {
  const marked = points.map((point) => ({ ...point, glitch: false }));
  const visibleIndexes = [];
  marked.forEach((point, index) => {
    if (point.visible) visibleIndexes.push(index);
  });

  function isImpossibleJump(fromIndex, toIndex) {
    const from = marked[fromIndex];
    const to = marked[toIndex];
    const elapsed = to.time - from.time;
    return elapsed > 0 && Math.hypot(to.x - from.x, to.y - from.y) / elapsed > glitchSpeed;
  }

  let position = 0;
  while (position < visibleIndexes.length - 1) {
    const jumpOrigin = marked[visibleIndexes[position]];
    if (!isImpossibleJump(visibleIndexes[position], visibleIndexes[position + 1])) {
      position++;
      continue;
    }

    let lastGlitchPosition = -1;
    for (let search = position + 1; search < visibleIndexes.length - 1; search++) {
      if (!isImpossibleJump(visibleIndexes[search], visibleIndexes[search + 1])) continue;
      const landing = marked[visibleIndexes[search + 1]];
      if (Math.hypot(landing.x - jumpOrigin.x, landing.y - jumpOrigin.y) <= returnRadius) {
        lastGlitchPosition = search;
      }
      break;
    }

    if (lastGlitchPosition === -1) {
      position++;
      continue;
    }
    for (let glitchPosition = position + 1; glitchPosition <= lastGlitchPosition; glitchPosition++) {
      marked[visibleIndexes[glitchPosition]].glitch = true;
    }
    position = lastGlitchPosition + 1;
  }

  return marked;
}

/**
 * Summarizes a trail. Distances are in pixels of the video frame. Movement is only measured
 * between consecutive tracked samples (visible and not a glitch), so a gap or a glitch never
 * counts as a jump across the frame.
 *
 * @param {TrailPoint[]} points
 * @param {{ restingSpeed?: number }} [options] - speeds below this (px/s) count as resting
 * @returns {{ duration: number, sampleInterval: number, visiblePercent: number, distance: number,
 *   topSpeed: number, restingPercent: number, longestGap: number, glitchEpisodes: number,
 *   glitchSeconds: number }}
 */
export function computeTrailStats(points, { restingSpeed = 5 } = {}) {
  if (points.length === 0) {
    return {
      duration: 0, sampleInterval: 0, visiblePercent: 0, distance: 0, topSpeed: 0,
      restingPercent: 0, longestGap: 0, glitchEpisodes: 0, glitchSeconds: 0,
    };
  }

  const sampleInterval = points.length > 1 ? points[1].time - points[0].time : 0;
  let trackedCount = isTracked(points[0]) ? 1 : 0;
  let glitchSamples = points[0].glitch ? 1 : 0;
  let glitchEpisodes = points[0].glitch ? 1 : 0;
  let distance = 0;
  let topSpeed = 0;
  let measuredSegments = 0;
  let restingSegments = 0;
  let missingRun = points[0].visible ? 0 : 1;
  let longestMissingRun = missingRun;

  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];

    if (isTracked(current)) trackedCount++;
    if (current.glitch) {
      glitchSamples++;
      if (!previous.glitch) glitchEpisodes++;
    }
    if (current.visible) {
      missingRun = 0;
    } else {
      missingRun++;
      longestMissingRun = Math.max(longestMissingRun, missingRun);
    }

    const elapsed = current.time - previous.time;
    if (!isTracked(previous) || !isTracked(current) || elapsed <= 0) continue;
    const step = Math.hypot(current.x - previous.x, current.y - previous.y);
    const speed = step / elapsed;
    distance += step;
    topSpeed = Math.max(topSpeed, speed);
    measuredSegments++;
    if (speed < restingSpeed) restingSegments++;
  }

  return {
    duration: points[points.length - 1].time - points[0].time,
    sampleInterval,
    visiblePercent: (trackedCount / points.length) * 100,
    distance,
    topSpeed,
    restingPercent: measuredSegments > 0 ? (restingSegments / measuredSegments) * 100 : 0,
    longestGap: longestMissingRun * sampleInterval,
    glitchEpisodes,
    glitchSeconds: glitchSamples * sampleInterval,
  };
}

/**
 * Counts how many visible samples fall in each cell of a grid laid over the frame, for
 * drawing a "where did it spend its time" heatmap.
 *
 * @param {TrailPoint[]} points
 * @param {number} width - frame width in pixels
 * @param {number} height - frame height in pixels
 * @param {number} cellSize - grid cell size in pixels
 * @returns {{ cols: number, rows: number, cellSize: number, counts: number[], max: number }}
 */
export function buildHeatmap(points, width, height, cellSize) {
  const cols = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));
  const counts = new Array(cols * rows).fill(0);
  let max = 0;

  for (const point of points) {
    if (!isTracked(point) || point.x >= width || point.y >= height) continue;
    const cellIndex = Math.floor(point.y / cellSize) * cols + Math.floor(point.x / cellSize);
    counts[cellIndex]++;
    max = Math.max(max, counts[cellIndex]);
  }

  return { cols, rows, cellSize, counts, max };
}

/**
 * Formats seconds as m:ss (or h:mm:ss for long videos).
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const wholeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);
  const seconds = String(wholeSeconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

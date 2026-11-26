// Local-storage backed history for the "recent jobs" feature. Self-contained, with no
// backend involvement, so the list survives page reloads without a server round trip.

const STORAGE_KEY = 'centroidFinder.recentJobs';
const MAX_RECENT_JOBS = 10;

/**
 * @typedef {{ filename: string, jobId: string, targetColorHex: string, threshold: number, startedAt: string }} RecentJob
 */

const HEX_COLOR_PATTERN = /^[0-9a-fA-F]{6}$/;

/**
 * Checks one stored entry. localStorage can hold anything (an older app version, another
 * script, a hand edit), and these fields end up in a style and a link, so every one is checked.
 *
 * @param {unknown} entry
 * @returns {boolean} true when the entry has the RecentJob shape
 */
function isRecentJob(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    typeof entry.filename === 'string' &&
    typeof entry.jobId === 'string' &&
    typeof entry.targetColorHex === 'string' &&
    HEX_COLOR_PATTERN.test(entry.targetColorHex) &&
    typeof entry.threshold === 'number' &&
    Number.isFinite(entry.threshold) &&
    typeof entry.startedAt === 'string'
  );
}

/**
 * Reads the recent-jobs history from localStorage, most recent first. Anything that is not an
 * array becomes an empty history, and entries with a bad shape (for example a color that is
 * not six hex digits) are dropped.
 *
 * @returns {RecentJob[]}
 */
export function loadRecentJobs() {
  try {
    const storedJobs = window.localStorage.getItem(STORAGE_KEY);
    if (!storedJobs) return [];
    const parsed = JSON.parse(storedJobs);
    return Array.isArray(parsed) ? parsed.filter(isRecentJob) : [];
  } catch {
    return [];
  }
}

/**
 * Records a newly started job at the front of the history, capped at MAX_RECENT_JOBS.
 *
 * @param {RecentJob} recentJob
 */
export function addRecentJob(recentJob) {
  const existingJobs = loadRecentJobs();
  const updatedJobs = [recentJob, ...existingJobs].slice(0, MAX_RECENT_JOBS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) - history just won't persist
  }
}

/** Clears the recent-jobs history. */
export function clearRecentJobs() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

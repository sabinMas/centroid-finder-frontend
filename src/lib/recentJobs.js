// Local-storage backed history for the "recent jobs" feature. Self-contained, with no
// backend involvement, so the list survives page reloads without a server round trip.

const STORAGE_KEY = 'centroidFinder.recentJobs';
const MAX_RECENT_JOBS = 10;

/**
 * @typedef {{ filename: string, jobId: string, targetColorHex: string, threshold: number, startedAt: string }} RecentJob
 */

/**
 * Reads the recent-jobs history from localStorage, most recent first.
 *
 * @returns {RecentJob[]}
 */
export function loadRecentJobs() {
  try {
    const storedJobs = window.localStorage.getItem(STORAGE_KEY);
    return storedJobs ? JSON.parse(storedJobs) : [];
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

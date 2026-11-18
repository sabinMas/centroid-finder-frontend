import { fetchJson } from './client.js';

/**
 * Submits a video for backend processing with the given target color and threshold.
 *
 * @param {string} filename - the video's filename
 * @param {string} targetColorHex - a 6-digit hex color without "#", e.g. "FF0000"
 * @param {number} threshold - the binarization threshold
 * @returns {Promise<{jobId: string}>} the created job's id
 */
export function startProcessingJob(filename, targetColorHex, threshold) {
  const params = new URLSearchParams({ targetColor: targetColorHex, threshold: String(threshold) });
  return fetchJson(`/process/${encodeURIComponent(filename)}?${params}`, { method: 'POST' });
}

/**
 * Fetches the current status of a processing job.
 *
 * @param {string} jobId - the job id returned by startProcessingJob
 * @returns {Promise<{status: 'processing'} | {status: 'done', result: string} | {status: 'error', error: string}>}
 */
export function getJobStatus(jobId) {
  return fetchJson(`/process/${encodeURIComponent(jobId)}/status`);
}

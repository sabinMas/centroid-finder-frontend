// Endpoint wrapper for the signed-in user's saved jobs (GET /api/jobs).
import { fetchJson } from './client.js';

/**
 * Fetches the signed-in user's saved jobs, newest first (the server returns at most 100).
 * Rejects with the server's message when the user is a guest (401 "Sign in to see saved jobs").
 *
 * @returns {Promise<Array<{
 *   jobId: string, filename: string, targetColor: string, threshold: number,
 *   status: 'processing' | 'done' | 'error', result: string | null, error: string | null,
 *   createdAt: string, updatedAt: string
 * }>>}
 */
export async function getJobs() {
  const body = await fetchJson('/api/jobs');
  if (!Array.isArray(body)) {
    throw new Error('The server returned an unexpected response for the jobs list');
  }
  return body;
}

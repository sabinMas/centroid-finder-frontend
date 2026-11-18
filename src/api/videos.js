import { fetchJson } from './client.js';

/**
 * Fetches the list of available video filenames from the backend.
 *
 * @returns {Promise<string[]>} an array of video filenames, e.g. ["salamander1.mp4"]
 */
export function getVideos() {
  return fetchJson('/api/videos');
}

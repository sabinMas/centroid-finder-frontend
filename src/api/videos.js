import { fetchJson } from './client.js';

/**
 * Fetches the list of available video filenames from the backend.
 *
 * @returns {Promise<string[]>} an array of video filenames, e.g. ["salamander1.mp4"]
 */
export function getVideos() {
  return fetchJson('/api/videos');
}

/**
 * Uploads a video the user picked (or recorded) so the backend can process it.
 * The body is multipart form data with the file in the field "video". No Content-Type
 * header is set on purpose: the browser adds it together with the multipart boundary.
 *
 * @param {File} file - the video file
 * @returns {Promise<{filename: string}>} the name the server stored it under (it may add a suffix
 *   if the name was taken), which is the name to use for /thumbnail and /process
 */
export async function uploadVideo(file) {
  const form = new FormData();
  form.append('video', file);
  const body = await fetchJson('/api/videos', { method: 'POST', body: form });
  if (typeof body?.filename !== 'string' || body.filename === '') {
    throw new Error('The server did not say what name it stored the video under');
  }
  return body;
}

/**
 * Fetches the metadata the server reads from a video (duration, size, location tag, ...).
 * Fields the file does not have come back as null.
 *
 * @param {string} filename - the video's filename
 * @returns {Promise<{
 *   filename: string, durationSeconds: number | null, width: number | null, height: number | null,
 *   frameRate: number | null, videoCodec: string | null, bitRate: number | null, sizeBytes: number,
 *   createdAt: string | null,
 *   location: { latitude: number, longitude: number, altitude: number | null } | null,
 *   tags: Record<string, string>
 * }>}
 */
export async function getVideoMetadata(filename) {
  const body = await fetchJson(`/api/videos/${encodeURIComponent(filename)}/metadata`);
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('The server returned an unexpected response for the video metadata');
  }
  return body;
}

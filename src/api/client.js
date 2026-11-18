// Shared fetch helper. Every call goes through a relative path (e.g. "/api/videos")
// so the Vite dev server proxy (see vite.config.js) can forward it to the Express
// backend without needing CORS configured on the server.

/**
 * Performs a fetch and parses the response as JSON, throwing on a non-2xx status.
 *
 * @param {string} path - a relative path such as "/api/videos"
 * @param {RequestInit} [options] - standard fetch options
 * @returns {Promise<any>} the parsed JSON body
 */
export async function fetchJson(path, options) {
  const res = await fetch(path, options);
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. a 204) - leave body as null
  }
  if (!res.ok) {
    const message = body?.error || `Request to ${path} failed with status ${res.status}`;
    throw new Error(message);
  }
  return body;
}

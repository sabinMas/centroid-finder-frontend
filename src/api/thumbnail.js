/**
 * Builds the URL for a video's first-frame thumbnail. This is a plain URL
 * (not a fetch) so it can be used directly as an <img src> or loaded into a canvas.
 *
 * @param {string} filename - the video's filename, e.g. "salamander1.mp4"
 * @returns {string} the relative thumbnail URL
 */
export function getThumbnailUrl(filename) {
  return `/thumbnail/${encodeURIComponent(filename)}`;
}

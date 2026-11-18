// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { findLargestCentroid } from '../lib/centroid/index.js';

/**
 * Draws a thumbnail image onto a canvas, binarizes it live with the given color/
 * threshold via lib/centroid, and draws a dot at the largest centroid (if any).
 * findLargestCentroid is a frozen contract owned by sabinMas-dev - call it, don't edit it.
 *
 * @param {{ thumbnailUrl: string, targetColorHex: string, threshold: number }} props
 */
export function ThumbnailCanvas({ thumbnailUrl, targetColorHex, threshold }) {
  // TODO(onjamm-dev): load thumbnailUrl into an <img>/canvas, get ImageData, call
  // findLargestCentroid(imageData, targetColorHex, threshold), draw a dot on a second
  // canvas showing the binarized result side-by-side with the original.
  return <canvas data-testid="thumbnail-canvas" />;
}

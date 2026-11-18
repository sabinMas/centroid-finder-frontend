// OWNED BY sabinMas-dev. See TASKS.md "sabinMas's tasks" before editing.
// Public entry point that onjamm-dev's UI components import. Combines binarize() and
// findConnectedGroups() into the single call a live preview needs.

import { binarize } from './binarize.js';
import { findConnectedGroups } from './groupFinder.js';

/**
 * Finds the centroid of the largest connected group of pixels matching targetColor
 * within threshold, matching the combined behavior of
 * BinarizingImageGroupFinder + DfsBinaryGroupFinder from the Java project.
 *
 * @param {ImageData} imageData - canvas ImageData of the frame to analyze
 * @param {string} targetColorHex - a 6-digit hex color string
 * @param {number} threshold - the distance threshold
 * @returns {{x: number, y: number} | null} the largest group's centroid, or null if no
 *   group was found
 */
export function findLargestCentroid(imageData, targetColorHex, threshold) {
  // Until binarize()/findConnectedGroups() are implemented, return null (no dot drawn)
  // rather than throwing, so the UI can be built and tested against this contract first.
  try {
    const binary = binarize(imageData, targetColorHex, threshold);
    const groups = findConnectedGroups(binary, imageData.width, imageData.height);
    if (groups.length === 0) return null;
    return { x: groups[0].centroidX, y: groups[0].centroidY };
  } catch {
    return null;
  }
}

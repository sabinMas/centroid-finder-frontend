// Public entry point that the UI components import. Combines binarize() and
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
 * @throws if targetColorHex is not a valid 6-digit hex color
 */
export function findLargestCentroid(imageData, targetColorHex, threshold) {
  const binary = binarize(imageData, targetColorHex, threshold);
  const groups = findConnectedGroups(binary, imageData.width, imageData.height);
  if (groups.length === 0) return null;
  return { x: groups[0].centroidX, y: groups[0].centroidY };
}

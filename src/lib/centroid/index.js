// Public entry point that the UI components import. Combines binarize() and
// findConnectedGroups() into the single call a live preview needs.

import { binarize } from './binarize.js';
import { findConnectedGroups } from './groupFinder.js';

/**
 * Binarizes the frame once and finds the centroid of its largest group, returning both.
 * Use this when the caller needs the binary image and the centroid for the same frame
 * (the live preview draws the one and marks the other), so the frame is not binarized twice.
 *
 * @param {ImageData} imageData - canvas ImageData of the frame to analyze
 * @param {string} targetColorHex - a 6-digit hex color string
 * @param {number} threshold - the distance threshold
 * @returns {{ binary: Uint8Array, centroid: {x: number, y: number} | null }} `binary` has one
 *   0/1 entry per pixel in row-major order (the same array binarize() returns); `centroid` is
 *   the largest group's centroid, or null if no group was found
 * @throws if targetColorHex is not a valid 6-digit hex color
 */
export function analyzeFrame(imageData, targetColorHex, threshold) {
  const binary = binarize(imageData, targetColorHex, threshold);
  const groups = findConnectedGroups(binary, imageData.width, imageData.height);
  const centroid = groups.length === 0 ? null : { x: groups[0].centroidX, y: groups[0].centroidY };
  return { binary, centroid };
}

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
  return analyzeFrame(imageData, targetColorHex, threshold).centroid;
}

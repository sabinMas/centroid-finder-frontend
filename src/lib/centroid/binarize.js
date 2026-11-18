// OWNED BY sabinMas-dev. See TASKS.md "sabinMas's tasks" before editing.
// Port of DistanceImageBinarizer.java's toBinaryArray, adapted to a flat ImageData buffer.

import { colorDistance, hexToRgb } from './colorDistance.js';

/**
 * Converts a canvas ImageData into a flat binary Uint8Array (one entry per pixel,
 * in row-major order), matching DistanceImageBinarizer.toBinaryArray: a pixel is 1
 * (white/matching) if its Euclidean color distance to targetColor is less than
 * threshold, otherwise 0.
 *
 * @param {ImageData} imageData - canvas ImageData (RGBA, 4 bytes per pixel)
 * @param {string} targetColorHex - a 6-digit hex color string
 * @param {number} threshold - the distance threshold
 * @returns {Uint8Array} length width*height, one 0/1 entry per pixel
 */
export function binarize(imageData, targetColorHex, threshold) {
  // TODO(sabinMas-dev): walk imageData.data (RGBA quadruples), compare each pixel's
  // color distance to targetColor (via colorDistance/hexToRgb) against threshold.
  throw new Error('binarize not implemented yet');
}

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
  const { data, width, height } = imageData;
  const targetColor = hexToRgb(targetColorHex);
  const pixelCount = width * height;
  const binary = new Uint8Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const pixelColor = { r: data[offset], g: data[offset + 1], b: data[offset + 2] };
    binary[i] = colorDistance(pixelColor, targetColor) < threshold ? 1 : 0;
  }

  return binary;
}

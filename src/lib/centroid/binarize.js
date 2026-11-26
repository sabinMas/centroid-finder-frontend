// Port of DistanceImageBinarizer.java's toBinaryArray, adapted to a flat ImageData buffer.

import { hexToRgb } from './colorDistance.js';

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
  const { r: targetR, g: targetG, b: targetB } = hexToRgb(targetColorHex);
  const pixelCount = width * height;
  const binary = new Uint8Array(pixelCount);

  // Same formula as colorDistance() in colorDistance.js, written out in the loop so no
  // color object is created per pixel (a full-HD frame has about 2 million pixels).
  for (let i = 0, offset = 0; i < pixelCount; i++, offset += 4) {
    const deltaR = data[offset] - targetR;
    const deltaG = data[offset + 1] - targetG;
    const deltaB = data[offset + 2] - targetB;
    binary[i] = Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB) < threshold ? 1 : 0;
  }

  return binary;
}

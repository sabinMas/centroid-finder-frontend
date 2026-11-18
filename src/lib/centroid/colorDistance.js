// OWNED BY sabinMas-dev. See TASKS.md "sabinMas's tasks" before editing.
// Port of EuclideanColorDistance.java + the hex-parsing helper from the Java project.

/**
 * Parses a 6-digit hex color string (e.g. "FF0000", with or without a leading "#")
 * into its red, green, and blue components.
 *
 * @param {string} hex - a 6-digit hex color string
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
  // TODO(sabinMas-dev): parse hex into {r, g, b}, each 0-255.
  throw new Error('hexToRgb not implemented yet');
}

/**
 * Computes the Euclidean distance between two RGB colors, matching
 * EuclideanColorDistance.java: sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2).
 *
 * @param {{r: number, g: number, b: number}} colorA
 * @param {{r: number, g: number, b: number}} colorB
 * @returns {number} the distance between the two colors
 */
export function colorDistance(colorA, colorB) {
  // TODO(sabinMas-dev): implement the Euclidean distance formula.
  throw new Error('colorDistance not implemented yet');
}

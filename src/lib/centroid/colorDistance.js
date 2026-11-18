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
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
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
  const deltaR = colorA.r - colorB.r;
  const deltaG = colorA.g - colorB.g;
  const deltaB = colorA.b - colorB.b;
  return Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);
}

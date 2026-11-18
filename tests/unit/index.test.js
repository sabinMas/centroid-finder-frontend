import { expect } from 'chai';
import { findLargestCentroid } from '../../src/lib/centroid/index.js';

// Builds a minimal ImageData-like object without needing a browser/jsdom Canvas.
function fakeImageData(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const data = new Uint8ClampedArray(width * height * 4);
  rows.forEach((row, rowIndex) => {
    row.forEach(([r, g, b], colIndex) => {
      const i = rowIndex * width + colIndex;
      data[i * 4] = r;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = b;
      data[i * 4 + 3] = 255;
    });
  });
  return { data, width, height };
}

describe('findLargestCentroid', () => {
  it('returns null when no pixel matches the target color', () => {
    const imageData = fakeImageData([[[0, 0, 0], [0, 0, 0]]]);
    expect(findLargestCentroid(imageData, 'FF0000', 10)).to.equal(null);
  });

  it('returns the centroid of the largest matching group', () => {
    const imageData = fakeImageData([
      [[255, 0, 0], [255, 0, 0]],
      [[0, 0, 0], [0, 0, 0]],
    ]);
    expect(findLargestCentroid(imageData, 'FF0000', 10)).to.deep.equal({ x: 0, y: 0 });
  });

  it('throws on an invalid target color instead of silently returning null', () => {
    const imageData = fakeImageData([[[255, 0, 0]]]);
    expect(() => findLargestCentroid(imageData, 'not-a-color', 10)).to.throw();
  });
});

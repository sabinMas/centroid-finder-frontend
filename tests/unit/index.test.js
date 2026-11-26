import { expect } from 'chai';
import { binarize } from '../../src/lib/centroid/binarize.js';
import { analyzeFrame, findLargestCentroid } from '../../src/lib/centroid/index.js';

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

// F-P1: analyzeFrame binarizes once and returns the binary image together with the centroid.
describe('analyzeFrame', () => {
  it('returns the binary image and the largest group centroid', () => {
    const imageData = fakeImageData([
      [[255, 0, 0], [255, 0, 0]],
      [[0, 0, 0], [0, 0, 0]],
      [[255, 0, 0], [0, 0, 0]],
    ]);
    const { binary, centroid } = analyzeFrame(imageData, 'FF0000', 10);
    expect(Array.from(binary)).to.deep.equal([1, 1, 0, 0, 1, 0]);
    expect(centroid).to.deep.equal({ x: 0, y: 0 });
  });

  it('returns a null centroid and an all-zero binary image when nothing matches', () => {
    const { binary, centroid } = analyzeFrame(fakeImageData([[[0, 0, 0], [0, 0, 0]]]), 'FF0000', 10);
    expect(Array.from(binary)).to.deep.equal([0, 0]);
    expect(centroid).to.equal(null);
  });

  it('gives the same binary image and centroid as binarize() and findLargestCentroid()', () => {
    const imageData = fakeImageData([
      [[250, 10, 0], [255, 0, 0], [0, 0, 255]],
      [[0, 0, 255], [0, 0, 255], [255, 0, 0]],
    ]);
    const { binary, centroid } = analyzeFrame(imageData, 'FF0000', 30);
    expect(Array.from(binary)).to.deep.equal(Array.from(binarize(imageData, 'FF0000', 30)));
    expect(centroid).to.deep.equal(findLargestCentroid(imageData, 'FF0000', 30));
  });

  it('throws on an invalid target color', () => {
    expect(() => analyzeFrame(fakeImageData([[[0, 0, 0]]]), 'nope', 10)).to.throw(/Invalid hex color/);
  });
});

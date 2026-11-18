import { expect } from 'chai';
import { binarize } from '../../src/lib/centroid/binarize.js';

// Builds a minimal 2x1 ImageData-like object without needing a browser/jsdom Canvas.
function fakeImageData(pixels) {
  const data = new Uint8ClampedArray(pixels.length * 4);
  pixels.forEach(([r, g, b], i) => {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  });
  return { data, width: pixels.length, height: 1 };
}

describe('binarize', () => {
  it('marks a pixel white (1) when within threshold of the target color', () => {
    const imageData = fakeImageData([[255, 0, 0]]);
    const result = binarize(imageData, 'FF0000', 10);
    expect(Array.from(result)).to.deep.equal([1]);
  });

  it('marks a pixel black (0) when outside threshold of the target color', () => {
    const imageData = fakeImageData([[0, 255, 0]]);
    const result = binarize(imageData, 'FF0000', 10);
    expect(Array.from(result)).to.deep.equal([0]);
  });

  it('returns one entry per pixel in row-major order', () => {
    const imageData = fakeImageData([[255, 0, 0], [0, 0, 0]]);
    const result = binarize(imageData, 'FF0000', 10);
    expect(result.length).to.equal(2);
  });

  it('returns an empty array for an empty image', () => {
    const imageData = fakeImageData([]);
    const result = binarize(imageData, 'FF0000', 10);
    expect(result.length).to.equal(0);
  });

  it('marks nothing white when threshold is 0, even for an exact color match', () => {
    const imageData = fakeImageData([[255, 0, 0]]);
    const result = binarize(imageData, 'FF0000', 0);
    expect(Array.from(result)).to.deep.equal([0]);
  });

  it('treats a distance exactly equal to the threshold as black (not white)', () => {
    // distance from (255,0,0) to (245,0,0) is exactly 10
    const imageData = fakeImageData([[245, 0, 0]]);
    const result = binarize(imageData, 'FF0000', 10);
    expect(Array.from(result)).to.deep.equal([0]);
  });
});

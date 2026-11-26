// F-P1 safety net: the allocation-free binarize() and findConnectedGroups() must give exactly the
// same answers as the straightforward versions they replaced (an object per pixel, an array of
// neighbor pairs per pixel). Random inputs include 1-pixel-wide and 1-pixel-tall images, where
// the edge checks matter most.

import { expect } from 'chai';
import { binarize } from '../../src/lib/centroid/binarize.js';
import { colorDistance, hexToRgb } from '../../src/lib/centroid/colorDistance.js';
import { findConnectedGroups } from '../../src/lib/centroid/groupFinder.js';

/** The previous binarize(): a color object per pixel. */
function referenceBinarize(imageData, targetColorHex, threshold) {
  const { data, width, height } = imageData;
  const targetColor = hexToRgb(targetColorHex);
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const pixelColor = { r: data[i * 4], g: data[i * 4 + 1], b: data[i * 4 + 2] };
    binary[i] = colorDistance(pixelColor, targetColor) < threshold ? 1 : 0;
  }
  return binary;
}

/** The previous findConnectedGroups(): a neighbor array per pixel. */
function referenceFindConnectedGroups(binary, width, height) {
  const visited = new Uint8Array(width * height);
  const groups = [];
  for (let startIndex = 0; startIndex < binary.length; startIndex++) {
    if (binary[startIndex] !== 1 || visited[startIndex]) continue;
    visited[startIndex] = 1;
    const stack = [startIndex];
    let size = 0;
    let sumX = 0;
    let sumY = 0;
    while (stack.length > 0) {
      const index = stack.pop();
      const x = index % width;
      const y = Math.trunc(index / width);
      size++;
      sumX += x;
      sumY += y;
      for (const [nx, ny] of [[x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const neighborIndex = ny * width + nx;
        if (binary[neighborIndex] === 1 && !visited[neighborIndex]) {
          visited[neighborIndex] = 1;
          stack.push(neighborIndex);
        }
      }
    }
    groups.push({ size, centroidX: Math.trunc(sumX / size), centroidY: Math.trunc(sumY / size) });
  }
  groups.sort((a, b) => {
    if (b.size !== a.size) return b.size - a.size;
    if (b.centroidX !== a.centroidX) return b.centroidX - a.centroidX;
    return b.centroidY - a.centroidY;
  });
  return groups;
}

/** A small deterministic random generator, so a failure can be reproduced. */
function makeRandom(seed) {
  let state = seed;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

describe('allocation-free centroid code matches the straightforward version', () => {
  it('binarize() gives the same binary image on random images and thresholds', () => {
    const random = makeRandom(1);
    for (let trial = 0; trial < 50; trial++) {
      const width = 1 + Math.floor(random() * 12);
      const height = 1 + Math.floor(random() * 12);
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < data.length; i++) data[i] = Math.floor(random() * 256);
      const threshold = Math.floor(random() * 300);
      const imageData = { data, width, height };
      expect(Array.from(binarize(imageData, '4F080B', threshold)), `trial ${trial}`).to.deep.equal(
        Array.from(referenceBinarize(imageData, '4F080B', threshold)),
      );
    }
  });

  it('binarize() treats a distance exactly equal to the threshold as not matching', () => {
    // (3, 4, 0) away from the target is a distance of exactly 5.
    const imageData = { data: new Uint8ClampedArray([3, 4, 0, 255]), width: 1, height: 1 };
    expect(Array.from(binarize(imageData, '000000', 5))).to.deep.equal([0]);
    expect(Array.from(binarize(imageData, '000000', 5.0001))).to.deep.equal([1]);
  });

  it('findConnectedGroups() gives the same groups on random binary images, including 1-wide and 1-tall ones', () => {
    const random = makeRandom(2);
    const shapes = [[1, 9], [9, 1], [1, 1], [2, 2], [3, 7], [10, 10], [17, 5]];
    for (let trial = 0; trial < 200; trial++) {
      const [width, height] = shapes[trial % shapes.length];
      const density = random();
      const binary = new Uint8Array(width * height);
      for (let i = 0; i < binary.length; i++) binary[i] = random() < density ? 1 : 0;
      expect(findConnectedGroups(binary, width, height), `trial ${trial} (${width}x${height})`).to.deep.equal(
        referenceFindConnectedGroups(binary, width, height),
      );
    }
  });

  it('findConnectedGroups() copes with an image that is entirely one group', () => {
    const width = 40;
    const height = 30;
    const groups = findConnectedGroups(new Uint8Array(width * height).fill(1), width, height);
    expect(groups).to.deep.equal([{ size: 1200, centroidX: 19, centroidY: 14 }]);
  });
});

import { expect } from 'chai';
import { findConnectedGroups } from '../../src/lib/centroid/groupFinder.js';

describe('findConnectedGroups', () => {
  it('returns an empty array for an all-zero image', () => {
    const binary = new Uint8Array([0, 0, 0, 0]);
    expect(findConnectedGroups(binary, 2, 2)).to.deep.equal([]);
  });

  it('finds a single group and its centroid (integer division)', () => {
    // 2x2 image, all four pixels on: centroid is (0+1+0+1)/4=0, (0+0+1+1)/4=0 (integer division)
    const binary = new Uint8Array([1, 1, 1, 1]);
    const groups = findConnectedGroups(binary, 2, 2);
    expect(groups).to.deep.equal([{ size: 4, centroidX: 0, centroidY: 0 }]);
  });

  it('treats diagonal pixels as separate groups', () => {
    // 1 0
    // 0 1
    const binary = new Uint8Array([1, 0, 0, 1]);
    const groups = findConnectedGroups(binary, 2, 2);
    expect(groups).to.have.lengthOf(2);
    expect(groups.every((g) => g.size === 1)).to.equal(true);
  });

  it('sorts groups descending by size', () => {
    // Row 0: 1 1 1   (one group of size 3)
    // Row 1: 0 0 1   (connects to the group above via column 2)
    // Row 2: 1 0 0   (isolated group of size 1)
    const binary = new Uint8Array([1, 1, 1, 0, 0, 1, 1, 0, 0]);
    const groups = findConnectedGroups(binary, 3, 3);
    expect(groups).to.have.lengthOf(2);
    expect(groups[0].size).to.equal(4);
    expect(groups[1].size).to.equal(1);
  });

  it('finds a single-pixel group', () => {
    const binary = new Uint8Array([0, 0, 0, 1]);
    const groups = findConnectedGroups(binary, 2, 2);
    expect(groups).to.deep.equal([{ size: 1, centroidX: 1, centroidY: 1 }]);
  });

  it('breaks ties by centroid x then centroid y, descending', () => {
    // Two isolated single pixels of equal size: (x:2,y:0) and (x:0,y:0).
    // Larger centroidX should sort first.
    const binary = new Uint8Array([1, 0, 1, 0, 0, 0]);
    const groups = findConnectedGroups(binary, 3, 2);
    expect(groups).to.deep.equal([
      { size: 1, centroidX: 2, centroidY: 0 },
      { size: 1, centroidX: 0, centroidY: 0 },
    ]);
  });
});

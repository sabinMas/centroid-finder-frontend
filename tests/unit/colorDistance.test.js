import { expect } from 'chai';
import { hexToRgb, colorDistance } from '../../src/lib/centroid/colorDistance.js';

describe('hexToRgb', () => {
  it('parses a hex string into r, g, b components', () => {
    expect(hexToRgb('FF0000')).to.deep.equal({ r: 255, g: 0, b: 0 });
  });

  it('accepts a leading # as well', () => {
    expect(hexToRgb('#00FF00')).to.deep.equal({ r: 0, g: 255, b: 0 });
  });
});

describe('colorDistance', () => {
  it('returns 0 for identical colors', () => {
    expect(colorDistance({ r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 })).to.equal(0);
  });

  it('matches the Euclidean distance formula', () => {
    // sqrt((255-0)^2 + (0-0)^2 + (0-0)^2) = 255
    expect(colorDistance({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })).to.equal(255);
  });
});

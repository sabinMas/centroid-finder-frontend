// Unit tests for src/lib/resultLink.js, the check applied before a result link becomes an href.

import { expect } from 'chai';
import { isSafeResultLink } from '../../src/lib/resultLink.js';

const UUID = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';

describe('isSafeResultLink', () => {
  it('accepts /results/<uuid>.csv', () => {
    expect(isSafeResultLink(`/results/${UUID}.csv`)).to.equal(true);
    expect(isSafeResultLink(`/results/${UUID.toUpperCase()}.csv`)).to.equal(true);
  });

  it('rejects other schemes and other hosts', () => {
    const bad = [
      'javascript:alert(1)',
      `https://example.com/results/${UUID}.csv`,
      `//example.com/results/${UUID}.csv`,
      `data:text/csv,${UUID}`,
    ];
    for (const link of bad) {
      expect(isSafeResultLink(link), link).to.equal(false);
    }
  });

  it('rejects paths that are not exactly /results/<uuid>.csv', () => {
    const bad = [
      '/results/abc.csv',
      `/results/${UUID}`,
      `/results/${UUID}.csv?x=1`,
      `/results/${UUID}.csv#frag`,
      `/results/${UUID}.csv/`,
      `/results/../${UUID}.csv`,
      `/other/${UUID}.csv`,
      ` /results/${UUID}.csv`,
      `/results/${UUID}.csv\n`,
      '',
    ];
    for (const link of bad) {
      expect(isSafeResultLink(link), JSON.stringify(link)).to.equal(false);
    }
  });

  it('rejects values that are not strings', () => {
    for (const value of [undefined, null, 5, {}, [], true]) {
      expect(isSafeResultLink(value)).to.equal(false);
    }
  });
});

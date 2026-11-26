// Unit tests for src/lib/recentJobs.js, the localStorage-backed "Recent Jobs" history.
// Each test gets a fresh FakeStorage so no state leaks between tests.

import { expect } from 'chai';
import { addRecentJob, clearRecentJobs, loadRecentJobs } from '../../src/lib/recentJobs.js';
import { FakeStorage, installFakeLocalStorage } from './testDoubles.js';

// Must match STORAGE_KEY in recentJobs.js. It isn't exported, and tests may not
// change src/, so it is repeated here. Seeding this key lets us test what happens
// when the stored value was written by an older or broken version of the app.
const STORAGE_KEY = 'centroidFinder.recentJobs';

/**
 * Builds a RecentJob with a predictable jobId so tests can check ordering.
 *
 * @param {number} n - used to make each job unique
 * @returns {import('../../src/lib/recentJobs.js').RecentJob}
 */
function makeJob(n) {
  return {
    filename: `video${n}.mp4`,
    jobId: `job-${n}`,
    targetColorHex: 'FF0000',
    threshold: 60,
    startedAt: new Date(Date.UTC(2026, 0, 1, 0, n)).toISOString(),
  };
}

describe('recentJobs', () => {
  let storage;
  let restoreWindow;

  beforeEach(() => {
    storage = new FakeStorage();
    restoreWindow = installFakeLocalStorage(storage);
  });

  afterEach(() => {
    restoreWindow();
  });

  describe('loadRecentJobs', () => {
    it('returns an empty array when nothing has been stored yet', () => {
      expect(loadRecentJobs()).to.deep.equal([]);
    });

    it('returns an empty array when the stored JSON is corrupt', () => {
      storage.setItem(STORAGE_KEY, '{not valid json');
      expect(loadRecentJobs()).to.deep.equal([]);
    });

    it('returns an empty array when localStorage throws on read', () => {
      const restore = installFakeLocalStorage(new FakeStorage({ failOn: ['getItem'] }));
      try {
        expect(loadRecentJobs()).to.deep.equal([]);
      } finally {
        restore();
      }
    });

    // F-S1: valid JSON that is not an array used to be returned as-is, which broke
    // VideoChooser (it calls .map on the result). It now counts as an empty history.
    it('returns an empty array when the stored JSON is not an array', () => {
      for (const value of [{ jobId: 'not-a-list' }, 'text', 7, true, null]) {
        storage.setItem(STORAGE_KEY, JSON.stringify(value));
        expect(loadRecentJobs()).to.deep.equal([]);
      }
    });

    // The color goes into a style attribute in VideoChooser, so it must be six hex digits.
    it('drops entries whose color is not six hex digits', () => {
      const badColors = ['red', 'FF00', 'FF00000', '#FF0000', 'GG0000', 'red;background:url(x)', '', 123456, null];
      for (const targetColorHex of badColors) {
        storage.setItem(STORAGE_KEY, JSON.stringify([{ ...makeJob(1), targetColorHex }]));
        expect(loadRecentJobs(), String(targetColorHex)).to.deep.equal([]);
      }
    });

    it('accepts lower-case and upper-case hex colors', () => {
      const jobs = [{ ...makeJob(1), targetColorHex: 'ff00aa' }, { ...makeJob(2), targetColorHex: 'FF00AA' }];
      storage.setItem(STORAGE_KEY, JSON.stringify(jobs));
      expect(loadRecentJobs()).to.deep.equal(jobs);
    });

    it('drops entries with a missing or wrongly typed field', () => {
      const broken = [
        null,
        'text',
        42,
        [],
        {},
        { ...makeJob(1), filename: 5 },
        { ...makeJob(1), jobId: undefined },
        { ...makeJob(1), threshold: '60' },
        { ...makeJob(1), threshold: null },
        { ...makeJob(1), startedAt: 12 },
      ];
      storage.setItem(STORAGE_KEY, JSON.stringify(broken));
      expect(loadRecentJobs()).to.deep.equal([]);
    });

    it('keeps the good entries and drops only the bad ones', () => {
      const stored = [makeJob(1), { ...makeJob(2), targetColorHex: 'nope' }, makeJob(3)];
      storage.setItem(STORAGE_KEY, JSON.stringify(stored));
      expect(loadRecentJobs()).to.deep.equal([makeJob(1), makeJob(3)]);
    });
  });

  describe('addRecentJob', () => {
    it('stores a job so loadRecentJobs returns it', () => {
      addRecentJob(makeJob(1));
      expect(loadRecentJobs()).to.deep.equal([makeJob(1)]);
    });

    it('keeps the newest job first', () => {
      addRecentJob(makeJob(1));
      addRecentJob(makeJob(2));
      addRecentJob(makeJob(3));
      expect(loadRecentJobs().map((job) => job.jobId)).to.deep.equal(['job-3', 'job-2', 'job-1']);
    });

    it('keeps at most 10 jobs and drops the oldest', () => {
      for (let n = 1; n <= 12; n++) {
        addRecentJob(makeJob(n));
      }
      const jobIds = loadRecentJobs().map((job) => job.jobId);
      expect(jobIds).to.have.lengthOf(10);
      expect(jobIds[0]).to.equal('job-12');
      expect(jobIds[9]).to.equal('job-3');
      expect(jobIds).to.not.include('job-1');
      expect(jobIds).to.not.include('job-2');
    });

    it('starts a fresh list when the stored JSON is corrupt', () => {
      storage.setItem(STORAGE_KEY, 'garbage');
      addRecentJob(makeJob(1));
      expect(loadRecentJobs()).to.deep.equal([makeJob(1)]);
    });

    // F-S1: this used to throw a TypeError (spreading a plain object), which VideoPreview
    // then showed as a job error even though the backend job had started.
    it('starts a fresh list when the stored JSON is an object instead of an array', () => {
      storage.setItem(STORAGE_KEY, JSON.stringify({ jobId: 'not-a-list' }));
      expect(() => addRecentJob(makeJob(1))).to.not.throw();
      expect(loadRecentJobs()).to.deep.equal([makeJob(1)]);
    });

    it('does not throw when localStorage throws on write (history just is not saved)', () => {
      const failingStorage = new FakeStorage({ failOn: ['setItem'] });
      const restore = installFakeLocalStorage(failingStorage);
      try {
        expect(() => addRecentJob(makeJob(1))).to.not.throw();
        expect(failingStorage.items.size).to.equal(0);
      } finally {
        restore();
      }
    });

    it('does not throw when localStorage throws on read', () => {
      const restore = installFakeLocalStorage(new FakeStorage({ failOn: ['getItem'] }));
      try {
        expect(() => addRecentJob(makeJob(1))).to.not.throw();
      } finally {
        restore();
      }
    });
  });

  describe('clearRecentJobs', () => {
    it('removes every stored job', () => {
      addRecentJob(makeJob(1));
      addRecentJob(makeJob(2));
      clearRecentJobs();
      expect(loadRecentJobs()).to.deep.equal([]);
      expect(storage.items.has(STORAGE_KEY)).to.equal(false);
    });

    it('does not throw when localStorage throws on remove', () => {
      const restore = installFakeLocalStorage(new FakeStorage({ failOn: ['removeItem'] }));
      try {
        expect(() => clearRecentJobs()).to.not.throw();
      } finally {
        restore();
      }
    });
  });
});

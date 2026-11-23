// Unit tests for the endpoint wrappers in src/api/videos.js, process.js and
// thumbnail.js. The URLs and methods are a frozen contract with the backend
// (see TASKS.md "Frozen contracts"), so these tests fail if anyone changes them.
// They also check that filenames with spaces or "#" are URL-encoded; without that,
// "#" would cut the path short and the backend would look up the wrong file.

import { expect } from 'chai';
import { getVideos } from '../../src/api/videos.js';
import { getJobStatus, startProcessingJob } from '../../src/api/process.js';
import { getThumbnailUrl } from '../../src/api/thumbnail.js';
import { jsonResponse, stubFetch } from './testDoubles.js';

describe('api endpoints', () => {
  let fetchStub;

  afterEach(() => {
    fetchStub?.restore();
    fetchStub = undefined;
  });

  describe('getVideos', () => {
    it('GETs /api/videos and returns the filename list', async () => {
      fetchStub = stubFetch(jsonResponse(['ball.mp4']));
      expect(await getVideos()).to.deep.equal(['ball.mp4']);
      expect(fetchStub.calls).to.have.lengthOf(1);
      expect(fetchStub.calls[0].url).to.equal('/api/videos');
      // No options means fetch's default method, GET.
      expect(fetchStub.calls[0].options?.method ?? 'GET').to.equal('GET');
    });
  });

  describe('startProcessingJob', () => {
    it('POSTs to /process/:filename with targetColor and threshold query params', async () => {
      fetchStub = stubFetch(jsonResponse({ jobId: 'abc' }, 202));
      expect(await startProcessingJob('ball.mp4', 'FF0000', 60)).to.deep.equal({ jobId: 'abc' });
      expect(fetchStub.calls).to.have.lengthOf(1);
      expect(fetchStub.calls[0].url).to.equal('/process/ball.mp4?targetColor=FF0000&threshold=60');
      expect(fetchStub.calls[0].options.method).to.equal('POST');
    });

    it('encodes spaces and "#" in the filename', async () => {
      fetchStub = stubFetch(jsonResponse({ jobId: 'abc' }, 202));
      await startProcessingJob('my clip #2.mp4', '00FF00', 10);
      expect(fetchStub.calls[0].url).to.equal('/process/my%20clip%20%232.mp4?targetColor=00FF00&threshold=10');
    });
  });

  describe('getJobStatus', () => {
    it('GETs /process/:jobId/status', async () => {
      fetchStub = stubFetch(jsonResponse({ status: 'processing' }));
      expect(await getJobStatus('job-1')).to.deep.equal({ status: 'processing' });
      expect(fetchStub.calls[0].url).to.equal('/process/job-1/status');
      expect(fetchStub.calls[0].options?.method ?? 'GET').to.equal('GET');
    });

    it('encodes special characters in the job id', async () => {
      fetchStub = stubFetch(jsonResponse({ status: 'done', result: 'x.csv' }));
      await getJobStatus('a b#c');
      expect(fetchStub.calls[0].url).to.equal('/process/a%20b%23c/status');
    });
  });

  describe('getThumbnailUrl', () => {
    it('builds /thumbnail/:filename without calling fetch', () => {
      fetchStub = stubFetch(() => {
        throw new Error('getThumbnailUrl should not fetch');
      });
      expect(getThumbnailUrl('ball.mp4')).to.equal('/thumbnail/ball.mp4');
      expect(fetchStub.calls).to.have.lengthOf(0);
    });

    it('encodes spaces and "#" in the filename', () => {
      expect(getThumbnailUrl('my clip #2.mp4')).to.equal('/thumbnail/my%20clip%20%232.mp4');
    });
  });
});

// Unit tests for the endpoint wrappers in src/api/videos.js, process.js and
// thumbnail.js. The URLs and methods are a frozen contract with the backend
// (see TASKS.md "Frozen contracts"), so these tests fail if anyone changes them.
// They also check that filenames with spaces or "#" are URL-encoded; without that,
// "#" would cut the path short and the backend would look up the wrong file.

import { expect } from 'chai';
import { getVideoMetadata, getVideos, uploadVideo } from '../../src/api/videos.js';
import { getJobs } from '../../src/api/jobs.js';
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

  describe('uploadVideo', () => {
    it('POSTs the file as multipart form data in the field "video" to /api/videos', async () => {
      fetchStub = stubFetch(jsonResponse({ filename: 'clip.mp4' }, 201));
      const file = new File(['fake video bytes'], 'clip.mp4', { type: 'video/mp4' });
      expect(await uploadVideo(file)).to.deep.equal({ filename: 'clip.mp4' });
      const { url, options } = fetchStub.calls[0];
      expect(url).to.equal('/api/videos');
      expect(options.method).to.equal('POST');
      expect(options.body).to.be.instanceOf(FormData);
      expect(options.body.get('video').name).to.equal('clip.mp4');
    });

    it('does not set a Content-Type header, so the browser can add the multipart boundary', async () => {
      fetchStub = stubFetch(jsonResponse({ filename: 'clip.mp4' }, 201));
      await uploadVideo(new File(['x'], 'clip.mp4'));
      expect(fetchStub.calls[0].options.headers).to.equal(undefined);
    });

    it('returns the name the server stored, even when it differs from the original', async () => {
      fetchStub = stubFetch(jsonResponse({ filename: 'clip-1.mp4' }, 201));
      expect(await uploadVideo(new File(['x'], 'clip.mp4'))).to.deep.equal({ filename: 'clip-1.mp4' });
    });

    it('surfaces the server message for a 400, a 413 and a 500', async () => {
      const cases = [
        [400, 'File type not allowed'],
        [413, 'Video is too large'],
        [500, 'Upload failed'],
      ];
      for (const [status, message] of cases) {
        fetchStub = stubFetch(jsonResponse({ error: message }, status));
        let thrown;
        try {
          await uploadVideo(new File(['x'], 'clip.mp4'));
        } catch (error) {
          thrown = error;
        }
        expect(thrown?.message).to.equal(message);
        fetchStub.restore();
      }
      fetchStub = undefined;
    });

    it('throws when a 2xx response has no usable filename', async () => {
      for (const body of [{}, { filename: '' }, { filename: 7 }, null]) {
        fetchStub = stubFetch(jsonResponse(body, 201));
        let thrown;
        try {
          await uploadVideo(new File(['x'], 'clip.mp4'));
        } catch (error) {
          thrown = error;
        }
        expect(thrown?.message).to.match(/did not say what name/);
        fetchStub.restore();
      }
      fetchStub = undefined;
    });
  });

  describe('getVideoMetadata', () => {
    it('GETs /api/videos/:filename/metadata and returns the body', async () => {
      const metadata = { filename: 'ball.mp4', durationSeconds: 4, location: null, tags: {} };
      fetchStub = stubFetch(jsonResponse(metadata));
      expect(await getVideoMetadata('ball.mp4')).to.deep.equal(metadata);
      expect(fetchStub.calls[0].url).to.equal('/api/videos/ball.mp4/metadata');
      expect(fetchStub.calls[0].options?.method ?? 'GET').to.equal('GET');
    });

    it('encodes spaces and "#" in the filename', async () => {
      fetchStub = stubFetch(jsonResponse({ filename: 'my clip #2.mp4' }));
      await getVideoMetadata('my clip #2.mp4');
      expect(fetchStub.calls[0].url).to.equal('/api/videos/my%20clip%20%232.mp4/metadata');
    });

    it('surfaces the server message for a 404', async () => {
      fetchStub = stubFetch(jsonResponse({ error: 'Video not found' }, 404));
      let thrown;
      try {
        await getVideoMetadata('missing.mp4');
      } catch (error) {
        thrown = error;
      }
      expect(thrown?.message).to.equal('Video not found');
    });

    it('throws when the body is not an object', async () => {
      for (const body of [null, [], 'text']) {
        fetchStub = stubFetch(jsonResponse(body));
        let thrown;
        try {
          await getVideoMetadata('ball.mp4');
        } catch (error) {
          thrown = error;
        }
        expect(thrown?.message).to.match(/unexpected response/);
        fetchStub.restore();
      }
      fetchStub = undefined;
    });
  });

  describe('getJobs', () => {
    it('GETs /api/jobs and returns the array', async () => {
      const jobs = [{ jobId: 'a', filename: 'ball.mp4', status: 'done' }];
      fetchStub = stubFetch(jsonResponse(jobs));
      expect(await getJobs()).to.deep.equal(jobs);
      expect(fetchStub.calls[0].url).to.equal('/api/jobs');
      expect(fetchStub.calls[0].options?.method ?? 'GET').to.equal('GET');
    });

    it('returns an empty array when the user has no jobs', async () => {
      fetchStub = stubFetch(jsonResponse([]));
      expect(await getJobs()).to.deep.equal([]);
    });

    it('surfaces the 401 message for guests', async () => {
      fetchStub = stubFetch(jsonResponse({ error: 'Sign in to see saved jobs' }, 401));
      let thrown;
      try {
        await getJobs();
      } catch (error) {
        thrown = error;
      }
      expect(thrown?.message).to.equal('Sign in to see saved jobs');
    });

    it('throws when the body is not an array', async () => {
      fetchStub = stubFetch(jsonResponse({ jobs: [] }));
      let thrown;
      try {
        await getJobs();
      } catch (error) {
        thrown = error;
      }
      expect(thrown?.message).to.match(/unexpected response/);
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

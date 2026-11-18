// Placeholder data standing in for POST /process/:filename and GET /process/:jobId/status
// during development without a backend.
export const mockJobId = 'mock-job-123';

export const mockJobStatuses = {
  processing: { status: 'processing' },
  done: { status: 'done', result: '/results/mock-job-123.csv' },
  error: { status: 'error', error: 'Error processing video: the processor did not produce a result' },
};

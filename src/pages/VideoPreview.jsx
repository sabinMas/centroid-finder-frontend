// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
// Route: /preview/:filename
// Contract to build against (frozen, don't edit): api/thumbnail.js getThumbnailUrl(),
// api/process.js startProcessingJob()/getJobStatus(), lib/centroid/index.js
// findLargestCentroid(), mock/jobs.js.

export function VideoPreview() {
  // TODO(onjamm-dev): useParams for :filename, render ThumbnailCanvas + ThresholdSlider +
  // ColorPicker, a "Process Video with These Settings" button calling startProcessingJob(),
  // then poll getJobStatus(jobId) and render JobStatusPanel. Wrap whichever part makes
  // sense (e.g. the whole page, or ThumbnailCanvas) with withLoading.
  return <div>TODO: Video Preview and Processing page</div>;
}

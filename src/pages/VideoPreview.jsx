// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
// Route: /preview/:filename
// Contract to build against (frozen, don't edit): api/thumbnail.js getThumbnailUrl(),
// api/process.js startProcessingJob()/getJobStatus(), lib/centroid/index.js
// findLargestCentroid(), mock/jobs.js.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { getThumbnailUrl } from '../api/thumbnail.js';
import { startProcessingJob, getJobStatus } from '../api/process.js';
import { ThumbnailCanvas } from '../components/ThumbnailCanvas.jsx';
import { ThresholdSlider } from '../components/ThresholdSlider.jsx';
import { ColorPicker } from '../components/ColorPicker.jsx';
import { JobStatusPanel } from '../components/JobStatusPanel.jsx';
import { withLoading } from '../components/hoc/withLoading.jsx';
import { addRecentJob } from '../lib/recentJobs.js';

const DEFAULT_TARGET_COLOR_HEX = '570D0E';
const DEFAULT_THRESHOLD = 35;
const JOB_POLL_INTERVAL_MS = 2000;
const TERMINAL_JOB_STATUSES = ['done', 'error'];

const JobStatusPanelWithLoading = withLoading(JobStatusPanel);

export function VideoPreview() {
  const { filename } = useParams();
  const [targetColorHex, setTargetColorHex] = useState(DEFAULT_TARGET_COLOR_HEX);
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  useEffect(function pollJobStatus() {
    if (!jobId) return;

    async function checkJobStatus() {
      try {
        const latestStatus = await getJobStatus(jobId);
        setJobStatus(latestStatus);
        if (TERMINAL_JOB_STATUSES.includes(latestStatus.status)) {
          clearInterval(intervalId);
        }
      } catch (error) {
        setJobStatus({ status: 'error', error: error.message });
        clearInterval(intervalId);
      }
    }

    const intervalId = setInterval(checkJobStatus, JOB_POLL_INTERVAL_MS);
    checkJobStatus();

    return function stopPollingJobStatus() {
      clearInterval(intervalId);
    };
  }, [jobId]);

  async function handleProcessClick() {
    setIsSubmittingJob(true);
    try {
      const { jobId: startedJobId } = await startProcessingJob(filename, targetColorHex, threshold);
      setJobStatus(null);
      setJobId(startedJobId);
      addRecentJob({
        filename,
        jobId: startedJobId,
        targetColorHex,
        threshold,
        startedAt: new Date().toISOString(),
      });
    } catch (error) {
      setJobStatus({ status: 'error', error: error.message });
    } finally {
      setIsSubmittingJob(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {filename}
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <ThumbnailCanvas
          thumbnailUrl={getThumbnailUrl(filename)}
          targetColorHex={targetColorHex}
          threshold={threshold}
        />
        <Stack spacing={2} sx={{ minWidth: 220 }}>
          <ColorPicker valueHex={targetColorHex} onChange={setTargetColorHex} />
          <ThresholdSlider value={threshold} onChange={setThreshold} />
          <Button variant="contained" onClick={handleProcessClick}>
            Process Video with These Settings
          </Button>
        </Stack>
      </Stack>
      <Box sx={{ mt: 3 }}>
        <JobStatusPanelWithLoading
          loading={isSubmittingJob}
          status={jobStatus?.status ?? null}
          result={jobStatus?.result}
          error={jobStatus?.error}
        />
      </Box>
    </Container>
  );
}

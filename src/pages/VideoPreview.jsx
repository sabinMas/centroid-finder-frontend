// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
// Route: /preview/:filename
// Contract to build against (frozen, don't edit): api/thumbnail.js getThumbnailUrl(),
// api/process.js startProcessingJob()/getJobStatus(), lib/centroid/index.js
// findLargestCentroid(), mock/jobs.js.
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getThumbnailUrl } from '../api/thumbnail.js';
import { startProcessingJob, getJobStatus } from '../api/process.js';
import { ThumbnailCanvas } from '../components/ThumbnailCanvas.jsx';
import { ThresholdSlider } from '../components/ThresholdSlider.jsx';
import { ColorPicker } from '../components/ColorPicker.jsx';
import { JobStatusPanel } from '../components/JobStatusPanel.jsx';
import { withLoading } from '../components/hoc/withLoading.jsx';
import { addRecentJob } from '../lib/recentJobs.js';

// Tuned against the sample Ensatina video: isolates the salamander from the red backdrop.
const DEFAULT_TARGET_COLOR_HEX = '4F080B';
const DEFAULT_THRESHOLD = 60;
const JOB_POLL_INTERVAL_MS = 2000;
const TERMINAL_JOB_STATUSES = ['done', 'error'];

const JobStatusPanelWithLoading = withLoading(JobStatusPanel);

export function VideoPreview() {
  const { filename } = useParams();
  const navigate = useNavigate();
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

  function handleBackClick() {
    navigate('/videos');
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick} sx={{ mb: 2 }}>
        Back to Videos
      </Button>
      <Typography variant="h4" gutterBottom>
        {filename}
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { md: 'center' } }}>
          <ColorPicker valueHex={targetColorHex} onChange={setTargetColorHex} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <ThresholdSlider value={threshold} onChange={setThreshold} />
          </Box>
          <Button variant="contained" size="large" onClick={handleProcessClick}>
            Process Video with These Settings
          </Button>
        </Stack>
      </Paper>
      <ThumbnailCanvas
        thumbnailUrl={getThumbnailUrl(filename)}
        targetColorHex={targetColorHex}
        threshold={threshold}
      />
      <Box sx={{ mt: 3 }}>
        <JobStatusPanelWithLoading
          loading={isSubmittingJob}
          status={jobStatus?.status ?? null}
          result={jobStatus?.result}
          error={jobStatus?.error}
          replayPath={jobId ? `/replay/${encodeURIComponent(filename)}/${jobId}` : undefined}
        />
      </Box>
    </Container>
  );
}

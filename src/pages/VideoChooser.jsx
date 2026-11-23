// Route: /videos
// Lists the videos the backend can process (api/videos.js getVideos()) and the user's
// recent jobs. Clicking a video opens its preview page.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { getVideos } from '../api/videos.js';
import { VideoListItem } from '../components/VideoListItem.jsx';
import { clearRecentJobs, loadRecentJobs } from '../lib/recentJobs.js';

/**
 * The four states the video list can be in.
 * Using a string discriminant keeps the JSX branches easy to read and avoids
 * multiple booleans that can contradict each other (e.g. loading=true && error=true).
 *
 * @typedef {'loading' | 'success' | 'error' | 'empty'} FetchStatus
 */

/**
 * Fetches the video list from the backend and renders one of four states:
 *   loading  – spinner while the request is in flight
 *   error    – clear message + Retry button (never shows fake videos)
 *   empty    – "No videos found" when the backend returns []
 *   success  – the real list, one VideoListItem per filename
 *
 * Recent Jobs are always shown below the list regardless of fetch state so the
 * user can still navigate to a previous job even when the backend is down.
 *
 * @returns {JSX.Element}
 */
export function VideoChooser() {
  /** @type {[FetchStatus, Function]} */
  const [fetchStatus, setFetchStatus] = useState('loading');
  const [videoList, setVideoList] = useState([]);
  // retryCount is incremented by the Retry button; the effect depends on it so
  // it re-runs on each retry without needing to call setFetchStatus inside the effect.
  const [retryCount, setRetryCount] = useState(0);
  const [recentJobList, setRecentJobList] = useState(loadRecentJobs);
  const navigate = useNavigate();

  useEffect(function fetchVideos() {
    getVideos()
      .then(function onSuccess(list) {
        setVideoList(list);
        // Treat an empty array as its own state so the UI can say "No videos found"
        // rather than showing a blank list with no explanation.
        setFetchStatus(list.length === 0 ? 'empty' : 'success');
      })
      .catch(function onError() {
        // Never fall back to fake data — show the real error so the user knows
        // the backend isn't running and can act on it.
        setFetchStatus('error');
      });
  }, [retryCount]);

  /**
   * Sets the UI back to loading and bumps retryCount, which causes the effect
   * to re-run. Setting fetchStatus here (from an event handler, not the effect)
   * avoids the react/set-state-in-effect lint rule.
   */
  function handleRetry() {
    setFetchStatus('loading');
    setRetryCount(function increment(c) { return c + 1; });
  }

  function handleVideoSelect(filename) {
    navigate(`/preview/${encodeURIComponent(filename)}`);
  }

  function handleClearRecentJobs() {
    clearRecentJobs();
    setRecentJobList([]);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Choose a Video
      </Typography>

      <VideoListSection
        fetchStatus={fetchStatus}
        videoList={videoList}
        onVideoSelect={handleVideoSelect}
        onRetry={handleRetry}
      />

      {recentJobList.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="h6" gutterBottom>
              Recent Jobs
            </Typography>
            <Button size="small" onClick={handleClearRecentJobs}>
              Clear history
            </Button>
          </Box>
          <List dense>
            {recentJobList.map(function renderRecentJob(recentJob) {
              return (
                <RecentJobListItem key={recentJob.jobId} recentJob={recentJob} onClick={handleVideoSelect} />
              );
            })}
          </List>
        </Box>
      )}
    </Container>
  );
}

/**
 * Renders the correct UI for the current fetch state.
 * Extracted from VideoChooser to keep the main component readable, but kept in
 * this file so F-E1 doesn't need a new component file.
 *
 * @param {object}      props
 * @param {FetchStatus} props.fetchStatus  - current state of the fetch
 * @param {string[]}    props.videoList    - filenames returned by the backend
 * @param {Function}    props.onVideoSelect - called with filename when an item is clicked
 * @param {Function}    props.onRetry       - called when the user clicks Retry
 * @returns {JSX.Element}
 */
function VideoListSection({ fetchStatus, videoList, onVideoSelect, onRetry }) {
  if (fetchStatus === 'loading') {
    // Show a spinner while the request is in flight so the user knows something
    // is happening. Using MUI's CircularProgress directly here instead of the
    // withLoading HOC because this is an inline section, not a wrapped component.
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} aria-label="Loading videos">
        <CircularProgress />
      </Box>
    );
  }

  if (fetchStatus === 'error') {
    // Show an error message and a Retry button. No fake videos — the user should
    // know the backend is unreachable so they can start it or investigate.
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Couldn't load the video list. Make sure the backend is running on port 3000.
        </Alert>
        <Button variant="outlined" onClick={onRetry}>
          Retry
        </Button>
      </Box>
    );
  }

  if (fetchStatus === 'empty') {
    // The backend responded but returned no videos, so say so explicitly rather
    // than showing a blank list that looks like a bug.
    return (
      <Alert severity="info">
        No videos found. Add a video file to the backend's video directory and reload.
      </Alert>
    );
  }

  // fetchStatus === 'success'
  return (
    <List>
      {videoList.map(function renderVideoItem(filename) {
        return <VideoListItem key={filename} filename={filename} onClick={onVideoSelect} />;
      })}
    </List>
  );
}

/**
 * A single row in the Recent Jobs list.
 * Shows the filename, threshold, color swatch and start time.
 *
 * @param {object}   props
 * @param {object}   props.recentJob - saved job record from recentJobs.js
 * @param {Function} props.onClick   - called with filename when the row is clicked
 * @returns {JSX.Element}
 */
function RecentJobListItem({ recentJob, onClick }) {
  function handleClick() {
    onClick(recentJob.filename);
  }

  const startedAtLabel = new Date(recentJob.startedAt).toLocaleString();

  return (
    <ListItemButton onClick={handleClick} divider>
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: `#${recentJob.targetColorHex}`,
          mr: 2,
          flexShrink: 0,
        }}
      />
      <ListItemText
        primary={recentJob.filename}
        secondary={`threshold ${recentJob.threshold} · ${startedAtLabel}`}
      />
    </ListItemButton>
  );
}

// Route: /videos
// Lists the videos the backend can process (api/videos.js getVideos()) and the user's
// recent jobs. Clicking a video opens its preview page.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Divider, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { getVideos } from '../api/videos.js';
import { mockVideoList } from '../mock/videos.js';
import { VideoListItem } from '../components/VideoListItem.jsx';
import { clearRecentJobs, loadRecentJobs } from '../lib/recentJobs.js';

export function VideoChooser() {
  const [videoList, setVideoList] = useState([]);
  const [isShowingSampleVideos, setIsShowingSampleVideos] = useState(false);
  const [recentJobList, setRecentJobList] = useState(loadRecentJobs);
  const navigate = useNavigate();

  useEffect(function loadVideoList() {
    async function fetchVideoList() {
      try {
        const fetchedVideoList = await getVideos();
        setVideoList(fetchedVideoList);
      } catch {
        setVideoList(mockVideoList);
        setIsShowingSampleVideos(true);
      }
    }
    fetchVideoList();
  }, []);

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
      {isShowingSampleVideos && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Couldn't reach the backend, so these are sample videos. Start the server on port 3000 to see real
          ones.
        </Alert>
      )}
      <List>
        {videoList.map(function renderVideoItem(filename) {
          return <VideoListItem key={filename} filename={filename} onClick={handleVideoSelect} />;
        })}
      </List>

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
              return <RecentJobListItem key={recentJob.jobId} recentJob={recentJob} onClick={handleVideoSelect} />;
            })}
          </List>
        </Box>
      )}
    </Container>
  );
}

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
      <ListItemText primary={recentJob.filename} secondary={`threshold ${recentJob.threshold} · ${startedAtLabel}`} />
    </ListItemButton>
  );
}

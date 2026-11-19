// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
// Route: /videos
// Contract to build against (frozen, don't edit): api/videos.js getVideos(),
// mock/videos.js mockVideoList, components/VideoListItem.jsx.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
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

  function handleReplaySelect(recentJob) {
    navigate(`/replay/${encodeURIComponent(recentJob.filename)}/${recentJob.jobId}`);
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
              return (
                <RecentJobListItem
                  key={recentJob.jobId}
                  recentJob={recentJob}
                  onClick={handleVideoSelect}
                  onReplay={handleReplaySelect}
                />
              );
            })}
          </List>
        </Box>
      )}
    </Container>
  );
}

function RecentJobListItem({ recentJob, onClick, onReplay }) {
  function handleClick() {
    onClick(recentJob.filename);
  }

  function handleReplayClick() {
    onReplay(recentJob);
  }

  const startedAtLabel = new Date(recentJob.startedAt).toLocaleString();

  return (
    <ListItem
      divider
      disablePadding
      secondaryAction={
        <Tooltip title="Watch trail replay">
          <IconButton edge="end" onClick={handleReplayClick} aria-label={`Watch trail replay for ${recentJob.filename}`}>
            <TimelineIcon />
          </IconButton>
        </Tooltip>
      }
    >
      <ListItemButton onClick={handleClick}>
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
    </ListItem>
  );
}

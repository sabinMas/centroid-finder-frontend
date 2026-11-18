// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
// Route: /videos
// Contract to build against (frozen, don't edit): api/videos.js getVideos(),
// mock/videos.js mockVideoList, components/VideoListItem.jsx.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, List, Typography } from '@mui/material';
import { getVideos } from '../api/videos.js';
import { mockVideoList } from '../mock/videos.js';
import { VideoListItem } from '../components/VideoListItem.jsx';

export function VideoChooser() {
  const [videoList, setVideoList] = useState([]);
  const navigate = useNavigate();

  useEffect(function loadVideoList() {
    async function fetchVideoList() {
      try {
        const fetchedVideoList = await getVideos();
        setVideoList(fetchedVideoList);
      } catch {
        setVideoList(mockVideoList);
      }
    }
    fetchVideoList();
  }, []);

  function handleVideoSelect(filename) {
    navigate(`/preview/${encodeURIComponent(filename)}`);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Choose a Video
      </Typography>
      <List>
        {videoList.map(function renderVideoItem(filename) {
          return <VideoListItem key={filename} filename={filename} onClick={handleVideoSelect} />;
        })}
      </List>
    </Container>
  );
}

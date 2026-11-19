// Route: /replay/:filename/:jobId
// Turns a finished job's CSV into an animated path of the salamander over the video frame,
// with a scrubbable timeline, a heatmap of where it spent its time, and movement stats.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  FormControlLabel,
  IconButton,
  Paper,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { getJobStatus } from '../api/process.js';
import { getResultCsv } from '../api/results.js';
import { getThumbnailUrl } from '../api/thumbnail.js';
import { TrailCanvas } from '../components/TrailCanvas.jsx';
import { withLoading } from '../components/hoc/withLoading.jsx';
import { buildHeatmap, computeTrailStats, formatTime, isTracked, markGlitches, parseTrailCsv } from '../lib/trail.js';

const PLAYBACK_SPEEDS = [1, 5, 20, 60];
const DEFAULT_PLAYBACK_SPEED = 20;
const HEATMAP_CELL_SIZE = 24;
const FALLBACK_SECONDS_PER_SAMPLE = 0.5;

export function TrailReplay() {
  const { filename, jobId } = useParams();
  const [replay, setReplay] = useState({ status: 'loading' });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(function loadTrail() {
    let isCurrentRequest = true;

    async function fetchTrail() {
      try {
        const jobStatus = await getJobStatus(jobId);
        if (!isCurrentRequest) return;
        if (jobStatus.status === 'processing') {
          setReplay({ status: 'processing' });
          return;
        }
        if (jobStatus.status === 'error') {
          setReplay({ status: 'error', error: jobStatus.error });
          return;
        }
        const csvText = await getResultCsv(jobStatus.result);
        if (!isCurrentRequest) return;
        const points = markGlitches(parseTrailCsv(csvText));
        if (points.length === 0) {
          setReplay({ status: 'error', error: "This job's CSV doesn't contain any samples." });
          return;
        }
        setReplay({ status: 'ready', points, resultUrl: jobStatus.result });
      } catch (error) {
        if (isCurrentRequest) setReplay({ status: 'error', error: error.message });
      }
    }

    fetchTrail();
    return function ignoreStaleRequest() {
      isCurrentRequest = false;
    };
  }, [jobId, reloadCount]);

  function handleCheckAgain() {
    setReplay({ status: 'loading' });
    setReloadCount((count) => count + 1);
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back to the preview">
          <IconButton component={RouterLink} to={`/preview/${encodeURIComponent(filename)}`} aria-label="Back to preview">
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4">Trail Replay</Typography>
          <Typography color="text.secondary" noWrap>
            {filename}
          </Typography>
        </Box>
        {replay.status === 'ready' && (
          <Button variant="outlined" startIcon={<DownloadIcon />} href={replay.resultUrl} target="_blank" rel="noreferrer">
            Download CSV
          </Button>
        )}
      </Stack>

      <ReplayContentWithLoading
        loading={replay.status === 'loading'}
        replay={replay}
        filename={filename}
        onCheckAgain={handleCheckAgain}
      />
    </Container>
  );
}

function ReplayContent({ replay, filename, onCheckAgain }) {
  if (replay.status === 'processing') {
    return (
      <Alert severity="info" action={<Button color="inherit" onClick={onCheckAgain}>Check again</Button>}>
        This job is still processing. The replay will be ready once the CSV is.
      </Alert>
    );
  }
  if (replay.status === 'error') {
    return <Alert severity="error">{replay.error}</Alert>;
  }
  return <ReplayPlayer points={replay.points} thumbnailUrl={getThumbnailUrl(filename)} />;
}

const ReplayContentWithLoading = withLoading(ReplayContent);

function ReplayPlayer({ points, thumbnailUrl }) {
  const lastIndex = points.length - 1;
  const stats = useMemo(() => computeTrailStats(points), [points]);
  const secondsPerSample = stats.sampleInterval > 0 ? stats.sampleInterval : FALLBACK_SECONDS_PER_SAMPLE;

  const [frameSize, setFrameSize] = useState(null);
  const heatmap = useMemo(
    () => (frameSize ? buildHeatmap(points, frameSize.width, frameSize.height, HEATMAP_CELL_SIZE) : null),
    [points, frameSize],
  );

  const [currentIndex, setCurrentIndex] = useState(lastIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFullPath, setShowFullPath] = useState(false);
  const [showGlitches, setShowGlitches] = useState(true);
  const playheadRef = useRef(lastIndex);

  useEffect(function animatePlayback() {
    if (!isPlaying) return undefined;
    let animationFrameId;
    let previousTimestamp;

    function advancePlayhead(timestamp) {
      if (previousTimestamp !== undefined) {
        const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
        playheadRef.current = Math.min(lastIndex, playheadRef.current + (elapsedSeconds * playbackSpeed) / secondsPerSample);
        setCurrentIndex(Math.floor(playheadRef.current));
        if (playheadRef.current >= lastIndex) {
          setIsPlaying(false);
          return;
        }
      }
      previousTimestamp = timestamp;
      animationFrameId = requestAnimationFrame(advancePlayhead);
    }

    animationFrameId = requestAnimationFrame(advancePlayhead);
    return function stopAnimation() {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, playbackSpeed, secondsPerSample, lastIndex]);

  function handlePlayPause() {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (currentIndex >= lastIndex) {
      playheadRef.current = 0;
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }

  function handleRestart() {
    playheadRef.current = 0;
    setCurrentIndex(0);
    setIsPlaying(true);
  }

  function handleScrub(event, newIndex) {
    playheadRef.current = newIndex;
    setCurrentIndex(newIndex);
  }

  function handleSpeedChange(event, newSpeed) {
    if (newSpeed !== null) setPlaybackSpeed(newSpeed);
  }

  const currentPoint = points[currentIndex];
  const isAtEnd = currentIndex >= lastIndex;
  const currentPositionChip = describePosition(currentPoint);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ flex: 2, minWidth: 0, width: '100%' }}>
        <TrailCanvas
          thumbnailUrl={thumbnailUrl}
          points={points}
          currentIndex={currentIndex}
          heatmap={heatmap}
          showHeatmap={showHeatmap}
          showFullPath={showFullPath}
          showGlitches={showGlitches}
          onFrameSize={setFrameSize}
        />

        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Tooltip title={isPlaying ? 'Pause' : isAtEnd ? 'Play from the start' : 'Play'}>
              <IconButton color="primary" onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} size="large">
                {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Restart">
              <IconButton onClick={handleRestart} aria-label="Restart">
                <ReplayIcon />
              </IconButton>
            </Tooltip>
            <Slider
              aria-label="Timeline"
              min={0}
              max={lastIndex}
              value={currentIndex}
              onChange={handleScrub}
              valueLabelDisplay="auto"
              valueLabelFormat={(index) => formatTime(points[index].time)}
              sx={{ mx: 1 }}
            />
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
              {formatTime(currentPoint.time)} / {formatTime(points[lastIndex].time)}
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mt: 1.5 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Speed
              </Typography>
              <ToggleButtonGroup size="small" exclusive value={playbackSpeed} onChange={handleSpeedChange} aria-label="Playback speed">
                {PLAYBACK_SPEEDS.map((speed) => (
                  <ToggleButton key={speed} value={speed} aria-label={`${speed}x speed`}>
                    {speed}x
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch checked={showHeatmap} onChange={(event) => setShowHeatmap(event.target.checked)} />}
                label="Heatmap"
              />
              <FormControlLabel
                control={<Switch checked={showFullPath} onChange={(event) => setShowFullPath(event.target.checked)} />}
                label="Full path"
              />
              <FormControlLabel
                control={<Switch checked={showGlitches} onChange={(event) => setShowGlitches(event.target.checked)} />}
                label="Glitches"
              />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1.5 }}>
            <Chip size="small" color={currentPositionChip.color} label={currentPositionChip.label} />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 'auto' }}>
              <Typography variant="caption" color="text.secondary">
                older
              </Typography>
              <Box
                sx={{
                  width: 90,
                  height: 8,
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, hsl(200, 95%, 60%), hsl(40, 95%, 60%))',
                }}
              />
              <Typography variant="caption" color="text.secondary">
                newer
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Stack spacing={1.5} sx={{ flex: 1, width: '100%' }}>
        <StatCard label="Video length" value={formatTime(stats.duration)} detail={`${points.length.toLocaleString()} samples`} />
        <StatCard
          label="Distance traveled"
          value={`${Math.round(stats.distance).toLocaleString()} px`}
          detail="Only counted while it was visible"
        />
        <StatCard label="Tracked" value={`${Math.round(stats.visiblePercent)}%`} detail="of sampled frames, glitches excluded" />
        <StatCard label="Top speed" value={`${Math.round(stats.topSpeed).toLocaleString()} px/s`} />
        <StatCard label="Resting" value={`${Math.round(stats.restingPercent)}%`} detail="of the time it was tracked" />
        <StatCard
          label="Longest time missing"
          value={stats.longestGap > 0 ? formatTime(stats.longestGap) : 'Never'}
          detail="Gaps break the trail line"
        />
        <StatCard
          label="Tracking glitches"
          value={stats.glitchEpisodes > 0 ? `${stats.glitchEpisodes} (${formatTime(stats.glitchSeconds)})` : 'None'}
          detail={
            stats.glitchEpisodes > 0
              ? 'Jumps onto noise, marked in red and left out of the stats. A lower threshold may help.'
              : 'Every jump looked like real movement'
          }
          tone={stats.glitchEpisodes > 0 ? 'warning' : undefined}
        />
      </Stack>
    </Stack>
  );
}

function describePosition(point) {
  if (isTracked(point)) return { color: 'success', label: `Spotted at (${point.x}, ${point.y})` };
  if (point.glitch) return { color: 'error', label: 'Tracking glitch: jumped to noise' };
  return { color: 'default', label: 'Not visible in this frame' };
}

function StatCard({ label, value, detail, tone }) {
  return (
    <Paper
      variant="outlined"
      sx={{ px: 2, py: 1.5, ...(tone && { borderColor: `${tone}.main`, bgcolor: `${tone}.light`, color: `${tone}.contrastText` }) }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      {detail && (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      )}
    </Paper>
  );
}

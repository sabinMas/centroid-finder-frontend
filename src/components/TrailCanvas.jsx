import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { isTracked } from '../lib/trail.js';

const OLD_TRAIL_HUE = 200;
const NEW_TRAIL_HUE = 40;
const GLITCH_COLOR = 'rgba(255, 82, 82, 0.85)';

/**
 * Draws the first video frame with the salamander's path on top: an optional heatmap of where
 * it spent its time, an optional faint full path, the trail up to the current sample (fading
 * from blue/old to orange/new), red marks where the tracker glitched onto noise, and a marker
 * at the current position.
 *
 * @param {{
 *   thumbnailUrl: string,
 *   points: import('../lib/trail.js').TrailPoint[],
 *   currentIndex: number,
 *   heatmap: ReturnType<typeof import('../lib/trail.js').buildHeatmap> | null,
 *   showHeatmap: boolean,
 *   showFullPath: boolean,
 *   showGlitches: boolean,
 *   onFrameSize?: (size: { width: number, height: number }) => void,
 * }} props
 */
export function TrailCanvas({
  thumbnailUrl,
  points,
  currentIndex,
  heatmap,
  showHeatmap,
  showFullPath,
  showGlitches,
  onFrameSize,
}) {
  const canvasRef = useRef(null);
  const [frameImage, setFrameImage] = useState(null);

  useEffect(function loadFrameImage() {
    let isCurrentLoad = true;
    const image = new Image();
    image.onload = function handleImageLoad() {
      if (!isCurrentLoad) return;
      setFrameImage(image);
      onFrameSize?.({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = thumbnailUrl;
    return function ignoreStaleLoad() {
      isCurrentLoad = false;
    };
  }, [thumbnailUrl, onFrameSize]);

  useEffect(function drawTrail() {
    if (!frameImage) return;
    const canvas = canvasRef.current;
    const width = frameImage.naturalWidth;
    const height = frameImage.naturalHeight;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    context.drawImage(frameImage, 0, 0);
    context.fillStyle = 'rgba(10, 20, 15, 0.45)';
    context.fillRect(0, 0, width, height);

    if (showHeatmap && heatmap && heatmap.max > 0) drawHeatmap(context, heatmap);

    const lineWidth = Math.max(2, width / 220);
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (showFullPath) {
      context.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      context.lineWidth = lineWidth * 0.6;
      forEachVisibleSegment(points, points.length - 1, function drawGhostSegment(from, to) {
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      });
    }

    context.lineWidth = lineWidth;
    forEachVisibleSegment(points, currentIndex, function drawTrailSegment(from, to, index) {
      const progress = currentIndex > 0 ? index / currentIndex : 1;
      const hue = OLD_TRAIL_HUE + (NEW_TRAIL_HUE - OLD_TRAIL_HUE) * progress;
      context.strokeStyle = `hsla(${hue}, 95%, 60%, ${0.3 + 0.7 * progress})`;
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    });

    if (showGlitches) drawGlitchMarks(context, points, currentIndex, width);
    drawCurrentMarker(context, points, currentIndex, width);
  }, [frameImage, points, currentIndex, heatmap, showHeatmap, showFullPath, showGlitches]);

  return (
    <Box sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.900', lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        data-testid="trail-canvas"
        aria-label="Salamander trail drawn over the first video frame"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </Box>
  );
}

function forEachVisibleSegment(points, lastIndex, drawSegment) {
  for (let index = 1; index <= lastIndex && index < points.length; index++) {
    const from = points[index - 1];
    const to = points[index];
    if (isTracked(from) && isTracked(to)) drawSegment(from, to, index);
  }
}

function drawGlitchMarks(context, points, lastIndex, frameWidth) {
  const armLength = Math.max(3, frameWidth / 160);
  context.strokeStyle = GLITCH_COLOR;
  context.lineWidth = Math.max(1.5, frameWidth / 400);
  for (let index = 0; index <= lastIndex && index < points.length; index++) {
    const point = points[index];
    if (!point.glitch) continue;
    context.beginPath();
    context.moveTo(point.x - armLength, point.y - armLength);
    context.lineTo(point.x + armLength, point.y + armLength);
    context.moveTo(point.x + armLength, point.y - armLength);
    context.lineTo(point.x - armLength, point.y + armLength);
    context.stroke();
  }
}

function drawHeatmap(context, heatmap) {
  const { cols, cellSize, counts, max } = heatmap;
  for (let cellIndex = 0; cellIndex < counts.length; cellIndex++) {
    if (counts[cellIndex] === 0) continue;
    const centerX = (cellIndex % cols) * cellSize + cellSize / 2;
    const centerY = Math.floor(cellIndex / cols) * cellSize + cellSize / 2;
    const intensity = Math.pow(counts[cellIndex] / max, 0.6);
    const radius = cellSize * 1.6;
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    glow.addColorStop(0, `rgba(255, 120, 40, ${0.65 * intensity})`);
    glow.addColorStop(1, 'rgba(255, 120, 40, 0)');
    context.fillStyle = glow;
    context.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
  }
}

function drawCurrentMarker(context, points, currentIndex, frameWidth) {
  const current = points[currentIndex];
  if (!current) return;
  const radius = Math.max(5, frameWidth / 70);

  if (isTracked(current)) {
    context.fillStyle = '#ff1744';
    context.strokeStyle = '#ffffff';
    context.lineWidth = radius / 3;
    context.beginPath();
    context.arc(current.x, current.y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    return;
  }

  // Missing or glitched in this sample: ring the last place it was reliably seen.
  const lastSeen = findLastTracked(points, currentIndex);
  if (!lastSeen) return;
  context.setLineDash([radius / 2, radius / 2]);
  context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  context.lineWidth = radius / 4;
  context.beginPath();
  context.arc(lastSeen.x, lastSeen.y, radius * 1.6, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);
}

function findLastTracked(points, beforeIndex) {
  for (let index = beforeIndex; index >= 0; index--) {
    if (isTracked(points[index])) return points[index];
  }
  return null;
}

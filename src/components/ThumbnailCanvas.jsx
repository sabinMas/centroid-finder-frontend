// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { binarize } from '../lib/centroid/binarize.js';
import { findLargestCentroid } from '../lib/centroid/index.js';

const CENTROID_DOT_COLOR = '#ff1744';
const THUMBNAIL_LOAD_ERROR =
  "Couldn't load this video's first frame. Make sure the backend is running and ffmpeg is installed.";

/**
 * @param {{ thumbnailUrl: string, targetColorHex: string, threshold: number }} props
 */
export function ThumbnailCanvas({ thumbnailUrl, targetColorHex, threshold }) {
  const originalCanvasRef = useRef(null);
  const binaryCanvasRef = useRef(null);
  const [sourceImageData, setSourceImageData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(function loadThumbnailImage() {
    let isCurrentLoad = true;
    const image = new Image();

    image.onload = function handleImageLoad() {
      if (!isCurrentLoad) return;
      const originalCanvas = originalCanvasRef.current;
      originalCanvas.width = image.naturalWidth;
      originalCanvas.height = image.naturalHeight;
      const originalContext = originalCanvas.getContext('2d', { willReadFrequently: true });
      originalContext.drawImage(image, 0, 0);
      setLoadError(null);
      setSourceImageData(originalContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight));
    };
    image.onerror = function handleImageError() {
      if (!isCurrentLoad) return;
      setSourceImageData(null);
      setLoadError(THUMBNAIL_LOAD_ERROR);
    };
    image.src = thumbnailUrl;

    return function ignoreStaleLoad() {
      isCurrentLoad = false;
    };
  }, [thumbnailUrl]);

  useEffect(function drawBinarizedPreview() {
    if (!sourceImageData) return;

    const { width, height } = sourceImageData;
    const binaryCanvas = binaryCanvasRef.current;
    binaryCanvas.width = width;
    binaryCanvas.height = height;
    const binaryContext = binaryCanvas.getContext('2d');
    const binaryImageData = binaryContext.createImageData(width, height);

    const binary = binarize(sourceImageData, targetColorHex, threshold);
    for (let pixelIndex = 0; pixelIndex < binary.length; pixelIndex++) {
      const shade = binary[pixelIndex] === 1 ? 255 : 0;
      const offset = pixelIndex * 4;
      binaryImageData.data[offset] = shade;
      binaryImageData.data[offset + 1] = shade;
      binaryImageData.data[offset + 2] = shade;
      binaryImageData.data[offset + 3] = 255;
    }
    binaryContext.putImageData(binaryImageData, 0, 0);

    const centroid = findLargestCentroid(sourceImageData, targetColorHex, threshold);
    if (centroid) {
      // Scale the dot with the frame so it stays visible once the canvas is shrunk to fit.
      const dotRadius = Math.max(4, Math.round(width / 100));
      binaryContext.fillStyle = CENTROID_DOT_COLOR;
      binaryContext.beginPath();
      binaryContext.arc(centroid.x, centroid.y, dotRadius, 0, Math.PI * 2);
      binaryContext.fill();
    }
  }, [sourceImageData, targetColorHex, threshold]);

  return (
    <Box>
      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <FramePanel label="Original" canvasRef={originalCanvasRef} />
        <FramePanel label="Binarized" canvasRef={binaryCanvasRef} testId="thumbnail-canvas" />
      </Box>
    </Box>
  );
}

function FramePanel({ label, canvasRef, testId }) {
  return (
    <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <canvas
        ref={canvasRef}
        data-testid={testId}
        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
      />
    </Box>
  );
}

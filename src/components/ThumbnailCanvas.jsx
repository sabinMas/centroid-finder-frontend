// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { findLargestCentroid } from '../lib/centroid/index.js';

const CENTROID_DOT_RADIUS = 4;
const CENTROID_DOT_COLOR = '#ff1744';

/**
 * Distance from one RGB triple to another, for the live binarized preview drawn
 * in this component. Independent of sabinMas-dev's lib/centroid/binarize.js,
 * which findLargestCentroid below calls separately.
 */
function colorDistance(red, green, blue, targetRed, targetGreen, targetBlue) {
  const redDiff = red - targetRed;
  const greenDiff = green - targetGreen;
  const blueDiff = blue - targetBlue;
  return Math.sqrt(redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff);
}

/**
 * @param {{ thumbnailUrl: string, targetColorHex: string, threshold: number }} props
 */
export function ThumbnailCanvas({ thumbnailUrl, targetColorHex, threshold }) {
  const originalCanvasRef = useRef(null);
  const binaryCanvasRef = useRef(null);
  const [sourceImageData, setSourceImageData] = useState(null);

  useEffect(function loadThumbnailImage() {
    const image = new Image();
    image.src = thumbnailUrl;
    image.onload = function handleImageLoad() {
      const originalCanvas = originalCanvasRef.current;
      originalCanvas.width = image.naturalWidth;
      originalCanvas.height = image.naturalHeight;
      const originalContext = originalCanvas.getContext('2d');
      originalContext.drawImage(image, 0, 0);
      setSourceImageData(originalContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight));
    };
  }, [thumbnailUrl]);

  useEffect(function drawBinarizedPreview() {
    if (!sourceImageData) return;

    const binaryCanvas = binaryCanvasRef.current;
    binaryCanvas.width = sourceImageData.width;
    binaryCanvas.height = sourceImageData.height;
    const binaryContext = binaryCanvas.getContext('2d');
    const binaryImageData = binaryContext.createImageData(sourceImageData.width, sourceImageData.height);

    const targetRed = parseInt(targetColorHex.slice(0, 2), 16);
    const targetGreen = parseInt(targetColorHex.slice(2, 4), 16);
    const targetBlue = parseInt(targetColorHex.slice(4, 6), 16);

    for (let pixelIndex = 0; pixelIndex < sourceImageData.data.length; pixelIndex += 4) {
      const red = sourceImageData.data[pixelIndex];
      const green = sourceImageData.data[pixelIndex + 1];
      const blue = sourceImageData.data[pixelIndex + 2];
      const distance = colorDistance(red, green, blue, targetRed, targetGreen, targetBlue);
      const shade = distance < threshold ? 255 : 0;
      binaryImageData.data[pixelIndex] = shade;
      binaryImageData.data[pixelIndex + 1] = shade;
      binaryImageData.data[pixelIndex + 2] = shade;
      binaryImageData.data[pixelIndex + 3] = 255;
    }
    binaryContext.putImageData(binaryImageData, 0, 0);

    const centroid = findLargestCentroid(sourceImageData, targetColorHex, threshold);
    if (centroid) {
      binaryContext.fillStyle = CENTROID_DOT_COLOR;
      binaryContext.beginPath();
      binaryContext.arc(centroid.x, centroid.y, CENTROID_DOT_RADIUS, 0, Math.PI * 2);
      binaryContext.fill();
    }
  }, [sourceImageData, targetColorHex, threshold]);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Original
        </Typography>
        <canvas ref={originalCanvasRef} style={{ maxWidth: '100%', display: 'block' }} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Binarized
        </Typography>
        <canvas ref={binaryCanvasRef} data-testid="thumbnail-canvas" style={{ maxWidth: '100%', display: 'block' }} />
      </Box>
    </Box>
  );
}

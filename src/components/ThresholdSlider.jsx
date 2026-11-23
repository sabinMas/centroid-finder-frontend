// Slider for the color-distance threshold used by the live binarized preview.
import { Box, Slider, Typography } from '@mui/material';

/**
 * @param {{ value: number, onChange: (value: number) => void }} props
 */
export function ThresholdSlider({ value, onChange }) {
  function handleSliderChange(event, newValue) {
    onChange(newValue);
  }

  return (
    <Box>
      <Typography gutterBottom>Threshold: {value}</Typography>
      <Slider min={0} max={255} value={value} onChange={handleSliderChange} valueLabelDisplay="auto" />
    </Box>
  );
}

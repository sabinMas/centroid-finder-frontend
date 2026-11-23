// Hex color input for choosing the target color that the centroid search looks for.
import { Box, Typography } from '@mui/material';

/**
 * @param {{ valueHex: string, onChange: (hex: string) => void }} props
 */
export function ColorPicker({ valueHex, onChange }) {
  function handleColorChange(event) {
    const selectedHex = event.target.value.replace('#', '').toUpperCase();
    onChange(selectedHex);
  }

  return (
    <Box>
      <Typography gutterBottom>Target Color</Typography>
      <Box
        component="input"
        type="color"
        value={`#${valueHex}`}
        onChange={handleColorChange}
        sx={{
          width: 56,
          height: 56,
          padding: 0,
          border: 'none',
          borderRadius: 2,
          cursor: 'pointer',
        }}
      />
    </Box>
  );
}

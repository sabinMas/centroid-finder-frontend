// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';

/**
 * Renders a single clickable video entry on the Video Chooser page.
 *
 * @param {{ filename: string, onClick: (filename: string) => void }} props
 */
export function VideoListItem({ filename, onClick }) {
  function handleClick() {
    onClick(filename);
  }

  return (
    <ListItemButton onClick={handleClick} divider>
      <ListItemIcon>
        <MovieIcon color="primary" />
      </ListItemIcon>
      <ListItemText primary={filename} />
    </ListItemButton>
  );
}

// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.

/**
 * Renders a single clickable video entry on the Video Chooser page.
 *
 * @param {{ filename: string, onClick: (filename: string) => void }} props
 */
export function VideoListItem({ filename, onClick }) {
  // TODO(onjamm-dev): style with MUI (ListItemButton, etc.), call onClick(filename).
  return <div onClick={() => onClick(filename)}>{filename}</div>;
}

// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, LinearProgress, Stack } from '@mui/material';

/**
 * Displays the current status of a processing job, and links to the result CSV and its
 * trail replay once done.
 *
 * @param {{ status: 'processing' | 'done' | 'error' | null, result?: string, error?: string, replayPath?: string }} props
 */
export function JobStatusPanel({ status, result, error, replayPath }) {
  if (!status) return null;

  if (status === 'processing') {
    return (
      <Stack spacing={1}>
        <Alert severity="info">Processing video...</Alert>
        <LinearProgress />
      </Stack>
    );
  }

  if (status === 'error') {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Alert
      severity="success"
      action={
        <Stack direction="row" spacing={1}>
          {replayPath && (
            <Button color="inherit" size="small" variant="outlined" component={RouterLink} to={replayPath}>
              Watch trail replay
            </Button>
          )}
          <Button color="inherit" size="small" href={result} target="_blank" rel="noreferrer">
            Download CSV
          </Button>
        </Stack>
      }
    >
      Processing complete.
    </Alert>
  );
}

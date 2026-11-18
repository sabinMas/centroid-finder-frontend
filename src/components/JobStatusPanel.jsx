// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.
import { Alert, Button, LinearProgress, Stack } from '@mui/material';

/**
 * Displays the current status of a processing job, and a link to the result CSV once done.
 *
 * @param {{ status: 'processing' | 'done' | 'error' | null, result?: string, error?: string }} props
 */
export function JobStatusPanel({ status, result, error }) {
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
        <Button color="inherit" size="small" href={result} target="_blank" rel="noreferrer">
          Download CSV
        </Button>
      }
    >
      Processing complete.
    </Alert>
  );
}

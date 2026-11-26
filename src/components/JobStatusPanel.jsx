// Shows the state of a backend processing job (in progress, done, or failed).
import { Alert, Button, LinearProgress, Stack } from '@mui/material';
import { isSafeResultLink } from '../lib/resultLink.js';

/**
 * Displays the current status of a processing job, and a link to the result CSV once done.
 * The link is only shown when it has the form /results/<uuid>.csv; anything else is treated
 * as a bad server response instead of being put in an href.
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

  if (!isSafeResultLink(result)) {
    return <Alert severity="error">The server finished the job but sent an invalid result link.</Alert>;
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

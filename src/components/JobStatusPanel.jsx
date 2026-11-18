// OWNED BY onjamm-dev. See TASKS.md "onjamm's tasks" before editing.

/**
 * Displays the current status of a processing job, and a link to the result CSV once done.
 *
 * @param {{ status: 'processing' | 'done' | 'error' | null, result?: string, error?: string }} props
 */
export function JobStatusPanel({ status, result, error }) {
  // TODO(onjamm-dev): style with MUI (Alert/LinearProgress/Link), handle all 3 states + null.
  if (!status) return null;
  if (status === 'processing') return <div>Processing...</div>;
  if (status === 'error') return <div>Error: {error}</div>;
  return (
    <a href={result} target="_blank" rel="noreferrer">
      Download result CSV
    </a>
  );
}

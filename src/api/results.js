/**
 * Downloads a finished job's result CSV as text.
 *
 * @param {string} resultUrl - the `result` path from a done job status, e.g. "/results/<jobId>.csv"
 * @returns {Promise<string>} the raw CSV text
 */
export async function getResultCsv(resultUrl) {
  const res = await fetch(resultUrl);
  if (!res.ok) {
    throw new Error(`Couldn't download the results (status ${res.status})`);
  }
  return res.text();
}

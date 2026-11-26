// Checks the CSV link the server returns for a finished job before it goes into an href.
// The only valid shape is the one the backend produces: /results/<job uuid>.csv.

const RESULT_LINK_PATTERN = /^\/results\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.csv$/i;

/**
 * Says whether a result link is safe to use as a download href. A value such as
 * "javascript:..." or "https://elsewhere.example/x.csv" is rejected, so a wrong or
 * tampered response cannot send the user anywhere else.
 *
 * @param {unknown} result - the `result` field of a finished job's status
 * @returns {boolean} true only for "/results/<uuid>.csv"
 */
export function isSafeResultLink(result) {
  return typeof result === 'string' && RESULT_LINK_PATTERN.test(result);
}

// Unit tests for fetchJson in src/api/client.js, the one helper every API call
// goes through. These pin down how success, backend errors and empty bodies are
// turned into return values or thrown Errors, which the pages rely on to show
// messages to the user.

import { expect } from 'chai';
import { fetchJson } from '../../src/api/client.js';
import { jsonResponse, stubFetch } from './testDoubles.js';

describe('fetchJson', () => {
  let fetchStub;

  afterEach(() => {
    fetchStub?.restore();
    fetchStub = undefined;
  });

  it('returns the parsed JSON body for a 2xx response', async () => {
    fetchStub = stubFetch(jsonResponse(['a.mp4', 'b.mp4']));
    expect(await fetchJson('/api/videos')).to.deep.equal(['a.mp4', 'b.mp4']);
  });

  it('passes the path and options straight through to fetch', async () => {
    fetchStub = stubFetch(jsonResponse({ ok: true }));
    const options = { method: 'POST' };
    await fetchJson('/some/path', options);
    expect(fetchStub.calls).to.deep.equal([{ url: '/some/path', options }]);
  });

  it("throws with the backend's { error } message on a non-2xx response", async () => {
    fetchStub = stubFetch(jsonResponse({ error: 'Video not found' }, 404));
    await expectRejection(fetchJson('/api/videos'), 'Video not found');
  });

  it('throws a generic message with the path and status when a non-2xx response has no body', async () => {
    fetchStub = stubFetch(new Response(null, { status: 500 }));
    await expectRejection(fetchJson('/api/videos'), 'Request to /api/videos failed with status 500');
  });

  it('throws the generic message when a non-2xx JSON body has no error field', async () => {
    fetchStub = stubFetch(jsonResponse({ message: 'nope' }, 400));
    await expectRejection(fetchJson('/x'), 'Request to /x failed with status 400');
  });

  it('returns null for a 204 No Content response', async () => {
    fetchStub = stubFetch(new Response(null, { status: 204 }));
    expect(await fetchJson('/x')).to.equal(null);
  });

  it('returns null for a 2xx response whose body is not JSON', async () => {
    fetchStub = stubFetch(new Response('<html>ok</html>', { status: 200, headers: { 'Content-Type': 'text/html' } }));
    expect(await fetchJson('/x')).to.equal(null);
  });

  it('lets a network failure from fetch itself reject unchanged', async () => {
    const previousFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };
    try {
      await expectRejection(fetchJson('/x'), 'Failed to fetch');
    } finally {
      globalThis.fetch = previousFetch;
    }
  });
});

/**
 * Asserts that `promise` rejects with an Error whose message is exactly `message`.
 * chai has no built-in async matcher without the chai-as-promised plugin, and Wave 5
 * forbids new dependencies, so this small helper does the job.
 *
 * @param {Promise<unknown>} promise
 * @param {string} message - the expected Error message
 */
async function expectRejection(promise, message) {
  try {
    await promise;
  } catch (error) {
    expect(error).to.be.instanceOf(Error);
    expect(error.message).to.equal(message);
    return;
  }
  expect.fail(`expected the promise to reject with "${message}", but it resolved`);
}

// Small hand-written test doubles for the browser APIs our src/ code uses.
// Mocha runs in Node, which has no `window.localStorage`, and we don't want a real
// network call in a unit test, so these fakes stand in for both. They are
// hand-written (instead of using sinon or jsdom) because Wave 5 forbids new npm
// dependencies.

/**
 * An in-memory stand-in for the Web Storage API (`window.localStorage`).
 * Only the methods recentJobs.js calls are implemented. The `failOn` option makes a
 * method throw, which is how private browsing and full-quota storage behave.
 */
export class FakeStorage {
  /**
   * @param {{ failOn?: Array<'getItem' | 'setItem' | 'removeItem'> }} [options]
   *   names of methods that should throw instead of working
   */
  constructor({ failOn = [] } = {}) {
    /** @type {Map<string, string>} */
    this.items = new Map();
    this.failOn = new Set(failOn);
  }

  /**
   * Throws a DOMException-like error if `method` was listed in `failOn`.
   *
   * @param {string} method
   */
  maybeFail(method) {
    if (this.failOn.has(method)) {
      const error = new Error(`localStorage.${method} is unavailable`);
      error.name = 'SecurityError';
      throw error;
    }
  }

  /**
   * @param {string} key
   * @returns {string | null} the stored string, or null when the key is missing (like the real API)
   */
  getItem(key) {
    this.maybeFail('getItem');
    return this.items.has(key) ? this.items.get(key) : null;
  }

  /**
   * @param {string} key
   * @param {string} value - coerced to a string, as the real API does
   */
  setItem(key, value) {
    this.maybeFail('setItem');
    this.items.set(key, String(value));
  }

  /** @param {string} key */
  removeItem(key) {
    this.maybeFail('removeItem');
    this.items.delete(key);
  }
}

/**
 * Installs `storage` as `globalThis.window.localStorage` and returns a function that
 * puts the previous `window` back. recentJobs.js reads `window.localStorage` on every
 * call, so swapping the global between tests is enough to isolate them.
 *
 * @param {FakeStorage} storage
 * @returns {() => void} restore function, call it in afterEach
 */
export function installFakeLocalStorage(storage) {
  const hadWindow = 'window' in globalThis;
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: storage };
  return () => {
    if (hadWindow) {
      globalThis.window = previousWindow;
    } else {
      delete globalThis.window;
    }
  };
}

/**
 * Replaces `globalThis.fetch` with a stub that records every call and answers with
 * `response`. Returns the list of recorded calls and a restore function.
 *
 * Node 18+ ships a real `Response` class, so tests build real responses with it and
 * the code under test sees exactly what a browser's fetch would return.
 *
 * @param {Response | (() => Response)} response - a Response, or a factory for one
 *   (a Response body can only be read once, so use a factory when fetch runs twice)
 * @returns {{ calls: Array<{ url: string, options: RequestInit | undefined }>, restore: () => void }}
 */
export function stubFetch(response) {
  const previousFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return typeof response === 'function' ? response() : response;
  };
  return {
    calls,
    restore: () => {
      globalThis.fetch = previousFetch;
    },
  };
}

/**
 * Builds a JSON Response with the given status, the way an Express `res.status(n).json(...)` would.
 *
 * @param {unknown} body - any JSON-serializable value
 * @param {number} [status=200]
 * @returns {Response}
 */
export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const PREFIX = "cinesearch:cache:";
const memory = new Map();
const inflight = new Map();

const now = () => Date.now();

const readStorage = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry.savedAt !== "number") return null;
    return entry;
  } catch {
    return null;
  }
};

const writeStorage = (key, entry) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage can be full or blocked; the in-memory cache still works.
  }
};

export const getCached = (key) => {
  const entry = memory.get(key) || readStorage(key);
  if (!entry) return null;
  const stale = typeof entry.expiresAt === "number" && entry.expiresAt < now();
  if (!memory.has(key)) memory.set(key, entry);
  return { value: entry.value, stale };
};

export const setCached = (key, value, ttlMs) => {
  const entry = {
    value,
    savedAt: now(),
    expiresAt: ttlMs ? now() + ttlMs : 0,
  };
  memory.set(key, entry);
  writeStorage(key, entry);
};

/**
 * Fetch with a memory + localStorage cache and in-flight de-duplication.
 * Expired entries are still returned when the network fails, so repeat visits
 * and offline reloads stay instant.
 */
export const cachedRequest = (key, ttlMs, fetcher) => {
  const cached = getCached(key);
  if (cached && !cached.stale) return Promise.resolve(cached.value);

  if (inflight.has(key)) return inflight.get(key);

  const promise = fetcher()
    .then((value) => {
      setCached(key, value, ttlMs);
      return value;
    })
    .catch((error) => {
      if (cached) return cached.value;
      throw error;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
};

export const clearApiCache = () => {
  memory.clear();
  if (typeof window === "undefined") return;
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage errors.
  }
};

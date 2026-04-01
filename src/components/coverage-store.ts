const COVERAGE_CACHE_PREFIX = '__vp_theme_coverage__';
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

type CoverageRecord = {
  data: unknown;
  expiresAt: number;
};

const memoryCache = new Map<string, CoverageRecord>();

const getCacheKey = (path: string) => `${COVERAGE_CACHE_PREFIX}:${path}`;

const readFromSessionStorage = (path: string): CoverageRecord | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const rawValue = window.sessionStorage.getItem(getCacheKey(path));
  if (!rawValue) {
    return null;
  }
  try {
    const parsed = JSON.parse(rawValue) as CoverageRecord;
    if (!parsed || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeToSessionStorage = (path: string, record: CoverageRecord) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(getCacheKey(path), JSON.stringify(record));
  } catch {
    // no-op: storage full or disabled
  }
};

const isExpired = (record: CoverageRecord) => {
  return record.expiresAt <= Date.now();
};

export const getCoverageSummary = async (path: string, cacheTtlMs?: number) => {
  if (!path) {
    return null;
  }
  const ttl = typeof cacheTtlMs === 'number' ? Math.max(0, cacheTtlMs) : DEFAULT_CACHE_TTL_MS;
  const memoryRecord = memoryCache.get(path);
  if (memoryRecord && !isExpired(memoryRecord)) {
    return memoryRecord.data;
  }
  const storageRecord = readFromSessionStorage(path);
  if (storageRecord && !isExpired(storageRecord)) {
    memoryCache.set(path, storageRecord);
    return storageRecord.data;
  }
  const response = await fetch(path);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  const nextRecord: CoverageRecord = {
    data,
    expiresAt: Date.now() + ttl,
  };
  memoryCache.set(path, nextRecord);
  writeToSessionStorage(path, nextRecord);
  return data;
};

export const clearCoverageSummaryCache = (path?: string) => {
  if (path) {
    memoryCache.delete(path);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(getCacheKey(path));
    }
    return;
  }
  memoryCache.clear();
  if (typeof window === 'undefined') {
    return;
  }
  Object.keys(window.sessionStorage)
    .filter((key) => key.startsWith(`${COVERAGE_CACHE_PREFIX}:`))
    .forEach((key) => {
      window.sessionStorage.removeItem(key);
    });
};

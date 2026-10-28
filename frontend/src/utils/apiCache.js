/**
 * JobOne In-Memory API Cache & In-Flight Request Deduplicator
 * Provides safe in-memory caching with TTL for public static endpoints (categories, public stats)
 * and eliminates duplicate concurrent requests.
 */

const cache = new Map();
const inFlightRequests = new Map();

/**
 * Perform a cached GET request or return existing in-flight promise.
 *
 * @param {import('axios').AxiosStatic} axiosInstance
 * @param {string} url
 * @param {object} options Axios config options
 * @param {number} ttlMs Cache validity duration in milliseconds (default: 2 minutes)
 * @returns {Promise<any>}
 */
export const cachedGet = async (axiosInstance, url, options = {}, ttlMs = 120000) => {
  const paramsKey = options.params ? JSON.stringify(options.params) : "";
  const cacheKey = `${url}?${paramsKey}`;
  const now = Date.now();

  // 1. Check existing cached data within TTL
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (now - entry.timestamp < ttlMs) {
      return entry.data;
    }
    cache.delete(cacheKey);
  }

  // 2. Check if identical request is currently in-flight (Deduplication)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 3. Dispatch fresh network request and share promise
  const requestPromise = axiosInstance
    .get(url, options)
    .then((response) => {
      cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      inFlightRequests.delete(cacheKey);
      return response.data;
    })
    .catch((error) => {
      inFlightRequests.delete(cacheKey);
      throw error;
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * Manually clear the in-memory cache
 */
export const clearApiCache = () => {
  cache.clear();
  inFlightRequests.clear();
};

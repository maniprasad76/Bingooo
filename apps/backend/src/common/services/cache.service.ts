// ─────────────────────────────────────────────────────────
// In-Memory TTL Cache Service
// Caches API responses with configurable TTL per key
// ─────────────────────────────────────────────────────────

interface CacheEntry {
  data: any;
  expiresAt: number;
}

class CacheServiceImpl {
  private cache = new Map<string, CacheEntry>();
  private maxEntries = 500;

  /** Get cached value, or null if expired / missing */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /** Store value with TTL in milliseconds */
  set(key: string, data: any, ttlMs: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /** Invalidate all entries whose key starts with the given prefix */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /** Invalidate a single key */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /** Clear all cached entries */
  clear(): void {
    this.cache.clear();
  }

  /** Get cache statistics */
  stats() {
    let validCount = 0;
    const now = Date.now();
    for (const entry of this.cache.values()) {
      if (entry.expiresAt > now) validCount++;
    }
    return {
      totalEntries: this.cache.size,
      validEntries: validCount,
      maxEntries: this.maxEntries,
    };
  }
}

// Singleton instance
export const cacheService = new CacheServiceImpl();

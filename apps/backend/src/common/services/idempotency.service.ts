import { Injectable } from '@nestjs/common';

interface IdempotentRecord {
  statusCode: number;
  data: any;
  headers?: Record<string, string>;
  createdAt: number;
  inFlight?: boolean;
}

@Injectable()
export class IdempotencyService {
  private readonly store = new Map<string, IdempotentRecord>();
  private readonly TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

  /**
   * Check if a key is already registered or in-flight
   */
  get(key: string): IdempotentRecord | null {
    this.cleanExpired();
    const record = this.store.get(key);
    if (!record) return null;

    if (Date.now() - record.createdAt > this.TTL_MS) {
      this.store.delete(key);
      return null;
    }

    return record;
  }

  /**
   * Acquire a processing lock for a key. Returns true if acquired, false if already in flight or done.
   */
  acquireLock(key: string): boolean {
    this.cleanExpired();
    const existing = this.store.get(key);
    if (existing) {
      return false;
    }

    this.store.set(key, {
      statusCode: 0,
      data: null,
      createdAt: Date.now(),
      inFlight: true,
    });
    return true;
  }

  /**
   * Cache final response against the idempotency key
   */
  set(key: string, statusCode: number, data: any, headers?: Record<string, string>): void {
    this.store.set(key, {
      statusCode,
      data,
      headers,
      createdAt: Date.now(),
      inFlight: false,
    });
  }

  /**
   * Release lock if operation fails
   */
  releaseLock(key: string): void {
    const record = this.store.get(key);
    if (record && record.inFlight) {
      this.store.delete(key);
    }
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now - record.createdAt > this.TTL_MS) {
        this.store.delete(key);
      }
    }
  }
}

export const idempotencyService = new IdempotencyService();

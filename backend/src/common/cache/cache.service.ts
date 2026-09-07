import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface MemoryCacheEntry {
  value: string;
  expiresAt: number | null;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: Redis | null = null;
  private readonly memoryCache = new Map<string, MemoryCacheEntry>();
  private useRedis = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
    const redisUrl = this.configService.get<string>('REDIS_URL');

    try {
      const client = redisUrl 
        ? new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 }) 
        : new Redis({
            host: redisHost,
            port: redisPort,
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            connectTimeout: 2000,
          });

      client.on('error', (err) => {
        this.logger.warn(`Redis connection error: ${err.message}. Using resilient in-memory cache fallback.`);
        this.useRedis = false;
      });

      client.on('connect', () => {
        this.logger.log(`Connected to Redis cache layer at ${redisHost}:${redisPort}`);
        this.useRedis = true;
      });

      await client.connect().catch((err) => {
        this.logger.warn(`Redis server not available (${err.message}). Defaulting to in-memory caching.`);
        this.useRedis = false;
      });

      this.redisClient = client;
    } catch (err: any) {
      this.logger.warn(`Redis initialization failed (${err.message}). Running on in-memory cache.`);
      this.useRedis = false;
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
      } catch (err) {
        // ignore on shutdown
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.useRedis && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err: any) {
        this.logger.warn(`Redis get failed for key ${key}: ${err.message}. Checking memory fallback.`);
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return JSON.parse(entry.value);
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);

    if (this.useRedis && this.redisClient) {
      try {
        if (ttlSeconds > 0) {
          await this.redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, serialized);
        }
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set failed for key ${key}: ${err.message}. Storing in memory.`);
      }
    }

    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value: serialized, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    if (this.useRedis && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err: any) {
        this.logger.warn(`Redis delByPattern failed for pattern ${pattern}: ${err.message}`);
      }
    }

    // In-memory pattern matching
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}

/**
 * Redis Cache Implementation
 * For high-traffic production use
 * 
 * Installation: npm install ioredis
 * 
 * Add to .env:
 * REDIS_HOST=localhost
 * REDIS_PORT=6379
 * REDIS_PASSWORD=your_password (optional)
 * USE_REDIS=true
 */

const logger = require('../config/logger');

let redis = null;
let isRedisAvailable = false;

// Try to initialize Redis if enabled
if (process.env.USE_REDIS === 'true') {
    try {
        const Redis = require('ioredis');
        
        redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true
        });

        redis.on('connect', () => {
            logger.info('Redis connected successfully');
            isRedisAvailable = true;
        });

        redis.on('error', (err) => {
            logger.error('Redis connection error:', err);
            isRedisAvailable = false;
        });

        redis.on('close', () => {
            logger.warn('Redis connection closed');
            isRedisAvailable = false;
        });

        // Connect to Redis
        redis.connect().catch(err => {
            logger.error('Failed to connect to Redis:', err);
            isRedisAvailable = false;
        });

    } catch (error) {
        logger.warn('Redis not available, falling back to in-memory cache:', error.message);
        redis = null;
        isRedisAvailable = false;
    }
}

// Fallback in-memory cache
const memoryCache = new Map();

// Cleanup memory cache every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, item] of memoryCache.entries()) {
        if (now > item.expiresAt) {
            memoryCache.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Get value from cache
 */
async function get(key) {
    try {
        if (isRedisAvailable && redis) {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        }
    } catch (error) {
        logger.error('Redis get error:', error);
    }

    // Fallback to memory cache
    const item = memoryCache.get(key);
    if (item && Date.now() <= item.expiresAt) {
        return item.value;
    }
    return null;
}

/**
 * Set value in cache with TTL
 */
async function set(key, value, ttl = 120) {
    try {
        if (isRedisAvailable && redis) {
            await redis.setex(key, ttl, JSON.stringify(value));
            return true;
        }
    } catch (error) {
        logger.error('Redis set error:', error);
    }

    // Fallback to memory cache
    const expiresAt = Date.now() + (ttl * 1000);
    memoryCache.set(key, { value, expiresAt });
    return true;
}

/**
 * Delete value from cache
 */
async function del(key) {
    try {
        if (isRedisAvailable && redis) {
            await redis.del(key);
            return true;
        }
    } catch (error) {
        logger.error('Redis delete error:', error);
    }

    // Fallback to memory cache
    memoryCache.delete(key);
    return true;
}

/**
 * Clear all cache
 */
async function clear() {
    try {
        if (isRedisAvailable && redis) {
            await redis.flushdb();
            return true;
        }
    } catch (error) {
        logger.error('Redis clear error:', error);
    }

    // Fallback to memory cache
    memoryCache.clear();
    return true;
}

/**
 * Get cache statistics
 */
async function getStats() {
    if (isRedisAvailable && redis) {
        try {
            const info = await redis.info('stats');
            return {
                type: 'redis',
                connected: true,
                info
            };
        } catch (error) {
            return {
                type: 'redis',
                connected: false,
                error: error.message
            };
        }
    }

    return {
        type: 'memory',
        size: memoryCache.size,
        connected: true
    };
}

module.exports = {
    get,
    set,
    delete: del,
    clear,
    getStats,
    isRedisAvailable: () => isRedisAvailable
};

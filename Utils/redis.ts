import { createClient, RedisClientType } from 'redis';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

// Redis client instance
let redisClient: RedisClientType | null = null;

// Initialize Redis client
const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    console.log('🔄 Initializing Redis client...');
    
    // Create Redis client with optimized configuration
    redisClient = createClient({
      url: process.env.NEXT_PUBLIC_REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            console.error('❌ Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000,
        },
      // Optimize for large data transfers
      commandsQueueMaxLength: 1000,
      disableOfflineQueue: false,
    });

    // Handle connection events
    redisClient.on('error', (err: Error) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis Client Disconnected');
    });

    // Connect to Redis
    await redisClient.connect();
  }
  
  return redisClient;
};

// Cache keys
export const CACHE_KEYS = {
  VEHICLES: 'vehicles',
  VEHICLES_CHUNK: 'vehicles_chunk_',
  FILTER_OPTIONS: 'filter_options',
  METADATA: 'metadata',
} as const;

// Cache TTL values (in seconds) - 24 hours
export const CACHE_TTL = {
  VEHICLES: 86400, // 24 hours
  FILTER_OPTIONS: 86400, // 24 hours
  METADATA: 86400, // 24 hours
} as const;

// Vehicle data cache functions with compression
export const getCachedVehicles = async (page?: number, pageSize?: number): Promise<{ vehicles: any[], total: number }> => {
  try {
    const client = await getRedisClient();
    const data = await client.get(CACHE_KEYS.VEHICLES);
    
    if (!data) {
      console.log(`🔍 getCachedVehicles: no data found`);
      return { vehicles: [], total: 0 };
    }

    let parsedVehicles: any[];
    
    // Try to decompress first (new format)
    try {
      const decompressedData = await gunzipAsync(Buffer.from(data, 'base64'));
      parsedVehicles = JSON.parse(decompressedData.toString());
      console.log(`🔍 getCachedVehicles: ${parsedVehicles.length} vehicles (decompressed)`);
    } catch (decompressError) {
      // Fallback to old format (uncompressed JSON)
      console.log('🔄 Falling back to uncompressed format');
      parsedVehicles = JSON.parse(data);
      console.log(`🔍 getCachedVehicles: ${parsedVehicles.length} vehicles (uncompressed)`);
    }
    
    // Apply pagination if requested
    if (page && pageSize) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedVehicles = parsedVehicles.slice(startIndex, endIndex);
      console.log(`🔍 getCachedVehicles: returning page ${page} (${paginatedVehicles.length}/${parsedVehicles.length} vehicles)`);
      return { vehicles: paginatedVehicles, total: parsedVehicles.length };
    }
    
    return { vehicles: parsedVehicles, total: parsedVehicles.length };
  } catch (error) {
    console.error('Error getting cached vehicles:', error);
    return { vehicles: [], total: 0 };
  }
};

export const setCachedVehicles = async (vehicles: any[], ttl?: number): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    
    // Compress the data before storing
    const jsonData = JSON.stringify(vehicles);
    const compressedData = await gzipAsync(jsonData);
    const base64Data = compressedData.toString('base64');
    
    const result = await client.setEx(
      CACHE_KEYS.VEHICLES,
      ttl || CACHE_TTL.VEHICLES,
      base64Data
    );
    
    console.log(`💾 setCachedVehicles: ${vehicles.length} vehicles (compressed), result: ${result}`);
    return result === 'OK';
  } catch (error) {
    console.error('Error setting cached vehicles:', error);
    return false;
  }
};

export const getCachedMetadata = async (): Promise<any | null> => {
  try {
    const client = await getRedisClient();
    const metadata = await client.get(CACHE_KEYS.METADATA);
    const parsedMetadata = metadata ? JSON.parse(metadata) : null;
    console.log(`🔍 getCachedMetadata: ${parsedMetadata ? 'exists' : 'null'}`);
    return parsedMetadata;
  } catch (error) {
    console.error('Error getting cached metadata:', error);
    return null;
  }
};

export const setCachedMetadata = async (metadata: any, ttl?: number): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    const result = await client.setEx(
      CACHE_KEYS.METADATA,
      ttl || CACHE_TTL.METADATA,
      JSON.stringify(metadata)
    );
    console.log(`💾 setCachedMetadata: setting metadata, result: ${result}`);
    return result === 'OK';
  } catch (error) {
    console.error('Error setting cached metadata:', error);
    return false;
  }
};

// Filter options cache functions
export const getCachedFilterOptions = async (): Promise<any | null> => {
  try {
    const client = await getRedisClient();
    const options = await client.get(CACHE_KEYS.FILTER_OPTIONS);
    return options ? JSON.parse(options) : null;
  } catch (error) {
    console.error('Error getting cached filter options:', error);
    return null;
  }
};

export const setCachedFilterOptions = async (options: any, ttl?: number): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    const result = await client.setEx(
      CACHE_KEYS.FILTER_OPTIONS,
      ttl || CACHE_TTL.FILTER_OPTIONS,
      JSON.stringify(options)
    );
    return result === 'OK';
  } catch (error) {
    console.error('Error setting cached filter options:', error);
    return false;
  }
};

// Cache management functions
export const clearCache = async (): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    await client.flushDb();
    console.log('🗑️ clearCache: cleared all cache');
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

export const clearFilterOptionsCache = async (): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    await client.del(CACHE_KEYS.FILTER_OPTIONS);
    console.log('🗑️ clearFilterOptionsCache: cleared filter options');
    return true;
  } catch (error) {
    console.error('Error clearing filter options cache:', error);
    return false;
  }
};

export const getCacheStats = async () => {
  try {
    const client = await getRedisClient();
    const info = await client.info();
    const keys = await client.dbSize();
    return { info, keys };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { info: null, keys: 0 };
  }
};

export const getCacheKeys = async (): Promise<string[]> => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys('*');
    return keys;
  } catch (error) {
    console.error('Error getting cache keys:', error);
    return [];
  }
};

// Check if cache has data
export const hasCachedData = async (): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    const exists = await client.exists(CACHE_KEYS.VEHICLES);
    console.log(`🔍 hasCachedData: ${exists === 1}`);
    return exists === 1;
  } catch (error) {
    console.error('Error checking cached data:', error);
    return false;
  }
};

// Get cache info
export const getCacheInfo = async () => {
  try {
    const client = await getRedisClient();
    const hasVehicles = await client.exists(CACHE_KEYS.VEHICLES);
    const hasMetadata = await client.exists(CACHE_KEYS.METADATA);
    const hasFilterOptions = await client.exists(CACHE_KEYS.FILTER_OPTIONS);
    const vehicleResult = await getCachedVehicles();
    const vehicleCount = vehicleResult.vehicles.length;
    const keys = await client.dbSize();
    
    console.log(`📊 getCacheInfo: vehicles=${hasVehicles}, metadata=${hasMetadata}, count=${vehicleCount}, totalKeys=${keys}`);
    
    return {
      hasVehicles: hasVehicles === 1,
      hasMetadata: hasMetadata === 1,
      hasFilterOptions: hasFilterOptions === 1,
      vehicleCount,
      totalKeys: keys,
      isConnected: client.isReady
    };
  } catch (error) {
    console.error('Error getting cache info:', error);
    return {
      hasVehicles: false,
      hasMetadata: false,
      hasFilterOptions: false,
      vehicleCount: 0,
      totalKeys: 0,
      isConnected: false
    };
  }
};

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('🔌 Redis connection closed gracefully');
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
    redisClient = null;
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeRedisConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeRedisConnection();
  process.exit(0);
}); 
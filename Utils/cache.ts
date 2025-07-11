import NodeCache from 'node-cache';

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Use global variable to maintain cache instance across module reloads in development
declare global {
  var __vehicleCache: NodeCache | undefined;
  var __vehicleCacheInitialized: boolean | undefined;
}

// Create or get the global cache instance
const getCacheInstance = (): NodeCache => {
  if (!global.__vehicleCache || !global.__vehicleCacheInitialized) {
    console.log('🔄 Initializing new cache instance...');
    global.__vehicleCache = new NodeCache({
      stdTTL: 86400, // 24 hours default TTL
      checkperiod: 3600, // Check for expired keys every 1 hour
      useClones: false, // Better performance
    });
    global.__vehicleCacheInitialized = true;
  }
  return global.__vehicleCache;
};

// Cache keys
export const CACHE_KEYS = {
  VEHICLES: 'vehicles',
  FILTER_OPTIONS: 'filter_options',
  METADATA: 'metadata',
} as const;

// Cache TTL values (in seconds) - 24 hours
export const CACHE_TTL = {
  VEHICLES: 86400, // 24 hours
  FILTER_OPTIONS: 86400, // 24 hours
  METADATA: 86400, // 24 hours
} as const;

// Vehicle data cache functions
export const getCachedVehicles = () => {
  const cache = getCacheInstance();
  const vehicles = cache.get(CACHE_KEYS.VEHICLES) as any[] || [];
  console.log(`🔍 getCachedVehicles: ${vehicles.length} vehicles, serverless: ${isServerless}`);
  return vehicles;
};

export const setCachedVehicles = (vehicles: any[], ttl?: number) => {
  const cache = getCacheInstance();
  console.log(`💾 setCachedVehicles: ${vehicles.length} vehicles, serverless: ${isServerless}`);
  return cache.set(CACHE_KEYS.VEHICLES, vehicles, ttl || CACHE_TTL.VEHICLES);
};

export const getCachedMetadata = () => {
  const cache = getCacheInstance();
  const metadata = cache.get(CACHE_KEYS.METADATA) as any || null;
  console.log(`🔍 getCachedMetadata: ${metadata ? 'exists' : 'null'}, serverless: ${isServerless}`);
  return metadata;
};

export const setCachedMetadata = (metadata: any, ttl?: number) => {
  const cache = getCacheInstance();
  console.log(`💾 setCachedMetadata: setting metadata, serverless: ${isServerless}`);
  return cache.set(CACHE_KEYS.METADATA, metadata, ttl || CACHE_TTL.METADATA);
};

// Filter options cache functions
export const getCachedFilterOptions = () => {
  const cache = getCacheInstance();
  return cache.get(CACHE_KEYS.FILTER_OPTIONS) as any || null;
};

export const setCachedFilterOptions = (options: any, ttl?: number) => {
  const cache = getCacheInstance();
  return cache.set(CACHE_KEYS.FILTER_OPTIONS, options, ttl || CACHE_TTL.FILTER_OPTIONS);
};

// Cache management functions
export const clearCache = () => {
  const cache = getCacheInstance();
  console.log('🗑️ clearCache: clearing all cache');
  return cache.flushAll();
};

export const clearFilterOptionsCache = () => {
  const cache = getCacheInstance();
  console.log('🗑️ clearFilterOptionsCache: clearing only filter options');
  return cache.del(CACHE_KEYS.FILTER_OPTIONS);
};

export const getCacheStats = () => {
  const cache = getCacheInstance();
  return cache.getStats();
};

export const getCacheKeys = () => {
  const cache = getCacheInstance();
  return cache.keys();
};

// Check if cache has data
export const hasCachedData = () => {
  const cache = getCacheInstance();
  const hasData = cache.has(CACHE_KEYS.VEHICLES);
  console.log(`🔍 hasCachedData: ${hasData}, serverless: ${isServerless}`);
  return hasData;
};

// Get cache info
export const getCacheInfo = () => {
  const cache = getCacheInstance();
  const stats = cache.getStats();
  const keys = cache.keys();
  const hasVehicles = cache.has(CACHE_KEYS.VEHICLES);
  const hasMetadata = cache.has(CACHE_KEYS.METADATA);
  const hasFilterOptions = cache.has(CACHE_KEYS.FILTER_OPTIONS);
  const vehicleCount = getCachedVehicles().length;
  
  console.log(`📊 getCacheInfo: vehicles=${hasVehicles}, metadata=${hasMetadata}, count=${vehicleCount}, serverless: ${isServerless}`);
  
  return {
    stats,
    keys,
    hasVehicles,
    hasMetadata,
    hasFilterOptions,
    vehicleCount,
    isServerless,
    cacheInstanceId: global.__vehicleCacheInitialized ? 'initialized' : 'not_initialized'
  };
}; 
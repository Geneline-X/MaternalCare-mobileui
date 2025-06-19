import AsyncStorage from "@react-native-async-storage/async-storage"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // TTL in milliseconds
}

export class CacheManager {
  // Store data in AsyncStorage with a TTL
  static async set<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl }
      await AsyncStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.error(`Error setting cache for ${key}:`, error)
    }
  }

  // Retrieve data from AsyncStorage if not expired
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key)
      if (!value) return null

      const entry: CacheEntry<T> = JSON.parse(value)
      if (Date.now() - entry.timestamp < entry.ttl) {
        return entry.data
      } else {
        // Cache expired, remove it
        await AsyncStorage.removeItem(key)
        return null
      }
    } catch (error) {
      console.error(`Error getting cache for ${key}:`, error)
      // If JSON parsing fails, remove the corrupted cache entry
      try {
        await AsyncStorage.removeItem(key)
      } catch (removeError) {
        console.error(`Error removing corrupted cache for ${key}:`, removeError)
      }
      return null
    }
  }

  // Check if cache exists and is valid without retrieving data
  static async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key)
      if (!value) return false

      const entry: CacheEntry<any> = JSON.parse(value)
      return Date.now() - entry.timestamp < entry.ttl
    } catch (error) {
      console.error(`Error checking cache existence for ${key}:`, error)
      return false
    }
  }

  // Clear specific cache key
  static async clear(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.error(`Error clearing cache for ${key}:`, error)
    }
  }

  // Clear all cache
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      console.error("Error clearing all cache:", error)
    }
  }

  // Clear expired cache entries
  static async clearExpired(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const expiredKeys: string[] = []

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          try {
            const entry: CacheEntry<any> = JSON.parse(value)
            if (Date.now() - entry.timestamp >= entry.ttl) {
              expiredKeys.push(key)
            }
          } catch (parseError) {
            // If parsing fails, consider it expired
            expiredKeys.push(key)
          }
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys)
        console.log(`Cleared ${expiredKeys.length} expired cache entries`)
      }
    } catch (error) {
      console.error("Error clearing expired cache:", error)
    }
  }

  // Generate cache key with parameters
  static async generateKey(endpoint: string, params: Record<string, any> = {}): Promise<string> {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
    return `${endpoint}${paramString ? `:${paramString}` : ""}`
  }

  // Get cache size information
  static async getCacheInfo(): Promise<{ totalKeys: number; estimatedSize: string }> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      let totalSize = 0

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          totalSize += value.length
        }
      }

      return {
        totalKeys: keys.length,
        estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`,
      }
    } catch (error) {
      console.error("Error getting cache info:", error)
      return { totalKeys: 0, estimatedSize: "0 KB" }
    }
  }
}

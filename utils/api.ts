"use client"

import { useAuth } from "@clerk/clerk-expo"
import { useCallback } from "react"
import type { ApiResponse, ApiError } from "../types/api"
import { CacheManager } from "./cacheManager"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://maternalcare-backend.onrender.com"

// Default cache TTLs (in milliseconds)
const DEFAULT_CACHE_TTLS = {
  GET: 5 * 60 * 1000, // 5 minutes for GET requests
  POST: 0, // No caching for POST requests
  PUT: 0, // No caching for PUT requests
  DELETE: 0, // No caching for DELETE requests
}

export class ApiClient {
  private baseURL: string
  private getToken: () => Promise<string | null>

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    cacheOptions?: { ttl?: number; forceRefresh?: boolean },
  ): Promise<ApiResponse<T>> {
    const method = options.method || "GET"
    const shouldCache = method === "GET" && !cacheOptions?.forceRefresh
    const cacheTTL = cacheOptions?.ttl || DEFAULT_CACHE_TTLS[method as keyof typeof DEFAULT_CACHE_TTLS] || 0

    // Generate cache key for GET requests
    let cacheKey = ""
    if (shouldCache && cacheTTL > 0) {
      const url = new URL(`${this.baseURL}${endpoint}`)
      cacheKey = await CacheManager.generateKey(url.pathname, Object.fromEntries(url.searchParams))

      // Try to get from cache first
      const cachedData = await CacheManager.get<ApiResponse<T>>(cacheKey)
      if (cachedData) {
        console.log(`Cache hit for ${endpoint}`)
        return cachedData
      }
    }

    try {
      const token = await this.getToken()

      const config: RequestInit = {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      }

      console.log(`Making API request to ${endpoint}`)
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // Handle wrapped responses from backend
      let responseData = data
      if (data && typeof data === "object" && "success" in data) {
        if (!data.success) {
          throw new Error(data.message || "API request failed")
        }
        responseData = data.data || data
      }

      // Cache successful GET responses
      if (shouldCache && cacheTTL > 0 && cacheKey) {
        await CacheManager.set(cacheKey, responseData, cacheTTL)
        console.log(`Cached response for ${endpoint}`)
      }

      return {
        success: true,
        data: responseData,
        timestamp: data.timestamp || new Date().toISOString(),
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)

      // Return a more specific error response
      const apiError: ApiError = {
        success: false,
        error: error instanceof Error ? error.name : "Unknown Error",
        message: error instanceof Error ? error.message : "An unknown error occurred",
        timestamp: new Date().toISOString(),
      }

      throw apiError
    }
  }

  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    cacheOptions?: { ttl?: number; forceRefresh?: boolean },
  ): Promise<ApiResponse<T>> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return this.request<T>(url, { method: "GET" }, cacheOptions)
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    // Clear related cache entries on POST
    await this.invalidateRelatedCache(endpoint)

    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    // Clear related cache entries on PUT
    await this.invalidateRelatedCache(endpoint)

    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    // Clear related cache entries on DELETE
    await this.invalidateRelatedCache(endpoint)

    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }

  // Helper method to invalidate related cache entries
  private async invalidateRelatedCache(endpoint: string): Promise<void> {
    try {
      // Extract the base resource from the endpoint
      const resourceMatch = endpoint.match(/\/api\/fhir\/(\w+)/)
      if (resourceMatch) {
        const resource = resourceMatch[1]
        // Clear cache entries that might be related to this resource
        const patterns = [
          `/api/fhir/${resource}`,
          `/api/fhir/${resource.toLowerCase()}`,
          "/api/fhir/dashboard", // Dashboard data might be affected
        ]

        for (const pattern of patterns) {
          await CacheManager.clear(await CacheManager.generateKey(pattern))
        }
      }
    } catch (error) {
      console.error("Error invalidating cache:", error)
    }
  }

  // Method to clear all cache
  async clearCache(): Promise<void> {
    await CacheManager.clearAll()
  }

  // Method to clear expired cache
  async clearExpiredCache(): Promise<void> {
    await CacheManager.clearExpired()
  }
}

export const useApiClient = () => {
  const { getToken } = useAuth()

  return useCallback(() => {
    return new ApiClient(API_BASE_URL, getToken)
  }, [getToken])()
}

// Legacy export for backward compatibility
export const apiClient = {
  getPatients: async () => {
    // Mock implementation for backward compatibility
    return []
  },
}

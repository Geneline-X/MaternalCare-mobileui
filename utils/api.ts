"use client"

import { useAuth } from "@clerk/clerk-expo"
import { useCallback } from "react"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://maternalcare-backend.onrender.com"

// Request queue to prevent simultaneous identical requests
const requestQueue = new Map<string, Promise<any>>()

// Rate limiting: track request timestamps
const requestTimestamps: number[] = []
const MAX_REQUESTS_PER_MINUTE = 30
const RATE_LIMIT_WINDOW = 60000 // 1 minute

function isRateLimited(): boolean {
  const now = Date.now()
  // Remove timestamps older than 1 minute
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW) {
    requestTimestamps.shift()
  }

  return requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE
}

function addRequestTimestamp(): void {
  requestTimestamps.push(Date.now())
}

// Delay function for spacing requests
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class ApiClient {
  private baseURL: string
  private getToken: () => Promise<string | null>

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL
    this.getToken = getToken
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Check rate limiting
    if (isRateLimited()) {
      console.warn("Rate limit reached, waiting...")
      await delay(2000) // Wait 2 seconds
    }

    // Create request key for deduplication
    const requestKey = `${options.method || "GET"}-${endpoint}-${JSON.stringify(options.body || {})}`

    // Check if identical request is already in progress
    if (requestQueue.has(requestKey)) {
      console.log(`Deduplicating request: ${requestKey}`)
      return requestQueue.get(requestKey)!
    }

    // Create the request promise
    const requestPromise = this.executeRequest<T>(endpoint, options)

    // Store in queue
    requestQueue.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      // Remove from queue when done
      requestQueue.delete(requestKey)
    }
  }

  private async executeRequest<T>(endpoint: string, options: RequestInit): Promise<T> {
    try {
      // Add to rate limiting tracker
      addRequestTimestamp()

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

      // Add small delay between requests to be respectful
      await delay(100)

      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(`Rate limited. Please wait before making more requests.`)
        }
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint}`)
        }
        if (response.status >= 500) {
          throw new Error(`Server error (${response.status}). Please try again later.`)
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return this.request<T>(url.pathname + url.search, { method: "GET" })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }
}

export const useApiClient = () => {
  const { getToken } = useAuth()

  return useCallback(() => {
    return new ApiClient(API_BASE_URL, getToken)
  }, [getToken])()
}

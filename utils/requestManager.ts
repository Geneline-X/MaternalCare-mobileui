"use client"

// Global request manager to coordinate API calls across screens
class RequestManager {
  private static instance: RequestManager
  private activeRequests = new Set<string>()
  private requestQueue: Array<{
    key: string
    execute: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []
  private isProcessing = false

  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager()
    }
    return RequestManager.instance
  }

  async queueRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already active, wait for it
    if (this.activeRequests.has(key)) {
      console.log(`Request ${key} already active, waiting...`)
      await this.waitForRequest(key)
    }

    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        key,
        execute: requestFn,
        resolve,
        reject,
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!

      try {
        this.activeRequests.add(request.key)
        console.log(`Processing request: ${request.key}`)

        const result = await request.execute()
        request.resolve(result)

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Request ${request.key} failed:`, error)
        request.reject(error)
      } finally {
        this.activeRequests.delete(request.key)
      }
    }

    this.isProcessing = false
  }

  private async waitForRequest(key: string): Promise<void> {
    while (this.activeRequests.has(key)) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  isRequestActive(key: string): boolean {
    return this.activeRequests.has(key)
  }
}

export const requestManager = RequestManager.getInstance()

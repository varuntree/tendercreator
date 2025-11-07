type RequestStatus = "queued" | "processing" | "completed" | "failed";

interface QueuedRequest<T = any> {
  id: string;
  execute: () => Promise<T>;
  status: RequestStatus;
  result?: T;
  error?: Error;
  timestamp: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private delayBetweenRequests: number = 2000; // 2 seconds default

  /**
   * Add request to queue
   */
  async enqueue<T>(
    id: string,
    execute: () => Promise<T>
  ): Promise<T> {
    const request: QueuedRequest<T> = {
      id,
      execute,
      status: "queued",
      timestamp: Date.now(),
    };

    this.queue.push(request);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    // Wait for this specific request to complete
    return new Promise((resolve, reject) => {
      const checkStatus = setInterval(() => {
        const req = this.queue.find((r) => r.id === id);
        if (!req) {
          clearInterval(checkStatus);
          reject(new Error("Request not found in queue"));
          return;
        }

        if (req.status === "completed") {
          clearInterval(checkStatus);
          resolve(req.result as T);
        } else if (req.status === "failed") {
          clearInterval(checkStatus);
          reject(req.error);
        }
      }, 100);
    });
  }

  /**
   * Process queue with delay between requests
   */
  private async processQueue() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const request = this.queue.find((r) => r.status === "queued");
      if (!request) break;

      request.status = "processing";

      try {
        console.log(`[RequestQueue] Processing request: ${request.id}`);
        request.result = await request.execute();
        request.status = "completed";
        console.log(`[RequestQueue] Completed request: ${request.id}`);
      } catch (error) {
        console.error(`[RequestQueue] Failed request: ${request.id}`, error);
        request.error = error as Error;
        request.status = "failed";
      }

      // Remove completed/failed requests after 1 minute (for status checking)
      setTimeout(() => {
        this.queue = this.queue.filter((r) => r.id !== request.id);
      }, 60000);

      // Delay before next request (rate limit safety)
      if (this.queue.some((r) => r.status === "queued")) {
        console.log(
          `[RequestQueue] Waiting ${this.delayBetweenRequests}ms before next request`
        );
        await this.delay(this.delayBetweenRequests);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      total: this.queue.length,
      queued: this.queue.filter((r) => r.status === "queued").length,
      processing: this.queue.filter((r) => r.status === "processing").length,
      completed: this.queue.filter((r) => r.status === "completed").length,
      failed: this.queue.filter((r) => r.status === "failed").length,
    };
  }

  /**
   * Set delay between requests (for rate limit management)
   */
  setDelay(ms: number) {
    this.delayBetweenRequests = ms;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const requestQueue = new RequestQueue();

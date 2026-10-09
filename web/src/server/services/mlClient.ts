import { env } from "../config.ts";
import { logger } from "../logger.ts";

type CircuitState = "closed" | "open" | "half_open";

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();
  private readonly threshold = 5;
  private readonly timeout = 60000;
  private readonly halfOpenSuccessThreshold = 2;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "half_open";
      this.successCount = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    if (this.state === "half_open") {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.state = "closed";
        logger.info("Circuit breaker closed after successful requests");
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = "open";
      this.nextAttempt = Date.now() + this.timeout;
      logger.warn(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  getState() {
    return this.state;
  }
}

const circuitBreaker = new CircuitBreaker();

export type MLClientOptions = {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
};

export type HealthCheckResult = {
  status: "ok" | "error";
  detail?: string;
  latency_ms?: number;
};

export async function checkMlService(): Promise<HealthCheckResult> {
  try {
    const start = Date.now();
    const healthy = await mlHealthCheck();
    const latency = Date.now() - start;
    if (healthy) {
      return { status: "ok", latency_ms: latency };
    }
    return { status: "error", detail: "ML service returned unhealthy" };
  } catch (error) {
    return { status: "error", detail: error instanceof Error ? error.message : "unknown" };
  }
}

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }) {
  const { timeout = 10000, ...fetchOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function mlRequest<T>(
  path: string,
  options: MLClientOptions & { method?: string; body?: unknown } = {}
): Promise<T> {
  const { timeout = 10000, retries = 3, retryDelay = 1000, method = "GET", body } = options;
  const baseUrl = (env.ML_SERVICE_URL || "http://localhost:8000").replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${baseUrl}${normalizedPath}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await circuitBreaker.execute(async () => {
        const response = await fetchWithTimeout(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
          timeout,
        });

        if (!response.ok) {
          throw new Error(`ML service returned ${response.status}: ${response.statusText}`);
        }

        return response.json();
      });

      return result as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`ML request failed (attempt ${attempt + 1}/${retries}): ${lastError.message}`);

      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("ML request failed");
}

export async function mlHealthCheck(): Promise<boolean> {
  try {
    await mlRequest("/health", { timeout: 5000, retries: 1 });
    return true;
  } catch {
    return false;
  }
}

export function getCircuitBreakerState(): CircuitState {
  return circuitBreaker.getState();
}

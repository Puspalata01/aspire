import { env } from "@/server/config";
import { httpErrors } from "@/server/core/errors";

const ML_TIMEOUT_MS = 10_000;
const HEALTH_TIMEOUT_MS = 1_500;

function mlUrl(path: string): string {
  const base = env.ML_SERVICE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function mlFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = mlUrl(path);
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: init?.signal ?? AbortSignal.timeout(ML_TIMEOUT_MS) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw httpErrors.mlInference(`ML service unreachable at ${url}: ${detail}`);
  }
  if (!response.ok) {
    throw httpErrors.mlInference(`ML service returned HTTP ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}

export type MlCheck = { status: "connected" | "unreachable"; detail?: string };

export async function checkMlService(): Promise<MlCheck> {
  try {
    const response = await fetch(mlUrl("/health"), { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) });
    if (!response.ok) return { status: "unreachable", detail: `HTTP ${response.status}` };
    return { status: "connected" };
  } catch (error) {
    return { status: "unreachable", detail: error instanceof Error ? error.message : String(error) };
  }
}

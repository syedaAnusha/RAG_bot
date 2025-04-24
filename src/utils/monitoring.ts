/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

// Simple in-memory storage for metrics
// In production, you'd want to use a proper monitoring service
const metrics = {
  totalRequests: 0,
  failedRequests: 0,
  avgResponseTime: 0,
  documentStats: new Map<string, number>(), // filename -> access count
  embeddingStats: {
    totalTokens: 0,
    totalEmbeddings: 0,
  },
};

export interface MonitoringStats {
  requestDuration: number;
  success: boolean;
  endpoint: string;
  documentId?: string;
  error?: string;
  tokensUsed?: number;
}

export function trackRequest(stats: MonitoringStats) {
  metrics.totalRequests++;
  if (!stats.success) {
    metrics.failedRequests++;
  }

  // Update average response time
  metrics.avgResponseTime =
    (metrics.avgResponseTime * (metrics.totalRequests - 1) +
      stats.requestDuration) /
    metrics.totalRequests;

  // Track document access
  if (stats.documentId) {
    const currentCount = metrics.documentStats.get(stats.documentId) || 0;
    metrics.documentStats.set(stats.documentId, currentCount + 1);
  }

  // Track embedding statistics
  if (stats.tokensUsed) {
    metrics.embeddingStats.totalTokens += stats.tokensUsed;
    metrics.embeddingStats.totalEmbeddings++;
  }

  // Log the event
  console.log({
    timestamp: new Date().toISOString(),
    ...stats,
  });
}

export function getMetrics() {
  return {
    ...metrics,
    documentStats: Object.fromEntries(metrics.documentStats),
    successRate:
      ((metrics.totalRequests - metrics.failedRequests) /
        metrics.totalRequests) *
      100,
  };
}

export async function withMonitoring<T>(
  req: NextRequest,
  endpoint: string,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await handler();
    trackRequest({
      requestDuration: Date.now() - startTime,
      success: true,
      endpoint,
    });
    return result;
  } catch (error: any) {
    trackRequest({
      requestDuration: Date.now() - startTime,
      success: false,
      endpoint,
      error: error.message,
    });
    throw error;
  }
}

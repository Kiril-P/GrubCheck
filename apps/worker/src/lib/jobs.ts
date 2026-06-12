import { getDbOrThrow, createSyncRun, getRunningSyncRun, updateSyncRun } from "@grubcheck/db";
import type { SyncJob } from "@grubcheck/domain";

type JobStats = Record<string, number>;

export const runTrackedJob = async <T extends JobStats>(
  job: SyncJob,
  handler: (context: {
    runId: string;
    cursor: number;
    stats: T;
    updateProgress: (cursor: number, patch?: Partial<T>) => Promise<void>;
  }) => Promise<T>
) => {
  const db = getDbOrThrow();
  const running = await getRunningSyncRun(db, job);
  const runId = running?.id ?? `${job}-${Date.now()}`;
  const initialStats = (running?.stats ?? {}) as T;

  if (!running) {
    await createSyncRun(db, {
      id: runId,
      job,
      status: "running",
      cursor: 0,
      stats: initialStats,
      startedAt: new Date()
    });
  }

  try {
    const stats = await handler({
      runId,
      cursor: running?.cursor ?? 0,
      stats: initialStats,
      updateProgress: async (cursor, patch) => {
        await updateSyncRun(db, runId, {
          cursor,
          stats: {
            ...initialStats,
            ...(patch ?? {})
          }
        });
      }
    });

    await updateSyncRun(db, runId, {
      status: "succeeded",
      finishedAt: new Date(),
      stats
    });

    return {
      runId,
      resumed: Boolean(running),
      stats
    };
  } catch (error) {
    await updateSyncRun(db, runId, {
      status: "failed",
      finishedAt: new Date(),
      errorMessage: error instanceof Error ? error.message : "Unknown job failure"
    });
    throw error;
  }
};


import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  RUST_ASSET_DUMP_DIR: z.string().optional(),
  ASSET_STORAGE_BASE_URL: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional()
});

export const workerEnv = envSchema.parse(process.env);

export const hasS3Config = () =>
  Boolean(
    workerEnv.S3_BUCKET &&
      workerEnv.S3_REGION &&
      workerEnv.S3_ACCESS_KEY_ID &&
      workerEnv.S3_SECRET_ACCESS_KEY
  );


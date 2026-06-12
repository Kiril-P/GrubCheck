import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { workerEnv, hasS3Config } from "../config";

const s3Client = hasS3Config()
  ? new S3Client({
      region: workerEnv.S3_REGION!,
      ...(workerEnv.S3_ENDPOINT ? { endpoint: workerEnv.S3_ENDPOINT } : {}),
      forcePathStyle: Boolean(workerEnv.S3_ENDPOINT),
      credentials: {
        accessKeyId: workerEnv.S3_ACCESS_KEY_ID!,
        secretAccessKey: workerEnv.S3_SECRET_ACCESS_KEY!
      }
    })
  : null;

const joinUrl = (baseUrl: string, key: string) => `${baseUrl.replace(/\/+$/, "")}/${key}`;

export const uploadAsset = async (
  key: string,
  filePath: string,
  contentType: string
) => {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return undefined;
  }

  if (s3Client && workerEnv.S3_BUCKET) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: workerEnv.S3_BUCKET,
        Key: key,
        Body: new Uint8Array(await file.arrayBuffer()),
        ContentType: contentType
      })
    );
  }

  return workerEnv.ASSET_STORAGE_BASE_URL
    ? joinUrl(workerEnv.ASSET_STORAGE_BASE_URL, key)
    : undefined;
};

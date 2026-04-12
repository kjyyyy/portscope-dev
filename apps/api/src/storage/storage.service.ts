import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? 'portscope-documents';
    this.s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
      region: process.env.S3_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
      },
      forcePathStyle: true,
    });
  }

  async upload(key: string, body: Buffer, contentType = 'application/pdf'): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.log(`Uploaded ${key} to ${this.bucket}`);
    return key;
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(prefix = '', maxKeys = 100): Promise<{ key: string; size: number; lastModified: Date | null }[]> {
    const result = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      }),
    );
    return (result.Contents ?? []).map((obj) => ({
      key: obj.Key ?? '',
      size: obj.Size ?? 0,
      lastModified: obj.LastModified ?? null,
    }));
  }

  async download(key: string): Promise<Buffer> {
    const result = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const stream = result.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  get bucketName(): string {
    return this.bucket;
  }

  get endpoint(): string {
    return process.env.S3_ENDPOINT ?? 'http://localhost:9000';
  }
}

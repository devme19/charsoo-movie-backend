import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class B2Service {
  private s3: S3Client;
  private bucketName = process.env.B2_BUCKET_NAME || 'CHARSOOMOVIE';
  private bucketUrl =
    process.env.B2_BUCKET_URL ||
    'https://f005.backblazeb2.com/file/CHARSOOMOVIE';

  constructor() {
    this.s3 = new S3Client({
      endpoint: 'https://s3.us-east-005.backblazeb2.com',
      region: 'us-east-005',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID || '005206317aeb5010000000001',
        secretAccessKey:
          process.env.B2_APP_KEY || 'K005om+zdd+fOJpu7AwI3p/7ValSLsQ',
      },
      forcePathStyle: true,
    });
  }

  /** آپلود یک فایل کوچک (کاور یا تصویر) */
  async uploadFile(fileBuffer: Buffer, fileName: string, contentType: string) {
    if (!fileBuffer || !fileName)
      throw new BadRequestException('اطلاعات فایل معتبر نیست');

    const key = `${uuidv4()}-${fileName}`;
    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        }),
      );
      return { key, publicUrl: `${this.bucketUrl}/${key}` };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در آپلود فایل');
    }
  }

  /** شروع آپلود چندبخشی */
  async initiateMultipartUpload(fileName: string, contentType: string) {
    if (!fileName) throw new BadRequestException('نام فایل الزامی است');

    const key = `${uuidv4()}-${fileName}`;
    try {
      const response = await this.s3.send(
        new CreateMultipartUploadCommand({
          Bucket: this.bucketName,
          Key: key,
          ContentType: contentType,
        }),
      );
      return { uploadId: response.UploadId!, key };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در شروع آپلود');
    }
  }

  /** آپلود یک Part */
  async uploadPart(
    uploadId: string,
    partNumber: number,
    key: string,
    chunk: Buffer,
  ) {
    if (!uploadId || !partNumber || !key || !chunk) {
      throw new BadRequestException('پارامترهای ناقص برای آپلود قطعه');
    }

    try {
      const response = await this.s3.send(
        new UploadPartCommand({
          Bucket: this.bucketName,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: chunk,
        }),
      );
      return { ETag: response.ETag!.replace(/"/g, ''), PartNumber: partNumber };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در آپلود قطعه');
    }
  }

  /** تکمیل آپلود چندبخشی */
  async completeMultipartUpload(
    uploadId: string,
    key: string,
    parts: { ETag: string; PartNumber: number | string }[],
  ) {
    if (!uploadId || !key || !parts || parts.length === 0) {
      throw new BadRequestException('پارامترهای ناقص برای تکمیل آپلود');
    }

    try {
      const normalizedParts = parts.map((p) => ({
        ETag: p.ETag.replace(/"/g, ''), // حذف کوتیشن‌های اضافه
        PartNumber: Number(p.PartNumber), // مطمئن بشه عدد باشه
      }));
      console.log('Normalized Parts:', normalizedParts);
      const result = await this.s3.send(
        new CompleteMultipartUploadCommand({
          Bucket: this.bucketName,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: normalizedParts,
          },
        }),
      );

      return {
        key,
        publicUrl: this.getPublicUrl(key),
        message: 'آپلود کامل شد',
        result,
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در تکمیل آپلود');
    }
  }

  /** لغو آپلود چندبخشی */
  async abortMultipartUpload(uploadId: string, key: string) {
    if (!uploadId || !key) throw new BadRequestException('پارامتر ناقص');

    try {
      await this.s3.send(
        new AbortMultipartUploadCommand({
          Bucket: this.bucketName,
          Key: key,
          UploadId: uploadId,
        }),
      );
      return { message: 'آپلود لغو شد' };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در لغو آپلود');
    }
  }

  /** لینک دانلود خصوصی */
  async getPresignedUrl(key: string, expiresInSeconds = 3600) {
    if (!key) throw new BadRequestException('کلید فایل الزامی است');
    try {
      return await getSignedUrl(
        this.s3,
        new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
        { expiresIn: expiresInSeconds },
      );
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در ساخت لینک دانلود');
    }
  }

  /** لینک عمومی */
  getPublicUrl(key: string) {
    if (!key) throw new BadRequestException('کلید فایل الزامی است');
    return `${this.bucketUrl}/${key}`;
  }

  /** استریم فایل */
  async streamFile(key: string): Promise<Readable> {
    if (!key) throw new BadRequestException('کلید فایل الزامی است');

    try {
      const response = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
      return response.Body as Readable;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در استریم فایل');
    }
  }

  /** لیست فایل‌ها */
  async listFiles(prefix?: string) {
    try {
      const response = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucketName, Prefix: prefix }),
      );

      return (
        response.Contents?.map((item) => ({
          key: item.Key!,
          size: item.Size ?? 0,
        })) || []
      );
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در لیست فایل‌ها');
    }
  }

  /** حذف فایل */
  async deleteFile(key: string) {
    if (!key) throw new BadRequestException('کلید فایل الزامی است');

    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }),
      );
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در حذف فایل');
    }
  }
}

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  transform(files: unknown): [Express.Multer.File, Express.Multer.File] {
    if (!Array.isArray(files) || files.length < 2) {
      throw new BadRequestException('ویدیو و کاور الزامی است');
    }

    if (!this.isMulterFile(files[0]) || !this.isMulterFile(files[1])) {
      throw new BadRequestException('فایل‌های ارسال شده معتبر نیستند');
    }

    // ✅ خروجی با نوع دقیق
    return [files[0], files[1]];
  }

  private isMulterFile(file: unknown): file is Express.Multer.File {
    return (
      typeof file === 'object' &&
      file !== null &&
      'buffer' in file &&
      'originalname' in file &&
      'mimetype' in file &&
      Buffer.isBuffer((file as { buffer: unknown }).buffer)
    );
  }
}

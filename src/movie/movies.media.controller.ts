import {
  Controller,
  Post,
  Body,
  InternalServerErrorException,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { B2Service } from 'src/commons/b2/b2.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from 'src/movie/entity/movie.entity';
import { Actor } from 'src/actor/entity/actor.entity';
import { CreateMovieDto } from 'src/movie/dto/create-movie.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('movies/media')
export class MovieMediaController {
  constructor(
    private readonly b2Service: B2Service,
    @InjectRepository(Movie)
    private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Actor)
    private readonly actorRepo: Repository<Actor>,
  ) {}

  // ======================
  // مرحله ۱: ایجاد آپلود چندبخشی (initiate)
  // ======================
  @Post('upload/initiate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async initiateUpload(
    @Body() body: { fileName: string; contentType: string },
  ) {
    if (!body.fileName || !body.contentType) {
      throw new BadRequestException('نام فایل و نوع محتوا الزامی است');
    }

    try {
      const result = await this.b2Service.initiateMultipartUpload(
        body.fileName,
        body.contentType,
      );
      console.log('INIT response from B2:', result);
      return result; // شامل uploadId و key
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در ایجاد آپلود');
    }
  }

  // ======================
  // مرحله ۲: ارسال قطعه
  // ======================
  @Post('upload/chunk')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() chunk: Express.Multer.File,
    @Body()
    body: {
      uploadId: string;
      partNumber: number;
      key: string;
    },
  ) {
    if (!chunk || !body.uploadId || !body.partNumber || !body.key) {
      throw new BadRequestException('اطلاعات ناقص است');
    }

    try {
      console.log('CHUNK request:', body);
      const result = await this.b2Service.uploadPart(
        body.uploadId,
        body.partNumber,
        body.key,
        chunk.buffer,
      );
      console.log('CHUNK response from B2:', result);
      return result; // شامل ETag و PartNumber
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در ارسال قطعه');
    }
  }

  // ======================
  // مرحله ۳: تکمیل آپلود
  // ======================
  @Post('upload/complete')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async completeUpload(
    @Body()
    body: {
      uploadId: string;
      key: string;
      parts: { ETag: string; PartNumber: number | string }[];
      movieData: CreateMovieDto;
    },
  ) {
    try {
      console.log('Movie Data:', body.movieData);
      console.log('Parts:', body.parts);
      console.log('uploadId:', body.uploadId);
      console.log('COMPLETE request:', body);
      // تکمیل آپلود ویدیو
      const videoUpload = await this.b2Service.completeMultipartUpload(
        body.uploadId,
        body.key,
        body.parts,
      );
      console.log('COMPLETE response from B2:', videoUpload);
      // مدیریت بازیگران
      let actors: Actor[] = [];
      if (
        Array.isArray(body.movieData.actors) &&
        body.movieData.actors.length > 0
      ) {
        actors = await Promise.all(
          body.movieData.actors.map(
            async (actorData: { id?: string; name?: string }) => {
              let actor: Actor | null = null;
              if (actorData.id)
                actor = await this.actorRepo.findOneBy({ id: actorData.id });
              if (!actor && actorData.name) {
                actor = await this.actorRepo.findOneBy({
                  name: actorData.name,
                });
              }
              if (!actor && actorData.name) {
                actor = this.actorRepo.create({ name: actorData.name });
                actor = await this.actorRepo.save(actor);
              }
              return actor!;
            },
          ),
        );
      }

      // ایجاد فیلم جدید
      const movie = this.movieRepo.create({
        ...body.movieData,
        videoKey: videoUpload.key,
        // thumbnailKey: body.movieData.thumbnailUrl, // فقط URL ذخیره می‌شود
        actors,
      });

      return await this.movieRepo.save(movie);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در تکمیل آپلود');
    }
  }

  // ======================
  // توقف آپلود (Abort)
  // ======================
  @Post('upload/abort')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async abortUpload(@Body() body: { uploadId: string; key: string }) {
    if (!body.uploadId || !body.key) {
      throw new BadRequestException('اطلاعات ناقص است');
    }

    try {
      await this.b2Service.abortMultipartUpload(body.key, body.uploadId);
      return { message: 'آپلود متوقف شد و حذف گردید' };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('خطا در توقف آپلود');
    }
  }

  // ======================
  // دانلود فایل با لینک پیش‌امضا
  // ======================
  @Get('download/:key')
  async downloadFile(
    @Param('key') key: string,
    @Query('expires') expires: string,
  ) {
    try {
      const expiresIn = expires ? parseInt(expires) : 3600;
      const url = await this.b2Service.getPresignedUrl(key, expiresIn);
      return { url };
    } catch (err: unknown) {
      console.error(err);
      throw new NotFoundException('فایل یافت نشد');
    }
  }

  // ======================
  // استریم ویدیو آنلاین
  // ======================
  @Get('stream/:key')
  async streamVideo(@Param('key') key: string, @Res() res: Response) {
    try {
      const fileStream = await this.b2Service.streamFile(key);
      res.set({
        'Content-Type': 'video/mp4',
        'Content-Disposition': `inline; filename="${key}"`,
      });
      fileStream.pipe(res);
    } catch (err: unknown) {
      console.error(err);
      throw new NotFoundException('فایل یافت نشد');
    }
  }

  // ======================
  // سایر متدها (لیست فایل‌ها، حذف، نمایش کاور) می‌توانند بدون تغییر بمانند
  // ======================
}

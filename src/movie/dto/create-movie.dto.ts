import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Max,
  IsUrl,
  IsArray,
} from 'class-validator';
import { Actor } from 'src/actor/entity/actor.entity';
import { Genre } from 'src/commons/enums/genre-enum';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Genre, { each: true })
  genres?: Genre[];

  @IsInt()
  @Max(new Date().getFullYear())
  releaseYear: number;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @IsOptional()
  @IsArray()
  actors?: Actor[];

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @IsInt()
  durationMinutes?: number; // مدت زمان فیلم به دقیقه

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  isPremium?: boolean;
}

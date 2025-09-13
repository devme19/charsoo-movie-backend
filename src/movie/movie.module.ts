import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { Actor } from 'src/actor/entity/actor.entity';
import { MovieMediaController } from './movies.media.controller';
import { B2Service } from 'src/commons/b2/b2.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Actor])],
  controllers: [MovieController, MovieMediaController],
  providers: [MovieService, B2Service],
  exports: [MovieService],
})
export class MovieModule {}

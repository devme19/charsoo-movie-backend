import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Movie } from 'src/movie/entity/movie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieModule } from 'src/movie/movie.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), MovieModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

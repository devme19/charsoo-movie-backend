import {
  Controller,
  Get,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { Movie } from './entity/movie.entity';
import { FindMoviesDto } from './dto/find-movie.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guards/role.guards';
import { AuthGuard } from '@nestjs/passport';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}
  @Get('genres')
  getAllGenres() {
    return this.movieService.getAllGenres();
  }
  @Get()
  async findAll(@Query() query: FindMoviesDto) {
    return this.movieService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Movie> {
    return this.movieService.findById(id);
  }
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.movieService.remove(id);
  }
}

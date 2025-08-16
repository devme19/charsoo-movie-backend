import {
  Get,
  Injectable,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CreateMovieDto } from 'src/movie/dto/create-movie.dto';
import { UpdateMovieDto } from 'src/movie/dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from 'src/movie/entity/movie.entity';
import { Repository } from 'typeorm';
import { MovieService } from '../movie/movie.service';
import { FindMoviesDto } from '../movie/dto/find-movie.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly movieService: MovieService,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create(createMovieDto);
    return await this.movieRepository.save(movie);
  }

  async updateMovie(
    id: string,
    updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    const movie = await this.movieRepository.findOneBy({ id });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    Object.assign(movie, updateMovieDto);
    return await this.movieRepository.save(movie);
  }

  async removeMovie(id: string): Promise<void> {
    const result = await this.movieRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Movie not found');
    }
  }
  @Get()
  async findAll(@Query() query: FindMoviesDto) {
    return this.movieService.findAll(query);
  }

  @Get(':id')
  async findMovieById(@Param('id') id: string) {
    return this.movieService.findById(id);
  }
}

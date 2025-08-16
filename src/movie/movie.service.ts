import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entity/movie.entity';
import { FindMoviesDto } from './dto/find-movie.dto';
import { GenreLabels } from 'src/commons/enums/genre-enum';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async findAll(
    options: FindMoviesDto,
  ): Promise<{ data: Movie[]; total: number; page: number; limit: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const skip = (page - 1) * limit;

    const query = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.actors', 'actor'); // join با جدول بازیگران

    if (options.search) {
      query.andWhere('movie.title ILIKE :search', {
        search: `%${options.search}%`,
      });
    }

    if (options.genre) {
      query.andWhere('movie.genres LIKE :genre', {
        genre: `%${options.genre}%`,
      });
    }

    if (options.year) {
      query.andWhere('movie.releaseYear = :year', { year: options.year });
    }

    if (options.director) {
      query.andWhere('movie.director ILIKE :director', {
        director: `%${options.director}%`,
      });
    }

    if (options.actor) {
      query.andWhere('actor.name ILIKE :actor', {
        actor: `%${options.actor}%`,
      });
    }

    query.orderBy('movie.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOneBy({ id });
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.movieRepository.increment({ id }, 'viewsCount', 1);
  }

  async remove(id: string): Promise<void> {
    const result = await this.movieRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Movie not found');
    }
  }
  getAllGenres() {
    const genres = Object.entries(GenreLabels).map(([key, label]) => ({
      key,
      label,
    }));
    return genres;
  }
}

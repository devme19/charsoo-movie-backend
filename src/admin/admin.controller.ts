import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RolesGuard } from '../auth/guards/role.guards';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../commons/enums/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CreateMovieDto } from 'src/movie/dto/create-movie.dto';
import { UpdateMovieDto } from 'src/movie/dto/update-movie.dto';
import { FindMoviesDto } from 'src/movie/dto/find-movie.dto';
import { Movie } from 'src/movie/entity/movie.entity';
import { Query } from '@nestjs/common';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getAdminDashboard() {
    return {
      message: 'Welcome to the admin dashboard',
    };
  }

  // مدیریت فیلم‌ها در زیرمسیر /admin/movies

  @Post('movies')
  createMovie(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
    console.log(createMovieDto);
    return this.adminService.createMovie(createMovieDto);
  }

  @Patch('movies/:id')
  updateMovie(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return this.adminService.updateMovie(id, updateMovieDto);
  }

  @Delete('movies/:id')
  removeMovie(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.adminService.removeMovie(id);
  }

  @Get('movies')
  findAll(
    @Query() query: FindMoviesDto,
  ): Promise<{ data: Movie[]; total: number }> {
    return this.adminService.findAll(query);
  }
  @Get('movies/:id')
  findMovieById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Movie> {
    return this.adminService.findMovieById(id);
  }
}

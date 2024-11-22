import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  Delete,
  Put,
} from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { CreateMovieDto } from './dto/create.dto';
import { FilterMovieDto } from './dto/filter.dto';
import { RateMovieDto } from './dto/rate.dto';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MovieResponseDto } from './dto/movie.response.dto';
import { UpdateMovieDto } from './dto/update.dto';
import { Movie } from './schemas/movie.schema';
import { SyncTmdbService } from './sync.service';
import { UserResponseDto } from '../users/dto/response.dto';

@ApiBearerAuth()
@ApiTags('Tmdb')
@Controller('v1/tmdb')
export class TmdbController {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly syncTmdbService: SyncTmdbService,
  ) {}

  @ApiOperation({
    summary:
      'This endpoint syncs and updates the MongoDB database with movie data from the TMDB API.',
  })
  @ApiOkResponse({
    description: 'Sync Response',
    schema: {
      title: 'SyncMoviesResponse',
      properties: {
        message: { type: 'Movies synced successfully!' },
      },
    },
  })
  @Post('/movies/sync')
  async sync(): Promise<string> {
    await this.syncTmdbService.syncMovies();
    return 'Movies synced successfully!';
  }

  @ApiOperation({
    summary: 'Allows an authenticated user to add a movie to the database.',
  })
  @ApiOkResponse({
    type: MovieResponseDto,
  })
  @ApiBody({ type: CreateMovieDto })
  @UseGuards(AuthGuard)
  @Post('/movies')
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return this.tmdbService.createMovie(createMovieDto);
  }

  @ApiOperation({
    summary: 'Allows user to list all movies from the database.',
  })
  @ApiResponse({ type: [MovieResponseDto] })
  @Get('/movies')
  async findAllMovies(@Query() filterMovieDto: FilterMovieDto) {
    return this.tmdbService.findAllMovies(filterMovieDto);
  }

  @ApiOperation({
    summary: 'Allows user to list all movies from the database.',
  })
  @ApiResponse({ type: MovieResponseDto })
  @Get('/movies/:movieId')
  async findOneMovie(@Param('movieId') id: string) {
    return this.tmdbService.findOneMovie(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Allows an authenticated user to update the movie details.',
  })
  @ApiResponse({ type: MovieResponseDto })
  @UseGuards(AuthGuard)
  @Put('/movies/:movieId')
  async update(
    @Param('movieId') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return await this.tmdbService.updateMovie(String(id), updateMovieDto);
  }

  @ApiOperation({
    summary:
      'Allows an authenticated user to delete a movie from the database.',
  })
  @UseGuards(AuthGuard)
  @Delete('/movies/:movieId')
  async remove(@Param('movieId') id: string): Promise<boolean> {
    return await this.tmdbService.removeMovie(id);
  }

  @ApiOperation({
    summary:
      'Allows an authenticated user to rate a movie (average rating is stored).',
  })
  @ApiResponse({ type: MovieResponseDto })
  @UseGuards(AuthGuard)
  @Put('/movies/:movieId/rate')
  async rateMovie(
    @Param('movieId') id: string,
    @Body() rateMovieDto: RateMovieDto,
    @Request() req,
  ): Promise<Movie> {
    return this.tmdbService.rateMovie(id, rateMovieDto, req.user.userId);
  }

  @ApiOperation({
    summary: 'Allows authenticated users to add a movie to their watchlist.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @UseGuards(AuthGuard)
  @Put('/movies/:movieId/watch-list')
  async addMovieToWatchList(@Param('movieId') id: string, @Request() req) {
    return this.tmdbService.addToWatchList(id, req.user.userId);
  }
}

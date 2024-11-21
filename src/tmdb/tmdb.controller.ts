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

@ApiBearerAuth()
@ApiTags('Tmdb')
@Controller('tmdb')
export class TmdbController {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly syncTmdbService: SyncTmdbService,
  ) {}

  @ApiOperation({ summary: 'Create Movie' })
  @ApiOkResponse({
    type: MovieResponseDto,
  })
  @ApiBody({ type: CreateMovieDto })
  @Post('/movies')
  async createMovie(@Body() createMovieDto: CreateMovieDto) {
    return this.tmdbService.createMovie(createMovieDto);
  }

  @ApiOperation({ summary: 'List all movies' })
  @ApiResponse({ type: [MovieResponseDto] })
  @UseGuards(AuthGuard)
  @Get('/movies')
  async findAllMovies(@Query() filterMovieDto: FilterMovieDto) {
    return this.tmdbService.findAllMovies(filterMovieDto);
  }

  @ApiOperation({ summary: 'Get movie by movieId' })
  @ApiResponse({ type: MovieResponseDto })
  @UseGuards(AuthGuard)
  @Get('/movies/:movieId')
  async findOneMovie(@Param('movieId') id: string) {
    return this.tmdbService.findOneMovie(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update movie' })
  @ApiResponse({ type: MovieResponseDto })
  @UseGuards(AuthGuard)
  @Put('/movies/:movieId')
  async update(
    @Param('movieId') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ): Promise<Movie> {
    return await this.tmdbService.updateMovie(String(id), updateMovieDto);
  }

  @ApiOperation({ summary: 'Delete movie' })
  @UseGuards(AuthGuard)
  @Delete('/movies/:movieId')
  async remove(@Param('movieId') id: string): Promise<boolean> {
    return await this.tmdbService.removeMovie(id);
  }

  @ApiOperation({ summary: 'Rate movie' })
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

  @ApiOperation({ summary: 'Sync movies database with tmdb api' })
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'Sync Response',
    schema: {
      title: 'SyncMoviesResponse',
      properties: {
        message: { type: 'Movies synced successfully!' },
      },
    },
  })
  @Post('/sync')
  async sync(): Promise<string> {
    await this.syncTmdbService.syncMovies();
    return 'Movies synced successfully!';
  }
}

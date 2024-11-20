import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Patch,
  UseGuards,
  Request,
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

@ApiBearerAuth()
@ApiTags('Tmdb')
@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

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

  @ApiOperation({ summary: 'Get movies' })
  @ApiResponse({ type: MovieResponseDto })
  @UseGuards(AuthGuard)
  @Get('/movies/:id')
  async findOneMovie(@Param('id') id: string) {
    return this.tmdbService.findOneMovie(id);
  }

  @ApiOperation({ summary: 'Rate movies' })
  @ApiResponse({ type: MovieResponseDto })
  @UseGuards(AuthGuard)
  @Patch('/movies/:id/rate')
  async rateMovie(
    @Param('id') id: string,
    @Body() rateMovieDto: RateMovieDto,
    @Request() req,
  ) {
    return this.tmdbService.rateMovie(id, rateMovieDto, req.user.userId);
  }
}

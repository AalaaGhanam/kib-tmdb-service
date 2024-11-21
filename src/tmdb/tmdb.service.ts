import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create.dto';
import { FilterMovieDto } from './dto/filter.dto';
import { RateMovieDto } from './dto/rate.dto';
import { RedisService } from '../redis/redis.service';
import { REDIS_EXPIRE_TIME } from '../config/redis.config';
import { UpdateMovieDto } from './dto/update.dto';

@Injectable()
export class TmdbService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    private redisService: RedisService,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    try {
      const movie = new this.movieModel(createMovieDto);
      return movie.save();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllMovies(filterDto: FilterMovieDto): Promise<Movie[]> {
    try {
      const { genre, search, page, limit } = filterDto;
      const cacheKey = `movies_cache-${genre}-${search}-${page}-${limit}`;
      const cachedData = await this.redisService.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const query = genre ? { genres: genre } : {};
      if (search) {
        query['title'] = { $regex: search, $options: 'i' };
      }

      const movies = await this.movieModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      await this.redisService.set(
        cacheKey,
        JSON.stringify(movies),
        Number(REDIS_EXPIRE_TIME),
      );

      return movies;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOneMovie(id: string): Promise<Movie> {
    try {
      const movie = await this.movieModel.findById(id);
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${id} not found.`);
      }
      return movie;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async rateMovie(
    id: string,
    rateDto: RateMovieDto,
    userId: string,
  ): Promise<Movie> {
    try {
      const movie = await this.findOneMovie(id);

      const existingRating = movie.ratings.find(
        (rating) => rating.userId === userId,
      );
      if (existingRating) {
        existingRating.rating = rateDto.rating;
      } else {
        movie.ratings.push({ userId, rating: rateDto.rating });
      }

      const totalRating = movie.ratings.reduce((sum, r) => sum + r.rating, 0);
      movie.averageRating = totalRating / movie.ratings.length;

      return movie.save();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateMovie(id: string, updatedMovie: UpdateMovieDto): Promise<Movie> {
    try {
      const movie = await this.movieModel.findByIdAndUpdate(id, updatedMovie, {
        new: true,
      });
      return await movie.save();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async removeMovie(id: string): Promise<boolean> {
    try {
      await this.movieModel.findByIdAndDelete(id);
      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

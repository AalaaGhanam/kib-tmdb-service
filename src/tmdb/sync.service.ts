import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie } from './schemas/movie.schema';
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config/tmdb.config';

type GENRE = {
  id: string;
  name: string;
};

@Injectable()
export class SyncTmdbService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
  ) {}

  async syncMovies(): Promise<void> {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_API_KEY },
      });

      const movies = response?.data?.results;

      const genres = await this.syncGenres();

      for (const movie of movies) {
        const existingMovie = await this.movieModel.findOne({
          title: movie.title,
        });
        const names = movie.genre_ids?.map(
          (id) => genres.find((el) => el.id == id).name,
        );

        if (!existingMovie) {
          await this.movieModel.create({
            tmdbId: movie.id,
            title: movie.title,
            description: movie.overview,
            genres: names,
            releaseDate: movie.release_date,
            adult: movie.adult,
            poster: movie.poster_path,
          });
        }
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async syncGenres(): Promise<GENRE[]> {
    const response = await axios.get(
      `${TMDB_BASE_URL}/genre/movie/list?language=en?api_key?language=en`,
      {
        params: { api_key: TMDB_API_KEY },
      },
    );

    return response?.data?.genres;
  }
}

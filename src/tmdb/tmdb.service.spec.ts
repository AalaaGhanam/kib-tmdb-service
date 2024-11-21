import { Test, TestingModule } from '@nestjs/testing';
import { TmdbService } from './tmdb.service';
import { Movie } from './schemas/movie.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

const mockMovie = {
  _id: '1',
  title: 'Test Movie',
  genres: ['Action', 'Drama'],
  ratings: [{ userId: '123', rating: 4 }],
  averageRating: 4,
};

const mockMovies = [
  mockMovie,
  {
    _id: '2',
    title: 'Another Movie',
    genres: ['Horror'],
    ratings: [],
    averageRating: 0,
  },
];

describe('TmdbService', () => {
  let service: TmdbService;
  let model: Model<Movie>;

  const mockMovieModel = {
    find: jest.fn().mockResolvedValue(mockMovies),
    findById: jest.fn().mockResolvedValue(mockMovie),
    save: jest.fn().mockResolvedValue(mockMovie),
    create: jest
      .fn()
      .mockImplementation((dto) => Promise.resolve({ _id: '1', ...dto })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
        RedisModule,
        RedisService,
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
    model = module.get<Model<Movie>>(getModelToken(Movie.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all movies', async () => {
    const movies = await service.findAllMovies({});
    expect(movies).toEqual(mockMovies);
    expect(model.find).toHaveBeenCalled();
  });

  it('should fetch a movie by id', async () => {
    const movie = await service.findOneMovie('1');
    expect(movie).toEqual(mockMovie);
    expect(model.findById).toHaveBeenCalledWith('1');
  });

  it('should create a new movie', async () => {
    const newMovie = {
      title: 'New Movie',
      genres: ['Comedy'],
      ratings: [],
      averageRating: 0,
    } as any;
    const result = await service.createMovie(newMovie);
    expect(result).toEqual({ _id: '1', ...newMovie });
    expect(model.create).toHaveBeenCalledWith(newMovie);
  });

  it('should update movie ratings and averageRating', async () => {
    jest.spyOn(mockMovieModel, 'save').mockResolvedValueOnce(true);
    mockMovieModel.findById.mockResolvedValueOnce(mockMovie);

    const updatedMovie = await service.rateMovie('1', { rating: 5 }, '456');
    expect(updatedMovie.averageRating).toBe(4.5);
  });
});

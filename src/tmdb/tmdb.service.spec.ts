import { Test, TestingModule } from '@nestjs/testing';
import { TmdbService } from './tmdb.service';
import { getModelToken } from '@nestjs/mongoose';
import { RedisService } from '../redis/redis.service';
import { Movie } from './schemas/movie.schema';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';

describe('TmdbService', () => {
  let service: TmdbService;
  let usersRepository: Partial<UsersRepository>;

  const mockMovieModel = {
    new: jest.fn().mockResolvedValue({}),
    constructor: jest.fn().mockResolvedValue({}),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    usersRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbService,
        {
          provide: getModelToken(Movie.name),
          useValue: mockMovieModel,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        { provide: UsersRepository, useValue: usersRepository },
      ],
    }).compile();

    service = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMovie', () => {
    it('should throw BadRequestException if saving fails', async () => {
      const createMovieDto = { title: 'Test Movie', genres: ['Action'] };

      mockMovieModel.save.mockReturnValue({
        ...createMovieDto,
        save: jest.fn().mockRejectedValue(new Error('Save error')),
      });

      await expect(service.createMovie(createMovieDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllMovies', () => {
    it('should return movies from cache if available', async () => {
      const movies = [{ title: 'Cached Movie' }];
      mockRedisService.get.mockResolvedValue(JSON.stringify(movies));

      const result = await service.findAllMovies({
        genre: 'Action',
        page: 1,
        limit: 10,
      } as any);

      expect(result).toEqual(movies);
      expect(mockRedisService.get).toHaveBeenCalled();
    });

    it('should query database if no cache available', async () => {
      const movies = [{ title: 'Queried Movie' }];
      mockRedisService.get.mockResolvedValue(null);
      mockMovieModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(movies),
      });

      const result = await service.findAllMovies({
        genre: 'Action',
        page: 1,
        limit: 10,
      } as any);

      expect(result).toEqual(movies);
      expect(mockRedisService.set).toHaveBeenCalled();
    });
  });

  describe('findOneMovie', () => {
    it('should return a movie by ID', async () => {
      const movie = { title: 'Found Movie' };
      mockMovieModel.findById.mockResolvedValue(movie);

      const result = await service.findOneMovie('673dd40263994c22ac219b94');
      expect(result).toEqual(movie);
    });

    it('should throw BadRequestException if movie not found', async () => {
      mockMovieModel.findById.mockResolvedValue(null);

      await expect(
        service.findOneMovie('673dd40263994c22ac219b94'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rateMovie', () => {
    it('should rate a movie and update average rating', async () => {
      const movie = {
        ratings: [{ userId: '1', rating: 4 }],
        save: jest.fn(),
      };
      mockMovieModel.findById.mockResolvedValue(movie);

      const rateDto = { rating: 5 };
      await service.rateMovie('673dd40263994c22ac219b94', rateDto as any, '2');

      expect(movie.ratings).toContainEqual({ userId: '2', rating: 5 });
    });
  });

  describe('addToWatchList', () => {
    it('should add a movie to the watchlist', async () => {
      const movie = { _id: '1', title: 'Movie' };
      const user = {
        _id: '2',
        watchList: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(service, 'findOneMovie').mockResolvedValue(movie as Movie);
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(user as any);

      await service.addToWatchList('1', '2');

      expect(service.findOneMovie).toHaveBeenCalledWith('1');
      expect(usersRepository.findById).toHaveBeenCalledWith('2');
      expect(user.watchList).toContain('1');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw an error if movie already in watchlist', async () => {
      const movie = { _id: '1', title: 'Movie' };
      const user = { _id: '2', watchList: ['1'], save: jest.fn() };
      jest.spyOn(service, 'findOneMovie').mockResolvedValue(movie as Movie);
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(user as any);

      await expect(service.addToWatchList('1', '2')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateMovie', () => {
    it('should update a movie', async () => {
      const movie = { title: 'Updated Movie', save: jest.fn() };
      mockMovieModel.findByIdAndUpdate.mockResolvedValue(movie);

      const updateMovieDto = { title: 'Updated Title' };
      const result = await service.updateMovie(
        '673dd40263994c22ac219b94',
        updateMovieDto as any,
      );

      expect(result).not.toBeNull();
    });
  });

  describe('removeMovie', () => {
    it('should delete a movie', async () => {
      mockMovieModel.findByIdAndDelete.mockResolvedValue(true);

      const result = await service.removeMovie('673dd40263994c22ac219b94');
      expect(result).toBe(true);
    });
  });
});

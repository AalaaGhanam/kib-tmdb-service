import { Test, TestingModule } from '@nestjs/testing';
import { SyncTmdbService } from './sync.service';
import { getModelToken } from '@nestjs/mongoose';
import { Movie } from './schemas/movie.schema';
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');

describe('SyncTmdbService', () => {
  let syncTmdbService: SyncTmdbService;
  let movieModelMock: any;
  let axiosMock: jest.Mocked<typeof axios>;

  beforeEach(async () => {
    movieModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    axiosMock = axios as jest.Mocked<typeof axios>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncTmdbService,
        {
          provide: getModelToken(Movie.name),
          useValue: movieModelMock,
        },
      ],
    }).compile();

    syncTmdbService = module.get<SyncTmdbService>(SyncTmdbService);
  });

  describe('syncMovies', () => {
    it('should sync movies successfully', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Movie 1',
          overview: 'Description 1',
          release_date: '2021-01-01',
          adult: false,
          poster_path: '/path/to/poster1.jpg',
          genre_ids: [1, 2],
        },
        {
          id: 2,
          title: 'Movie 2',
          overview: 'Description 2',
          release_date: '2022-02-02',
          adult: false,
          poster_path: '/path/to/poster2.jpg',
          genre_ids: [2, 3],
        },
      ];

      const mockGenres = [
        { id: '1', name: 'Action' },
        { id: '2', name: 'Comedy' },
        { id: '3', name: 'Drama' },
      ];

      axiosMock.get.mockResolvedValueOnce({ data: { results: mockMovies } }); // Mock popular movies response
      axiosMock.get.mockResolvedValueOnce({ data: { genres: mockGenres } }); // Mock genres response
      movieModelMock.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      await syncTmdbService.syncMovies();
      expect(movieModelMock.create).toHaveBeenCalledTimes(mockMovies.length);
      expect(movieModelMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tmdbId: mockMovies[0].id,
          title: mockMovies[0].title,
          description: mockMovies[0].overview,
          genres: ['Action', 'Comedy'],
          releaseDate: mockMovies[0].release_date,
          adult: mockMovies[0].adult,
          poster: mockMovies[0].poster_path,
        }),
      );
    });

    it('should throw BadRequestException if sync fails', async () => {
      axiosMock.get.mockRejectedValue(new Error('Sync failed'));
      await expect(syncTmdbService.syncMovies()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('syncGenres', () => {
    it('should return genres successfully', async () => {
      const mockGenres = [
        { id: '1', name: 'Action' },
        { id: '2', name: 'Comedy' },
        { id: '3', name: 'Drama' },
      ];

      axiosMock.get.mockResolvedValueOnce({ data: { genres: mockGenres } });

      const genres = await syncTmdbService.syncGenres();

      expect(genres).toEqual(mockGenres);
    });

    it('should throw Error if sync genres fails', async () => {
      axiosMock.get.mockRejectedValue(new Error('Failed to fetch genres'));

      await expect(syncTmdbService.syncGenres()).rejects.toThrow(
        Error('Failed to fetch genres'),
      );
    });
  });
});

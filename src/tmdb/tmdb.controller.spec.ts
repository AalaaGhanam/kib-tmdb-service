import { Test, TestingModule } from '@nestjs/testing';
import { TmdbController } from './tmdb.controller';
import { TmdbService } from './tmdb.service';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CreateMovieDto } from './dto/create.dto';
import { FilterMovieDto } from './dto/filter.dto';
import { UpdateMovieDto } from './dto/update.dto';
import { RateMovieDto } from './dto/rate.dto';
import { SyncTmdbService } from './sync.service';

describe('TmdbController', () => {
  let controller: TmdbController;
  let service: TmdbService;

  const mockTmdbService = {
    createMovie: jest.fn(),
    findAllMovies: jest.fn(),
    findOneMovie: jest.fn(),
    updateMovie: jest.fn(),
    removeMovie: jest.fn(),
    rateMovie: jest.fn(),
  };

  const mockSyncTmdbService = {
    syncMovies: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(() => true),
    sign: jest.fn(() => 'mockToken'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TmdbController],
      providers: [
        {
          provide: TmdbService,
          useValue: mockTmdbService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SyncTmdbService,
          useValue: mockSyncTmdbService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<TmdbController>(TmdbController);
    service = module.get<TmdbService>(TmdbService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createMovie', () => {
    it('should call createMovie with the correct parameters', async () => {
      const dto: CreateMovieDto = { title: 'Test Movie', genres: ['Action'] };
      await controller.createMovie(dto);
      expect(service.createMovie).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllMovies', () => {
    it('should call findAllMovies with the correct parameters', async () => {
      const filterDto: FilterMovieDto = { genre: 'Action', limit: 10 };
      await controller.findAllMovies(filterDto);
      expect(service.findAllMovies).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('findOneMovie', () => {
    it('should call findOneMovie with the correct id', async () => {
      const movieId = '123';
      await controller.findOneMovie(movieId);
      expect(service.findOneMovie).toHaveBeenCalledWith(movieId);
    });
  });

  describe('update', () => {
    it('should call updateMovie with the correct parameters', async () => {
      const movieId = '123';
      const dto: UpdateMovieDto = { title: 'Updated Movie' };
      await controller.update(movieId, dto);
      expect(service.updateMovie).toHaveBeenCalledWith(movieId, dto);
    });
  });

  describe('remove', () => {
    it('should call removeMovie with the correct id', async () => {
      const movieId = '123';
      await controller.remove(movieId);
      expect(service.removeMovie).toHaveBeenCalledWith(movieId);
    });
  });

  describe('rateMovie', () => {
    it('should call rateMovie with the correct parameters', async () => {
      const movieId = '123';
      const dto: RateMovieDto = { rating: 4 };
      const req = { user: { userId: '456' } };
      await controller.rateMovie(movieId, dto, req);
      expect(service.rateMovie).toHaveBeenCalledWith(
        movieId,
        dto,
        req.user.userId,
      );
    });
  });
});

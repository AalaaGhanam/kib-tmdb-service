import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { TmdbService } from '../tmdb/tmdb.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { Movie } from 'src/tmdb/schemas/movie.schema';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Partial<UsersRepository>;
  let jwtService: Partial<JwtService>;
  let tmdbService: Partial<TmdbService>;

  beforeEach(async () => {
    usersRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };

    tmdbService = {
      findOneMovie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: JwtService, useValue: jwtService },
        { provide: TmdbService, useValue: tmdbService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash the password and create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        password: 'password123',
        email: 'test@test.com',
      };
      const createSpy = jest.spyOn(usersRepository, 'create');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await service.register(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(createSpy).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
      });
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw an error if registration fails', async () => {
      jest
        .spyOn(usersRepository, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.register({
          username: 'test',
          password: '123',
          email: 'test@test.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should validate the user and return a token', async () => {
      const loginUserDto = { email: 'test@test.com', password: 'password123' };
      const user = {
        _id: '1',
        username: 'testuser',
        password: 'hashedPassword',
      };
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockResolvedValue(user as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.login(loginUserDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        userId: '1',
      });
      expect(result).toEqual({ access_token: 'mockToken' });
    });

    it('should throw an error if email or password is invalid', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = { _id: '1', username: 'testuser' };
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(user as User);

      const result = await service.getProfile('1');

      expect(usersRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(usersRepository, 'findById')
        .mockRejectedValue(new BadRequestException());

      await expect(service.getProfile('1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      const user = { _id: '1', username: 'testuser' };
      jest
        .spyOn(usersRepository, 'findByUsername')
        .mockResolvedValue(user as User);

      const result = await service.findByUsername('testuser');

      expect(usersRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(user);
    });

    it('should throw an error if user not found', async () => {
      jest
        .spyOn(usersRepository, 'findByUsername')
        .mockRejectedValue(new BadRequestException());

      await expect(service.findByUsername('testuser')).rejects.toThrow(
        BadRequestException,
      );
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
      jest.spyOn(tmdbService, 'findOneMovie').mockResolvedValue(movie as Movie);
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(user as any);

      await service.addToWatchList('1', '2');

      expect(tmdbService.findOneMovie).toHaveBeenCalledWith('1');
      expect(usersRepository.findById).toHaveBeenCalledWith('2');
      expect(user.watchList).toContain('1');
      expect(user.save).toHaveBeenCalled();
    });

    it('should throw an error if movie already in watchlist', async () => {
      const movie = { _id: '1', title: 'Movie' };
      const user = { _id: '2', watchList: ['1'], save: jest.fn() };
      jest.spyOn(tmdbService, 'findOneMovie').mockResolvedValue(movie as Movie);
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(user as any);

      await expect(service.addToWatchList('1', '2')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

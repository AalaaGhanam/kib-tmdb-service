import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import * as dotenv from 'dotenv';
import { User } from './schemas/user.schema';
import { TmdbService } from '../tmdb/tmdb.service';
import { Movie } from '../tmdb/schemas/movie.schema';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private tmdbService: TmdbService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      await this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });
      return { message: 'User registered successfully' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      const user = await this.usersRepository.findByEmail(email);

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!user || !isPasswordMatched) {
        throw new BadRequestException('Invalid email or password');
      }
      const payload = { username: user.username, userId: user._id };
      const token = await this.jwtService.sign(payload);
      return {
        access_token: token,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getProfile(userId: string) {
    try {
      return this.usersRepository.findById(userId);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findByUsername(username: string) {
    try {
      return this.usersRepository.findByUsername(username);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async addToWatchList(id: string, userId: string): Promise<User> {
    try {
      const movie: Movie = await this.tmdbService.findOneMovie(id);
      const user = await this.usersRepository.findById(userId);

      const existingList = user.watchList.find((movie) => movie === movie);
      if (!existingList) {
        user.watchList.push(movie._id as any);
      } else {
        throw new BadRequestException('Movie already in your watch list');
      }
      return await user.save();
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

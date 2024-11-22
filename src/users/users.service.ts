import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
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

      if (!user || !(await bcrypt.compare(password, user?.password))) {
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
}

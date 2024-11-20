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
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return { message: 'User registered successfully' };

  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.usersRepository.findByEmail(email);

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordMatched) {
      throw new BadRequestException('Invalid email or password');
    }
    const payload = { username: user.username, userId: user._id };
    const token= await this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }

  async getProfile(userId: string) {
    return this.usersRepository.findById(userId);
  }

  async findByUsername(username: string) {
    return this.usersRepository.findByUsername(username);
  }
}
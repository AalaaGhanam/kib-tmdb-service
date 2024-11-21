import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.dto';
import { LoginUserDto } from './dto/login.dto';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/response.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Register user' })
  @ApiOkResponse({
    description: 'User registered Response.',
    schema: {
      title: 'RegisterResponse',
      properties: {
        message: { type: 'User registered successfully.' },
      },
    },
  })
  @ApiBody({ type: CreateUserDto })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({
    description: 'Login Response',
    schema: {
      title: 'LoginResponse',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @ApiOperation({ summary: 'Add movie to your watch list' })
  @ApiOkResponse({ type: UserResponseDto })
  @UseGuards(AuthGuard)
  @Put('/:movieId/watch-list')
  async rateMovie(@Param('movieId') id: string, @Request() req) {
    return this.usersService.addToWatchList(id, req.user.userId);
  }
}

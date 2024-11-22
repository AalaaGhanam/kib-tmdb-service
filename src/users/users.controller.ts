import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
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
@Controller('users/v1')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary:
      'User registration with credentials and storing user data in MongoDB.',
  })
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

  @ApiOperation({
    summary: 'Allows the user to login and obtain an access token using JWT.',
  })
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

  @ApiOperation({
    summary: "Authenticated request to retrieve the user's profile.",
  })
  @ApiOkResponse({
    type: UserResponseDto,
  })
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId);
  }
}

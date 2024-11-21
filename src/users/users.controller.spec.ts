import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create.dto';
import { LoginUserDto } from './dto/login.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser = {
    userId: '123',
    email: 'test@example.com',
    username: 'Test User',
  };
  const mockRegisterDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'test123',
    username: 'Test User',
  };
  const mockLoginDto: LoginUserDto = {
    email: 'test@example.com',
    password: 'test123',
  };

  const mockUsersService = {
    register: jest.fn().mockResolvedValue(mockUser),
    login: jest.fn().mockResolvedValue({ token: 'test-token' }),
    getProfile: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const result = await usersController.register(mockRegisterDto);
      expect(usersService.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should log in a user and return a token', async () => {
      const result = await usersController.login(mockLoginDto);
      expect(usersService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual({ token: 'test-token' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      const req = { user: { userId: '123' } };
      const result = await usersController.getProfile(req);
      expect(usersService.getProfile).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });
  });
});

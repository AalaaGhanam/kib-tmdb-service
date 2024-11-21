import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
import { UsersRepository } from './users.repository';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUser = {
  _id: '673e12a6c4eceed5d35c8824',
  username: 'testUser',
  password: 'test@password',
  email: 'user@test.com',
};

describe('UsersService', () => {
  let service: UsersService;
  // let model: Model<User>;
  let usersRepository: UsersRepository;
  let jwtService: JwtService;

  const mockUserModel = {
    findOne: jest.fn().mockResolvedValue(mockUser),
    exec: jest.fn().mockResolvedValue(mockUser),
    create: jest
      .fn()
      .mockImplementation((dto) =>
        Promise.resolve({ _id: '673e12a6c4eceed5d35c8824', ...dto }),
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        JwtStrategy,
        UsersRepository,
        JwtService,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // model = module.get<Model<User>>(getModelToken(User.name));
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login', async () => {
    const hashedPassword = await bcrypt.hash(mockUser.password, 10);
    const loginRequest = {
      email: mockUser.email,
      password: mockUser.password,
    };
    const userResponse = {
      ...mockUser,
      password: hashedPassword,
    } as User;
    jest
      .spyOn(usersRepository, 'findByEmail')
      .mockResolvedValueOnce(userResponse);
    jest.spyOn(jwtService, 'sign').mockReturnValueOnce('token');

    const loginResponse = await service.login(loginRequest);
    expect(loginResponse).toEqual({
      access_token: 'token',
    });
  });

  it('should get user profile', async () => {
    const userResponse = mockUser as User;
    jest.spyOn(usersRepository, 'findById').mockResolvedValueOnce(userResponse);

    const user = await service.getProfile(mockUser._id);
    expect(user).toEqual(mockUser);
  });

  it('should find a user by username', async () => {
    const userResponse = mockUser as User;
    jest
      .spyOn(usersRepository, 'findByUsername')
      .mockResolvedValueOnce(userResponse);

    const user = await service.findByUsername(mockUser.username);
    expect(user).toEqual(mockUser);
  });
});

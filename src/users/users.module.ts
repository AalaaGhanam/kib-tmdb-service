import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from './users.repository';
import { TmdbService } from '../tmdb/tmdb.service';
import { Movie, MovieSchema } from 'src/tmdb/schemas/movie.schema';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    }),
    ConfigModule.forRoot(),
    RedisModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, UsersRepository, TmdbService],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}

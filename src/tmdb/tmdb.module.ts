import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TmdbController } from './tmdb.controller';
import { TmdbService } from './tmdb.service';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { JwtStrategy } from 'src/users/jwt.strategy';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    }),
    RedisModule,
    AuthGuard,
    JwtService,
  ],
  controllers: [TmdbController],
  providers: [TmdbService, JwtStrategy, JwtService],
})
export class TmdbModule {}

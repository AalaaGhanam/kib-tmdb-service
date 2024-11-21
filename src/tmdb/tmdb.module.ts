import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TmdbController } from './tmdb.controller';
import { TmdbService } from './tmdb.service';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { JwtStrategy } from 'src/users/jwt.strategy';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { SyncTmdbService } from './sync.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RedisModule,
  ],
  controllers: [TmdbController],
  providers: [TmdbService, JwtStrategy, JwtService, SyncTmdbService],
})
export class TmdbModule {}

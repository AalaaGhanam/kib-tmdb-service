import { ApiProperty } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  genres: string[];

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  ratings: { userId: string; rating: number }[];

  @ApiProperty()
  overview: string;

  @ApiProperty()
  releaseDate: string;

  @ApiProperty()
  isFavorite: boolean;

  @ApiProperty()
  inWatchlist: boolean;

  @ApiProperty()
  adult: boolean;

  @ApiProperty()
  poster: string;
}

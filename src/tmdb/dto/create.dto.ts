import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  tmdbId?: string;
  @ApiProperty()
  description?: string;
  @ApiProperty()
  genres?: string[];
  @ApiProperty()
  poster?: string;
  @ApiProperty()
  releaseDate?: string;
  @ApiProperty()
  adult?: boolean;
}

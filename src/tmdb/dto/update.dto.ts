import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiProperty()
  title?: string;
  @ApiProperty()
  tmdbId?: any;
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

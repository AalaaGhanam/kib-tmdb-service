import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  genres: string[];
  @ApiProperty()
  poster?: string;
  @ApiProperty()
  overview?: string;
  @ApiProperty()
  releaseDate?: string;
  @ApiProperty()
  rating?: any;
}

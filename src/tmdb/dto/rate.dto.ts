import { ApiProperty } from "@nestjs/swagger";

export class RateMovieDto {
  @ApiProperty()
    rating: number;
  }
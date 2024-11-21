import { ApiProperty } from '@nestjs/swagger';

export class FilterMovieDto {
  @ApiProperty({
    required: false,
  })
  genre?: string;
  @ApiProperty({
    required: false,
  })
  search?: string;
  @ApiProperty({
    required: false,
  })
  page?: number = 1;
  @ApiProperty({
    required: false,
  })
  limit?: number = 10;
}

import { ApiProperty } from '@nestjs/swagger';

export class AddToWatchListDto {
  @ApiProperty()
  movieId: number;
}

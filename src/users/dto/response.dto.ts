import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty()
    username: string;
    @ApiProperty()
    email: string;
  }
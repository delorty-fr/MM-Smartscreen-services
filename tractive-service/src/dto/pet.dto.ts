import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPetDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  petID: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TrackerCommandDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(8)
  @IsString()
  trackerID: string;
}

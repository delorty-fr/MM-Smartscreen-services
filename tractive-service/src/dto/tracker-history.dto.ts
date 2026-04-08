import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Length } from 'class-validator';

export class TrackerHistoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(8)
  @IsString()
  trackerID: string;

  @ApiProperty({ description: 'Unix timestamp or ISO date string for start time' })
  @IsNotEmpty()
  from: number | string;

  @ApiProperty({ description: 'Unix timestamp or ISO date string for end time' })
  @IsNotEmpty()
  to: number | string;
}
